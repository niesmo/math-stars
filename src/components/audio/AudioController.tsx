'use client'

import { createContext, useContext, useCallback, useRef, useEffect } from 'react'

type SoundName = 'correct' | 'wrong' | 'streak' | 'complete'

interface AudioContextValue {
  play: (name: SoundName) => void
  setVolume: (v: number) => void
}

const AudioCtx = createContext<AudioContextValue>({
  play: () => {},
  setVolume: () => {},
})

export function useAudio() {
  return useContext(AudioCtx)
}

// Generate simple tones via Web Audio API — no external files needed
function playTone(
  ctx: AudioContext,
  frequencies: number[],
  duration: number,
  gain: number,
  delay = 0
) {
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(gain, ctx.currentTime + delay)
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
  masterGain.connect(ctx.destination)

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    osc.connect(masterGain)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration)
  })
}

const SOUNDS: Record<SoundName, (ctx: AudioContext, volume: number) => void> = {
  correct: (ctx, vol) => {
    // Cheerful ascending arpeggio
    playTone(ctx, [523], 0.12, vol * 0.3, 0)
    playTone(ctx, [659], 0.12, vol * 0.3, 0.1)
    playTone(ctx, [784], 0.2, vol * 0.4, 0.2)
  },
  wrong: (ctx, vol) => {
    // Soft descending tone
    playTone(ctx, [392, 330], 0.2, vol * 0.2, 0)
  },
  streak: (ctx, vol) => {
    // Energetic rising chime
    playTone(ctx, [523], 0.1, vol * 0.35, 0)
    playTone(ctx, [659], 0.1, vol * 0.35, 0.07)
    playTone(ctx, [784], 0.1, vol * 0.35, 0.14)
    playTone(ctx, [1047], 0.25, vol * 0.5, 0.21)
  },
  complete: (ctx, vol) => {
    // Victory fanfare
    playTone(ctx, [523, 659], 0.15, vol * 0.35, 0)
    playTone(ctx, [659, 784], 0.15, vol * 0.35, 0.15)
    playTone(ctx, [784, 1047], 0.3, vol * 0.5, 0.3)
  },
}

interface AudioProviderProps {
  children: React.ReactNode
}

export function AudioProvider({ children }: AudioProviderProps) {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const volumeRef = useRef(0.7)

  const ensureContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const play = useCallback(
    (name: SoundName) => {
      try {
        const ctx = ensureContext()
        SOUNDS[name]?.(ctx, volumeRef.current)
      } catch {
        // Audio failed silently — non-critical
      }
    },
    [ensureContext]
  )

  const setVolume = useCallback((v: number) => {
    volumeRef.current = Math.max(0, Math.min(1, v))
  }, [])

  return (
    <AudioCtx.Provider value={{ play, setVolume }}>
      {children}
    </AudioCtx.Provider>
  )
}
