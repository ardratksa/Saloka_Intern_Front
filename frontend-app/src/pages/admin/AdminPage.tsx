import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLocationTypes, getLocations } from '@/api/location'
import { getPeriods } from '@/api/period'
import api from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Settings, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const queryClient = useQueryClient()

  // ── Periods ──────────────────────────────────────────────
  const { data: periods, isLoading: periodsLoading } = useQuery({
    queryKey: ['periods'],
    queryFn: getPeriods,
  })

  const [periodForm, setPeriodForm] = useState({
    name: '', time_start: '', time_end: '',
  })
  const [openPeriod, setOpenPeriod] = useState(false)

  const createPeriodMut = useMutation({
    mutationFn: (data: typeof periodForm) =>
      api.post('/api/periods', data),
    onSuccess: () => {
      toast.success('Periode ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['periods'] })
      setOpenPeriod(false)
      setPeriodForm({ name: '', time_start: '', time_end: '' })
    },
    onError: () => toast.error('Gagal menambah periode'),
  })

  // ── Locations ─────────────────────────────────────────────
  const { data: locTypes } = useQuery({
    queryKey: ['location-types'],
    queryFn: getLocationTypes,
  })

  const { data: locations, isLoading: locsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getLocations(),
  })

  const [locForm, setLocForm] = useState({
    location_type_id: '', name: '',
  })
  const [openLoc, setOpenLoc] = useState(false)

  const createLocMut = useMutation({
    mutationFn: (data: typeof locForm) =>
      api.post('/api/locations', {
        location_type_id: Number(data.location_type_id),
        name: data.name,
      }),
    onSuccess: () => {
      toast.success('Lokasi ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['locations'] })
      setOpenLoc(false)
      setLocForm({ location_type_id: '', name: '' })
    },
    onError: () => toast.error('Gagal menambah lokasi'),
  })

  // ── SC Report template ────────────────────────────────────
  const [scForm, setScForm] = useState({
    task_name: '', week_label: '', week_start: '',
  })
  const [openSc, setOpenSc] = useState(false)

  const createScMut = useMutation({
    mutationFn: (data: typeof scForm) =>
      api.post('/api/sc-reports', data),
    onSuccess: () => {
      toast.success('SC Report template dibuat')
      queryClient.invalidateQueries({ queryKey: ['sc-reports'] })
      setOpenSc(false)
      setScForm({ task_name: '', week_label: '', week_start: '' })
    },
    onError: () => toast.error('Gagal membuat SC Report'),
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" />
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Kelola data master aplikasi
        </p>
      </div>

      <Tabs defaultValue="periods">
  <TabsList className="mb-6 inline-flex h-auto w-auto rounded-xl bg-gray-100 p-1">
    <TabsTrigger
      value="periods"
      className="rounded-lg px-4 py-2 text-sm font-medium
                 data-[state=active]:bg-white
                 data-[state=active]:text-gray-900
                 data-[state=active]:shadow-sm"
    >
                  Periode
                </TabsTrigger>

                <TabsTrigger
                  value="locations"
                  className="rounded-lg px-4 py-2 text-sm font-medium
                            data-[state=active]:bg-white
                            data-[state=active]:text-gray-900
                            data-[state=active]:shadow-sm"
                >
                  Lokasi
                </TabsTrigger>

                <TabsTrigger
                  value="sc-templates"
                  className="rounded-lg px-4 py-2 text-sm font-medium
                            data-[state=active]:bg-white
                            data-[state=active]:text-gray-900
                            data-[state=active]:shadow-sm"
                >
                  SC Report Template
                </TabsTrigger>
              </TabsList>

        {/* ── Periods ── */}
        <TabsContent value="periods">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">
              Daftar Periode / Shift
            </h2>
            <Dialog open={openPeriod} onOpenChange={setOpenPeriod}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Tambah Periode
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Periode</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label>Nama Periode</Label>
                    <Input
                      placeholder="contoh: Pagi 1, Siang, Sore"
                      value={periodForm.name}
                      onChange={(e) =>
                        setPeriodForm({ ...periodForm, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Waktu Mulai</Label>
                      <Input
                        type="time"
                        value={periodForm.time_start}
                        onChange={(e) =>
                          setPeriodForm({ ...periodForm, time_start: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Waktu Selesai</Label>
                      <Input
                        type="time"
                        value={periodForm.time_end}
                        onChange={(e) =>
                          setPeriodForm({ ...periodForm, time_end: e.target.value })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => createPeriodMut.mutate(periodForm)}
                    className="w-full bg-brand-600 hover:bg-brand-700"
                    disabled={createPeriodMut.isPending}
                  >
                    {createPeriodMut.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Simpan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {periodsLoading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))
              : periods?.map((p) => (
                  <div key={p.id}
                       className="bg-white rounded-xl border border-gray-200
                                  p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex
                                    items-center justify-center shrink-0">
                      <span className="text-brand-700 font-bold text-sm">
                        {p.time_start.slice(0, 5)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.time_start.slice(0, 5)} — {p.time_end.slice(0, 5)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${p.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                ))}
          </div>
        </TabsContent>

        {/* ── Locations ── */}
        <TabsContent value="locations">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">
              Daftar Lokasi ({locations?.length ?? 0})
            </h2>
            <Dialog open={openLoc} onOpenChange={setOpenLoc}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Tambah Lokasi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Lokasi</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label>Tipe Lokasi</Label>
                    <Select
                      value={locForm.location_type_id}
                      onValueChange={(v) =>
                        setLocForm({ ...locForm, location_type_id: v })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Pilih tipe..." />
                      </SelectTrigger>
                      <SelectContent>
                        {locTypes?.map((t) => (
                          <SelectItem key={t.id} value={String(t.id)}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nama Lokasi</Label>
                    <Input
                      placeholder="contoh: Toilet Gedung A"
                      value={locForm.name}
                      onChange={(e) =>
                        setLocForm({ ...locForm, name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => createLocMut.mutate(locForm)}
                    className="w-full bg-brand-600 hover:bg-brand-700"
                    disabled={createLocMut.isPending}
                  >
                    {createLocMut.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Simpan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {locsLoading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))
              : locations?.map((l) => (
                  <div key={l.id}
                       className="bg-white rounded-xl border border-gray-200
                                  p-4 flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      shrink-0
                      ${l.type_name === 'Toilet'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-pink-100 text-pink-700'}`}>
                      {l.type_name}
                    </span>
                    <p className="text-sm text-gray-900 flex-1">{l.name}</p>
                    <span className="text-xs text-gray-400 font-mono truncate
                                     max-w-24">
                      QR: {l.qr_code?.slice(0, 8)}...
                    </span>
                  </div>
                ))}
          </div>
        </TabsContent>

        {/* ── SC Report Templates ── */}
        <TabsContent value="sc-templates">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">
              Template Tugas SC Report
            </h2>
            <Dialog open={openSc} onOpenChange={setOpenSc}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Buat Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat SC Report Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div>
                    <Label>Nama Tugas</Label>
                    <Input
                      placeholder="contoh: Pembersihan menyeluruh wastafel"
                      value={scForm.task_name}
                      onChange={(e) =>
                        setScForm({ ...scForm, task_name: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Label Minggu</Label>
                    <Input
                      placeholder="contoh: Minggu ke-1 Mei 2026"
                      value={scForm.week_label}
                      onChange={(e) =>
                        setScForm({ ...scForm, week_label: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tanggal Mulai Minggu</Label>
                    <Input
                      type="date"
                      value={scForm.week_start}
                      onChange={(e) =>
                        setScForm({ ...scForm, week_start: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => createScMut.mutate(scForm)}
                    className="w-full bg-brand-600 hover:bg-brand-700"
                    disabled={createScMut.isPending}
                  >
                    {createScMut.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Buat Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm
                          text-blue-700">
            Template yang dibuat di sini akan muncul di halaman SC Report untuk
            diisi foto before, progress, dan after oleh staff.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}