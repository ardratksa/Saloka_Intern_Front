import { useState } from 'react'

import type {
  ViewType,
} from
'@/features/work-program/types/workProgram'

export function useWorkProgramFilter() {

  const currentDate =
    new Date()

  /*
  |--------------------------------------------------------------------------
  | VIEW TYPE
  |--------------------------------------------------------------------------
  */

  const [
    viewType,
    setViewType,
  ] = useState<ViewType>(
    'weekly'
  )

  /*
  |--------------------------------------------------------------------------
  | MONTH
  |--------------------------------------------------------------------------
  */

  const [
    month,
    setMonth,
  ] = useState(
    currentDate.getMonth() + 1
  )

  /*
  |--------------------------------------------------------------------------
  | YEAR
  |--------------------------------------------------------------------------
  */

  const [
    year,
    setYear,
  ] = useState(
    currentDate.getFullYear()
  )

  return {

    viewType,
    setViewType,

    month,
    setMonth,

    year,
    setYear,
  }
}