'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import type { BadgeDefinition } from '@/lib/gamification/badges'

const ICON_MAP: Record<string, string> = {
  zap: '⚡',
  flame: '🔥',
  star: '⭐',
  trophy: '🏆',
  crown: '👑',
}

interface BadgeUnlockModalProps {
  badges: BadgeDefinition[]
  onDismiss: () => void
}

export function BadgeUnlockModal({ badges, onDismiss }: BadgeUnlockModalProps) {
  if (badges.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-modal-title"
    >
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
        >
          <h2 id="badge-modal-title" className="text-2xl font-black text-[#1e3a5f] mb-4">
            New Badge{badges.length > 1 ? 's' : ''} Unlocked! 🎉
          </h2>

          <div className="flex flex-col gap-4 mb-6">
            {badges.map((badge) => (
              <div
                key={badge.slug}
                className="flex items-center gap-4 bg-blue-50 rounded-2xl p-4"
              >
                <span className="text-4xl" aria-hidden="true">
                  {ICON_MAP[badge.iconSlug] ?? '🏅'}
                </span>
                <div className="text-left">
                  <div className="font-black text-[#1e3a5f]">{badge.name}</div>
                  <div className="text-sm text-gray-600">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={onDismiss} size="lg" className="w-full">
            Awesome! 🌟
          </Button>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
