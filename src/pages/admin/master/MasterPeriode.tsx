import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPeriods } from '@/api/period'
import api from '@/lib/axios'
import { DataTable } from '@/components/admin/DataTable'
import { FormModal } from '@/components/admin/FormModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Period } from '@/types'

const EMPTY = {
  name: '',
  time_start: '',
  time_end: '',
  is_active: true,
}

export default function MasterPeriode() {
  const qc = useQueryClient()
  const [openModal, setOpenModal] = useState(false)
  const [editData,  setEditData]  = useState<Period | null>(null)
  const [form,      setForm]      = useState(EMPTY)

  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['periods'],
    queryFn:  getPeriods,
  })

  const openCreate = () => {
    setEditData(null)
    setForm(EMPTY)
    setOpenModal(true)
  }

  const openEdit = (p: Period) => {
    setEditData(p)
    setForm({
      name:       p.name,
      time_start: p.time_start.slice(0, 5),
      time_end:   p.time_end.slice(0, 5),
      is_active:  p.is_active,
    })
    setOpenModal(true)
  }

  const saveMut = useMutation({
    mutationFn: () => editData
      ? api.patch(`/periods/${editData.id}`, form)
      : api.post('/periods', form),
    onSuccess: () => {
      toast.success(editData ? 'Periode diperbarui' : 'Periode ditambahkan')
      qc.invalidateQueries({ queryKey: ['periods'] })
      setOpenModal(false)
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const deleteMut = useMutation({
  mutationFn: (id: number) =>
    api.delete(`/periods/${id}`),

  onSuccess: () => {
    toast.success('Periode berhasil dihapus')
    qc.invalidateQueries({ queryKey: ['periods'] })
   },

  onError: () => {
    toast.error('Gagal menghapus periode')
   },
  })

  const handleSubmit = () => {
    if (!form.name || !form.time_start || !form.time_end) {
      toast.error('Semua field wajib diisi')
      return
    }
    saveMut.mutate()
  }

  const columns = [
    { key: 'name',       label: 'Nama Periode' },
    {
      key: 'time_start',
      label: 'Waktu Mulai',
      render: (p: Period) => p.time_start.slice(0, 5),
    },
    {
      key: 'time_end',
      label: 'Waktu Selesai',
      render: (p: Period) => p.time_end.slice(0, 5),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (p: Period) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${p.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'}`}>
          {p.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ]

  return (
    <div className="h-full flex flex-col">
      <DataTable
        data={periods}
        columns={columns}
        isLoading={isLoading}
        title="Periode"
        subtitle="Kelola periode / shift waktu pengerjaan"
        searchPlaceholder="Cari periode..."
        headerRight={
          <Button
            onClick={openCreate}
            className="bg-[#15803d] hover:bg-[#166534] rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Periode
          </Button>
        }
        actions={(p: Period) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => openEdit(p)}
              className="p-2 rounded-xl hover:bg-blue-50 text-blue-500
                         transition-colors"
              title="Edit"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm('Hapus periode ini?')) deleteMut.mutate(p.id)
              }}
              className="p-2 rounded-xl hover:bg-red-50 text-red-400
                         transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      />

      <FormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={editData ? 'Edit Periode' : 'Tambah Periode'}
        onSubmit={handleSubmit}
        isLoading={saveMut.isPending}
      >
        <div>
          <Label>Nama Periode</Label>
          <Input
            placeholder="Masukan periode"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Waktu Mulai</Label>
            <Input
              type="time"
              value={form.time_start}
              onChange={(e) => setForm({ ...form, time_start: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Waktu Selesai</Label>
            <Input
              type="time"
              value={form.time_end}
              onChange={(e) => setForm({ ...form, time_end: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
        <div className="pt-2">
          <Label>Status</Label>

          <div className="flex items-center justify-between mt-2
                          rounded-xl border border-gray-200 px-4 py-3">
            
            <div>
              <p className="text-sm font-medium text-gray-700">
                Status Periode
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                Aktifkan atau nonaktifkan periode
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