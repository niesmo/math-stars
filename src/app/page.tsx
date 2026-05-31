import Link from 'next/link'
import { LiveLeaderboard } from '@/components/landing/LiveLeaderboard'

export default function LandingPage() {
  return (
    <main className="min-h-screen px-4 py-10 bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%)]">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
        <section className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-bold text-[#1e3a5f] mb-4">
            LIVE COMPETITION
          </div>
          <h1 className="text-5xl font-black text-[#1e3a5f] leading-tight">
            Math Stars
          </h1>
          <p className="text-lg text-[#1e3a5f]/75 mt-3 max-w-xl">
            Fast math rounds, streak multipliers, and leaderboard races that keep students pushing.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <Link
              href="/auth/quick-start?mode=practice"
              className="px-6 py-4 bg-[#1e3a5f] text-white text-base font-bold rounded-2xl hover:bg-[#1a3254] transition-colors text-center"
            >
              Start Practice
            </Link>
            <Link
              href="/auth/quick-start?mode=race"
              className="px-6 py-4 bg-[#2563eb] text-white text-base font-bold rounded-2xl hover:bg-[#1d4ed8] transition-colors text-center"
            >
              Start 60s Race
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Link
              href="/auth/login/student"
              className="px-6 py-3 bg-white text-[#1e3a5f] border-2 border-[#1e3a5f] font-bold rounded-2xl hover:bg-blue-50 transition-colors text-center"
            >
              Student Login
            </Link>
            <Link
              href="/auth/login/teacher"
              className="px-6 py-3 bg-white text-[#1e3a5f] border-2 border-blue-200 font-bold rounded-2xl hover:bg-blue-50 transition-colors text-center"
            >
              Teacher Login
            </Link>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-6 shadow-lg border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-[#1e3a5f]">Live Leaderboard</h2>
            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Updating</span>
          </div>
          <LiveLeaderboard />
        </section>
      </div>
      <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
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
    </main>
  )
}
