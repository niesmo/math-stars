'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface FeedbackOverlayProps {
  show: boolean
  isCorrect: boolean
  correctAnswer?: number
  message?: string
}

const CORRECT_MESSAGES = [
  'Amazing! ⭐',
  'Keep it up! 🚀',
  'Brilliant! 💡',
  'You got it! 🎯',
  'Superstar! ⭐',
]

const INCORRECT_MESSAGES = [
  'Not quite — you got this!',
  'Almost there!',
  "Don't give up!",
  'Try again!',
]

export function FeedbackOverlay({
  show,
  isCorrect,
  correctAnswer,
  message,
}: FeedbackOverlayProps) {
  const defaultMessage = isCorrect
    ? CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)]
    : INCORRECT_MESSAGES[Math.floor(Math.random() * INCORRECT_MESSAGES.length)]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className={`
            absolute inset-0 flex flex-col items-center justify-center rounded-3xl z-10
            ${isCorrect
              ? 'bg-green-50 border-2 border-green-200'
              : 'bg-red-50 border-2 border-red-200'
            }
          `}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <span className="text-6xl mb-2" aria-hidden="true">
            {isCorrect ? '✅' : '❌'}
          </span>
          <p
            className={`text-2xl font-black ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {message ?? defaultMessage}
          </p>
          {!isCorrect && correctAnswer !== undefined && (
            <p className="mt-2 text-lg text-gray-600">
              Answer:{' '}
              <span className="font-bold text-[#1e3a5f]">{correctAnswer}</span>
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
