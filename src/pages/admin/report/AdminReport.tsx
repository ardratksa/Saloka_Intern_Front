import { useState } from 'react'
import { useQuery} from '@tanstack/react-query'
import {getWeeklyReport} from '@/api/weeklyReport'
import { DataTable } from '@/components/admin/DataTable'
import { exportReport } from '@/api/reportExport'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  AlertTriangle,
  Download,
  CalendarRange,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminReport() {
  const [showIssueModal, setShowIssueModal] = useState(false)

  const [selectedIssue, setSelectedIssue] = useState<any>(null)

  const [
    startDate,
    setStartDate,
  ] = useState<Date | null>(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
  )

  const [
    endDate,
    setEndDate,
  ] = useState<Date | null>(
    new Date()
  )

  const {
  data: report,
  isLoading,
} = useQuery({
  enabled: !!startDate && !!endDate,

  queryKey: [
    'report',
    startDate,
    endDate,
  ],

  queryFn: () =>
    getWeeklyReport(
      startDate!.toISOString().split('T')[0],
      endDate!.toISOString().split('T')[0]
    ),

  placeholderData: (prev) => prev,
})
      

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
              : 'bg-red-100 text-red-700'
          )}        >
          {i.status === 'resolved'
            ? 'Resolved'
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

  const checklistColumns = [

  {
    key: 'date',
    label: 'Tanggal',
  },

  {
    key: 'location',
    label: 'Lokasi',
  },

  {
    key: 'location_type',
    label: 'Tipe',
  },

  {
    key: 'period',
    label: 'Periode',
  },

  {
    key: 'pic',
    label: 'PIC',
  },

  {
    key: 'status',
    label: 'Status',
  },

]

const handleExport = async () => {

  if (!startDate || !endDate)
    return

  const blob =
    await exportReport(
      startDate
        .toISOString()
        .split('T')[0],

      endDate
        .toISOString()
        .split('T')[0]
    )

  const url =
    window.URL.createObjectURL(
      new Blob([blob])
    )

  const link =
    document.createElement('a')

  link.href = url

  link.download =
    'cleaning-report.xlsx'

  document.body.appendChild(
    link
  )

  link.click()

  link.remove()

  window.URL.revokeObjectURL(
    url
  )
}

return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Laporan Checklist
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Rekap checklist dan issue berdasarkan rentang tanggal
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border
                     border-gray-200 text-sm text-gray-600 hover:bg-gray-50
                     transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i}
                 className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : report? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              {
                label: 'Total Tugas',
                value: report?.summary.total,
                color: 'text-gray-900',
                bg:    'bg-gray-50',
              },
              {
                label: 'Selesai',
                value: report?.summary.done,
                color: 'text-brand-600',
                bg:    'bg-brand-50',
              },
              {
                label: 'Progress',
                value: `${report?.summary.pct}%`,
                color: 'text-blue-600',
                bg:    'bg-blue-50',
              },
              {
                label: 'Issues',
                value: report?.summary.issues,
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

              title="Checklist"

              headerLeft={

              <div className="relative">

                <CalendarRange
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    z-10
                    h-5
                    w-5
                    -translate-y-1/2
                    text-gray-400
                  "
                />

                <DatePicker

                  selectsRange

                  startDate={startDate}

                  endDate={endDate}

                  onChange={(dates) => {

                    const [start, end] = dates

                    if (!start && !end) {

                      setStartDate(
                        new Date(
                          new Date().getFullYear(),
                          new Date().getMonth(),
                          1
                        )
                      )

                      setEndDate(
                        new Date()
                      )

                      return
                    }

                    setStartDate(start)
                    setEndDate(end)

                  }}

                  placeholderText="Pilih Rentang Tanggal"

                  dateFormat="dd MMM yyyy"

                  className="
                    h-12
                    w-[340px]
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    pl-12
                    pr-4
                    text-sm
                    font-medium
                    outline-none
                  "

                />

              </div>

            }

              data={
                report?.checklists.map(
                  (c) => ({
                    ...c,
                    id: c.id,
                  })
                ) || []
              }

              columns={checklistColumns}

            />

          </div>

          {/* Issues table */}
          {report?.issues?.length > 0 && (
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
                title="Daftar Issue"
                data={
                  report?.issues.map(
                    (i) => ({
                      ...i,
                      id: i.id,
                    })
                  ) || []
                }
                columns={issueColumns}
                searchPlaceholder="Cari issue..."
                headerRight={
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />

                    <span className="text-sm text-red-600 font-medium">
                     {report?.issues?.length || 0} issue
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

            {selectedIssue.photos?.length > 0 && (

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-3
              "
            >

              {selectedIssue.photos.map(
                (photo: any) => (

                  <img

                    key={photo.id}

                    src={photo.image_url}

                    alt="Issue"

                    className="
                      h-40
                      w-full
                      object-cover
                      rounded-xl
                      cursor-pointer
                    "

                    onClick={() =>
                      window.open(
                        photo.image_url,
                        '_blank'
                      )
                    }

                  />

                )
              )}

            </div>

          )}

            <div className="mt-5">
              <label className="text-sm font-medium">
                Status
              </label>

            </div>

            <div className="mt-4">
                <b>Status:</b>
                {' '}
                {selectedIssue.status}
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
            </div>
          </div>
        </div>
        
      )}
    </div>
  )
}