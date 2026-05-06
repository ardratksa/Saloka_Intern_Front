import api from '@/lib/axios'
import type { WorkPlan } from '@/types'

export const getWorkPlans = async (params?: {
  type?: string
  status?: string
  location_id?: number
}) => {
  const res = await api.get('/work-plans', { params })
  return res.data as WorkPlan[]
}

export const createWorkPlan = async (data: {
  location_id: number
  name: string
  type: 'plan' | 'simple'
  duration_estimate?: string
  planned_start?: string
  notes?: string
}) => {
  const res = await api.post('/work-plans', data)
  return res.data
}

export const updateWorkPlan = async (
  id: number,
  data: {
    name?: string
    duration_estimate?: string
    planned_start?: string
    notes?: string
    status?: 'pending' | 'in_progress' | 'done'
  }
) => {
  const res = await api.patch(`/work-plans/${id}`, data)
  return res.data
}

export const deleteWorkPlan = async (id: number) => {
  const res = await api.delete(`/work-plans/${id}`)
  return res.data
}