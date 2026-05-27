import {
  hasSchedule,
} from
'@/features/work-program/utils/workProgramHelpers'

import type {
  WorkProgram,
  ViewType,
} from
'@/features/work-program/types/workProgram'

interface Props {

  category:
    'plan'
    | 'out_plan'

  viewType: ViewType

  month: number

  year: number

  selectedDay:
    number | null

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

  category,

  viewType,

  month,
  year,

  selectedDay,

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

    createMutation.mutate(

      {

        location_type_id:

          viewType ===
          'fogging'

            ? 8

            : 7,

        area_id: 1,

        area_name: area,

        location_name:
          location,

        sub_location:
          subLocation,

        job_id:
          selectedJobId,

        /*
        |--------------------------------------------------------------------------
        | CATEGORY
        |--------------------------------------------------------------------------
        */

        category,

        /*
        |--------------------------------------------------------------------------
        | PLAN
        |--------------------------------------------------------------------------
        */

        plan:
          viewType ===
          'fogging'

            ? 'monthly'

            : viewType,

        month,

        year,

        scheduled_dates:
          selectedDay
            ? [selectedDay]
            : [],

        status: 'pending',

        has_evidence: false,
      },

      {
        onSuccess: () => {

          /*
          |--------------------------------------------------------------------------
          | RESET FORM
          |--------------------------------------------------------------------------
          */

          setSelectedJobId(null)

          setArea('')

          setLocation('')

          setSubLocation('')

          /*
          |--------------------------------------------------------------------------
          | CLOSE MODAL
          |--------------------------------------------------------------------------
          */

          setOpenModal(false)
        },
      }
    )
  }

  return {

    handleClickCell,

    handleSave,
  }
}