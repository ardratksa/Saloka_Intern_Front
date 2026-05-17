import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLocationTypes } from '@/api/location'
import api from '@/lib/axios'
import { DataTable } from '@/components/admin/DataTable'
import { FormModal } from '@/components/admin/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { LocationType } from '@/types'

const EMPTY = {
  name: '',
  is_active: true,
}

export default function MasterTipe() {
  const qc = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editData,  setEditData]  = useState<LocationType | null>(null)
  const [form,      setForm]      = useState(EMPTY)

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['location-types'],
    queryFn:  getLocationTypes,
  })

  const openCreate = () => {
    setEditData(null)
    setForm(EMPTY)
    setOpenModal(true)
  }

  const openEdit = (t: LocationType) => {
    setEditData(t)
    setForm({
      name: t.name,
      is_active: t.is_active,
     }) 
    setOpenModal(true)
  }

  const saveMut = useMutation({
    mutationFn: () => editData
      ? api.patch(`/location-types/${editData.id}`, form)
      : api.post('/location-types', form),
    onSuccess: () => {
      toast.success(editData ? 'Tipe diperbarui' : 'Tipe ditambahkan')
      qc.invalidateQueries({ queryKey: ['location-types'] })
      setOpenModal(false)
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const deleteMut = useMutation({
  mutationFn: (id: number) =>
    api.delete(`/location-types/${id}`),

  onSuccess: () => {
    toast.success('Tipe berhasil dihapus')
    qc.invalidateQueries({ queryKey: ['location-types'] })
   },

  onError: () => {
    toast.error('Gagal menghapus tipe')
   },
 })

  const columns = [
    { key: 'name', label: 'Nama Tipe' },
    {
      key: 'is_active',
      label: 'Status',
      render: (t: LocationType) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${t.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'}`}>
          {t.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ]

  return (
    <div className="h-full flex flex-col">
      <DataTable
        data={types}
        columns={columns}
        isLoading={isLoading}
        title="Tipe"
        subtitle="Kelola tipe lokasi (Toilet, Laktasi, dll)"
        searchPlaceholder="Cari tipe..."
        headerRight={
          <Button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Tipe
          </Button>
        }
        actions={(t: LocationType) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => openEdit(t)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm('Hapus tipe ini?')) deleteMut.mutate(t.id)
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
        title={editData ? 'Edit Tipe' : 'Tambah Tipe'}
        onSubmit={() => {
          if (!form.name) { toast.error('Nama wajib diisi'); return }
          saveMut.mutate()
        }}
        isLoading={saveMut.isPending}
      >
        <div>
          <Label>Nama Tipe</Label>
          <Input
            placeholder="Masukan nama tipe lokasi"
            value={form.name}
            onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            className="mt-1"
          />
        </div>
        <div className="pt-2">
          <Label>Status</Label>

          <div className="flex items-center justify-between mt-2
                          rounded-xl border border-gray-200 px-4 py-3">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Status Tipe
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                Aktifkan atau nonaktifkan tipe lokasi
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