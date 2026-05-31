import Link from 'next/link'

const SKILLS = ['addition', 'subtraction', 'multiplication', 'division'] as const
const DIFFICULTIES = ['beginner', 'easy', 'medium', 'hard', 'expert'] as const

export default async function QuickStartPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  const selectedMode = mode === 'race' ? 'race' : 'practice'

  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-[#1e3a5f]">Choose Fact Type</h1>
        <p className="text-gray-600 mt-2">Pick the skill and difficulty for {selectedMode} mode.</p>
        <div className="space-y-4 mt-6">
          {SKILLS.map((skill) => (
            <div key={skill} className="bg-white border border-blue-100 rounded-2xl p-4">
              <div className="font-black text-[#1e3a5f] capitalize mb-3">{skill}</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {DIFFICULTIES.map((difficulty) => (
                  <Link
                    key={`${skill}-${difficulty}`}
                    href={`/api/auth/student-guest-start?mode=${selectedMode}&skill=${skill}&difficulty=${difficulty}`}
                    className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[#1e3a5f] text-sm font-bold capitalize hover:bg-blue-100 text-center"
                  >
                    {difficulty}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
