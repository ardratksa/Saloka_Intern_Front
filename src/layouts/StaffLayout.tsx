import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/api/auth'
import {
  LayoutDashboard,
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  UserCircle,
  KeyRound,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const NAV = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },

  {
    to: '/checklist',
    label: 'Checklist',
    icon: ClipboardCheck,
  },

  {
    to: '/issues',
    label: 'Issues',
    icon: AlertTriangle,
  },

  {
    to: '/work-plan',
    label: 'Work Plan',
    icon: Wrench,
  },
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
        <div className="flex items-center pl-2">
          <img
            src="/logo-saloka.png"
            alt="Saloka"
            className="h-8 w-auto"
          />
        </div>

        <DropdownMenu>

        <DropdownMenuTrigger asChild>
          <button
            className="
              w-12
              h-12
              rounded-2xl
              bg-white
              border
              border-gray-200
              shadow-sm
              flex
              items-center
              justify-center
            "
          >
            <UserCircle className="w-6 h-6 text-gray-600" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="
            w-56
            rounded-3xl
            bg-white
            border
            border-gray-200
            shadow-2xl
            p-2
            z-50
          "
        >

          {/* HEADER PROFILE */}
          <div className="px-3 py-2">
            <p className="font-semibold text-gray-900">
              {user?.name}
            </p>

            <p className="text-xs text-gray-500">
              Cleaning Service
            </p>
          </div>

          <DropdownMenuSeparator />

          {/* MENU */}
          <DropdownMenuItem
            className="rounded-xl cursor-pointer"
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Profil
          </DropdownMenuItem>

          <DropdownMenuItem
            className="rounded-xl cursor-pointer"
          >
            <KeyRound className="w-4 h-4 mr-2" />
            Ganti Password
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="
              rounded-xl
              cursor-pointer
              text-red-600
              focus:text-red-600
            "
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>

        </DropdownMenuContent>

      </DropdownMenu>
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