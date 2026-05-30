import 'dotenv/config'
import { db } from '../src/lib/db/index.js'
import { skillLevels } from '../src/lib/db/schema.js'

const SEED_DATA = [
  // Addition
  { skill: 'addition', difficulty: 'beginner', displayName: 'Addition — Beginner', description: 'Add numbers 1–5', minNumber: 1, maxNumber: 5, unlockStars: 0 },
  { skill: 'addition', difficulty: 'easy', displayName: 'Addition — Easy', description: 'Add numbers 1–10', minNumber: 1, maxNumber: 10, unlockStars: 0 },
  { skill: 'addition', difficulty: 'medium', displayName: 'Addition — Medium', description: 'Add numbers 1–20', minNumber: 1, maxNumber: 20, unlockStars: 20 },
  { skill: 'addition', difficulty: 'hard', displayName: 'Addition — Hard', description: 'Add numbers 1–50', minNumber: 1, maxNumber: 50, unlockStars: 50 },
  { skill: 'addition', difficulty: 'expert', displayName: 'Addition — Expert', description: 'Add numbers 1–100', minNumber: 1, maxNumber: 100, unlockStars: 100 },
  // Subtraction
  { skill: 'subtraction', difficulty: 'beginner', displayName: 'Subtraction — Beginner', description: 'Subtract within 5', minNumber: 1, maxNumber: 5, unlockStars: 0 },
  { skill: 'subtraction', difficulty: 'easy', displayName: 'Subtraction — Easy', description: 'Subtract within 10', minNumber: 1, maxNumber: 10, unlockStars: 0 },
  { skill: 'subtraction', difficulty: 'medium', displayName: 'Subtraction — Medium', description: 'Subtract within 20', minNumber: 1, maxNumber: 20, unlockStars: 20 },
  { skill: 'subtraction', difficulty: 'hard', displayName: 'Subtraction — Hard', description: 'Subtract within 50', minNumber: 1, maxNumber: 50, unlockStars: 50 },
  { skill: 'subtraction', difficulty: 'expert', displayName: 'Subtraction — Expert', description: 'Subtract within 100', minNumber: 1, maxNumber: 100, unlockStars: 100 },
  // Multiplication
  { skill: 'multiplication', difficulty: 'beginner', displayName: 'Multiplication — Beginner', description: 'Times tables 1–3', minNumber: 1, maxNumber: 3, unlockStars: 0 },
  { skill: 'multiplication', difficulty: 'easy', displayName: 'Multiplication — Easy', description: 'Times tables 1–5', minNumber: 1, maxNumber: 5, unlockStars: 0 },
  { skill: 'multiplication', difficulty: 'medium', displayName: 'Multiplication — Medium', description: 'Times tables 1–8', minNumber: 1, maxNumber: 8, unlockStars: 20 },
  { skill: 'multiplication', difficulty: 'hard', displayName: 'Multiplication — Hard', description: 'Times tables 1–10', minNumber: 1, maxNumber: 10, unlockStars: 50 },
  { skill: 'multiplication', difficulty: 'expert', displayName: 'Multiplication — Expert', description: 'Times tables 1–12', minNumber: 1, maxNumber: 12, unlockStars: 100 },
  // Division
  { skill: 'division', difficulty: 'beginner', displayName: 'Division — Beginner', description: 'Divide by 1–3', minNumber: 1, maxNumber: 3, unlockStars: 0 },
  { skill: 'division', difficulty: 'easy', displayName: 'Division — Easy', description: 'Divide by 1–5', minNumber: 1, maxNumber: 5, unlockStars: 0 },
  { skill: 'division', difficulty: 'medium', displayName: 'Division — Medium', description: 'Divide by 1–8', minNumber: 1, maxNumber: 8, unlockStars: 20 },
  { skill: 'division', difficulty: 'hard', displayName: 'Division — Hard', description: 'Divide by 1–10', minNumber: 1, maxNumber: 10, unlockStars: 50 },
  { skill: 'division', difficulty: 'expert', displayName: 'Division — Expert', description: 'Divide by 1–12', minNumber: 1, maxNumber: 12, unlockStars: 100 },
]

async function main() {
  console.log('Seeding skill levels...')
  for (const row of SEED_DATA) {
    await db
      .insert(skillLevels)
      .values(row as typeof skillLevels.$inferInsert)
      .onConflictDoNothing()
  }
  console.log('Done! Seeded', SEED_DATA.length, 'skill levels.')
  process.exit(0)
}

main()
