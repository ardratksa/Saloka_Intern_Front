import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getWorkPrograms,
  uploadEvidence,
} from '@/api/workProgram'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Layers3,
  Tag,
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
  scheduled_dates?: number[]
    month?: number
    year?: number
}

export default function WorkPlanPage() {
  const queryClient = useQueryClient()

  const [filterType, setFilterType] = useState('all')

  const [filterLocation, setFilterLocation] =
  useState('all')

  const [filterCategory, setFilterCategory] =
  useState('all')

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

  const [previewImage, setPreviewImage] =
  useState<string | null>(null)

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
  
      const today = new Date().getDate()

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
              grid
              grid-cols-3
              gap-2
              mb-5
            "
          >

            <Select
              value={filterType}
              onValueChange={setFilterType}
            >

              <SelectTrigger
                className="
                  rounded-2xl
                  h-14
                  border-green-500
                "
              >

                <div className="flex items-center gap-2">

                  <Layers3
                    className="
                      h-5
                      w-5
                      text-slate-400
                    "
                  />

                  <SelectValue />

                </div>

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  Semua
                </SelectItem>

                <SelectItem value="weekly">
                  Weekly
                </SelectItem>

                <SelectItem value="monthly">
                  Monthly
                </SelectItem>

              </SelectContent>

            </Select>

            <Select
              value={filterLocation}
              onValueChange={setFilterLocation}
            >

              <SelectTrigger
                className="
                  rounded-2xl
                  h-14
                "
              >

                <div className="flex items-center gap-2">

                  <MapPin
                    className="
                      h-5
                      w-5
                      text-slate-400
                    "
                  />

                  <SelectValue placeholder="Lokasi" />

                </div>

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  Lokasi
                </SelectItem>

                {[
                  ...new Set(
                    (plans?.data ?? [])
                      .map(
                        (item: StaffWorkProgram) =>
                          item.location_name
                      )
                      .filter(Boolean)
                  ),
                ].map((loc) => (

                  <SelectItem
                    key={String(loc)}
                    value={String(loc)}
                  >
                    {String(loc)}
                  </SelectItem>

                ))}

              </SelectContent>

            </Select>

            <Select
              value={filterCategory}
              onValueChange={setFilterCategory}
            >

              <SelectTrigger
                className="
                  rounded-2xl
                  h-14
                "
              >

                <div className="flex items-center gap-2">

                  <Tag
                    className="
                      h-5
                      w-5
                      text-slate-400
                    "
                  />

                  <SelectValue />

                </div>

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="all">
                  Kategori
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

          {(plans?.data ?? [])

          .filter((plan: StaffWorkProgram) =>

            filterType === 'all'
              ? plan.scheduled_dates?.includes(today)
              : true

          )

          .filter((plan: StaffWorkProgram) =>

            filterLocation === 'all'
              ? true
              : plan.location_name === filterLocation

          )

          .filter((plan: StaffWorkProgram) =>

            filterCategory === 'all'
              ? true
              : plan.category === filterCategory

          )

          .map(
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

                  <h3
                    className="
                      text-lg
                      font-bold
                      text-gray-900
                      mt-2
                    "
                  >
                    {plan.job?.job}
                  </h3>

                  <div className="mt-3 space-y-1">

                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{plan.location_name}</span>
                    </div>

                    <p className="text-xs text-gray-500 pl-6">
                      {plan.sub_location}
                    </p>

                    {plan.scheduled_dates && (

                      <p
                        className="
                          text-xs
                          text-brand-600
                          font-medium
                          pl-6
                          mt-1
                        "
                      >
                        📅 {plan.scheduled_dates?.join(', ')}
                        {' '}
                        {new Date(
                          plan.year!,
                          plan.month! - 1
                        ).toLocaleString(
                          'id-ID',
                          { month: 'short' }
                        )}
                      </p>

                    )}

                    <div className="flex flex-wrap gap-2 mt-3">

                      <span
                        className={cn(
                          `
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-medium
                          `,
                          plan.category === 'plan'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        )}
                      >
                        {plan.category === 'plan'
                          ? 'On Plan'
                          : 'Out Plan'}
                      </span>

                      {plan.time_range && (

                        <span
                          className="
                            px-3
                            py-1
                            rounded-full
                            bg-gray-100
                            text-gray-700
                            text-xs
                            font-medium
                          "
                        >
                          🕒 {plan.time_range}
                        </span>

                      )}

                    </div>

                  </div>

                  

                </div>

              </div>

              <div className="mt-4 flex justify-end">

                {plan.status === 'pending' && (
                  <span
                    className="
                      px-3 py-1
                      rounded-full
                      bg-amber-100
                      text-amber-700
                      text-xs
                      font-semibold
                    "
                  >
                    Menunggu Bukti
                  </span>
                )}

                {plan.status === 'done' && (
                  <span
                    className="
                      px-3 py-1
                      rounded-full
                      bg-green-100
                      text-green-700
                      text-xs
                      font-semibold
                    "
                  >
                    Pekerjaan Selesai
                  </span>
                )}

                {plan.status === 'late' && (
                  <span
                    className="
                      px-3 py-1
                      rounded-full
                      bg-red-100
                      text-red-700
                      text-xs
                      font-semibold
                    "
                  >
                    Terlambat
                  </span>
                )}

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
                text-xl
                font-bold
                text-gray-900
              "
            >
              Upload Bukti Pekerjaan
            </h3>

            <div
              className="
                mb-5
                rounded-2xl
                bg-gray-50
                border
                border-gray-100
                p-4
              "
            >

              <h4
                className="
                  font-semibold
                  text-gray-900
                "
              >
                {selectedPlan.job?.job}
              </h4>

              <div
                className="
                  mt-3
                  space-y-2
                  text-sm
                  text-gray-600
                "
              >

                <div className="flex items-center gap-2">

                  <MapPin className="w-4 h-4" />

                  <span>
                    {selectedPlan.location_name}
                  </span>

                </div>

                <div className="flex items-center gap-2">

                  <Calendar className="w-4 h-4" />

                  <span>
                    {selectedPlan.time_range}
                  </span>

                </div>

              </div>

            </div>
            <div className="space-y-3">

              <div
                onClick={() =>
                  beforeCameraRef.current?.click()
                }
                className="
                  border-2
                  border-dashed
                  border-gray-200
                  rounded-3xl
                  p-6
                  text-center
                  cursor-pointer
                  transition-all
                  hover:border-brand-500
                  hover:bg-brand-50
                "
              >
                <p className="font-semibold text-gray-800">
                  Foto Sebelum
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Dokumentasikan kondisi sebelum pekerjaan dimulai
                </p>
              </div>

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

                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      text-gray-500
                      mb-2
                    "
                  >
                    Preview Foto Sebelum
                  </p>

                  <img
                    onClick={() =>
                      setPreviewImage(
                        URL.createObjectURL(beforeImage)
                      )
                    }
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

                </div>

              )}

            </div>

            <div className="space-y-3 mt-4">

              <div
                onClick={() =>
                  afterCameraRef.current?.click()
                }
                className="
                  border-2
                  border-dashed
                  border-green-200
                  rounded-3xl
                  p-6
                  text-center
                  cursor-pointer
                  transition-all
                  hover:border-green-500
                  hover:bg-green-50
                "
              >
                <p className="font-semibold text-gray-800">
                  Foto Sesudah
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Dokumentasikan hasil setelah pekerjaan selesai
                </p>
              </div>

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

                <div>

                  <p
                    className="
                      text-xs
                      font-medium
                      text-gray-500
                      mb-2
                    "
                  >
                    Preview Foto Sesudah
                  </p>

                  <img
                    onClick={() =>
                      setPreviewImage(
                        URL.createObjectURL(afterImage)
                      )
                    }
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

                </div>

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
                onClick={() => {

                  const confirmed = window.confirm(
                    'Pastikan foto sebelum dan sesudah sudah benar?'
                  )

                  if (!confirmed) return

                  uploadMut.mutate()

                }}
              >
                Selesaikan Pekerjaan
              </Button>

            </div>

          </div>

        </div>

      )}

      {previewImage && (

        <div
          className="
            fixed
            inset-0
            bg-black/95
            z-[999]
            flex
            items-center
            justify-center
            p-4
          "
          onClick={() =>
            setPreviewImage(null)
          }
        >

          <button
            className="
              absolute
              top-5
              right-5
              text-white
              text-3xl
            "
          >
            ×
          </button>

          <img
            src={previewImage}
            alt=""
            className="
              max-w-[95vw]
              max-h-[90vh]
              object-contain
            "
          />

        </div>

      )}

    </div>
    
  )
}