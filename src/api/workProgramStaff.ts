import api from '@/lib/axios'
import type { WorkProgram } from '@/types'

export const getStaffPrograms = async (
  params?: {
    plan?: string
    month?: number
    year?: number
  }
) => {

  const res = await api.get(
    "/work-programs",
    {
      params,
    }
  )

  return res.data.data as WorkProgram[]
}

export const uploadBeforeEvidence =
  async (
    workProgramId: number,
    image: File,
    remark: string
  ) => {

    const form =
      new FormData()

    form.append(
      'image',
      image
    )

    form.append(
      'remark',
      remark
    )

    const res = await api.post(

      `/work-programs/${workProgramId}/before`,

      form,

      {
          headers:{
              "Content-Type":"multipart/form-data"
          }
      }

  )

    return res.data
  }

export const uploadAfterEvidence =
  async (
    workProgramId: number,
    evidenceId: number,
    image: File,
    remark: string
  ) => {

    const form =
      new FormData()

    form.append(
      'evidence_id',
      String(evidenceId)
    )

    form.append(
      'image',
      image
    )

    form.append(
      'remark',
      remark
    )

    const res = await api.post(

      `/work-programs/${workProgramId}/after`,

      form,

      {
          headers:{
              "Content-Type":"multipart/form-data"
          }
      }

  )

    return res.data
  }