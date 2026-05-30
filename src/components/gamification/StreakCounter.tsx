'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface StreakCounterProps {
  streak: number
}

export function StreakCounter({ streak }: StreakCounterProps) {
  if (streak < 2) return null

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 border border-orange-300 rounded-full"
        aria-label={`${streak} question streak`}
      >
        <span aria-hidden="true" className="text-xl">🔥</span>
        <span className="font-black text-orange-700 text-base">{streak}</span>
      </motion.div>
    </AnimatePresence>
  )
}
