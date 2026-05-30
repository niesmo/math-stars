import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { classes, teachers, students } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  const { classId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const teacher = await db
    .select()
    .from(teachers)
    .where(eq(teachers.authId, user.id))
    .limit(1)
    .then((r) => r[0])

  if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 })

  const classRow = await db
    .select()
    .from(classes)
    .where(eq(classes.id, classId))
    .limit(1)
    .then((r) => r[0])

  if (!classRow || classRow.teacherId !== teacher.id) {
    return NextResponse.json({ success: false, error: 'Class not found' }, { status: 404 })
  }

  let body: { displayName?: unknown; username?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  const { displayName, username } = body

  if (typeof displayName !== 'string' || typeof username !== 'string') {
    return NextResponse.json({ success: false, error: 'Display name and username required' }, { status: 400 })
  }

  const normalizedUsername = username.toLowerCase().trim()
  const avatarSeed = Math.random().toString(36).substring(2, 10)

  const [newStudent] = await db
    .insert(students)
    .values({
      classId,
      displayName,
      username: normalizedUsername,
      avatarSeed,
    })
    .returning()

  return NextResponse.json({ success: true, data: newStudent })
}
