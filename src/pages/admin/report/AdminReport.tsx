import { useState } from 'react'
import { useQuery} from '@tanstack/react-query'
import {getWeeklyReport} from '@/api/weeklyReport'
import { DataTable } from '@/components/admin/DataTable'
import { exportReport } from '@/api/reportExport'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  Download,
  CalendarRange,
   SlidersHorizontal,
   Eye,
   X,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export default function AdminReport() {

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

  const [selectedLocation, setSelectedLocation] =
  useState('all')

  const [selectedType, setSelectedType] =
    useState('all')

  const [selectedPeriod, setSelectedPeriod] =
    useState('all')

  const [selectedPic, setSelectedPic] =
    useState('all')

  const [selectedStatus, setSelectedStatus] =
    useState('all')
  
  const [
    openFilter,
    setOpenFilter,
  ] = useState(false)

  const [selectedPhotos, setSelectedPhotos] = useState<
  {
    id: number
    image_url: string
    note: string | null
  }[]
>([])

const [openPreview, setOpenPreview] = useState(false)

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

  {
    key: 'preview',
    label: 'Preview',

    render: (row: any) =>

      row.photos?.length ? (

        <button
          onClick={() => {
            setSelectedPhotos(row.photos)
            setOpenPreview(true)
          }}
          className="
            inline-flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-brand-50
            text-brand-700
            hover:bg-brand-100
          "
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>

      ) : (

        <span className="text-gray-400">
          -
        </span>

      ),
  },

]

const filteredChecklists =
  report?.checklists.filter((item) => {

    const matchLocation =
      selectedLocation === 'all' ||
      item.location === selectedLocation

    const matchType =
      selectedType === 'all' ||
      item.location_type === selectedType

    const matchPeriod =
      selectedPeriod === 'all' ||
      item.period === selectedPeriod

    const matchPic =
      selectedPic === 'all' ||
      item.pic === selectedPic

    const matchStatus =
      selectedStatus === 'all' ||
      item.status === selectedStatus

    return (
      matchLocation &&
      matchType &&
      matchPeriod &&
      matchPic &&
      matchStatus
    )

  }) || []

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

