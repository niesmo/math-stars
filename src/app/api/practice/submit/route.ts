import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { practiceAttempts, practiceSessions, studentProgress, leaderboardEntries, students } from '@/lib/db/schema'
import { validateAnswer } from '@/lib/math/validator'
import { calculatePoints } from '@/lib/gamification/points'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { cookies } from 'next/headers'
import { eq, and, sql } from 'drizzle-orm'
import type { Skill, Difficulty } from '@/types'
import { generateQuestion } from '@/lib/math/generator'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const session = await verifyStudentSession(token)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    sessionId?: unknown
    skill?: unknown
    difficulty?: unknown
    seed?: unknown
    questionIndex?: unknown
    studentAnswer?: unknown
    timeMs?: unknown
    currentStreak?: unknown
    isLastQuestion?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  const {
    sessionId,
    skill,
    difficulty,
    seed,
    questionIndex,
    studentAnswer,
    timeMs,
    currentStreak,
    isLastQuestion,
  } = body

  if (
    typeof sessionId !== 'string' ||
    typeof skill !== 'string' ||
    typeof difficulty !== 'string' ||
    typeof seed !== 'number' ||
    typeof questionIndex !== 'number' ||
    typeof studentAnswer !== 'number' ||
    typeof timeMs !== 'number'
  ) {
    return NextResponse.json({ success: false, error: 'Invalid parameters' }, { status: 400 })
  }

  const { isCorrect, correctAnswer, isSuspicious } = validateAnswer(
    skill as Skill,
    difficulty as Difficulty,
    seed,
    questionIndex,
    studentAnswer,
    timeMs
  )

  await db.insert(practiceAttempts).values({
    sessionId,
    operandA: 0,
    operandB: 0,
    operator: '',
    correctAnswer,
    studentAnswer,
    isCorrect,
    timeMs: isSuspicious ? 999999 : timeMs,
  })

  const streak = isCorrect ? ((typeof currentStreak === 'number' ? currentStreak : 0) + 1) : 0
  const points = isCorrect ? calculatePoints(streak, timeMs) : 0

  if (isLastQuestion) {
    const sessionRow = await db
      .select({ skillLevelId: practiceSessions.skillLevelId })
      .from(practiceSessions)
      .where(eq(practiceSessions.id, sessionId))
      .limit(1)
      .then((r) => r[0])

    const attemptsForSession = await db
      .select()
      .from(practiceAttempts)
      .where(eq(practiceAttempts.sessionId, sessionId))

    const totalQuestions = attemptsForSession.length
    const correctAnswers = attemptsForSession.filter((a) => a.isCorrect).length
    const avgTimeMs =
      totalQuestions > 0
        ? Math.round(attemptsForSession.reduce((sum, a) => sum + (a.timeMs ?? 0), 0) / totalQuestions)
        : 0
    let runStreak = 0
    let streakMax = 0
    let sessionPoints = 0
    for (const attempt of attemptsForSession) {
      runStreak = attempt.isCorrect ? runStreak + 1 : 0
      streakMax = Math.max(streakMax, runStreak)
      if (attempt.isCorrect) sessionPoints += calculatePoints(runStreak, attempt.timeMs ?? 0)
    }

    await db
      .update(practiceSessions)
      .set({
        endedAt: new Date(),
        pointsEarned: sessionPoints,
        totalQuestions,
        correctAnswers,
        avgTimeMs,
        streakMax,
      })
      .where(eq(practiceSessions.id, sessionId))

    await db
      .update(students)
      .set({ totalStars: sql`coalesce(${students.totalStars}, 0) + ${sessionPoints}` })
      .where(eq(students.id, session.studentId))

    if (sessionRow) {
      const existingProgress = await db
        .select()
        .from(studentProgress)
        .where(
          and(
            eq(studentProgress.studentId, session.studentId),
            eq(studentProgress.skillLevelId, sessionRow.skillLevelId)
          )
        )
        .limit(1)
        .then((r) => r[0])

      const addAttempts = totalQuestions
      const addCorrect = correctAnswers
      if (existingProgress) {
        const attemptsCount = (existingProgress.attemptsCount ?? 0) + addAttempts
        const correctCount = (existingProgress.correctCount ?? 0) + addCorrect
        const masteryPct = attemptsCount > 0 ? (correctCount / attemptsCount) * 100 : 0
        await db
          .update(studentProgress)
          .set({ attemptsCount, correctCount, masteryPct, updatedAt: new Date(), isUnlocked: true })
          .where(eq(studentProgress.id, existingProgress.id))
      } else {
        await db.insert(studentProgress).values({
          studentId: session.studentId,
          skillLevelId: sessionRow.skillLevelId,
          attemptsCount: addAttempts,
          correctCount: addCorrect,
          masteryPct: addAttempts > 0 ? (addCorrect / addAttempts) * 100 : 0,
          isUnlocked: true,
        })
      }
    }

    // Upsert leaderboard entry
    const existing = await db
      .select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.studentId, session.studentId),
          eq(leaderboardEntries.classId, session.classId),
          eq(leaderboardEntries.period, 'alltime')
        )
      )
      .limit(1)
      .then((r) => r[0])

    if (existing) {
      await db
        .update(leaderboardEntries)
        .set({ score: existing.score + sessionPoints, updatedAt: new Date() })
        .where(eq(leaderboardEntries.id, existing.id))
    } else {
      await db.insert(leaderboardEntries).values({
        studentId: session.studentId,
        classId: session.classId,
        period: 'alltime',
        score: sessionPoints,
      })
    }
  }

  const nextQuestion = isLastQuestion
    ? null
    : generateQuestion(skill as Skill, difficulty as Difficulty, seed, questionIndex + 1)

  return NextResponse.json({
    success: true,
    data: {
      isCorrect,
      correctAnswer,
      points,
      nextQuestion,
    },
  })
}
