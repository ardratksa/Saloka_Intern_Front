import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { login } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth, token, user } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // redirect jika sudah login
  if (token) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />
    }

    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await login(email, password)

      setAuth(res.user, res.token)

      console.log(useAuthStore.getState())

      toast.success(`Selamat datang, ${res.user.name}!`)

      if (res.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }

    } catch (err: unknown) {
      let msg = 'Login gagal'

      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message ?? msg
      }

      toast.error(msg)

    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/Saloka_bg.jpeg')",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />

      {/* content */}
      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/logo-saloka.png"
            alt="Saloka"
            className="h-25 mx-auto mb-4 object-contain drop-shadow-sm"
          />

          <h1 className="text-2xl font-bold text-[#1f2937]">
            Cleaning Service
          </h1>

          <p className="text-gray-500 mt-1">
            Internal Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-md border border-white/60
                        shadow-2xl rounded-4xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-5 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800">
              Masuk
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Silakan login untuk melanjutkan
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-8 space-y-5"
          >

            <div>
              <Label
                htmlFor="email"
                className="text-gray-700"
              >
                Email
              </Label>

              <Input
                id="email"
                type="email"
                placeholder="Masukan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 h-12 rounded-xl border-gray-200
                           focus:border-brand-600 focus:ring-brand-600"
              />
            </div>

            <div>
              <Label
                htmlFor="password"
                className="text-gray-700"
              >
                Password
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="Masukan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 h-12 rounded-xl border-gray-200
                           focus:border-brand-600 focus:ring-brand-600"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-base font-semibold
                         bg-brand-600 hover:bg-brand-700 shadow-lg
                         shadow-green-100"
            >
              {loading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}

              {loading ? 'Masuk...' : 'Masuk'}
            </Button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Saloka Cleaning Service © 2026
        </p>

      </div>
    </div>
  )
}