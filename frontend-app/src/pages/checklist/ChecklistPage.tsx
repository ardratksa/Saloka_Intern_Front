import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getChecklist, updateChecklist, uploadChecklistDoc } from '@/api/checklist'
import { getPeriods } from '@/api/period'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Camera,
  MapPin,
  Clock,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { ChecklistItem, Period } from '@/types'

export default function ChecklistPage() {
  const navigate        = useNavigate()
  const queryClient     = useQueryClient()
  const { activeLocation } = useAuthStore()

  const today = new Date().toISOString().split('T')[0]

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('')
  const [dialogItem,       setDialogItem]       = useState<ChecklistItem | null>(null)
  const [dialogType,       setDialogType]       = useState<'note' | 'photo'>('note')
  const [noteVal,          setNoteVal]          = useState('')
  const [picVal,           setPicVal]           = useState('')
  const [photoFile,        setPhotoFile]        = useState<File | null>(null)

  // ── Periods ──────────────────────────────────────────────
  const { data: periods, isLoading: periodsLoading } = useQuery({
    queryKey: ['periods'],
    queryFn:  getPeriods,
  })

  // ── Checklist ─────────────────────────────────────────────
  const canFetch = !!activeLocation && !!selectedPeriodId

  const {
    data: checklist,
    isLoading: checklistLoading,
    isFetching,
  } = useQuery({
    queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
    queryFn: () => getChecklist({
      location_id: activeLocation!.id,
      periode_id:  Number(selectedPeriodId),
      date:        today,
    }),
    enabled: canFetch,
  })

  // ── Update status ─────────────────────────────────────────
  const updateMut = useMutation({
    mutationFn: updateChecklist,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
      })
    },
    onError: () => toast.error('Gagal update checklist'),
  })

  // ── Upload foto ───────────────────────────────────────────
  const uploadMut = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      uploadChecklistDoc(id, file),
    onSuccess: () => {
      toast.success('Foto berhasil diupload')
      queryClient.invalidateQueries({
        queryKey: ['checklist', activeLocation?.id, selectedPeriodId, today],
      })
      setDialogItem(null)
      setPhotoFile(null)
    },
    onError: () => toast.error('Gagal upload foto'),
  })

  const handleToggle = (item: ChecklistItem) => {
    if (!activeLocation || !selectedPeriodId) return
    const newStatus = item.status === 'done' ? 'pending' : 'done'
    updateMut.mutate({
      location_id: activeLocation.id,
      job_id:      item.job_id,
      periode_id:  Number(selectedPeriodId),
      date:        today,
      status:      newStatus,
    })
  }

  const handleSaveNote = () => {
    if (!dialogItem || !activeLocation || !selectedPeriodId) return
    updateMut.mutate(
      {
        location_id: activeLocation.id,
        job_id:      dialogItem.job_id,
        periode_id:  Number(selectedPeriodId),
        date:        today,
        status:      dialogItem.status === 'pending' ? 'pending' : dialogItem.status,
        note:        noteVal,
        pic:         picVal,
      },
      {
        onSuccess: () => {
          toast.success('Catatan disimpan')
          setDialogItem(null)
        },
      }
    )
  }

  const handleUploadPhoto = () => {
    if (!photoFile || !dialogItem?.checklist_id) {
      toast.error('Pilih foto dan pastikan item sudah dicentang dulu')
      return
    }
    uploadMut.mutate({ id: dialogItem.checklist_id, file: photoFile })
  }

  // No location selected
  if (!activeLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Belum ada lokasi dipilih
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Scan QR di pintu lokasi atau pilih lokasi manual
        </p>
        <Button
          onClick={() => navigate('/scan')}
          className="bg-brand-600 hover:bg-brand-700"
        >
          Pilih Lokasi
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Checklist Harian</h1>
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-sm text-brand-700 font-medium">
            {activeLocation.name}
          </span>
          <span className="text-gray-400">·</span>
          <span className="text-sm text-gray-500">{today}</span>
        </div>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Pilih Periode / Shift
        </Label>
        {periodsLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {periods?.map((p: Period) => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriodId(String(p.id))}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                  selectedPeriodId === String(p.id)
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                )}
              >
                <Clock className="w-3.5 h-3.5 inline mr-1.5" />
                {p.name}
                <span className="text-xs ml-1 opacity-75">
                  ({p.time_start.slice(0, 5)})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {!selectedPeriodId ? (
        <div className="text-center py-12 text-gray-400">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Pilih periode untuk melihat checklist</p>
        </div>
      ) : checklistLoading || isFetching ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : checklist ? (
        <>
          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-600">
                    {checklist.summary.done}
                  </p>
                  <p className="text-xs text-gray-500">Selesai</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-500">
                    {checklist.summary.pending}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">
                    {checklist.summary.issue}
                  </p>
                  <p className="text-xs text-gray-500">Issue</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {checklist.summary.progress}%
                </p>
                <p className="text-xs text-gray-500">Progress</p>
              </div>
            </div>
            <Progress value={checklist.summary.progress} className="h-2" />
          </div>

          {/* Checklist items */}
          <div className="space-y-2">
            {checklist.items.map((item) => (
              <div
                key={item.job_id}
                className={cn(
                  'bg-white rounded-xl border transition-all',
                  item.status === 'done'
                    ? 'border-green-200 opacity-80'
                    : item.status === 'issue'
                    ? 'border-red-200'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={updateMut.isPending}
                    className="shrink-0"
                  >
                    {item.status === 'done' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : item.status === 'issue' ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </button>

                  {/* Job name */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm',
                      item.status === 'done'
                        ? 'line-through text-gray-400'
                        : 'text-gray-800'
                    )}>
                      {item.job}
                    </p>
                    {item.pic && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        PIC: {item.pic}
                      </p>
                    )}
                    {item.documentations.length > 0 && (
                      <p className="text-xs text-brand-600 mt-0.5">
                        {item.documentations.length} foto
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setDialogItem(item)
                        setDialogType('note')
                        setNoteVal(item.note ?? '')
                        setPicVal(item.pic ?? '')
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400
                                 hover:text-gray-600 transition-colors"
                      title="Tambah catatan"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth={2}>
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setDialogItem(item)
                        setDialogType('photo')
                        setPhotoFile(null)
                      }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400
                                 hover:text-gray-600 transition-colors"
                      title="Upload foto"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {/* Dialog Note/PIC */}
      <Dialog open={dialogItem !== null && dialogType === 'note'}
              onOpenChange={(o) => !o && setDialogItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catatan & PIC</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {dialogItem?.job}
            </p>
            <div>
              <Label>Nama PIC</Label>
              <Input
                placeholder="Nama yang mengerjakan..."
                value={picVal}
                onChange={(e) => setPicVal(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Catatan</Label>
              <Textarea
                placeholder="Tambahkan catatan..."
                value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <Button
              onClick={handleSaveNote}
              className="w-full bg-brand-600 hover:bg-brand-700"
              disabled={updateMut.isPending}
            >
              {updateMut.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Photo */}
      <Dialog open={dialogItem !== null && dialogType === 'photo'}
              onOpenChange={(o) => !o && setDialogItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Foto Bukti</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {dialogItem?.job}
            </p>
            {!dialogItem?.checklist_id && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700">
                  Centang item ini terlebih dahulu sebelum upload foto.
                </p>
              </div>
            )}
            <div>
              <Label>Pilih Foto</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-gray-400 mt-1">
                Maks 5MB · JPG, PNG, WebP
              </p>
            </div>
            {/* Preview foto lama */}
            {(dialogItem?.documentations.length ?? 0) > 0 && (
              <div>
                <Label>Foto sebelumnya</Label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {dialogItem?.documentations.map((d) => (
                    <img
                      key={d.id}
                      src={d.image_url}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      alt="doc"
                    />
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={handleUploadPhoto}
              className="w-full bg-brand-600 hover:bg-brand-700"
              disabled={!photoFile || uploadMut.isPending}
            >
              {uploadMut.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Upload Foto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}