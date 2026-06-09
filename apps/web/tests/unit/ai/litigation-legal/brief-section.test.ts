import { describe, it, expect } from 'vitest'
import { buildBriefSectionPrompt, type BriefSectionInput } from '@/lib/ai/litigation-legal/brief-section'

const BASE_INPUT: BriefSectionInput = {
  motionTitle: 'Motion to Compel Discovery',
  sectionType: 'argument',
  keyArgument: 'Defendant has failed to respond to Requests for Production served 45 days ago.',
  caseContext: '## Case Context\nState: TX\nRole: plaintiff',
  evidenceSummary: 'RFP served Jan 1. No response received.',
  authorities: [],
}

describe('buildBriefSectionPrompt', () => {
  it('includes motion title and section type', () => {
    const { systemPrompt, userPrompt } = buildBriefSectionPrompt(BASE_INPUT)
    expect(userPrompt).toContain('Motion to Compel Discovery')
    expect(userPrompt).toContain('argument')
  })

  it('flags when no authorities are provided', () => {
    const { userPrompt } = buildBriefSectionPrompt({ ...BASE_INPUT, authorities: [] })
    expect(userPrompt).toContain('no case authorities')
  })

  it('includes authorities when provided', () => {
    const { userPrompt } = buildBriefSectionPrompt({
      ...BASE_INPUT,
      authorities: [{ citation: 'TRCP Rule 196', summary: 'Governs requests for production' }],
    })
    expect(userPrompt).toContain('TRCP Rule 196')
  })

  it('system prompt never contains legal-advice language', () => {
    const { systemPrompt } = buildBriefSectionPrompt(BASE_INPUT)
    expect(systemPrompt.toLowerCase()).not.toContain('as your attorney')
    expect(systemPrompt.toLowerCase()).not.toContain('i recommend')
  })
})
