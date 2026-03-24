import { describe, it, expect } from 'vitest'
import {
  buildCaseSummaryPrompt,
  buildStrategyNotesPrompt,
  isSummarySafe,
  CASE_SUMMARY_SYSTEM_PROMPT,
  STRATEGY_NOTES_SYSTEM_PROMPT,
  CASE_SUMMARY_BLOCKED_PHRASES,
} from '@/lib/ai/case-summary'

// ── buildCaseSummaryPrompt ───────────────────────────────────────

describe('buildCaseSummaryPrompt', () => {
  it('builds case summary prompt with dispute type, county, exhibit count', () => {
    const prompt = buildCaseSummaryPrompt({
      dispute_type: 'small_claims',
      state: 'CA',
      role: 'plaintiff',
      county: 'Los Angeles',
      exhibit_count: 12,
      timeline_event_count: 5,
    })

    expect(prompt).toContain('small_claims')
    expect(prompt).toContain('Los Angeles')
    expect(prompt).toContain('Exhibits: 12')
    expect(prompt).toContain('CA')
    expect(prompt).toContain('plaintiff')
    expect(prompt).toContain('Timeline events: 5')
  })
})

// ── buildStrategyNotesPrompt ─────────────────────────────────────

describe('buildStrategyNotesPrompt', () => {
  it('builds strategy notes prompt with exhibit titles and health score', () => {
    const prompt = buildStrategyNotesPrompt({
      dispute_type: 'debt',
      state: 'TX',
      role: 'defendant',
      exhibit_titles: ['Contract A', 'Bank Statement'],
      health_score: 72,
    })

    expect(prompt).toContain('debt')
    expect(prompt).toContain('TX')
    expect(prompt).toContain('defendant')
    expect(prompt).toContain('Contract A')
    expect(prompt).toContain('Bank Statement')
    expect(prompt).toContain('Health score: 72/100')
  })
})

// ── isSummarySafe ────────────────────────────────────────────────

describe('isSummarySafe', () => {
  it('marks safe text as safe', () => {
    expect(
      isSummarySafe('This case involves a contract dispute between two parties.')
    ).toBe(true)
  })

  it('blocks unsafe text containing "You must file"', () => {
    expect(isSummarySafe('You must file your response by Friday.')).toBe(false)
  })
})

// ── system prompts ───────────────────────────────────────────────

describe('system prompts', () => {
  it('exports both system prompts', () => {
    expect(CASE_SUMMARY_SYSTEM_PROMPT).toBeDefined()
    expect(typeof CASE_SUMMARY_SYSTEM_PROMPT).toBe('string')
    expect(CASE_SUMMARY_SYSTEM_PROMPT.length).toBeGreaterThan(0)

    expect(STRATEGY_NOTES_SYSTEM_PROMPT).toBeDefined()
    expect(typeof STRATEGY_NOTES_SYSTEM_PROMPT).toBe('string')
    expect(STRATEGY_NOTES_SYSTEM_PROMPT.length).toBeGreaterThan(0)
  })
})
