import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { students, skillLevels } from '@/lib/db/schema'
import { signStudentSession } from '@/lib/auth/student-session'
import { and, eq } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get('mode') === 'race' ? 'race' : 'practice'
  const skill = request.nextUrl.searchParams.get('skill')
  const difficulty = request.nextUrl.searchParams.get('difficulty')
  const firstSkill = skill && difficulty
    ? await db
        .select({ id: skillLevels.id })
        .from(skillLevels)
        .where(
          and(
            eq(skillLevels.skill, skill as 'addition' | 'subtraction' | 'multiplication' | 'division'),
            eq(skillLevels.difficulty, difficulty as 'beginner' | 'easy' | 'medium' | 'hard' | 'expert')
          )
        )
        .limit(1)
        .then((r) => r[0])
    : skill
    ? await db.select({ id: skillLevels.id }).from(skillLevels).where(eq(skillLevels.skill, skill as 'addition' | 'subtraction' | 'multiplication' | 'division')).limit(1).then((r) => r[0])
    : await db.select({ id: skillLevels.id }).from(skillLevels).limit(1).then((r) => r[0])
  if (!firstSkill) {
    return NextResponse.redirect(new URL('/auth/login/student', request.url))
  }

  const guestName = `Guest-${Math.floor(Math.random() * 10000)}`
  const guestUser = await db
    .insert(students)
    .values({
      classId: null,
      username: guestName.toLowerCase(),
      displayName: guestName,
      avatarSeed: guestName.toLowerCase(),
    })
    .returning()
    .then((r) => r[0])

  const token = await signStudentSession({
    id: guestUser.id,
    studentId: guestUser.id,
    classId: null,
    displayName: guestUser.displayName,
    avatarSeed: guestUser.avatarSeed,
  })

  const response = NextResponse.redirect(
    new URL(`/student/practice/${firstSkill.id}?mode=${mode}`, request.url)
  )
  response.cookies.set('student_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
  return response
}
