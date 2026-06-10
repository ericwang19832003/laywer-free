import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  buildBriefSectionPrompt,
  type SectionType,
} from '@/lib/ai/litigation-legal/brief-section'
import { applyProSeGuardrails } from '@/lib/ai/litigation-legal/pro-se-adapter'

// ── Shared fixtures ────────────────────────────────────────────────────────

const BASE_INPUT = {
  motionTitle: 'Motion to Dismiss — Lack of Personal Jurisdiction',
  keyArgument: 'The defendant was never served within the state and has no minimum contacts.',
  caseContext: [
    'Case: Smith vs. Acme Corp',
    'Type: civil',
    'State: TX',
    'Role: plaintiff',
    'Court: district',
  ].join('\n'),
  evidenceSummary: 'affidavit.pdf (sworn statement), process-server-log.pdf (service records)',
  authorities: [
    { citation: 'Int\'l Shoe Co. v. Washington, 326 U.S. 310 (1945)', summary: 'Minimum contacts standard for personal jurisdiction.' },
  ],
}

const SECTION_LABELS: Record<SectionType, string> = {
  introduction: 'Introduction',
  statement_of_facts: 'Statement of Facts',
  argument: 'Argument',
  conclusion: 'Conclusion / Prayer for Relief',
}

// ── Section-label map ──────────────────────────────────────────────────────

describe('SECTION_LABELS map', () => {
  it('covers all four section types', () => {
    const types: SectionType[] = ['introduction', 'statement_of_facts', 'argument', 'conclusion']
    for (const t of types) {
      expect(SECTION_LABELS[t]).toBeTruthy()
    }
  })

  it('introduction label is "Introduction"', () => {
    expect(SECTION_LABELS.introduction).toBe('Introduction')
  })

  it('statement_of_facts label is "Statement of Facts"', () => {
    expect(SECTION_LABELS.statement_of_facts).toBe('Statement of Facts')
  })

  it('argument label is "Argument"', () => {
    expect(SECTION_LABELS.argument).toBe('Argument')
  })

  it('conclusion label contains "Conclusion"', () => {
    expect(SECTION_LABELS.conclusion).toContain('Conclusion')
  })
})

// ── buildBriefSectionPrompt — introduction ─────────────────────────────────

describe('buildBriefSectionPrompt — introduction', () => {
  const result = buildBriefSectionPrompt({ ...BASE_INPUT, sectionType: 'introduction' })

  it('returns systemPrompt and userPrompt strings', () => {
    expect(typeof result.systemPrompt).toBe('string')
    expect(typeof result.userPrompt).toBe('string')
  })

  it('userPrompt contains the motionTitle', () => {
    expect(result.userPrompt).toContain('Motion to Dismiss')
  })

  it('userPrompt labels the section as Introduction', () => {
    expect(result.userPrompt).toContain('Introduction')
  })

  it('systemPrompt contains the caseContext', () => {
    expect(result.systemPrompt).toContain('Smith vs. Acme Corp')
  })

  it('systemPrompt does NOT contain blocked phrase "as your attorney"', () => {
    expect(result.systemPrompt.toLowerCase()).not.toContain('as your attorney')
  })

  it('systemPrompt does NOT contain blocked phrase "i recommend"', () => {
    expect(result.systemPrompt.toLowerCase()).not.toContain('i recommend')
  })

  it('systemPrompt does NOT contain blocked phrase "legal advice"', () => {
    expect(result.systemPrompt.toLowerCase()).not.toContain('legal advice')
  })
})

// ── buildBriefSectionPrompt — argument ────────────────────────────────────

describe('buildBriefSectionPrompt — argument', () => {
  const result = buildBriefSectionPrompt({ ...BASE_INPUT, sectionType: 'argument' })

  it('userPrompt contains the keyArgument text', () => {
    expect(result.userPrompt).toContain('never served within the state')
  })

  it('userPrompt contains the full keyArgument', () => {
    expect(result.userPrompt).toContain(BASE_INPUT.keyArgument)
  })

  it('userPrompt labels the section as Argument', () => {
    expect(result.userPrompt).toContain('Argument')
  })

  it('userPrompt contains the authority citation', () => {
    expect(result.userPrompt).toContain('Int\'l Shoe Co.')
  })

  it('systemPrompt does not fabricate citation instructions', () => {
    // The system prompt should warn against fabricating citations, not encourage it
    expect(result.systemPrompt).toContain('Never fabricate')
  })
})

