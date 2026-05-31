import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { classes, competitions, teachers } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

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
  try {
    const referer = request.headers.get('referer') ?? '/teacher/dashboard'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    const teacher = await db.select().from(teachers).where(eq(teachers.authId, user.id)).limit(1).then((r) => r[0])
    if (!teacher) return NextResponse.json({ success: false, error: 'Teacher not found' }, { status: 404 })
    const contentType = request.headers.get('content-type') ?? ''
    const body = contentType.includes('application/json')
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries())
    if (typeof body?.title !== 'string' || typeof body?.classId !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'title and class are required' }, { status: 400 })
    }
    const classInput = body.classId.trim()
    const classRow = await db
      .select()
      .from(classes)
      .where(
        and(
          eq(classes.teacherId, teacher.id),
          classInput.length === 36 ? eq(classes.id, classInput) : eq(classes.joinCode, classInput.toUpperCase())
        )
      )
      .limit(1)
      .then((r) => r[0])
    if (!classRow) {
      return NextResponse.json({ success: false, error: 'Class not found for this teacher.' }, { status: 404 })
    }
    const created = await db.insert(competitions).values({
      teacherId: teacher.id,
      classId: classRow.id,
      title: body.title.trim(),
      description: typeof body?.description === 'string' ? body.description : null,
      mode: body.mode === 'race' ? 'race' : 'practice',
      skillLevelId: typeof body?.skillLevelId === 'string' && body.skillLevelId.length > 0 ? body.skillLevelId : null,
      isActive: true,
    }).returning()
    const accept = request.headers.get('accept') ?? ''
    const isFormPost = contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')
    const wantsJson = accept.includes('application/json') && !isFormPost
    if (wantsJson) {
      return NextResponse.json({ success: true, data: created[0] })
    }
    return NextResponse.redirect(new URL(referer, request.url))
  } catch (error) {
    return NextResponse.json({ success: false, error: `Failed to create competition.${error instanceof Error ? ` ${error.message}` : ''}` }, { status: 500 })
  }
}
