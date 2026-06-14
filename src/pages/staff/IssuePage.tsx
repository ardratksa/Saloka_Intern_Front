import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { getIssues, createIssue, updateIssueStatus } from '@/api/issue'
import { getLocations } from '@/api/location'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertTriangle,
  Plus,
  MapPin,
  Calendar,
  Loader2,
  ImagePlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Issue } from '@/types'

const ISSUE_TYPES = [
  'Keramik / lantai rusak',
  'Lampu mati',
  'Saluran air tersumbat',
  'Wastafel bocor',
  'Pintu rusak',
  'Kunci rusak',
  'Peralatan rusak',
  'Lainnya',
]

const statusLabel: Record<string, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  resolved:    'Resolved',
}

const statusClass: Record<string, string> = {
  open:        'bg-red-100 text-red-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved:    'bg-green-100 text-green-700',
}

export default function IssuePage() {
  const queryClient = useQueryClient()
  const { activeLocation, isAdmin } = useAuthStore()
  const today = new Date().toISOString().split('T')[0]

  const [openCreate, setOpenCreate] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    location_id: String(activeLocation?.id ?? ''),
    date:        today,
    type:        '',
    description: '',
  })
  const [images, setImages] = useState<File[]>([])

  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues', filterStatus],
    queryFn: () => getIssues(
      filterStatus !== 'all' ? { status: filterStatus } : undefined
    ),
  })

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
  })

  const createMut = useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      toast.success('Issue berhasil dilaporkan!')
      queryClient.invalidateQueries({ queryKey: ['issues'] })
      setOpenCreate(false)
      setForm({
        location_id: String(activeLocation?.id ?? ''),
        date:        today,
        type:        '',
        description: '',
      })
      setImages([])
    },
    onError: () => toast.error('Gagal melaporkan issue'),
  })

  const updateStatusMut = useMutation({
    mutationFn: ({ id, status }: {
      id: number
      status: 'open' | 'in_progress' | 'resolved'
    }) => updateIssueStatus(id, status),
    onSuccess: () => {
      toast.success('Status diperbarui')
      queryClient.invalidateQueries({ queryKey: ['issues'] })
    },
  })

  const handleSubmit = () => {
    if (!form.type || !form.location_id) {
      toast.error('Lokasi dan jenis issue wajib diisi')
      return
    }
    createMut.mutate({
      location_id:  Number(form.location_id),
      date:         form.date,
      type:         form.type,
      description:  form.description,
      images,
    })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Issues</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Laporan kerusakan & masalah
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-brand-600 hover:bg-brand-700">
              <Plus className="w-4 h-4 mr-2" />
              Laporkan Issue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Laporkan Issue / Kerusakan</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="bg-yellow-50 border border-yellow-200
                              rounded-lg p-3 text-xs text-yellow-700">
                Laporan akan dikirim ke leader via WhatsApp
              </div>

              <div>
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Lokasi</Label>
                <Select
                  value={form.location_id}
                  onValueChange={(v) => setForm({ ...form, location_id: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih lokasi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Jenis Issue</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Pilih jenis..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  placeholder="Jelaskan kondisi dan lokasi persis..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Foto Dokumentasi</Label>
                <div className="mt-1 border-2 border-dashed border-gray-200
                                rounded-lg p-4 text-center cursor-pointer
                                hover:border-brand-300 transition-colors"
                     onClick={() => document.getElementById('issue-photos')?.click()}>
                  <ImagePlus className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">
                    {images.length > 0
                      ? `${images.length} foto dipilih`
                      : 'Klik untuk pilih foto'}
                  </p>
                  <p className="text-xs text-gray-400">Maks 5 foto · 5MB each</p>
                </div>
                <input
                  id="issue-photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []).slice(0, 5)
                    setImages(files)
                  }}
                />
                {images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {images.map((f, i) => (
                      <div key={i}
                           className="w-14 h-14 rounded-lg bg-gray-100
                                      flex items-center justify-center text-xs
                                      text-gray-500 overflow-hidden">
                        <img
                          src={URL.createObjectURL(f)}
                          className="w-full h-full object-cover rounded-lg"
                          alt=""
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={createMut.isPending}
              >
                {createMut.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Kirim ke Leader (WA)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'open', 'in_progress', 'resolved'].map((s) => (
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
        <div className="space-y-3">
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
        <div className="space-y-3">
          {issues?.map((issue: Issue) => (
            <div
              key={issue.id}
              onClick={() => setSelectedIssue(issue)}
              className="
                bg-white
                rounded-xl
                border
                border-gray-200
                p-4
                cursor-pointer
                hover:border-brand-300
                transition-all
              "
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                  <p className="text-sm font-medium text-gray-900">
                    {issue.type}
                  </p>
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
                  {issue.photos.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                      {issue.photos.map((p) => (
                        <img
                          key={p.id}
                          src={p.image_url}
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewImage(p.image_url)
                          }}
                          className="
                            w-12 h-12
                            rounded-lg
                            object-cover
                            border
                            border-gray-200
                            cursor-pointer
                          "
                          alt=""
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin: update status */}
                {isAdmin() && issue.status !== 'resolved' && (
                  <Select
                    value={issue.status}
                    onValueChange={(v) => updateStatusMut.mutate({
                      id: issue.id,
                      status: v as any,
                    })}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                )}
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
              max-w-2xl
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
            </DialogHeader>

            {selectedIssue && (
              <div className="space-y-4">

                <div className="flex items-center gap-2">

                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      statusClass[selectedIssue.status]
                    )}
                  >
                    {statusLabel[selectedIssue.status]}
                  </span>

                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Jenis Issue
                  </p>

                  <p className="font-medium">
                    {selectedIssue.type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Lokasi
                  </p>

                  <p className="font-medium">
                    {selectedIssue.location}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Deskripsi
                  </p>

                  <p>
                    {selectedIssue.description || '-'}
                  </p>
                </div>


                {selectedIssue.photos.length > 0 && (
                  <div>

                    <p className="text-sm text-gray-500 mb-2">
                      Dokumentasi
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                      {selectedIssue.photos.map((p) => (
                        <img
                          key={p.id}
                          src={p.image_url}
                          onClick={() =>
                            setPreviewImage(p.image_url)
                          }
                          className="
                            h-40
                            w-full
                            object-cover
                            rounded-2xl
                            border
                            border-gray-200
                            cursor-pointer
                            hover:scale-[1.02]
                            transition-all
                          "
                          alt=""
                        />
                      ))}

                    </div>
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
              bg-black/95
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