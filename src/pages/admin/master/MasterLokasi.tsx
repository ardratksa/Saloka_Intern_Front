import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLocations, getLocationTypes } from '@/api/location'
import api from '@/lib/axios'

import { DataTable } from '@/components/admin/DataTable'
import { FormModal } from '@/components/admin/FormModal'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Swal from 'sweetalert2'
import { toPng } from "html-to-image"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Plus,
  Pencil,
  Trash2,
  QrCode,
} from 'lucide-react'

import toast from 'react-hot-toast'

import type {
  Location,
  LocationType,
} from '@/types'

import { QRCodeCanvas } from 'qrcode.react'

const EMPTY = {
  location_type_id: '',
  name: '',
  is_active: true,
}

export default function MasterLokasi() {

  const qc = useQueryClient()

  const [openModal, setOpenModal] =
    useState(false)

  const [editData, setEditData] =
    useState<Location | null>(null)

  const [form, setForm] =
    useState(EMPTY)

  const [filterTypeId, setFilterTypeId] =
    useState('all')

  const [qrData, setQrData] =
    useState<Location | null>(null)

  /*
  |--------------------------------------------------------------------------
  | GET TYPES
  |--------------------------------------------------------------------------
  */

  const { data: types = [] } =
    useQuery<LocationType[]>({

      queryKey: ['location-types'],

      queryFn: getLocationTypes,
    })

  /*
  |--------------------------------------------------------------------------
  | GET LOCATIONS
  |--------------------------------------------------------------------------
  */

  const {
    data: locations = [],
    isLoading,
  } = useQuery<Location[]>({

    queryKey: [
      'locations',
      filterTypeId,
    ],

    queryFn: () =>

      filterTypeId !== 'all'

        ? getLocations(
            Number(filterTypeId)
          )

        : getLocations(),
  })

  /*
  |--------------------------------------------------------------------------
  | OPEN CREATE
  |--------------------------------------------------------------------------
  */

  const openCreate = () => {

    setEditData(null)

    setForm(EMPTY)

    setOpenModal(true)
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT
  |--------------------------------------------------------------------------
  */

  const openEdit = (
    l: Location
  ) => {

    setEditData(l)

    setForm({

      location_type_id:
        String(l.type_id),

      name: l.name,

      is_active:
        l.is_active,
    })

    setOpenModal(true)
  }

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const saveMut = useMutation({

    mutationFn: () =>

      editData

        ? api.patch(
            `/locations/${editData.id}`,
            {
              name: form.name,
              is_active:
                form.is_active,
            }
          )

        : api.post(
            '/locations',
            {
              location_type_id:
                Number(
                  form.location_type_id
                ),

              name: form.name,

              is_active:
                form.is_active,
            }
          ),

    onSuccess: () => {

      toast.success(

        editData
          ? 'Lokasi diperbarui'
          : 'Lokasi ditambahkan'
      )

      qc.invalidateQueries({
        queryKey: ['locations'],
      })

      setOpenModal(false)
    },

    onError: () => {

      toast.error(
        'Gagal menyimpan'
      )
    },
  })

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteMut = useMutation({

    mutationFn: (
      id: number
    ) =>
      api.delete(
        `/locations/${id}`
      ),

    onSuccess: () => {

      toast.success(
        'Lokasi berhasil dihapus'
      )

      qc.invalidateQueries({
        queryKey: ['locations'],
      })
    },

    onError: () => {

      toast.error(
        'Gagal menghapus lokasi'
      )
    },
  })

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD QR
  |--------------------------------------------------------------------------
  */

  const downloadQR = async () => {

  if (!qrData) return

  const node =
    document.getElementById("qr-preview")

  if (!node) {
    toast.error("Preview tidak ditemukan")
    return
  }

  try {

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 3,
    })

    const link =
      document.createElement("a")

    link.download =
      `${qrData.name}.png`

    link.href = dataUrl

    link.click()

    toast.success("QR berhasil didownload")

  } catch (err) {

    console.error(err)

    toast.error("Gagal download QR")

  }

}

  /*
  |--------------------------------------------------------------------------
  | TABLE
  |--------------------------------------------------------------------------
  */

  const columns = [

    {
      key: 'type_name',

      label: 'Tipe',

      render: (
        l: Location
      ) => {

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
            className={`
              text-xs
              px-3 py-1
              rounded-full
              font-medium
              inline-flex
              items-center
              justify-center
              ${
                badgeColors[
                  (l.type_id - 1)
                  % badgeColors.length
                ]
              }
            `}
          >
            {l.type_name}
          </span>
        )
      },
    },

    {
      key: 'name',
      label: 'Nama Lokasi',
    },

    {
      key: 'qr_code',

      label: 'QR Code',

      render: (
        l: Location
      ) => (

        <span
          className="
            font-mono
            text-xs
            text-gray-500
            whitespace-nowrap
          "
        >
          {l.qr_code}
        </span>
      ),
    },

    {
      key: 'is_active',

      label: 'Status',

      render: (
        l: Location
      ) => (

        <span
          className={`
            text-xs
            px-2 py-0.5
            rounded-full
            font-medium
            ${
              l.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }
          `}
        >
          {l.is_active
            ? 'Aktif'
            : 'Nonaktif'}
        </span>
      ),
    },
  ]

  return (

    <div className="min-h-screen flex flex-col">

      {/* FILTER */}
      <div className="flex items-center gap-2 px-6 pt-4">

        <span
          className="
            text-xs
            text-gray-500
            font-medium
          "
        >
          Filter tipe:
        </span>

        {[
          'all',
          ...types.map(
            (t) => String(t.id)
          ),
        ].map((v) => {

          const label =
            v === 'all'

              ? 'Semua'

              : types.find(
                  (t) =>
                    String(t.id) === v
                )?.name ?? v

          return (

            <button
              key={v}
              onClick={() =>
                setFilterTypeId(v)
              }
              className={`
                px-3 py-1
                rounded-full
                text-xs
                font-medium
                border
                transition-colors
                ${
                  filterTypeId === v
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200'
                }
              `}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* TABLE */}
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
            className="
              bg-brand-600
              hover:bg-brand-700
            "
          >
            <Plus className="w-4 h-4 mr-2" />

            Tambah Lokasi
          </Button>
        }

        actions={(l: Location) => (

          <div
            className="
              flex items-center
              justify-center gap-1
            "
          >

            <button
              onClick={() =>
                openEdit(l)
              }
              className="
                p-1.5
                rounded-lg
                hover:bg-blue-50
                text-blue-500
              "
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() =>
                setQrData(l)
              }
              className="
                p-1.5
                rounded-lg
                hover:bg-brand-50
                text-brand-600
              "
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={async () => {

                const result =

                  await Swal.fire({

                    title:
                      'Hapus Lokasi?',

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
                    l.id
                  )
                }
              }}
              className="
                p-1.5
                rounded-lg
                hover:bg-red-50
                text-red-400
              "
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

      {/* QR MODAL */}
      {qrData && (

        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/40
          "
        >

          <div
            className="
              bg-white
              rounded-3xl
              w-95
              p-6
              shadow-2xl
            "
          >

            <div
              className="
                flex items-center
                justify-between mb-5
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                  text-gray-900
                "
              >
                QR Lokasi
              </h2>

              <button
                onClick={() =>
                  setQrData(null)
                }
                className="
                  text-gray-400
                  hover:text-gray-600
                  text-2xl
                "
              >
                ×
              </button>
            </div>

            <div
              id="qr-preview"
              className="
                flex flex-col items-center
                bg-white
                rounded-3xl
                p-4
              "
            >

              <img
                src="/logo-saloka.png"
                alt="Saloka"
                className="
                  h-12
                  object-contain
                  mb-3
                "
              />

              <h2
                className="
                  text-[20px]
                  font-bold
                  text-gray-900
                "
              >
                Cleaning Service
              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1 mb-4
                "
              >
                Saloka Internal Dashboard
              </p>

              {/* QR */}
              <div
                id="qr-download"
                className="
                  bg-white
                  p-4
                  rounded-2xl
                  border border-gray-200
                "
              >
                <QRCodeCanvas
                  value={qrData.qr_code}
                  size={170}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>

              <h2
                className="
                  mt-5
                  text-[22px]
                  font-bold
                  text-gray-900
                "
              >
                {qrData.name}
              </h2>

              <p
                className="
                  text-sm
                  text-gray-500
                  mt-1
                "
              >
                {qrData.type_name}
              </p>

              <div
                className="
                  mt-3
                  bg-gray-100
                  px-4 py-2
                  rounded-xl
                "
              >
                <p
                  className="
                    text-xs
                    font-mono
                    text-gray-600
                  "
                >
                  {qrData.qr_code}
                </p>
              </div>
            </div>

            <button
              onClick={downloadQR}
              className="
                mt-5
                w-full
                h-11
                rounded-2xl
                bg-brand-600
                hover:bg-brand-700
                text-white
                font-medium
                transition-colors
              "
            >
              Download / Print QR
            </button>

          </div>
        </div>
      )}
    </div>
  )
}