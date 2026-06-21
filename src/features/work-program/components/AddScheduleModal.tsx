import Select from 'react-select'

import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  MapPinned,
  X,
} from 'lucide-react'

interface Props {

  openModal: boolean

  setOpenModal: (
    value: boolean
  ) => void

  selectedJobId:
    number | null

  setSelectedJobId:
    React.Dispatch<
      React.SetStateAction<
        number | null
      >
    >

  area: string
  setArea: any

  location: string
  setLocation: any

  subLocation: string
  setSubLocation: any

  locations: any[]

  masterJobs: any[]

  handleSave: () => void

  editingItem?: any

  selectedDates: Date[]

  setSelectedDates: (
    dates: Date[]
  ) => void

  startTime: string
  endTime: string

  setStartTime: (
    value: string
  ) => void

  setEndTime: (
    value: string
  ) => void
}

const selectStyles = {

  control: (base: any, state: any) => ({

    ...base,

    minHeight: 56,

    borderRadius: 16,

    borderColor:
      state.isFocused
        ? '#10b981'
        : '#e5e7eb',

    boxShadow: 'none',

    paddingLeft: 36,

    fontSize: 14,

    '&:hover': {

      borderColor: '#10b981',
    },
  }),

  option: (
    base: any,
    state: any
  ) => ({

    ...base,

    backgroundColor:
      state.isFocused
        ? '#ecfdf5'
        : '#fff',

    color: '#111827',

    cursor: 'pointer',

    fontSize: 14,
  }),

  placeholder: (
    base: any
  ) => ({

    ...base,

    color: '#6b7280',
  }),

  menu: (base: any) => ({

    ...base,

    borderRadius: 16,

    overflow: 'hidden',

    zIndex: 9999,
  }),
}

