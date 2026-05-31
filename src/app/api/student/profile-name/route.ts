import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyStudentSession, signStudentSession } from '@/lib/auth/student-session'
import { db } from '@/lib/db'
import { students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const session = await verifyStudentSession(token)
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const name = typeof body?.displayName === 'string' ? body.displayName.trim() : ''
  if (!name) return NextResponse.json({ success: false, error: 'Name required' }, { status: 400 })

  const updated = await db
    .update(students)
    .set({ displayName: name })
    .where(eq(students.id, session.studentId))
    .returning()
    .then((r) => r[0])

  const newToken = await signStudentSession({
    id: updated.id,
    studentId: updated.id,
    classId: updated.classId ?? null,
    displayName: updated.displayName,
    avatarSeed: updated.avatarSeed,
  })

  const response = NextResponse.json({ success: true, data: { displayName: updated.displayName } })
  response.cookies.set('student_session', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return response
}
