import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, ActiveLocation } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  activeLocation: ActiveLocation | null
  setAuth: (user: User, token: string) => void
  setActiveLocation: (location: ActiveLocation | null) => void
  clearAuth: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      activeLocation: null,

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token })
      },

      setActiveLocation: (location) => {
        set({ activeLocation: location })
      },

      clearAuth: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, activeLocation: null })
      },

      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'saloks-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        activeLocation: state.activeLocation,
      }),
    }
  )
)