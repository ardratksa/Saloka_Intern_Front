import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getWorkPlans, createWorkPlan, updateWorkPlan, deleteWorkPlan } from '@/api/workPlan'
import api from '@/lib/axios'
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
import { Wrench, Plus, MapPin, Calendar, Loader2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { WorkPlan, Location } from '@/types'

const statusLabel: Record<string, string> = {
  pending:     'Pending',
  in_progress: 'In Progress',
  done:        'Selesai',
}

const statusClass: Record<string, string> = {
  pending:     'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done:        'bg-green-100 text-green-700',
}

// Fetch locations langsung di sini — hindari masalah type optional param
async function fetchAllLocations(): Promise<Location[]> {
  const res = await api.get('/api/locations')
  return res.data as Location[]
}

export default function WorkPlanPage() {
  const queryClient = useQueryClient()
  const [openCreate, setOpenCreate] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const [form, setForm] = useState({
    location_id:       '',
    name:              '',
    type:              'plan' as 'plan' | 'simple',
    duration_estimate: '',
    planned_start:     '',
    notes:             '',
  })

  const { data: plans, isLoading } = useQuery({
    queryKey: ['work-plans', filterType],
    queryFn: () =>
      getWorkPlans(filterType !== 'all' ? { type: filterType } : undefined),
  })

  const { data: locations } = useQuery<Location[]>({
    queryKey: ['locations-all'],
    queryFn:  fetchAllLocations,
  })

  const createMut = useMutation({
    mutationFn: createWorkPlan,
    onSuccess: () => {
      toast.success(
        form.type === 'simple' ? 'Pekerjaan simple dicatat!' : 'Perencanaan disimpan!'
      )
      queryClient.invalidateQueries({ queryKey: ['work-plans'] })
      setOpenCreate(false)
      setForm({
        location_id: '', name: '', type: 'plan',
        duration_estimate: '', planned_start: '', notes: '',
      })
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: {
      id: number
      data: { status: 'pending' | 'in_progress' | 'done' }
    }) => updateWorkPlan(id, data),
    onSuccess: () => {
      toast.success('Status diperbarui')
      queryClient.invalidateQueries({ queryKey: ['work-plans'] })
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteWorkPlan,
    onSuccess: () => {
      toast.success('Dihapus')
      queryClient.invalidateQueries({ queryKey: ['work-plans'] })
    },
  })

  const handleSubmit = () => {
    if (!form.name || !form.location_id) {
      toast.error('Nama dan lokasi wajib diisi')
      return
    }
    createMut.mutate({
      location_id:       Number(form.location_id),
      name:              form.name,
      type:              form.type,
      duration_estimate: form.duration_estimate || undefined,
      planned_start:     form.planned_start     || undefined,
      notes:             form.notes             || undefined,
    })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Work Plan</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Perencanaan &amp; pekerjaan maintenance
          </p>
        </div>

        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-brand-600 hover:bg-brand-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pekerjaan</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg
                              p-3 text-xs text-blue-700">
                Pekerjaan panjang → perlu perencanaan.
                Pekerjaan simple → langsung eksekusi, tidak perlu laporan detail.
              </div>

              {/* Jenis */}
              <div>
                <Label>Jenis Pekerjaan</Label>
                <div className="flex gap-2 mt-1">
                  {(['plan', 'simple'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, type: t })}
                      className={cn(
                        'flex-1 py-2 px-3 rounded-lg text-sm font-medium border',
                        form.type === t
                          ? t === 'plan'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-600 border-gray-200'
                      )}
                    >
                      {t === 'plan' ? '📋 Perencanaan' : '⚡ Langsung Eksekusi'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama */}
              <div>
                <Label>Nama Pekerjaan</Label>
                <Input
                  placeholder="contoh: Cat ulang dinding toilet 3"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              {/* Lokasi */}
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
                    {(locations ?? []).map((loc: Location) => (
                      <SelectItem key={loc.id} value={String(loc.id)}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Extra fields untuk plan */}
              {form.type === 'plan' && (
                <>
                  <div>
                    <Label>Estimasi Durasi</Label>
                    <Input
                      placeholder="contoh: 3 hari, 1 minggu"
                      value={form.duration_estimate}
                      onChange={(e) =>
                        setForm({ ...form, duration_estimate: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tanggal Mulai Rencana</Label>
                    <Input
                      type="date"
                      value={form.planned_start}
                      onChange={(e) =>
                        setForm({ ...form, planned_start: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {/* Catatan */}
              <div>
                <Label>Catatan</Label>
                <Textarea
                  placeholder="Detail kebutuhan, bahan, personil..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full bg-brand-600 hover:bg-brand-700"
                disabled={createMut.isPending}
              >
                {createMut.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Simpan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'plan', 'simple'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              filterType === t
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200'
            )}
          >
            {t === 'all' ? 'Semua' : t === 'plan' ? 'Perencanaan' : 'Simple'}
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
      ) : (plans?.length ?? 0) === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Belum ada pekerjaan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(plans ?? []).map((plan: WorkPlan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        plan.type === 'plan'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      )}
                    >
                      {plan.type === 'plan' ? 'Perencanaan' : 'Simple'}
                    </span>
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        statusClass[plan.status]
                      )}
                    >
                      {statusLabel[plan.status]}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-gray-900">{plan.name}</p>

                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      {plan.location}
                    </span>
                    {plan.planned_start && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {plan.planned_start}
                      </span>
                    )}
                    {plan.duration_estimate && (
                      <span className="text-xs text-gray-400">
                        ⏱ {plan.duration_estimate}
                      </span>
                    )}
                  </div>

                  {plan.notes && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {plan.notes}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {plan.status !== 'done' && (
                    <Select
                      value={plan.status}
                      onValueChange={(v) =>
                        updateMut.mutate({
                          id:   plan.id,
                          data: { status: v as 'pending' | 'in_progress' | 'done' },
                        })
                      }
                    >
                      <SelectTrigger className="w-32 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Selesai</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-600 h-8 w-8 p-0"
                    onClick={() => deleteMut.mutate(plan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}