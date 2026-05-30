import Link from 'next/link'

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#1e3a5f] text-white px-4 py-3 shadow-md">
        <nav className="max-w-4xl mx-auto flex items-center justify-between" aria-label="Teacher navigation">
          <Link href="/teacher/dashboard" className="text-xl font-black tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
            ⭐ Math Stars — Teacher
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/teacher/classes"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              My Classes
            </Link>
            <Link
              href="/teacher/settings"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Settings
            </Link>
            <form action="/api/auth/teacher-logout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Logout
              </button>
            </form>
          </div>
        </nav>
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
