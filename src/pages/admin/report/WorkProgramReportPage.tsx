import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getWorkProgramReport } from '@/api/workProgramReport'
import { DataTable } from '@/components/admin/DataTable'
import { cn } from '@/lib/utils'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { CalendarRange } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function WorkProgramReportPage() {

  const [selectedData, setSelectedData] =
    useState<any>(null)

  const [showModal, setShowModal] =
    useState(false)

  const [showFilter, setShowFilter] =
  useState(false)

  const [selectedCategory, setSelectedCategory] =
  useState('all')

  const [selectedPlan, setSelectedPlan] =
  useState('all')

  const [selectedStatus, setSelectedStatus] =
  useState('all')

  const [selectedLocation, setSelectedLocation] =
  useState('all')

  const [previewImage, setPreviewImage] =
  useState<string | null>(null)

  const [startDate, setStartDate] =
  useState<Date | null>(
    new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    )
  )

  const [endDate, setEndDate] =
  useState<Date | null>(
    new Date()
  )

  const {
    data = [],
    isLoading,
  } = useQuery({
    queryKey: ['work-program-report'],
    queryFn: getWorkProgramReport,
  })
  

  const columns = [

    {
      key: 'job_name',
      label: 'Pekerjaan',
    },

    {
      key: 'location_name',
      label: 'Lokasi',
    },

    {
      key: 'category',
      label: 'Kategori',

      render: (row: any) => (

        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-medium',

            row.category === 'plan'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-orange-100 text-orange-700'
          )}
        >
          {row.category === 'plan'
            ? 'On Plan'
            : 'Out Plan'}
        </span>

      ),
    },

    {
      key: 'plan',
      label: 'Plan',

      render: (row: any) => (

        <span
          className="
            px-3
            py-1
            rounded-full
            text-xs
            bg-gray-100
            text-gray-700
          "
        >
          {row.plan}
        </span>

      ),
    },

    {
      key: 'time_range',
      label: 'Jadwal',
    },

    {
      key: 'status',
      label: 'Status',

      render: (row: any) => (

      <span
      className={cn(
      'px-3 py-1 rounded-full text-xs font-medium',

      row.status === 'pending'
      ? 'bg-yellow-100 text-yellow-700'

      : row.status === 'progress'
      ? 'bg-blue-100 text-blue-700'

      : row.status === 'done'
      ? 'bg-green-100 text-green-700'

      : 'bg-red-100 text-red-700'
      )}
      >

      {row.status === 'pending' && 'Pending'}

      {row.status === 'progress' && 'Progress'}

      {row.status === 'done' && 'Done'}

      {row.status === 'late' && 'Late'}

      </span>

      )
    },

    {
      key: 'evidence',
      label: 'Evidence',

      render: (row: any) => {

        const evidence = row.evidences?.[0]

        if (row.status === 'pending') {

          return (
            <span className="font-medium text-yellow-600">
              Belum Mulai
            </span>
          )

        }

        if (row.status === 'progress') {

          return (
            <div className="flex flex-col">

              <span className="font-medium text-blue-600">
                Before
              </span>

              {evidence?.before_image && (
                <span className="text-xs text-gray-500">
                  1 Foto
                </span>
              )}

            </div>
          )

        }

        if (row.status === 'done') {

          return (
            <div className="flex flex-col">

              <span className="font-medium text-green-600">
                Before + After
              </span>

              <span className="text-xs text-gray-500">
                Lengkap
              </span>

            </div>
          )

        }

        return (
          <div className="flex flex-col">

            <span className="font-medium text-red-600">
              Terlambat
            </span>

            {evidence?.before_image && (
              <span className="text-xs text-gray-500">
                Evidence Ada
              </span>
            )}

          </div>
        )

      },
    },
    {
      key: 'action',
      label: 'Aksi',

      render: (row: any) => (

        <button
          onClick={() => {

            setSelectedData(row)
            setShowModal(true)

          }}
          className="
            px-3
            py-1
            rounded-lg
            bg-brand-600
            text-white
            text-xs
            font-medium
          "
        >
          Preview
        </button>

      ),
    },
  ]

    const filteredData =
    data.filter((item: any) => {

    const matchCategory =
        selectedCategory === 'all' ||
        item.category === selectedCategory

    const matchPlan =
        selectedPlan === 'all' ||
        item.plan === selectedPlan

    const matchStatus =
        selectedStatus === 'all' ||
        item.status === selectedStatus

    const matchLocation =
        selectedLocation === 'all' ||
        item.location_name === selectedLocation

    const itemDate =
        new Date(item.created_at)

    const matchDate =
        (!startDate || itemDate >= startDate) &&
        (!endDate || itemDate <= endDate)

    return (
        matchCategory &&
        matchPlan &&
        matchStatus &&
        matchLocation &&
        matchDate
    )
    })

  return (
    <div className="p-6">

      <DataTable

        title="Laporan Program Kerja"

        subtitle="Daftar seluruh program kerja cleaning service"

        data={filteredData.map((item: any) => ({
            ...item,
            id: item.id,
        }))}

        columns={columns}

        isLoading={isLoading}

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
            <button
                onClick={() =>
                setShowFilter(true)
                }
                className="
                h-11
                px-4
                rounded-xl
                border
                border-gray-200
                bg-white
                hover:bg-gray-50
                "
            >
                Filter
            </button>
            }

        searchPlaceholder="Cari program kerja..."

        />

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
                    max-w-xl
                    rounded-3xl
                    p-6
                "
                >

                <h3
                    className="
                    text-2xl
                    font-bold
                    mb-6
                    "
                >
                    Filter Data
                </h3>

                <div className="space-y-5">

                    {/* Kategori */}
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
                        Kategori
                    </label>

                    <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                    >
                    <SelectTrigger
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border-gray-200
                        "
                        >
                        <SelectValue placeholder="Kategori" />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="all">
                        Semua Kategori
                        </SelectItem>

                        <SelectItem value="plan">
                        On Plan
                        </SelectItem>

                        <SelectItem value="out_plan">
                        Out Plan
                        </SelectItem>

                    </SelectContent>
                    </Select>
                    </div>

                    {/* Plan */}
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
                        Plan
                    </label>

                    <Select
                        value={selectedPlan}
                        onValueChange={setSelectedPlan}
                    >
                     <SelectTrigger
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border-gray-200
                        "
                        >
                        <SelectValue placeholder="Plan" />
                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="all">
                        Semua Plan
                        </SelectItem>

                        <SelectItem value="weekly">
                        Weekly
                        </SelectItem>

                        <SelectItem value="monthly">
                        Monthly
                        </SelectItem>

                    </SelectContent>
                    </Select>
                    </div>

                    {/* Status */}
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
                      <SelectTrigger
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border-gray-200
                        "
                        >
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>

                    <SelectContent>

                    <SelectItem value="all">
                    Semua Status
                    </SelectItem>

                    <SelectItem value="pending">
                    Pending
                    </SelectItem>

                    <SelectItem value="progress">
                    Progress
                    </SelectItem>

                    <SelectItem value="done">
                    Done
                    </SelectItem>

                    <SelectItem value="late">
                    Late
                    </SelectItem>

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

                     <SelectTrigger
                        className="
                            h-12
                            w-full
                            rounded-xl
                            border-gray-200
                        "
                        >
                        <SelectValue placeholder="Lokasi" />
                    </SelectTrigger>

                    <SelectContent>

                        <SelectItem value="all">
                        Semua Lokasi
                        </SelectItem>

                        {[
                        ...new Set(
                            data.map(
                            (x:any) =>
                                x.location_name
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

                </div>

                <div
                    className="
                    flex justify-between
                    mt-8
                    "
                >

                    <button
                    onClick={() => {

                        setSelectedCategory('all')
                        setSelectedPlan('all')
                        setSelectedStatus('all')
                        setSelectedLocation('all')

                    }}
                    className="
                        px-5 py-2
                        border
                        rounded-xl
                        text-red-500
                    "
                    >
                    Reset
                    </button>

                    <button
                    onClick={() =>
                        setShowFilter(false)
                    }
                    className="
                        px-5 py-2
                        border
                        rounded-xl
                    "
                    >
                    Tutup
                    </button>

                </div>

                </div>

            </div>

            )}

      {showModal && selectedData && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            flex
            items-center
            justify-center
            z-50
          "
        >

          <div
            className="
                bg-white
                rounded-3xl
                w-full
                max-w-4xl
                max-h-[90vh]
                overflow-y-auto
                p-6
            "
            >

            <h3
              className="
                text-2xl
                font-bold
                mb-6
              "
            >
              Detail Program Kerja
            </h3>

            <div
              className="
                grid
                grid-cols-2
                gap-4
                text-sm
              "
            >

              <div>
                <b>Pekerjaan</b>
                <p>{selectedData.job_name}</p>
              </div>

              <div>
                <b>Lokasi</b>
                <p>{selectedData.location_name}</p>
              </div>

              <div>
                <b>Sub Lokasi</b>
                <p>{selectedData.sub_location}</p>
              </div>

              <div>
                <b>Area</b>
                <p>{selectedData.area_name}</p>
              </div>

              <div>
                <b>Kategori</b>
                <p>{selectedData.category}</p>
              </div>

              <div>
                <b>Plan</b>
                <p>{selectedData.plan}</p>
              </div>

              <div>
                <b>Jadwal</b>
                <p>{selectedData.time_range}</p>
              </div>

              <div>
                <b>Status</b>
                <p>{selectedData.status}</p>
              </div>

              {/* <div>
                <b>Checker</b>
                <p>
                  {selectedData.user || '-'}
                </p>
              </div> */}

            </div>

            <div className="mt-8">

                <h4
                    className="
                    text-lg
                    font-semibold
                    mb-4
                    "
                >
                    Evidence
                </h4>

                {selectedData.evidences?.length > 0 ? (

                    <div className="space-y-6">
                        
                    {selectedData.evidences.map(
                        (evidence: any) => (

                        <div
                            key={evidence.id}
                            className="
                            border
                            rounded-2xl
                            p-4
                            "
                        >

                            <div
                            className="
                                grid
                                grid-cols-2
                                gap-4
                            "
                            >

                            {/* Before */}
                            <div>

                                <p
                                className="
                                    text-sm
                                    font-medium
                                    mb-2
                                "
                                >
                                Before
                                </p>

                                {evidence.before_image ? (

                                <img
                                    src={evidence.before_image}
                                    alt="Before"
                                    className="
                                    w-full
                                    h-52
                                    object-cover
                                    rounded-xl
                                    border
                                    cursor-pointer
                                    "
                                    onClick={() =>
                                    setPreviewImage(
                                        evidence.before_image
                                    )
                                    }
                                />

                                ) : (

                                <div
                                    className="
                                    h-52
                                    rounded-xl
                                    border
                                    flex
                                    items-center
                                    justify-center
                                    text-gray-400
                                    "
                                >
                                    Tidak ada foto
                                </div>

                                )}

                            </div>

                            {/* After */}
                            <div>

                                <p
                                className="
                                    text-sm
                                    font-medium
                                    mb-2
                                "
                                >
                                After
                                </p>

                                {evidence.after_image ? (

                                <img
                                    src={evidence.after_image}
                                    alt="After"
                                    className="
                                    w-full
                                    h-52
                                    object-cover
                                    rounded-xl
                                    border
                                    cursor-pointer
                                    "
                                    onClick={() =>
                                    setPreviewImage(
                                        evidence.after_image
                                    )
                                    }
                                />

                                ) : (

                                <div
                                    className="
                                    h-52
                                    rounded-xl
                                    border
                                    flex
                                    items-center
                                    justify-center
                                    text-gray-400
                                    "
                                >
                                    Tidak ada foto
                                </div>

                                )}

                            </div>

                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">

                          <div>

                          <p className="text-sm font-medium mb-1">

                          Remark Before

                          </p>

                          <div className="bg-gray-50 rounded-xl p-3 text-sm">

                          {evidence.before_remark || '-'}

                          </div>

                          </div>

                          <div>

                          <p className="text-sm font-medium mb-1">

                          Remark After

                          </p>

                          <div className="bg-gray-50 rounded-xl p-3 text-sm">

                          {evidence.after_remark || '-'}

                          </div>

                          </div>

                          </div>

                        </div>

                        )
                    )}

                    </div>

                ) : (

                    <div
                    className="
                        p-5
                        rounded-xl
                        bg-red-50
                        text-red-700
                    "
                    >
                    Belum ada evidence
                    </div>

                )}

                </div>

            <div
              className="
                flex
                justify-end
                mt-8
              "
            >

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="
                  px-5
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

      {previewImage && (

        <div
            className="
            fixed
            inset-0
            bg-black/80
            z-[999]
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
            alt="Preview"
            className="
                max-w-full
                max-h-full
                rounded-2xl
            "
            />

        </div>

        )}

    </div>
  )
}