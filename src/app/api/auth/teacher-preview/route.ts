import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { classes, students, teachers } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { signStudentSession } from '@/lib/auth/student-session'

export async function GET(request: NextRequest) {
  const classCode = request.nextUrl.searchParams.get('code')
  if (!classCode) return NextResponse.redirect(new URL('/teacher/dashboard', request.url))

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/auth/login/teacher', request.url))

  const teacher = await db.select().from(teachers).where(eq(teachers.authId, user.id)).limit(1).then((r) => r[0])
  if (!teacher) return NextResponse.redirect(new URL('/auth/login/teacher', request.url))

  const classRow = await db
    .select()
    .from(classes)
    .where(and(eq(classes.joinCode, classCode.toUpperCase()), eq(classes.teacherId, teacher.id)))
    .limit(1)
    .then((r) => r[0])
  if (!classRow) return NextResponse.redirect(new URL('/teacher/dashboard', request.url))

  const username = `teacher-preview-${teacher.id.slice(0, 8)}`
  let student = await db
    .select()
    .from(students)
    .where(and(eq(students.classId, classRow.id), eq(students.username, username)))
    .limit(1)
    .then((r) => r[0])
  if (!student) {
    student = await db
      .insert(students)
      .values({
        classId: classRow.id,
        username,
        displayName: `${teacher.displayName} (Preview)`,
        avatarSeed: username,
      })
      .returning()
      .then((r) => r[0])
  }

  const token = await signStudentSession({
    id: student.id,
    studentId: student.id,
    classId: student.classId ?? null,
    displayName: student.displayName,
    avatarSeed: student.avatarSeed,
    previewTeacher: true,
    teacherReturnPath: `/teacher/classes/${classRow.id}`,
  })

  const response = NextResponse.redirect(new URL('/student/dashboard', request.url))
  response.cookies.set('student_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return response
}
