'use client'

import { useEffect } from 'react'

interface AnswerOptionsProps {
  options: number[]
  onSelect: (answer: number) => void
  disabled?: boolean
}

export function AnswerOptions({ options, onSelect, disabled }: AnswerOptionsProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return
      const idx = Number(e.key) - 1
      if (idx >= 0 && idx < options.length) onSelect(options[idx])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [options, onSelect, disabled])

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-md">
      {options.map((option, idx) => (
        <button
          key={`${option}-${idx}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option)}
          className="py-4 rounded-xl bg-blue-50 text-[#1e3a5f] font-black text-2xl border-2 border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
          aria-label={`Option ${idx + 1}: ${option}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
