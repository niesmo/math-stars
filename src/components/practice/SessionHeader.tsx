'use client'

import { useEffect, useRef, useState } from 'react'
import { StarIcon } from '@/components/ui/StarIcon'

interface SessionHeaderProps {
  questionIndex: number
  totalQuestions: number
  streak: number
  points: number
  mode: 'practice' | 'timed' | 'race'
  timeLimitSeconds?: number
  onTimeUp?: () => void
}

export function SessionHeader({
  questionIndex,
  totalQuestions,
  streak,
  points,
  mode,
  timeLimitSeconds,
  onTimeUp,
}: SessionHeaderProps) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds ?? 0)
  const onTimeUpRef = useRef(onTimeUp)
  const hasTimedOutRef = useRef(false)
  onTimeUpRef.current = onTimeUp

  useEffect(() => {
    if ((mode !== 'timed' && mode !== 'race') || !timeLimitSeconds) return
    hasTimedOutRef.current = false
    setSecondsLeft(timeLimitSeconds)
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [mode, timeLimitSeconds])

  useEffect(() => {
    if (secondsLeft === 0 && !hasTimedOutRef.current && (mode === 'timed' || mode === 'race')) {
      hasTimedOutRef.current = true
      onTimeUpRef.current?.()
    }
  }, [secondsLeft, mode])

  const progress = totalQuestions > 0 ? (questionIndex / totalQuestions) * 100 : 0

  return (
    <div className="w-full" role="region" aria-label="Session progress">
      {/* Progress bar */}
      <div
        className="w-full h-3 bg-blue-100 rounded-full overflow-hidden mb-4"
        role="progressbar"
        aria-valuenow={questionIndex}
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-label={`Question ${questionIndex} of ${totalQuestions}`}
      >
        <div
          className="h-full bg-[#1e3a5f] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Question counter */}
        <span className="text-sm font-medium text-[#1e3a5f]/70">
          {questionIndex} / {totalQuestions}
        </span>

        {/* Streak */}
        {streak >= 2 && (
          <div
            className="flex items-center gap-1 px-3 py-1 bg-orange-100 rounded-full"
            aria-label={`${streak} question streak`}
          >
            <span aria-hidden="true" className="text-lg">🔥</span>
            <span className="font-bold text-orange-700 text-sm">{streak}</span>
          </div>
        )}

        {/* Points */}
        <div
          className="flex items-center gap-1"
          aria-label={`${points} points`}
        >
          <StarIcon size={18} />
          <span className="font-bold text-[#1e3a5f]">{points}</span>
        </div>

        {/* Timer (timed/race mode) */}
        {(mode === 'timed' || mode === 'race') && timeLimitSeconds && (
          <div
            className={`font-bold tabular-nums text-lg ${
              secondsLeft <= 10 ? 'text-red-600' : 'text-[#1e3a5f]'
            }`}
            aria-live="polite"
            aria-label={`${secondsLeft} seconds remaining`}
          >
            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  )
}
