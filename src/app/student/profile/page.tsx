import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { StarIcon } from '@/components/ui/StarIcon'
import Link from 'next/link'

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) redirect('/auth/login/student')

  const session = await verifyStudentSession(token)
  if (!session) redirect('/auth/login/student')

  const student = await db
    .select()
    .from(students)
    .where(eq(students.id, session.studentId))
    .limit(1)
    .then((r) => r[0])

  if (!student) redirect('/auth/login/student')

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
        <div
          className="w-20 h-20 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-4xl font-black mx-auto mb-3"
          aria-hidden="true"
        >
          {student.displayName.charAt(0).toUpperCase()}
        </div>
        <h1 className="text-2xl font-black text-[#1e3a5f]">{student.displayName}</h1>

        <div className="flex items-center justify-center gap-2 mt-3">
          <StarIcon size={20} />
          <span className="text-xl font-bold text-[#1e3a5f]">
            {student.totalStars ?? 0} stars
          </span>
        </div>
      </div>

      <form action="/api/auth/student-login" method="DELETE">
        <Link
          href="/auth/login/student"
          className="block w-full py-3 text-center bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
          onClick={async () => {
            await fetch('/api/auth/student-login', { method: 'DELETE' })
          }}
        >
          Sign Out
        </Link>
      </form>
    </div>
  )
}
