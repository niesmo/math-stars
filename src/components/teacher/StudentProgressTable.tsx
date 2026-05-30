'use client'

import { useState } from 'react'
import type { Student, StudentProgress, SkillLevel } from '@/lib/db/schema'

interface StudentWithProgress {
  student: Student
  progress: (StudentProgress & { skillLevel: SkillLevel })[]
}

interface StudentProgressTableProps {
  studentsWithProgress: StudentWithProgress[]
}

export function StudentProgressTable({ studentsWithProgress }: StudentProgressTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'stars' | 'mastery'>('stars')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (col: typeof sortBy) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortDir('desc')
    }
  }

  const sorted = [...studentsWithProgress].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'name') {
      cmp = a.student.displayName.localeCompare(b.student.displayName)
    } else if (sortBy === 'stars') {
      cmp = (a.student.totalStars ?? 0) - (b.student.totalStars ?? 0)
    } else if (sortBy === 'mastery') {
      const avgA =
        a.progress.reduce((s, p) => s + (p.masteryPct ?? 0), 0) / (a.progress.length || 1)
      const avgB =
        b.progress.reduce((s, p) => s + (p.masteryPct ?? 0), 0) / (b.progress.length || 1)
      cmp = avgA - avgB
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortButton = ({ col, label }: { col: typeof sortBy; label: string }) => (
    <button
      onClick={() => handleSort(col)}
      className="flex items-center gap-1 font-semibold text-[#1e3a5f] hover:text-[#2563eb] transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded"
      aria-label={`Sort by ${label} ${sortBy === col ? (sortDir === 'asc' ? 'descending' : 'ascending') : 'descending'}`}
    >
      {label}
      {sortBy === col && (
        <span aria-hidden="true">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
      )}
    </button>
  )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Student progress">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4">
              <SortButton col="name" label="Student" />
            </th>
            <th className="text-right py-3 px-4">
              <SortButton col="stars" label="Stars" />
            </th>
            <th className="text-right py-3 px-4">
              <SortButton col="mastery" label="Avg. Mastery" />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(({ student, progress }) => {
            const avgMastery =
              progress.reduce((s, p) => s + (p.masteryPct ?? 0), 0) / (progress.length || 1)
            return (
              <tr
                key={student.id}
                className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
              >
                <td className="py-3 px-4 font-medium text-[#1e3a5f]">
                  {student.displayName}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="flex items-center justify-end gap-1">
                    <span aria-hidden="true">⭐</span>
                    {student.totalStars ?? 0}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-semibold ${
                      avgMastery >= 80
                        ? 'text-green-600'
                        : avgMastery >= 50
                        ? 'text-yellow-600'
                        : 'text-red-500'
                    }`}
                  >
                    {Math.round(avgMastery)}%
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
