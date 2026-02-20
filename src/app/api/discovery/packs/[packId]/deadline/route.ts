import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { confirmDiscoveryDeadlineSchema } from '@/lib/schemas/discovery'
import { calculateReminderDates } from '@/lib/rules/reminders'

export const runtime = 'nodejs'

// POST /api/discovery/packs/:packId/deadline — set response due date
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = confirmDiscoveryDeadlineSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { due_at } = parsed.data

    // Fetch pack to verify access, get case_id, and check status (RLS handles ownership)
    const { data: pack, error: packError } = await supabase!
      .from('discovery_packs')
      .select('id, case_id, title, status')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Discovery pack not found' },
        { status: 404 }
      )
    }

    if (pack.status !== 'served' && pack.status !== 'responses_pending') {
      return NextResponse.json(
        { error: 'Pack must be served or awaiting responses to set a deadline' },
        { status: 409 }
      )
    }

    // Delete any existing discovery_response_due_confirmed deadline for this case.
    // FK cascade on reminders table deletes associated reminders automatically.
    await supabase!
      .from('deadlines')
      .delete()
      .eq('case_id', pack.case_id)
      .eq('key', 'discovery_response_due_confirmed')

    // Insert confirmed discovery response deadline
    const { data: deadline, error: dlError } = await supabase!
      .from('deadlines')
      .insert({
        case_id: pack.case_id,
        key: 'discovery_response_due_confirmed',
        due_at,
        source: 'user_confirmed',
        rationale: `Discovery response deadline for "${pack.title}" (pack ${packId})`,
      })
      .select()
      .single()

    if (dlError || !deadline) {
      return NextResponse.json(
        { error: 'Failed to create deadline', details: dlError?.message },
        { status: 500 }
      )
    }

    // Create reminders at -7d, -3d, -1d (only future dates)
    const reminderDates = calculateReminderDates(due_at)
    let reminders: unknown[] = []

    if (reminderDates.length > 0) {
      const remindersToInsert = reminderDates.map((sendAt) => ({
        case_id: pack.case_id,
        deadline_id: deadline.id,
        channel: 'email' as const,
        send_at: sendAt.toISOString(),
        status: 'scheduled' as const,
      }))

      const { data: createdReminders, error: remErr } = await supabase!
        .from('reminders')
        .insert(remindersToInsert)
        .select()

      if (remErr) {
        console.error('Failed to create reminders:', remErr.message)
      } else {
        reminders = createdReminders || []
      }
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: pack.case_id,
      kind: 'discovery_response_deadline_set',
      payload: {
        deadline_id: deadline.id,
        pack_id: packId,
        due_at,
        reminders_created: reminders.length,
      },
    })

    return NextResponse.json({ deadline, reminders }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
