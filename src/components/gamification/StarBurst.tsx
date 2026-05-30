'use client'

import { useEffect, useRef } from 'react'

interface StarBurstProps {
  trigger: boolean
}

export function StarBurst({ trigger }: StarBurstProps) {
  const triggered = useRef(false)

  useEffect(() => {
    if (!trigger || triggered.current) return
    triggered.current = true

    if (typeof window === 'undefined') return

    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#2563eb', '#16a34a', '#ffffff'],
        scalar: 0.8,
        ticks: 60,
      })
    })

    setTimeout(() => {
      triggered.current = false
    }, 1000)
  }, [trigger])

  return null
}
