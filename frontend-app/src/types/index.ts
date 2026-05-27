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
  job: string
  order: number
  checklist_id: number | null
  status: 'pending' | 'done' | 'issue'
  note: string | null
  pic: string | null
  documentations: ChecklistDoc[]
}

export interface ChecklistSummary {
  total: number
  done: number
  pending: number
  issue: number
  progress: number
}

export interface ChecklistResponse {
  date: string
  location: {
    id: number
    name: string
    type_id: number
    type_name: string
  }
  period: {
    id: number
    name: string
    time_start: string
    time_end: string
  }
  summary: ChecklistSummary
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
  reported_by: string
  date: string
  status: 'open' | 'in_progress' | 'resolved'
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

export interface WeeklyReport {
  week_start: string
  week_end: string
  summary: {
    total: number
    done: number
    pct: number
    issues: number
  }
  daily_progress: Record<string, {
    total: number
    done: number
    pct: number
  }>
  period_progress: Array<{
    period_id: number
    period_name: string
    time_start: string
    time_end: string
    total: number
    done: number
    pct: number
  }>
  location_progress: Array<{
    location_id: number
    location_name: string
    type: string
    total: number
    done: number
    issue: number
    pct: number
  }>
  issues: Issue[]
}

export interface ActiveLocation {
  id: number
  name: string
  type_id: number
  type_name: string
}