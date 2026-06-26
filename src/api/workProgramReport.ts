import api from '@/lib/axios'
export async function getWorkProgramReport() {
  const { data } = await api.get(
    '/work-program-report'
  )

  return data.data
}