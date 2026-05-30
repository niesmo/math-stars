'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LeaderboardRow } from './LeaderboardRow'
import type { LeaderboardEntry, Student } from '@/lib/db/schema'

type EnrichedEntry = LeaderboardEntry & { student: Student }

interface LeaderboardTableProps {
  initialEntries: EnrichedEntry[]
  currentStudentId?: string
  classId: string
  period: 'daily' | 'weekly' | 'alltime'
}

export function LeaderboardTable({
  initialEntries,
  currentStudentId,
  classId,
  period,
}: LeaderboardTableProps) {
  const [entries, setEntries] = useState<EnrichedEntry[]>(initialEntries)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`leaderboard-${classId}-${period}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_entries',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          fetch(`/api/leaderboard?classId=${classId}&period=${period}`)
            .then((r) => r.json())
            .then((data) => {
              if (data.success) setEntries(data.data)
            })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [classId, period])

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-3" aria-hidden="true">🌟</p>
        <p className="font-semibold">No scores yet — be the first!</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2" role="list" aria-label="Leaderboard">
      {[...entries]
        .sort((a, b) => b.score - a.score)
        .map((entry, idx) => (
          <div key={entry.id} role="listitem">
            <LeaderboardRow
              rank={idx + 1}
              entry={entry}
              isCurrentUser={entry.studentId === currentStudentId}
            />
          </div>
        ))}
    </div>
  )
}
