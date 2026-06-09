import { describe, it, expect } from 'vitest'
import {
  healthTipsSchema,
  buildHealthTipsPrompt,
  buildStaticHealthTips,
  isHealthTipsSafe,
  HEALTH_TIPS_SYSTEM_PROMPT,
} from '@/lib/ai/health-tips'

// ── healthTipsSchema ─────────────────────────────────────────────

describe('healthTipsSchema', () => {
  it('accepts 1 tip', () => {
    const result = healthTipsSchema.safeParse({
      tips: [{ tip: 'Review your deadlines.', area: 'deadline' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts 4 tips', () => {
    const result = healthTipsSchema.safeParse({
      tips: [
        { tip: 'Check deadlines.', area: 'deadline' },
        { tip: 'File responses.', area: 'response' },
        { tip: 'Upload evidence.', area: 'evidence' },
        { tip: 'Stay active.', area: 'activity' },
      ],
    })
    expect(result.success).toBe(true)
  })

  it('rejects 0 tips (below min)', () => {
    const result = healthTipsSchema.safeParse({ tips: [] })
    expect(result.success).toBe(false)
  })

  it('rejects 5 tips (above max)', () => {
    const result = healthTipsSchema.safeParse({
      tips: [
        { tip: 'Tip 1', area: 'deadline' },
        { tip: 'Tip 2', area: 'response' },
        { tip: 'Tip 3', area: 'evidence' },
        { tip: 'Tip 4', area: 'activity' },
        { tip: 'Tip 5', area: 'deadline' },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid area', () => {
    const result = healthTipsSchema.safeParse({
      tips: [{ tip: 'Some tip.', area: 'invalid_area' }],
    })
    expect(result.success).toBe(false)
  })

  it('rejects a tip exceeding 200 characters', () => {
    const longTip = 'A'.repeat(201)
    const result = healthTipsSchema.safeParse({
      tips: [{ tip: longTip, area: 'activity' }],
    })
    expect(result.success).toBe(false)
  })

  it('accepts a tip of exactly 200 characters', () => {
    const exactTip = 'A'.repeat(200)
    const result = healthTipsSchema.safeParse({
      tips: [{ tip: exactTip, area: 'activity' }],
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid area values', () => {
    const areas = ['deadline', 'response', 'evidence', 'activity'] as const
    for (const area of areas) {
      const result = healthTipsSchema.safeParse({
        tips: [{ tip: 'A tip.', area }],
      })
      expect(result.success).toBe(true)
    }
  })
})

// ── buildHealthTipsPrompt ────────────────────────────────────────

describe('buildHealthTipsPrompt', () => {
  const baseInput = {
    overall_score: 72,
    deadline_risk: 80,
    response_risk: 60,
    evidence_risk: 45,
    activity_risk: 55,
    court_type: 'small_claims',
    dispute_type: 'debt' as string | null,
    tasks_completed: 3,
    tasks_total: 10,
    evidence_count: 5,
  }

  it('includes overall score in output', () => {
    const prompt = buildHealthTipsPrompt(baseInput)
    expect(prompt).toContain('72/100')
  })

  it('includes all four risk scores', () => {
    const prompt = buildHealthTipsPrompt(baseInput)
    expect(prompt).toContain('80/100')
    expect(prompt).toContain('60/100')
    expect(prompt).toContain('45/100')
    expect(prompt).toContain('55/100')
  })

  it('includes court type', () => {
    const prompt = buildHealthTipsPrompt(baseInput)
    expect(prompt).toContain('small_claims')
  })

  it('includes dispute type', () => {
    const prompt = buildHealthTipsPrompt(baseInput)
    expect(prompt).toContain('debt')
  })

  it('uses "general" when dispute_type is null', () => {
    const prompt = buildHealthTipsPrompt({ ...baseInput, dispute_type: null })
    expect(prompt).toContain('general')
  })

  it('includes task progress', () => {
    const prompt = buildHealthTipsPrompt(baseInput)
    expect(prompt).toContain('3/10')
  })

  it('includes evidence count', () => {
    const prompt = buildHealthTipsPrompt(baseInput)
    expect(prompt).toContain('5')
  })
})

// ── buildStaticHealthTips ────────────────────────────────────────

describe('buildStaticHealthTips', () => {
  it('returns at least 1 tip for all-zero scores', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
    })
    expect(result.tips.length).toBeGreaterThanOrEqual(1)
  })

  it('returns 4 tips for all-zero scores (all areas < 50)', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
    })
    expect(result.tips.length).toBe(4)
  })

  it('passes schema validation for all-zero scores', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
    })
    const parsed = healthTipsSchema.safeParse(result)
    expect(parsed.success).toBe(true)
  })

  it('returns exactly 1 fallback tip when all scores are >= 50', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 50,
      response_risk: 75,
      evidence_risk: 90,
      activity_risk: 60,
    })
    // No area triggers (all >= 50), so fallback tip is returned
    expect(result.tips.length).toBe(1)
    expect(result.tips[0].area).toBe('activity')
  })

  it('returns a tip for deadline area when deadline_risk < 50', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 49,
      response_risk: 50,
      evidence_risk: 50,
      activity_risk: 50,
    })
    const areas = result.tips.map((t) => t.area)
    expect(areas).toContain('deadline')
  })

  it('returns a tip for response area when response_risk < 50', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 50,
      response_risk: 0,
      evidence_risk: 50,
      activity_risk: 50,
    })
    const areas = result.tips.map((t) => t.area)
    expect(areas).toContain('response')
  })

  it('returns a tip for evidence area when evidence_risk < 50', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 50,
      response_risk: 50,
      evidence_risk: 10,
      activity_risk: 50,
    })
    const areas = result.tips.map((t) => t.area)
    expect(areas).toContain('evidence')
  })

  it('returns a tip for activity area when activity_risk < 50', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 50,
      response_risk: 50,
      evidence_risk: 50,
      activity_risk: 25,
    })
    const areas = result.tips.map((t) => t.area)
    expect(areas).toContain('activity')
  })

  it('passes schema validation regardless of scores', () => {
    const cases = [
      { deadline_risk: 100, response_risk: 100, evidence_risk: 100, activity_risk: 100 },
      { deadline_risk: 0, response_risk: 100, evidence_risk: 0, activity_risk: 100 },
      { deadline_risk: 49, response_risk: 49, evidence_risk: 49, activity_risk: 49 },
    ]
    for (const scores of cases) {
      const result = buildStaticHealthTips(scores)
      const parsed = healthTipsSchema.safeParse(result)
      expect(parsed.success).toBe(true)
    }
  })

  it('never returns more than 4 tips', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
    })
    expect(result.tips.length).toBeLessThanOrEqual(4)
  })
})

