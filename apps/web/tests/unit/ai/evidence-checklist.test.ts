import { describe, it, expect } from 'vitest'
import {
  buildStaticChecklist,
  buildChecklistPrompt,
  isChecklistSafe,
  checklistSchema,
  EVIDENCE_CHECKLIST_SYSTEM_PROMPT,
} from '@/lib/ai/evidence-checklist'

describe('evidence-checklist', () => {
  it('returns debt defense checklist with >= 4 items, each having label and category', () => {
    const result = buildStaticChecklist({ dispute_type: 'debt' })
    expect(result.items.length).toBeGreaterThanOrEqual(4)
    for (const item of result.items) {
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('category')
    }
  })

  it('returns small claims checklist with >= 3 items', () => {
    const result = buildStaticChecklist({ dispute_type: 'small_claims' })
    expect(result.items.length).toBeGreaterThanOrEqual(3)
  })

  it('returns personal injury checklist with medical_records category', () => {
    const result = buildStaticChecklist({ dispute_type: 'personal_injury' })
    const hasMedical = result.items.some((item) => item.category === 'medical_records')
    expect(hasMedical).toBe(true)
  })

  it('returns family law checklist with >= 4 items', () => {
    const result = buildStaticChecklist({ dispute_type: 'family' })
    expect(result.items.length).toBeGreaterThanOrEqual(4)
  })

  it('returns landlord tenant checklist with "lease" in a label', () => {
    const result = buildStaticChecklist({ dispute_type: 'landlord_tenant' })
    const hasLease = result.items.some((item) => item.label.toLowerCase().includes('lease'))
    expect(hasLease).toBe(true)
  })

  it('returns generic checklist for unknown dispute type', () => {
    const result = buildStaticChecklist({ dispute_type: 'unknown_type' })
    expect(result.items.length).toBeGreaterThanOrEqual(1)
  })

  it('builds prompt containing dispute_type, state name, and role', () => {
    const prompt = buildChecklistPrompt({
      dispute_type: 'debt',
      state: 'California',
      role: 'defendant',
    })
    expect(prompt).toContain('debt')
    expect(prompt).toContain('California')
    expect(prompt).toContain('defendant')
  })

  it('marks safe text as safe, blocks "You must file" and "This guarantees"', () => {
    expect(isChecklistSafe('Gather your records and organize them.')).toBe(true)
    expect(isChecklistSafe('You must file this immediately.')).toBe(false)
    expect(isChecklistSafe('This guarantees a win.')).toBe(false)
  })

  it('validates proper checklist response via schema', () => {
    const valid = {
      items: [
        { label: 'Original contract', category: 'contract' },
        { label: 'Payment records', category: 'financial_records' },
      ],
    }
    const result = checklistSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('exports system prompt containing "evidence"', () => {
    expect(EVIDENCE_CHECKLIST_SYSTEM_PROMPT.toLowerCase()).toContain('evidence')
  })
})
