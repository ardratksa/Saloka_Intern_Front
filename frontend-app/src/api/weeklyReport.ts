import api from '@/lib/axios'
import type { WeeklyReport } from '@/types'

export const getWeeklyReport = async (week_start: string) => {
  const res = await api.get('/weekly-report', {
    params: { week_start },
  })
  return res.data as WeeklyReport
}