// ── isHealthTipsSafe ─────────────────────────────────────────────

describe('isHealthTipsSafe', () => {
  it('returns true for safe, neutral text', () => {
    expect(isHealthTipsSafe('Review your upcoming deadlines to stay on track.')).toBe(true)
  })

  it('blocks "you must" (case-insensitive)', () => {
    expect(isHealthTipsSafe('You must file this document immediately.')).toBe(false)
    expect(isHealthTipsSafe('you must act now')).toBe(false)
  })

  it('blocks "you should" (case-insensitive)', () => {
    expect(isHealthTipsSafe('You should consult an attorney.')).toBe(false)
    expect(isHealthTipsSafe('YOU SHOULD do this')).toBe(false)
  })

  it('blocks "file immediately"', () => {
    expect(isHealthTipsSafe('Please file immediately to avoid issues.')).toBe(false)
  })

  it('blocks "urgent"', () => {
    expect(isHealthTipsSafe('This is urgent — act now.')).toBe(false)
    expect(isHealthTipsSafe('URGENT: respond today')).toBe(false)
  })

  it('blocks "sanctions"', () => {
    expect(isHealthTipsSafe('Failure to respond may result in sanctions.')).toBe(false)
  })

  it('blocks "legal advice"', () => {
    expect(isHealthTipsSafe('This is not legal advice but consider filing.')).toBe(false)
  })

  it('blocks "guaranteed"', () => {
    expect(isHealthTipsSafe('This strategy is guaranteed to work.')).toBe(false)
  })

  it('blocks "winning"', () => {
    expect(isHealthTipsSafe('Focus on winning the case.')).toBe(false)
  })

  it('blocks "losing"', () => {
    expect(isHealthTipsSafe('Avoid losing by acting fast.')).toBe(false)
  })

  it('returns true for text that uses words adjacent to blocked phrases', () => {
    // "winning" is a substring — make sure "winnings" also blocks since "winning" is in it
    expect(isHealthTipsSafe('Track your court winnings record.')).toBe(false)
  })

  it('returns true for empty string', () => {
    expect(isHealthTipsSafe('')).toBe(true)
  })

  it('static health tip texts all pass safety check', () => {
    const result = buildStaticHealthTips({
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
    })
    const allText = result.tips.map((t) => t.tip).join(' ')
    expect(isHealthTipsSafe(allText)).toBe(true)
  })
})

// ── HEALTH_TIPS_SYSTEM_PROMPT ────────────────────────────────────

describe('HEALTH_TIPS_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof HEALTH_TIPS_SYSTEM_PROMPT).toBe('string')
    expect(HEALTH_TIPS_SYSTEM_PROMPT.length).toBeGreaterThan(0)
  })

  it('mentions the four area types', () => {
    expect(HEALTH_TIPS_SYSTEM_PROMPT).toContain('deadline')
    expect(HEALTH_TIPS_SYSTEM_PROMPT).toContain('response')
    expect(HEALTH_TIPS_SYSTEM_PROMPT).toContain('evidence')
    expect(HEALTH_TIPS_SYSTEM_PROMPT).toContain('activity')
  })

  it('instructs to avoid directive language (blocked phrases appear as rule examples, not actual tips)', () => {
    // The prompt explicitly calls out that directive language must not be used.
    // This confirms the guardrail is codified in the system prompt.
    expect(HEALTH_TIPS_SYSTEM_PROMPT).toContain('you must')
    expect(HEALTH_TIPS_SYSTEM_PROMPT).toContain('you should')
  })

  it('instructs JSON-only response', () => {
    expect(HEALTH_TIPS_SYSTEM_PROMPT.toLowerCase()).toContain('json')
  })

  it('mentions the 200 character limit for tips', () => {
    expect(HEALTH_TIPS_SYSTEM_PROMPT).toContain('200')
  })
})
