'use client'

import Link from 'next/link'
import { MasteryRing } from '@/components/ui/MasteryRing'
import type { SkillLevel, StudentProgress } from '@/lib/db/schema'

const SKILL_ICONS: Record<string, { emoji: string; color: string }> = {
  addition: { emoji: '➕', color: 'bg-green-50 border-green-200' },
  subtraction: { emoji: '➖', color: 'bg-orange-50 border-orange-200' },
  multiplication: { emoji: '✖️', color: 'bg-purple-50 border-purple-200' },
  division: { emoji: '➗', color: 'bg-blue-50 border-blue-200' },
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
}

interface SkillCardProps {
  skillLevel: SkillLevel
  progress: StudentProgress | undefined
  totalStars?: number
}

export function SkillCard({ skillLevel, progress, totalStars = 0 }: SkillCardProps) {
  const icon = SKILL_ICONS[skillLevel.skill] ?? { emoji: '🔢', color: 'bg-gray-50 border-gray-200' }
  const mastery = progress?.masteryPct ?? 0
  const isUnlocked = (progress?.isUnlocked ?? false) || totalStars >= (skillLevel.unlockStars ?? 0)

  return (
    <div
      className={`relative rounded-2xl border-2 p-5 flex flex-col gap-4 transition-all duration-200 ${
        isUnlocked
          ? `${icon.color} hover:shadow-md hover:-translate-y-0.5`
          : 'bg-gray-100 border-gray-200 opacity-60'
      }`}
    >
      {!isUnlocked && (
        <div
          className="absolute top-3 right-3 text-gray-400"
          aria-label={`Locked — earn ${skillLevel.unlockStars} stars to unlock`}
        >
          🔒
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <span className="text-3xl" aria-hidden="true">{icon.emoji}</span>
          <h3 className="font-black text-[#1e3a5f] mt-1 capitalize">
            {skillLevel.skill}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {DIFFICULTY_LABELS[skillLevel.difficulty]}
          </p>
        </div>
        <MasteryRing percent={mastery} size={56} label={skillLevel.displayName} />
      </div>

      {isUnlocked ? (
        <Link
          href={`/student/practice/${skillLevel.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1e3a5f] text-white rounded-xl font-bold text-sm
            hover:bg-[#1a3254] transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
          aria-label={`Practice ${skillLevel.skill} — ${skillLevel.difficulty} level`}
        >
          <span aria-hidden="true">▶</span>
          Practice
        </Link>
      ) : (
        <div className="text-center text-xs text-gray-500 py-2">
          ⭐ {skillLevel.unlockStars} stars to unlock
        </div>
      )}
    </div>
  )
}
