import { describe, it, expect } from 'vitest'
import { buildInputsSnapshot, type InputsSnapshot } from '@/lib/rules/compute-case-health'

// ── Helpers ──────────────────────────────────────────────────────

const NOW = new Date('2026-03-15T12:00:00Z')

function makeSnapshotInput(overrides: {
  deadlines?: { key: string; due_at: string }[]
  taskEvents?: { created_at: string }[]
  evidenceCount?: number
  exhibitCount?: number
  discoveryResponseDeadlines?: { due_at: string; hasResponse: boolean }[]
}) {
  return {
    deadlines: overrides.deadlines ?? [],
    taskEvents: overrides.taskEvents ?? [],
    evidenceCount: overrides.evidenceCount ?? 0,
    exhibitCount: overrides.exhibitCount ?? 0,
    discoveryResponseDeadlines: overrides.discoveryResponseDeadlines ?? [],
    now: NOW,
  }
}

// ── Overdue Deadlines ───────────────────────────────────────────

describe('buildInputsSnapshot — overdue deadlines', () => {
  it('counts 1 deadline that is 5 days overdue', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        deadlines: [{ key: 'answer_deadline', due_at: '2026-03-10T00:00:00Z' }],
      })
    )
    expect(snapshot.overdue_deadlines).toBe(1)
  })
})

// ── Due Within 3 Days ───────────────────────────────────────────

describe('buildInputsSnapshot — due within 3 days', () => {
  it('counts deadline due in 2 days as both within-3 and within-7', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        deadlines: [{ key: 'answer_deadline', due_at: '2026-03-17T00:00:00Z' }],
      })
    )
    expect(snapshot.due_within_3_days).toBe(1)
    expect(snapshot.due_within_7_days).toBe(1)
  })
})

// ── Due Within 7 Days Only ──────────────────────────────────────

describe('buildInputsSnapshot — due within 7 days only', () => {
  it('counts deadline due in 5 days as within-7 but not within-3', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        deadlines: [{ key: 'answer_deadline', due_at: '2026-03-20T00:00:00Z' }],
      })
    )
    expect(snapshot.due_within_3_days).toBe(0)
    expect(snapshot.due_within_7_days).toBe(1)
  })
})

// ── Evidence Counts ─────────────────────────────────────────────

describe('buildInputsSnapshot — low evidence', () => {
  it('passes through zero counts', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({ evidenceCount: 0, exhibitCount: 0 })
    )
    expect(snapshot.evidence_count).toBe(0)
    expect(snapshot.exhibit_count).toBe(0)
  })
})

// ── No Activity ─────────────────────────────────────────────────

describe('buildInputsSnapshot — no activity', () => {
  it('returns -1 when no task events exist', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({ taskEvents: [] })
    )
    expect(snapshot.days_since_last_activity).toBe(-1)
  })
})

// ── Inactivity Days ─────────────────────────────────────────────

describe('buildInputsSnapshot — inactivity days', () => {
  it('computes 10 days since last event', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        taskEvents: [{ created_at: '2026-03-05T00:00:00Z' }],
      })
    )
    expect(snapshot.days_since_last_activity).toBe(10)
  })
})

// ── Discovery Due Soon ──────────────────────────────────────────

describe('buildInputsSnapshot — discovery due soon', () => {
  it('counts 1 discovery due in 2 days with no response', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-17T00:00:00Z', hasResponse: false },
        ],
      })
    )
    expect(snapshot.discovery_due_within_3_days).toBe(1)
  })
})

// ── Discovery With Response ─────────────────────────────────────

describe('buildInputsSnapshot — discovery with response', () => {
  it('does not count discovery due in 2 days when response exists', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        discoveryResponseDeadlines: [
          { due_at: '2026-03-17T00:00:00Z', hasResponse: true },
        ],
      })
    )
    expect(snapshot.discovery_due_within_3_days).toBe(0)
  })
})

// ── All Healthy ─────────────────────────────────────────────────

describe('buildInputsSnapshot — all healthy', () => {
  it('reflects a healthy case snapshot', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        deadlines: [{ key: 'answer_deadline', due_at: '2026-04-15T00:00:00Z' }],
        taskEvents: [{ created_at: '2026-03-14T00:00:00Z' }],
        evidenceCount: 5,
        exhibitCount: 3,
        discoveryResponseDeadlines: [],
      })
    )
    expect(snapshot).toEqual<InputsSnapshot>({
      overdue_deadlines: 0,
      due_within_3_days: 0,
      due_within_7_days: 0,
      evidence_count: 5,
      exhibit_count: 3,
      days_since_last_activity: 1,
      discovery_due_within_3_days: 0,
    })
  })
})

// ── Multiple Deadlines ──────────────────────────────────────────

describe('buildInputsSnapshot — multiple deadlines', () => {
  it('correctly counts a mix of overdue and upcoming deadlines', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        deadlines: [
          { key: 'deadline_a', due_at: '2026-03-10T00:00:00Z' }, // overdue (5 days)
          { key: 'deadline_b', due_at: '2026-03-08T00:00:00Z' }, // overdue (7 days)
          { key: 'deadline_c', due_at: '2026-03-16T00:00:00Z' }, // within 3 days (1 day)
          { key: 'deadline_d', due_at: '2026-03-20T00:00:00Z' }, // within 7 days (5 days)
          { key: 'deadline_e', due_at: '2026-04-01T00:00:00Z' }, // far future
        ],
      })
    )
    expect(snapshot.overdue_deadlines).toBe(2)
    expect(snapshot.due_within_3_days).toBe(1)
    expect(snapshot.due_within_7_days).toBe(2) // within-3 also counts as within-7
  })

  it('excludes discovery deadlines from non-discovery counts', () => {
    const snapshot = buildInputsSnapshot(
      makeSnapshotInput({
        deadlines: [
          { key: 'discovery_response_due_abc', due_at: '2026-03-10T00:00:00Z' },
          { key: 'answer_deadline', due_at: '2026-03-10T00:00:00Z' },
        ],
      })
    )
    // Only the non-discovery deadline should be counted as overdue
    expect(snapshot.overdue_deadlines).toBe(1)
  })
})
