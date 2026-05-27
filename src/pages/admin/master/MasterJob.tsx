import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLocationTypes } from '@/api/location'
import api from '@/lib/axios'
import { DataTable } from '@/components/admin/DataTable'
import { FormModal } from '@/components/admin/FormModal'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { MasterJob, LocationType } from '@/types'
import { Textarea } from '@/components/ui/textarea'

interface JobRow extends MasterJob { id: number }

  const EMPTY = {
    location_type_id: '',
    job: '',
    order: '',
    is_active: true,
  }
export default function MasterJobPage() {
  const qc = useQueryClient()
  const [openModal,    setOpenModal]    = useState(false)
  const [editData,     setEditData]     = useState<JobRow | null>(null)
  const [form,         setForm]         = useState(EMPTY)
  const [filterTypeId, setFilterTypeId] = useState('all')

  const { data: types = [] } = useQuery<LocationType[]>({
    queryKey: ['location-types'],
    queryFn:  getLocationTypes,
  })

  const { data: jobs = [], isLoading } = useQuery<JobRow[]>({
    queryKey: ['master-jobs', filterTypeId],
    queryFn:  async () => {
      const res = await api.get('/master-jobs', {
        params: filterTypeId !== 'all'
          ? { location_type_id: Number(filterTypeId) }
          : {},
      })
      return res.data
    },
  })

  const openCreate = () => {
    setEditData(null)
    setForm(EMPTY)
    setOpenModal(true)
  }

  const openEdit = (j: JobRow) => {
    setEditData(j)
    setForm({
      location_type_id: String(j.location_type_id),
      job:              j.job,
      order:            String(j.order),
       is_active: j.is_active,
    })
    setOpenModal(true)
  }

  const saveMut = useMutation({
    mutationFn: () => editData
      ? api.patch(`/master-jobs/${editData.id}`, {
          job:   form.job,
          order: form.order ? Number(form.order) : undefined,
          is_active: form.is_active,
        })
      : api.post('/master-jobs', {
          location_type_id: Number(form.location_type_id),
          job:              form.job,
          order:            form.order ? Number(form.order) : undefined,
          is_active: form.is_active,
        }),
    onSuccess: () => {
      toast.success(editData ? 'Job diperbarui' : 'Job ditambahkan')
      qc.invalidateQueries({ queryKey: ['master-jobs'] })
      setOpenModal(false)
    },
    onError: () => toast.error('Gagal menyimpan'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/master-jobs/${id}`),
    onSuccess: () => {
      toast.success('Job dihapus')
      qc.invalidateQueries({ queryKey: ['master-jobs'] })
    },
  })

  const columns = [
     {
      key: 'job',
      label: 'Nama Pekerjaan',
      render: (j: JobRow) => (
        <div className="text-left">
          {j.job}
        </div>
      ),
    },
    {
      key: 'location_type',
      label: 'Tipe',
      render: (j: JobRow) => {
        const badgeColors = [
          'bg-pink-100 text-pink-700',
          'bg-blue-100 text-blue-700',
          'bg-green-100 text-green-700',
          'bg-orange-100 text-orange-700',
          'bg-purple-100 text-purple-700',
          'bg-cyan-100 text-cyan-700',
          'bg-yellow-100 text-yellow-700',
          'bg-red-100 text-red-700',
          'bg-indigo-100 text-indigo-700',
        ]

        return (
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium inline-flex items-center justify-center ${
              badgeColors[(j.location_type_id - 1) % badgeColors.length]
            }`}
          >
            {j.location_type}
          </span>
        )
      },
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (j: JobRow) => (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
          ${j.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-500'}`}>
          {j.is_active ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Filter */}
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
        data={jobs}
        columns={columns}
        isLoading={isLoading}
        title="Pekerjaan Checklist"
        subtitle="Kelola daftar pekerjaan checklist"
        searchPlaceholder="Cari pekerjaan..."
        headerRight={
          <Button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Job
          </Button>
        }
        actions={(j: JobRow) => (
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => openEdit(j)}
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm('Hapus job ini?')) deleteMut.mutate(j.id)
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
        title={editData ? 'Edit Job' : 'Tambah Job'}
        onSubmit={() => {
          if (!form.job || (!editData && !form.location_type_id)) {
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
          <Label>Nama Pekerjaan</Label>
          <Textarea
            placeholder="Masukan nama pekerjaan checklist"
            value={form.job}
            maxLength={120}
            onChange={(e) => setForm({ ...form, job: e.target.value })}
            className="mt-1 min-h-24 resize-none"
          />

          <p className="text-xs text-gray-400 mt-1 text-right">
            {form.job.length}/120 karakter
          </p>
        </div>
        <div className="pt-2">
          <Label>Status</Label>

          <div className="flex items-center justify-between mt-2
                          rounded-xl border border-gray-200 px-4 py-3">

            <div>
              <p className="text-sm font-medium text-gray-700">
                Status Pekerjaan
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                Aktifkan atau nonaktifkan pekerjaan
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