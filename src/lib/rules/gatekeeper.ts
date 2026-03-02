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
  // Motion builder fields
  discoveryResponseDue?: Date | null
  trialDate?: Date | null
  completedMotionTypes?: string[]
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

  // ── Federal Removal Branch ──────────────────────────────

  const understandRemovalTask = findTask(tasks, 'understand_removal')
  const chooseStrategyTask = findTask(tasks, 'choose_removal_strategy')
  const prepAmendedTask = findTask(tasks, 'prepare_amended_complaint')
  const fileAmendedTask = findTask(tasks, 'file_amended_complaint')
  const prepRemandTask = findTask(tasks, 'prepare_remand_motion')
  const fileRemandTask = findTask(tasks, 'file_remand_motion')
  const rule26fTask = findTask(tasks, 'rule_26f_prep')
  const mandatoryDisclosuresTask = findTask(tasks, 'mandatory_disclosures')

  // Rule 7: Branch — case_removed → unlock understand_removal
  if (
    checkDocketTask?.status === 'completed' &&
    checkDocketTask.metadata?.docket_result === 'case_removed' &&
    understandRemovalTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'understand_removal' })
  }

  // Rule 8: understand_removal → choose_removal_strategy
  if (understandRemovalTask?.status === 'completed' && chooseStrategyTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'choose_removal_strategy' })
  }

  // Rule 9: strategy includes accept → prepare_amended_complaint
  const strategy = chooseStrategyTask?.metadata?.strategy as string | undefined
  if (
    chooseStrategyTask?.status === 'completed' &&
    (strategy === 'accept' || strategy === 'both') &&
    prepAmendedTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'prepare_amended_complaint' })
  }

  // Rule 10: strategy includes remand → prepare_remand_motion
  if (
    chooseStrategyTask?.status === 'completed' &&
    (strategy === 'remand' || strategy === 'both') &&
    prepRemandTask?.status === 'locked'
  ) {
    actions.push({ type: 'unlock_task', task_key: 'prepare_remand_motion' })
  }

  // Rule 11: prepare_amended_complaint → file_amended_complaint
  if (prepAmendedTask?.status === 'completed' && fileAmendedTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'file_amended_complaint' })
  }

  // Rule 12: file_amended_complaint → rule_26f_prep
  if (fileAmendedTask?.status === 'completed' && rule26fTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'rule_26f_prep' })
  }

  // Rule 13: rule_26f_prep → mandatory_disclosures
  if (rule26fTask?.status === 'completed' && mandatoryDisclosuresTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'mandatory_disclosures' })
  }

  // Rule 14: prepare_remand_motion → file_remand_motion
  if (prepRemandTask?.status === 'completed' && fileRemandTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'file_remand_motion' })
  }

  // Rule 15: mandatory_disclosures → discovery_starter_pack (removal path)
  if (mandatoryDisclosuresTask?.status === 'completed' && discoveryTask?.status === 'locked') {
    actions.push({ type: 'unlock_task', task_key: 'discovery_starter_pack' })
  }

  // ── Motion Builder Rules ─────────────────────────────────

  // Rule 16: motion to compel when discovery response overdue
  const motionToCompel = findTask(tasks, 'motion_to_compel')
  if (
    discoveryTask?.status === 'completed' &&
    motionToCompel?.status === 'locked' &&
    input.discoveryResponseDue &&
    input.now > input.discoveryResponseDue
  ) {
    actions.push({ type: 'unlock_task', task_key: 'motion_to_compel' })
  }

  // Rule 17: trial prep checklist when trial date within 60 days
  const trialPrepChecklist = findTask(tasks, 'trial_prep_checklist')
  if (
    trialPrepChecklist?.status === 'locked' &&
    input.trialDate &&
    input.trialDate.getTime() - input.now.getTime() <= 60 * 24 * 60 * 60 * 1000
  ) {
    actions.push({ type: 'unlock_task', task_key: 'trial_prep_checklist' })
  }

  // Rule 18: appellate brief after notice of appeal completed
  const appellateBrief = findTask(tasks, 'appellate_brief')
  if (
    appellateBrief?.status === 'locked' &&
    input.completedMotionTypes?.includes('notice_of_appeal')
  ) {
    actions.push({ type: 'unlock_task', task_key: 'appellate_brief' })
  }

  return actions
}
