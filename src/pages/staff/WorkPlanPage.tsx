import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWorkPrograms,
  uploadEvidence,
} from '@/api/workProgram'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Wrench,
  MapPin,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
type StaffWorkProgram = {
  id: number

  location_name?: string
  sub_location?: string

  category: 'plan' | 'out_plan'
  plan: 'weekly' | 'monthly'

  time_range?: string

  status: 'pending' | 'done' | 'late'

  has_evidence: boolean

  job?: {
    job?: string
  }
}

export default function WorkPlanPage() {
  const queryClient = useQueryClient()

  const [filterType, setFilterType] = useState('all')

  const [selectedPlan, setSelectedPlan] =
  useState<StaffWorkProgram | null>(null)

  const [beforeImage, setBeforeImage] =
  useState<File | null>(null)

  const [afterImage, setAfterImage] =
  useState<File | null>(null)

  const beforeCameraRef =
  useRef<HTMLInputElement>(null)

  const afterCameraRef =
  useRef<HTMLInputElement>(null)

  const { data: plans, isLoading } = useQuery({
    queryKey: ['work-plans', filterType],
    queryFn: () =>
      getWorkPrograms(
        filterType !== 'all'
          ? { plan: filterType }
          : undefined
      ),
  })


  const uploadMut = useMutation({
    mutationFn: () =>
     uploadEvidence(
      selectedPlan!.id,
      beforeImage!,
      afterImage!
    ),

    onSuccess: () => {

      toast.success(
        'Bukti pekerjaan berhasil disimpan'
      )

     queryClient.invalidateQueries()

      setSelectedPlan(null)
      setBeforeImage(null)
      setAfterImage(null)
    },

        onError: (err: any) => {
  console.log(err)

  toast.error(
    err?.response?.data?.message ||
    'Gagal upload bukti'
  )
}
      })

  return (
    <div className="p-4">

      <div
        className="
          rounded-3xl
          p-5
          mb-6
          bg-linear-to-br
          from-brand-600
          via-green-600
          to-emerald-500
          text-white
          shadow-xl
        "
      >
        <p className="text-sm opacity-90">
          Maintenance Task
        </p>

        <h1 className="text-2xl font-bold mt-1">
          Work Plan
        </h1>

        <p className="text-sm opacity-80 mt-1">
          Daftar pekerjaan dari admin
        </p>
      </div>

      <div
        className="
          flex
          gap-2
          mb-5
          overflow-x-auto
          pb-1
        "
      >

        {['all', 'weekly', 'monthly'].map((t) => (

          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              `
                px-5
                py-2.5
                rounded-full
                text-sm
                font-semibold
                whitespace-nowrap
                transition-all
              `,
              filterType === t
                ? `
                    bg-brand-600
                    text-white
                    shadow-md
                  `
                : `
                    bg-white
                    border
                    border-gray-200
                    text-gray-600
                  `
            )}
          >
            {t === 'all'
              ? 'Semua'
              : t === 'weekly'
              ? 'Weekly'
              : 'Monthly'}
          </button>

        ))}

      </div>

      {isLoading ? (

        <div className="space-y-3">

          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-32 rounded-3xl"
            />
          ))}

        </div>

      ) : (plans?.data?.length ?? 0) === 0 ? (

        <div className="bg-white rounded-3xl border p-10 text-center">

          <Wrench className="w-10 h-10 mx-auto text-gray-300 mb-3" />

          <p className="text-gray-400">
            Belum ada Work Plan
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {(plans?.data ?? []).map(
            (plan: StaffWorkProgram) => (

            <div
              key={plan.id}
              className="
                bg-white
                rounded-3xl
                border
                border-gray-100
                p-4
                shadow-sm
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex gap-2 mb-2">

                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-semibold',
                        plan.plan === 'weekly'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      )}
                    >
                      {plan.plan === 'weekly'
                        ? 'Weekly'
                        : 'Monthly'}
                    </span>

                  </div>

                  <h3 className="font-bold text-gray-900">
                    {plan.job?.job}
                  </h3>

                  <div className="flex gap-3 mt-2 text-xs text-gray-500">

                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {plan.location_name}
                      <p className="text-xs text-gray-400 mt-1">
                        {plan.sub_location}
                      </p>
                    </span>

                    {plan.time_range && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {plan.time_range}
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    {plan.category === 'plan'
                      ? 'Program Kerja'
                      : 'Out Plan'}
                  </p>

                </div>

              </div>

              <div className="mt-4">

                <div className="h-2 bg-gray-100 rounded-full">

                  <div
                    className={cn(
                      'h-full rounded-full',
                      plan.status === 'done'
                      ? 'bg-green-500 w-full'
                      : 'bg-gray-300 w-1/4'
                    )}
                  />

                </div>

              </div>

              <div className="mt-4">

                {plan.status === 'pending' && (
                  <Button
                    className="w-full bg-brand-600"
                    onClick={() => {
                      setSelectedPlan(plan)
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Upload Bukti Pekerjaan
                  </Button>
                )}

                {plan.status === 'done' && (
                  <div
                    className="
                      h-11
                      rounded-2xl
                      bg-green-100
                      text-green-700
                      font-semibold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    ✓ Pekerjaan Selesai
                  </div>
                )}

                {plan.status === 'late' && (
                  <div
                    className="
                      h-11
                      rounded-2xl
                      bg-red-100
                      text-red-700
                      font-semibold
                      flex
                      items-center
                      justify-center
                    "
                  >
                    ⚠ Terlambat
                  </div>
                )}

              </div>

            </div>

          ))}

        </div>

      )}

      {selectedPlan && (

        <div
          className="
            fixed inset-0
            bg-black/60
            z-50
            flex items-end
          "
        >

          <div
            className="
              bg-white
              rounded-t-3xl
              p-5
              w-full
            "
          >

            <h3
              className="
                text-lg
                font-bold
                mb-2
              "
            >
              Upload Bukti Pekerjaan
            </h3>

            <p
              className="
                text-sm
                text-gray-500
                mb-4
              "
            >
              {selectedPlan.job?.job}
            </p>

            <div className="space-y-3">

              <Button
                className="w-full"
                onClick={() =>
                  beforeCameraRef.current?.click()
                }
              >
                📸 Foto Sebelum
              </Button>

              <input
                ref={beforeCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {

                  const file =
                    e.target.files?.[0]

                  if (file) {
                    setBeforeImage(file)
                  }

                }}
              />

              {beforeImage && (

                <img
                  src={URL.createObjectURL(
                    beforeImage
                  )}
                  alt=""
                  className="
                    w-full
                    h-40
                    object-cover
                    rounded-2xl
                  "
                />

              )}

            </div>

            <div className="space-y-3 mt-4">

              <Button
                className="w-full bg-green-600"
                onClick={() =>
                  afterCameraRef.current?.click()
                }
              >
                📷 Foto Sesudah
              </Button>

              <input
                ref={afterCameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {

                  const file =
                    e.target.files?.[0]

                  if (file) {
                    setAfterImage(file)
                  }

                }}
              />

              {afterImage && (

                <img
                  src={URL.createObjectURL(
                    afterImage
                  )}
                  alt=""
                  className="
                    w-full
                    h-40
                    object-cover
                    rounded-2xl
                  "
                />

              )}

            </div>

            <div className="flex gap-2">

              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {

                  setSelectedPlan(null)

                  setBeforeImage(null)
                  setAfterImage(null)

                }}
              >
                Batal
              </Button>

              <Button
                className="flex-1 bg-green-600"
                disabled={
                  !beforeImage ||
                  !afterImage ||
                  uploadMut.isPending
                }
                onClick={() =>
                  uploadMut.mutate()
                }
              >
                Simpan
              </Button>

            </div>

          </div>

        </div>

      )}

    </div>
    
  )
}