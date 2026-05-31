'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePracticeSession } from '@/store/practiceSession'
import { generateOptionsForQuestion, generateQuestion, generateSessionSeed } from '@/lib/math/generator'
import { SessionHeader } from './SessionHeader'
import { QuestionCard } from './QuestionCard'
import { AnswerOptions } from './AnswerOptions'
import { FeedbackOverlay } from './FeedbackOverlay'
import { useAudio } from '@/components/audio/AudioController'
import type { SkillLevel } from '@/lib/db/schema'
import type { SessionMode } from '@/types'

const QUESTIONS_PER_SESSION = 10
const RACE_TIME_LIMIT_SECONDS = 60

interface PracticeSessionProps {
  skillLevel: SkillLevel
  mode: SessionMode
  studentId: string
}

export function PracticeSession({ skillLevel, mode, studentId }: PracticeSessionProps) {
  const router = useRouter()
  const audio = useAudio()
  const {
    startSession,
    currentQuestion,
    setCurrentQuestion,
    recordAttempt,
    addPoints,
    streak,
    streakMax,
    points,
    questionIndex,
    attempts,
    completeSession,
    resetSession,
    getElapsedMs,
    startQuestionTimer,
    sessionId,
  } = usePracticeSession()

  const [feedback, setFeedback] = useState<{
    show: boolean
    isCorrect: boolean
    correctAnswer: number
  }>({ show: false, isCorrect: false, correctAnswer: 0 })
  const [submitting, setSubmitting] = useState(false)
  const [initDone, setInitDone] = useState(false)
  const [questionOptions, setQuestionOptions] = useState<number[]>([])
  const handleTimeUp = useCallback(() => {
    completeSession()
    router.push('/student/practice/results')
  }, [completeSession, router])

  useEffect(() => {
    if (initDone) return
    const seed = generateSessionSeed()
    const firstQuestion = generateQuestion(skillLevel.skill, skillLevel.difficulty, seed, 0)

    fetch('/api/practice/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillLevelId: skillLevel.id, mode }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          startSession({
            sessionId: data.data.sessionId,
            skillLevelId: skillLevel.id,
            skill: skillLevel.skill,
            difficulty: skillLevel.difficulty,
            mode,
            seed,
            firstQuestion,
          })
          setQuestionOptions(generateOptionsForQuestion(firstQuestion))
          setInitDone(true)
        }
      })
  }, [skillLevel, mode, startSession, initDone])

  const handleAnswer = useCallback(
    async (answer: number) => {
      if (!currentQuestion || submitting || !sessionId) return

      const timeMs = getElapsedMs()
      setSubmitting(true)

      const questionCap = mode === 'race' ? 9999 : QUESTIONS_PER_SESSION
      const isLast = questionIndex + 1 >= questionCap

      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          skill: skillLevel.skill,
          difficulty: skillLevel.difficulty,
          seed: currentQuestion.seed,
          questionIndex: currentQuestion.index,
          studentAnswer: answer,
          timeMs,
          currentStreak: streak,
          isLastQuestion: isLast,
        }),
      })

      const data = await res.json()
      const { isCorrect, correctAnswer, points: earnedPoints, nextQuestion } = data.data

      recordAttempt({
        question: currentQuestion,
        studentAnswer: answer,
        isCorrect,
        timeMs,
      })

      if (isCorrect) {
        addPoints(earnedPoints)
        audio.play(streak >= 4 ? 'streak' : 'correct')
      } else {
        audio.play('wrong')
      }

      setFeedback({ show: true, isCorrect, correctAnswer })

      setTimeout(() => {
        setFeedback((f) => ({ ...f, show: false }))
        setSubmitting(false)

        if (isLast) {
          audio.play('complete')
          completeSession()
          router.push('/student/practice/results')
        } else if (nextQuestion) {
          setCurrentQuestion(nextQuestion)
          setQuestionOptions(generateOptionsForQuestion(nextQuestion))
          startQuestionTimer()
        }
      }, isCorrect ? 250 : 550)
    },
    [
      currentQuestion,
      submitting,
      sessionId,
      questionIndex,
      streak,
      skillLevel,
      getElapsedMs,
      recordAttempt,
      addPoints,
      setCurrentQuestion,
      startQuestionTimer,
      completeSession,
      audio,
      router,
    ]
  )

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64" role="status">
        <div className="text-[#1e3a5f] font-semibold animate-pulse">
          Getting ready…
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto px-4 py-6">
      <SessionHeader
        questionIndex={questionIndex}
        totalQuestions={mode === 'race' ? 60 : QUESTIONS_PER_SESSION}
        streak={streak}
        points={points}
        mode={mode}
        timeLimitSeconds={mode === 'timed' || mode === 'race' ? RACE_TIME_LIMIT_SECONDS : undefined}
        onTimeUp={handleTimeUp}
      />

      <div className="relative w-full bg-white rounded-3xl shadow-lg p-8 min-h-[200px] flex items-center justify-center">
        <QuestionCard question={currentQuestion} />
        <FeedbackOverlay
          show={feedback.show}
          isCorrect={feedback.isCorrect}
          correctAnswer={feedback.correctAnswer}
        />
      </div>

      <AnswerOptions options={questionOptions} onSelect={handleAnswer} disabled={submitting || feedback.show} />
    </div>
  )
}
