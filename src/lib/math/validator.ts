import type { Difficulty, Skill } from '@/types'
import { generateQuestion } from './generator'

const MIN_HUMAN_TIME_MS = 200

export interface ValidationResult {
  isCorrect: boolean
  correctAnswer: number
  isSuspicious: boolean
}

export function validateAnswer(
  skill: Skill,
  difficulty: Difficulty,
  seed: number,
  questionIndex: number,
  studentAnswer: number,
  timeMs: number
): ValidationResult {
  const question = generateQuestion(skill, difficulty, seed, questionIndex)

  return {
    isCorrect: studentAnswer === question.answer,
    correctAnswer: question.answer,
    isSuspicious: timeMs < MIN_HUMAN_TIME_MS,
  }
}
