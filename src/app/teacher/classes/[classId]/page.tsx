import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { classes, teachers, students, studentProgress, skillLevels } from '@/lib/db/schema'
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
    </div>
  )
}
