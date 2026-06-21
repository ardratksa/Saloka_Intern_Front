import { useState } from 'react'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import api from '@/lib/axios'

import { getMasterIssues } from '@/api/masterIssue'

import { DataTable } from '@/components/admin/DataTable'
import { FormModal } from '@/components/admin/FormModal'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

import {
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react'

import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

import type { MasterIssue } from '@/types'

const EMPTY = {
  name: '',
  is_active: true,
}

export default function MasterIssue() {
  const qc = useQueryClient()

  const [openModal, setOpenModal] =
    useState(false)

  const [editData, setEditData] =
    useState<MasterIssue | null>(null)

  const [form, setForm] =
    useState(EMPTY)

  const {
    data: issues = [],
    isLoading,
  } = useQuery({
    queryKey: ['master-issues'],
    queryFn: getMasterIssues,
  })

  const openCreate = () => {
    setEditData(null)
    setForm(EMPTY)
    setOpenModal(true)
  }

  const openEdit = (
    issue: MasterIssue
  ) => {
    setEditData(issue)

    setForm({
      name: issue.name,
      is_active: issue.is_active,
    })

    setOpenModal(true)
  }

  const saveMut = useMutation({
    mutationFn: () =>
      editData
        ? api.patch(
            `/master-issues/${editData.id}`,
            form
          )
        : api.post(
            '/master-issues',
            form
          ),

    onSuccess: () => {
      toast.success(
        editData
          ? 'Issue berhasil diperbarui'
          : 'Issue berhasil ditambahkan'
      )

      qc.invalidateQueries({
        queryKey: ['master-issues'],
      })

      setOpenModal(false)
    },

    onError: () =>
      toast.error('Gagal menyimpan'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: number) =>
      api.delete(`/master-issues/${id}`),

    onSuccess: () => {
      toast.success(
        'Issue berhasil dihapus'
      )

      qc.invalidateQueries({
        queryKey: ['master-issues'],
      })
    },

    onError: () =>
      toast.error('Gagal menghapus'),
  })

  const columns = [
    {
      key: 'name',
      label: 'Nama Issue',
    },

    {
      key: 'is_active',
      label: 'Status',

      render: (issue: MasterIssue) => (
        <span
          className={`
            text-xs
            px-2
            py-0.5
            rounded-full
            font-medium
            ${
              issue.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }
          `}
        >
          {issue.is_active
            ? 'Aktif'
            : 'Nonaktif'}
        </span>
      ),
    },
  ]

  return (
    <div className="h-full flex flex-col">

      <DataTable
        data={issues}
        columns={columns}
        isLoading={isLoading}
        title="Master Issue"
        subtitle="Kelola jenis issue checklist"
        searchPlaceholder="Cari issue..."
        headerRight={
          <Button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Issue
          </Button>
        }
        actions={(issue: MasterIssue) => (
          <div className="flex items-center justify-center gap-1">

            <button
              onClick={() =>
                openEdit(issue)
              }
              className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={async () => {

                const result =
                  await Swal.fire({
                    title:
                      'Hapus Issue?',

                    text:
                      'Data yang dihapus tidak dapat dikembalikan',

                    icon:
                      'warning',

                    showCancelButton:
                      true,

                    confirmButtonText:
                      'Ya, Hapus',

                    cancelButtonText:
                      'Batal',

                    confirmButtonColor:
                      '#dc2626',
                  })

                if (
                  result.isConfirmed
                ) {
                  deleteMut.mutate(
                    issue.id
                  )
                }
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
        onClose={() =>
          setOpenModal(false)
        }
        title={
          editData
            ? 'Edit Issue'
            : 'Tambah Issue'
        }
        onSubmit={() => {

          if (!form.name) {
            toast.error(
              'Nama issue wajib diisi'
            )

            return
          }

          saveMut.mutate()
        }}
        isLoading={saveMut.isPending}
      >

        <div>

          <Label>
            Nama Issue
          </Label>

          <Input
            placeholder="Masukkan nama issue"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name:
                  e.target.value,
              })
            }
            className="mt-1"
          />

        </div>

        <div className="pt-2">

          <Label>Status</Label>

          <div
            className="
              flex
              items-center
              justify-between
              mt-2
              rounded-xl
              border
              border-gray-200
              px-4
              py-3
            "
          >

            <div>

              <p className="text-sm font-medium text-gray-700">
                Status Issue
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                Aktifkan atau nonaktifkan issue
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  is_active:
                    !form.is_active,
                })
              }
              className={`
                relative
                w-12
                h-6
                rounded-full
                transition-all
                ${
                  form.is_active
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }
              `}
            >

              <div
                className={`
                  absolute
                  top-1
                  w-4
                  h-4
                  rounded-full
                  bg-white
                  transition-all
                  ${
                    form.is_active
                      ? 'left-7'
                      : 'left-1'
                  }
                `}
              />

            </button>

          </div>

        </div>

      </FormModal>

    </div>
  )
}