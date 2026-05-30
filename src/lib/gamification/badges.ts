export interface BadgeCriteria {
  type: 'streak' | 'speed' | 'mastery' | 'sessions' | 'perfect_session'
  threshold: number
}

export interface BadgeDefinition {
  slug: string
  name: string
  description: string
  iconSlug: string
  category: 'streak' | 'speed' | 'mastery' | 'persistence' | 'milestone'
  criteria: BadgeCriteria
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    slug: 'lightning-fast',
    name: 'Lightning Fast',
    description: 'Answer 10 questions correctly in under 2 seconds each',
    iconSlug: 'zap',
    category: 'speed',
    criteria: { type: 'speed', threshold: 10 },
  },
  {
    slug: 'on-fire',
    name: 'On Fire!',
    description: 'Get 5 correct answers in a row',
    iconSlug: 'flame',
    category: 'streak',
    criteria: { type: 'streak', threshold: 5 },
  },
  {
    slug: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a session with 100% accuracy',
    iconSlug: 'star',
    category: 'milestone',
    criteria: { type: 'perfect_session', threshold: 1 },
  },
  {
    slug: 'persistent',
    name: 'Never Give Up',
    description: 'Complete 10 practice sessions',
    iconSlug: 'trophy',
    category: 'persistence',
    criteria: { type: 'sessions', threshold: 10 },
  },
  {
    slug: 'math-master',
    name: 'Math Master',
    description: 'Reach 80%+ mastery on any skill',
    iconSlug: 'crown',
    category: 'mastery',
    criteria: { type: 'mastery', threshold: 80 },
  },
]

export interface SessionStats {
  streakMax: number
  fastAnswers: number
  totalQuestions: number
  correctAnswers: number
  sessionCount: number
  masteryPct: number
}

export function checkBadgeUnlocks(
  stats: SessionStats,
  alreadyEarned: string[]
): string[] {
  const newBadges: string[] = []

  for (const badge of BADGE_DEFINITIONS) {
    if (alreadyEarned.includes(badge.slug)) continue

    const { criteria } = badge
    let earned = false

    if (criteria.type === 'streak' && stats.streakMax >= criteria.threshold) {
      earned = true
    } else if (criteria.type === 'speed' && stats.fastAnswers >= criteria.threshold) {
      earned = true
    } else if (
      criteria.type === 'perfect_session' &&
      stats.totalQuestions > 0 &&
      stats.correctAnswers === stats.totalQuestions
    ) {
      earned = true
    } else if (criteria.type === 'sessions' && stats.sessionCount >= criteria.threshold) {
      earned = true
    } else if (criteria.type === 'mastery' && stats.masteryPct >= criteria.threshold) {
      earned = true
    }

    if (earned) {
      newBadges.push(badge.slug)
    }
  }

  return newBadges
}
