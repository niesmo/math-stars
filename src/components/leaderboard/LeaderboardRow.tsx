import type { LeaderboardEntry, Student } from '@/lib/db/schema'

interface LeaderboardRowProps {
  rank: number
  entry: LeaderboardEntry & { student: Student }
  isCurrentUser?: boolean
}

const RANK_STYLES: Record<number, string> = {
  1: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
  2: 'bg-gray-100 text-gray-600 border border-gray-300',
  3: 'bg-orange-100 text-orange-700 border border-orange-200',
}

export function LeaderboardRow({ rank, entry, isCurrentUser }: LeaderboardRowProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isCurrentUser ? 'bg-blue-50 ring-2 ring-[#2563eb]' : 'hover:bg-gray-50'
      }`}
      aria-label={`Rank ${rank}: ${entry.student.displayName} with ${entry.score} points`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
          RANK_STYLES[rank] ?? 'bg-blue-50 text-[#1e3a5f]'
        }`}
        aria-hidden="true"
      >
        {rank <= 3 ? ['\u{1F947}', '\u{1F948}', '\u{1F949}'][rank - 1] : rank}
      </div>
      <div
        className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        aria-hidden="true"
      >
        {entry.student.displayName.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-bold truncate ${isCurrentUser ? 'text-[#2563eb]' : 'text-[#1e3a5f]'}`}>
          {entry.student.displayName}
          {isCurrentUser && <span className="ml-1 text-xs font-medium">(you)</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[#1e3a5f] font-black">
        <span aria-hidden="true">⭐</span>
        <span>{entry.score.toLocaleString()}</span>
      </div>
    </div>
  )
}
