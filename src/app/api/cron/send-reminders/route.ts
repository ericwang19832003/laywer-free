import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/provider'
import { buildReminderEmail } from '@/lib/email/reminder-templates'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Cron job: Send scheduled email reminders for upcoming deadlines.
 *
 * Flow:
 * 1. Fetch reminders where status='scheduled' AND send_at <= now
 * 2. Join through deadlines → cases → auth.users to get recipient email
 * 3. Check user notification preferences (skip if email channel disabled)
 * 4. Send email via provider (Resend or stub)
 * 5. Update reminder status to 'sent' or 'failed'
 * 6. Insert in-app notification for each sent reminder
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.lawyerfree.app'

  // 1. Fetch due reminders with deadline + case info
  const { data: dueReminders, error: fetchError } = await supabase
    .from('reminders')
    .select(`
      id,
      case_id,
      deadline_id,
      channel,
      send_at,
      snoozed_until,
      deadlines!inner (
        id,
        key,
        due_at,
        rationale
      ),
      cases!inner (
        id,
        user_id,
        dispute_type,
        county
      )
    `)
    .eq('status', 'scheduled')
    .lte('send_at', now.toISOString())
    .limit(50) // Process in batches to stay within execution time

  if (fetchError) {
    return NextResponse.json(
      { error: 'Failed to fetch reminders', details: fetchError.message },
      { status: 500 }
    )
  }

  if (!dueReminders || dueReminders.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0, skipped: 0, message: 'No reminders due' })
  }

  // 2. Get user emails and notification preferences
  const userIds = [...new Set(dueReminders.map((r: any) => r.cases.user_id))]

  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) {
    return NextResponse.json(
      { error: 'Failed to fetch users', details: usersError.message },
      { status: 500 }
    )
  }

  const userMap = new Map(
    users
      .filter(u => userIds.includes(u.id))
      .map(u => [u.id, {
        email: u.email ?? '',
        name: u.user_metadata?.display_name ?? u.user_metadata?.full_name ?? 'there',
        preferences: u.user_metadata?.notification_preferences as {
          timing?: Record<string, boolean>
          channels?: Record<string, boolean>
        } | undefined,
      }])
  )

  let sent = 0
  let failed = 0
  let skipped = 0
  const notificationRows: any[] = []
  const sentIds: string[] = []
  const failedIds: string[] = []
  const skippedIds: string[] = []

  for (const reminder of dueReminders as any[]) {
    const userId = reminder.cases.user_id
    const user = userMap.get(userId)

    // Skip if user not found or no email
    if (!user?.email) {
      skippedIds.push(reminder.id)
      skipped++
      continue
    }

    // Skip if snoozed
    if (reminder.snoozed_until && new Date(reminder.snoozed_until) > now) {
      skippedIds.push(reminder.id)
      skipped++
      continue
    }

    // Check user preferences — skip if email channel disabled
    if (user.preferences?.channels?.email === false) {
      skippedIds.push(reminder.id)
      skipped++
      continue
    }

    // Check timing preference
    const dueDate = new Date(reminder.deadlines.due_at)
    const daysUntil = Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)))
    const timingKey = daysUntil <= 1 ? 'days_1' : daysUntil <= 3 ? 'days_3' : 'days_7'
    if (user.preferences?.timing?.[timingKey] === false) {
      skippedIds.push(reminder.id)
      skipped++
      continue
    }

    // Build and send email
    const deadlineLabel = formatDeadlineKey(reminder.deadlines.key)
    const caseTitle = `${formatDisputeType(reminder.cases.dispute_type)} — ${reminder.cases.county} County`
    const caseUrl = `${appUrl}/case/${reminder.case_id}/deadlines`

    const { subject, body } = buildReminderEmail({
      userName: user.name,
      deadlineLabel,
      dueDate: formatDate(dueDate),
      daysUntil,
      caseTitle,
      caseUrl,
    })

    const result = await sendEmail({ to: user.email, subject, body })

    if (result.success) {
      sentIds.push(reminder.id)
      sent++

      // Queue in-app notification
      notificationRows.push({
        user_id: userId,
        case_id: reminder.case_id,
        type: 'deadline_approaching',
        title: daysUntil <= 1 ? 'Urgent: Deadline Tomorrow' : 'Upcoming Deadline',
        body: `${deadlineLabel} is due ${daysUntil <= 1 ? 'tomorrow' : `in ${daysUntil} days`} (${formatDate(dueDate)})`,
        link: `/case/${reminder.case_id}/deadlines`,
      })
    } else {
      failedIds.push(reminder.id)
      failed++
      console.error(`[SEND-REMINDERS] Failed for reminder ${reminder.id}: ${result.error}`)
    }
  }

  // 3. Batch update reminder statuses
  if (sentIds.length > 0) {
    await supabase
      .from('reminders')
      .update({ status: 'sent' })
      .in('id', sentIds)
  }

  if (failedIds.length > 0) {
    await supabase
      .from('reminders')
      .update({ status: 'failed' })
      .in('id', failedIds)
  }

  if (skippedIds.length > 0) {
    await supabase
      .from('reminders')
      .update({ status: 'skipped' })
      .in('id', skippedIds)
  }

  // 4. Insert in-app notifications
  if (notificationRows.length > 0) {
    const { error: notifError } = await supabase.from('notifications').insert(notificationRows)
    if (notifError) {
      console.error('[SEND-REMINDERS] Failed to insert notifications:', notifError.message)
    }
  }

  return NextResponse.json({ sent, failed, skipped })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDeadlineKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function formatDisputeType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
