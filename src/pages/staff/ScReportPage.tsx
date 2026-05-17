import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getScReports, updateScReport, uploadScReportPhoto } from '@/api/scReport'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Camera, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { ScReport } from '@/types'

const PHASES = ['before', 'progress', 'after'] as const

export default function ScReportPage() {
  const queryClient = useQueryClient()

  const today = new Date()

  const weekStart = new Date(
    today.getTime() - today.getDay() * 86400000
  )
    .toISOString()
    .split('T')[0]

  const [expanded, setExpanded]   = useState<Record<number, boolean>>({})
  const [picInputs, setPicInputs] = useState<Record<number, string>>({})
  const [notes,     setNotes]     = useState<Record<number, string>>({})

  const { data: reports, isLoading } = useQuery({
    queryKey: ['sc-reports', weekStart],
    queryFn:  () => getScReports(weekStart),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: {
      id: number
      data: { pic_name?: string; notes?: string }
    }) => updateScReport(id, data),
    onSuccess: () => {
      toast.success('Disimpan')
      queryClient.invalidateQueries({ queryKey: ['sc-reports'] })
    },
  })

  const uploadMut = useMutation({
    mutationFn: ({ id, phase, file }: {
      id: number
      phase: 'before' | 'progress' | 'after'
      file: File
    }) => uploadScReportPhoto(id, phase, file),
    onSuccess: () => {
      toast.success('Foto berhasil diupload')
      queryClient.invalidateQueries({ queryKey: ['sc-reports'] })
    },
    onError: () => toast.error('Gagal upload foto'),
  })

  const handlePhotoUpload = (
    report: ScReport,
    phase: 'before' | 'progress' | 'after',
    file: File
  ) => {
    uploadMut.mutate({ id: report.id, phase, file })
  }

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">SC Report</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Security & Cleaning Report — minggu ini
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-4 bg-white rounded-xl
                      border border-gray-200 p-4">
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Progress minggu ini</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all"
                style={{
                  width: `${reports
                    ? Math.round(
                        (reports.filter((r) => r.status === 'completed').length /
                          reports.length) * 100
                      )
                    : 0}%`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {reports?.filter((r) => r.status === 'completed').length ?? 0}/
              {reports?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Report list */}
      {(reports?.length ?? 0) === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Camera className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada SC Report minggu ini</p>
          <p className="text-xs mt-1">Admin bisa tambah dari panel admin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports?.map((report: ScReport) => {
            const isOpen   = expanded[report.id] ?? false
            const photoCount = Object.values(report.photos).filter(Boolean).length

            return (
              <div key={report.id}
                   className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left
                             hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(report.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {report.task_name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {report.week_label}
                    </p>
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-600 rounded-full"
                          style={{ width: `${report.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {photoCount}/3 foto
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {report.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      report.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : report.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {report.status === 'completed'
                        ? 'Selesai'
                        : report.status === 'in_progress'
                        ? 'In Progress'
                        : 'Pending'}
                    </span>
                    {isOpen
                      ? <ChevronUp className="w-4 h-4 text-gray-400" />
                      : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                    {/* Foto Before / Progress / After */}
                    <div>
                      <Label className="mb-2 block">Foto Dokumentasi</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {PHASES.map((phase) => {
                          const photoUrl = report.photos[phase]
                          const inputId  = `photo-${report.id}-${phase}`

                          return (
                            <div key={phase}
                                 className="flex flex-col items-center gap-1">
                              <p className="text-xs text-gray-500 capitalize font-medium">
                                {phase}
                              </p>
                              <label
                                htmlFor={inputId}
                                className={cn(
                                  'w-full aspect-square rounded-xl border-2 border-dashed',
                                  'flex items-center justify-center cursor-pointer',
                                  'hover:border-brand-400 transition-colors overflow-hidden',
                                  photoUrl
                                    ? 'border-green-300'
                                    : 'border-gray-200'
                                )}
                              >
                                {photoUrl ? (
                                  <img
                                    src={photoUrl}
                                    className="w-full h-full object-cover"
                                    alt={phase}
                                  />
                                ) : (
                                  <div className="text-center">
                                    <Camera className="w-5 h-5 text-gray-300 mx-auto mb-1" />
                                    <span className="text-xs text-gray-400">
                                      Upload
                                    </span>
                                  </div>
                                )}
                              </label>
                              <input
                                id={inputId}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handlePhotoUpload(report, phase, file)
                                }}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* PIC */}
                    <div>
                      <Label>Nama PIC</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="Nama PIC yang mengerjakan..."
                          value={
                            picInputs[report.id] ?? report.pic_name ?? ''
                          }
                          onChange={(e) =>
                            setPicInputs((p) => ({
                              ...p,
                              [report.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            updateMut.mutate({
                              id:   report.id,
                              data: { pic_name: picInputs[report.id] },
                            })
                          }
                          disabled={updateMut.isPending}
                        >
                          Simpan
                        </Button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label>Catatan</Label>
                      <div className="flex gap-2 mt-1">
                        <Textarea
                          placeholder="Kondisi, tindakan, hasil..."
                          rows={2}
                          value={notes[report.id] ?? report.notes ?? ''}
                          onChange={(e) =>
                            setNotes((p) => ({
                              ...p,
                              [report.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            updateMut.mutate({
                              id:   report.id,
                              data: { notes: notes[report.id] },
                            })
                          }
                          disabled={updateMut.isPending}
                        >
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}