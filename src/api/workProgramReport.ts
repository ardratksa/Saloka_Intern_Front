import api from '@/lib/axios'

export async function getWorkProgramReport() {
  const { data } = await api.get(
    '/work-program-report'
  )

  return data.data
}

export async function exportWorkProgram(params: any) {

  const res = await api.get(

    '/work-program/export',

    {
      params,
      responseType: 'blob',
    }

  )

  return res.data
}