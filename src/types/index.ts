export type Skill = 'addition' | 'subtraction' | 'multiplication' | 'division'
export type Difficulty = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert'
export type SessionMode = 'practice' | 'timed' | 'race'

export interface Question {
  operandA: number
  operandB: number
  operator: string
  answer: number
  options?: number[]
  seed: number
  index: number
}

export interface SessionAttempt {
  question: Question
  studentAnswer: number | null
  isCorrect: boolean
  timeMs: number
}

export interface StudentSession {
  id: string
  studentId: string
  classId: string
  displayName: string
  avatarSeed: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
