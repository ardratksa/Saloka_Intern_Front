import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDailySummary } from '@/api/checklist'
import { getIssues } from '@/api/issue'
import { getLocations } from '@/api/location'
import { getPeriods } from '@/api/period'
import { getLocationTypes } from '@/api/location'
import { exportDashboard } from '@/api/dashboard'
import { saveAs } from 'file-saver'
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Eye,
  Download,
} from 'lucide-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { cn } from '@/lib/utils'

type Session = {
  id: number
  date: string
  time: string
  location: string
  location_type: string
  shift: string
  shift_time: string
  pic: string
  total: number
  done: number
  issue: number
  score: number
  status: 'OK' | 'Tidak Ok'
}

export default function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(today)
  const [filterLoc, setFilterLoc] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [openLocation, setOpenLocation] = useState(false)
  const [filterShift, setFilterShift] = useState('all')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [detail, setDetail] = useState<Session | null>(null)
  const { data: issues = [] } = useQuery({
  queryKey: ['dashboard-issues'],
  queryFn: () => getIssues(),
})
console.log(issues)

  const { data, isLoading } = useQuery<{
    summary: {
      total: number
      ok: number
      perbaikan: number
      tidak_ok: number
      avg_score: number
    }
    sessions: Session[]
  }>({
    queryKey: ['daily-summary', dateFrom],
    queryFn: () => getDailySummary(dateFrom),
    refetchInterval: 30000,
  })

  const { data: masterLocations = [] } = useQuery({
    queryKey: ['master-locations', filterType],
    queryFn: () =>
      filterType === 'all'
        ? getLocations()
        : getLocations(Number(filterType)),
  })

  const { data: masterTypes = [] } = useQuery({
    queryKey: ['location-types'],
    queryFn: getLocationTypes,
  })

  const locations = masterLocations

  const { data: periods = [] } = useQuery({
    queryKey: ['periods'],
    queryFn: getPeriods,
  })

  const summary = data?.summary ?? {
    total: 0,
    ok: 0,
    perbaikan: 0,
    tidak_ok: 0,
    avg_score: 0,
  }

  const sessions =
    (data?.sessions ?? [])
      .filter((s: Session) => {
        const hasIssue =
          issues.some(
            (i: any) =>
              i.location === s.location &&
              i.date === s.date
          )

        if (!hasIssue) {
          return false
        }

        if (
          filterLoc !== 'all' &&
          s.location !== filterLoc
        ) {
          return false
        }

        if (
          filterShift !== 'all' &&
          s.shift !== filterShift
        ) {
          return false
        }

        if (
          filterType !== 'all' &&
          s.location_type !==
            masterTypes.find(
              (t: any) =>
                String(t.id) === filterType
            )?.name
        ) {
          return false
        }

        return true
      })

  const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'ok':
    case 'done':
      return 'bg-green-100 text-green-700 border-green-200'

    case 'issue':
    case 'tidak ok':
    case 'perlu perbaikan':
      return 'bg-red-100 text-red-700 border-red-200'

    case 'open':
      return 'bg-orange-100 text-orange-700 border-orange-200'

    case 'resolved':
      return 'bg-green-100 text-green-700 border-green-200'

    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleExport = async () => {
  try {

    const blob = await exportDashboard({
      date: dateFrom,

      location_id:
        filterLoc !== 'all'
          ? locations.find(
              (l: any) =>
                l.name === filterLoc
            )?.id
          : undefined,

      location_type_id:
        filterType !== 'all'
          ? filterType
          : undefined,

      shift:
        filterShift !== 'all'
          ? filterShift
          : undefined,
    })

    saveAs(
      blob,
      `Dashboard_Issue_${dateFrom}.xlsx`
    )

  } catch (error) {

    console.error(error)

    alert(
      'Gagal export data'
    )
  }
}

  const sessionIssues = detail
  ? issues.filter((i: any) => {
      return (
        i.location === detail.location &&
        i.date === detail.date &&
        i.shift === detail.shift
      )
    })
  : []

  return (
    <div className="p-6 space-y-5">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-brand-600" />
          Output Dashboard Checklist Cleaning
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Ringkasan hasil checklist kebersihan toilet
        </p>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="
            h-8
            w-48
            rounded-xl
            border
            border-gray-200
            px-4
          "
        />

        <Select
          value={filterType}
          onValueChange={(value) => {
            setFilterType(value)
            setFilterLoc('all')
          }}
        >
          <SelectTrigger className="h-12 w-64 rounded-xl">
            <SelectValue placeholder="Semua Tipe" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Semua Tipe
            </SelectItem>

            {masterTypes
              .filter(
                (t: any) =>
                  t.name === 'Toilet' ||
                  t.name === 'Laktasi'
              )
              .map((t: any) => (
                <SelectItem
                  key={t.id}
                  value={String(t.id)}
                >
                  {t.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Popover
          open={openLocation}
          onOpenChange={setOpenLocation}
        >
          <PopoverTrigger asChild>
            <button
              className="
                h-8
                w-64
                border
                border-gray-200
                rounded-xl
                px-4
                flex
                items-center
                justify-between
                bg-white
                text-left
              "
            >
              {filterLoc === 'all'
                ? 'Semua Lokasi'
                : filterLoc}
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
          className="
            w-64
            p-0
            bg-white
            border
            shadow-lg
            z-[9999]
          "
          >
            <Command
              className="bg-white"
            >

              <CommandInput
                placeholder="Cari lokasi..."
              />

              <CommandList
                className="
                  max-h-[300px]
                  bg-white
                "
              >

                <CommandEmpty>
                  Lokasi tidak ditemukan
                </CommandEmpty>

                <CommandGroup>

                  <CommandItem
                    onSelect={() => {
                      setFilterLoc('all')
                      setOpenLocation(false)
                    }}
                  >
                    Semua Lokasi
                  </CommandItem>

                  {locations.map((loc: any) => (
                    <CommandItem
                      key={loc.id}
                      onSelect={() => {
                        setFilterLoc(loc.name)
                        setOpenLocation(false)
                      }}
                    >
                      {loc.name}
                    </CommandItem>
                  ))}

                </CommandGroup>

              </CommandList>

            </Command>
          </PopoverContent>
        </Popover>

        <Select
          value={filterShift}
          onValueChange={setFilterShift}
        >
          <SelectTrigger className="h-12 w-56 rounded-xl">
            <SelectValue placeholder="Semua Shift" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              Semua Shift
            </SelectItem>

            {periods.map((period: any) => (
              <SelectItem
                key={period.id}
                value={period.name}
              >
                {period.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={handleExport}
          className="
            ml-auto
            h-12
            px-5
            rounded-xl
            border
            border-gray-200
            flex
            items-center
            gap-2
          "
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* TOTAL */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <ClipboardCheck className="w-6 h-6 text-blue-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Total Checklist</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.total}
            </p>
          </div>
        </div>

        {/* OK */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Selesai (OK)</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.ok}
            </p>
          </div>
        </div>

        {/* TIDAK OK */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Perlu Perbaikan</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.tidak_ok}
            </p>
          </div>
        </div>

        {/* AVG */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-brand-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Rata-rata Skor</p>
            <p className="text-2xl font-bold text-brand-600">
              {summary.avg_score}%
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="bg-brand-600 text-white">
                <th className="px-4 py-3 text-left">No</th>
                <th className="px-4 py-3 text-left">Tanggal</th>
                <th className="px-4 py-3 text-left">Waktu</th>
                <th className="px-4 py-3 text-left">Lokasi</th>
                <th className="px-4 py-3 text-left">Shift</th>
                <th className="px-4 py-3 text-left">PIC</th>
                <th className="px-4 py-3 text-left">Skor</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Detail</th>
              </tr>
            </thead>

            <tbody>

              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-gray-400">
                    Belum ada data
                  </td>
                </tr>
              ) : (
                sessions.map((s: Session, i: number) => (
                  <tr
                    key={s.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{i + 1}</td>

                    <td className="px-4 py-3">
                      {s.date}
                    </td>

                    <td className="px-4 py-3">
                      {s.time}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {s.location}
                      </div>

                      <div className="text-xs text-gray-400">
                        {s.location_type}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {s.shift}
                    </td>

                    <td className="px-4 py-3">
                      {s.pic}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`font-bold ${scoreColor(s.score)}`}>
                        {s.score}%
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-semibold ${statusColor(s.status)}`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setDetail(s)}
                        className="text-brand-600 hover:text-brand-700"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>
      {/* MODAL DETAIL */}
      {detail && (
        <div
          className="
            fixed inset-0
            bg-black/50
            z-50
            overflow-hidden
            flex items-center justify-center
            p-4
          "
          onClick={() => setDetail(null)}
        >
          <div
            className="
             bg-white
    rounded-2xl
    p-6
    w-full
    max-w-3xl
    max-h-[85vh]
    overflow-y-auto
    pr-4
    scrollbar-thin
  "
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                Detail Session
              </h2>

              <button
                onClick={() => setDetail(null)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-500 text-sm">
                  Lokasi
                </p>
                <p className="font-semibold">
                  {detail.location}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  PIC
                </p>
                <p className="font-semibold">
                  {detail.pic}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Shift
                </p>
                <p className="font-semibold">
                  {detail.shift}
                </p>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  Score
                </p>
                <p className="font-semibold">
                  {detail.score}%
                </p>
              </div>
            </div>

            <hr className="mb-6" />

            <h3 className="font-bold mb-4">
              Issue Ditemukan
            </h3>

            {sessionIssues.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                Tidak ada issue
              </div>
            ) : (
              <div className="space-y-4">
               {sessionIssues.map((issue: any) => {

                  const beforePhoto = issue.photos?.find(
                    (p: any) => p.type === "before"
                  )

                  const afterPhoto = issue.photos?.find(
                    (p: any) => p.type === "after"
                  )

                  return (
                  <div
                    key={issue.id}
                    className="
                      border
                      rounded-xl
                      p-4
                    "
                  >
                   <div className="flex justify-between items-start">

                  <div>
                    <p className="font-semibold text-lg">
                      {issue.type}
                    </p>

                    <p className="text-sm text-gray-500">
                      {issue.location}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold",
                      issue.status === "resolved"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    )}
                  >
                    {issue.status === "resolved"
                      ? "Close"
                      : "Open"}
                  </span>

                </div>

                {issue.job_name && (

                  <div className="mt-4">

                    <p className="text-sm font-medium text-gray-500 mb-2">
                      Checklist Bermasalah
                    </p>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-red-50
                        border
                        border-red-100
                        px-4
                        py-3
                      "
                    >
                      <span className="text-red-500 text-lg">
                        ⚠
                      </span>

                      <span className="font-medium text-red-700">
                        {issue.job_name}
                      </span>

                    </div>

                  </div>

                )}

                <div className="mt-4">

                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Keterangan
                  </p>

                  <p>
                    {issue.description}
                  </p>

                </div>

                    <div className="mt-4">

                    <h4 className="font-semibold mb-3">
                      Evidence
                    </h4>

                    <div className="grid grid-cols-2 gap-4">

                      {/* BEFORE */}

                      <div>

                        <p className="text-sm font-semibold mb-2">
                          Before
                        </p>

                        {beforePhoto ? (

                          <img
                            src={beforePhoto.image_url}
                            onClick={() =>
                              setPreviewImage(beforePhoto.image_url)
                            }
                            className="
                              w-full
                              h-48
                              object-cover
                              rounded-xl
                              border
                              cursor-pointer
                            "
                          />

                        ) : (

                          <div className="
                            h-48
                            border-2
                            border-dashed
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-gray-400
                          ">
                            Tidak ada foto
                          </div>

                        )}

                      </div>

                      {/* AFTER */}

                      <div>

                        <p className="text-sm font-semibold mb-2">
                          After
                        </p>

                        {afterPhoto ? (

                          <img
                            src={afterPhoto.image_url}
                            onClick={() =>
                              setPreviewImage(afterPhoto.image_url)
                            }
                            className="
                              w-full
                              h-48
                              object-cover
                              rounded-xl
                              border
                              cursor-pointer
                            "
                          />

                        ) : (

                          <div className="
                            h-48
                            border-2
                            border-dashed
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-gray-400
                          ">
                            Belum diselesaikan
                          </div>

                        )}

                      </div>

                    </div>

                  </div>
                  </div>
                    )
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {previewImage && (
        <div
          className="
            fixed
            inset-0
            bg-black/90
            z-9999
            flex
            items-center
            justify-center
            p-6
          "
          onClick={() =>
            setPreviewImage(null)
          }
        >
          <img
            src={previewImage}
            alt=""
            className="
              max-w-full
              max-h-full
              rounded-xl
            "
          />
        </div>
      )}
    </div>
  )
}