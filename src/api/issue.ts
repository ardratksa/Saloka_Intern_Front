import api from '@/lib/axios'
import type { Issue } from '@/types'

export const getIssues = async (params?: {
  status?: string
  location_id?: number
  date_from?: string
  date_to?: string
}) => {
  const res = await api.get('/issues', { params })
  return res.data as Issue[]
}

export const createIssue = async (data: {
  checklist_id?: number
  location_id: number
  date: string
  type: string
  description?: string
  before?: File
}) => {
  const form = new FormData()
  form.append('location_id', String(data.location_id))
  form.append('date', data.date)
  form.append('type', data.type)
  if (data.checklist_id) {
    form.append('checklist_id', String(data.checklist_id))
  }
  if (data.description) form.append('description', data.description)
  if (data.before) {
    form.append('before', data.before)
  }
  const res = await api.post('/issues', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export const updateIssueStatus = async (
  id: number,
  status: 'open' | 'resolved'
) => {
  const res = await api.patch(`/issues/${id}/status`, { status })
  return res.data
}

export const closeIssue = async (
  id: number,
  note: string,
  image: File
) => {

  const form = new FormData()

  form.append('note', note)
  form.append('image', image)

  const res = await api.post(
    `/issues/${id}/close`,
    form,
    {
      headers: {
        'Content-Type':
          'multipart/form-data',
      },
    }
  )

  return res.data
}

export const exportIssueReport = async (params: any) => {

    const res = await api.get(

        "/issue-report/export",

        {

            params,

            responseType: "blob",

        }

    )

    return res.data

}