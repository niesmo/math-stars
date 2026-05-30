import { db } from '@/lib/db'
import { skillLevels } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { PracticeSession } from '@/components/practice/PracticeSession'
import { cookies } from 'next/headers'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ skillId: string }>
  searchParams: Promise<{ mode?: string }>
}

export default async function PracticePage({ params, searchParams }: PageProps) {
  const { skillId } = await params
  const { mode } = await searchParams

  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) redirect('/auth/login/student')

  const session = await verifyStudentSession(token)
  if (!session) redirect('/auth/login/student')

  const skillLevel = await db
    .select()
    .from(skillLevels)
    .where(eq(skillLevels.id, skillId))
    .limit(1)
    .then((r) => r[0])

  if (!skillLevel) notFound()

  const sessionMode = mode === 'timed' ? 'timed' : mode === 'race' ? 'race' : 'practice'

  return (
    <div className="flex flex-col items-center gap-4 pt-4">
      <h1 className="text-2xl font-black text-[#1e3a5f] capitalize">
        {skillLevel.skill} — {skillLevel.difficulty}
      </h1>
      <PracticeSession
        skillLevel={skillLevel}
        mode={sessionMode}
        studentId={session.studentId}
      />
    </div>
  )
}
