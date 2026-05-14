import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export interface TodaysAction {
  type: 'deadline' | 'task' | 'stale' | 'empty' | 'no_cases'
  caseId?: string
  caseName?: string
  caseType?: string
  county?: string
  taskId?: string
  actionText?: string
  daysUntilDue?: number
  daysOverdue?: number
}

const DISPUTE_LABELS: Record<string, string> = {
  personal_injury: 'Personal Injury',
  contract: 'Contract',
  landlord_tenant: 'Landlord-Tenant',
  debt_collection: 'Debt Defense',
  real_estate: 'Real Estate',
  business: 'Business',
  employment: 'Employment',
  family: 'Family Law',
  small_claims: 'Small Claims',
  property_damage: 'Property Damage',
  other: 'Other',
}

const PI_SUB_TYPE_LABELS: Record<string, string> = {
  auto_accident: 'Auto Accident',
  pedestrian_cyclist: 'Pedestrian/Cyclist',
  rideshare: 'Rideshare Accident',
  uninsured_motorist: 'Uninsured/Underinsured Motorist',
  slip_and_fall: 'Slip and Fall',
  dog_bite: 'Dog Bite',
  product_liability: 'Product Liability',
  vehicle_damage: 'Vehicle Damage',
  property_damage_negligence: 'Property Damage',
  vandalism: 'Vandalism',
  other_property_damage: 'Property Damage',
  other: 'Other Personal Injury',
}

export async function GET() {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Fetch all active cases
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id, county, dispute_type, status')
      .eq('status', 'active')

    if (casesError) {
      return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
    }

    if (!cases || cases.length === 0) {
      return NextResponse.json({ type: 'no_cases' } satisfies TodaysAction)
    }

    const caseIds = cases.map((c) => c.id)
    const caseMap = new Map(cases.map((c) => [c.id, c]))

    // Fetch pi_sub_type for PI cases to show accurate labels
    const piCaseIds = cases.filter(c => c.dispute_type === 'personal_injury').map(c => c.id)
    const piSubTypeMap = new Map<string, string>()
    if (piCaseIds.length > 0) {
      const { data: piDetails } = await supabase
        .from('personal_injury_details')
        .select('case_id, pi_sub_type')
        .in('case_id', piCaseIds)
      for (const pd of piDetails ?? []) {
        if (pd.pi_sub_type) piSubTypeMap.set(pd.case_id, pd.pi_sub_type)
      }
    }
    const now = Date.now()

    // Fetch deadlines and incomplete tasks in parallel
    const [deadlinesResult, tasksResult, activityResult] = await Promise.all([
      supabase
        .from('deadlines')
        .select('case_id, due_at, key, label')
        .in('case_id', caseIds)
        .order('due_at', { ascending: true }),
      supabase
        .from('tasks')
        .select('id, case_id, title, status, sort_order')
        .in('case_id', caseIds)
        .in('status', ['todo', 'in_progress'])
        .order('sort_order', { ascending: true }),
      supabase
        .from('task_events')
        .select('case_id, created_at')
        .in('case_id', caseIds)
        .order('created_at', { ascending: false }),
    ])

    const deadlines = deadlinesResult.data ?? []
    const tasks = tasksResult.data ?? []
    const activity = activityResult.data ?? []

    function buildResult(
      type: TodaysAction['type'],
      caseId: string,
      extra: Partial<TodaysAction>,
    ): TodaysAction {
      const c = caseMap.get(caseId)
      const piSubType = piSubTypeMap.get(caseId)
      const caseName = piSubType
        ? PI_SUB_TYPE_LABELS[piSubType] ?? DISPUTE_LABELS[c?.dispute_type ?? ''] ?? 'Case'
        : DISPUTE_LABELS[c?.dispute_type ?? ''] ?? 'Case'
      return {
        type,
        caseId,
        caseName,
        county: c?.county ?? undefined,
        ...extra,
      }
    }

    // Priority 1: Overdue deadlines (days overdue DESC)
    const overdue = deadlines
      .filter((d) => new Date(d.due_at).getTime() < now)
      .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime())

    if (overdue.length > 0) {
      const d = overdue[0]
      const daysOverdue = Math.ceil((now - new Date(d.due_at).getTime()) / 86_400_000)
      // Find a task in this case to link to
      const caseTask = tasks.find((t) => t.case_id === d.case_id)
      return NextResponse.json(
        buildResult('deadline', d.case_id, {
          taskId: caseTask?.id,
          actionText: d.label || 'Address this deadline',
          daysOverdue,
        }),
      )
    }

    // Priority 2: Deadlines due within 7 days (due date ASC)
    const sevenDaysMs = 7 * 86_400_000
    const upcoming = deadlines.filter((d) => {
      const dueMs = new Date(d.due_at).getTime()
      return dueMs >= now && dueMs <= now + sevenDaysMs
    })

    if (upcoming.length > 0) {
      const d = upcoming[0]
      const daysUntilDue = Math.ceil((new Date(d.due_at).getTime() - now) / 86_400_000)
      const caseTask = tasks.find((t) => t.case_id === d.case_id)
      return NextResponse.json(
        buildResult('deadline', d.case_id, {
          taskId: caseTask?.id,
          actionText: d.label || 'Complete this before the deadline',
          daysUntilDue,
        }),
      )
    }

    // Priority 3: Next incomplete task (by sort_order)
    if (tasks.length > 0) {
      const t = tasks[0]
      return NextResponse.json(
        buildResult('task', t.case_id, {
          taskId: t.id,
          actionText: t.title,
        }),
      )
    }

    // Priority 4: Stale cases (no activity in 14+ days)
    const activityByCase = new Map<string, string>()
    for (const a of activity) {
      if (!activityByCase.has(a.case_id)) activityByCase.set(a.case_id, a.created_at)
    }

    const fourteenDaysMs = 14 * 86_400_000
    const staleCases = cases.filter((c) => {
      const lastActive = activityByCase.get(c.id)
      if (!lastActive) return true
      return now - new Date(lastActive).getTime() >= fourteenDaysMs
    })

    if (staleCases.length > 0) {
      const c = staleCases[0]
      return NextResponse.json(
        buildResult('stale', c.id, {
          actionText: 'Check in on this case — it has been a while',
        }),
      )
    }

    // All caught up
    return NextResponse.json({ type: 'empty' } satisfies TodaysAction)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
