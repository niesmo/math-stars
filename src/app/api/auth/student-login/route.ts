import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { classes, students } from '@/lib/db/schema'
import { signStudentSession } from '@/lib/auth/student-session'
import { eq, and } from 'drizzle-orm'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  let body: { classCode?: unknown; username?: unknown; pin?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const { classCode, username, pin } = body

  if (typeof classCode !== 'string' || typeof username !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Class code and username are required' },
      { status: 400 }
    )
  }

  const normalizedCode = classCode.toUpperCase().trim()
  const normalizedUsername = username.toLowerCase().trim()

  let classRow: typeof classes.$inferSelect | undefined
  let student: typeof students.$inferSelect | undefined

  try {
    classRow = await db
      .select()
      .from(classes)
      .where(and(eq(classes.joinCode, normalizedCode), eq(classes.isActive, true)))
      .limit(1)
      .then((r) => r[0])
  } catch {
    return NextResponse.json(
      { success: false, error: 'Database connection failed. Check server configuration.' },
      { status: 500 }
    )
  }

  if (!classRow) {
    return NextResponse.json(
      { success: false, error: 'Class not found. Check the code and try again.' },
      { status: 404 }
    )
  }

  try {
    student = await db
      .select()
      .from(students)
      .where(and(eq(students.classId, classRow.id), eq(students.username, normalizedUsername)))
      .limit(1)
      .then((r) => r[0])
  } catch {
    return NextResponse.json(
      { success: false, error: 'Database connection failed. Check server configuration.' },
      { status: 500 }
    )
  }

  if (!student) {
    return NextResponse.json(
      { success: false, error: 'Student not found. Ask your teacher to add you.' },
      { status: 404 }
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
    classId: student.classId,
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
