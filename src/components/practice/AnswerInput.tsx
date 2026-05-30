'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'

interface AnswerInputProps {
  onSubmit: (answer: number) => void
  disabled?: boolean
}

const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', '✓']

export function AnswerInput({ onSubmit, disabled }: AnswerInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue('')
    inputRef.current?.focus()
  }, [disabled])

  const handleSubmit = () => {
    const num = parseInt(value, 10)
    if (!isNaN(num)) {
      onSubmit(num)
      setValue('')
    }
  }

  const handlePadPress = (key: string) => {
    if (key === '←') {
      setValue((v) => v.slice(0, -1))
    } else if (key === '✓') {
      handleSubmit()
    } else if (value.length < 5) {
      setValue((v) => v + key)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
      {/* Text display */}
      <div
        className="w-full h-16 flex items-center justify-center text-4xl font-black text-[#1e3a5f] bg-white rounded-2xl border-3 border-[#1e3a5f] shadow-inner"
        aria-live="polite"
        aria-label={`Your answer: ${value || 'empty'}`}
      >
        {value || <span className="text-[#1e3a5f]/30">_</span>}
      </div>

      {/* Hidden keyboard input for desktop */}
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= 5) setValue(e.target.value)
        }}
        onKeyDown={handleKeyDown}
        className="sr-only"
        aria-label="Type your answer"
        disabled={disabled}
        inputMode="numeric"
      />

      {/* Number pad */}
      <div
        className="grid grid-cols-3 gap-2 w-full"
        role="group"
        aria-label="Number pad"
      >
        {PAD_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => handlePadPress(key)}
            disabled={disabled}
            className={`
              touch-target flex items-center justify-center rounded-xl text-xl font-bold
              transition-all duration-100 select-none cursor-pointer
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2
              disabled:opacity-40 disabled:cursor-not-allowed
              ${key === '✓'
                ? 'bg-[#1e3a5f] text-white hover:bg-[#1a3254] active:scale-95'
                : key === '←'
                ? 'bg-red-100 text-red-700 hover:bg-red-200 active:scale-95'
                : 'bg-blue-50 text-[#1e3a5f] hover:bg-blue-100 active:scale-95'
              }
            `}
            aria-label={key === '←' ? 'Delete' : key === '✓' ? 'Submit answer' : key}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  )
}
