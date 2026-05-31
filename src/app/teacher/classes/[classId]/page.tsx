import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { classes, competitions, teachers, students, studentProgress, skillLevels } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { JoinCodeDisplay } from '@/components/teacher/JoinCodeDisplay'
import { StudentProgressTable } from '@/components/teacher/StudentProgressTable'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ classId: string }>
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { classId } = await params

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

  const classRow = await db
    .select()
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1)
    .then((r) => r[0])

  if (!classRow || classRow.teacherId !== teacher.id) notFound()

  const studentRows = await db
    .select()
    .from(students)
    .where(eq(students.classId, classId))

  const allSkillLevels = await db.select().from(skillLevels)
  const classCompetitions = await db
    .select()
    .from(competitions)
    .where(eq(competitions.classId, classId))

  const studentsWithProgress = await Promise.all(
    studentRows.map(async (student) => {
      const progress = await db
        .select()
        .from(studentProgress)
        .where(eq(studentProgress.studentId, student.id))
      return {
        student,
        progress: progress.map((p) => ({
          ...p,
          skillLevel: allSkillLevels.find((sl) => sl.id === p.skillLevelId)!,
        })),
      }
    })
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-[#1e3a5f]">{classRow.name}</h1>
      </div>

      <JoinCodeDisplay code={classRow.joinCode} />
      <div className="flex flex-wrap gap-3">
        <Link
          href={`/api/auth/teacher-preview?code=${encodeURIComponent(classRow.joinCode)}`}
          className="px-4 py-2 bg-[#2563eb] text-white text-sm font-bold rounded-xl hover:bg-[#1d4ed8] transition-colors"
        >
          Try Student Experience
        </Link>
        <Link
          href={`/auth/login/student?code=${encodeURIComponent(classRow.joinCode)}`}
          className="px-4 py-2 bg-white border border-blue-200 text-[#1e3a5f] text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors"
        >
          Share Join Link
        </Link>
      </div>

      <section aria-labelledby="students-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="students-heading" className="text-lg font-black text-[#1e3a5f]">
            Students ({studentRows.length})
          </h2>
          <Link
            href={`/teacher/classes/${classId}/students/new`}
            className="px-3 py-1.5 bg-[#1e3a5f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3254] transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
          >
            + Add Student
          </Link>
        </div>

        {studentsWithProgress.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-gray-500">
            <p>No students yet. Share the join code above!</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <StudentProgressTable studentsWithProgress={studentsWithProgress} />
          </div>
        )}
      </section>

      <section aria-labelledby="competitions-heading" className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 id="competitions-heading" className="text-lg font-black text-[#1e3a5f]">Competitions</h2>
          <span className="text-sm text-gray-500">{classCompetitions.length} total</span>
        </div>
        <form action="/api/teacher/competitions" method="POST" className="grid sm:grid-cols-[1fr_180px_120px] gap-2 mb-4">
          <input type="hidden" name="classId" value={classRow.id} />
          <input name="title" required placeholder="Competition title" className="px-3 py-2 rounded-xl border border-gray-300" />
          <select name="skillLevelId" className="px-3 py-2 rounded-xl border border-gray-300">
            <option value="">Any skill level</option>
            {allSkillLevels.map((sl) => (
              <option key={sl.id} value={sl.id}>{sl.displayName}</option>
            ))}
          </select>
          <select name="mode" className="px-3 py-2 rounded-xl border border-gray-300">
            <option value="race">Race</option>
            <option value="practice">Practice</option>
          </select>
          <button type="submit" className="px-3 py-2 bg-[#1e3a5f] text-white rounded-xl font-bold">Create</button>
        </form>
        {classCompetitions.length === 0 ? (
          <p className="text-sm text-gray-500">No competitions yet for this class.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {classCompetitions.map((c) => (
              <div key={c.id} className="rounded-xl border border-blue-100 p-3">
                <div className="font-bold text-[#1e3a5f]">{c.title}</div>
                <div className="text-xs text-gray-600 capitalize">{c.mode} {c.skillLevelId ? '• assigned exercise' : '• all exercises'}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
