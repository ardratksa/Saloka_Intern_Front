import api from '@/lib/axios'
import type { MasterIssue } from '@/types'

export const getMasterIssues = async () => {
  const res = await api.get('/master-issues')
  return res.data as MasterIssue[]
}