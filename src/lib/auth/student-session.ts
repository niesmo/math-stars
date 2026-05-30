import { SignJWT, jwtVerify } from 'jose'
import type { StudentSession } from '@/types'

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'dev-secret-change-in-production'
)

export async function signStudentSession(session: StudentSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .setIssuedAt()
    .sign(SECRET)
}

export async function verifyStudentSession(token: string): Promise<StudentSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as StudentSession
  } catch {
    return null
  }
}
