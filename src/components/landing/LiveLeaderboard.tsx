'use client'

import { useEffect, useMemo, useState } from 'react'

type Row = { name: string; score: number; trend: number }

const BASE_ROWS: Row[] = [
  { name: 'Alex', score: 1280, trend: 42 },
  { name: 'Maya', score: 1215, trend: 36 },
  { name: 'Jordan', score: 1184, trend: 51 },
  { name: 'Sam', score: 1108, trend: 19 },
]
const NAMES = ['Alex', 'Maya', 'Jordan', 'Sam', 'Riley', 'Noah', 'Avery', 'Kai', 'Nova', 'Parker']

export function LiveLeaderboard() {
  const [rows, setRows] = useState<Row[]>(BASE_ROWS)

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => {
        const bumped = prev.map((r) => {
          const bump = Math.floor(Math.random() * 8)
          return { ...r, score: r.score + bump, trend: r.trend + bump }
        })
        const next = [...bumped]
        if (Math.random() < 0.6) {
          const pool = NAMES.filter((n) => !next.some((r) => r.name === n))
          const incoming = pool[Math.floor(Math.random() * Math.max(pool.length, 1))] ?? `Player-${Math.floor(Math.random() * 999)}`
          next.push({ name: incoming, score: 1000 + Math.floor(Math.random() * 250), trend: 10 + Math.floor(Math.random() * 25) })
        }
        next.sort((a, b) => b.score - a.score)
        return next.slice(0, 4)
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const rendered = useMemo(() => rows.slice(0, 4), [rows])

  return (
    <div className="space-y-2">
      {rendered.map((row, i) => (
        <div key={row.name} className="flex items-center justify-between rounded-xl bg-blue-50 px-4 py-3 transition-all duration-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center">{i + 1}</div>
            <div className="font-bold text-[#1e3a5f]">{row.name}</div>
          </div>
          <div className="text-right">
            <div className="font-black text-[#1e3a5f]">{row.score}</div>
            <div className="text-xs text-green-700">+{row.trend}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
