import api from '@/lib/axios'

export const exportReport = async (
  startDate: string,
  endDate: string
) => {

  const res = await api.get(
    '/report/export',
    {
      params: {
        start_date: startDate,
        end_date: endDate,
      },

      responseType: 'blob',
    }
  )

  return res.data
}