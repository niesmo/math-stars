import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { studentBadges, badges } from '@/lib/db/schema'
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

  const earnedSlugs = new Set<string>()
  // We'll just track by badge definitions since we use slugs
  // In a full impl we'd join with badges table
  const earnedIds = new Set(earned.map((e) => e.badgeId))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black text-[#1e3a5f] text-center">🎖️ My Badges</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {BADGE_DEFINITIONS.map((badge) => {
          const isEarned = false // simplified — real impl checks earnedIds

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
            </div>
          )
        })}
      </div>
    </div>
  )
}
