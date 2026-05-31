import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  const session = token ? await verifyStudentSession(token) : null
  const homeHref = session?.classId ? '/student/dashboard' : '/'

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#1e3a5f] text-white px-4 py-3 shadow-md">
        <nav className="max-w-2xl mx-auto flex items-center justify-between" aria-label="Student navigation">
          <Link href={homeHref} className="text-xl font-black tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">
            ⭐ Math Stars
          </Link>
          <div className="flex items-center gap-1">
            {session?.previewTeacher && session.teacherReturnPath && (
              <Link
                href={session.teacherReturnPath}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/20 hover:bg-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Back to Teacher
              </Link>
            )}
            <Link
              href="/student/leaderboard"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Leaderboard"
            >
              Leaderboard
            </Link>
            <Link
              href="/student/profile"
              className="px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Profile"
            >
              Profile
            </Link>
            <form action="/api/auth/student-logout" method="POST">
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
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
