import authFixture from '../mocks/data/auth.json'
import type { SessionUser } from '../types'
import { z } from 'zod'

const authSchema = z.object({
  credentials: z.object({ email: z.string().email(), password: z.string() }),
  user: z.object({ id: z.string(), name: z.string(), email: z.string().email(), role: z.enum(['admin', 'analyst']) }),
})
const demoAuth = authSchema.parse(authFixture)

export async function login(email: string, password: string): Promise<SessionUser> {
  await new Promise((resolve) => window.setTimeout(resolve, 350))
  if (email !== demoAuth.credentials.email || password !== demoAuth.credentials.password) {
    throw new Error('Invalid email or password. Try the demo credentials.')
  }
  return demoAuth.user
}

export async function getSession(): Promise<SessionUser | null> {
  const stored = window.localStorage.getItem('insighthub-session')
  return stored ? (JSON.parse(stored) as SessionUser) : null
}
