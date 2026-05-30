import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const skillEnum = pgEnum('skill_type', [
  'addition',
  'subtraction',
  'multiplication',
  'division',
])

export const difficultyEnum = pgEnum('difficulty_level', [
  'beginner',
  'easy',
  'medium',
  'hard',
  'expert',
])

export const sessionModeEnum = pgEnum('session_mode', [
  'practice',
  'timed',
  'race',
])

export const badgeCategoryEnum = pgEnum('badge_category', [
  'streak',
  'speed',
  'mastery',
  'persistence',
  'milestone',
])

export const leaderboardPeriodEnum = pgEnum('leaderboard_period', [
  'daily',
  'weekly',
  'alltime',
])

export const teachers = pgTable('teachers', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  authId: uuid('auth_id').unique().notNull(),
  email: text('email').unique().notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  teacherId: uuid('teacher_id')
    .notNull()
    .references(() => teachers.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  joinCode: text('join_code').unique().notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const students = pgTable(
  'students',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    username: text('username').notNull(),
    displayName: text('display_name').notNull(),
    avatarSeed: text('avatar_seed').notNull(),
    pinHash: text('pin_hash'),
    totalStars: integer('total_stars').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.classId, t.username)]
)

export const skillLevels = pgTable(
  'skill_levels',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    skill: skillEnum('skill').notNull(),
    difficulty: difficultyEnum('difficulty').notNull(),
    displayName: text('display_name').notNull(),
    description: text('description'),
    minNumber: integer('min_number').notNull(),
    maxNumber: integer('max_number').notNull(),
    unlockStars: integer('unlock_stars').default(0),
  },
  (t) => [unique().on(t.skill, t.difficulty)]
)

export const studentProgress = pgTable(
  'student_progress',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    skillLevelId: uuid('skill_level_id')
      .notNull()
      .references(() => skillLevels.id),
    masteryPct: real('mastery_pct').default(0),
    attemptsCount: integer('attempts_count').default(0),
    correctCount: integer('correct_count').default(0),
    bestStreak: integer('best_streak').default(0),
    isUnlocked: boolean('is_unlocked').default(false),
    unlockedAt: timestamp('unlocked_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.studentId, t.skillLevelId)]
)

export const practiceSessions = pgTable('practice_sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  skillLevelId: uuid('skill_level_id')
    .notNull()
    .references(() => skillLevels.id),
  mode: sessionModeEnum('mode').notNull().default('practice'),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  totalQuestions: integer('total_questions').default(0),
  correctAnswers: integer('correct_answers').default(0),
  avgTimeMs: integer('avg_time_ms'),
  pointsEarned: integer('points_earned').default(0),
  streakMax: integer('streak_max').default(0),
})

export const practiceAttempts = pgTable('practice_attempts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => practiceSessions.id, { onDelete: 'cascade' }),
  operandA: integer('operand_a').notNull(),
  operandB: integer('operand_b').notNull(),
  operator: text('operator').notNull(),
  correctAnswer: integer('correct_answer').notNull(),
  studentAnswer: integer('student_answer'),
  isCorrect: boolean('is_correct').notNull(),
  timeMs: integer('time_ms').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const badges = pgTable('badges', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  slug: text('slug').unique().notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  iconSlug: text('icon_slug').notNull(),
  category: badgeCategoryEnum('category').notNull(),
  criteriaJson: jsonb('criteria_json').notNull(),
})

export const studentBadges = pgTable(
  'student_badges',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    badgeId: uuid('badge_id')
      .notNull()
      .references(() => badges.id),
    earnedAt: timestamp('earned_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [unique().on(t.studentId, t.badgeId)]
)

export const leaderboardEntries = pgTable(
  'leaderboard_entries',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    skill: skillEnum('skill'),
    period: leaderboardPeriodEnum('period').notNull(),
    score: integer('score').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique().on(t.studentId, t.classId, t.skill, t.period),
    index('idx_leaderboard_class_period').on(t.classId, t.period, t.score),
    index('idx_leaderboard_global').on(t.period, t.score),
  ]
)

export type Teacher = typeof teachers.$inferSelect
export type Class = typeof classes.$inferSelect
export type Student = typeof students.$inferSelect
export type SkillLevel = typeof skillLevels.$inferSelect
export type StudentProgress = typeof studentProgress.$inferSelect
export type PracticeSession = typeof practiceSessions.$inferSelect
export type PracticeAttempt = typeof practiceAttempts.$inferSelect
export type Badge = typeof badges.$inferSelect
export type StudentBadge = typeof studentBadges.$inferSelect
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect
