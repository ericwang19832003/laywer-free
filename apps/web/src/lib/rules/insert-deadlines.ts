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

  // --- Create reminders at -7d, -3d, -1d (skip past dates) ---
  const dueDate = new Date(deadline.due_at)
  const now = new Date()
  const remindersToInsert = [7, 3, 1]
    .map(
      (days) => new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000)
    )
    .filter((sendAt) => sendAt > now)
    .map((sendAt) => ({
      case_id: deadline.case_id,
      deadline_id: inserted.id,
      channel: 'email' as const,
      send_at: sendAt.toISOString(),
      status: 'scheduled' as const,
    }))

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
