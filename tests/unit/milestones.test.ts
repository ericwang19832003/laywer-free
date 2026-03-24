import { describe, it, expect } from 'vitest'
import type { DisputeType } from '@/lib/rules/court-recommendation'
import {
  getMilestones,
  getTasksToSkip,
  getMilestoneByID,
  type Milestone,
} from '@/lib/rules/milestones'

// -- Helpers ------------------------------------------------------------------

const ALL_DISPUTE_TYPES: DisputeType[] = [
  'contract',
  'property',
  'other',
  'personal_injury',
  'debt_collection',
  'small_claims',
  'family',
  'landlord_tenant',
]

const CIVIL_TYPES: DisputeType[] = ['contract', 'property', 'other']

// -- getMilestones: basic structure -------------------------------------------

describe('getMilestones', () => {
  it.each(ALL_DISPUTE_TYPES)(
    'returns milestones for %s with "start" as the first milestone',
    (type) => {
      const milestones = getMilestones(type)
      expect(milestones.length).toBeGreaterThan(0)
      expect(milestones[0].id).toBe('start')
    }
  )

  it.each(ALL_DISPUTE_TYPES)(
    'every milestone for %s has required fields',
    (type) => {
      const milestones = getMilestones(type)
      for (const m of milestones) {
        expect(m.id).toBeTruthy()
        expect(m.label).toBeTruthy()
        expect(m.description).toBeTruthy()
        expect(m.firstUnlockedTask).toBeTruthy()
        expect(Array.isArray(m.tasksToSkip)).toBe(true)
      }
    }
  )

  it.each(ALL_DISPUTE_TYPES)(
    '"start" milestone for %s has empty tasksToSkip',
    (type) => {
      const milestones = getMilestones(type)
      const start = milestones[0]
      expect(start.id).toBe('start')
      expect(start.tasksToSkip).toEqual([])
    }
  )

  it.each(ALL_DISPUTE_TYPES)(
    'milestone IDs are unique within %s',
    (type) => {
      const milestones = getMilestones(type)
      const ids = milestones.map((m) => m.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  )

  it('falls back to civil milestones for unknown dispute types', () => {
    // CIVIL_MILESTONES is the fallback - we check that unknown types return the same structure
    const unknownMilestones = getMilestones('unknown_type' as DisputeType)
    // Should have the same structure as known types (at least start milestone)
    expect(unknownMilestones.length).toBeGreaterThan(0)
    expect(unknownMilestones[0].id).toBe('start')
  })
})

// -- Civil milestones have the same base structure --

describe('getMilestones -- civil types have milestones', () => {
  it('contract, property, and other all have milestones', () => {
    const contractMs = getMilestones('contract')
    const propertyMs = getMilestones('property')
    const otherMs = getMilestones('other')
    expect(contractMs.length).toBeGreaterThan(0)
    expect(propertyMs.length).toBeGreaterThan(0)
    expect(otherMs.length).toBeGreaterThan(0)
    // All start with 'start' milestone
    expect(contractMs[0].id).toBe('start')
    expect(propertyMs[0].id).toBe('start')
    expect(otherMs[0].id).toBe('start')
  })
})

// -- Cumulative tasksToSkip ---------------------------------------------------

describe('tasksToSkip are cumulative', () => {
  it.each(ALL_DISPUTE_TYPES)(
    'each milestone for %s includes all prior milestone skips',
    (type) => {
      const milestones = getMilestones(type)
      for (let i = 1; i < milestones.length; i++) {
        const prevSkips = milestones[i - 1].tasksToSkip
        const currentSkips = milestones[i].tasksToSkip
        // Every task in the previous milestone's skip list should be in the current one
        // Exception: a milestone's firstUnlockedTask should NOT be in its own tasksToSkip
        for (const task of prevSkips) {
          if (task === milestones[i].firstUnlockedTask) continue
          expect(currentSkips).toContain(task)
        }
        // Current should have at least as many as previous
        expect(currentSkips.length).toBeGreaterThanOrEqual(prevSkips.length)
      }
    }
  )
})

// -- getTasksToSkip -----------------------------------------------------------

describe('getTasksToSkip', () => {
  it('returns empty array for "start" milestone on all dispute types', () => {
    for (const type of ALL_DISPUTE_TYPES) {
      expect(getTasksToSkip(type, 'start')).toEqual([])
    }
  })

  it('returns empty array for unknown milestone ID', () => {
    expect(getTasksToSkip('contract', 'nonexistent')).toEqual([])
  })

  // -- Contract specific tasks
  it('returns correct tasks for contract "filed" milestone', () => {
    const tasks = getTasksToSkip('contract', 'filed')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('contract_intake')
    expect(tasks).toContain('evidence_vault')
    expect(tasks).toContain('contract_demand_letter')
    expect(tasks).toContain('contract_negotiation')
    expect(tasks).toContain('contract_prepare_filing')
    expect(tasks.length).toBe(6)
  })

  it('returns correct tasks for contract "served" milestone', () => {
    const tasks = getTasksToSkip('contract', 'served')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('contract_intake')
    expect(tasks).toContain('evidence_vault')
    expect(tasks).toContain('contract_demand_letter')
    expect(tasks).toContain('contract_negotiation')
    expect(tasks).toContain('contract_prepare_filing')
    expect(tasks).toContain('contract_file_with_court')
    expect(tasks).toContain('contract_serve_defendant')
    expect(tasks.length).toBe(8)
  })

  // -- Personal Injury specific tasks
  it('returns correct tasks for PI "medical" milestone', () => {
    const tasks = getTasksToSkip('personal_injury', 'medical')
    expect(tasks).toEqual(['welcome', 'pi_intake'])
  })

  it('returns correct tasks for PI "waiting_for_answer" milestone', () => {
    const tasks = getTasksToSkip('personal_injury', 'waiting_for_answer')
    expect(tasks).toContain('prepare_pi_petition')
    expect(tasks).toContain('pi_file_with_court')
    expect(tasks).toContain('pi_serve_defendant')
  })

  // -- Debt Defense specific tasks
  it('returns correct tasks for debt "validation" milestone', () => {
    const tasks = getTasksToSkip('debt_collection', 'validation')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('debt_defense_intake')
    expect(tasks).toContain('evidence_vault')
    expect(tasks).toContain('prepare_debt_validation_letter')
    expect(tasks).toHaveLength(4)
  })

  it('returns correct tasks for debt "hearing" milestone', () => {
    const tasks = getTasksToSkip('debt_collection', 'hearing')
    expect(tasks).toContain('serve_plaintiff')
    expect(tasks).toContain('debt_file_with_court')
  })

  // -- Small Claims specific tasks
  it('returns correct tasks for small claims "demand_sent" milestone', () => {
    const tasks = getTasksToSkip('small_claims', 'demand_sent')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('small_claims_intake')
    expect(tasks).toContain('sc_evidence_vault')
    expect(tasks).toContain('sc_demand_letter')
    expect(tasks).toHaveLength(4)
  })

  it('returns correct tasks for small claims "hearing" milestone', () => {
    const tasks = getTasksToSkip('small_claims', 'hearing')
    expect(tasks).toContain('sc_prepare_for_hearing')
    expect(tasks.length).toBe(8)
  })

  // -- Family specific tasks (without familySubType, returns CIVIL_MILESTONES)
  it('returns correct tasks for family "filed" milestone', () => {
    const tasks = getTasksToSkip('family', 'filed')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('intake')
    expect(tasks).toContain('prepare_filing')
    expect(tasks).toContain('file_with_court')
    expect(tasks).toHaveLength(4)
  })

  it('returns correct tasks for family "trial_prep" milestone', () => {
    const tasks = getTasksToSkip('family', 'trial_prep')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('intake')
    expect(tasks.length).toBeGreaterThan(5)
  })

  // -- Landlord-Tenant specific tasks
  it('returns correct tasks for landlord-tenant "demand_sent" milestone', () => {
    const tasks = getTasksToSkip('landlord_tenant', 'demand_sent')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('landlord_tenant_intake')
    expect(tasks).toContain('evidence_vault')
    expect(tasks).toContain('prepare_lt_demand_letter')
    expect(tasks).toHaveLength(4)
  })

  it('returns correct tasks for landlord-tenant "post" milestone', () => {
    const tasks = getTasksToSkip('landlord_tenant', 'post')
    expect(tasks).toContain('lt_hearing_day')
    expect(tasks).toContain('lt_prepare_for_hearing')
    expect(tasks).toContain('serve_other_party')
  })
})

// -- getMilestoneByID ---------------------------------------------------------

describe('getMilestoneByID', () => {
  it('returns the correct milestone for a valid ID', () => {
    const milestone = getMilestoneByID('contract', 'filed')
    expect(milestone).toBeDefined()
    expect(milestone!.id).toBe('filed')
    expect(milestone!.firstUnlockedTask).toBe('contract_file_with_court')
  })

  it('returns undefined for unknown milestone ID', () => {
    expect(getMilestoneByID('contract', 'nonexistent')).toBeUndefined()
  })

  it('returns undefined for unknown milestone in all types', () => {
    for (const type of ALL_DISPUTE_TYPES) {
      expect(getMilestoneByID(type, 'does_not_exist')).toBeUndefined()
    }
  })

  it('returns correct firstUnlockedTask for each dispute type start', () => {
    for (const type of ALL_DISPUTE_TYPES) {
      const start = getMilestoneByID(type, 'start')
      expect(start).toBeDefined()
      expect(start!.firstUnlockedTask).toBe('welcome')
    }
  })

  // -- Verify specific milestones per type
  it('returns PI medical milestone with correct firstUnlockedTask', () => {
    const m = getMilestoneByID('personal_injury', 'medical')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('pi_medical_records')
  })

  it('returns debt validation milestone with correct firstUnlockedTask', () => {
    const m = getMilestoneByID('debt_collection', 'validation')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('prepare_debt_defense_answer')
  })

  it('returns small claims demand_sent milestone with correct firstUnlockedTask', () => {
    const m = getMilestoneByID('small_claims', 'demand_sent')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('prepare_small_claims_filing')
  })

  it('returns divorce served milestone with correct firstUnlockedTask', () => {
    // Without familySubType, family defaults to CIVIL_MILESTONES
    const m = getMilestoneByID('family', 'served')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('wait_for_answer')
  })

  it('returns divorce served milestone with divorce_subtype', () => {
    // With 'divorce' as familySubType, returns DIVORCE_MILESTONES
    const m = getMilestoneByID('family', 'served', 'divorce')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('divorce_waiting_period')
  })

  it('returns landlord-tenant hearing milestone with correct firstUnlockedTask', () => {
    const m = getMilestoneByID('landlord_tenant', 'hearing')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('lt_prepare_for_hearing')
  })

  it('falls back to civil milestones for unknown dispute type', () => {
    const m = getMilestoneByID('unknown_type' as DisputeType, 'filed')
    expect(m).toBeDefined()
    // CIVIL_MILESTONES.filed has firstUnlockedTask = 'evidence_vault'
    expect(m!.firstUnlockedTask).toBe('evidence_vault')
    expect(m!.id).toBe('filed')
  })
})

// -- Milestone count per dispute type -----------------------------------------

describe('milestone counts', () => {
  it('contract types have 4 milestones', () => {
    expect(getMilestones('contract')).toHaveLength(4)
  })

  it('property types have 4 milestones', () => {
    expect(getMilestones('property')).toHaveLength(4)
  })

  it('other types have 4 milestones', () => {
    expect(getMilestones('other')).toHaveLength(4)
  })

  it('personal injury has 9 milestones', () => {
    expect(getMilestones('personal_injury')).toHaveLength(9)
  })

  it('debt defense has 4 milestones', () => {
    expect(getMilestones('debt_collection')).toHaveLength(4)
  })

  it('small claims has 5 milestones', () => {
    expect(getMilestones('small_claims')).toHaveLength(5)
  })

  it('family defaults to 7 milestones (divorce)', () => {
    expect(getMilestones('family')).toHaveLength(7)
  })

  it('landlord-tenant has 8 milestones', () => {
    expect(getMilestones('landlord_tenant')).toHaveLength(8)
  })
})