const availableLocations =
  [...new Set(

    report?.checklists

      ?.filter((item:any) =>

        selectedType === 'all'
          ? true
          : item.location_type === selectedType

      )

      ?.map(
        (item:any) => item.location
      ) || []

  )]

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
            className="
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-xl
              border
              border-gray-200
              bg-white
              hover:bg-gray-50
            "
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

            <div className="px-5 pt-4 flex flex-wrap gap-2">

              {selectedType !== 'all' && (

                <span
                  className="
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-1.5
                  rounded-full
                  bg-blue-50
                  border
                  border-blue-100
                  text-blue-700
                  text-xs
                  font-medium
                  "
                >
                  {selectedType}
                </span>

              )}

              {selectedLocation !== 'all' && (

                <span
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-green-50
                    text-green-700
                    text-xs
                    font-medium
                  "
                >
                  {selectedLocation}
                </span>

              )}

              {selectedPeriod !== 'all' && (

                <span
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-orange-50
                    text-orange-700
                    text-xs
                    font-medium
                  "
                >
                  {selectedPeriod}
                </span>

              )}

            </div>

            <DataTable
            headerRight={

              <button
                onClick={() =>
                  setOpenFilter(true)
                }
                className="
                  h-11
                  px-4
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  hover:bg-gray-50
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                "
              >
                <SlidersHorizontal
                  className="w-4 h-4"
                />

                Filter

              </button>

              }

              title="Checklist"

              headerLeft={

              <div className="flex items-center gap-3">

                {/* DATE */}

                <div className="relative">

                  <CalendarRange
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      h-4
                      w-4
                      text-gray-400
                    "
                  />

                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(dates) => {

                      const [start, end] = dates

                      setStartDate(start)
                      setEndDate(end)

                    }}
                    dateFormat="dd MMM yyyy"
                    className="
                      h-11
                      w-[260px]
                      rounded-xl
                      border
                      border-gray-200
                      pl-10
                      pr-3
                      text-sm
                    "
                  />

                </div>

              </div>

              }

              data={filteredChecklists}

              columns={checklistColumns}

              />

          </div>

          
          
        </>
      ) : null}

      {openFilter && (

          <div
            className="
              fixed
              inset-0
              z-50
              bg-black/30
              flex
              items-center
              justify-center
            "
          >

            <div
              className="
                bg-white
                rounded-3xl
                w-full
                max-w-lg
                p-6
                space-y-4
              "
            >

              <h3
                className="
                  text-lg
                  font-semibold
                "
              >
                Filter Data
              </h3>

              {/* Tipe */}
              <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-600
                  mb-2
                "
              >
                Type
              </label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value)
                  setSelectedLocation('all')
                }}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>

                <SelectContent position="popper">

                  <SelectItem value="all">
                    Semua Tipe
                  </SelectItem>

                  {[...new Set(
                    report?.checklists.map(
                      (x:any) => x.location_type
                    )
                  )].map((item:any) => (

                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>

                  ))}

                </SelectContent>
              </Select>
              </div>

              {/* Lokasi */}
              <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-600
                  mb-2
                "
              >
                Lokasi
              </label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Semua Lokasi" />
                </SelectTrigger>

                <SelectContent position="popper">

                  <SelectItem value="all">
                    Semua Lokasi
                  </SelectItem>

                  {availableLocations.map((item:any) => (

                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>

                  ))}

                </SelectContent>
              </Select>
              </div>

              {/* Periode */}
              <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-600
                  mb-2
                "
              >
                Periode
              </label>

              <Select
                value={selectedPeriod}
                onValueChange={setSelectedPeriod}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Semua Periode" />
                </SelectTrigger>

                <SelectContent position="popper">

                  <SelectItem value="all">
                    Semua Periode
                  </SelectItem>

                  {[...new Set(
                    report?.checklists.map(
                      (x:any) => x.period
                    )
                  )].map((item:any) => (

                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>

                  ))}

                </SelectContent>
              </Select>
              </div>

              <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-600
                  mb-2
                "
              >
                Pic
              </label>
              <Select
                value={selectedPic}
                onValueChange={setSelectedPic}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Semua Periode" />
                </SelectTrigger>

                <SelectContent position="popper">

                  <SelectItem value="all">
                    Semua Periode
                  </SelectItem>

                  {[...new Set(
                    report?.checklists.map(
                      (x:any) => x.period
                    )
                  )].map((item:any) => (

                    <SelectItem
                      key={item}
                      value={item}
                    >
                      {item}
                    </SelectItem>

                  ))}

                </SelectContent>
              </Select>
              </div>

              <div>
              <label
                className="
                  block
                  text-sm
                  font-medium
                  text-gray-600
                  mb-2
                "
              >
                Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full h-12 rounded-xl">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>

                <SelectContent position="popper">

                  <SelectItem value="all">
                    Semua Status
                  </SelectItem>

                  <SelectItem value="done">
                    Done
                  </SelectItem>

                  <SelectItem value="pending">
                    Pending
                  </SelectItem>

                </SelectContent>
              </Select>
              </div>

              <button
                onClick={() => {

                  setSelectedType('all')
                  setSelectedLocation('all')
                  setSelectedPeriod('all')
                  setSelectedPic('all')
                  setSelectedStatus('all')

                }}
                className="
                  px-4
                  py-2
                  rounded-xl
                  border
                  border-red-200
                  text-red-600
                "
              >
                Reset
              </button>

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-2
                "
              >

                <button
                  onClick={() =>
                    setOpenFilter(false)
                  }
                  className="
                    px-4
                    py-2
                    rounded-xl
                    border
                  "
                >
                  Tutup
                </button>

              </div>

            </div>

          </div>

        )}

        {openPreview && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            z-[9999]
            flex
            items-center
            justify-center
            p-6
          "
        >

        <div
          className="
            bg-white
            rounded-3xl
            w-full
            max-w-3xl
            max-h-[90vh]
            overflow-y-auto
            shadow-xl
          "
        >

        <div className="flex justify-between items-center p-8">

        <h2 className="text-2xl font-bold">
        Preview Dokumentasi Checklist
        </h2>

        <button
          onClick={() => setOpenPreview(false)}
        >
        <X className="w-7 h-7 text-gray-500 hover:text-black"/>
        </button>

        </div>

        <div className="px-8 pb-8">

        {selectedPhotos.length === 0 ? (

        <div className="text-center py-20 text-gray-400">
        Tidak ada dokumentasi.
        </div>

        ) : (

        <>

        <p className="font-semibold text-lg mb-5">
        Dokumentasi
        </p>

        <div className="grid grid-cols-2 gap-5">

        {selectedPhotos.map((photo) => (

        <button
            key={photo.id}
            type="button"
            onClick={() =>
              window.open(photo.image_url,"_blank")
            }
            className="
              rounded-2xl
              overflow-hidden
              border
              hover:shadow-lg
              transition
            "
        >

        <img
            src={photo.image_url}
            className="
              w-full
              h-72
              object-cover
            "
        />

        </button>

        ))}

        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
        Klik gambar untuk memperbesar
        </p>

        </>

        )}

        <div className="mt-8">

        <button

        onClick={() => setOpenPreview(false)}

        className="
        w-full
        border
        rounded-xl
        py-3
        font-medium
        hover:bg-gray-50
        "

        >

        Tutup

        </button>

        </div>

        </div>

        </div>

        </div>

        )}
    </div>
  )
}