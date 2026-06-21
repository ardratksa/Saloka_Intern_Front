import api from '@/lib/axios'
import axios from 'axios'

export interface WorkProgram {
  id: number

  location_type_id: number

  area_id?: number
  area_name?: string
  location_name?: string
  sub_location?: string

  job_id: number

  category: 'plan' | 'out_plan'

  plan: 'weekly' | 'monthly'

  how_to_do?: string

  time_range?: string

  pic?: string

  month: number

  year: number

  scheduled_dates: number[]

  status: 'pending' | 'done' | 'late'

  checker?: string

  remark?: string

  has_evidence: boolean
}

export async function getWorkPrograms(params?: {
  plan?: string
  category?: string
  month?: number
  year?: number
}) {
  const response = await api.get(
    '/work-programs',
    { params }
  )

  return {
    success: response.data.success,
    data: response.data.data ?? [],
  }
}

export async function createWorkProgram(payload: any) {

  const { data } = await api.post(
    '/work-programs',
    payload
  )

  return data
}

export async function updateWorkProgram(
  id: number,
  payload: any
) {

  const { data } = await api.patch(
    `/work-programs/${id}`,
    payload
  )

  return data
}

export async function deleteWorkProgram(
  id: number
) {

  const { data } = await api.delete(
    `/work-programs/${id}`
  )

  return data
}

export async function getMasterJobs() {

  const response = await api.get(
    '/master-jobs'
  )
  return response.data
}

export async function getLocations(
  keyword = ''
) {

  const response = await axios.get(
    `https://serviceaset.salokapark.app/api/get-master-area?page=1&nama_sub_lokasi=${keyword}`
  )

  console.log(
    'LOCATION API',
    response.data
  )

  return response.data?.data?.data || []
}

  export const uploadEvidence = async (
  id: number,
  beforeImage: File,
  afterImage: File,
  remark?: string
) => {
  const form = new FormData()

  form.append(
    'before_image',
    beforeImage
  )

  form.append(
    'after_image',
    afterImage
  )

  if (remark) {
    form.append('remark', remark)
  }

  const res = await api.post(
    `/work-programs/${id}/evidence`,
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