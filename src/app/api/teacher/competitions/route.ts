import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { competitions, teachers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const teacher = await db.select().from(teachers).where(eq(teachers.authId, user.id)).limit(1).then((r) => r[0])
  if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 })
  const rows = await db.select().from(competitions).where(eq(competitions.teacherId, teacher.id))
  return NextResponse.json({ success: true, data: rows })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  const teacher = await db.select().from(teachers).where(eq(teachers.authId, user.id)).limit(1).then((r) => r[0])
  if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 })
  const body = await request.json()
  const created = await db.insert(competitions).values({
    teacherId: teacher.id,
    classId: body.classId,
    title: body.title,
    description: body.description ?? null,
    mode: body.mode === 'race' ? 'race' : 'practice',
    isActive: true,
  }).returning()
  return NextResponse.json({ success: true, data: created[0] })
}
