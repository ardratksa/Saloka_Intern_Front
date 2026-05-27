import {
  Check,
} from 'lucide-react'

import type {
  WorkProgram,
} from '../types/workProgram'

interface Props {

  days: number[]

  data: WorkProgram[]

  isLoading: boolean

  viewType: string

  weekIndex: number

  year: number

  month: number

  setWeekIndex: React.Dispatch<
    React.SetStateAction<number>
  >

  handleClickCell: (
    item: WorkProgram,
    day: number
  ) => void
}

export default function CleaningTable({

  days,
  data,
  isLoading,
  viewType,
  weekIndex,
  year,
  month,
  setWeekIndex,
  handleClickCell,

}: Props) {

  const filteredData =
    data.filter(
      (item: any) => {

        if (
          viewType ===
          'fogging'
        ) {

          return (
            item.location_type_id === 8
          )
        }

        return (
          item.location_type_id === 7
        )
      }
    )

  return (

    <div
      className="
        overflow-hidden
        rounded-2xl
        border border-gray-200
        bg-white
      "
    >

      {/* HEADER */}
      <div
        className="
          flex items-center
          justify-between
          border-b border-gray-200
          px-7 py-5
        "
      >

        <div
          className="
            text-lg
            font-semibold
            text-gray-800
          "
        >

          {
            viewType === 'fogging'

              ? 'Fogging View'

              : viewType === 'monthly'

                ? 'Monthly View'

                : `Minggu ${weekIndex + 1}`
          }

        </div>

        {viewType === 'weekly' && (

          <div className="flex gap-3">

            <button

              onClick={() =>

                setWeekIndex(
                  (prev) =>
                    Math.max(
                      prev - 1,
                      0
                    )
                )

              }

              className="
                rounded-xl
                border border-gray-200
                bg-white
                px-4 py-2
                text-sm
                font-medium
                text-gray-700
                transition-all
                hover:bg-gray-50
              "
            >
              Prev
            </button>

            <button

              onClick={() =>

                setWeekIndex((prev) => {

                  const totalWeeks =
                    Math.ceil(
                      new Date(
                        year,
                        month,
                        0
                      ).getDate() / 7
                    )

                  return Math.min(
                    prev + 1,
                    totalWeeks - 1
                  )
                })

              }

              className="
                rounded-xl
                border border-gray-200
                bg-white
                px-4 py-2
                text-sm
                font-medium
                text-gray-700
                transition-all
                hover:bg-gray-50
              "
            >
              Next
            </button>

          </div>

        )}

      </div>

      {/* TABLE */}
      <div className="overflow-auto">

        <table className="min-w-full">

          <thead>

            <tr className="bg-emerald-700 text-white">

              <th
                className="
                  min-w-70
                  px-7 py-5
                  text-left
                  text-sm
                  font-semibold
                "
              >
                Pekerjaan
              </th>

              {days.map((day) => (

                <th
                  key={day}
                  className="
                    min-w-15
                    px-4 py-5
                    text-sm
                    font-semibold
                  "
                >
                  {day}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {isLoading && (

              <tr>

                <td
                  colSpan={
                    days.length + 1
                  }

                  className="
                    py-24
                    text-center
                    text-gray-400
                  "
                >
                  Loading...
                </td>

              </tr>

            )}

            {!isLoading &&
              filteredData.length === 0 && (

              <tr>

                <td
                  colSpan={
                    days.length + 1
                  }

                  className="
                    py-24
                    text-center
                    text-gray-400
                  "
                >
                  Belum ada data
                </td>

              </tr>

            )}

            {!isLoading &&
              filteredData.map(
                (item: WorkProgram) => (

                <tr
                  key={item.id}
                  className="
                    border-t border-gray-100
                    transition-colors
                    hover:bg-gray-50
                  "
                >

                  <td
                    className="
                      px-7 py-5
                    "
                  >

                    <div className="space-y-1">

                      <p
                        className="
                          text-sm
                          font-semibold
                          text-gray-900
                        "
                      >
                        {item.job?.job || 'Pekerjaan'}
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.location_name}
                      </p>

                      <p className="text-xs text-gray-400">
                        {item.sub_location}
                      </p>

                    </div>

                  </td>

                  {days.map((day) => {

                    const active =
                      item.scheduled_dates?.includes(
                        day
                      ) || false

                    return (

                      <td
                        key={day}
                        className="
                          py-4 text-center
                        "
                      >

                        <button

                          onClick={(e) => {

                            e.stopPropagation()

                            handleClickCell(
                              item,
                              day
                            )
                          }}

                          className="
                            mx-auto
                            flex h-10 w-10
                            items-center
                            justify-center
                            rounded-xl
                            transition-all
                            hover:scale-105
                          "
                        >

                          {active ? (

                            <div
                              className="
                                flex h-10 w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-emerald-100
                              "
                            >

                              <Check
                                className="
                                  h-5 w-5
                                  text-emerald-600
                                "
                              />

                            </div>

                          ) : (

                            <div
                              className="
                                flex h-10 w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-gray-100
                              "
                            >

                              <div
                                className="
                                  h-4 w-4
                                  rounded
                                  border border-gray-300
                                "
                              />

                            </div>

                          )}

                        </button>

                      </td>

                    )

                  })}

                </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}