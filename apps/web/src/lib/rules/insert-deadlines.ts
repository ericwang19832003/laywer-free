/**
 * Shared Deadline Insertion Logic
 *
 * Extracted from auto-generate-deadlines.ts so the same insert + reminders +
 * audit + notification logic can be reused from:
 *   - auto-generate-deadlines.ts (task-completion trigger)
 *   - import route (intake-driven seeding)
 *   - backfill endpoint
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type { GeneratedDeadline } from '@lawyer-free/shared/rules/deadline-generator'

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

type ReminderRow = {
  case_id: string
  deadline_id: string
  channel: 'email' | 'sms'
  send_at: string
  status: 'scheduled'
}

/**
 * Build the reminder rows for a deadline without hitting the database.
 * Exported for unit testing and reuse.
 */
export function buildReminderRows(params: {
  deadlineId: string
  caseId: string
  dueAt: Date
  now: Date
  smsPhone: string | undefined
}): ReminderRow[] {
  const { deadlineId, caseId, dueAt, now, smsPhone } = params
  const rows: ReminderRow[] = []

  // Email: T-7, T-3, T-1
  for (const days of [7, 3, 1]) {
    const sendAt = new Date(dueAt.getTime() - days * 24 * 60 * 60 * 1000)
    if (sendAt > now) {
      rows.push({
        case_id: caseId,
        deadline_id: deadlineId,
        channel: 'email',
        send_at: sendAt.toISOString(),
        status: 'scheduled',
      })
    }
  }

  // SMS: T-3, T-1, T-0 (only if phone provided)
  if (smsPhone) {
    for (const days of [3, 1, 0]) {
      const sendAt = new Date(dueAt.getTime() - days * 24 * 60 * 60 * 1000)
      if (sendAt > now) {
        rows.push({
          case_id: caseId,
          deadline_id: deadlineId,
          channel: 'sms',
          send_at: sendAt.toISOString(),
          status: 'scheduled',
        })
      }
    }
  }

  return rows
}

/**
 * Insert a single deadline row and create associated reminders, audit event,
 * and in-app notification.
 *
 * Returns the inserted deadline id, or null on failure.
 */
export async function insertDeadlineWithReminders(
  supabase: SupabaseClient,
  deadline: GeneratedDeadline,
  opts: {
    /** Used for the audit event payload */
    triggerSource: string
    /** Case owner user_id (for notification). Fetched internally if not provided. */
    userId?: string
    /** When provided, SMS reminder rows are created at T-3, T-1, T-0. */
    smsPhone?: string
  }
): Promise<string | null> {
  // --- Insert deadline row ---
  const { data: inserted, error: insertError } = await supabase
    .from('deadlines')
    .insert({
      case_id: deadline.case_id,
      key: deadline.key,
      due_at: deadline.due_at,
      source: deadline.source,
      rationale: deadline.rationale,
      label: deadline.label,
      consequence: deadline.consequence,
      auto_generated: deadline.auto_generated,
    })
    .select()
    .single()

  if (insertError || !inserted) {
    console.error(
      `[insert-deadlines] Failed to insert ${deadline.key}:`,
      insertError?.message
    )
    return null
  }

  // --- Create reminders (email T-7/T-3/T-1; SMS T-3/T-1/T-0 if phone given) ---
  const remindersToInsert = buildReminderRows({
    deadlineId: inserted.id,
    caseId: deadline.case_id,
    dueAt: new Date(deadline.due_at),
    now: new Date(),
    smsPhone: opts?.smsPhone,
  })

  if (remindersToInsert.length > 0) {
    await supabase.from('reminders').insert(remindersToInsert)
  }

  // --- Audit trail ---
  await supabase.from('task_events').insert({
    case_id: deadline.case_id,
    kind: 'deadline_auto_generated',
    payload: {
      deadline_id: inserted.id,
      key: deadline.key,
      label: deadline.label,
      due_at: deadline.due_at,
      trigger_source: opts.triggerSource,
    },
  })

  // --- In-app notification ---
  let userId = opts.userId
  if (!userId) {
    const { data: caseData } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', deadline.case_id)
      .single()
    userId = caseData?.user_id
  }

  if (userId) {
    const formattedDate = new Date(deadline.due_at).toLocaleDateString(
      'en-US',
      { month: 'long', day: 'numeric', year: 'numeric' }
    )
    await supabase.from('notifications').insert({
      user_id: userId,
      title: `${deadline.label} added`,
      body: `${deadline.label}: ${formattedDate}`,
      link: `/case/${deadline.case_id}/deadlines`,
      read: false,
    })
  }

  return inserted.id as string
}