export default function AddScheduleModal({

  openModal,
  setOpenModal,

  selectedJobId,
  setSelectedJobId,

  area,
  setArea,

  location,
  setLocation,

  subLocation,
  setSubLocation,

  locations,

  masterJobs,

  handleSave,

  editingItem,

  selectedDates,

  setSelectedDates,

  startTime,
  endTime,

  setStartTime,
  setEndTime,

}: Props) {

  if (!openModal) {
    return null
  }

  const areaOptions =

    locations.map(
      (item: any) => ({

      value:
        item.nama_area,

      label:
        item.nama_area,

    }))

  const locationOptions =

    locations

      .find(
        (item: any) =>

          item.nama_area ===
          area
      )

      ?.lokasi?.map(
        (item: any) => ({

        value:
          item.nama_lokasi,

        label:
          item.nama_lokasi,

      })) || []

  const subLocationOptions =

    locations

      .find(
        (item: any) =>

          item.nama_area ===
          area
      )

      ?.lokasi?.find(
        (item: any) =>

          item.nama_lokasi ===
          location
      )

      ?.sub_lokasi?.map(
        (item: any) => ({

        value:
          item.nama_sub_lokasi,

        label:
          item.nama_sub_lokasi,

      })) || []

  return (

    <div
      className="
        fixed inset-0
        z-50
        flex items-center justify-center
        bg-black/40
        backdrop-blur-sm
        p-4
      "
    >

        <div
          className="
            relative
            w-full
            max-w-xl
            max-h-[90vh]
            overflow-hidden
            rounded-[28px]
            bg-white
            shadow-2xl
            flex
            flex-col
          "
        >

        {/* HEADER */}
        <div
          className="
            flex items-start
            justify-between
            border-b border-gray-100
            px-8 py-6
          "
        >

          <div>

            <h2
              className="
                text-3xl
                font-bold
                text-gray-900
              "
            >
              {
                editingItem
                  ? 'Edit Jadwal'
                  : 'Tambah Jadwal'
              }
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              {
                editingItem
                  ? 'Perbarui jadwal pekerjaan'
                  : 'Tambahkan jadwal pekerjaan cleaning'
              }
            </p>

          </div>

          <button

            onClick={() =>
              setOpenModal(false)
            }

            className="
              flex h-11 w-11
              items-center
              justify-center
              rounded-2xl
              transition-all
              hover:bg-gray-100
            "
          >

            <X
              className="
                h-5 w-5
                text-gray-500
              "
            />

          </button>

        </div>

        {/* BODY */}
        <div
          className="
            flex-1
            overflow-y-auto
            scrollbar-thin
            space-y-5
            px-8 py-7
          "
        >

          {/* PEKERJAAN */}
          <div className="space-y-2">

            <label
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              Pekerjaan
            </label>

            <div className="relative">

              <BriefcaseBusiness
                className="
                  absolute
                  left-4 top-1/2
                  z-10
                  h-5 w-5
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <Select

                styles={selectStyles}

                placeholder="Pilih pekerjaan"

                options={

                  masterJobs.map(
                    (job: any) => ({

                    value: job.id,

                    label: job.job,

                  }))
                }

                value={

                  masterJobs

                    .map(
                      (job: any) => ({

                      value: job.id,

                      label: job.job,

                    }))

                    .find(
                      (item: any) =>

                        item.value ===
                        selectedJobId
                    ) || null
                }

                onChange={(val: any) =>

                  setSelectedJobId(
                    val?.value || null
                  )

                }

              />

            </div>

          </div>

          {/* AREA */}
          <div className="space-y-2">

            <label
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              Area
            </label>

            <div className="relative">

              <Building2
                className="
                  absolute
                  left-4 top-1/2
                  z-10
                  h-5 w-5
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <Select

                styles={selectStyles}

                placeholder="Pilih area"

                options={areaOptions}

                value={
                  areaOptions.find(
                    (item: any) =>
                      item.value === area
                  ) || null
                }

                onChange={(val: any) => {

                  setArea(
                    val?.value || ''
                  )

                  setLocation('')
                  setSubLocation('')
                }}

              />

            </div>

          </div>

          {/* LOKASI */}
          <div className="space-y-2">

            <label
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              Lokasi
            </label>

            <div className="relative">

              <MapPin
                className="
                  absolute
                  left-4 top-1/2
                  z-10
                  h-5 w-5
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <Select

                styles={selectStyles}

                placeholder="Pilih lokasi"

                options={
                  locationOptions
                }

                value={
                  locationOptions.find(
                    (item: any) =>
                      item.value ===
                      location
                  ) || null
                }

                onChange={(val: any) => {

                  setLocation(
                    val?.value || ''
                  )

                  setSubLocation('')
                }}

              />

            </div>

          </div>

          {/* SUB LOKASI */}
          <div className="space-y-2">

            <label
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              Sub Lokasi
            </label>
            

            <div className="relative">

              <MapPinned
                className="
                  absolute
                  left-4 top-1/2
                  z-10
                  h-5 w-5
                  -translate-y-1/2
                  text-gray-400
                "
              />

              <Select

                styles={selectStyles}

                placeholder="Pilih sub lokasi"

                options={
                  subLocationOptions
                }

                value={
                  subLocationOptions.find(
                    (item: any) =>
                      item.value ===
                      subLocation
                  ) || null
                }

                onChange={(val: any) =>

                  setSubLocation(
                    val?.value || ''
                  )

                }

              />

            </div>

          </div>

           {/* WAKTU PEKERJAAN */}

          <div className="space-y-2">

            <label
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              Waktu Pekerjaan
            </label>

            <div className="grid grid-cols-2 gap-3">

              <input
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
                className="
                  h-14
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                "
              />

              <input
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value
                  )
                }
                className="
                  h-14
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                "
              />

            </div>

          </div>

          {/* TANGGAL PEKERJAAN */}

          <div className="space-y-3">

            <label
              className="
                text-sm
                font-medium
                text-gray-700
              "
            >
              Tanggal Pekerjaan
            </label>

            <div
              className="
                rounded-2xl
                border border-gray-200
                p-4
                bg-gray-50
              "
            >
              <div
                className="
                  flex
                  justify-center
                "
              >

              <DayPicker

                mode="multiple"

                selected={
                  selectedDates
                }

                onSelect={(dates) =>

                  setSelectedDates(
                    dates || []
                  )

                }

              />

              </div>

            </div>

          </div>



        </div>

        {/* FOOTER */}
        <div
          className="
            flex items-center
            justify-end
            gap-3
            border-t border-gray-100
            px-8 py-5
          "
        >

          <button

            onClick={() =>
              setOpenModal(false)
            }

            className="
              h-12
              rounded-2xl
              border border-gray-200
              px-6
              text-sm
              font-medium
              text-gray-700
              transition-all
              hover:bg-gray-50
            "
          >
            Batal
          </button>

          <button

            onClick={handleSave}

            className="
              h-12
              rounded-2xl
              bg-emerald-700
              px-6
              text-sm
              font-medium
              text-white
              transition-all
              hover:bg-emerald-600
            "
          >
            {
              editingItem
                ? 'Update Jadwal'
                : 'Simpan Jadwal'
            }
          </button>

        </div>

      </div>

    </div>
  )
}