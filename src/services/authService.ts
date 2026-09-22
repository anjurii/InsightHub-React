import type { SessionUser } from '../types'

const demoUser: SessionUser = {
  id: 'user-1',
  name: 'Alex Kim',
  email: 'alex@insighthub.dev',
  role: 'admin',
}

export async function login(email: string, password: string): Promise<SessionUser> {
  await new Promise((resolve) => window.setTimeout(resolve, 350))
  if (email !== demoUser.email || password !== 'demo123') {
    throw new Error('Invalid email or password. Try the demo credentials.')
  }
  return demoUser
}

export async function getSession(): Promise<SessionUser | null> {
  const stored = window.localStorage.getItem('insighthub-session')
  return stored ? (JSON.parse(stored) as SessionUser) : null
}
