import Select from 'react-select'

import {
  CalendarDays,
  CalendarRange,
  Layers3,
} from 'lucide-react'

type Props = {

  viewType: string
  setViewType: any

  month: number
  setMonth: any

  year: number
  setYear: any

  months: string[]

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

  month,
  setMonth,

  year,
  setYear,

  months,

  hideFogging,

}: Props) {

  const viewOptions = [

    {
      value: 'weekly',
      label: 'Weekly',
    },

    {
      value: 'monthly',
      label: 'Monthly',
    },
  ]

  if (!hideFogging) {

    viewOptions.push({

      value: 'fogging',
      label: 'Fogging',
    })
  }

  const monthOptions =

    months.map(
      (
        monthName,
        index
      ) => ({

        value: index + 1,

        label: monthName,
      })
    )

  const yearOptions = [

    {
      value: 2025,
      label: '2025',
    },

    {
      value: 2026,
      label: '2026',
    },

    {
      value: 2027,
      label: '2027',
    },
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

      {/* MONTH */}
      <div className="relative">

        <CalendarDays
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

          options={monthOptions}

          value={
            monthOptions.find(
              (item) =>
                item.value ===
                month
            )
          }

          onChange={(val: any) =>
            setMonth(
              val?.value
            )
          }

        />

      </div>

      {/* YEAR */}
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

        <Select

          styles={selectStyles}

          isSearchable={false}

          options={yearOptions}

          value={
            yearOptions.find(
              (item) =>
                item.value ===
                year
            )
          }

          onChange={(val: any) =>
            setYear(
              val?.value
            )
          }

        />

      </div>

    </div>
  )
}