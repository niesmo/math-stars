'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCompetitionPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [classId, setClassId] = useState('')
  const [mode, setMode] = useState<'practice' | 'race'>('race')
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/teacher/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, classId, mode }),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : { success: false, error: 'Empty server response' }
      if (!res.ok || !data.success) return setError(data.error ?? `Request failed (${res.status})`)
      router.push('/teacher/competitions')
    } catch {
      setError('Unable to create competition. Check class id and try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
      <h1 className="text-2xl font-black text-[#1e3a5f]">New Competition</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input className="border rounded-xl px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="border rounded-xl px-3 py-2" placeholder="Class ID or Join Code" value={classId} onChange={(e) => setClassId(e.target.value)} required />
      <select className="border rounded-xl px-3 py-2" value={mode} onChange={(e) => setMode(e.target.value as 'practice' | 'race')}>
        <option value="race">Race</option>
        <option value="practice">Practice</option>
      </select>
      <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl font-bold">Create</button>
    </form>
  )
}
