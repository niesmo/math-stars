import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { studentBadges, badges, practiceSessions, studentProgress } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badges'

const ICON_MAP: Record<string, string> = {
  zap: '⚡',
  flame: '🔥',
  star: '⭐',
  trophy: '🏆',
  crown: '👑',
}

export default async function BadgesPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) redirect('/auth/login/student')

  const session = await verifyStudentSession(token)
  if (!session) redirect('/auth/login/student')

  const earned = await db
    .select({ badgeId: studentBadges.badgeId, earnedAt: studentBadges.earnedAt })
    .from(studentBadges)
    .where(eq(studentBadges.studentId, session.studentId))

  const earnedIds = new Set(earned.map((e) => e.badgeId))
  const [badgeRows, sessionRows, progressRows] = await Promise.all([
    db.select().from(badges),
    db.select().from(practiceSessions).where(eq(practiceSessions.studentId, session.studentId)),
    db.select().from(studentProgress).where(eq(studentProgress.studentId, session.studentId)),
  ])
  const earnedSlugs = new Set(
    badgeRows.filter((b) => earnedIds.has(b.id)).map((b) => b.slug)
  )
  const maxMastery = progressRows.reduce((m, p) => Math.max(m, p.masteryPct ?? 0), 0)
  const maxStreak = sessionRows.reduce((m, s) => Math.max(m, s.streakMax ?? 0), 0)
  const fastAnswers = sessionRows.reduce((sum, s) => sum + ((s.avgTimeMs ?? 999999) <= 2000 ? (s.correctAnswers ?? 0) : 0), 0)
  const perfectSessions = sessionRows.filter((s) => (s.totalQuestions ?? 0) > 0 && s.totalQuestions === s.correctAnswers).length

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black text-[#1e3a5f] text-center">🎖️ My Badges</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const isEarned = earnedSlugs.has(badge.slug)
          const threshold = badge.criteria.threshold
          let progress = 0
          if (badge.criteria.type === 'streak') progress = Math.min(100, Math.round((maxStreak / threshold) * 100))
          if (badge.criteria.type === 'speed') progress = Math.min(100, Math.round((fastAnswers / threshold) * 100))
          if (badge.criteria.type === 'sessions') progress = Math.min(100, Math.round((sessionRows.length / threshold) * 100))
          if (badge.criteria.type === 'mastery') progress = Math.min(100, Math.round((maxMastery / threshold) * 100))
          if (badge.criteria.type === 'perfect_session') progress = Math.min(100, Math.round((perfectSessions / threshold) * 100))

          return (
            <div
              key={badge.slug}
              className={`rounded-2xl p-4 text-center border-2 transition-all ${
                isEarned
                  ? 'bg-yellow-50 border-yellow-300'
                  : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
              }`}
              aria-label={`${badge.name}: ${badge.description}. ${isEarned ? 'Earned' : 'Not yet earned'}`}
            >
              <div className="text-3xl mb-2" aria-hidden="true">
                {ICON_MAP[badge.iconSlug] ?? '🏅'}
              </div>
              <div className="font-black text-sm text-[#1e3a5f]">{badge.name}</div>
              <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
              {!isEarned && (
                <div className="mt-3">
                  <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full bg-[#2563eb]" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">{progress}% to unlock</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
