import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { classes, teachers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
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

  let body: { name?: unknown; joinCode?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  const { name, joinCode } = body

  if (typeof name !== 'string' || typeof joinCode !== 'string') {
    return NextResponse.json({ success: false, error: 'Name and join code required' }, { status: 400 })
  }

  const [newClass] = await db
    .insert(classes)
    .values({ teacherId: teacher.id, name, joinCode: joinCode.toUpperCase() })
    .returning()

  return NextResponse.json({ success: true, data: newClass })
}

export async function GET(request: NextRequest) {
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

  const myClasses = await db.select().from(classes).where(eq(classes.teacherId, teacher.id))

  return NextResponse.json({ success: true, data: myClasses })
}
