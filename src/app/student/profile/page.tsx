import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { badges, practiceSessions, studentBadges, studentProgress, students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { StarIcon } from '@/components/ui/StarIcon'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badges'

const ICON_MAP: Record<string, string> = {
  zap: '⚡',
  flame: '🔥',
  star: '⭐',
  trophy: '🏆',
  crown: '👑',
}

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) redirect('/auth/login/student')

  const session = await verifyStudentSession(token)
  if (!session) redirect('/auth/login/student')

  const student = await db
    .select()
    .from(students)
    .where(eq(students.id, session.studentId))
    .limit(1)
    .then((r) => r[0])

  if (!student) redirect('/auth/login/student')
  const earned = await db
    .select({ badgeId: studentBadges.badgeId })
    .from(studentBadges)
    .where(eq(studentBadges.studentId, session.studentId))
  const earnedIds = new Set(earned.map((e) => e.badgeId))
  const [badgeRows, sessionRows, progressRows] = await Promise.all([
    db.select().from(badges),
    db.select().from(practiceSessions).where(eq(practiceSessions.studentId, session.studentId)),
    db.select().from(studentProgress).where(eq(studentProgress.studentId, session.studentId)),
  ])
  const earnedSlugs = new Set(badgeRows.filter((b) => earnedIds.has(b.id)).map((b) => b.slug))
  const maxMastery = progressRows.reduce((m, p) => Math.max(m, p.masteryPct ?? 0), 0)
  const maxStreak = sessionRows.reduce((m, s) => Math.max(m, s.streakMax ?? 0), 0)
  const fastAnswers = sessionRows.reduce((sum, s) => sum + ((s.avgTimeMs ?? 999999) <= 2000 ? (s.correctAnswers ?? 0) : 0), 0)
  const perfectSessions = sessionRows.filter((s) => (s.totalQuestions ?? 0) > 0 && s.totalQuestions === s.correctAnswers).length

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
        <div
          className="w-20 h-20 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-4xl font-black mx-auto mb-3"
          aria-hidden="true"
        >
          {student.displayName.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-black text-[#1e3a5f]">{student.displayName}</h1>

        <div className="flex items-center justify-center gap-2 mt-3">
          <StarIcon size={20} />
          <span className="text-xl font-bold text-[#1e3a5f]">
            {student.totalStars ?? 0} stars
          </span>
        </div>
      </div>
      <section className="bg-white rounded-3xl shadow-sm p-6">
        <h2 className="text-xl font-black text-[#1e3a5f]">Badge Progress</h2>
        <p className="text-sm text-gray-600 mt-1">Track your path to every achievement.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const isEarned = earnedSlugs.has(badge.slug)
            const threshold = badge.criteria.threshold
            let current = 0
            if (badge.criteria.type === 'streak') current = maxStreak
            if (badge.criteria.type === 'speed') current = fastAnswers
            if (badge.criteria.type === 'sessions') current = sessionRows.length
            if (badge.criteria.type === 'mastery') current = Math.round(maxMastery)
            if (badge.criteria.type === 'perfect_session') current = perfectSessions
            const progress = Math.min(100, Math.round((current / threshold) * 100))
            return (
              <div key={badge.slug} className={`rounded-2xl border p-4 ${isEarned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" aria-hidden="true">{ICON_MAP[badge.iconSlug] ?? '🏅'}</span>
                    <div className="font-black text-[#1e3a5f] text-sm">{badge.name}</div>
                  </div>
                  <div className="text-xs font-bold text-[#1e3a5f]">{isEarned ? 'Earned' : `${current}/${threshold}`}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className={`h-full ${isEarned ? 'bg-yellow-400' : 'bg-[#2563eb]'}`} style={{ width: `${isEarned ? 100 : progress}%` }} />
                </div>
                <div className="text-[11px] text-gray-500 mt-1">{isEarned ? 'Completed' : `${progress}% complete`}</div>
              </div>
            )
          })}
        </div>
      </section>

      <form action="/api/auth/student-logout" method="POST">
        <button
          type="submit"
          className="block w-full py-3 text-center bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
        >
          Sign Out
        </button>
      </form>
    </div>
  )
}
