import { useState } from 'react'
import { useQuery} from '@tanstack/react-query'
import {getWeeklyReport} from '@/api/weeklyReport'
import { exportIssueReport } from "@/api/issue"
import { DataTable } from '@/components/admin/DataTable'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  CalendarRange,
  Download,
  Filter
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
    const [showIssueModal, setShowIssueModal] = useState(false)

    const [selectedIssue, setSelectedIssue] = useState<any>(null)

    const [showFilter, setShowFilter] =
    useState(false)

    const [selectedLocation, setSelectedLocation] =
    useState('all')

    const [selectedStatus, setSelectedStatus] =
    useState('all')

    const [selectedType, setSelectedType] =
    useState('all')

    const [selectedPic, setSelectedPic] =
    useState('all')

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
            'text-xs px-3 py-1 rounded-full font-medium border',
            i.status === 'resolved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
          )}        >
          {i.status === 'resolved'
            ? 'Close'
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

  const filteredIssues =
  report?.issues.filter((item) => {

    const matchLocation =
      selectedLocation === 'all' ||
      item.location === selectedLocation

    const matchStatus =
      selectedStatus === 'all' ||
      item.status === selectedStatus

    const matchType =
      selectedType === 'all' ||
      item.type === selectedType

    const matchPic =
      selectedPic === 'all' ||
      item.reported_by === selectedPic

    return (
      matchLocation &&
      matchStatus &&
      matchType &&
      matchPic
    )

  }) || []
  
  const handleExport = async () => {

    const blob = await exportIssueReport({

        start_date:

            startDate
                ?.toISOString()
                .split("T")[0],

        end_date:

            endDate
                ?.toISOString()
                .split("T")[0],

        status:

            selectedStatus !== "all"

                ? selectedStatus

                : undefined,

        type:

            selectedType !== "all"

                ? selectedType

                : undefined,

        location:

            selectedLocation !== "all"

                ? selectedLocation

                : undefined,

        reported_by:

            selectedPic !== "all"

                ? selectedPic

                : undefined,

    })

    const url =
        window.URL.createObjectURL(blob)

    const a =
        document.createElement("a")

    a.href = url

    a.download =
        "Issue_Report.xlsx"

    a.click()

    window.URL.revokeObjectURL(url)

}

return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            Laporan Issue
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Daftar seluruh issue cleaning service
          </p>
        </div>
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
                  filteredIssues.map(
                    (i) => ({
                      ...i,
                      id: i.id,
                    })
                  ) || []
                }
                columns={issueColumns}
                searchPlaceholder="Cari issue..."
                headerLeft={
                <div className="flex items-center gap-3">

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
                        w-[300px]
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

                headerRight={

                  <div className="flex gap-3">

                  <button

                  onClick={handleExport}

                  className="
                  flex
                  items-center
                  gap-2
                  h-11
                  px-5
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  hover:bg-gray-50
                  transition
                  "

                  >

                  <Download className="w-5 h-5"/>

                  Export

                  </button>

                  <button

                  onClick={() => setShowFilter(true)}

                  className="
                  flex
                  items-center
                  gap-2
                  h-11
                  px-5
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  hover:bg-gray-50
                  transition
                  "

                  >

                  <Filter className="w-4 h-4"/>

                  Filter

                  </button>

                  </div>

                  }
              />
            </div>
          )}
        </>
      ) : null}

      {showFilter && (

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
            w-full
            max-w-md
            p-6
            rounded-3xl
            shadow-xl
            border
            border-gray-100
            "
            >

            <h3 className="text-2xl font-bold mb-6">
                Filter Data
            </h3>

           <div className="space-y-4">

                <div className="space-y-2">

                    <label className="text-sm font-medium text-gray-600">
                        Jenis Issue
                    </label>

                    <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
                    >

                    <SelectTrigger
                      className="
                        w-full
                        h-12
                        rounded-xl
                        border-gray-200
                      "
                    >
                        <SelectValue placeholder="Semua Jenis Issue" />
                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="all">
                        Semua Jenis Issue
                        </SelectItem>

                        {[
                        ...new Set(
                            report?.issues?.map(
                            (x) => x.type
                            )
                        ),
                        ].map((item:any) => (

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

                 <div className="space-y-2">

                    <label className="text-sm font-medium text-gray-600">
                        Lokasi
                    </label>

                    <Select
                        value={selectedLocation}
                        onValueChange={setSelectedLocation}
                    >

                  <SelectTrigger
                    className="
                      w-full
                      h-12
                      rounded-xl
                    border-gray-200
                    "
                  >
                        <SelectValue placeholder="Semua Lokasi" />
                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="all">
                        Semua Lokasi
                        </SelectItem>

                        {[
                        ...new Set(
                            report?.issues?.map(
                            (x) => x.location
                            )
                        ),
                        ].map((item:any) => (

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

                 <div className="space-y-2">

                    <label className="text-sm font-medium text-gray-600">
                        PIC
                    </label>

                    <Select
                        value={selectedPic}
                        onValueChange={setSelectedPic}
                    >

                     <SelectTrigger
                        className="
                            w-full
                            h-12
                            rounded-xl
                            border-gray-200
                        "
                        >
                        <SelectValue placeholder="Semua PIC" />
                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="all">
                        Semua PIC
                        </SelectItem>

                        {[
                        ...new Set(
                            report?.issues?.map(
                            (x) => x.reported_by
                            )
                        ),
                        ].map((item:any) => (

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

                 <div className="space-y-2">

                    <label className="text-sm font-medium text-gray-600">
                        Status
                    </label>

                    <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                    >

                    <SelectTrigger
                        className="
                            w-full
                            h-12
                            rounded-xl
                            border-gray-200
                        "
                        >
                        <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="all">
                        Semua Status
                        </SelectItem>

                        <SelectItem value="open">
                        Open
                        </SelectItem>

                        <SelectItem value="resolved">
                        Close
                        </SelectItem>

                    </SelectContent>

                    </Select>

                    </div>

            </div>

            <div className="flex justify-between mt-8">

                <button
                onClick={() => {

                    setSelectedType('all')
                    setSelectedLocation('all')
                    setSelectedPic('all')
                    setSelectedStatus('all')

                }}
                className="
                    text-red-500
                    border
                    rounded-xl
                    px-5
                    py-2
                "
                >
                Reset
                </button>

                <button
                onClick={() =>
                    setShowFilter(false)
                }
                className="
                    border
                    rounded-xl
                    px-5
                    py-2
                "
                >
                Tutup
                </button>

            </div>

            </div>

        </div>

        )}

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
                <b>Status:</b>{" "}
                {
                    selectedIssue.status === "resolved"
                        ? "Close"
                        : "Open"
                }
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