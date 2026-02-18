/**
 * Gatekeeper Rules Engine
 *
 * Pure function that evaluates case state and returns actions to unlock
 * or complete tasks. Handles non-linear task chains with branching
 * (default judgment vs contested case) and time-based triggers.
 *
 * Zero side effects — trivially unit-testable.
 */

export interface GatekeeperTask {
  id: string
  task_key: string
  status: string
  due_at: string | null
  metadata: Record<string, unknown>
}

export interface GatekeeperDeadline {
  id: string
  key: string
  due_at: string
  source: string
}

export interface GatekeeperInput {
  tasks: GatekeeperTask[]
  deadlines: GatekeeperDeadline[]
  now: Date
}

export type GatekeeperAction =
  | { type: 'unlock_task'; task_key: string; due_at?: string }
  | { type: 'complete_task'; task_key: string }

function findTask(tasks: GatekeeperTask[], key: string): GatekeeperTask | undefined {
  return tasks.find((t) => t.task_key === key)
}

function findDeadline(deadlines: GatekeeperDeadline[], key: string): GatekeeperDeadline | undefined {
  return deadlines.find((d) => d.key === key)
}

export function evaluateGatekeeperRules(input: GatekeeperInput): GatekeeperAction[] {
  const { tasks, deadlines, now } = input
  const actions: GatekeeperAction[] = []

  const confirmedDeadline = findDeadline(deadlines, 'answer_deadline_confirmed')
  const waitTask = findTask(tasks, 'wait_for_answer')
  const checkDocketTask = findTask(tasks, 'check_docket_for_answer')
  const defaultPacketTask = findTask(tasks, 'default_packet_prep')
  const uploadAnswerTask = findTask(tasks, 'upload_answer')
  const discoveryTask = findTask(tasks, 'discovery_starter_pack')

  // Rule 1: Unlock wait_for_answer when confirmed deadline exists
  if (confirmedDeadline && waitTask?.status === 'locked') {
    actions.push({
      type: 'unlock_task',
      task_key: 'wait_for_answer',
      due_at: confirmedDeadline.due_at,
    })
  }

  // Rule 2: Complete wait_for_answer when deadline has passed
  const deadlinePassed = confirmedDeadline && now >= new Date(confirmedDeadline.due_at)
  if (
    deadlinePassed &&
    waitTask &&
    (waitTask.status === 'todo' || waitTask.status === 'in_progress')
  ) {
    actions.push({ type: 'complete_task', task_key: 'wait_for_answer' })
  }

  // Rule 3: Unlock check_docket_for_answer when deadline has passed
  if (deadlinePassed && checkDocketTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'check_docket_for_answer' })
  }

  // Rule 4: Branch — no_answer → unlock default_packet_prep
  if (
    checkDocketTask?.status === 'completed' &&
    checkDocketTask.metadata?.docket_result === 'no_answer' &&
    defaultPacketTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'default_packet_prep' })
  }

  // Rule 5: Branch — answer_filed → unlock upload_answer
  if (
    checkDocketTask?.status === 'completed' &&
    checkDocketTask.metadata?.docket_result === 'answer_filed' &&
    uploadAnswerTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'upload_answer' })
  }

  // Rule 6: upload_answer completed → unlock discovery_starter_pack
  if (uploadAnswerTask?.status === 'completed' && discoveryTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'discovery_starter_pack' })
  }

  return actions
}
