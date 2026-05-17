import api from '@/lib/axios'
import type { Period } from '@/types'

export const getPeriods = async (): Promise<Period[]> => {
  const res = await api.get('/periods')
  return res.data as Period[]
}