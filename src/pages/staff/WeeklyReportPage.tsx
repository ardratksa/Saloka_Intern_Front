import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWeeklyReport } from '@/api/weeklyReport'
import { Skeleton } from '@/components/ui/skeleton'
import {  AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

function getMonday(d = new Date()) {
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function WeeklyReportPage() {
  const [weekStart, setWeekStart] = useState(getMonday())

  const { data, isLoading } = useQuery({
    queryKey: ['weekly-report', weekStart],
    queryFn:  () => getWeeklyReport(weekStart),
  })

  const changeWeek = (direction: number) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + direction * 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Weekly Report</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Laporan mingguan semua lokasi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeWeek(-1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200
                       text-sm text-gray-600 hover:bg-gray-50"
          >
            ← Minggu lalu
          </button>
          <span className="text-sm font-medium text-gray-700 px-2">
            {weekStart} s/d {data?.week_end ?? '...'}
          </span>
          <button
            onClick={() => changeWeek(1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200
                       text-sm text-gray-600 hover:bg-gray-50"
          >
            Minggu depan →
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: 'Total Tugas',
                value: data.summary.total,
                color: 'text-gray-900',
              },
              {
                label: 'Selesai',
                value: data.summary.done,
                color: 'text-brand-600',
              },
              {
                label: 'Progress',
                value: `${data.summary.pct}%`,
                color: 'text-blue-600',
              },
              {
                label: 'Issues',
                value: data.summary.issues,
                color: 'text-red-500',
              },
            ].map(({ label, value, color }) => (
              <div key={label}
                   className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={cn('text-2xl font-bold', color)}>{value}</p>
              </div>
            ))}
          </div>

          {/* Daily progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Progress per Hari
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(data.daily_progress).map(([date, dp], i) => (
                <div key={date} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{DAY_LABELS[i]}</p>
                  <div className="h-16 bg-gray-100 rounded-lg relative overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-brand-500
                                 rounded-lg transition-all"
                      style={{ height: `${dp.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{dp.pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Period progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Progress per Periode
            </h3>
            <div className="space-y-2">
              {data.period_progress.map((p) => (
                <div key={p.period_id} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-20 shrink-0">
                    {p.period_name}
                    <span className="text-gray-400 block">
                      {p.time_start.slice(0, 5)}
                    </span>
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right shrink-0">
                    {p.done}/{p.total} ({p.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Status per Lokasi
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {data.location_progress.map((l) => (
                <div key={l.location_id}
                     className="flex items-center gap-3 py-1.5 border-b
                                border-gray-50 last:border-0">
                  <div className={cn(
                    'w-2 h-2 rounded-full shrink-0',
                    l.pct === 100
                      ? 'bg-green-500'
                      : l.pct > 0
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  )} />
                  <span className="text-xs text-gray-700 flex-1 truncate">
                    {l.location_name}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {l.type}
                  </span>
                  <span className="text-xs text-gray-500 w-16 text-right shrink-0">
                    {l.done}/{l.total}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues minggu ini */}
          {data.issues.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Issues Minggu Ini ({data.issues.length})
              </h3>
              <div className="space-y-2">
                {data.issues.map((issue) => (
                  <div key={issue.id}
                       className="flex items-center gap-3 py-2 border-b
                                  border-gray-50 last:border-0">
                    <div className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium shrink-0',
                      issue.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : issue.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    )}>
                      {issue.status === 'resolved'
                        ? 'Resolved'
                        : issue.status === 'in_progress'
                        ? 'In Progress'
                        : 'Open'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">
                        {issue.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {issue.location} · {issue.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}