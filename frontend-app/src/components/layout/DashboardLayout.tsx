import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/api/auth'
import {
  ClipboardCheck,
  AlertTriangle,
  Camera,
  BarChart2,
  Wrench,
  Settings,
  LogOut,
  QrCode,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navStaff = [
  { to: '/checklist',  label: 'Checklist',    icon: ClipboardCheck },
  { to: '/issues',     label: 'Issues',        icon: AlertTriangle },
  { to: '/sc-report',  label: 'SC Report',     icon: Camera },
  { to: '/work-plan',  label: 'Work Plan',     icon: Wrench },
]

const navAdmin = [
  { to: '/checklist',     label: 'Checklist',     icon: ClipboardCheck },
  { to: '/issues',        label: 'Issues',         icon: AlertTriangle },
  { to: '/sc-report',     label: 'SC Report',      icon: Camera },
  { to: '/work-plan',     label: 'Work Plan',      icon: Wrench },
  { to: '/weekly-report', label: 'Weekly Report',  icon: BarChart2 },
  { to: '/admin',         label: 'Admin Panel',    icon: Settings },
]

export default function DashboardLayout() {
  const { user, activeLocation, clearAuth, isAdmin } = useAuthStore()
  const navigate = useNavigate()

  const navItems = isAdmin() ? navAdmin : navStaff

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore
    } finally {
      clearAuth()
      navigate('/login')
      toast.success('Logout berhasil')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Saloka CS</p>
              <p className="text-xs text-gray-500">Cleaning Service</p>
            </div>
          </div>
        </div>

        {/* Active Location */}
        {activeLocation && (
          <div className="mx-3 mt-3 px-3 py-2 bg-brand-50 rounded-lg">
            <p className="text-xs text-brand-600 font-medium">Lokasi aktif</p>
            <p className="text-sm font-semibold text-brand-700 truncate">
              {activeLocation.name}
            </p>
            <p className="text-xs text-brand-600">{activeLocation.type_name}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100 space-y-2">
          {/* Scan QR button */}
          <button
            onClick={() => navigate('/scan')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                       text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            Scan QR Lokasi
          </button>

          {/* User info */}
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center
                justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}