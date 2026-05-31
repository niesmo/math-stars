import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { leaderboardEntries, students } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'

export const revalidate = 60

export default async function LeaderboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) redirect('/auth/login/student')

  const session = await verifyStudentSession(token)
  if (!session) redirect('/auth/login/student')

  const baseQuery = db
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

  const entries = session.classId
    ? await baseQuery.where(and(eq(leaderboardEntries.classId, session.classId), eq(leaderboardEntries.period, 'alltime')))
    : await baseQuery.where(and(isNull(leaderboardEntries.classId), eq(leaderboardEntries.period, 'alltime')))

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-black text-[#1e3a5f]">🏆 Leaderboard</h1>
        <p className="text-gray-500 mt-1">
          {session.classId ? 'Class rankings — All Time' : 'Guest rankings — All Time'}
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-4">
        <LeaderboardTable
          initialEntries={entries}
          currentStudentId={session.studentId}
          classId={session.classId ?? 'guest-global'}
          period="alltime"
        />
      </div>
    </div>
  )
}
