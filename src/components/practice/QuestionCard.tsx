'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Question } from '@/types'

interface QuestionCardProps {
  question: Question
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { operandA, operator, operandB } = question

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${question.seed}-${question.index}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="text-center"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="text-5xl md:text-6xl font-black text-[#1e3a5f] tracking-tight"
          aria-label={`${operandA} ${operator} ${operandB} equals what?`}
        >
          <span>{operandA}</span>
          <span className="mx-4 text-[#2563eb]">{operator}</span>
          <span>{operandB}</span>
          <span className="mx-4 text-[#2563eb]">=</span>
          <span className="text-[#2563eb]">?</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
