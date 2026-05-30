import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Question, SessionAttempt, Skill, Difficulty, SessionMode } from '@/types'

interface PracticeSessionState {
  sessionId: string | null
  skillLevelId: string | null
  skill: Skill | null
  difficulty: Difficulty | null
  mode: SessionMode
  seed: number | null
  questionIndex: number
  currentQuestion: Question | null
  attempts: SessionAttempt[]
  streak: number
  streakMax: number
  points: number
  startedAt: number | null
  questionStartedAt: number | null
  isComplete: boolean

  startSession: (params: {
    sessionId: string
    skillLevelId: string
    skill: Skill
    difficulty: Difficulty
    mode: SessionMode
    seed: number
    firstQuestion: Question
  }) => void
  setCurrentQuestion: (question: Question) => void
  recordAttempt: (attempt: SessionAttempt) => void
  addPoints: (amount: number) => void
  completeSession: () => void
  resetSession: () => void
  startQuestionTimer: () => void
  getElapsedMs: () => number
}

const initialState = {
  sessionId: null,
  skillLevelId: null,
  skill: null,
  difficulty: null,
  mode: 'practice' as SessionMode,
  seed: null,
  questionIndex: 0,
  currentQuestion: null,
  attempts: [],
  streak: 0,
  streakMax: 0,
  points: 0,
  startedAt: null,
  questionStartedAt: null,
  isComplete: false,
}

export const usePracticeSession = create<PracticeSessionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      startSession: ({ sessionId, skillLevelId, skill, difficulty, mode, seed, firstQuestion }) =>
        set({
          sessionId,
          skillLevelId,
          skill,
          difficulty,
          mode,
          seed,
          questionIndex: 0,
          currentQuestion: firstQuestion,
          attempts: [],
          streak: 0,
          streakMax: 0,
          points: 0,
          startedAt: Date.now(),
          questionStartedAt: Date.now(),
          isComplete: false,
        }),

      setCurrentQuestion: (question) =>
        set({ currentQuestion: question, questionStartedAt: Date.now() }),

      recordAttempt: (attempt) =>
        set((state) => {
          const newStreak = attempt.isCorrect ? state.streak + 1 : 0
          const newStreakMax = Math.max(state.streakMax, newStreak)
          return {
            attempts: [...state.attempts, attempt],
            streak: newStreak,
            streakMax: newStreakMax,
            questionIndex: state.questionIndex + 1,
          }
        }),

      addPoints: (amount) =>
        set((state) => ({ points: state.points + amount })),

      completeSession: () => set({ isComplete: true }),

      resetSession: () => set(initialState),

      startQuestionTimer: () => set({ questionStartedAt: Date.now() }),

      getElapsedMs: () => {
        const { questionStartedAt } = get()
        return questionStartedAt ? Date.now() - questionStartedAt : 0
      },
    }),
    {
      name: 'math-stars-session',
      partialize: (state) => ({
        sessionId: state.sessionId,
        skillLevelId: state.skillLevelId,
        skill: state.skill,
        difficulty: state.difficulty,
        mode: state.mode,
        seed: state.seed,
        questionIndex: state.questionIndex,
        attempts: state.attempts,
        streak: state.streak,
        streakMax: state.streakMax,
        points: state.points,
        startedAt: state.startedAt,
        isComplete: state.isComplete,
      }),
    }
  )
)
