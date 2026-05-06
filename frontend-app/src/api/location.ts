import api from '@/lib/axios'
import type { Location, LocationType } from '@/types'

export const getLocationTypes = async () => {
  const res = await api.get('/location-types')
  return res.data as LocationType[]
}

export const getLocations = async (location_type_id?: number) => {
  const res = await api.get('/locations', {
    params: location_type_id ? { location_type_id } : {},
  })
  return res.data as Location[]
}