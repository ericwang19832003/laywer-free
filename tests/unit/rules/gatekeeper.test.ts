import { describe, it, expect } from 'vitest'
import {
  evaluateGatekeeperRules,
  type GatekeeperTask,
  type GatekeeperDeadline,
  type GatekeeperInput,
} from '@/lib/rules/gatekeeper'

function makeTask(
  key: string,
  status: string,
  metadata: Record<string, unknown> = {}
): GatekeeperTask {
  return {
    id: `task-${key}`,
    task_key: key,
    status,
    due_at: null,
    metadata,
  }
}

function makeDeadline(key: string, due_at: string): GatekeeperDeadline {
  return { id: `dl-${key}`, key, due_at, source: 'user_confirmed' }
}

function makeInput(overrides: Partial<GatekeeperInput> = {}): GatekeeperInput {
  return {
    tasks: [],
    deadlines: [],
    now: new Date('2026-03-01T12:00:00Z'),
    ...overrides,
  }
}

describe('evaluateGatekeeperRules', () => {
  // ── Rule 1: unlock wait_for_answer ────────────────────────
  it('unlocks wait_for_answer when confirmed deadline exists', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [makeTask('wait_for_answer', 'locked')],
        deadlines: [makeDeadline('answer_deadline_confirmed', '2026-03-15T10:00:00Z')],
      })
    )

    expect(actions).toEqual([
      {
        type: 'unlock_task',
        task_key: 'wait_for_answer',
        due_at: '2026-03-15T10:00:00Z',
      },
    ])
  })

  it('does not re-unlock wait_for_answer if already todo (idempotent)', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [makeTask('wait_for_answer', 'todo')],
        deadlines: [makeDeadline('answer_deadline_confirmed', '2026-03-15T10:00:00Z')],
      })
    )

    expect(actions).toEqual([])
  })

  it('does nothing without a confirmed deadline', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [makeTask('wait_for_answer', 'locked')],
        deadlines: [],
      })
    )

    expect(actions).toEqual([])
  })

  // ── Rule 2 & 3: time-based completion + unlock ────────────
  it('completes wait_for_answer and unlocks check_docket when deadline passed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('wait_for_answer', 'todo'),
          makeTask('check_docket_for_answer', 'locked'),
        ],
        deadlines: [makeDeadline('answer_deadline_confirmed', '2026-02-28T10:00:00Z')],
        now: new Date('2026-03-01T12:00:00Z'),
      })
    )

    expect(actions).toEqual([
      { type: 'complete_task', task_key: 'wait_for_answer' },
      { type: 'unlock_task', task_key: 'check_docket_for_answer' },
    ])
  })

  it('does nothing when deadline is still in the future', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('wait_for_answer', 'todo'),
          makeTask('check_docket_for_answer', 'locked'),
        ],
        deadlines: [makeDeadline('answer_deadline_confirmed', '2026-03-15T10:00:00Z')],
        now: new Date('2026-03-01T12:00:00Z'),
      })
    )

    expect(actions).toEqual([])
  })

  // ── Rule 4: no_answer branch ──────────────────────────────
  it('unlocks default_packet_prep when docket result is no_answer', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'no_answer' }),
          makeTask('default_packet_prep', 'locked'),
          makeTask('upload_answer', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'default_packet_prep' },
    ])
  })

  // ── Rule 5: answer_filed branch ───────────────────────────
  it('unlocks upload_answer when docket result is answer_filed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'answer_filed' }),
          makeTask('default_packet_prep', 'locked'),
          makeTask('upload_answer', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'upload_answer' },
    ])
  })

  // ── Mutual exclusivity ────────────────────────────────────
  it('only unlocks one branch — not both', () => {
    const noAnswerActions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'no_answer' }),
          makeTask('default_packet_prep', 'locked'),
          makeTask('upload_answer', 'locked'),
        ],
      })
    )

    const hasDefault = noAnswerActions.some(
      (a) => a.type === 'unlock_task' && a.task_key === 'default_packet_prep'
    )
    const hasUpload = noAnswerActions.some(
      (a) => a.type === 'unlock_task' && a.task_key === 'upload_answer'
    )

    expect(hasDefault).toBe(true)
    expect(hasUpload).toBe(false)
  })

  // ── Rule 6: upload_answer → discovery ─────────────────────
  it('unlocks discovery_starter_pack when upload_answer completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('upload_answer', 'completed'),
          makeTask('discovery_starter_pack', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'discovery_starter_pack' },
    ])
  })

  // ── Full chain: no-answer path ────────────────────────────
  it('evaluates full no-answer path in one call', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('wait_for_answer', 'todo'),
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'no_answer' }),
          makeTask('default_packet_prep', 'locked'),
          makeTask('upload_answer', 'locked'),
          makeTask('discovery_starter_pack', 'locked'),
        ],
        deadlines: [makeDeadline('answer_deadline_confirmed', '2026-02-28T10:00:00Z')],
        now: new Date('2026-03-01T12:00:00Z'),
      })
    )

    const actionSummary = actions.map((a) => `${a.type}:${a.task_key}`)
    expect(actionSummary).toContain('complete_task:wait_for_answer')
    expect(actionSummary).toContain('unlock_task:default_packet_prep')
    // Should NOT unlock upload_answer or discovery (wrong branch)
    expect(actionSummary).not.toContain('unlock_task:upload_answer')
    expect(actionSummary).not.toContain('unlock_task:discovery_starter_pack')
  })

  // ── Empty state ───────────────────────────────────────────
  it('returns no actions when no tasks exist', () => {
    const actions = evaluateGatekeeperRules(makeInput())
    expect(actions).toEqual([])
  })

  // ── Rule 7: case_removed → unlock understand_removal ────
  it('unlocks understand_removal when docket result is case_removed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'case_removed' }),
          makeTask('understand_removal', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'understand_removal' },
    ])
  })

  it('does not unlock understand_removal for other docket results', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'answer_filed' }),
          makeTask('understand_removal', 'locked'),
          makeTask('upload_answer', 'locked'),
        ],
      })
    )

    expect(actions.some(a => a.type === 'unlock_task' && a.task_key === 'understand_removal')).toBe(false)
  })

  // ── Rule 8: understand_removal → choose_removal_strategy ──
  it('unlocks choose_removal_strategy when understand_removal completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('understand_removal', 'completed'),
          makeTask('choose_removal_strategy', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'choose_removal_strategy' },
    ])
  })

  // ── Rule 9: strategy=accept → prepare_amended_complaint ──
  it('unlocks prepare_amended_complaint when strategy includes accept', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('choose_removal_strategy', 'completed', { strategy: 'accept' }),
          makeTask('prepare_amended_complaint', 'locked'),
          makeTask('prepare_remand_motion', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'prepare_amended_complaint' },
    ])
  })

  // ── Rule 10: strategy=remand → prepare_remand_motion ──
  it('unlocks prepare_remand_motion when strategy includes remand', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('choose_removal_strategy', 'completed', { strategy: 'remand' }),
          makeTask('prepare_amended_complaint', 'locked'),
          makeTask('prepare_remand_motion', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'prepare_remand_motion' },
    ])
  })

  // ── Rule 9+10: strategy=both → both branches ──
  it('unlocks both branches when strategy is both', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('choose_removal_strategy', 'completed', { strategy: 'both' }),
          makeTask('prepare_amended_complaint', 'locked'),
          makeTask('prepare_remand_motion', 'locked'),
        ],
      })
    )

    const keys = actions.map(a => a.type === 'unlock_task' ? a.task_key : null).filter(Boolean)
    expect(keys).toContain('prepare_amended_complaint')
    expect(keys).toContain('prepare_remand_motion')
  })

  // ── Rule 11: prepare_amended_complaint → file_amended_complaint ──
  it('unlocks file_amended_complaint when prepare_amended_complaint completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('prepare_amended_complaint', 'completed'),
          makeTask('file_amended_complaint', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'file_amended_complaint' },
    ])
  })

  // ── Rule 12: file_amended_complaint → rule_26f_prep ──
  it('unlocks rule_26f_prep when file_amended_complaint completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('file_amended_complaint', 'completed'),
          makeTask('rule_26f_prep', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'rule_26f_prep' },
    ])
  })

  // ── Rule 13: rule_26f_prep → mandatory_disclosures ──
  it('unlocks mandatory_disclosures when rule_26f_prep completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('rule_26f_prep', 'completed'),
          makeTask('mandatory_disclosures', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'mandatory_disclosures' },
    ])
  })

  // ── Rule 14: prepare_remand_motion → file_remand_motion ──
  it('unlocks file_remand_motion when prepare_remand_motion completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('prepare_remand_motion', 'completed'),
          makeTask('file_remand_motion', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'file_remand_motion' },
    ])
  })

  // ── Removal mutual exclusivity with other branches ──
  it('only unlocks removal branch for case_removed — not default or answer', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('check_docket_for_answer', 'completed', { docket_result: 'case_removed' }),
          makeTask('default_packet_prep', 'locked'),
          makeTask('upload_answer', 'locked'),
          makeTask('understand_removal', 'locked'),
        ],
      })
    )

    const keys = actions.map(a => a.type === 'unlock_task' ? a.task_key : null).filter(Boolean)
    expect(keys).toContain('understand_removal')
    expect(keys).not.toContain('default_packet_prep')
    expect(keys).not.toContain('upload_answer')
  })

  // ── mandatory_disclosures → discovery_starter_pack ──
  it('unlocks discovery_starter_pack when mandatory_disclosures completed', () => {
    const actions = evaluateGatekeeperRules(
      makeInput({
        tasks: [
          makeTask('mandatory_disclosures', 'completed'),
          makeTask('discovery_starter_pack', 'locked'),
        ],
      })
    )

    expect(actions).toEqual([
      { type: 'unlock_task', task_key: 'discovery_starter_pack' },
    ])
  })

  // ── Rule 16: motion to compel ──────────────────────────
  describe('Rule 16 — motion to compel', () => {
    it('unlocks motion_to_compel when discovery_starter_pack completed AND response overdue', () => {
      const input = makeInput({
        tasks: [
          makeTask('discovery_starter_pack', 'completed'),
          makeTask('motion_to_compel', 'locked'),
        ],
        discoveryResponseDue: new Date('2026-02-01'),
        now: new Date('2026-02-15'), // after deadline
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).toContainEqual({ type: 'unlock_task', task_key: 'motion_to_compel' })
    })

    it('does NOT unlock when response deadline not yet passed', () => {
      const input = makeInput({
        tasks: [
          makeTask('discovery_starter_pack', 'completed'),
          makeTask('motion_to_compel', 'locked'),
        ],
        discoveryResponseDue: new Date('2026-03-01'),
        now: new Date('2026-02-15'), // before deadline
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).not.toContainEqual(expect.objectContaining({ task_key: 'motion_to_compel' }))
    })

    it('does NOT unlock when discovery_starter_pack not completed', () => {
      const input = makeInput({
        tasks: [
          makeTask('discovery_starter_pack', 'todo'),
          makeTask('motion_to_compel', 'locked'),
        ],
        discoveryResponseDue: new Date('2026-02-01'),
        now: new Date('2026-02-15'),
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).not.toContainEqual(expect.objectContaining({ task_key: 'motion_to_compel' }))
    })

    it('does NOT unlock when motion_to_compel already unlocked', () => {
      const input = makeInput({
        tasks: [
          makeTask('discovery_starter_pack', 'completed'),
          makeTask('motion_to_compel', 'todo'), // already unlocked
        ],
        discoveryResponseDue: new Date('2026-02-01'),
        now: new Date('2026-02-15'),
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).not.toContainEqual(expect.objectContaining({ task_key: 'motion_to_compel' }))
    })
  })

  // ── Rule 17: trial prep checklist ──────────────────────
  describe('Rule 17 — trial prep checklist', () => {
    it('unlocks trial_prep_checklist when trial date within 60 days', () => {
      const trialDate = new Date('2026-04-01')
      const input = makeInput({
        tasks: [makeTask('trial_prep_checklist', 'locked')],
        trialDate,
        now: new Date('2026-03-01'), // 31 days away
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).toContainEqual({ type: 'unlock_task', task_key: 'trial_prep_checklist' })
    })

    it('does NOT unlock when trial date >60 days away', () => {
      const trialDate = new Date('2026-06-01')
      const input = makeInput({
        tasks: [makeTask('trial_prep_checklist', 'locked')],
        trialDate,
        now: new Date('2026-03-01'), // 92 days away
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).not.toContainEqual(expect.objectContaining({ task_key: 'trial_prep_checklist' }))
    })

    it('does NOT unlock when no trial date set', () => {
      const input = makeInput({
        tasks: [makeTask('trial_prep_checklist', 'locked')],
        now: new Date('2026-03-01'),
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).not.toContainEqual(expect.objectContaining({ task_key: 'trial_prep_checklist' }))
    })
  })

  // ── Rule 18: appellate brief ───────────────────────────
  describe('Rule 18 — appellate brief', () => {
    it('unlocks appellate_brief when notice_of_appeal in completedMotionTypes', () => {
      const input = makeInput({
        tasks: [makeTask('appellate_brief', 'locked')],
        completedMotionTypes: ['notice_of_appeal'],
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).toContainEqual({ type: 'unlock_task', task_key: 'appellate_brief' })
    })

    it('does NOT unlock when notice_of_appeal not completed', () => {
      const input = makeInput({
        tasks: [makeTask('appellate_brief', 'locked')],
        completedMotionTypes: [],
      })
      const actions = evaluateGatekeeperRules(input)
      expect(actions).not.toContainEqual(expect.objectContaining({ task_key: 'appellate_brief' }))
    })
  })
})
