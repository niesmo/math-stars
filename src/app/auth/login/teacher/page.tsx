'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function TeacherLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
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
          <h1 className="text-2xl font-black text-[#1e3a5f]">Teacher Login</h1>
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
              <span className="text-sm font-semibold text-[#1e3a5f]">Email</span>
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
                autoComplete="current-password"
                className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f]"
                placeholder="••••••••"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#1a3254] transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          New here?{' '}
          <Link href="/auth/signup" className="text-[#2563eb] font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded">
            Create an account
          </Link>
        </div>
      </div>

      <div className="mt-4 text-center">
        <Link href="/auth/login/student" className="text-sm text-[#1e3a5f]/70 hover:text-[#1e3a5f] transition-colors">
          I&apos;m a student →
        </Link>
      </div>
    </div>
  )
}
