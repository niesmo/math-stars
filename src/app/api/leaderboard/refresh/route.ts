import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leaderboardEntries, practiceSessions, students } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())

  // Aggregate daily scores from sessions
  const dailySessions = await db
    .select({
      studentId: practiceSessions.studentId,
      totalPoints: sql<number>`sum(${practiceSessions.pointsEarned})`,
    })
    .from(practiceSessions)
    .innerJoin(students, eq(students.id, practiceSessions.studentId))
    .where(
      and(
        gte(practiceSessions.startedAt, startOfDay),
        eq(practiceSessions.mode, 'practice')
      )
    )
    .groupBy(practiceSessions.studentId)

  // Update daily leaderboard entries
  for (const row of dailySessions) {
    const studentRow = await db
      .select({ classId: students.classId })
      .from(students)
      .where(eq(students.id, row.studentId))
      .limit(1)
      .then((r) => r[0])

    if (!studentRow) continue

    await db
      .insert(leaderboardEntries)
      .values({
        studentId: row.studentId,
        classId: studentRow.classId,
        period: 'daily',
        score: row.totalPoints ?? 0,
      })
      .onConflictDoUpdate({
        target: [
          leaderboardEntries.studentId,
          leaderboardEntries.classId,
          leaderboardEntries.skill,
          leaderboardEntries.period,
        ],
        set: { score: row.totalPoints ?? 0, updatedAt: new Date() },
      })
  }

  return NextResponse.json({ success: true, processed: dailySessions.length })
}
