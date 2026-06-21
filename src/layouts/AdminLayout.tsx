import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { logout } from '@/api/auth'
import {
  LayoutDashboard,
  Clock,
  Tag,
  MapPin,
  Briefcase,
  BarChart2,
  ChevronDown,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { CalendarDays } from 'lucide-react'

const NAV = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/admin',
    exact: true,
  },
  
  {
    label: 'Data Master',
    icon: Tag,
    children: [
      {
        label: 'Periode',
        icon: Clock,
        to: '/admin/master/periode',
      },

      {
        label: 'Tipe Area',
        icon: Tag,
        to: '/admin/master/tipe',
      },

      {
        label: 'Lokasi',
        icon: MapPin,
        to: '/admin/master/lokasi',
      },

      {
        label: 'Pekerjaan',
        icon: Briefcase,
        to: '/admin/master/job',
      },

      {
        label: 'Master Issue',
        icon: Tag,
        to: '/admin/master/issue',
      },
    ],
  },
  {
    label: 'Program Kerja',
    icon: CalendarDays,

    children: [

      {
        label: 'On Plan',

        icon: CalendarDays,

        to: '/admin/program-kerja',
      },

      {
        label: 'Out Plan',

        icon: CalendarDays,

        to:
          '/admin/program-kerja/out-plan',
      },
    ],
  },
  {
    label: 'Report',
    icon: BarChart2,
    to: '/admin/report',
  },
]

export default function AdminLayout() {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] =
  useState<string[]>([
    'Data Master',
    'Program Kerja',
  ])
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    try { await logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
    toast.success('Logout berhasil')
  }

  return (
    <div className="flex h-screen bg-[#f5f7fb]">
            {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside
        className={cn(
          'bg-white flex flex-col transition-all duration-200 shadow-sm',
          'w-65'
        )}
        >
        {/* Logo */}
        <div className="h-24 flex items-center justify-center px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img
                src="/logo-saloka.png"
                alt="Saloka"
                className="h-12 object-contain transition-all duration-300"
              />
            </div>
          )}
        </div>

        {/* Nav */}

        <nav className="flex-1 px-3 py-2 space-y-1">

          {NAV.map((item) => {

            /*
            |--------------------------------------------------
            | DROPDOWN MENU
            |--------------------------------------------------
            */

            if (item.children?.length) {

              const isOpen =
                openMenus.includes(
                  item.label
                )

              return (

                <div key={item.label}>

                  <button

                    onClick={() => {

                      if (isOpen) {

                        setOpenMenus(
                          openMenus.filter(
                            (menu) =>
                              menu !== item.label
                          )
                        )

                        return
                      }

                      setOpenMenus([
                        ...openMenus,
                        item.label,
                      ])
                    }}

                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2.5',
                      'rounded-xl text-sm text-gray-600 hover:bg-gray-50',
                      'transition-colors'
                    )}
                  >

                    <item.icon className="w-4 h-4 shrink-0" />

                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">
                          {item.label}
                        </span>

                        {isOpen
                          ? (
                            <ChevronDown
                              className="w-3.5 h-3.5"
                            />
                          )
                          : (
                            <ChevronRight
                              className="w-3.5 h-3.5"
                            />
                          )
                        }
                      </>
                    )}
                  </button>

                  {isOpen && (

                    <div
                      className={cn(
                        'mt-1 space-y-1',
                        sidebarOpen
                          ? 'ml-4 pl-3 border-l border-gray-100'
                          : ''
                      )}
                    >

                      {item.children.map(
                        (child) => (

                          <NavLink

                            end

                            key={child.to}

                            to={child.to}

                            className={({
                              isActive,
                            }) =>
                              cn(
                                'flex items-center gap-2.5 px-3 py-2 rounded-xl',
                                'text-sm transition-colors',

                                isActive
                                  ? 'bg-[#f8f3df] text-[#d8a326] font-semibold'
                                  : 'text-gray-500 hover:bg-[#fafafa] hover:text-gray-800'
                              )
                            }
                          >

                            <child.icon className="w-3.5 h-3.5 shrink-0" />

                            {sidebarOpen &&
                              child.label}

                          </NavLink>
                        )
                      )}

                    </div>
                  )}
                </div>
              )
            }

            /*
            |--------------------------------------------------
            | NORMAL MENU
            |--------------------------------------------------
            */

            return (

              <NavLink

                key={item.to}

                to={item.to!}

                end={item.exact}

                className={({
                  isActive,
                }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-xl',
                    'text-sm transition-colors',

                    isActive
                      ? 'bg-[#f8f3df] text-[#d8a326] font-semibold border-l-[3px] border-[#d8a326]'
                      : 'text-gray-500 hover:bg-[#fafafa]'
                  )
                }
              >

                <item.icon className="w-4 h-4 shrink-0" />

                {sidebarOpen &&
                  item.label}

              </NavLink>
            )
          })}

        </nav>

        {/* Footer */}

        <div className="mt-auto px-4 pb-4">

          <button
            onClick={handleLogout}
            className="w-full h-10 flex items-center justify-center
                      rounded-xl text-gray-400
                      hover:bg-red-50 hover:text-red-500
                      transition-all duration-200"
            title="Logout"
          >

            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
<header
  className="h-18 bg-white border-b border-[#ececec]
             flex items-center px-6 shrink-0"
>
  <div className="flex flex-col">
    <h1 className="text-sm font-semibold text-gray-800">
      Cleaning Service
    </h1>

    <p className="text-xs text-gray-400">
      Saloka Internal Dashboard
    </p>
  </div>
</header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-12 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}