import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/login/student', request.url))
  response.cookies.delete('student_session')
  return response
}
