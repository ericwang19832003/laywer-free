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
})
