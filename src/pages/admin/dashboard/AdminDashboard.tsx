import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getDailySummary } from '@/api/checklist'
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Eye,
  Download,
} from 'lucide-react'

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
  status: 'OK' | 'Perlu Perbaikan' | 'Tidak OK'
}

type Summary = {
  total: number
  ok: number
  perbaikan: number
  tidak_ok: number
  avg_score: number
}

export default function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const [dateFrom, setDateFrom] = useState(today)
  const [filterLoc, setFilterLoc] = useState('all')
  const [filterShift, setFilterShift] = useState('all')
  const [detail, setDetail] = useState<Session | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['daily-summary', dateFrom],
    queryFn: () => getDailySummary(dateFrom),
    refetchInterval: 30000,
  })

  const summary = {
    total: 128,
    ok: 102,
    perbaikan: 18,
    tidak_ok: 8,
    avg_score: 88,
  }

  const dummySessions: Session[] = [

    {
      id: 1,
      date: '26 Mei 2024',
      time: '08:15',
      location: 'Toilet Pesisir',
      location_type: 'Toilet',
      shift: 'Pagi',
      shift_time: 'Pagi',
      pic: 'Rudi Hartono',
      total: 20,
      done: 20,
      issue: 0,
      score: 100,
      status: 'OK',
    },

    {
      id: 2,
      date: '26 Mei 2024',
      time: '13:10',
      location: 'Toilet Rimba Resto',
      location_type: 'Toilet',
      shift: 'Siang',
      shift_time: 'Siang',
      pic: 'Siti Aminah',
      total: 20,
      done: 15,
      issue: 5,
      score: 75,
      status: 'Perlu Perbaikan',
    },

    {
      id: 3,
      date: '26 Mei 2024',
      time: '18:20',
      location: 'Toilet Kamayayi',
      location_type: 'Toilet',
      shift: 'Malam',
      shift_time: 'Malam',
      pic: 'Ahmad Fauzi',
      total: 20,
      done: 12,
      issue: 8,
      score: 60,
      status: 'Tidak OK',
    },
  ]

  const sessions =

    dummySessions.filter((s) => {

      if (
        filterLoc !== 'all' &&
        s.location !== filterLoc
      ) {
        return false
      }

      if (
        filterShift !== 'all' &&
        s.shift_time !== filterShift
      ) {
        return false
      }

      return true
    })

  const locations = Array.from(
    new Set(
      (data?.sessions ?? []).map((s: Session) => s.location)
    )
  ) as string[]

  const shiftTimes = Array.from(
    new Set(
      (data?.sessions ?? []).map((s: Session) => s.shift_time)
    )
  ) as string[]

  const statusColor = (status: string) => {
    if (status === 'OK') {
      return 'text-green-600 bg-green-50 border-green-200'
    }

    if (status === 'Perlu Perbaikan') {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }

    return 'text-red-600 bg-red-50 border-red-200'
  }

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

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
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        />

        <select
          value={filterLoc}
          onChange={(e) => setFilterLoc(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">Semua Lokasi</option>

          {locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        <select
          value={filterShift}
          onChange={(e) => setFilterShift(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
        >
          <option value="all">Semua Shift</option>

          {shiftTimes.map((shift) => (
            <option key={shift} value={shift}>
              {shift}
            </option>
          ))}
        </select>

        <button
          onClick={() => window.print()}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

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

        {/* PERBAIKAN */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Perlu Perbaikan</p>
            <p className="text-2xl font-bold text-yellow-600">
              {summary.perbaikan}
            </p>
          </div>
        </div>

        {/* TIDAK OK */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>

          <div>
            <p className="text-xs text-gray-500">Tidak OK</p>
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
                sessions.map((s, i) => (
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
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                Detail Checklist
              </h2>

              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-500">Lokasi</span>
                <span className="font-medium">{detail.location}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Tanggal</span>
                <span className="font-medium">{detail.date}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Shift</span>
                <span className="font-medium">{detail.shift}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">PIC</span>
                <span className="font-medium">{detail.pic}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Score</span>
                <span className={`font-bold ${scoreColor(detail.score)}`}>
                  {detail.score}%
                </span>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}