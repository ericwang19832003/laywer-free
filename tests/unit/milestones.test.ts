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
    const civilMilestones = getMilestones('contract')
    // Cast to bypass type check for the fallback test
    const unknownMilestones = getMilestones('unknown_type' as DisputeType)
    expect(unknownMilestones).toEqual(civilMilestones)
  })
})

// -- Civil milestones (contract, property, other) share the same definitions --

describe('getMilestones -- civil types share definitions', () => {
  it('contract, property, and other all return the same milestones', () => {
    const contractMs = getMilestones('contract')
    const propertyMs = getMilestones('property')
    const otherMs = getMilestones('other')
    expect(contractMs).toEqual(propertyMs)
    expect(contractMs).toEqual(otherMs)
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
        for (const task of prevSkips) {
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

  // -- Civil specific tasks
  it('returns correct tasks for civil "filed" milestone', () => {
    const tasks = getTasksToSkip('contract', 'filed')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('intake')
    expect(tasks).toContain('prepare_filing')
    expect(tasks).toContain('file_with_court')
    expect(tasks).toHaveLength(4)
  })

  it('returns correct tasks for civil "served" milestone', () => {
    const tasks = getTasksToSkip('contract', 'served')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('intake')
    expect(tasks).toContain('evidence_vault')
    expect(tasks).toContain('preservation_letter')
    expect(tasks).toContain('upload_return_of_service')
    expect(tasks).toContain('confirm_service_facts')
    expect(tasks).toHaveLength(8)
  })

  it('returns correct tasks for civil "trial_prep" milestone', () => {
    const tasks = getTasksToSkip('contract', 'trial_prep')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('default_packet_prep')
    expect(tasks).toContain('mandatory_disclosures')
    expect(tasks.length).toBeGreaterThan(10)
  })

  // -- Personal Injury specific tasks
  it('returns correct tasks for PI "medical" milestone', () => {
    const tasks = getTasksToSkip('personal_injury', 'medical')
    expect(tasks).toEqual(['welcome', 'pi_intake'])
  })

  it('returns correct tasks for PI "litigation" milestone', () => {
    const tasks = getTasksToSkip('personal_injury', 'litigation')
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
    expect(tasks).toContain('evidence_vault')
    expect(tasks).toContain('prepare_demand_letter')
    expect(tasks).toHaveLength(4)
  })

  it('returns correct tasks for small claims "hearing" milestone', () => {
    const tasks = getTasksToSkip('small_claims', 'hearing')
    expect(tasks).toContain('prepare_for_hearing')
    expect(tasks).toContain('serve_defendant')
    expect(tasks).toContain('file_with_court')
  })

  // -- Family specific tasks
  it('returns correct tasks for family "filed" milestone', () => {
    const tasks = getTasksToSkip('family', 'filed')
    expect(tasks).toContain('welcome')
    expect(tasks).toContain('family_intake')
    expect(tasks).toContain('safety_screening')
    expect(tasks).toContain('evidence_vault')
    expect(tasks).toContain('prepare_family_filing')
    expect(tasks).toHaveLength(5)
  })

  it('returns correct tasks for family "final" milestone', () => {
    const tasks = getTasksToSkip('family', 'final')
    expect(tasks).toContain('mediation')
    expect(tasks).toContain('temporary_orders')
    expect(tasks).toContain('waiting_period')
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
    expect(tasks).toContain('hearing_day')
    expect(tasks).toContain('prepare_for_hearing')
    expect(tasks).toContain('serve_other_party')
  })
})

// -- getMilestoneByID ---------------------------------------------------------

describe('getMilestoneByID', () => {
  it('returns the correct milestone for a valid ID', () => {
    const milestone = getMilestoneByID('contract', 'filed')
    expect(milestone).toBeDefined()
    expect(milestone!.id).toBe('filed')
    expect(milestone!.firstUnlockedTask).toBe('evidence_vault')
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

  it('returns family served milestone with correct firstUnlockedTask', () => {
    const m = getMilestoneByID('family', 'served')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('waiting_period')
  })

  it('returns landlord-tenant hearing milestone with correct firstUnlockedTask', () => {
    const m = getMilestoneByID('landlord_tenant', 'hearing')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('hearing_day')
  })

  it('falls back to civil milestones for unknown dispute type', () => {
    const m = getMilestoneByID('unknown_type' as DisputeType, 'filed')
    expect(m).toBeDefined()
    expect(m!.firstUnlockedTask).toBe('evidence_vault')
  })
})

// -- Milestone count per dispute type -----------------------------------------

describe('milestone counts', () => {
  it('civil types have 7 milestones', () => {
    for (const type of CIVIL_TYPES) {
      expect(getMilestones(type)).toHaveLength(7)
    }
  })

  it('personal injury has 7 milestones', () => {
    expect(getMilestones('personal_injury')).toHaveLength(7)
  })

  it('debt defense has 4 milestones', () => {
    expect(getMilestones('debt_collection')).toHaveLength(4)
  })

  it('small claims has 5 milestones', () => {
    expect(getMilestones('small_claims')).toHaveLength(5)
  })

  it('family has 6 milestones', () => {
    expect(getMilestones('family')).toHaveLength(6)
  })

  it('landlord-tenant has 6 milestones', () => {
    expect(getMilestones('landlord_tenant')).toHaveLength(6)
  })
})
