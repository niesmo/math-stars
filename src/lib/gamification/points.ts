const BASE_POINTS = 10
const STREAK_MULTIPLIER = 1.5
const SPEED_BONUS_THRESHOLD_MS = 2000
const SPEED_BONUS_MULTIPLIER = 2

export function calculatePoints(streak: number, timeMs: number): number {
  let points = BASE_POINTS
  if (streak >= 3) {
    points = Math.floor(points * STREAK_MULTIPLIER)
  }
  if (timeMs > 0 && timeMs <= SPEED_BONUS_THRESHOLD_MS) {
    points = Math.floor(points * SPEED_BONUS_MULTIPLIER)
  }
  return points
}
