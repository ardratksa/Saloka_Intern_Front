export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'staff'
  is_leader: boolean
  wa_number: string | null
  photo_url: string | null
}

export interface LocationType {
  id: number
  name: string
  is_active: boolean
}

export interface Location {
  id: number
  name: string
  type_id: number
  type_name: string
  qr_code: string
  is_active: boolean
}

export interface MasterJob {
  id: number
  job: string
  order: number
  is_active: boolean
  location_type_id: number
  location_type: string
}

export interface Period {
  id: number
  name: string
  time_start: string
  time_end: string
  is_active: boolean
}

export interface ChecklistDoc {
  id: number
  image_url: string
  note: string | null
}

export interface ChecklistItem {
  job_id: number
  name: string
  checklist_id: number | null

  status: 'pending' | 'done' | 'issue'

  note: string | null

  has_issue: boolean
}

export interface ChecklistSummary {
  total: number
  done: number
  pending: number
  issue: number
  progress: number
}

export interface ChecklistResponse {
  location_id: number
  location: string

  items: ChecklistItem[]
}

export interface IssueDoc {
  id: number
  image_url: string
  note: string | null
}

export interface Issue {
  id: number
  checklist_id: number | null
  type: string
  description: string | null
  location_id: number
  location: string
  job_name?: string
  reported_by: string
  date: string
  status: 'open' | 'resolved'
  wa_sent: boolean
  created_at: string
  photos: IssueDoc[]
}

export interface ScReport {
  id: number
  task_name: string
  week_label: string
  week_start: string
  pic_name: string | null
  pic_user: string | null
  notes: string | null
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
  photos: {
    before?: string
    progress?: string
    after?: string
  }
}

export interface WorkPlan {
  id: number
  name: string
  type: 'plan' | 'simple'
  location_id: number
  location: string
  created_by: string
  duration_estimate: string | null
  planned_start: string | null
  notes: string | null
  status: 'pending' | 'in_progress' | 'done'
  created_at: string
}

export interface WorkProgramEvidence {
  id: number

  before_image?: string
  after_image?: string

  before_remark?: string
  after_remark?: string

  date: string
}

export interface WorkProgram {
  id: number

  location_type_id: number

  area_name?: string
  location_name?: string
  sub_location?: string

  job_id: number

  category: 'plan' | 'out_plan'

  plan: 'weekly' | 'monthly'

  time_range?: string

  month: number

  year: number

  scheduled_dates: number[]

  status:
  | 'pending'
  | 'progress'
  | 'done'
  | 'late'

  completed_at?: string

  has_evidence: boolean

  job?: {
    id: number
    job: string
  }

  evidences?: WorkProgramEvidence[]
}

export interface WeeklyReport {

  start_date: string

  end_date: string

  summary: {

    total: number

    done: number

    pct: number

    issues: number
  }

  checklists: Array<{

    id: number

    date: string

    location: string

    location_type: string

    period: string

    pic: string

    status:
      | 'pending'
      | 'done'
      | 'issue'

    note: string | null

    total_docs: number

    photos: ChecklistDoc[]
  }>

  issues: Issue[]
}

export interface ActiveLocation {
  id: number
  name: string
  type_id: number
  type_name: string
}

export interface MasterIssue {
  id: number
  name: string
  is_active: boolean
}
