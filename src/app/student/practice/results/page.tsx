'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePracticeSession } from '@/store/practiceSession'
import { StarIcon } from '@/components/ui/StarIcon'
import { StarBurst } from '@/components/gamification/StarBurst'
import { useAudio } from '@/components/audio/AudioController'

export default function PracticeResultsPage() {
  const { attempts, points, streakMax, skill, skillLevelId, mode, resetSession } = usePracticeSession()
  const audio = useAudio()
  const [displayName, setDisplayName] = useState('')
  const [rankInfo, setRankInfo] = useState<{ rank: number; total: number } | null>(null)
  const [rankEntries, setRankEntries] = useState<Array<{ rank: number; studentId: string; displayName: string; score: number }>>([])
  const [savedName, setSavedName] = useState(false)

  const totalAnswered = attempts.length
  const correct = attempts.filter((a) => a.isCorrect).length
  const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0
  const isPerfect = accuracy === 100

  useEffect(() => {
    audio.play('complete')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveNameAndLoadRank = async () => {
    if (!displayName.trim() || !skillLevelId) return
    await fetch('/api/student/profile-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    })
    const rankRes = await fetch(`/api/race/rank?skillLevelId=${encodeURIComponent(skillLevelId)}`)
    const rankJson = await rankRes.json()
    if (rankJson.success) {
      setRankInfo({ rank: rankJson.data.rank, total: rankJson.data.total })
      setRankEntries(rankJson.data.entries ?? [])
    }
    setSavedName(true)
  }

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
      {mode === 'race' && (
        <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-sm">
          <h2 className="font-black text-[#1e3a5f]">Race Leaderboard</h2>
          {!savedName ? (
            <div className="mt-3 flex flex-col gap-2">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name for ranking"
                className="px-3 py-2 rounded-xl border border-gray-300"
              />
              <button onClick={saveNameAndLoadRank} className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl font-bold">
                Submit Score
              </button>
            </div>
          ) : (
            <div className="mt-3 text-left">
              <p className="text-sm text-gray-700 mb-2">
                Global rank for this level: <span className="font-black text-[#1e3a5f]">#{rankInfo?.rank ?? '-'}</span> / {rankInfo?.total ?? '-'}
              </p>
              <div className="rounded-xl border border-blue-100 overflow-hidden">
                {rankEntries.slice(0, 8).map((entry) => (
                  <div key={`${entry.studentId}-${entry.rank}`} className="grid grid-cols-[48px_1fr_80px] px-3 py-2 text-sm border-b last:border-b-0">
                    <div className="font-bold text-[#1e3a5f]">#{entry.rank}</div>
                    <div className="truncate">{entry.displayName}</div>
                    <div className="text-right font-bold text-[#1e3a5f]">{entry.score}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
