import { useQuery } from '@tanstack/react-query'
import { getLocationTypes } from '@/api/location'
import { getPeriods } from '@/api/period'
import { getDailySummary } from '@/api/checklist'
import api from '@/lib/axios'
import {
  MapPin, Clock, Briefcase, Tag,
  ClipboardCheck, AlertTriangle,
  TrendingUp, CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const { data: types     = [] } = useQuery({
    queryKey: ['location-types'],
    queryFn:  getLocationTypes,
  })
  const { data: periods   = [] } = useQuery({
    queryKey: ['periods'],
    queryFn:  getPeriods,
  })
  const { data: jobs      = [] } = useQuery({
    queryKey: ['master-jobs'],
    queryFn:  () => api.get('/master-jobs').then((r) => r.data),
  })
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn:  () => api.get('/locations').then((r) => r.data),
  })
  const { data: daily, isLoading: dailyLoading } = useQuery({
    queryKey: ['daily-summary', today],
    queryFn:  () => getDailySummary(today),
    refetchInterval: 60_000, // auto refresh tiap 1 menit
  })
  const { data: issues = [] } = useQuery({
    queryKey: ['issues-open'],
    queryFn:  () => api.get('/issues', {
      params: { status: 'open' },
    }).then((r) => r.data),
  })

  // Hitung total progress hari ini
  const totalLoc   = (daily?.locations ?? []).length
  const doneLoc    = (daily?.locations ?? []).filter(
    (l: { progress: number }) => l.progress === 100
  ).length
  const totalTasks = (daily?.locations ?? []).reduce(
    (a: number, l: { total: number }) => a + l.total, 0
  )
  const doneTasks  = (daily?.locations ?? []).reduce(
    (a: number, l: { done: number }) => a + l.done, 0
  )
  const pct = totalTasks > 0
    ? Math.round((doneTasks / totalTasks) * 100)
    : 0

  const stats = [
    {
      label: 'Tipe Lokasi',
      value: types.length,
      icon:  Tag,
      bg:    'bg-purple-50',
      color: 'text-purple-600',
    },
    {
      label: 'Total Lokasi',
      value: locations.length,
      icon:  MapPin,
      bg:    'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      label: 'Periode Aktif',
      value: periods.filter((p: { is_active: boolean }) => p.is_active).length,
      icon:  Clock,
      bg:    'bg-green-50',
      color: 'text-green-600',
    },
    {
      label: 'Total Pekerjaan',
      value: jobs.length,
      icon:  Briefcase,
      bg:    'bg-orange-50',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric',
            month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      {/* Stats master */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label}
               className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
              bg
            )}>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress hari ini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress card */}
        <div className="md:col-span-2 bg-white rounded-xl border
                        border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-semibold text-gray-900">
                Progress Hari Ini
              </h2>
            </div>
            <span className="text-xs text-gray-400">{today}</span>
          </div>

          {/* Big progress */}
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-4xl font-bold text-brand-600">{pct}%</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {doneTasks} / {totalTasks} tugas selesai
              </p>
            </div>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Per lokasi - tampilkan 6 pertama */}
          {dailyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i}
                     className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(daily?.locations ?? [])
                .slice(0, 10)
                .map((l: {
                  location_id: number
                  location_name: string
                  type: string
                  done: number
                  total: number
                  progress: number
                  issue: number
                }) => (
                  <div key={l.location_id}
                       className="flex items-center gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      l.progress === 100
                        ? 'bg-green-500'
                        : l.progress > 0
                        ? 'bg-yellow-400'
                        : 'bg-gray-300'
                    )} />
                    <span className="text-xs text-gray-700 flex-1 truncate">
                      {l.location_name}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {l.done}/{l.total}
                    </span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${l.progress}%` }}
                      />
                    </div>
                    {l.issue > 0 && (
                      <span className="text-xs text-red-500 shrink-0">
                        {l.issue} isu
                      </span>
                    )}
                  </div>
                ))}
              {(daily?.locations ?? []).length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Belum ada checklist hari ini
                </p>
              )}
            </div>
          )}
        </div>

        {/* Issues open */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h2 className="text-sm font-semibold text-gray-900">
                Issues Open
              </h2>
            </div>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5
                             rounded-full font-medium">
              {issues.length}
            </span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {issues.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Tidak ada issue open</p>
              </div>
            ) : (
              issues.slice(0, 8).map((i: {
                id: number
                type: string
                location: string
                date: string
              }) => (
                <div key={i.id}
                     className="flex items-start gap-2 p-2 rounded-lg
                                bg-red-50 border border-red-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500
                                  shrink-0 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {i.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {i.location} · {i.date}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary lokasi selesai vs belum */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            Status Lokasi Hari Ini
          </h2>
          <span className="ml-auto text-xs text-gray-400">
            {doneLoc} / {totalLoc} lokasi selesai 100%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{doneLoc}</p>
            <p className="text-xs text-green-700 mt-0.5">Selesai (100%)</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">
              {(daily?.locations ?? []).filter(
                (l: { progress: number }) =>
                  l.progress > 0 && l.progress < 100
              ).length}
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">Sebagian</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-bold text-gray-500">
              {(daily?.locations ?? []).filter(
                (l: { progress: number }) => l.progress === 0
              ).length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Belum dimulai</p>
          </div>
        </div>
      </div>
    </div>
  )
}