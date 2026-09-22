import { getSession, login } from './authService'

describe('authService', () => {
  beforeEach(() => window.localStorage.clear())

  it('accepts the documented demo credentials', async () => {
    await expect(login('alex@insighthub.dev', 'demo123')).resolves.toMatchObject({ role: 'admin' })
  })

  it('rejects invalid credentials', async () => {
    await expect(login('wrong@example.com', 'bad-password')).rejects.toThrow('Invalid email or password')
  })

  it('reads the persisted session', async () => {
    window.localStorage.setItem('insighthub-session', JSON.stringify({ id: '1', name: 'Test', email: 'test@example.com', role: 'analyst' }))
    await expect(getSession()).resolves.toMatchObject({ name: 'Test' })
  })
})
