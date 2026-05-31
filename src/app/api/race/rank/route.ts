import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { db } from '@/lib/db'
import { practiceSessions, students } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const session = await verifyStudentSession(token)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const skillLevelId = request.nextUrl.searchParams.get('skillLevelId')
  if (!skillLevelId) return NextResponse.json({ success: false, error: 'skillLevelId required' }, { status: 400 })

  const rows = await db
    .select({
      studentId: practiceSessions.studentId,
      pointsEarned: practiceSessions.pointsEarned,
      displayName: students.displayName,
      startedAt: practiceSessions.startedAt,
    })
    .from(practiceSessions)
    .innerJoin(students, eq(students.id, practiceSessions.studentId))
    .where(
      and(
        eq(practiceSessions.mode, 'race'),
        eq(practiceSessions.skillLevelId, skillLevelId)
      )
    )
    .orderBy(desc(practiceSessions.pointsEarned))

  const byBest = new Map<string, { studentId: string; displayName: string; score: number }>()
  for (const row of rows) {
    const score = row.pointsEarned ?? 0
    if (score <= 0) continue
    const prev = byBest.get(row.studentId)
    if (!prev || score > prev.score) {
      byBest.set(row.studentId, {
        studentId: row.studentId,
        displayName: row.displayName,
        score,
      })
    }
  }

  const sorted = Array.from(byBest.values()).sort((a, b) => b.score - a.score).slice(0, 20)
  const rank = sorted.findIndex((r) => r.studentId === session.studentId) + 1

  const myRuns = rows
    .filter((r) => r.studentId === session.studentId)
    .sort((a, b) => (b.startedAt?.getTime?.() ?? 0) - (a.startedAt?.getTime?.() ?? 0))
  const lastRunScore = myRuns[0]?.pointsEarned ?? 0
  const bestRunScore = myRuns.reduce((m, r) => Math.max(m, r.pointsEarned ?? 0), 0)
  const previousBestScore = myRuns.slice(1).reduce((m, r) => Math.max(m, r.pointsEarned ?? 0), 0)
  const isNewBest = lastRunScore > previousBestScore && lastRunScore > 0

  return NextResponse.json({
    success: true,
    data: {
      rank: rank || sorted.length + 1,
      total: Math.max(sorted.length, 1),
      lastRunScore,
      bestRunScore,
      previousBestScore,
      isNewBest,
      entries: sorted.map((r, i) => ({
        rank: i + 1,
        studentId: r.studentId,
        displayName: r.displayName,
        score: r.score,
      })),
    },
  })
}
