import { useState } from 'react'

export function useScheduleModal() {

  /*
  |------------------------------------------------------------------
  | OPEN MODAL
  |------------------------------------------------------------------
  */

  const [
    openModal,
    setOpenModal,
  ] = useState(false)

  /*
  |------------------------------------------------------------------
  | SELECTED TYPE
  |------------------------------------------------------------------
  */

  const [
    selectedType,
    setSelectedType,
  ] = useState<
    'weekly'
    | 'monthly'
  >('weekly')

  /*
  |------------------------------------------------------------------
  | EDITING ITEM
  |------------------------------------------------------------------
  */

  const [
    editingItem,
    setEditingItem,
  ] = useState<any>(null)

  /*
  |------------------------------------------------------------------
  | SELECTED DATES
  |------------------------------------------------------------------
  */

  const [
    selectedDates,
    setSelectedDates,
  ] = useState<Date[]>([])

  /*
  |------------------------------------------------------------------
  | JOB
  |------------------------------------------------------------------
  */

  const [
    selectedJobId,
    setSelectedJobId,
  ] = useState<
    number | null
  >(null)

  /*
  |------------------------------------------------------------------
  | AREA
  |------------------------------------------------------------------
  */

  const [
    area,
    setArea,
  ] = useState('')

  /*
  |------------------------------------------------------------------
  | LOCATION
  |------------------------------------------------------------------
  */

  const [
    location,
    setLocation,
  ] = useState('')

  /*
  |------------------------------------------------------------------
  | SUB LOCATION
  |------------------------------------------------------------------
  */

  const [
    subLocation,
    setSubLocation,
  ] = useState('')

  const [
    startTime,
    setStartTime,
  ] = useState('')

  const [
    endTime,
    setEndTime,
  ] = useState('')

  return {

    openModal,
    setOpenModal,

    selectedType,
    setSelectedType,

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


    startTime,
    setStartTime,

    endTime,
    setEndTime,
  }
}