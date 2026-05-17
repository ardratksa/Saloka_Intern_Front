import { useAuthStore } from '@/store/authStore'
import { logout } from '@/api/auth'
import { useNavigate } from 'react-router-dom'
import {
  LogOut, QrCode, User,
  ChevronRight, MapPin,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, activeLocation, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try { await logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
    toast.success('Logout berhasil')
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-brand-600 pt-12 pb-16 px-4">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center
                          justify-center text-white text-3xl font-bold mb-3">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-white text-xl font-bold">{user?.name}</h1>
          <span className="mt-1 text-xs bg-white/20 text-white px-3 py-1
                           rounded-full capitalize font-medium">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-6 space-y-4 pb-6">
        {/* Lokasi aktif */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                        overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase
                          tracking-wide">
              Lokasi Aktif
            </p>
          </div>
          {activeLocation ? (
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center
                              justify-center shrink-0">
                <MapPin className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {activeLocation.name}
                </p>
                <p className="text-xs text-gray-500">{activeLocation.type_name}</p>
              </div>
              <button
                onClick={() => navigate('/scan')}
                className="text-xs text-brand-600 font-medium"
              >
                Ganti
              </button>
            </div>
          ) : (
            <div className="px-4 py-4">
              <p className="text-sm text-gray-400 mb-3">
                Belum ada lokasi dipilih
              </p>
              <button
                onClick={() => navigate('/scan')}
                className="w-full flex items-center justify-center gap-2
                           bg-brand-600 text-white rounded-xl py-2.5
                           text-sm font-medium"
              >
                <QrCode className="w-4 h-4" />
                Scan QR Lokasi
              </button>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                        overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase
                          tracking-wide">
              Menu
            </p>
          </div>

          <button
            onClick={() => navigate('/scan')}
            className="w-full flex items-center gap-3 px-4 py-4
                       border-b border-gray-50 hover:bg-gray-50
                       transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center
                            justify-center">
              <QrCode className="w-5 h-5 text-blue-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800 text-left">
              Scan QR Lokasi
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-4
                       hover:bg-gray-50 transition-colors"
            onClick={() => toast('Fitur segera hadir')}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center
                            justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800 text-left">
              Edit Profil
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Info akun */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100
                        overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase
                          tracking-wide">
              Info Akun
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: 'Email',    value: user?.email   },
              { label: 'Role',     value: user?.role    },
              { label: 'No. WA',   value: user?.wa_number ?? '-' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between
                                          px-4 py-3">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2
                     bg-red-50 border border-red-100 text-red-600
                     rounded-2xl py-4 text-sm font-semibold
                     active:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>

        <p className="text-center text-xs text-gray-400">
          Saloks CS v1.0.0
        </p>
      </div>
    </div>
  )
}