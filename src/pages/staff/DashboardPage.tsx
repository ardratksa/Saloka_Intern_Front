import { useQuery } from '@tanstack/react-query'
import { getDailySummary } from '@/api/checklist'
import { useAuthStore } from '@/store/authStore'
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDailySummary(),
  })
  

  if (isLoading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    )
  }

  const areaDone =
  data?.summary?.location_done ?? 0

  const areaTotal =
    data?.summary?.location_total ?? 0

  const jobDone =
    data?.summary?.job_done ?? 0

  const jobTotal =
    data?.summary?.job_total ?? 0

  const totalIssue =
    data?.locations?.reduce(
      (sum: number, item: any) =>
        sum + item.issue,
      0
    ) ?? 0

  const avgScore =
    data?.summary?.avg_score ?? 0

  return (
    <div className="p-4 space-y-5">

      {/* HERO */}

      <div
        className="
          rounded-3xl
          p-5
          bg-linear-to-br
          from-brand-600
          via-green-600
          to-emerald-500
          text-white
          shadow-xl
        "
      >

        <p className="text-sm opacity-90">
          Cleaning Service Dashboard
        </p>

        <h1 className="text-2xl font-bold mt-1">
          {user?.name}
        </h1>

        <p className="text-sm opacity-80 mt-1">
          Ringkasan aktivitas cleaning service hari ini
        </p>

        <div className="mt-5 flex items-center gap-3">

          <div
            className="
              bg-white/20
              backdrop-blur
              rounded-2xl
              px-4
              py-3
            "
          >
            <p className="text-xs opacity-80">
              Performance
            </p>

            <p className="text-xl font-bold">
              {avgScore}%
            </p>
          </div>

          <div
            className="
              bg-white/20
              backdrop-blur
              rounded-2xl
              px-4
              py-3
            "
          >
            <p className="text-xs opacity-80">
              Area
            </p>

            <p className="text-xl font-bold">
              {areaDone}/{areaTotal}
            </p>
          </div>

        </div>

      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 gap-3">

        <div
          className="
            bg-white
            rounded-3xl
            p-4
            shadow-sm
            border
          "
        >
          <MapPin className="w-6 h-6 text-brand-600 mb-3" />

          <p className="text-gray-500 text-xs">
            Lokasi Dicek
          </p>

          <p className="text-3xl font-bold mt-1">
            {areaDone}
            <span className="text-lg text-gray-400">
              /{areaTotal}
            </span>
          </p>
        </div>

        <div
          className="
            bg-white
            rounded-3xl
            p-4
            shadow-sm
            border
          "
        >
          <CheckCircle2 className="w-6 h-6 text-green-600 mb-3" />

          <p className="text-gray-500 text-xs">
            Job Selesai
          </p>

          <p className="text-3xl font-bold mt-1">
            {jobDone}
            <span className="text-lg text-gray-400">
              /{jobTotal}
            </span>
          </p>
        </div>

        <div
          className="
            bg-white
            rounded-3xl
            p-4
            border
            border-red-200
            shawdow-sm
          "
        >
          <AlertTriangle className="w-6 h-6 text-red-500 mb-3" />

          <p className="text-red-500 text-xs">
            Total Issue
          </p>

          <p className="text-3xl font-bold text-red-600 mt-1">
            {totalIssue}
          </p>
        </div>

        <div
          className="
            bg-white
            rounded-3xl
            p-4
            border
            border-amber-200
          "
        >
          <ShieldCheck className="w-6 h-6 text-amber-500 mb-3" />

          <p className="text-amber-600 text-xs">
            Quality Score
          </p>

          <p className="text-3xl font-bold text-amber-700 mt-1">
            {avgScore}
          </p>
        </div>

      </div>

      {/* LOKASI */}

      <div>

        <h2 className="font-bold text-gray-900 mb-3">
          Lokasi Hari Ini
        </h2>

        <div className="space-y-3">

          {data?.locations?.map((loc: any) => (

            <div
              key={loc.location_id}
              className="
                bg-white
                rounded-3xl
                p-4
                shadow-sm
                border
              "
            >

              <div className="flex justify-between">

                <div>

                  <p className="font-bold text-gray-900">
                    {loc.location_name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {loc.type}
                  </p>

                </div>

                <div className="text-right">

                  <p className="text-2xl font-bold text-brand-600">
                    {loc.progress}%
                  </p>

                </div>

              </div>

              <div className="mt-3">

                <div className="h-2 bg-gray-100 rounded-full">

                  <div
                    className="
                      h-full
                      bg-brand-600
                      rounded-full
                    "
                    style={{
                      width: `${loc.progress}%`,
                    }}
                  />

                </div>

              </div>

              <div className="flex gap-2 mt-3">

                <span
                  className="
                    px-2 py-1
                    rounded-full
                    text-xs
                    bg-green-100
                    text-green-600
                  "
                >
                  ✓ {loc.done}
                </span>

                {loc.issue > 0 && (
                  <span
                    className="
                      px-2 py-1
                      rounded-full
                      text-xs
                      bg-red-100
                      text-red-600
                    "
                  >
                    ⚠ {loc.issue}
                  </span>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}