// ── buildBriefSectionPrompt — statement_of_facts ───────────────────────────

describe('buildBriefSectionPrompt — statement_of_facts', () => {
  const result = buildBriefSectionPrompt({ ...BASE_INPUT, sectionType: 'statement_of_facts' })

  it('returns non-empty systemPrompt', () => {
    expect(result.systemPrompt.length).toBeGreaterThan(20)
  })

  it('returns non-empty userPrompt', () => {
    expect(result.userPrompt.length).toBeGreaterThan(20)
  })

  it('userPrompt labels the section as Statement of Facts', () => {
    expect(result.userPrompt).toContain('Statement of Facts')
  })

  it('userPrompt contains evidence summary', () => {
    expect(result.userPrompt).toContain('affidavit.pdf')
  })
})

// ── buildBriefSectionPrompt — conclusion ──────────────────────────────────

describe('buildBriefSectionPrompt — conclusion', () => {
  const result = buildBriefSectionPrompt({ ...BASE_INPUT, sectionType: 'conclusion' })

  it('returns non-empty systemPrompt', () => {
    expect(result.systemPrompt.length).toBeGreaterThan(20)
  })

  it('returns non-empty userPrompt', () => {
    expect(result.userPrompt.length).toBeGreaterThan(20)
  })

  it('userPrompt labels the section with Conclusion', () => {
    expect(result.userPrompt).toContain('Conclusion')
  })

  it('userPrompt contains the keyArgument', () => {
    expect(result.userPrompt).toContain(BASE_INPUT.keyArgument)
  })
})

// ── buildBriefSectionPrompt — no authorities fallback ─────────────────────

describe('buildBriefSectionPrompt — no authorities', () => {
  const result = buildBriefSectionPrompt({
    ...BASE_INPUT,
    sectionType: 'argument',
    authorities: [],
  })

  it('userPrompt notes that no authorities are provided', () => {
    expect(result.userPrompt).toContain('no case authorities provided')
  })
})

// ── Section assembly order ─────────────────────────────────────────────────

