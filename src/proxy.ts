import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyStudentSession } from '@/lib/auth/student-session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  // Teacher routes — require Supabase auth
  if (pathname.startsWith('/teacher')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login/teacher', request.url))
    }
  }

  // Student routes — require student JWT session
  if (pathname.startsWith('/student')) {
    const token = request.cookies.get('student_session')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login/student', request.url))
    }
    const session = await verifyStudentSession(token)
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login/student', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*'],
}
