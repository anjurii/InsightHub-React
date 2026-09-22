import { create } from 'zustand'
import type { SessionUser } from '../types'

type AuthState = {
  user: SessionUser | null
  setUser: (user: SessionUser | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => {
    if (user) window.localStorage.setItem('insighthub-session', JSON.stringify(user))
    else window.localStorage.removeItem('insighthub-session')
    set({ user })
  },
  logout: () => {
    window.localStorage.removeItem('insighthub-session')
    set({ user: null })
  },
}))
