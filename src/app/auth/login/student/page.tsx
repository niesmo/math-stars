'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StudentLoginPage() {
  const router = useRouter()
  const [classCode, setClassCode] = useState('')
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [requiresPin, setRequiresPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/student-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, username, pin: pin || undefined }),
    })

    const data = await res.json()

    if (!data.success) {
      if (data.requiresPin) {
        setRequiresPin(true)
        setLoading(false)
        return
      }
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/student/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2" aria-hidden="true">✏️</div>
          <h1 className="text-2xl font-black text-[#1e3a5f]">Student Login</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the code your teacher gave you</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex gap-2">
              <span aria-hidden="true">⚠️</span>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#1e3a5f]">Class Code</span>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f] font-mono text-xl tracking-widest text-center uppercase"
                placeholder="ABC123"
                autoComplete="off"
                spellCheck={false}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#1e3a5f]">Your Name</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f]"
                placeholder="e.g. alex"
                autoComplete="username"
              />
            </label>

            {requiresPin && (
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold text-[#1e3a5f]">PIN (4 digits)</span>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  maxLength={4}
                  inputMode="numeric"
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f] tracking-widest text-center"
                  placeholder="••••"
                  autoFocus
                />
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#1a3254] transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining…' : "Let's Go! 🚀"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 text-center">
        <Link href="/auth/login/teacher" className="text-sm text-[#1e3a5f]/70 hover:text-[#1e3a5f] transition-colors">
          I&apos;m a teacher →
        </Link>
      </div>
    </div>
  )
}
