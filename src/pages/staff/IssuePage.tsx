import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getIssues, closeIssue } from '@/api/issue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertTriangle,
  MapPin,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Issue } from '@/types'


const statusLabel: Record<string, string> = {
  open:        'Open',
  resolved:    'Resolved',
}

const statusClass: Record<string, string> = {
  open: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
}

export default function IssuePage() {
  const queryClient = useQueryClient()
  const { isAdmin } = useAuthStore()

  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const [closeNote, setCloseNote] = useState('')

  const [closeImage, setCloseImage] =
    useState<File | null>(null)
  
  const cameraInputRef =
    useRef<HTMLInputElement>(null)

  const galleryInputRef =
    useRef<HTMLInputElement>(null)  
  
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Form state

  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues', filterStatus],
    queryFn: () => getIssues(
      filterStatus !== 'all' ? { status: filterStatus } : undefined
    ),
  })

  const closeMut = useMutation({

    mutationFn: () =>
      closeIssue(
        selectedIssue!.id,
        closeNote,
        closeImage!
      ),

    onSuccess: () => {

      toast.success('Issue diselesaikan')

      queryClient.invalidateQueries({
        queryKey: ['issues'],
      })

      setSelectedIssue(null)

      setCloseNote('')

      setCloseImage(null)

    },

    onError: () => {
      toast.error('Gagal menyelesaikan issue')
    },

  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div
        className="
          rounded-2xl
          p-4
          mb-5
          bg-linear-to-br
          from-brand-600
          via-green-600
          to-emerald-500
          text-white
          shadow-xl
        "
      >
        <p className="text-sm opacity-90">
          Issue Monitoring
        </p>

        <h1 className="text-2xl font-bold mt-1">
          Issues
        </h1>

        <p className="text-sm opacity-90 mt-2">
          Monitoring kerusakan dan masalah area
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'open', 'resolved'].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              filterStatus === s
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            )}
          >
            {s === 'all' ? 'Semua' : statusLabel[s]}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
       <div className="space-y-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (issues?.length ?? 0) === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada issue</p>
        </div>
      ) : (
        <div className="space-y-5">
          {issues?.map((issue: Issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className="
                bg-white
                rounded-3xl
                border
                border-gray-100
                p-4
                shadow-sm
                hover:shadow-xl
                transition-all
                cursor-pointer
                active:scale-[0.98]
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      statusClass[issue.status]
                    )}>
                      {statusLabel[issue.status]}
                    </span>
                    {issue.wa_sent && (
                      <span className="text-xs text-green-600 font-medium">
                        ✓ WA Terkirim
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {issue.type}
                  </h3>
                  {issue.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {issue.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {issue.location}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {issue.date} · {issue.created_at.slice(11, 16)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">

                    <span
                      className="
                        bg-gray-100
                        text-gray-600
                        text-xs
                        px-2
                        py-1
                        rounded-full
                      "
                    >
                      📷 {issue.photos.length} Foto
                    </span>

                  </div>
                  {issue.photos.length > 0 && (
                    <div className="mt-4">
                      <img
                        src={issue.photos[0].image_url}
                        alt=""
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewImage(issue.photos[0].image_url)
                        }}
                        className="
                          w-full
                          h-40
                          object-cover
                          rounded-2xl
                          cursor-pointer
                        "
                      />
                    </div>
                  )}
                </div>

                {/* Admin: update status */}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Detail Issue */}
        <Dialog
          open={!!selectedIssue}
          onOpenChange={() => setSelectedIssue(null)}
        >
          <DialogContent
            className="
            w-[95vw]
            max-w-2xl
            max-h-[90vh]
            overflow-y-auto
            bg-white
            border
            border-gray-200
            shadow-2xl
            rounded-3xl
            p-6
          "
        >

            <DialogHeader>
              <DialogTitle>
                Detail Issue
              </DialogTitle>
               <DialogDescription>
                Detail laporan issue dan penyelesaiannya
              </DialogDescription>
            </DialogHeader>
      
            {selectedIssue && (
              <div className="space-y-4">

                <div className="space-y-4">

                <div className="flex items-start justify-between gap-3">

                  <div className="flex-1">

                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedIssue.type}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {selectedIssue.description || '-'}
                    </p>

                  </div>

                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-semibold shrink-0',
                      statusClass[selectedIssue.status]
                    )}
                  >
                    {statusLabel[selectedIssue.status]}
                  </span>

                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">

                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedIssue.location}
                  </span>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {selectedIssue.date}
                  </span>

                </div>

              </div>


                {selectedIssue.photos.length > 0 && (
                  <div>

                    <p className="font-semibold text-gray-900 mb-3">
                      Dokumentasi
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                      {selectedIssue.photos.map((p) => (
                        <img
                          key={p.id}
                          src={p.image_url}
                          onClick={() =>
                            setPreviewImage(p.image_url)
                          }
                          className="
                            h-52
                            w-full
                            object-cover
                            rounded-2xl
                            border
                            border-gray-200
                            shadow-sm
                            cursor-pointer
                            hover:scale-[1.02]
                            hover:shadow-lg
                            transition-all
                          "
                          alt=""
                        />
                      ))}

                    </div>
                  </div>
                )}
                {selectedIssue.status === 'open' && !isAdmin() && (

                  <div
                    className="
                      mt-5
                      rounded-2xl
                      border
                      border-gray-100
                      bg-gray-50
                      p-4
                      space-y-4
                    "
                  >

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Form Penyelesaian
                      </h3>

                      <p className="text-sm text-gray-500">
                        Tambahkan keterangan dan foto bukti penyelesaian
                      </p>
                    </div>

                    <Textarea
                      placeholder="Keterangan penyelesaian"
                      value={closeNote}
                      onChange={(e) =>
                        setCloseNote(
                          e.target.value
                        )
                      }
                    />

                    <div className="grid grid-cols-2 gap-2">

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          cameraInputRef.current?.click()
                        }
                      >
                        📷 Kamera
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          galleryInputRef.current?.click()
                        }
                      >
                        🖼 Galeri
                      </Button>

                    </div>

                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) =>
                        setCloseImage(
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    <input
                      ref={galleryInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setCloseImage(
                          e.target.files?.[0] || null
                        )
                      }
                    />

                    {closeImage && (

                      <div className="space-y-2">

                        <p className="font-medium text-gray-800">
                          Preview Bukti Penyelesaian
                        </p>

                        <img
                          src={URL.createObjectURL(closeImage)}
                          alt="preview"
                          className="
                            w-full
                            h-48
                            object-cover
                            rounded-2xl
                            border
                            border-gray-200
                            shadow-sm
                          "
                        />

                      </div>

                    )}

                    <Button
                      disabled={
                        !closeNote ||
                        !closeImage ||
                        closeMut.isPending
                      }
                      onClick={() =>
                        closeMut.mutate()
                      }
                      className="
                        w-full
                        bg-brand-600
                        h-11
                        rounded-xl
                        font-semibold
                      "
                    >
                      Selesaikan Issue
                    </Button>

                  </div>

                )}

              </div>
            )}

          </DialogContent>
        </Dialog>
        {previewImage && (
          <div
            className="
              fixed
              inset-0
             bg-black/90 backdrop-blur-sm
              z-[9999]
              flex
              items-center
              justify-center
              p-4
            "
            onClick={() => setPreviewImage(null)}
          >
            <button
              className="
                absolute
                top-5
                right-5
                text-white
                text-3xl
                font-bold
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
                rounded-xl
              "
            />
          </div>
        )}
    </div>
  )
}