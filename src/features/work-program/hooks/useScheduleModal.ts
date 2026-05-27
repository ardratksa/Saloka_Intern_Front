import { useState } from 'react'

export function useScheduleModal() {

  /*
  |--------------------------------------------------------------------------
  | OPEN MODAL
  |--------------------------------------------------------------------------
  */

  const [
    openModal,
    setOpenModal,
  ] = useState(false)

  /*
  |--------------------------------------------------------------------------
  | SELECTED DAY
  |--------------------------------------------------------------------------
  */

  const [
    selectedDay,
    setSelectedDay,
  ] = useState<
    number | null
  >(null)

  /*
  |--------------------------------------------------------------------------
  | JOB
  |--------------------------------------------------------------------------
  */

  const [
    selectedJobId,
    setSelectedJobId,
  ] = useState<
    number | null
  >(null)

  /*
  |--------------------------------------------------------------------------
  | AREA
  |--------------------------------------------------------------------------
  */

  const [
    area,
    setArea,
  ] = useState('')

  /*
  |--------------------------------------------------------------------------
  | LOCATION
  |--------------------------------------------------------------------------
  */

  const [
    location,
    setLocation,
  ] = useState('')

  /*
  |--------------------------------------------------------------------------
  | SUB LOCATION
  |--------------------------------------------------------------------------
  */

  const [
    subLocation,
    setSubLocation,
  ] = useState('')

  return {

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
  }
}