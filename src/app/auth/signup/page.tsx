'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { db } from '@/lib/db'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/teacher-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    })

    const data = await res.json()

    if (!data.success) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/teacher/dashboard')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2" aria-hidden="true">👩‍🏫</div>
          <h1 className="text-2xl font-black text-[#1e3a5f]">Create Teacher Account</h1>
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
              <span className="text-sm font-semibold text-[#1e3a5f]">Your Name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f]"
                placeholder="Ms. Johnson"
                autoComplete="name"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#1e3a5f]">School Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f]"
                placeholder="you@school.edu"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-[#1e3a5f]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f]"
                placeholder="8+ characters"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#1a3254] transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login/teacher" className="text-[#2563eb] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
