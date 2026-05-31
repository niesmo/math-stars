import type { Difficulty, Question, Skill } from '@/types'

// Mulberry32 seeded PRNG — deterministic, server can re-verify same sequence
function mulberry32(seed: number) {
  return function (): number {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

const DIFFICULTY_RANGES: Record<Difficulty, { min: number; max: number }> = {
  beginner: { min: 1, max: 5 },
  easy: { min: 1, max: 10 },
  medium: { min: 1, max: 20 },
  hard: { min: 1, max: 50 },
  expert: { min: 1, max: 100 },
}

const SKILL_OPERATORS: Record<Skill, string> = {
  addition: '+',
  subtraction: '-',
  multiplication: '×',
  division: '÷',
}

export function generateQuestion(
  skill: Skill,
  difficulty: Difficulty,
  seed: number,
  index: number
): Question {
  const combinedSeed = seed ^ (index * 0x9e3779b9)
  const rng = mulberry32(combinedSeed)
  const { min, max } = DIFFICULTY_RANGES[difficulty]

  let operandA: number
  let operandB: number
  let answer: number

  if (skill === 'subtraction') {
    operandA = randInt(rng, min + 1, max)
    operandB = randInt(rng, min, operandA)
    answer = operandA - operandB
  } else if (skill === 'division') {
    operandB = randInt(rng, 1, Math.min(max, 12))
    const quotient = randInt(rng, min, max)
    operandA = operandB * quotient
    answer = quotient
  } else if (skill === 'multiplication') {
    const mulMax = Math.min(max, 12)
    const minMul = Math.max(2, Math.min(min, mulMax))
    const span = Math.max(1, mulMax - minMul + 1)
    // Increase challenge as session progresses and avoid repetitive low facts.
    const floorA = Math.min(mulMax, minMul + Math.floor(index / 2))
    const floorB = Math.min(mulMax, minMul + Math.floor(index / 3))
    operandA = randInt(rng, floorA, mulMax)
    operandB = randInt(rng, floorB, mulMax)
    if (operandA === operandB) {
      operandB = ((operandB - minMul + (index % span) + 1) % span) + minMul
    }
    answer = operandA * operandB
  } else {
    operandA = randInt(rng, min, max)
    operandB = randInt(rng, min, max)
    answer = operandA + operandB
  }

  return {
    operandA,
    operandB,
    operator: SKILL_OPERATORS[skill],
    answer,
    seed,
    index,
  }
}

export function generateSessionSeed(): number {
  return Math.floor(Math.random() * 0xffffffff)
}

export function generateOptionsForQuestion(question: Question): number[] {
  const set = new Set<number>([question.answer])
  const spread = Math.max(3, Math.floor(Math.abs(question.answer) * 0.2))
  let i = 1
  while (set.size < 4) {
    const delta = spread + i
    set.add(Math.max(0, question.answer + (i % 2 === 0 ? delta : -delta)))
    i++
  }
  return Array.from(set).sort(() => Math.random() - 0.5)
}
