export interface InsightInput {
  caseId: string
  disputeType: string
  createdAt: string
  tasks: { task_key: string; status: string; completed_at: string | null }[]
  deadlines: { key: string; due_at: string }[]
  evidenceCount: number
  incidentDate?: string | null
}

export interface Insight {
  insight_type: string
  title: string
  body: string
  priority: 'info' | 'warning' | 'urgent'
}
