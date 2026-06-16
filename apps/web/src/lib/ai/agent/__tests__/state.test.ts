import { describe, it, expect } from 'vitest'
import { createInitialState } from '../state'

describe('createInitialState', () => {
  it('creates state with required fields', () => {
    const state = createInitialState({
      caseId: 'case-123',
      disputeType: 'landlord_tenant',
      role: 'plaintiff',
      county: 'Travis',
      healthScore: 72,
      tasks: [],
      deadlines: [],
      evidenceCount: 3,
      evidenceItems: [],
    })

    expect(state.caseId).toBe('case-123')
    expect(state.messages).toEqual([])
    expect(state.toolCallCount).toBe(0)
    expect(state.caseContext.disputeType).toBe('landlord_tenant')
    expect(state.caseContext.role).toBe('plaintiff')
    expect(state.caseContext.county).toBe('Travis')
    expect(state.caseContext.healthScore).toBe(72)
    expect(state.caseContext.evidenceCount).toBe(3)
  })
})
