import { describe, it, expect } from 'vitest'
import {
  isExplanationSafe,
  buildStaticExplanation,
  buildExplanationPrompt,
  EXPLANATION_BLOCKED_PHRASES,
} from '@/lib/risk/explain'
import type { RiskLevel } from '@/lib/rules/case-risk-engine'

// ── isExplanationSafe ────────────────────────────────────────────

describe('isExplanationSafe', () => {
  it('returns true for a clean explanation', () => {
    expect(
      isExplanationSafe('Your case has a moderate risk level. Focus on gathering evidence.')
    ).toBe(true)
  })

  it('returns true for empty string', () => {
    expect(isExplanationSafe('')).toBe(true)
  })

  it.each([
    ['you must', 'You must file your answer immediately'],
    ['you should', 'You should contact a lawyer right away'],
    ['file a motion', 'You need to file a motion for summary judgment'],
    ['file immediately', 'File immediately to avoid penalties'],
    ['sanctions', 'The court may impose sanctions'],
    ['legal penalty', 'There could be a legal penalty'],
    ['automatic judgment', 'This could result in automatic judgment'],
    ['guaranteed outcome', 'There is no guaranteed outcome'],
    ['winning', 'Your chances of winning are good'],
    ['losing', 'You risk losing the case'],
    ['you are required', 'You are required to respond'],
    ['failure to comply', 'Failure to comply will result in penalties'],
    ['urgent', 'URGENT: Take action now'],
    ['immediately', 'Act immediately before it is too late'],
  ] as const)('returns false when message contains "%s"', (_phrase, message) => {
    expect(isExplanationSafe(message)).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isExplanationSafe('YOU MUST respond')).toBe(false)
    expect(isExplanationSafe('Winning is possible')).toBe(false)
  })

  it('EXPLANATION_BLOCKED_PHRASES is frozen', () => {
    expect(Object.isFrozen(EXPLANATION_BLOCKED_PHRASES)).toBe(true)
  })
})

// ── buildStaticExplanation ───────────────────────────────────────

describe('buildStaticExplanation', () => {
  it('returns valid structure for "low" risk level', () => {
    const result = buildStaticExplanation({
      overall_score: 90,
      risk_level: 'low' as RiskLevel,
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 10,
      activity_risk: 0,
      breakdown: [
        { rule: 'deadline_within_7_days', points: 10, detail: 'Deadline in 5 days' },
      ],
    })

    expect(result.summary).toBeTruthy()
    expect(result.focus_areas).toBeInstanceOf(Array)
    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
    expect(result.tone).toBe('calm')
  })

  it('returns valid structure for "high" risk level', () => {
    const result = buildStaticExplanation({
      overall_score: 10,
      risk_level: 'high' as RiskLevel,
      deadline_risk: 40,
      response_risk: 50,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [
        { rule: 'deadline_overdue', points: 40, detail: 'Deadline overdue by 5 days' },
        { rule: 'discovery_response_overdue', points: 50, detail: 'Response overdue' },
      ],
    })

    expect(result.summary).toBeTruthy()
    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
    expect(result.tone).toBe('calm')
  })

  it('extracts focus areas from highest-point breakdown items', () => {
    const result = buildStaticExplanation({
      overall_score: 20,
      risk_level: 'high' as RiskLevel,
      deadline_risk: 40,
      response_risk: 50,
      evidence_risk: 15,
      activity_risk: 0,
      breakdown: [
        { rule: 'discovery_response_overdue', points: 50, detail: 'Response overdue' },
        { rule: 'deadline_overdue', points: 40, detail: 'Deadline overdue' },
        { rule: 'low_evidence_count', points: 15, detail: 'Low evidence' },
      ],
    })

    expect(result.focus_areas.length).toBeLessThanOrEqual(3)
    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
  })

  it('is always safe (passes isExplanationSafe)', () => {
    const levels: RiskLevel[] = ['low', 'moderate', 'elevated', 'high']
    for (const risk_level of levels) {
      const result = buildStaticExplanation({
        overall_score: 50,
        risk_level,
        deadline_risk: 20,
        response_risk: 0,
        evidence_risk: 15,
        activity_risk: 20,
        breakdown: [
          { rule: 'deadline_within_3_days', points: 20, detail: 'Deadline soon' },
          { rule: 'low_evidence_count', points: 15, detail: 'Low evidence' },
          { rule: 'inactive_14_days', points: 20, detail: 'No activity' },
        ],
      })

      expect(isExplanationSafe(result.summary)).toBe(true)
      for (const area of result.focus_areas) {
        expect(isExplanationSafe(area)).toBe(true)
      }
    }
  })

  it('returns focus areas even with empty breakdown', () => {
    const result = buildStaticExplanation({
      overall_score: 100,
      risk_level: 'low' as RiskLevel,
      deadline_risk: 0,
      response_risk: 0,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [],
    })

    expect(result.focus_areas.length).toBeGreaterThanOrEqual(1)
    expect(result.tone).toBe('calm')
  })
})

// ── buildExplanationPrompt ───────────────────────────────────────

describe('buildExplanationPrompt', () => {
  it('includes overall score and risk level', () => {
    const prompt = buildExplanationPrompt({
      overall_score: 60,
      risk_level: 'moderate' as RiskLevel,
      deadline_risk: 20,
      response_risk: 0,
      evidence_risk: 15,
      activity_risk: 0,
      breakdown: [
        { rule: 'deadline_within_3_days', points: 20, detail: 'Deadline soon' },
        { rule: 'low_evidence_count', points: 15, detail: 'Low evidence' },
      ],
    })

    expect(prompt).toContain('60')
    expect(prompt).toContain('moderate')
  })

  it('includes sub-score labels', () => {
    const prompt = buildExplanationPrompt({
      overall_score: 50,
      risk_level: 'elevated' as RiskLevel,
      deadline_risk: 20,
      response_risk: 30,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [],
    })

    expect(prompt).toContain('Deadline risk')
    expect(prompt).toContain('Response risk')
    expect(prompt).toContain('Evidence risk')
    expect(prompt).toContain('Activity risk')
  })

  it('includes breakdown count', () => {
    const prompt = buildExplanationPrompt({
      overall_score: 50,
      risk_level: 'elevated' as RiskLevel,
      deadline_risk: 20,
      response_risk: 30,
      evidence_risk: 0,
      activity_risk: 0,
      breakdown: [
        { rule: 'a', points: 20, detail: 'x' },
        { rule: 'b', points: 30, detail: 'y' },
      ],
    })

    expect(prompt).toContain('2 risk factor')
  })
})
