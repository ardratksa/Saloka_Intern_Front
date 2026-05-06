import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { login } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ClipboardCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, token } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ kalau sudah login → redirect
  if (token) return <Navigate to="/checklist" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await login(email, password)

      setAuth(res.user, res.token)

      toast.success(`Selamat datang, ${res.user.name}!`)

      navigate('/scan')
    } catch (err: unknown) {
      let msg = 'Login gagal'

      // 🔥 FIX ERROR any → pakai axios type guard
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? msg
      }

      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Saloka CS</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cleaning Service Management
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">
            Masuk
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@saloks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700"
              disabled={loading}
            >
              {loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>

          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Saloka Cleaning Service © 2026
        </p>

      </div>
    </div>
  )
}