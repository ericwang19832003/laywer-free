import { describe, it, expect } from 'vitest'
import { buildSubpoenaTriagePrompt } from '@/lib/ai/litigation-legal/subpoena-triage'

describe('buildSubpoenaTriagePrompt', () => {
  it('includes state and case context', () => {
    const { systemPrompt } = buildSubpoenaTriagePrompt({
      state: 'TX',
      caseContext: '## Case Context\nState: TX',
      subpoenaText: 'You are commanded to produce documents...',
    })
    expect(systemPrompt).toContain('TX')
    expect(systemPrompt).toContain('self-represented')
  })

  it('includes subpoena text in user prompt', () => {
    const { userPrompt } = buildSubpoenaTriagePrompt({
      state: 'CA',
      caseContext: '## Case Context\nState: CA',
      subpoenaText: 'Produce all emails from January 2024.',
    })
    expect(userPrompt).toContain('Produce all emails')
  })
})
