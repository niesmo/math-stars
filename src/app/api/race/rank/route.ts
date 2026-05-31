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

  const sorted = rows.filter((r) => (r.pointsEarned ?? 0) > 0).slice(0, 20)
  const rank = sorted.findIndex((r) => r.studentId === session.studentId) + 1
  return NextResponse.json({
    success: true,
    data: {
      rank: rank || sorted.length + 1,
      total: Math.max(sorted.length, 1),
      entries: sorted.map((r, i) => ({
        rank: i + 1,
        studentId: r.studentId,
        displayName: r.displayName,
        score: r.pointsEarned ?? 0,
      })),
    },
  })
}
