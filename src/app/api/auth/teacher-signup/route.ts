import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { teachers } from '@/lib/db/schema'

export async function POST(request: NextRequest) {
  let body: { email?: unknown; password?: unknown; displayName?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })
  }

  const { email, password, displayName } = body

  if (typeof email !== 'string' || typeof password !== 'string' || typeof displayName !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Email, password, and display name are required' },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return NextResponse.json(
      { success: false, error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })

  if (authError || !data.user) {
    return NextResponse.json(
      { success: false, error: authError?.message ?? 'Sign up failed' },
      { status: 400 }
    )
  }

  await db.insert(teachers).values({
    authId: data.user.id,
    email,
    displayName,
  })

  return NextResponse.json({ success: true })
}
