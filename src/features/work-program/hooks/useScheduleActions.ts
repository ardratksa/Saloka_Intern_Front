import {
  hasSchedule,
} from
'@/features/work-program/utils/workProgramHelpers'

import type {
  WorkProgram,
  ViewType,
} from
'@/features/work-program/types/workProgram'

import toast from 'react-hot-toast'

interface Props {

  workPrograms: any[]

  category:
    'plan'
    | 'out_plan'
  
  editingItem: any

  setEditingItem: any

  viewType: ViewType

  selectedType:
    'weekly'
    | 'monthly'

  month: number

  year: number

  selectedDates:
  Date[]

  selectedJobId:
    number | null

  area: string

  location: string

  subLocation: string

  createMutation: any

  updateMutation: any

  deleteMutation: any

  setOpenModal: (
    value: boolean
  ) => void

  setSelectedJobId: (
    value: number | null
  ) => void

  setArea: (
    value: string
  ) => void

  setLocation: (
    value: string
  ) => void

  setSubLocation: (
    value: string
  ) => void
}

export function useScheduleActions({

  workPrograms,

  category,

  editingItem,

  setEditingItem,

  selectedType,

  month,
  year,

  selectedDates,

  selectedJobId,

  area,
  location,
  subLocation,

  createMutation,

  updateMutation,

  deleteMutation,

  setOpenModal,

  setSelectedJobId,

  setArea,

  setLocation,

  setSubLocation,

}: Props) {

  /*
  |--------------------------------------------------------------------------
  | CLICK CELL
  |--------------------------------------------------------------------------
  */

  const handleClickCell =
    async (
      item: WorkProgram,
      day: number
    ) => {

      const exists =
        hasSchedule(
          item,
          day
        )

      /*
      |--------------------------------------------------------------------------
      | REMOVE DAY
      |--------------------------------------------------------------------------
      */

      if (exists) {

        const updatedDates =
          item.scheduled_dates.filter(
            (d) => d !== day
          )

        /*
        |--------------------------------------------------------------------------
        | DELETE ROW
        |--------------------------------------------------------------------------
        */

        if (
          updatedDates.length === 0
        ) {

          deleteMutation.mutate(
            item.id
          )

          return
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        updateMutation.mutate({

          id: item.id,

          payload: {

            ...item,

            scheduled_dates:
              updatedDates,
          },
        })

        return
      }

      /*
      |--------------------------------------------------------------------------
      | ADD DAY
      |--------------------------------------------------------------------------
      */

      updateMutation.mutate({

        id: item.id,

        payload: {

          ...item,

          scheduled_dates: [

            ...item.scheduled_dates,

            day,
          ],
        },
      })
    }

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = () => {

    if (
      !selectedJobId ||
      !area ||
      !location ||
      !subLocation
    ) {

      alert(
        'Lengkapi data dulu'
      )

      return
    }

    const payload = {

      location_type_id: 7,

      area_id: 1,

      area_name: area,

      location_name:
        location,

      sub_location:
        subLocation,

      job_id:
        selectedJobId,

      category,

      plan: selectedType,

      month,

      year,

      scheduled_dates:
        selectedDates.map(
          (date) =>
            date.getDate()
        ),

      status: 'pending',

      has_evidence: false,
    }

    const selectedDays =

      selectedDates.map(
        (date) =>
          date.getDate()
      )

    const duplicate =

      workPrograms.find(
        (item) => {

          if (
            editingItem &&
            item.id ===
            editingItem.id
          ) {
            return false
          }

          const sameJob =
            item.job_id ===
            selectedJobId

          const sameArea =
            item.area_name ===
            area

          const sameLocation =
            item.location_name ===
            location

          const sameSubLocation =
            item.sub_location ===
            subLocation

          const samePlan =
            item.plan ===
            selectedType

          const overlapDate =

            item.scheduled_dates.some(
              (day: number) =>

                selectedDays.includes(
                  day
                )
            )

          return (

            sameJob &&

            sameArea &&

            sameLocation &&

            sameSubLocation &&

            samePlan &&

            overlapDate

          )
        }
      )

    if (duplicate) {

      toast.error(
        'Jadwal sudah ada pada tanggal yang dipilih'
      )

      return
    }

    if (editingItem) {

      updateMutation.mutate(

        {

          id:
            editingItem.id,

          payload,

        },

        {

          onSuccess: () => {

            setEditingItem(
              null
            )

            setSelectedJobId(
              null
            )

            setArea('')

            setLocation('')

            setSubLocation('')

            setOpenModal(
              false
            )
          },
        }
      )

    } else {

      createMutation.mutate(

        payload,

        {

          onSuccess: () => {

            setSelectedJobId(
              null
            )

            setArea('')

            setLocation('')

            setSubLocation('')

            setOpenModal(
              false
            )
          },
        }
      )

    }

  }

  return {

    handleClickCell,

    handleSave,
  }
}