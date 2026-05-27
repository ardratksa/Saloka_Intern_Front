import { useState } from 'react'
import CleaningTable from
'@/features/work-program/components/CleaningTable'
import WorkProgramFilters from
'@/features/work-program/components/WorkProgramFilters'
import AddScheduleModal from
'@/features/work-program/components/AddScheduleModal'


import {
  useScheduleActions,
} from
'@/features/work-program/hooks/useScheduleActions'

import {
  useScheduleModal,
} from
'@/features/work-program/hooks/useScheduleModal'

import {
  useWorkProgramFilter,
} from
'@/features/work-program/hooks/useWorkProgramFilter'

import {
  useFilteredJobs,
} from
'@/features/work-program/hooks/useFilteredJobs'

import {
  useWorkProgram,
} from '@/features/work-program/hooks/useWorkProgram'

import {
  getDays,
} from '@/features/work-program/utils/workProgramHelpers'

import {
  months,
} from
'@/features/work-program/utils/constants'

import {
  CalendarDays,
  Plus,
} from 'lucide-react'

export default function ProgramKerjaPage() {

  const {

    viewType,
    setViewType,

    month,
    setMonth,

    year,
    setYear,

  } = useWorkProgramFilter()

  const {

    openModal,
    setOpenModal,

    selectedDay,
    setSelectedDay,

    selectedJobId,
    setSelectedJobId,

    area,
    setArea,

    location,
    setLocation,

    subLocation,
    setSubLocation,

  } = useScheduleModal()

  const [weekIndex, setWeekIndex] =
  useState(0)

  const days = getDays(
    viewType,
    weekIndex,
    month,
    year
  )

  const {

  workProgramsQuery,

  masterJobsQuery,

  locationsQuery,

  createMutation,

  updateMutation,

  deleteMutation,

} = useWorkProgram(
  viewType,
  month,
  year,
  'out_plan'
)

const data =
  workProgramsQuery.data?.data || []

const isLoading =
  workProgramsQuery.isLoading

const locations =
  locationsQuery.data || []

const masterJobs =
  useFilteredJobs(
    masterJobsQuery.data || [],
    viewType
  )

  const {

    handleClickCell,

    handleSave,

  } = useScheduleActions({

    category: 'out_plan',

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
  })

  return (
    <div className="p-6 space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        <div>

          <h1
            className="text-3xl font-bold
                       text-gray-900
                       flex items-center gap-3"
          >
            <CalendarDays
              className="w-7 h-7
                         text-brand-600"
            />

            Program Kerja Diluar Timeline
          </h1>

          <p className="text-gray-500 mt-2">
            Timeline jadwal pekerjaan cleaning
          </p>
        </div>

        <button
          onClick={() => {

            setSelectedDay(null)

            setOpenModal(true)
          }}
          className="flex items-center gap-2
                     bg-brand-600
                     hover:bg-brand-700
                     text-white
                     px-5 py-3
                     rounded-2xl
                     transition-all"
        >

          <Plus className="w-5 h-5" />

          Tambah Jadwal
        </button>
      </div>

      <WorkProgramFilters

        viewType={viewType}
        setViewType={setViewType}

        month={month}
        setMonth={setMonth}

        year={year}
        setYear={setYear}

        months={months}

        hideFogging

      />

      <CleaningTable

        days={days}

        data={data}

        isLoading={isLoading}

        viewType={viewType}

        weekIndex={weekIndex}

        year={year}

        month={month}

        setWeekIndex={setWeekIndex}

        handleClickCell={
          handleClickCell
        }

      />

     <AddScheduleModal

      openModal={openModal}

      setOpenModal={setOpenModal}

      selectedJobId={selectedJobId}

      setSelectedJobId={
        setSelectedJobId
      }

      area={area}

      setArea={setArea}

      location={location}

      setLocation={setLocation}

      subLocation={subLocation}

      setSubLocation={
        setSubLocation
      }

      locations={locations}

      masterJobs={masterJobs}

      handleSave={handleSave}

     />

    </div>
  )
}