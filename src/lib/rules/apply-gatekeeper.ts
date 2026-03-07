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

  // Fetch discovery response deadline
  const { data: discoveryDeadline } = await supabase
    .from('deadlines')
    .select('due_at')
    .eq('case_id', caseId)
    .eq('key', 'discovery_response_deadline')
    .maybeSingle()

  // Fetch trial date
  const { data: trialDeadline } = await supabase
    .from('deadlines')
    .select('due_at')
    .eq('case_id', caseId)
    .eq('key', 'trial_date')
    .maybeSingle()

  // Fetch completed motion types
  const { data: completedMotions } = await supabase
    .from('motions')
    .select('motion_type')
    .eq('case_id', caseId)
    .in('status', ['finalized', 'filed'])

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
    discoveryResponseDue: discoveryDeadline?.due_at
      ? new Date(discoveryDeadline.due_at)
      : null,
    trialDate: trialDeadline?.due_at
      ? new Date(trialDeadline.due_at)
      : null,
    completedMotionTypes: completedMotions?.map((m) => m.motion_type) ?? [],
  })

  if (actions.length === 0) {
    return { actionsApplied: [], rulesEvaluated: actions.length }
  }

  // Apply actions in two passes:
  // 1. inject_tasks first (creates tasks that subsequent unlocks may reference)
  // 2. unlock_task / complete_task second
  const actionsApplied: string[] = []

  for (const action of actions) {
    if (action.type === 'inject_tasks') {
      for (const def of action.task_definitions) {
        const exists = tasks.find((t) => t.task_key === def.task_key)
        if (exists) continue

        await supabase.from('tasks').insert({
          case_id: caseId,
          task_key: def.task_key,
          title: def.title,
          status: 'locked',
        })
      }

      // Update court_type to federal
      await supabase
        .from('cases')
        .update({ court_type: 'federal' })
        .eq('id', caseId)

      // Re-fetch tasks so subsequent unlock actions find the new tasks
      const { data: refreshedTasks } = await supabase
        .from('tasks')
        .select('id, task_key, status, due_at, metadata')
        .eq('case_id', caseId)

      if (refreshedTasks) {
        tasks.splice(0, tasks.length, ...refreshedTasks)
      }

      actionsApplied.push(`inject_tasks:${action.task_definitions.map((d) => d.task_key).join(',')}`)
    }
  }

  for (const action of actions) {
    if (action.type === 'inject_tasks') continue

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
