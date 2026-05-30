import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { classes, teachers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login/teacher')

  const teacher = await db
    .select()
    .from(teachers)
    .where(eq(teachers.authId, user.id))
    .limit(1)
    .then((r) => r[0])

  if (!teacher) redirect('/auth/login/teacher')

  const myClasses = await db
    .select()
    .from(classes)
    .where(eq(classes.teacherId, teacher.id))

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] rounded-3xl p-6 text-white">
        <h1 className="text-2xl font-black">Welcome back, {teacher.displayName}! 👋</h1>
        <p className="text-blue-200 mt-1 text-sm">
          {myClasses.length} {myClasses.length === 1 ? 'class' : 'classes'} active
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-[#1e3a5f]">My Classes</h2>
        <Link
          href="/teacher/classes/new"
          className="px-4 py-2 bg-[#1e3a5f] text-white text-sm font-bold rounded-xl hover:bg-[#1a3254] transition-colors
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
        >
          + New Class
        </Link>
      </div>

      {myClasses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
          <div className="text-4xl mb-3" aria-hidden="true">🏫</div>
          <p className="font-semibold text-[#1e3a5f]">No classes yet</p>
          <p className="text-sm text-gray-500 mt-1">Create your first class to get started</p>
          <Link
            href="/teacher/classes/new"
            className="inline-block mt-4 px-6 py-2 bg-[#1e3a5f] text-white font-bold rounded-xl hover:bg-[#1a3254] transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
          >
            Create a Class
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {myClasses.map((cls) => (
            <Link
              key={cls.id}
              href={`/teacher/classes/${cls.id}`}
              className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100 hover:shadow-md hover:-translate-y-0.5 transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-black text-[#1e3a5f]">{cls.name}</h3>
                  <div className="font-mono text-sm text-gray-500 mt-1">{cls.joinCode}</div>
                </div>
                <div className="text-2xl" aria-hidden="true">🏫</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
