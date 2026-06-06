import Select from 'react-select'

import {
  CalendarRange,
  Layers3,
} from 'lucide-react'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

type Props = {

  viewType: string
  setViewType: any

  startDate: Date | null
  setStartDate: any

  endDate: Date | null
  setEndDate: any

  selectedJob: string
  setSelectedJob: any

  masterJobs: any[]

  hideFogging?: boolean
}

const selectStyles = {

  control: (
    base: any,
    state: any
  ) => ({

    ...base,

    minHeight: 56,

    minWidth: 180,

    borderRadius: 16,

    borderColor:
      state.isFocused
        ? '#10b981'
        : '#e5e7eb',

    boxShadow: 'none',

    paddingLeft: 36,

    fontSize: 14,

    fontWeight: 500,

    cursor: 'pointer',

    '&:hover': {

      borderColor: '#d1d5db',
    },
  }),

  option: (
    base: any,
    state: any
  ) => ({

    ...base,

    backgroundColor:
      state.isFocused
        ? '#ecfdf5'
        : '#fff',

    color: '#111827',

    cursor: 'pointer',

    fontSize: 14,
  }),

  menu: (base: any) => ({

    ...base,

    borderRadius: 16,

    overflow: 'hidden',

    zIndex: 9999,
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),
}

export default function WorkProgramFilters({

  viewType,
  setViewType,

  startDate,
  setStartDate,

  endDate,
  setEndDate,

  selectedJob,
  setSelectedJob,

  masterJobs,

}: Props) {

  const viewOptions = [

    {
      value: 'all',
      label: 'Semua',
    },

    {
      value: 'weekly',
      label: 'Weekly',
    },

    {
      value: 'monthly',
      label: 'Monthly',
    },
  ]


  const jobOptions = [

    {
      value: '',
      label: 'Semua Pekerjaan',
    },

    ...masterJobs.map(
      (job: any) => ({

        value: job.job,

        label: job.job,
      })
    ),
  ]

  return (

    <div
      className="
        flex flex-wrap
        items-center
        gap-4
        rounded-2xl
        border border-gray-200
        bg-white
        px-7 py-6
      "
    >

      {/* PLAN */}
      <div className="relative">

        <Layers3
          className="
            pointer-events-none
            absolute
            left-4 top-1/2
            z-10
            h-5 w-5
            -translate-y-1/2
            text-gray-400
          "
        />

        <Select

          styles={selectStyles}

          isSearchable={false}

          options={viewOptions}

          value={
            viewOptions.find(
              (item) =>
                item.value ===
                viewType
            )
          }

          onChange={(val: any) =>
            setViewType(
              val?.value
            )
          }

        />

      </div>

     

      {/* DATE RANGE */}

        <div className="relative">

          <CalendarRange
            className="
              pointer-events-none
              absolute
              left-4 top-1/2
              z-10
              h-5 w-5
              -translate-y-1/2
              text-gray-400
            "
          />

          <DatePicker

            selectsRange

            startDate={startDate}

            endDate={endDate}

            onChange={(dates) => {

              const [
                start,
                end,
              ] = dates

              setStartDate(start)
              setEndDate(end)

            }}

            isClearable

            placeholderText="Pilih Rentang Tanggal"

            dateFormat="dd MMM yyyy"

            className="
              h-14
              w-[320px]
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

      {/* JOB */}
        <div className="relative">

          <Layers3
            className="
              pointer-events-none
              absolute
              left-4 top-1/2
              z-10
              h-5 w-5
              -translate-y-1/2
              text-gray-400
            "
          />

          <Select

            styles={selectStyles}

            options={jobOptions}

            value={
              jobOptions.find(
                (item) =>
                  item.value ===
                  selectedJob
              )
            }

            onChange={(val: any) =>
              setSelectedJob(
                val?.value || ''
              )
            }

            placeholder="Semua Pekerjaan"

          />

        </div>

    </div>
  )
}