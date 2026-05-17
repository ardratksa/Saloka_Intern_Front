import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  searchPlaceholder?: string
  onSearch?: (q: string) => void
  actions?: (row: T) => React.ReactNode
  headerRight?: React.ReactNode
  title?: string
  subtitle?: string
}

const PAGE_SIZE_OPTIONS = [10, 25, 50]

export function DataTable<T extends { id: number }>({
  data,
  columns,
  isLoading,
  searchPlaceholder = 'Cari...',
  onSearch,
  actions,
  headerRight,
  title,
  subtitle,
}: DataTableProps<T>) {

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const filtered = data.filter((row) => {
    if (!search) return true

    return Object.values(row as Record<string, unknown>).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  })

  const totalPages = Math.ceil(filtered.length / pageSize)

  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const handleSearch = (q: string) => {
    setSearch(q)
    setPage(1)
    onSearch?.(q)
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      {(title || headerRight) && (
        <div className="px-6 pt-6">

          {/* Title */}
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h1 className="text-4xl font-bold text-gray-900">
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className="text-base text-gray-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Search + Action */}
          <div className="flex items-center justify-end mt-6 gap-4">

            {/* Search */}
            <div className="relative w-80">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2
                           w-5 h-5 text-gray-400"
              />

              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl
                           border border-gray-200 bg-white
                           text-base
                           focus:outline-none focus:ring-2
                           focus:ring-brand-500"
              />
            </div>

            {/* Button */}
            {headerRight}
          </div>

          {/* Rows Pagination */}
          <div className="flex items-center justify-between mt-5
                          text-sm text-gray-500">

            <div className="flex items-center gap-3">

              <span>Rows per page</span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="border border-gray-200 rounded-xl
                           px-3 py-2 bg-white focus:outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <span>
                Page {page} of {totalPages || 1}
              </span>
            </div>

            <div className="flex items-center gap-2">

              <span>
                {filtered.length === 0
                  ? 0
                  : (page - 1) * pageSize + 1}

                {' – '}

                {Math.min(page * pageSize, filtered.length)}

                {' of '}

                {filtered.length}
              </span>

              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-1 rounded-lg border border-gray-200
                           hover:bg-gray-50
                           disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="p-1 rounded-lg border border-gray-200
                           hover:bg-gray-50
                           disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="px-6 pt-6 pb-16">
        <div className="bg-white rounded-3xl border border-gray-100
                        overflow-hidden shadow-sm">

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-gray-100 bg-[#fafafa]">

                <th
                  className="text-left px-5 py-4 text-xs font-medium
                             text-gray-500 uppercase tracking-wide w-14"
                >
                  No
                </th>

                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'text-left px-5 py-4 text-xs font-medium',
                      'text-gray-500 uppercase tracking-wide',
                      col.width
                    )}
                  >
                    {col.label}
                  </th>
                ))}

                {actions && (
                  <th
                    className="text-center px-5 py-4 text-xs font-medium
                               text-gray-500 uppercase tracking-wide w-28"
                  >
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">

              {isLoading ? (

                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td
                      colSpan={columns.length + (actions ? 2 : 1)}
                      className="px-5 py-4"
                    >
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))

              ) : paginated.length === 0 ? (

                <tr>
                  <td
                    colSpan={columns.length + (actions ? 2 : 1)}
                    className="px-5 py-14 text-center
                               text-gray-400 text-sm"
                  >
                    Tidak ada data
                  </td>
                </tr>

              ) : (

                paginated.map((row, idx) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#fafafa] transition-colors"
                  >

                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {(page - 1) * pageSize + idx + 1}
                    </td>

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-5 py-4 text-gray-700"
                      >
                        {col.render
                          ? col.render(row)
                          : String(
                              (row as Record<string, unknown>)[col.key] ?? '-'
                            )}
                      </td>
                    ))}

                    {actions && (
                      <td className="px-5 py-4 text-center">
                        {actions(row)}
                      </td>
                    )}
                  </tr>
                ))

              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}