import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLocations, getLocationTypes } from '@/api/location'
import api from '@/lib/axios'
import { DataTable } from '@/components/admin/DataTable'
import { FormModal } from '@/components/admin/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Location, LocationType } from '@/types'

const EMPTY = {
  location_type_id: '',
  name: '',
  is_active: true,
}

export default function MasterLokasi() {
  const qc = useQueryClient()
  const [openModal,    setOpenModal]    = useState(false)
  const [editData,     setEditData]     = useState<Location | null>(null)
  const [form,         setForm]         = useState(EMPTY)
  const [filterTypeId, setFilterTypeId] = useState('all')

  const { data: types = [] } = useQuery<LocationType[]>({
    queryKey: ['location-types'],
    queryFn:  getLocationTypes,
  })

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ['locations', filterTypeId],
    queryFn:  () =>
      filterTypeId !== 'all'
        ? getLocations(Number(filterTypeId))
        : getLocations(),
  })

  const openCreate = () => {
    setEditData(null)
    setForm(EMPTY)
    setOpenModal(true)
  }

  const openEdit = (l: Location) => {
    setEditData(l)
    setForm({
      location_type_id: String(l.type_id),
      name:             l.name,
      is_active:        l.is_active,
    })
    setOpenModal(true)
  }

  const saveMut = useMutation({
    mutationFn: () => editData
      ? api.patch(`/locations/${editData.id}`, {
          name: form.name,
          is_active: form.is_active,
        })
      : api.post('/locations', {
          location_type_id: Number(form.location_type_id),
          name: form.name,
        }),
    onSuccess: () => {
      toast.success(editData ? 'Lokasi diperbarui' : 'Lokasi ditambahkan')
      qc.invalidateQueries({ queryKey: ['locations'] })
      setOpenModal(false)
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const deleteMut = useMutation({
  mutationFn: (id: number) =>
    api.delete(`/locations/${id}`),

  onSuccess: () => {
    toast.success('Lokasi berhasil dihapus')
    qc.invalidateQueries({ queryKey: ['locations'] })
   },

  onError: () => {
    toast.error('Gagal menghapus lokasi')
   },
  })

  const columns = [
    {
      key: 'type_name',
      label: 'Tipe',
      render: (l: Location) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${l.type_name === 'Toilet'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-pink-100 text-pink-700'}`}>
          {l.type_name}
        </span>
      ),
    },
    { key: 'name', label: 'Nama Lokasi' },
    {
      key: 'qr_code',
      label: 'QR Code',
      render: (l: Location) => (
        <span className="font-mono text-xs text-gray-400">
          {l.qr_code?.slice(0, 12)}...
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (l: Location) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${l.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'}`}>
          {l.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Filter tipe */}
      <div className="flex items-center gap-2 px-6 pt-4">
        <span className="text-xs text-gray-500 font-medium">Filter tipe:</span>
        {['all', ...types.map((t) => String(t.id))].map((v) => {
          const label = v === 'all'
            ? 'Semua'
            : types.find((t) => String(t.id) === v)?.name ?? v
          return (
            <button
              key={v}
              onClick={() => setFilterTypeId(v)}
              className={`px-3 py-1 rounded-full text-xs font-medium border
                transition-colors
                ${filterTypeId === v
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <DataTable
        data={locations}
        columns={columns}
        isLoading={isLoading}
        title="Lokasi"
        subtitle={`${locations.length} lokasi terdaftar`}
        searchPlaceholder="Cari lokasi..."
        headerRight={
          <Button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Lokasi
          </Button>
        }
        actions={(l: Location) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => openEdit(l)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm('Hapus lokasi ini?')) deleteMut.mutate(l.id)
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      <FormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editData ? 'Edit Lokasi' : 'Tambah Lokasi'}
        onSubmit={() => {
          if (!form.name || (!editData && !form.location_type_id)) {
            toast.error('Semua field wajib diisi')
            return
          }
          saveMut.mutate()
        }}
        isLoading={saveMut.isPending}
      >
        {!editData && (
          <div>
            <Label>Tipe Lokasi</Label>

            <Select
              value={form.location_type_id}
              onValueChange={(v) =>
                setForm({ ...form, location_type_id: v })
              }
            >
              <SelectTrigger
                className="mt-1 h-12 rounded-xl
                          border border-[#e5e7eb]
                          bg-white shadow-none"
              >
                <SelectValue placeholder="Pilih tipe..." />
              </SelectTrigger>

              <SelectContent
                className="bg-white border border-[#ececec]
                          rounded-xl shadow-lg"
              >
                {types.map((t) => (
                  <SelectItem
                    key={t.id}
                    value={String(t.id)}
                    className="rounded-lg cursor-pointer"
                  >
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <Label>Nama Lokasi</Label>
          <Input
            placeholder="Masukan nama lokasi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="pt-2">
          <Label>Status</Label>

          <div className="flex items-center justify-between mt-2
                          rounded-xl border border-gray-200 px-4 py-3">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Status Lokasi
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                Aktifkan atau nonaktifkan lokasi
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  is_active: !form.is_active,
                })
              }
              className={`relative w-12 h-6 rounded-full transition-all
                ${form.is_active
                  ? 'bg-green-500'
                  : 'bg-gray-300'
                }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white
                  transition-all
                  ${form.is_active
                    ? 'left-7'
                    : 'left-1'
                  }`}
              />
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  )
}