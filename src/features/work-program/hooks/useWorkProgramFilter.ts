import { useState } from 'react'

import type {
  ViewType,
} from
'@/features/work-program/types/workProgram'

export function useWorkProgramFilter() {

  /*
  |--------------------------------------------------------------------------
  | VIEW TYPE
  |--------------------------------------------------------------------------
  */

  const [
    viewType,
    setViewType,
  ] = useState<ViewType>(
    'all'
  )

  /*
  |--------------------------------------------------------------------------
  | DATE RANGE
  |--------------------------------------------------------------------------
  */

  const [
    startDate,
    setStartDate,
  ] = useState<Date | null>(
    null
  )

  const [
    endDate,
    setEndDate,
  ] = useState<Date | null>(
    null
  )

  /*
  |--------------------------------------------------------------------------
  | JOB FILTER
  |--------------------------------------------------------------------------
  */

  const [
    selectedJob,
    setSelectedJob,
  ] = useState('')

  return {

    viewType,
    setViewType,

    startDate,
    setStartDate,

    endDate,
    setEndDate,

    selectedJob,
    setSelectedJob,
  }
}