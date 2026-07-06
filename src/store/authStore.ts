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
        console.log('========== SET AUTH ==========')
        console.log('User:', user)
        console.log('Token:', token)
        console.log('Role:', user.role)

        localStorage.setItem('token', token)
        set({ user, token })

        console.log('State setelah setAuth:', get())
        console.log('==============================')
      },

      setActiveLocation: (location) => {
        console.log('========== SET ACTIVE LOCATION ==========')
        console.log(location)

        set({ activeLocation: location })

        console.log('State sekarang:', get())
        console.log('=========================================')
      },

      clearAuth: () => {
        console.log('========== CLEAR AUTH ==========')
        console.log('User sebelum logout:', get().user)

        localStorage.removeItem('token')
        set({ user: null, token: null, activeLocation: null })

        console.log('State setelah logout:', get())
        console.log('===============================')
      },

      isAdmin: () => {
        const user = get().user
        const result = user?.role === 'admin'

        console.log('========== IS ADMIN ==========')
        console.log('User:', user)
        console.log('Role:', user?.role)
        console.log('Result:', result)
        console.log('==============================')

        return result
      },
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