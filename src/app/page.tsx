import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="text-8xl mb-6" aria-hidden="true">⭐</div>
        <h1 className="text-5xl font-black text-[#1e3a5f] mb-4">
          Math Stars
        </h1>
        <p className="text-xl text-[#1e3a5f]/70 mb-10 max-w-lg mx-auto">
          Fun, engaging math practice for students. Track progress, earn stars, and
          climb the leaderboard!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/login/student"
            className="px-8 py-4 bg-[#1e3a5f] text-white text-lg font-bold rounded-2xl
              hover:bg-[#1a3254] transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
          >
            I&apos;m a Student ✏️
          </Link>
          <Link
            href="/auth/login/teacher"
            className="px-8 py-4 bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] text-lg font-bold rounded-2xl
              hover:bg-blue-50 transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
          >
            I&apos;m a Teacher 👩‍🏫
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { icon: '🎯', title: 'Skill Practice', desc: 'Addition, subtraction, multiplication, and division at 5 difficulty levels' },
            { icon: '🏆', title: 'Leaderboards', desc: 'Compete with classmates on class and global leaderboards' },
            { icon: '⭐', title: 'Earn Badges', desc: 'Unlock achievement badges as you improve your math skills' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100"
            >
              <div className="text-3xl mb-2" aria-hidden="true">{feature.icon}</div>
              <h2 className="font-black text-[#1e3a5f] mb-1">{feature.title}</h2>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
