import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getChecklist, updateChecklist, uploadChecklistDoc, } from '@/api/checklist'
import { getActivePeriod } from '@/api/period'
import { createIssue } from '@/api/issue'
import { getMasterIssues } from '@/api/masterIssue'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  MapPin,
  Clock,
  QrCode,
  Loader2,
  Camera,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { ChecklistItem } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

  const MAX_FILE_SIZE = 5 * 1024 * 1024 

  function validateImage(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Ukuran foto maksimal 5 MB")
      return false
    }

    return true
  }

export default function ChecklistPage() {
  const navigate            = useNavigate()
  const queryClient         = useQueryClient()
  const { activeLocation, setActiveLocation, }  = useAuthStore()

  const today = new Date().toISOString().split('T')[0]

  const [openItem,         setOpenItem]         = useState<ChecklistItem | null>(null)
  const [noteVal,          setNoteVal]          = useState('')
  const [showNoteModal,    setShowNoteModal]    = useState(false)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [checklistPhotos, setChecklistPhotos] = useState<Record<number, File>>({})
  const [issueType, setIssueType] = useState('')
  const checklistCameraRef = useRef<HTMLInputElement>(null)
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [showFinishModal, setShowFinishModal] =
  useState(false)
  const [showExitModal, setShowExitModal] =
    useState(false)
  const [sendingIssue, setSendingIssue] = useState(false)
  const [showConfirmIssue, setShowConfirmIssue] = useState(false)

  const { data: activePeriod } = useQuery({
    queryKey: ['active-period'],
    queryFn: getActivePeriod,
    retry: false,
  })

  const { data: masterIssues = [] } = useQuery({
  queryKey: ['master-issues'],
  queryFn: getMasterIssues,
})

  const selectedPeriodId = activePeriod?.id?.toString() ?? ''

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
    queryFn:  () => getChecklist({
      location_id: activeLocation!.id,
      periode_id:  Number(selectedPeriodId),
      date:        today,
    }),
    enabled: !!activeLocation && !!selectedPeriodId,
  })

  const totalItems = checklist?.items?.length ?? 0

  const doneItems =
    checklist?.items?.filter(
      i => i.status === 'done'
    ).length ?? 0

  const progress =
    totalItems > 0
      ? Math.round(
          (doneItems / totalItems) * 100
        )
      : 0

  const allChecked =
    totalItems > 0 &&
    checklist?.items.every(
      item =>
        item.status === 'done' ||
        item.status === 'issue'
    )

  const updateMut = useMutation({
    mutationFn: updateChecklist,

    onMutate: async (variables) => {

      await queryClient.cancelQueries({
        queryKey: [
          'checklist',
          activeLocation?.id,
          selectedPeriodId,
          today,
        ],
      })

      const previousChecklist =
        queryClient.getQueryData([
          'checklist',
          activeLocation?.id,
          selectedPeriodId,
          today,
        ])

      queryClient.setQueryData(
        [
          'checklist',
          activeLocation?.id,
          selectedPeriodId,
          today,
        ],
        (old: any) => {

          if (!old) return old

          return {
            ...old,

            items: old.items.map((item: any) =>

              item.job_id === variables.job_id
                ? {
                    ...item,
                    status:
                      variables.status,
                  }
                : item
            ),
          }

        }
      )

      return {
        previousChecklist,
      }

    },

    onError: (_, __, context) => {

      if (context?.previousChecklist) {

        queryClient.setQueryData(
          [
            'checklist',
            activeLocation?.id,
            selectedPeriodId,
            today,
          ],
          context.previousChecklist
        )

      }

      toast.error("Gagal update")

    },

    onSettled: () => {

      queryClient.invalidateQueries({
        queryKey: [
          'checklist',
          activeLocation?.id,
          selectedPeriodId,
          today,
        ],
      })

    },
  })

  const createIssueMut = useMutation({
    mutationFn: createIssue,

    onSuccess: () => {
      toast.success('Issue berhasil dikirim')

      queryClient.invalidateQueries({
        queryKey: ['issues'],
      })

      queryClient.invalidateQueries({
        queryKey: [
          'checklist',
          activeLocation?.id,
          selectedPeriodId,
          today,
        ],
      })

      setShowNoteModal(false)
      setOpenItem(null)
      setNoteVal('')
      setPhotoFile(null)
      setIssueType(masterIssues[0]?.name ?? '')
    },

    onError: () => {
      toast.error('Gagal mengirim issue')
    },
  })

  const uploadChecklistDocMut = useMutation({

    mutationFn: ({
      checklistId,
      image,
    }: {
      checklistId: number
      image: File
    }) =>
      uploadChecklistDoc(
        checklistId,
        image
      ),

    onSuccess: () => {

      toast.success(
        'Dokumentasi berhasil diupload'
      )

    },

    onError: () => {

      toast.error(
        'Upload dokumentasi gagal'
      )

    },

  })

  const handleToggle = (
    item: ChecklistItem
  ) => {

    if (
      !activeLocation ||
      !selectedPeriodId
    ) return

    updateMut.mutate({

      location_id: activeLocation.id,

      job_id: item.job_id,

      periode_id: Number(selectedPeriodId),

      date: today,

      status:
        item.status === 'done'
          ? 'pending'
          : 'done',

    })
  }

  const handleSaveNote = async () => {
    if (sendingIssue) return

    if (
      !openItem ||
      !activeLocation ||
      !selectedPeriodId
    ) return

    if (!photoFile) {
      toast.error('Foto wajib diupload')
      return
    }

    if (!noteVal.trim()) {
      toast.error('Deskripsi issue wajib diisi')
      return
    }

    try {
      const checklistResult = await updateChecklist({
        location_id: activeLocation.id,
        job_id: openItem.job_id,
        periode_id: Number(selectedPeriodId),
        date: today,
        status: 'issue',
        note: noteVal,
      })

      createIssueMut.mutate(
{
    checklist_id: checklistResult.data.id,

    location_id: activeLocation.id,

    date: today,

    type: issueType,

    description: noteVal,

    before: photoFile,
},
{
    onSuccess: () => {

        toast.success("Issue berhasil dikirim")

        setSendingIssue(false)

    },

    onError: () => {

        toast.dismiss("issue-loading")

        toast.error("Gagal mengirim issue")

        setSendingIssue(false)

    }
}
)
    } catch (err) {

      setSendingIssue(true)

      

        toast.dismiss("issue-loading")

        setSendingIssue(false)

        console.error(err)

        toast.error("Gagal membuat issue")
    }
  }

  // Tidak ada lokasi
  if (!activeLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full
                      p-8 text-center bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center
                        justify-center mb-4">
          <QrCode className="w-9 h-9 text-brand-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Pilih Lokasi Dulu
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Scan QR code di pintu toilet atau lokasi lainnya untuk mulai
        </p>
        <button
          onClick={() => navigate('/scan')}
          className="bg-brand-600 text-white px-6 py-3 rounded-2xl
                     font-semibold text-sm flex items-center gap-2
                     active:bg-brand-700 transition-colors"
        >
          <QrCode className="w-4 h-4" />
          Scan QR Lokasi
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-full">

      {/* Header */}

        <div className="px-4 pt-4 pb-2">

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

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm text-white/90 font-bold">
                  Cleaning Checklist
                </p>

                <div className="flex items-center gap-2 mt-2">

                  <MapPin className="w-4 h-4 text-white/80 font-bold" />

                  <span className="text-sm text-white/90">
                    {activeLocation.name}
                  </span>

                </div>

              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => setShowExitModal(true)} >
                    <QrCode className="w-6 h-6 text-white" />
                  </button>

              </div>

            </div>
            <div className="mt-5">

              <div
                className="
                  bg-white/15
                  backdrop-blur
                  rounded-2xl
                  p-4
                "
              >

                <div className="flex justify-between">

                  <div>

                    <p className="text-xs text-white/70">
                      Periode Aktif
                    </p>

                    <p className="font-bold text-lg">
                      {activePeriod?.name}
                    </p>

                    <p className="text-xs text-white/80">
                      {activePeriod?.time_start?.slice(0,5)}
                      {' - '}
                      {activePeriod?.time_end?.slice(0,5)}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-xs text-white/70">
                      Progress
                    </p>

                    <p className="text-3xl font-bold">
                      {progress}%
                    </p>

                  </div>

                </div>

                <div className="mt-4">

                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">

                    <div
                      className="
                        h-full
                        bg-white
                        rounded-full
                      "
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                  <div className="flex justify-between mt-2">

                    <p className="text-xs text-white/80">
                      {doneItems}/{totalItems} selesai
                    </p>

                    <p className="text-xs text-white/80">
                      {totalItems - doneItems} tersisa
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      {/* Checklist items */}
      <div className="px-4 pb-4">
        {!activePeriod ? (
          <div className="text-center py-16">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">
              Tidak ada periode aktif saat ini
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}
                   className="h-16 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {checklist?.items.map((item) => (
              <div
                key={item.job_id}
                onClick={() => handleToggle(item)}
                className={cn(
                  'bg-white rounded-2xl border transition-all cursor-pointer',
                  'shadow-sm',
                  'active:scale-[0.98]',
                  item.status === 'done'
                    ? 'border-green-200 bg-green-50'
                    : item.has_issue
                    ? 'border-red-200'
                    : 'border-gray-100'
                )}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Checkbox */}
                  <button
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.status === 'done' ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : item.status === 'issue' ? (
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-300" />
                    )}
                  </button>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm leading-snug',
                      item.status === 'done'
                      ? 'text-green-700 font-medium'
                      : 'text-gray-800 font-medium'
                    )}>
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">

                      {item.status === 'issue' && (
                        <span
                          className="
                            px-2 py-0.5
                            rounded-full
                            text-[10px]
                            font-semibold
                            bg-red-100
                            text-red-600
                          "
                        >
                          Issue Dilaporkan
                        </span>
                      )}

                      {item.status === 'done' && (
                        <span
                          className="
                            px-2 py-0.5
                            rounded-full
                            text-[10px]
                            font-semibold
                            bg-green-100
                            text-green-600
                          "
                        >
                          Selesai
                        </span>
                      )}

                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">

                  {/* Dokumentasi Optional */}
                  <button
                    disabled={!item.checklist_id}
                    onClick={(e) => {

                      e.stopPropagation()

                      setSelectedJobId(item.job_id)

                      checklistCameraRef.current?.click()

                    }}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',

                      !item.checklist_id
                        ? 'bg-gray-100 text-gray-300'

                        : checklistPhotos[item.job_id]
                        ? 'bg-green-100 text-green-600'

                        : 'bg-blue-50 text-blue-600'
                    )}
                  >
                    <Camera className="w-5 h-5" />
                  </button>

                  {/* Issue */}
                  <button
                    onClick={(e) => {

                    e.stopPropagation()

                    setOpenItem(item)

                    setNoteVal(item.note ?? '')

                    if (masterIssues.length > 0) {
                      setIssueType(masterIssues[0].name)
                    } else {
                      setIssueType('')
                    }

                    setShowNoteModal(true)

                  }}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      item.has_issue
                        ? 'bg-red-100 text-red-600'
                        : 'bg-orange-50 text-orange-500'
                    )}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </button>

                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        
        <input
          ref={checklistCameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
         onChange={(e) => {

          const file = e.target.files?.[0]

          if (!file || !selectedJobId) return

          if (!validateImage(file)) {
              e.target.value = ""
              return
          }

          const item =
            checklist?.items.find(
              i => i.job_id === selectedJobId
            )

          if (!item?.checklist_id) {

            toast.error(
              'Checklist harus dicentang dulu'
            )

            return
          }

          uploadChecklistDocMut.mutate({

            checklistId:
              item.checklist_id,

            image: file,

          })

          setChecklistPhotos(
            prev => ({
              ...prev,
              [selectedJobId]: file,
            })
          )

        }}
        />

        {allChecked && (

          <div
            className="
              mx-4
              mb-6
              mt-2
              p-5
              rounded-3xl
              bg-green-50
              border
              border-green-200
              text-center
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-green-100
                flex
                items-center
                justify-center
                mx-auto
                mb-3
              "
            >
              <CheckCircle2
                className="
                  w-8
                  h-8
                  text-green-600
                "
              />
            </div>

            <h3
              className="
                text-lg
                font-bold
                text-green-700
              "
            >
              Checklist Selesai
            </h3>

            <p
              className="
                text-sm
                text-green-600
                mt-2
                mb-4
              "
            >
              Semua pekerjaan pada lokasi ini
              telah diperiksa.
            </p>

            <button
              onClick={() => setShowFinishModal(true)}
              className="
                mt-4
                w-full
                h-12
                rounded-2xl
                bg-green-600
                text-white
                font-semibold
                flex
                items-center
                justify-center
                gap-2
                active:scale-[0.98]
                transition-all
              "
            >
              <QrCode className="w-4 h-4" />
              Scan Lokasi Berikutnya
            </button>

          </div>

        )}

        {showExitModal && (

          <div
            className="
              fixed inset-0
              bg-black/60
              backdrop-blur-sm
              z-50
              flex items-center justify-center
              p-4
            "
          >

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                w-full
                max-w-sm
              "
            >

              <h3 className="font-bold text-lg">
                Keluar Lokasi
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                Yakin ingin keluar dari lokasi ini dan scan lokasi lain?
              </p>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() =>
                    setShowExitModal(false)
                  }
                  className="
                    flex-1
                    h-11
                    border
                    rounded-xl
                  "
                >
                  Batal
                </button>

                <button
                  onClick={() => {

                    setActiveLocation(null)

                    navigate('/scan')

                  }}
                  className="
                    flex-1
                    h-11
                    bg-brand-600
                    text-white
                    rounded-xl
                  "
                >
                  Keluar
                </button>

              </div>

            </div>

          </div>

        )}

        {showFinishModal && (

          <div
            className="
              fixed inset-0
              bg-black/60
              backdrop-blur-sm
              z-50
              flex items-center justify-center
              p-4
            "
          >

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                w-full
                max-w-sm
              "
            >

              <div
                className="
                  w-14 h-14
                  rounded-full
                  bg-green-100
                  flex items-center justify-center
                  mx-auto
                "
              >
                <CheckCircle2
                  className="
                    w-8 h-8
                    text-green-600
                  "
                />
              </div>

              <h3
                className="
                  font-bold
                  text-lg
                  text-center
                  mt-4
                "
              >
                Checklist Selesai
              </h3>

              <p
                className="
                  text-sm
                  text-gray-500
                  text-center
                  mt-2
                "
              >
                Semua pekerjaan lokasi ini sudah selesai diperiksa.
              </p>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() =>
                    setShowFinishModal(false)
                  }
                  className="
                    flex-1
                    h-11
                    border
                    rounded-xl
                  "
                >
                  Kembali
                </button>

                <button
                  onClick={() => {

                    setActiveLocation(null)

                    navigate('/scan')

                  }}
                  className="
                    flex-1
                    h-11
                    bg-green-600
                    text-white
                    rounded-xl
                  "
                >
                  Scan Lagi
                </button>

              </div>

            </div>

          </div>

        )}

        {showConfirmIssue && (

          <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center">

              <div className="bg-white rounded-3xl p-6 w-[90%] max-w-sm">

                  <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto">

                      <AlertTriangle className="w-7 h-7 text-orange-600"/>

                  </div>

                  <h2 className="text-xl font-bold text-center mt-4">
                      Konfirmasi
                  </h2>

                  <p className="text-sm text-gray-500 text-center mt-2">
                      Apakah Anda yakin ingin mengirim issue ini?
                  </p>

                  <div className="flex gap-3 mt-6">

                      <button
                          onClick={() => setShowConfirmIssue(false)}
                          className="flex-1 h-11 rounded-xl border"
                      >
                          Tidak
                      </button>

                      <button
                          onClick={()=>{
                              setShowConfirmIssue(false)
                              handleSaveNote()
                          }}
                          className="flex-1 h-11 rounded-xl bg-red-600 text-white"
                      >
                          Ya, Kirim
                      </button>

                  </div>

              </div>

          </div>

          )}

      {/* Modal Issue */}
        {showNoteModal && (
          <div
            className="
              fixed inset-0
              bg-black/70
              backdrop-blur-sm
              z-50
              flex items-end
            "
            onClick={() => setShowNoteModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="
                bg-white
                w-full
                max-w-md
                mx-auto
                rounded-t-4xl
                h-[80vh]
                flex
                flex-col
                overflow-hidden
                z-50
              "
            >
              {/* Handle */}
              <div className="py-3">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto" />
              </div>

              {/* Header */}
              <div className="px-5 pb-4 border-b">
                <div className="flex items-start gap-3">
                  <div
                    className="
                      w-12 h-12
                      rounded-2xl
                      bg-red-100
                      flex items-center justify-center
                    "
                  >
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Laporkan Issue
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {openItem?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className="
                  flex-1
                  overflow-y-auto
                  px-5
                  py-5
                  space-y-5
                  pb-6
                "
              >

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Jenis Issue
                  </label>

                  <Select
                    value={issueType}
                    onValueChange={setIssueType}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200">
                      <SelectValue placeholder="Pilih jenis issue" />
                    </SelectTrigger>

                    <SelectContent>
                      {masterIssues.map((issue) => (
                        <SelectItem
                          key={issue.id}
                          value={issue.name}
                        >
                          {issue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Deskripsi Issue
                  </label>

                  <textarea
                    value={noteVal}
                    onChange={(e) => setNoteVal(e.target.value)}
                    rows={5}
                    placeholder="Contoh: sabun habis, lantai licin, lampu mati..."
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-gray-200
                      p-4
                      text-sm
                      resize-none
                      focus:ring-2
                      focus:ring-red-500
                      focus:border-red-500
                    "
                  />
                </div>

                <div>

                  <label className="text-sm font-semibold text-gray-700 block mb-2">
                    Foto Bukti
                  </label>

                  <div className="grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        cameraInputRef.current?.click()
                      }
                      className="
                        h-12
                        rounded-xl
                        border
                        border-gray-200
                        font-medium
                      "
                    >
                      📷 Kamera
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        galleryInputRef.current?.click()
                      }
                      className="
                        h-12
                        rounded-xl
                        border
                        border-gray-200
                        font-medium
                      "
                    >
                      🖼 Galeri
                    </button>

                  </div>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]

                      if (!file) return

                      if (!validateImage(file)) {
                          e.target.value = ""
                          return
                      }

                      setPhotoFile(file)
                    }}
                  />

                  <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]

                      if (!file) return

                      if (!validateImage(file)) {
                          e.target.value = ""
                          return
                      }

                      setPhotoFile(file)
                    }}
                  />

                  {photoFile && (

                    <div className="mt-3">

                      <p className="text-sm text-gray-500 mb-2">
                        Preview Foto
                      </p>

                      <img
                        src={URL.createObjectURL(photoFile)}
                        alt="preview"
                        className="
                          w-full
                          max-h-60
                          object-contain
                          rounded-2xl
                          border
                          bg-gray-50
                        "
                      />

                    </div>

                  )}

                </div>

              </div>

              {/* Footer */}
              <div
                className="
                  border-t
                  bg-white
                  p-4
                  shrink-0
                  sticky
                  bottom-0
                "
              >
                <div className="flex gap-3">

                  <button
                    onClick={() => {
                      setShowNoteModal(false)
                      setPhotoFile(null)
                      setNoteVal('')
                      setIssueType(masterIssues[0]?.name ?? '')
                      setOpenItem(null)
                    }}
                    className="
                      flex-1
                      h-12
                      rounded-xl
                      border
                      border-gray-200
                      font-semibold
                      text-gray-600
                    "
                  >
                    Batal
                  </button>

                  <button
                    onClick={() => setShowConfirmIssue(true)}
                    disabled={sendingIssue}
                    className="
                      flex-1
                      h-12
                      rounded-xl
                      bg-red-600
                      text-white
                      font-semibold
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    {sendingIssue && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}

                    Kirim Issue
                  </button>

                </div>
              </div>
            </div>
          </div>
)}
          {sendingIssue && (

<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center">

    <div className="bg-white rounded-3xl p-8 w-72 text-center shadow-xl">

        <Loader2 className="w-12 h-12 animate-spin text-brand-600 mx-auto"/>

        <h3 className="font-bold text-lg mt-5">
            Loading...
        </h3>

        <p className="text-gray-500 mt-2">
            Please wait
        </p>

        <p className="text-sm text-gray-400 mt-1">
            Sedang mengirim issue
        </p>

    </div>

</div>

)}
    </div>
  )
}