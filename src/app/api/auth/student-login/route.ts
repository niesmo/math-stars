import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { classes, students } from '@/lib/db/schema'
import { signStudentSession } from '@/lib/auth/student-session'
import { eq, and, isNull } from 'drizzle-orm'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  let body: { classCode?: unknown; username?: unknown; pin?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const { classCode, username, pin } = body

  if (typeof username !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Username is required' },
      { status: 400 }
    )
  }

  const normalizedCode =
    typeof classCode === 'string' && classCode.trim().length > 0
      ? classCode.toUpperCase().trim()
      : null
  const normalizedUsername = username.toLowerCase().trim()

  let classRow: typeof classes.$inferSelect | undefined
  let student: typeof students.$inferSelect | undefined

  if (normalizedCode) {
    try {
      classRow = await db.select().from(classes).where(eq(classes.joinCode, normalizedCode)).limit(1).then((r) => r[0])
    } catch {
      return NextResponse.json(
        { success: false, error: 'Database connection failed. Check server configuration.' },
        { status: 500 }
      )
    }
  }
  if (normalizedCode && (!classRow || !classRow.isActive)) {
    return NextResponse.json({ success: false, error: 'Class not found. Check the code and try again.' }, { status: 404 })
  }

  try {
    student = await db
      .select()
      .from(students)
      .where(
        classRow
          ? and(eq(students.classId, classRow.id), eq(students.username, normalizedUsername))
          : and(isNull(students.classId), eq(students.username, normalizedUsername))
      )
      .limit(1)
      .then((r) => r[0])
  } catch {
    return NextResponse.json(
      { success: false, error: 'Database connection failed. Check server configuration.' },
      { status: 500 }
    )
  }

  if (!student) {
    student = await db
      .insert(students)
      .values({
        classId: classRow?.id ?? null,
        username: normalizedUsername,
        displayName: username.trim(),
        avatarSeed: normalizedUsername,
      })
      .returning()
      .then((r) => r[0])
  }

  if (!student) {
    return NextResponse.json(
      { success: false, error: 'Unable to create or load student account.' },
      { status: 500 }
    )
  }

  if (student.pinHash) {
    if (typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN required', requiresPin: true },
        { status: 401 }
      )
    }
    const submittedHash = createHash('sha256').update(pin).digest('hex')
    if (submittedHash !== student.pinHash) {
      return NextResponse.json(
        { success: false, error: 'Incorrect PIN' },
        { status: 401 }
      )
    }
  }

  const token = await signStudentSession({
    id: student.id,
    studentId: student.id,
    classId: student.classId ?? null,
    displayName: student.displayName,
    avatarSeed: student.avatarSeed,
  })

  const response = NextResponse.json({ success: true, data: { student } })
  response.cookies.set('student_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('student_session')
  return response
}
