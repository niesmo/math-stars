import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { db } from '@/lib/db'
import { skillLevels, studentProgress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { WelcomeBanner } from '@/components/dashboard/WelcomeBanner'
import { SkillCard } from '@/components/dashboard/SkillCard'

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

  const skills = ['addition', 'subtraction', 'multiplication', 'division'] as const

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner
        displayName={session.displayName}
        totalStars={0}
        todayStars={0}
      />

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
