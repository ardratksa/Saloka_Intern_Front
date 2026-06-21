import { useState } from 'react'

import CleaningTable from
'@/features/work-program/components/CleaningTable'

import WorkProgramFilters from
'@/features/work-program/components/WorkProgramFilters'

import AddScheduleModal from
'@/features/work-program/components/AddScheduleModal'

import PreviewScheduleModal from
'@/features/work-program/components/PreviewScheduleModal'

import TypeScheduleModal from
'@/features/work-program/components/TypeScheduleModal'

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
} from
'@/features/work-program/hooks/useWorkProgram'


import {
  CalendarDays,
  Plus,
} from 'lucide-react'

export default function OutPlanPage() {

 const {

    viewType,
    setViewType,

    startDate,
    setStartDate,

    endDate,
    setEndDate,

    selectedJob,
    setSelectedJob,

  } = useWorkProgramFilter()

  const {

    openModal,
    setOpenModal,

    editingItem,
    setEditingItem,

    selectedDates,
    setSelectedDates,

    selectedJobId,
    setSelectedJobId,

    area,
    setArea,

    location,
    setLocation,

    subLocation,
    setSubLocation,

    selectedType,
    setSelectedType,

    startTime,
    setStartTime,

    endTime,
    setEndTime,

  } = useScheduleModal()

  const [

    openTypeModal,
    setOpenTypeModal,

  ] = useState(false)

  const [

    openPreview,
    setOpenPreview,

  ] = useState(false)

  const [

    previewData,
    setPreviewData,

  ] = useState<any>(null)

  const currentDate =
  new Date()

  const {

    workProgramsQuery,

    allWorkProgramsQuery,

    masterJobsQuery,

    locationsQuery,

    createMutation,

    updateMutation,

    deleteMutation,

  } = useWorkProgram(

    viewType,

    currentDate.getMonth() + 1,

    currentDate.getFullYear(),

    'out_plan'
  )

  const rawData =
  workProgramsQuery.data?.data || []

  const allWorkPrograms =

  allWorkProgramsQuery.data?.data || []

  const data =
    viewType === 'all'
      ? rawData
      : rawData.filter(
          (item: any) =>
            item.plan === viewType
        )
  
  let filteredData =

    selectedJob

      ? data.filter(
          (item: any) =>

            item.job?.job ===
            selectedJob
        )

      : data

  if (
    startDate &&
    endDate
  ) {

    filteredData =
      filteredData.filter(
        (item: any) => {

          const dates =

            item.scheduled_dates.map(
              (day: number) =>

                new Date(
                  item.year,
                  item.month - 1,
                  day
                )
            )

          return dates.some(
            (date: Date) =>

              date >= startDate &&
              date <= endDate
          )
        }
      )
  }

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

   handleSave,

  } = useScheduleActions({

    workPrograms: allWorkPrograms,

    category: 'out_plan',

    editingItem,

    setEditingItem,

    viewType,

    selectedType,

    month:
      new Date().getMonth() + 1,

    year:
      new Date().getFullYear(),

    selectedDates,

    selectedJobId,

    area,
    location,
    subLocation,

    startTime,
    endTime,

    createMutation,

    updateMutation,

    deleteMutation,

    setOpenModal,

    setSelectedJobId,

    setArea,

    setLocation,

    setSubLocation,

    setStartTime,
    setEndTime,

  })

  return (

    <div className="p-6 space-y-5">

      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h1
            className="
              flex
              items-center
              gap-3
              text-3xl
              font-bold
              text-gray-900
            "
          >

            <CalendarDays
              className="
                h-7
                w-7
                text-brand-600
              "
            />

            Program Kerja Diluar Timeline

          </h1>

          <p
            className="
              mt-2
              text-gray-500
            "
          >
            Timeline pekerjaan diluar program kerja utama
          </p>

        </div>

        <button

          onClick={() => {

            setSelectedDates([])

            setEditingItem(null)

            setStartTime('')
            setEndTime('')

            setOpenTypeModal(
              true
            )

          }}

          className="
            flex
            items-center
            gap-2
            rounded-2xl
            bg-brand-600
            px-5
            py-3
            text-white
            transition-all
            hover:bg-brand-700
          "
        >

          <Plus
            className="
              h-5
              w-5
            "
          />

          Tambah Jadwal

        </button>

      </div>

      <WorkProgramFilters

        viewType={viewType}
        setViewType={setViewType}

        startDate={startDate}
        setStartDate={setStartDate}

        endDate={endDate}
        setEndDate={setEndDate}

        selectedJob={selectedJob}

        setSelectedJob={setSelectedJob}

        masterJobs={masterJobs}

      />

      <CleaningTable

        data={filteredData}

        isLoading={isLoading}

        viewType={viewType}

        onPreview={(item) => {

          setPreviewData(
            item
          )

          setOpenPreview(
            true
          )

        }}

        onEdit={(item) => {

          setEditingItem(item)

          setSelectedType(
            item.plan
          )

          setSelectedJobId(
            item.job_id
          )

          setArea(
            item.area_name
          )

          setLocation(
            item.location_name
          )

          setSubLocation(
            item.sub_location
          )

          const times =
            (item.time_range || '')
              .split('-')

          setStartTime(
            times[0]?.trim() || ''
          )

          setEndTime(
            times[1]?.trim() || ''
          )

          setSelectedDates(

            item.scheduled_dates.map(
              (day: number) =>

                new Date(
                  item.year,
                  item.month - 1,
                  day
                )
            )

          )

          setOpenModal(true)

        }}

        onDelete={(id) => {

          deleteMutation.mutate(
            id
          )

        }}

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

        editingItem={
          editingItem
        }

        selectedDates={
          selectedDates
        }

        setSelectedDates={
          setSelectedDates
        }

        startTime={startTime}
        endTime={endTime}

        setStartTime={setStartTime}
        setEndTime={setEndTime}

      />

      <TypeScheduleModal

        open={openTypeModal}

        onClose={() =>
          setOpenTypeModal(
            false
          )
        }

        onSelect={(type) => {

          setSelectedType(
            type as any
          )

          setOpenTypeModal(
            false
          )

          setOpenModal(
            true
          )

        }}

      />

      <PreviewScheduleModal

        open={openPreview}

        onClose={() =>
          setOpenPreview(
            false
          )
        }

        item={previewData}

      />

    </div>

  )
}