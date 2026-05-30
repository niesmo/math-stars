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
    const res = await fetch('/api/teacher/competitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, classId, mode }),
    })
    const data = await res.json()
    if (!data.success) return setError(data.error ?? 'Failed')
    router.push('/teacher/competitions')
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg bg-white rounded-2xl p-6 shadow-sm flex flex-col gap-3">
      <h1 className="text-2xl font-black text-[#1e3a5f]">New Competition</h1>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input className="border rounded-xl px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="border rounded-xl px-3 py-2" placeholder="Class ID" value={classId} onChange={(e) => setClassId(e.target.value)} required />
      <select className="border rounded-xl px-3 py-2" value={mode} onChange={(e) => setMode(e.target.value as 'practice' | 'race')}>
        <option value="race">Race</option>
        <option value="practice">Practice</option>
      </select>
      <button type="submit" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl font-bold">Create</button>
    </form>
  )
}
