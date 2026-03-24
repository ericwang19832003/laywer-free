export interface DashboardData {
  next_task: {
    id: string
    task_key: string
    title: string
    status: string
  } | null
  tasks_summary: Record<string, number>
  upcoming_deadlines: Array<{
    id: string
    key: string
    due_at: string
    source: string
    label: string | null
    consequence: string | null
  }>
  recent_events: Array<{
    id: string
    kind: string
    payload: Record<string, unknown>
    created_at: string
    task_title?: string
  }>
}

export interface SharedCaseData {
  caseId: string
  disputeType: string
  jurisdiction: string
  courtType: string
  county: string | null
  outcome: string | null
  createdAt: string | null
}
