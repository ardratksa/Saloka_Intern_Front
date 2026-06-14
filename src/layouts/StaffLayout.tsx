import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/api/auth'
import {
  ClipboardCheck,
  AlertTriangle,
  Camera,
  Wrench,
  User,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV = [
  { to: '/checklist', label: 'Checklist', icon: ClipboardCheck },
  { to: '/issues', label: 'Issues', icon: AlertTriangle },
  { to: '/sc-report', label: 'SC Report', icon: Camera },
  { to: '/work-plan', label: 'Work Plan', icon: Wrench },
  { to: '/profile', label: 'Profil', icon: User },
]

export default function StaffLayout() {
  const navigate = useNavigate()
  const { clearAuth, user } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      //
    } finally {
      clearAuth()
      toast.success('Logout berhasil')
      navigate('/login')
    }
  }

  return (
    <div
      className="flex flex-col h-dvh bg-gray-50 max-w-md mx-auto
                 relative overflow-hidden border-x border-gray-200"
    >
      {/* Top Header */}
      <header
        className="bg-white border-b border-gray-100 px-4 py-3
                   flex items-center justify-between shrink-0"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl bg-brand-600
                       flex items-center justify-center shadow-sm"
          >
            <ClipboardCheck className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-900">
              Saloka CS
            </h1>

            <p className="text-xs text-gray-500">
              {user?.name ?? 'Cleaning Service'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-xl border border-gray-200
                     flex items-center justify-center
                     hover:bg-red-50 hover:border-red-100
                     transition-all"
        >
          <LogOut className="w-4 h-4 text-red-500" />
        </button>
      </header>

      {/* Content */}
      <div
        className="
          flex-1
          overflow-y-auto
          pb-24
        "
      >
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto
                  bg-white/95 backdrop-blur border-t border-gray-200
                  z-20 safe-area-pb"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5',
                  'rounded-2xl transition-all min-w-14',
                  isActive
                    ? 'text-brand-600'
                    : 'text-gray-400'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-2xl flex items-center justify-center',
                      'transition-all duration-200',
                      isActive
                        ? 'bg-brand-50 shadow-sm'
                        : ''
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-all',
                        isActive
                          ? 'text-brand-600'
                          : 'text-gray-400'
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      'text-[10px] font-medium transition-all',
                      isActive
                        ? 'text-brand-600'
                        : 'text-gray-400'
                    )}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}