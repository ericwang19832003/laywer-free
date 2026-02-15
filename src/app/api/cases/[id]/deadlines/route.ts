import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createDeadlineSchema } from '@/lib/schemas/deadline'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = createDeadlineSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { key, due_at, source, rationale } = parsed.data

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', id)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Insert the deadline
    const { data: deadline, error: deadlineError } = await supabase!
      .from('deadlines')
      .insert({
        case_id: id,
        key,
        due_at,
        source,
        rationale,
      })
      .select()
      .single()

    if (deadlineError) {
      return NextResponse.json(
        { error: 'Failed to create deadline', details: deadlineError.message },
        { status: 500 }
      )
    }

    // Auto-create reminders at -7d, -3d, -1d from due_at (skip if in the past)
    const dueDate = new Date(due_at)
    const now = new Date()
    const reminderOffsets = [
      { days: 7, label: '7d before' },
      { days: 3, label: '3d before' },
      { days: 1, label: '1d before' },
    ]

    const remindersToInsert = reminderOffsets
      .map(({ days }) => {
        const sendAt = new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000)
        return { send_at: sendAt }
      })
      .filter(({ send_at }) => send_at > now)
      .map(({ send_at }) => ({
        case_id: id,
        deadline_id: deadline.id,
        channel: 'email' as const,
        send_at: send_at.toISOString(),
        status: 'scheduled' as const,
      }))

    let reminders: unknown[] = []
    if (remindersToInsert.length > 0) {
      const { data: createdReminders, error: remindersError } = await supabase!
        .from('reminders')
        .insert(remindersToInsert)
        .select()

      if (remindersError) {
        // Non-fatal: deadline was created, just log the reminder failure
        console.error('Failed to create reminders:', remindersError.message)
      } else {
        reminders = createdReminders || []
      }
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: id,
      kind: 'deadline_created',
      payload: {
        deadline_id: deadline.id,
        key,
        due_at,
        source,
        reminders_created: reminders.length,
      },
    })

    // Fetch the created reminders for the response
    const { data: fetchedReminders } = await supabase!
      .from('reminders')
      .select()
      .eq('deadline_id', deadline.id)
      .order('send_at', { ascending: true })

    return NextResponse.json(
      { deadline, reminders: fetchedReminders || [] },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Fetch deadlines with their reminders, ordered by due_at asc
    const { data: deadlines, error } = await supabase!
      .from('deadlines')
      .select('*, reminders(*)')
      .eq('case_id', id)
      .order('due_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch deadlines', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ deadlines: deadlines || [] })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
