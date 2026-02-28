import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { evaluateEscalations } from '@/lib/rules/escalation-engine'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  // 1. Fetch all escalation rules
  const { data: rules, error: rulesError } = await supabase
    .from('escalation_rules')
    .select('deadline_key, level, offset_days, condition_type, condition_key, message_template')

  if (rulesError) {
    return NextResponse.json(
      { error: 'Failed to fetch rules', details: rulesError.message },
      { status: 500 }
    )
  }

  if (!rules || rules.length === 0) {
    return NextResponse.json({ triggered: 0, message: 'No rules configured' })
  }

  // 2. Fetch deadlines due within the rule window
  const maxOffset = Math.max(...rules.map((r) => r.offset_days))
  const windowEnd = new Date(now.getTime() + (maxOffset + 1) * 24 * 60 * 60 * 1000)

  const { data: deadlines, error: deadlinesError } = await supabase
    .from('deadlines')
    .select('id, case_id, key, due_at, created_at')
    .gte('due_at', now.toISOString())
    .lte('due_at', windowEnd.toISOString())

  if (deadlinesError) {
    return NextResponse.json(
      { error: 'Failed to fetch deadlines', details: deadlinesError.message },
      { status: 500 }
    )
  }

  if (!deadlines || deadlines.length === 0) {
    return NextResponse.json({ triggered: 0, message: 'No active deadlines in window' })
  }

  // 3. Fetch existing escalations for dedup
  const deadlineIds = deadlines.map((d) => d.id)
  const { data: existingEscalations, error: escError } = await supabase
    .from('reminder_escalations')
    .select('deadline_id, escalation_level')
    .in('deadline_id', deadlineIds)

  if (escError) {
    return NextResponse.json(
      { error: 'Failed to fetch existing escalations', details: escError.message },
      { status: 500 }
    )
  }

  // 4. Fetch task_events for condition checks
  const caseIds = [...new Set(deadlines.map((d) => d.case_id))]
  const { data: taskEvents, error: eventsError } = await supabase
    .from('task_events')
    .select('case_id, kind, created_at')
    .in('case_id', caseIds)

  if (eventsError) {
    return NextResponse.json(
      { error: 'Failed to fetch task events', details: eventsError.message },
      { status: 500 }
    )
  }

  // 5. Evaluate escalations
  const actions = evaluateEscalations({
    deadlines,
    rules,
    existingEscalations: existingEscalations || [],
    taskEvents: taskEvents || [],
    now,
  })

  if (actions.length === 0) {
    return NextResponse.json({ triggered: 0, message: 'No escalations to trigger' })
  }

  // 6. Insert reminder_escalations
  const { error: insertError } = await supabase
    .from('reminder_escalations')
    .insert(actions)

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to insert escalations', details: insertError.message },
      { status: 500 }
    )
  }

  // 7. Insert audit trail events
  const auditEvents = actions.map((a) => ({
    case_id: a.case_id,
    kind: 'reminder_escalated',
    payload: {
      deadline_id: a.deadline_id,
      escalation_level: a.escalation_level,
      message: a.message,
    },
  }))

  const { error: auditError } = await supabase
    .from('task_events')
    .insert(auditEvents)

  if (auditError) {
    console.error('Failed to insert escalation audit events:', auditError.message)
  }

  return NextResponse.json({
    triggered: actions.length,
    escalations: actions.map((a) => ({
      case_id: a.case_id,
      deadline_id: a.deadline_id,
      level: a.escalation_level,
    })),
  })
}
