import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Loader2 } from 'lucide-react'

export default function LoginFromSaloka() {

  const navigate = useNavigate()

  const { setAuth } = useAuthStore()

  useEffect(() => {

    const params = new URLSearchParams(window.location.search)

    const email = params.get('email')

    const password = params.get('password')

    if (!email || !password) {

      toast.error('Email atau password tidak ditemukan.')

      navigate('/login', { replace: true })

      return

    }

    const autoLogin = async () => {

      try {

        const res = await login(email, password)

        setAuth(res.user, res.token)

        toast.success(
          `Selamat datang, ${res.user.name}!`
        )

        if (res.user.role === 'admin') {

          navigate('/admin', {
            replace: true,
          })

        } else {

          navigate('/dashboard', {
            replace: true,
          })

        }

      } catch (err: unknown) {

        let msg = 'Login gagal'

        if (axios.isAxiosError(err)) {

          msg =
            err.response?.data?.message ??
            msg

        }

        toast.error(msg)

        navigate('/login', {
          replace: true,
        })

      }

    }

    autoLogin()

  }, [navigate, setAuth])

  return (

    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-white
      "
    >

      <div className="text-center">

        <Loader2
          className="
            w-10
            h-10
            mx-auto
            animate-spin
            text-brand-600
          "
        />

        <h2
          className="
            mt-5
            text-xl
            font-semibold
          "
        >
          Login dari Saloka...
        </h2>

        <p className="text-gray-500 mt-2">

          Mohon tunggu sebentar

        </p>

      </div>

    </div>

  )

}