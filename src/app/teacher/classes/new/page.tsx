'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function NewClassPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [joinCode] = useState(generateJoinCode)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/teacher/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, joinCode }),
    })

    const data = await res.json()

    if (!data.success) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push(`/teacher/classes/${data.data.id}`)
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-black text-[#1e3a5f] mb-6">Create New Class</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex gap-2">
            <span aria-hidden="true">⚠️</span>
            {error}
          </div>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-[#1e3a5f]">Class Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#2563eb] outline-none transition-colors text-[#1e3a5f]"
            placeholder="e.g. Mrs. Johnson's 3rd Grade"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-[#1e3a5f]">Join Code (auto-generated)</span>
          <div className="px-4 py-3 bg-blue-50 rounded-xl border-2 border-blue-200 font-mono text-xl tracking-widest text-[#1e3a5f] text-center">
            {joinCode}
          </div>
          <p className="text-xs text-gray-500">Share this code with your students</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 py-3 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#1a3254] transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating…' : 'Create Class'}
        </button>
      </form>
    </div>
  )
}
