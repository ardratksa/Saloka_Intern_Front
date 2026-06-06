export type ViewType =
  | 'all'
  | 'weekly'
  | 'monthly'

export interface WorkProgram {
  id: number

  location_type_id: number
  area_id: number

  area_name: string
  location_name: string
  sub_location: string

  job_id: number

  category:
    | 'plan'
    | 'out_plan'

  plan:
    | 'weekly'
    | 'monthly'

  month: number
  year: number

  scheduled_dates: number[]

  job?: {
    id: number
    job: string
  }
}