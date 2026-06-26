import api from '@/lib/axios'
export const exportDashboard = async (
  params: {
    date?: string
    location_id?: number
    location_type_id?: number | string
    shift?: string
  }
) => {

  const response = await api.get(
    '/dashboard/export',
    {
      params,
      responseType: 'blob',
    }
  )

  return response.data
}