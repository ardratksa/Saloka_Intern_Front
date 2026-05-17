import api from '@/lib/axios'
import type { User, ActiveLocation } from '@/types'

// ✅ LOGIN (API TOKEN, TANPA CSRF)
export const login = async (email: string, password: string) => {
  const res = await api.post('/login', {
    email,
    password,
  })

  return res.data as { token: string; user: User }
}

// ✅ SCAN QR
export const scanQr = async (qr_code: string) => {
  const res = await api.post('/scan-qr', { qr_code })
  return res.data as { message: string; location: ActiveLocation }
}

// ✅ GET USER LOGIN
export const getMe = async () => {
  const res = await api.get('/me')
  return res.data as User
}

// ✅ LOGOUT
export const logout = async () => {
  await api.post('/logout')
}