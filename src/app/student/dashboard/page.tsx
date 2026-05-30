import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { db } from '@/lib/db'
import { classes, competitions, leaderboardEntries, skillLevels, studentProgress, teachers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { SkillCard } from '@/components/dashboard/SkillCard'
import Link from 'next/link'

export default async function StudentDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) redirect('/auth/login/student')

  const session = await verifyStudentSession(token)
  if (!session) redirect('/auth/login/student')

  const [allSkillLevels, progressRows] = await Promise.all([
    db.select().from(skillLevels).orderBy(skillLevels.skill, skillLevels.difficulty),
    db.select().from(studentProgress).where(eq(studentProgress.studentId, session.studentId)),
  ])

  const progressMap = new Map(progressRows.map((p) => [p.skillLevelId, p]))
  const classRow = await db.select().from(classes).where(eq(classes.id, session.classId)).limit(1).then((r) => r[0])
  const teacherRow = classRow
    ? await db.select().from(teachers).where(eq(teachers.id, classRow.teacherId)).limit(1).then((r) => r[0])
    : null
  const classLeaders = await db
    .select()
    .from(leaderboardEntries)
    .where(eq(leaderboardEntries.classId, session.classId))
    .limit(5)
  let activeCompetitions: Array<typeof competitions.$inferSelect> = []
  try {
    activeCompetitions = await db
      .select()
      .from(competitions)
      .where(eq(competitions.classId, session.classId))
      .limit(5)
  } catch {
    activeCompetitions = []
  }

  const skills = ['addition', 'subtraction', 'multiplication', 'division'] as const

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner
        displayName={session.displayName}
        totalStars={0}
        todayStars={0}
        className={classRow?.name}
        teacherName={teacherRow?.displayName}
      />
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-black text-[#1e3a5f]">Race Mode</h2>
          <p className="text-sm text-gray-600 mt-1">Timed rounds with streak multipliers.</p>
          <Link href={`/student/practice/${allSkillLevels[0]?.id}?mode=race`} className="inline-block mt-3 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl font-bold text-sm">Start Race</Link>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-black text-[#1e3a5f]">Class Leaderboard</h2>
          <p className="text-sm text-gray-600 mt-1">{classLeaders.length} top entries tracked.</p>
          <Link href="/student/leaderboard" className="inline-block mt-3 px-4 py-2 bg-blue-50 text-[#1e3a5f] rounded-xl font-bold text-sm">View Rankings</Link>
        </div>
      </div>
      {activeCompetitions.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-[#1e3a5f] mb-3">Active Competitions</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {activeCompetitions.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                <div className="font-bold text-[#1e3a5f]">{c.title}</div>
                <div className="text-sm text-gray-600">{c.mode}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {skills.map((skill) => {
        const skillRows = allSkillLevels.filter((s) => s.skill === skill)
        return (
          <section key={skill} aria-labelledby={`skill-${skill}-heading`}>
            <h2
              id={`skill-${skill}-heading`}
              className="text-lg font-black text-[#1e3a5f] capitalize mb-3"
            >
              {skill}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {skillRows.map((skillLevel) => (
                <SkillCard
                  key={skillLevel.id}
                  skillLevel={skillLevel}
                  progress={progressMap.get(skillLevel.id)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
