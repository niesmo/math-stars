import Link from 'next/link'

export default function TeacherCompetitionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[#1e3a5f]">Competitions</h1>
        <Link href="/teacher/competitions/new" className="px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-bold">+ New Competition</Link>
      </div>
      <p className="text-sm text-gray-600">Create class competitions with dedicated leaderboards.</p>
    </div>
  )
}
