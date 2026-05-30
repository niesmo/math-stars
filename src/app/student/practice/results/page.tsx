'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePracticeSession } from '@/store/practiceSession'
import { StarIcon } from '@/components/ui/StarIcon'
import { StarBurst } from '@/components/gamification/StarBurst'
import { useAudio } from '@/components/audio/AudioController'

export default function PracticeResultsPage() {
  const { attempts, points, streakMax, skill, skillLevelId, resetSession } = usePracticeSession()
  const audio = useAudio()

  const totalAnswered = attempts.length
  const correct = attempts.filter((a) => a.isCorrect).length
  const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0
  const isPerfect = accuracy === 100

  useEffect(() => {
    audio.play('complete')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center gap-6 pt-6 text-center">
      <StarBurst trigger={isPerfect} />

      <div className="text-6xl" aria-hidden="true">
        {accuracy >= 90 ? '🏆' : accuracy >= 70 ? '⭐' : '💪'}
      </div>

      <h1 className="text-3xl font-black text-[#1e3a5f]">
        {accuracy >= 90 ? 'Amazing work!' : accuracy >= 70 ? 'Great job!' : 'Keep practicing!'}
      </h1>

      <div className="bg-white rounded-3xl shadow-md p-6 w-full max-w-sm grid grid-cols-2 gap-4" aria-label="Session results">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-[#1e3a5f]">{accuracy}%</div>
          <div className="text-xs text-gray-500 mt-1">Accuracy</div>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <StarIcon size={20} />
            <span className="text-3xl font-black text-[#1e3a5f]">{points}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Stars Earned</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-green-700">{correct}/{totalAnswered}</div>
          <div className="text-xs text-gray-500 mt-1">Correct</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-black text-orange-700">{streakMax}</div>
          <div className="text-xs text-gray-500 mt-1">Best Streak</div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <Link
          href={skillLevelId ? `/student/practice/${skillLevelId}` : '/student/dashboard'}
          onClick={resetSession}
          className="py-3 bg-[#1e3a5f] text-white font-bold rounded-xl text-center hover:bg-[#1a3254] transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
        >
          Practice Again ↺
        </Link>
        <Link
          href="/student/dashboard"
          onClick={resetSession}
          className="py-3 bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] font-bold rounded-xl text-center hover:bg-blue-50 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
