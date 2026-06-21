import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDailySummary } from '@/api/checklist'
import { getIssues } from '@/api/issue'
import { getLocations } from '@/api/location'
import { getPeriods } from '@/api/period'
import { getLocationTypes } from '@/api/location'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

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

const imageUrlToBase64 = async (url: string) => {
  const response = await fetch(url)
  const blob = await response.blob()

  return new Promise<string>((resolve) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      resolve(reader.result as string)
    }

    reader.readAsDataURL(blob)
  })
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

        return true
      })

  

  const shiftTimes = periods

  const statusColor = (status: string) => {
    if (status === 'OK') {
      return 'text-green-600 bg-green-50 border-green-200'
    }

    if (status === 'Tidak OK') {
      return 'text-red-600 bg-red-50 border-red-200'
    }

    return 'text-red-600 bg-red-50 border-red-200'
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const exportExcel = async () => {

    const workbook = new ExcelJS.Workbook()

    const sheet =
      workbook.addWorksheet(
        'MASTER OUTPUT'
      )

    sheet.mergeCells('A1:I1')

    sheet.getCell('A1').value =
      'MASTER OUTPUT'

    sheet.getCell('A1').font = {
      bold: true,
      size: 16,
    }

    sheet.addRow([])

    sheet.addRow([
      'NO',
      'TANGGAL',
      'TIME',
      'LOKASI',
      'Y',
      'N',
      'ISSUE',
      'REMARK',
      'DOKUMENTASI',
    ])

    const filteredIssues = issues.filter((issue: any) => {

    if (
      filterLoc !== 'all' &&
      issue.location !== filterLoc
    ) {
      return false
    }

    if (
      dateFrom &&
      issue.date !== dateFrom
    ) {
      return false
    }

    return true
  })

    let rowIndex = 4

    for (
      let i = 0;
      i < filteredIssues.length;
      i++
    ) {

      const issue =
        filteredIssues[i]

      const time =
        issue.created_at?.split(' ')[1] ?? ''

      const row =
        sheet.addRow([
          i + 1,
          issue.date,
          time,
          issue.location,
          issue.status === 'resolved'
            ? 'Y'
            : '',
          issue.status === 'open'
            ? 'N'
            : '',
          issue.type,
          issue.description,
          '',
        ])

      sheet.getRow(
        row.number
      ).height = 100

      if (
        issue.photos?.length
      ) {

        try {

          const base64 =
            await imageUrlToBase64(
              issue.photos[0].image_url
            )

          const imageId =
            workbook.addImage({
              base64,
              extension: 'jpeg',
            })

          sheet.addImage(
            imageId,
            {
              tl: {
                col: 8,
                row: rowIndex - 1,
              },

              ext: {
                width: 120,
                height: 90,
              },
            }
          )

        } catch (err) {

          console.error(
            'Gagal load image',
            err
          )
        }
      }

      rowIndex++
    }

    sheet.columns = [
      { width: 8 },
      { width: 18 },
      { width: 12 },
      { width: 25 },
      { width: 8 },
      { width: 8 },
      { width: 25 },
      { width: 40 },
      { width: 25 },
    ]

    const buffer =
      await workbook.xlsx.writeBuffer()

    saveAs(
      new Blob([buffer]),
      `Issue_Report_${dateFrom}.xlsx`
    )
  }

  const sessionIssues = detail
    ? issues.filter((i: any) => {
        return (
          i.location === detail.location &&
          i.date === detail.date
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
            h-12
            w-48
            rounded-xl
            border
            border-gray-200
            px-4
          "
        />

        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            setFilterLoc('all')
          }}
          className="
            h-12
            w-52
            rounded-xl
            border
            border-gray-200
            px-4
            bg-white
          "
        >
          <option value="all">
            Semua Tipe
          </option>

          {masterTypes
            .filter(
              (t: any) =>
                t.name === 'Toilet' ||
                t.name === 'Laktasi'
            )
            .map((t: any) => (
              <option
                key={t.id}
                value={t.id}
              >
                {t.name}
              </option>
          ))}
        </select>

        <Popover
          open={openLocation}
          onOpenChange={setOpenLocation}
        >
          <PopoverTrigger asChild>
            <button
              className="
                w-64
                border
                border-gray-200
                rounded-xl
                px-3
                py-2
                text-left
                bg-white
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

       <select
          value={filterShift}
          onChange={(e) => setFilterShift(e.target.value)}
          className="
            h-12
            w-44
            rounded-xl
            border
            border-gray-200
            px-4
            bg-white
          "
        >
          <option value="all">
            Semua Shift
          </option>

          {shiftTimes.map((period) => (
            <option
              key={period.id}
              value={period.name}
            >
              {period.name}
            </option>
          ))}
        </select>

        <button
          onClick={exportExcel}
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
                {sessionIssues.map((issue: any) => (
                  <div
                    key={issue.id}
                    className="
                      border
                      rounded-xl
                      p-4
                    "
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">
                          {issue.type}
                        </p>

                        <p className="text-sm text-gray-500">
                          {issue.location}
                        </p>
                      </div>

                      <span
                        className="
                          px-3 py-1
                          rounded-full
                          text-xs
                          bg-red-100
                          text-red-600
                        "
                      >
                        {issue.status}
                      </span>
                    </div>

                    <p className="mb-3">
                      {issue.description}
                    </p>

                    {issue.photos?.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {issue.photos.map((p: any) => (
                          <img
                            key={p.id}
                            src={p.image_url}
                            alt=""
                            onClick={() =>
                              setPreviewImage(p.image_url)
                            }
                            className="
                              h-28
                              w-full
                              object-cover
                              rounded-lg
                              cursor-pointer
                              hover:opacity-80
                              transition
                            "
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
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