describe('Section assembly order', () => {
  const SECTIONS: SectionType[] = ['introduction', 'statement_of_facts', 'argument', 'conclusion']

  it('assembles four sections in correct order', () => {
    const sectionTexts = SECTIONS.map(
      (sectionType) => `## ${SECTION_LABELS[sectionType]}\n\nContent for ${sectionType}.`
    )
    const assembled = sectionTexts.join('\n\n')

    const introPos = assembled.indexOf('## Introduction')
    const factsPos = assembled.indexOf('## Statement of Facts')
    const argPos = assembled.indexOf('## Argument')
    const concPos = assembled.indexOf('## Conclusion')

    expect(introPos).toBeGreaterThanOrEqual(0)
    expect(factsPos).toBeGreaterThan(introPos)
    expect(argPos).toBeGreaterThan(factsPos)
    expect(concPos).toBeGreaterThan(argPos)
  })

  it('assembled text starts with the Introduction section', () => {
    const sectionTexts = SECTIONS.map(
      (sectionType) => `## ${SECTION_LABELS[sectionType]}\n\nContent for ${sectionType}.`
    )
    const assembled = sectionTexts.join('\n\n')
    expect(assembled.trimStart()).toMatch(/^## Introduction/)
  })

  it('assembled text ends with the Conclusion section', () => {
    const sectionTexts = SECTIONS.map(
      (sectionType) => `## ${SECTION_LABELS[sectionType]}\n\nContent for ${sectionType}.`
    )
    const assembled = sectionTexts.join('\n\n')
    const lastHeadingMatch = assembled.match(/## [^\n]+/g)
    expect(lastHeadingMatch?.at(-1)).toContain('Conclusion')
  })

  it('produces exactly four section headings', () => {
    const sectionTexts = SECTIONS.map(
      (sectionType) => `## ${SECTION_LABELS[sectionType]}\n\nContent for ${sectionType}.`
    )
    const assembled = sectionTexts.join('\n\n')
    const headings = assembled.match(/^## /gm)
    expect(headings).toHaveLength(4)
  })
})

// ── Input validation — keyArgument Zod schema ─────────────────────────────

const RequestSchema = z.object({
  keyArgument: z.string().min(10).max(3000),
})

describe('Input validation — keyArgument', () => {
  it('accepts a valid keyArgument of exactly 10 chars', () => {
    expect(RequestSchema.safeParse({ keyArgument: '1234567890' }).success).toBe(true)
  })

  it('accepts a keyArgument of 3000 chars', () => {
    expect(RequestSchema.safeParse({ keyArgument: 'a'.repeat(3000) }).success).toBe(true)
  })

  it('rejects a keyArgument of 9 chars (too short)', () => {
    expect(RequestSchema.safeParse({ keyArgument: '123456789' }).success).toBe(false)
  })

  it('rejects a keyArgument of 3001 chars (too long)', () => {
    expect(RequestSchema.safeParse({ keyArgument: 'a'.repeat(3001) }).success).toBe(false)
  })

  it('rejects when keyArgument is missing', () => {
    expect(RequestSchema.safeParse({}).success).toBe(false)
  })

  it('rejects when keyArgument is a number', () => {
    expect(RequestSchema.safeParse({ keyArgument: 12345678901 }).success).toBe(false)
  })

  it('rejects when keyArgument is null', () => {
    expect(RequestSchema.safeParse({ keyArgument: null }).success).toBe(false)
  })

  it('rejects empty string keyArgument', () => {
    expect(RequestSchema.safeParse({ keyArgument: '' }).success).toBe(false)
  })

  it('accepts a realistic legal argument string', () => {
    const result = RequestSchema.safeParse({
      keyArgument: 'The defendant failed to appear at the scheduled hearing on three separate occasions.',
    })
    expect(result.success).toBe(true)
  })
})

// ── applyProSeGuardrails integration ──────────────────────────────────────

describe('applyProSeGuardrails integration', () => {
  it('returns a string', () => {
    const result = applyProSeGuardrails('This is a draft motion.')
    expect(typeof result).toBe('string')
  })

  it('appends the pro se disclaimer to the output', () => {
    const result = applyProSeGuardrails('Motion text.')
    expect(result).toContain('NOTICE')
  })

  it('preserves the original text in the output', () => {
    const original = 'The plaintiff respectfully requests the court dismiss the case.'
    const result = applyProSeGuardrails(original)
    expect(result).toContain(original)
  })

  it('replaces blocked phrase "you must" with safe alternative', () => {
    const result = applyProSeGuardrails('You must file within 30 days.')
    expect(result.toLowerCase()).not.toContain('you must file')
    expect(result).toContain('[consult an attorney]')
  })

  it('replaces blocked phrase "as your attorney" with safe alternative', () => {
    const result = applyProSeGuardrails('As your attorney I advise you to settle.')
    expect(result.toLowerCase()).not.toContain('as your attorney')
    expect(result).toContain('[consult an attorney]')
  })

  it('replaces blocked phrase "legal advice" with safe alternative', () => {
    const result = applyProSeGuardrails('This is legal advice for your situation.')
    expect(result.toLowerCase()).not.toContain('legal advice')
    expect(result).toContain('[consult an attorney]')
  })

  it('handles empty string input without throwing', () => {
    expect(() => applyProSeGuardrails('')).not.toThrow()
  })

  it('handles a fully assembled draft with section headings', () => {
    const assembledDraft = [
      '## Introduction\n\nThis motion seeks dismissal.',
      '## Statement of Facts\n\nThe defendant was never served.',
      '## Argument\n\nUnder Int\'l Shoe, minimum contacts are required.',
      '## Conclusion / Prayer for Relief\n\nFor these reasons, dismiss with prejudice.',
    ].join('\n\n')

    const result = applyProSeGuardrails(assembledDraft)
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(assembledDraft.length)
    expect(result).toContain('## Introduction')
    expect(result).toContain('## Argument')
  })

  it('is case-insensitive when replacing blocked phrases', () => {
    const result = applyProSeGuardrails('YOU MUST respond immediately.')
    expect(result.toLowerCase()).not.toContain('you must respond')
    expect(result).toContain('[consult an attorney]')
  })
})
