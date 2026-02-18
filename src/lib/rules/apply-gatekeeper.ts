/**
 * Gatekeeper Applier
 *
 * Shared orchestrator: loads DB state, calls the pure gatekeeper function,
 * and writes results back to the database. Used by both the API route
 * and the confirm-answer-deadline hook.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { evaluateGatekeeperRules } from './gatekeeper'

export async function runAndApplyGatekeeper(
  supabase: SupabaseClient,
  caseId: string,
  now?: Date
): Promise<{ actionsApplied: string[]; rulesEvaluated: number }> {
  const effectiveNow = now ?? new Date()

  // Load tasks for this case
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id, task_key, status, due_at, metadata')
    .eq('case_id', caseId)

  if (tasksError || !tasks) {
    throw new Error(`Failed to load tasks: ${tasksError?.message}`)
  }

  // Load deadlines for this case
  const { data: deadlines, error: dlError } = await supabase
    .from('deadlines')
    .select('id, key, due_at, source')
    .eq('case_id', caseId)

  if (dlError || !deadlines) {
    throw new Error(`Failed to load deadlines: ${dlError?.message}`)
  }

  // Evaluate rules
  const actions = evaluateGatekeeperRules({
    tasks: tasks.map((t) => ({
      id: t.id,
      task_key: t.task_key,
      status: t.status,
      due_at: t.due_at,
      metadata: (t.metadata as Record<string, unknown>) ?? {},
    })),
    deadlines: deadlines.map((d) => ({
      id: d.id,
      key: d.key,
      due_at: d.due_at,
      source: d.source,
    })),
    now: effectiveNow,
  })

  if (actions.length === 0) {
    return { actionsApplied: [], rulesEvaluated: actions.length }
  }

  // Apply each action
  const actionsApplied: string[] = []

  for (const action of actions) {
    const task = tasks.find((t) => t.task_key === action.task_key)
    if (!task) continue

    if (action.type === 'unlock_task') {
      const updateData: Record<string, unknown> = {
        status: 'todo',
        unlocked_at: effectiveNow.toISOString(),
      }
      if (action.due_at) {
        updateData.due_at = action.due_at
      }

      await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)

      await supabase.from('task_events').insert({
        case_id: caseId,
        task_id: task.id,
        kind: 'task_unlocked',
        payload: {
          task_key: action.task_key,
          source: 'gatekeeper',
          ...(action.due_at ? { due_at: action.due_at } : {}),
        },
      })

      actionsApplied.push(`unlock:${action.task_key}`)
    }

    if (action.type === 'complete_task') {
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: effectiveNow.toISOString(),
        })
        .eq('id', task.id)

      await supabase.from('task_events').insert({
        case_id: caseId,
        task_id: task.id,
        kind: 'task_status_changed',
        payload: {
          task_key: action.task_key,
          from: task.status,
          to: 'completed',
          source: 'gatekeeper',
        },
      })

      actionsApplied.push(`complete:${action.task_key}`)
    }
  }

  // Audit event
  if (actionsApplied.length > 0) {
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'gatekeeper_run',
      payload: {
        actions_applied: actionsApplied,
        evaluated_at: effectiveNow.toISOString(),
      },
    })
  }

  return { actionsApplied, rulesEvaluated: actions.length }
}
