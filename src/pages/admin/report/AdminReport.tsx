import { useState } from 'react'
import { useQuery, useMutation, useQueryClient, } from '@tanstack/react-query'
import { getIssues, updateIssueStatus, } from '@/api/issue'
import toast from 'react-hot-toast'
import { DataTable } from '@/components/admin/DataTable'
import { AlertTriangle, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Issue } from '@/types'

function getMonday(d = new Date()) {
  const day  = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

export default function AdminReport() {
  const [showIssueModal, setShowIssueModal] = useState(false)

  const [selectedIssue, setSelectedIssue] = useState<any>(null)

  const [selectedStatus, setSelectedStatus] = useState('')

  const [weekStart, setWeekStart] = useState(getMonday())

  const queryClient = useQueryClient()

  const { data: issues = [] } = useQuery<Issue[]>({
    queryKey: ['issues'],
    queryFn: () => getIssues({}),
  })

  const updateStatusMut = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number
      status: 'open' | 'in_progress' | 'resolved'
    }) => updateIssueStatus(id, status),

    onSuccess: () => {
      toast.success('Status berhasil diperbarui')

      queryClient.invalidateQueries({
        queryKey: ['issues'],
      })

      setShowIssueModal(false)
    },

    onError: () => {
      toast.error('Gagal update status')
    },
  })

  const dummyData = {

    week_end: '2026-06-07',

    summary: {
      total: 128,
      done: 102,
      pct: 80,
      issues: 8,
    },

    daily_progress: {

      sen:{ done:18,total:20,pct:90 },
      sel:{ done:17,total:20,pct:85 },
      rab:{ done:15,total:20,pct:75 },
      kam:{ done:20,total:20,pct:100 },
      jum:{ done:18,total:20,pct:90 },
      sab:{ done:12,total:20,pct:60 },
      min:{ done:10,total:20,pct:50 },

    },

    period_progress: [

      {
        period_id: 1,
        period_name: 'Pagi 1',
        time_start: '09:00',
        done: 18,
        total: 20,
        pct: 90,
      },

      {
        period_id: 2,
        period_name: 'Pagi 2',
        time_start: '11:00',
        done: 16,
        total: 20,
        pct: 80,
      },

      {
        period_id: 3,
        period_name: 'Siang',
        time_start: '14:00',
        done: 14,
        total: 20,
        pct: 70,
      },

      {
        period_id: 4,
        period_name: 'Sore',
        time_start: '17:00',
        done: 20,
        total: 20,
        pct: 100,
      },
    ],

    location_progress: [

      {
        location_id: 1,
        location_name: 'Toilet Kamayayi',
        type: 'Toilet',
        done: 18,
        total: 20,
        pct: 90,
        issue: 0,
      },

      {
        location_id: 2,
        location_name: 'Toilet Down Town',
        type: 'Toilet',
        done: 15,
        total: 20,
        pct: 75,
        issue: 2,
      },

      {
        location_id: 3,
        location_name: 'Toilet Joglo',
        type: 'Toilet',
        done: 20,
        total: 20,
        pct: 100,
        issue: 0,
      },
    ],

  }

  const data = dummyData
  const isLoading = false

  const reportData =
  dummyData

  const changeWeek = (dir: number) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + dir * 7)
    setWeekStart(d.toISOString().split('T')[0])
  }

  const issueColumns = [
    { key: 'type', label: 'Jenis Issue' },
    { key: 'location', label: 'Lokasi' },
    { key: 'reported_by', label: 'Dilaporkan' },
    { key: 'date', label: 'Tanggal' },

    {
      key: 'status',
      label: 'Status',
      render: (i: any) => (
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            i.status === 'resolved'
              ? 'bg-green-100 text-green-700'
              : i.status === 'in_progress'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          )}        >
          {i.status === 'resolved'
            ? 'Resolved'
            : i.status === 'in_progress'
            ? 'In Progress'
            : 'Open'}
        </span>
      ),
    },

    {
      key: 'action',
      label: 'Aksi',
      render: (i: any) => (
        <button
          onClick={() => {
            setSelectedIssue(i)
            setSelectedStatus(i.status)
            setShowIssueModal(true)
          }}
          className="
            px-3 py-1
            rounded-lg
            bg-brand-600
            text-white
            text-xs
            font-medium
          "
        >
          Detail
        </button>
      ),
    },
  ]

  const locColumns = [
    { key: 'location_name', label: 'Lokasi' },
    { key: 'type',          label: 'Tipe'   },
    {
      key: 'progress',
      label: 'Progress',
      render: (l: { done: number; total: number; pct: number }) => (
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full"
              style={{ width: `${l.pct}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">
            {l.done}/{l.total} ({l.pct}%)
          </span>
        </div>
      ),
    },
    {
      key: 'issue',
      label: 'Issues',
      render: (l: { issue: number }) =>
        l.issue > 0 ? (
          <span className="text-xs text-red-600 font-medium">
            {l.issue} issue
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ]

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Laporan Mingguan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Rekap checklist, progress, dan issues per minggu
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border
                     border-gray-200 text-sm text-gray-600 hover:bg-gray-50
                     transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-3 bg-white rounded-xl
                      border border-gray-200 p-3">
        <button
          onClick={() => changeWeek(-1)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm
                     text-gray-600 hover:bg-gray-50 transition-colors"
        >
          ← Minggu lalu
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-medium text-gray-900">
            {weekStart} — {data.week_end}
          </p>
        </div>
        <button
          onClick={() => changeWeek(1)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm
                     text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Minggu depan →
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i}
                 className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: 'Total Tugas',
                value: data.summary.total,
                color: 'text-gray-900',
                bg:    'bg-gray-50',
              },
              {
                label: 'Selesai',
                value: data.summary.done,
                color: 'text-brand-600',
                bg:    'bg-brand-50',
              },
              {
                label: 'Progress',
                value: `${data.summary.pct}%`,
                color: 'text-blue-600',
                bg:    'bg-blue-50',
              },
              {
                label: 'Issues',
                value: data.summary.issues,
                color: 'text-red-500',
                bg:    'bg-red-50',
              },
              {
                label: 'Rata-rata Skor',
                value: '88%',
                color: 'text-green-700',
                bg: 'bg-green-50',
              },
            ].map(({ label, value, color, bg }) => (
              <div key={label}
                   className={cn(
                     'rounded-xl border border-gray-200 p-4', bg
                   )}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={cn('text-2xl font-bold', color)}>{value}</p>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Progress per Hari
            </h3>
            <div className="grid grid-cols-7 gap-3">
              {Object.entries(data.daily_progress).map(
                ([date, dp], i) => (
                  <div key={date} className="text-center">
                    <p className="text-xs text-gray-400 mb-1">
                      {DAY_LABELS[i]}
                    </p>
                    <div className="h-20 bg-gray-100 rounded-lg relative
                                    overflow-hidden">
                      <div
                        className={cn(
                          'absolute bottom-0 left-0 right-0 rounded-lg',
                          'transition-all',
                          dp.pct === 100
                            ? 'bg-brand-600'
                            : dp.pct > 0
                            ? 'bg-brand-400'
                            : 'bg-gray-200'
                        )}
                        style={{ height: `${dp.pct}%` }}
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700 mt-1">
                      {dp.pct}%
                    </p>
                    <p className="text-xs text-gray-400">
                      {dp.done}/{dp.total}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Period progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Progress per Periode
            </h3>
            <div className="space-y-3">
              {data.period_progress.map((p) => (
                <div key={p.period_id}
                     className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <p className="text-xs font-medium text-gray-700">
                      {p.period_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.time_start.slice(0, 5)}
                    </p>
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full
                                  overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-32 text-right shrink-0">
                    {p.done}/{p.total} ({p.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location progress table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <DataTable
              title="Status per Lokasi"
              data={data.location_progress.map((l) => ({
                ...l,
                id: l.location_id,
              }))}
              columns={locColumns}
              searchPlaceholder="Cari lokasi..."
            />
          </div>

          {/* Issues table */}
          {issues.length > 0 && (
            <div
              className="
                bg-white
                rounded-xl
                border
                border-gray-200
                overflow-hidden
              "
            >
              <DataTable
                title="Issues Minggu Ini"
                data={issues.map((i) => ({
                  ...i,
                  id: i.id,
                }))}
                columns={issueColumns}
                searchPlaceholder="Cari issue..."
                headerRight={
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />

                    <span className="text-sm text-red-600 font-medium">
                      {issues.length} issue
                    </span>
                  </div>
                }
              />
            </div>
          )}
        </>
      ) : null}

      {showIssueModal && selectedIssue && (
        <div
          className="
            fixed inset-0
            bg-black/40
            flex items-center justify-center
            z-50
          "
        >
          <div
            className="
              bg-white
              rounded-2xl
              w-full
              max-w-lg
              p-6
            "
          >
            <h3 className="text-lg font-bold mb-4">
              Detail Issue
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <b>Jenis:</b> {selectedIssue.type}
              </div>

              <div>
                <b>Lokasi:</b> {selectedIssue.location}
              </div>

              <div>
                <b>Pelapor:</b> {selectedIssue.reported_by}
              </div>

              <div>
                <b>Tanggal:</b> {selectedIssue.date}
              </div>
            </div>

            <div className="mt-5">
              <label className="text-sm font-medium">
                Status
              </label>

              <select
                className="
                  mt-2
                  w-full
                  border
                  rounded-lg
                  h-11
                  px-3
                "
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
              >
                <option value="open">
                  Open
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="resolved">
                  Resolved
                </option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIssueModal(false)}
                className="
                  flex-1
                  h-11
                  border
                  rounded-lg
                "
              >
                Tutup
              </button>

              <button
                onClick={() =>
                  updateStatusMut.mutate({
                    id: selectedIssue.id,
                    status: selectedStatus as
                      | 'open'
                      | 'in_progress'
                      | 'resolved',
                  })
                }
                disabled={updateStatusMut.isPending}
                className="
                  flex-1
                  h-11
                  bg-green-600
                  text-white
                  rounded-lg
                "
              >
                {updateStatusMut.isPending
                  ? 'Menyimpan...'
                  : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}