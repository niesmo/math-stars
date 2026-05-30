import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { leaderboardEntries, students } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')
  const period = searchParams.get('period') as 'daily' | 'weekly' | 'alltime' | null

  if (!classId || !period) {
    return NextResponse.json({ success: false, error: 'classId and period required' }, { status: 400 })
  }

  const entries = await db
    .select({
      id: leaderboardEntries.id,
      studentId: leaderboardEntries.studentId,
      classId: leaderboardEntries.classId,
      skill: leaderboardEntries.skill,
      period: leaderboardEntries.period,
      score: leaderboardEntries.score,
      updatedAt: leaderboardEntries.updatedAt,
      student: {
        id: students.id,
        displayName: students.displayName,
        avatarSeed: students.avatarSeed,
        totalStars: students.totalStars,
        classId: students.classId,
        username: students.username,
        pinHash: students.pinHash,
        createdAt: students.createdAt,
      },
    })
    .from(leaderboardEntries)
    .innerJoin(students, eq(students.id, leaderboardEntries.studentId))
    .where(
      and(
        eq(leaderboardEntries.classId, classId),
        eq(leaderboardEntries.period, period)
      )
    )

  return NextResponse.json({ success: true, data: entries })
}
