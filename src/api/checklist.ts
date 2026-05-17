import api from '@/lib/axios'
import type { ChecklistResponse } from '@/types'

export const getChecklist = async (params: {
  location_id: number
  periode_id: number
  date: string
}) => {
  const res = await api.get('/checklist', { params })
  return res.data as ChecklistResponse
}

export const updateChecklist = async (data: {
  location_id: number
  job_id: number
  periode_id: number
  date: string
  status: 'pending' | 'done' | 'issue'
  note?: string
  pic?: string
}) => {
  const res = await api.post('/checklist/update', data)
  return res.data
}

export const uploadChecklistDoc = async (
  checklist_id: number,
  image: File,
  note?: string
) => {
  const form = new FormData()
  form.append('checklist_id', String(checklist_id))
  form.append('image', image)
  if (note) form.append('note', note)
  const res = await api.post('/checklist/upload-doc', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const getDailySummary = async (date?: string) => {
  const res = await api.get('/checklist/daily-summary', {
    params: date ? { date } : {},
  })
  return res.data
}