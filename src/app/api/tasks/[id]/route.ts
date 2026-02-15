import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { updateTaskSchema, VALID_TRANSITIONS } from '@/lib/schemas/task'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = updateTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { status: newStatus, metadata } = parsed.data

    // Fetch current task (RLS handles ownership check)
    const { data: currentTask, error: fetchError } = await supabase!
      .from('tasks')
      .select()
      .eq('id', id)
      .single()

    if (fetchError || !currentTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Validate status transition
    const allowedTransitions = VALID_TRANSITIONS[currentTask.status] || []
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        {
          error: 'Invalid status transition',
          details: `Cannot transition from '${currentTask.status}' to '${newStatus}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
        },
        { status: 422 }
      )
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = { status: newStatus }

    if (newStatus === 'completed') {
      updatePayload.completed_at = new Date().toISOString()
    }

    if (metadata) {
      updatePayload.metadata = { ...currentTask.metadata, ...metadata }
    }

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase!
      .from('tasks')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update task', details: updateError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: currentTask.case_id,
      task_id: id,
      kind: 'task_status_changed',
      payload: {
        from: currentTask.status,
        to: newStatus,
        task_key: currentTask.task_key,
      },
    })

    return NextResponse.json({ task: updatedTask })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
