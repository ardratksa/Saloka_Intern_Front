import api from '@/lib/axios'
import type { ScReport } from '@/types'

export const getScReports = async (week_start: string) => {
  const res = await api.get('/sc-reports', { params: { week_start } })
  return res.data as ScReport[]
}

export const updateScReport = async (
  id: number,
  data: { pic_name?: string; pic_user_id?: number; notes?: string }
) => {
  const res = await api.patch(`/sc-reports/${id}`, data)
  return res.data
}

export const uploadScReportPhoto = async (
  id: number,
  phase: 'before' | 'progress' | 'after',
  photo: File
) => {
  const form = new FormData()
  form.append('phase', phase)
  form.append('photo', photo)
  const res = await api.post(`/sc-reports/${id}/upload-photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}