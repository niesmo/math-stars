import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { practiceSessions } from '@/lib/db/schema'
import { verifyStudentSession } from '@/lib/auth/student-session'
import { cookies } from 'next/headers'
import type { SessionMode } from '@/types'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('student_session')?.value
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const session = await verifyStudentSession(token)
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: { skillLevelId?: unknown; mode?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  const { skillLevelId, mode } = body

  if (typeof skillLevelId !== 'string') {
    return NextResponse.json({ success: false, error: 'skillLevelId required' }, { status: 400 })
  }

  const [practiceSession] = await db
    .insert(practiceSessions)
    .values({
      studentId: session.studentId,
      skillLevelId,
      mode: (mode as SessionMode) ?? 'practice',
    })
    .returning()

  return NextResponse.json({ success: true, data: { sessionId: practiceSession.id } })
}
