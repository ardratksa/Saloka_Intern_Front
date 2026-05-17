import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getChecklist, updateChecklist, uploadChecklistDoc } from '@/api/checklist'
import { getPeriods } from '@/api/period'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Circle, AlertTriangle,
  Camera, MapPin, Clock, QrCode, Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { ChecklistItem, Period } from '@/types'

export default function ChecklistPage() {
  const navigate            = useNavigate()
  const queryClient         = useQueryClient()
  const { activeLocation }  = useAuthStore()

  const today = new Date().toISOString().split('T')[0]

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('')
  const [openItem,         setOpenItem]         = useState<ChecklistItem | null>(null)
  const [noteVal,          setNoteVal]          = useState('')
  const [picVal,           setPicVal]           = useState('')
  const [photoFile,        setPhotoFile]        = useState<File | null>(null)
  const [showNoteModal,    setShowNoteModal]    = useState(false)
  const [showPhotoModal,   setShowPhotoModal]   = useState(false)

  const { data: periods } = useQuery({
    queryKey: ['periods'],
    queryFn:  getPeriods,
  })

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
    queryFn:  () => getChecklist({
      location_id: activeLocation!.id,
      periode_id:  Number(selectedPeriodId),
      date:        today,
    }),
    enabled: !!activeLocation && !!selectedPeriodId,
  })

  const updateMut = useMutation({
    mutationFn: updateChecklist,
    onSuccess:  () => {
      queryClient.invalidateQueries({
        queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
      })
    },
    onError: () => toast.error('Gagal update'),
  })

  const uploadMut = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadChecklistDoc(id, file),
    onSuccess: () => {
      toast.success('Foto berhasil diupload')
      queryClient.invalidateQueries({
        queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
      })
      setShowPhotoModal(false)
      setPhotoFile(null)
    },
    onError: () => toast.error('Gagal upload foto'),
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

  const handleSaveNote = () => {
    if (!openItem || !activeLocation || !selectedPeriodId) return
    updateMut.mutate(
      {
        location_id: activeLocation.id,
        job_id:      openItem.job_id,
        periode_id:  Number(selectedPeriodId),
        date:        today,
        status:      openItem.status,
        note:        noteVal,
        pic:         picVal,
      },
      {
        onSuccess: () => {
          toast.success('Catatan disimpan')
          setShowNoteModal(false)
        },
      }
    )
  }

  const handleUploadPhoto = () => {
    if (!photoFile || !openItem?.checklist_id) {
      toast.error('Centang item dulu sebelum upload foto')
      return
    }
    uploadMut.mutate({ id: openItem.checklist_id, file: photoFile })
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

        {/* Progress bar */}
        {checklist && (
          <div className="bg-white/20 rounded-2xl p-3 mt-2">
            <div className="flex justify-between text-white text-xs mb-1.5">
              <span>{checklist.summary.done}/{checklist.summary.total} selesai</span>
              <span className="font-bold">{checklist.summary.progress}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${checklist.summary.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Period selector */}
      <div className="px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase
                      tracking-wide mb-2">
          Pilih Shift
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {periods?.map((p: Period) => (
            <button
              key={p.id}
              onClick={() => setSelectedPeriodId(String(p.id))}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl',
                'text-sm font-medium whitespace-nowrap shrink-0',
                'border transition-all active:scale-95',
                selectedPeriodId === String(p.id)
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200'
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              {p.name}
              <span className="text-xs opacity-75">
                {p.time_start.slice(0, 5)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Checklist items */}
      <div className="px-4 pb-4">
        {!selectedPeriodId ? (
          <div className="text-center py-16">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Pilih shift untuk melihat checklist</p>
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
                  'active:scale-[0.99]',
                  item.status === 'done'
                    ? 'border-green-200'
                    : item.status === 'issue'
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
                      {item.job}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.pic && (
                        <span className="text-xs text-gray-400">
                          {item.pic}
                        </span>
                      )}
                      {item.documentations.length > 0 && (
                        <span className="text-xs text-brand-600">
                          {item.documentations.length} foto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setOpenItem(item)
                        setNoteVal(item.note ?? '')
                        setPicVal(item.pic ?? '')
                        setShowNoteModal(true)
                      }}
                      className="w-8 h-8 rounded-xl bg-gray-50 flex items-center
                                 justify-center text-gray-400 active:bg-gray-100"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth={2}>
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0
                                 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4
                                 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setOpenItem(item)
                        setPhotoFile(null)
                        setShowPhotoModal(true)
                      }}
                      className="w-8 h-8 rounded-xl bg-gray-50 flex items-center
                                 justify-center text-gray-400 active:bg-gray-100"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Note */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end"
             onClick={() => setShowNoteModal(false)}>
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4
                          max-w-md mx-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Catatan & PIC</h3>
            <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3
                          leading-relaxed">
              {openItem?.job}
            </p>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Nama PIC
              </label>
              <input
                type="text"
                placeholder="Nama yang mengerjakan..."
                value={picVal}
                onChange={(e) => setPicVal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           text-sm bg-gray-50 focus:outline-none
                           focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">
                Catatan
              </label>
              <textarea
                placeholder="Tambahkan catatan..."
                value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           text-sm bg-gray-50 focus:outline-none
                           focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200
                           text-sm font-semibold text-gray-600
                           active:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNote}
                disabled={updateMut.isPending}
                className="flex-1 py-3 rounded-2xl bg-brand-600 text-white
                           text-sm font-semibold active:bg-brand-700
                           flex items-center justify-center gap-2
                           disabled:opacity-50"
              >
                {updateMut.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Photo */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end"
             onClick={() => setShowPhotoModal(false)}>
          <div className="bg-white w-full rounded-t-3xl p-5 space-y-4
                          max-w-md mx-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
            <h3 className="text-base font-bold text-gray-900">Upload Foto Bukti</h3>
            <p className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
              {openItem?.job}
            </p>

            {!openItem?.checklist_id && (
              <div className="bg-yellow-50 border border-yellow-200
                              rounded-xl p-3 text-xs text-yellow-700">
                Centang item ini dulu sebelum upload foto
              </div>
            )}

            {/* Upload area */}
            <label className="block">
              <div className={cn(
                'w-full h-32 rounded-2xl border-2 border-dashed',
                'flex flex-col items-center justify-center gap-2',
                'cursor-pointer transition-colors',
                photoFile
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-gray-200 bg-gray-50'
              )}>
                {photoFile ? (
                  <>
                    <Camera className="w-6 h-6 text-brand-600" />
                    <p className="text-sm text-brand-700 font-medium">
                      {photoFile.name}
                    </p>
                    <p className="text-xs text-brand-500">
                      {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-gray-400" />
                    <p className="text-sm text-gray-500">Tap untuk pilih foto</p>
                    <p className="text-xs text-gray-400">Maks 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {/* Preview foto lama */}
            {(openItem?.documentations.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Foto sebelumnya
                </p>
                <div className="flex gap-2 overflow-x-auto">
                  {openItem?.documentations.map((d) => (
                    <img
                      key={d.id}
                      src={d.image_url}
                      className="w-16 h-16 rounded-xl object-cover
                                 border border-gray-200 shrink-0"
                      alt="doc"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="flex-1 py-3 rounded-2xl border border-gray-200
                           text-sm font-semibold text-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleUploadPhoto}
                disabled={!photoFile || uploadMut.isPending}
                className="flex-1 py-3 rounded-2xl bg-brand-600 text-white
                           text-sm font-semibold flex items-center
                           justify-center gap-2 disabled:opacity-50
                           active:bg-brand-700"
              >
                {uploadMut.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}