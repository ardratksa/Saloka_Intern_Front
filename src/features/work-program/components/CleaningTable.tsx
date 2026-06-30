import {
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react'

import type {
  WorkProgram,
} from '../types/workProgram'

interface Props {

  data: WorkProgram[]

  isLoading: boolean

  viewType: string

  onPreview: (
    item: WorkProgram
  ) => void

  onEdit: (
    item: WorkProgram
  ) => void

  onDelete: (
    id: number
  ) => void
}

export default function CleaningTable({

  data,

  isLoading,

  viewType,

  onPreview,

  onEdit,

  onDelete,

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
          item.location_type_id === 3
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
          border-b border-gray-200
          px-7 py-5
        "
      >

        <h3
          className="
            text-lg
            font-semibold
            text-gray-900
          "
        >
          Daftar Program Kerja
        </h3>

        <p
          className="
            mt-1
            text-sm
            text-gray-500
          "
        >
          Jadwal pekerjaan yang telah dibuat
        </p>

      </div>

      {/* TABLE */}

      <div className="overflow-auto">

        <table className="min-w-full">

          <thead>

            <tr className="bg-emerald-700 text-white">

              <th className="px-7 py-4 text-left">
                Pekerjaan
              </th>

              <th className="px-7 py-4 text-left">
                Area
              </th>

              <th className="px-7 py-4 text-center">
                Waktu
              </th>

              <th className="px-7 py-4 text-center">
                Jenis
              </th>

              <th className="px-7 py-4 text-center">
                Jadwal
              </th>

              <th className="px-7 py-4 text-center">
                Aksi
              </th>

            </tr>

          </thead>

          <tbody>

            {isLoading && (

              <tr>

                <td
                  colSpan={6}
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
                  colSpan={6}
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
                (item) => (

                <tr
                  key={item.id}
                  className="
                    border-t border-gray-100
                    hover:bg-gray-50
                  "
                >

                  {/* PEKERJAAN */}

                  <td
                    className="
                      px-7 py-5
                    "
                  >

                    <p
                      className="
                        font-semibold
                        text-gray-900
                      "
                    >
                      {item.job?.job}
                    </p>

                  </td>

                  {/* AREA */}

                  <td
                    className="
                      px-7 py-5
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          text-gray-700
                        "
                      >
                        {item.location_name}
                      </p>

                      <p
                        className="
                          text-xs
                          text-gray-500
                        "
                      >
                        {item.sub_location}
                      </p>

                    </div>

                  </td>

                  {/* WAKTU */}

                    <td
                      className="
                        px-7 py-5
                        text-center
                      "
                    >

                      <span
                        className="
                          text-sm
                          font-medium
                          text-gray-700
                        "
                      >
                        {item.time_range || '-'}
                      </span>

                    </td>

                  {/* JENIS */}

                  <td
                    className="
                      px-7 py-5
                      text-center
                    "
                  >

                    <span
                      className={`
                        rounded-full
                        px-4 py-1
                        text-sm
                        font-medium

                        ${
                          item.plan === 'weekly'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                        }
                      `}
                    >
                      {item.plan}
                    </span>

                  </td>

                  {/* JUMLAH TANGGAL */}

                  <td
                    className="
                      px-7 py-5
                      text-center
                    "
                  >

                    <span
                      className="
                        rounded-full
                        bg-gray-100
                        px-3 py-1
                        text-xs
                        font-medium
                        text-gray-700
                      "
                    >

                      {
                        item
                          .scheduled_dates
                          ?.length || 0
                      } Hari

                    </span>

                  </td>

                  {/* AKSI */}

                  <td
                    className="
                      px-7 py-5
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >

                      <button
                        onClick={() =>
                          onPreview(
                            item
                          )
                        }
                        className="
                          rounded-xl
                          p-2
                          text-sky-600
                          hover:bg-sky-50
                        "
                      >
                        <Eye
                          className="
                            h-4 w-4
                          "
                        />
                      </button>

                      <button
                        onClick={() =>
                          onEdit(
                            item
                          )
                        }
                        className="
                          rounded-xl
                          p-2
                          text-amber-600
                          hover:bg-amber-50
                        "
                      >
                        <Pencil
                          className="
                            h-4 w-4
                          "
                        />
                      </button>

                      <button
                        onClick={() =>
                          onDelete(
                            item.id
                          )
                        }
                        className="
                          rounded-xl
                          p-2
                          text-red-600
                          hover:bg-red-50
                        "
                      >
                        <Trash2
                          className="
                            h-4 w-4
                          "
                        />
                      </button>

                    </div>

                  </td>

                </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}