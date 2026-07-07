import api from '@/lib/axios'

export const exportReport = async (params: {
  start_date: string
  end_date: string
  location: string
  type: string
  period: string
  pic: string
  status: string
}) => {

  const res = await api.get(
    '/report/export',
    {
      params,
      responseType: 'blob',
    }
  )

  return res.data
}