import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getChecklist, updateChecklist } from '@/api/checklist'
import { getActivePeriod } from '@/api/period'
import { createIssue } from '@/api/issue'
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

export default function ChecklistPage() {
  const navigate            = useNavigate()
  const queryClient         = useQueryClient()
  const { activeLocation }  = useAuthStore()

  const today = new Date().toISOString().split('T')[0]

  const [openItem,         setOpenItem]         = useState<ChecklistItem | null>(null)
  const [noteVal,          setNoteVal]          = useState('')
  const [showNoteModal,    setShowNoteModal]    = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [issueType, setIssueType] = useState('kotor')

  const { data: activePeriod } = useQuery({
    queryKey: ['active-period'],
    queryFn: getActivePeriod,
    retry: false,
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
      ? Math.round((doneItems / totalItems) * 100)
      : 0

  const updateMut = useMutation({
    mutationFn: updateChecklist,
    onSuccess:  () => {
      queryClient.invalidateQueries({
        queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
      })
    },
    onError: () => toast.error('Gagal update'),
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
      setIssueType('kotor')
    },

    onError: () => {
      toast.error('Gagal mengirim issue')
    },
  })

  const handleToggle = (item: ChecklistItem) => {
    if (!activeLocation || !selectedPeriodId) return
    updateMut.mutate({
      location_id: activeLocation.id,
      job_id:      item.job_id,
      periode_id:  Number(selectedPeriodId),
      date:        today,
      status:      item.status === 'done' ? 'pending' : 'done',
    })
  }

  const handleSaveNote = async () => {
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

      createIssueMut.mutate({
        checklist_id: checklistResult.data.id,

        location_id: activeLocation.id,

        date: today,

        type: issueType,

        description: noteVal,

        images: [photoFile],
      })
    } catch (err) {
      console.error(err)

      toast.error('Gagal membuat issue')
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
      <div className="bg-brand-600 pt-12 pb-4 px-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-white text-lg font-bold">Checklist</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-white/70" />
              <span className="text-white/90 text-sm">{activeLocation.name}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/scan')}
            className="bg-white/20 text-white p-2 rounded-xl
                       active:bg-white/30 transition-colors"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="px-4 py-3">
        {activePeriod ? (
          <div className="bg-white rounded-2xl border border-green-200 p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700">
                Periode Aktif
              </span>
            </div>
            <p className="text-base font-bold text-gray-900 mt-1">
              {activePeriod.name}
            </p>

            <p className="text-xs text-gray-500">
              {activePeriod.time_start.slice(0, 5)}
              {' - '}
              {activePeriod.time_end.slice(0, 5)}
            </p>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-700">
              Tidak ada periode aktif
            </p>

            <p className="text-xs text-red-500 mt-1">
              Checklist tidak dapat dilakukan saat ini
            </p>
          </div>
        )}
      </div>

      <div className="px-4 pb-3">
        <div className="bg-white rounded-2xl p-4 border">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Progress Checklist
            </span>

            <span className="text-sm font-bold text-brand-600">
              {progress}%
            </span>
          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600"
              style={{
                width: `${progress}%`
              }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {doneItems} dari {totalItems} item selesai
          </p>
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
                className={cn(
                  'bg-white rounded-2xl border transition-all',
                    'shadow-sm',
                    'active:scale-[0.99]',
                  'active:scale-[0.99]',
                  item.status === 'done'
                    ? 'border-green-200'
                    :item.has_issue
                    ? 'border-red-200'
                    : 'border-gray-100'
                )}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={updateMut.isPending}
                    className="shrink-0"
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
                        ? 'line-through text-gray-400'
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
                    <button
                      onClick={() => {
                        setOpenItem(item)
                        setNoteVal(item.note ?? '')
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

                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                    "
                  >
                    <option value="kotor">Kotor</option>
                    <option value="kerusakan">Kerusakan</option>
                    <option value="material_habis">Material Habis</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
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

                  <label
                    className="
                      border-2
                      border-dashed
                      border-gray-200
                      rounded-2xl
                      p-8
                      flex
                      flex-col
                      items-center
                      justify-center
                      text-center
                      cursor-pointer
                      active:bg-gray-50
                    "
                  >
                    <Camera className="w-8 h-8 text-gray-400 mb-3" />

                    <span className="font-semibold text-gray-700">
                      Ambil Foto
                    </span>

                    <span className="text-xs text-gray-500 mt-1">
                      Foto wajib untuk issue
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setPhotoFile(file)
                        }
                      }}
                    />
                  </label>
                  {photoFile && (
                    <img
                      src={URL.createObjectURL(photoFile)}
                      alt=""
                      className="
                        mt-3
                        w-full
                        h-40
                        object-cover
                        rounded-2xl
                        border
                      "
                    />
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
                      setIssueType('kotor')
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
                    onClick={handleSaveNote}
                    disabled={createIssueMut.isPending}
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
                    {createIssueMut.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}

                    Kirim Issue
                  </button>

                </div>
              </div>
            </div>
          </div>
)}
    </div>
  )
}