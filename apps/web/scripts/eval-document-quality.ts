#!/usr/bin/env npx tsx
/**
 * Document Quality Evaluation Framework
 *
 * Generates legal documents for test scenarios and scores them on 4 dimensions:
 *   1. Legal accuracy   — correct legal terms, proper jurisdiction references
 *   2. Formatting        — proper document structure, headings, signature blocks
 *   3. Completeness      — all required sections present
 *   4. Filing readiness  — clear language, proper court references, could a person file this
 *
 * Usage:
 *   cd apps/web && npx tsx scripts/eval-document-quality.ts
 *
 * Requires OPENAI_API_KEY in environment. Scenarios without a key are skipped gracefully.
 */

import { ALL_SCENARIOS, type EvalScenario } from './eval-scenarios'
import {
  getSystemPrompt,
  buildUserPrompt,
  isDocumentSafe,
  sanitizeDocument,
} from '../src/lib/ai/document-generation'

// ---------------------------------------------------------------------------
// Scoring types (exported for unit tests)
// ---------------------------------------------------------------------------

export interface DimensionScore {
  score: number          // 1-5
  maxScore: 5
  checks: CheckResult[]
}

export interface CheckResult {
  name: string
  passed: boolean
  weight: number         // how much this check contributes (0-1)
  detail?: string
}

export interface ScenarioResult {
  scenarioId: string
  scenarioName: string
  disputeType: string
  status: 'pass' | 'fail' | 'skipped' | 'error'
  scores: {
    legalAccuracy: DimensionScore
    formatting: DimensionScore
    completeness: DimensionScore
    filingReadiness: DimensionScore
  } | null
  averageScore: number | null
  documentLength: number | null
  error?: string
}

export interface EvalSummary {
  timestamp: string
  totalScenarios: number
  completed: number
  skipped: number
  errored: number
  passed: number
  failed: number
  passingThreshold: number
  overallAverage: number | null
  results: ScenarioResult[]
}

// ---------------------------------------------------------------------------
// Scoring functions (exported for unit tests)
// ---------------------------------------------------------------------------

/**
 * Run a set of checks and convert to a 1-5 score.
 * Each check has a weight (0-1). The weighted pass rate maps linearly to 1-5.
 */
export function checksToScore(checks: CheckResult[]): DimensionScore {
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight === 0) return { score: 1, maxScore: 5, checks }

  const passedWeight = checks
    .filter((c) => c.passed)
    .reduce((sum, c) => sum + c.weight, 0)

  const ratio = passedWeight / totalWeight        // 0-1
  const score = Math.round(1 + ratio * 4) as 1 | 2 | 3 | 4 | 5  // 1-5

  return { score: Math.min(5, Math.max(1, score)), maxScore: 5, checks }
}

/**
 * Average across dimension scores. Returns null if no scores.
 */
export function averageDimensions(
  scores: Record<string, DimensionScore>
): number | null {
  const vals = Object.values(scores)
  if (vals.length === 0) return null
  const sum = vals.reduce((s, d) => s + d.score, 0)
  return parseFloat((sum / vals.length).toFixed(2))
}

// ---------------------------------------------------------------------------
// Dimension scorers — regex-based, deterministic
// ---------------------------------------------------------------------------

function scoreLegalAccuracy(doc: string, scenario: EvalScenario): DimensionScore {
  const lower = doc.toLowerCase()
  const checks: CheckResult[] = []

  // 1. Mentions a legal code, statute, or regulation
  checks.push({
    name: 'References legal authority',
    passed: /\b(code|statute|section|§|act|u\.?s\.?c\.?|rev\.?\s*code|ilcs|rcw|o\.c\.g\.a\.)\b/i.test(doc),
    weight: 1,
  })

  // 2. Contains proper party names
  const yourName = scenario.caseDetails.yourName.toLowerCase()
  const opposing = (scenario.caseDetails.opposingParty ?? '').toLowerCase()
  checks.push({
    name: 'Names plaintiff/claimant correctly',
    passed: lower.includes(yourName),
    weight: 1,
  })
  if (opposing) {
    checks.push({
      name: 'Names opposing party correctly',
      passed: lower.includes(opposing),
      weight: 1,
    })
  }

  // 3. Mentions the state or jurisdiction
  const state = (scenario.caseDetails.state ?? '').toLowerCase()
  if (state) {
    checks.push({
      name: 'References jurisdiction/state',
      passed: lower.includes(state),
      weight: 0.8,
    })
  }

  // 4. Uses legal terminology appropriate to context
  const legalTerms = [
    'breach', 'damages', 'liability', 'relief', 'dispute', 'claim',
    'defendant', 'plaintiff', 'remedy', 'violation', 'obligation',
    'statute', 'contract', 'negligent', 'negligence', 'demand',
    'herein', 'hereby', 'pursuant', 'foregoing', 'whereas',
  ]
  const legalTermCount = legalTerms.filter((t) => lower.includes(t)).length
  checks.push({
    name: 'Uses legal terminology (3+ terms)',
    passed: legalTermCount >= 3,
    weight: 0.8,
  })

  // 5. Does not contain blocked phrases (safety)
  checks.push({
    name: 'Free of blocked advisory phrases',
    passed: isDocumentSafe(doc),
    weight: 0.5,
  })

  // 6. Mentions dollar amount from damages
  if (scenario.documentDetails.damages) {
    const amountMatch = scenario.documentDetails.damages.match(/\$[\d,]+/)
    if (amountMatch) {
      checks.push({
        name: 'References claimed amount',
        passed: doc.includes(amountMatch[0]),
        weight: 0.7,
      })
    }
  }

  return checksToScore(checks)
}

function scoreFormatting(doc: string, _scenario: EvalScenario): DimensionScore {
  const checks: CheckResult[] = []

  // 1. Has a date
  checks.push({
    name: 'Contains a date',
    passed: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i.test(doc) ||
            /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/.test(doc) ||
            /\b\d{4}-\d{2}-\d{2}\b/.test(doc),
    weight: 0.8,
  })

  // 2. Has salutation
  checks.push({
    name: 'Has salutation',
    passed: /\b(dear|to whom it may concern|attention|re:|regarding)\b/i.test(doc),
    weight: 0.7,
  })

  // 3. Has closing / sign-off
  checks.push({
    name: 'Has closing/sign-off',
    passed: /\b(sincerely|respectfully|regards|truly|cordially)\b/i.test(doc),
    weight: 0.8,
  })

  // 4. Has paragraph structure (at least 3 paragraphs)
  const paragraphs = doc.split(/\n\s*\n/).filter((p) => p.trim().length > 30)
  checks.push({
    name: 'Has 3+ substantive paragraphs',
    passed: paragraphs.length >= 3,
    weight: 1,
  })

  // 5. Has some kind of heading or subject line
  checks.push({
    name: 'Has subject line or heading',
    passed: /\b(re:|subject:|regarding:|in the matter of|notice of)\b/i.test(doc) ||
            /^#+\s/m.test(doc) ||
            /^[A-Z][A-Z\s]{5,}$/m.test(doc),
    weight: 0.7,
  })

  // 6. Reasonable length (at least 500 chars for a legal document)
  checks.push({
    name: 'Minimum length (500+ chars)',
    passed: doc.length >= 500,
    weight: 0.5,
  })

  // 7. Has sender/signature block
  checks.push({
    name: 'Has signature block area',
    passed: /\b(signature|signed|name:|printed name)\b/i.test(doc) ||
            /_{3,}/.test(doc) ||
            /\[.*signature.*\]/i.test(doc) ||
            /\b(sincerely|respectfully|regards)\b[\s\S]{0,100}$/i.test(doc),
    weight: 0.6,
  })

  return checksToScore(checks)
}

function scoreCompleteness(doc: string, scenario: EvalScenario): DimensionScore {
  const lower = doc.toLowerCase()
  const checks: CheckResult[] = []

  // 1. States the facts
  checks.push({
    name: 'Contains factual narrative',
    passed: lower.includes('fact') || lower.includes('background') ||
            lower.includes('circumstances') || lower.includes('occurred') ||
            lower.includes('happened') || doc.length > 800,
    weight: 1,
  })

  // 2. States the demand or position
  checks.push({
    name: 'States demand/position/defense',
    passed: lower.includes('demand') || lower.includes('request') ||
            lower.includes('seek') || lower.includes('defense') ||
            lower.includes('relief') || lower.includes('remedy') ||
            lower.includes('return') || lower.includes('refund'),
    weight: 1,
  })

  // 3. References a deadline or next step
  checks.push({
    name: 'Mentions deadline or next steps',
    passed: /\b(days?|deadline|by\s+(january|february|march|april|may|june|july|august|september|october|november|december)|\bwithin\b|\bno later than\b|respond|response|further action)\b/i.test(doc),
    weight: 0.8,
  })

  // 4. Mentions damages or relief amount
  if (scenario.documentDetails.damages) {
    checks.push({
      name: 'Specifies damages/relief amount',
      passed: /\$[\d,]+/.test(doc),
      weight: 0.9,
    })
  }

  // 5. Contains a conclusion or closing request
  checks.push({
    name: 'Has conclusion or closing request',
    passed: lower.includes('conclusion') || lower.includes('therefore') ||
            lower.includes('accordingly') || lower.includes('in summary') ||
            lower.includes('in light of') || lower.includes('for these reasons') ||
            lower.includes('please') || lower.includes('i look forward'),
    weight: 0.7,
  })

  // 6. Mentions evidence or documentation
  checks.push({
    name: 'References evidence or documentation',
    passed: lower.includes('evidence') || lower.includes('document') ||
            lower.includes('receipt') || lower.includes('photo') ||
            lower.includes('record') || lower.includes('exhibit') ||
            lower.includes('attached') || lower.includes('enclosed') ||
            lower.includes('report'),
    weight: 0.6,
  })

  return checksToScore(checks)
}

function scoreFilingReadiness(doc: string, scenario: EvalScenario): DimensionScore {
  const lower = doc.toLowerCase()
  const checks: CheckResult[] = []

  // 1. Uses plain language (low jargon density — not too many obscure legal words)
  const wordCount = doc.split(/\s+/).length
  checks.push({
    name: 'Sufficient length for filing (200+ words)',
    passed: wordCount >= 200,
    weight: 0.8,
  })

  // 2. No placeholder text left unfilled
  checks.push({
    name: 'No unfilled placeholder brackets',
    passed: !/\[(insert|fill in|your|enter|date|name|address|amount)\b/i.test(doc),
    weight: 1,
  })

  // 3. Court name or jurisdiction mentioned if provided
  const court = (scenario.caseDetails.court ?? '').toLowerCase()
  if (court) {
    // Check for partial match (e.g. "small claims" from "Los Angeles County Small Claims Court")
    const courtWords = court.split(/\s+/).filter((w) => w.length > 3)
    const matchedWords = courtWords.filter((w) => lower.includes(w))
    checks.push({
      name: 'References the court',
      passed: matchedWords.length >= 2,
      weight: 0.8,
    })
  }

  // 4. Has case number if provided
  if (scenario.caseDetails.caseNumber) {
    checks.push({
      name: 'Includes case number',
      passed: doc.includes(scenario.caseDetails.caseNumber),
      weight: 0.7,
    })
  }

  // 5. Professional tone (no casual language)
  const casualPatterns = /\b(lol|gonna|wanna|hey|dude|btw|imo|tbh|ngl|bruh)\b/i
  checks.push({
    name: 'Professional tone (no casual language)',
    passed: !casualPatterns.test(doc),
    weight: 0.6,
  })

  // 6. Includes contact information or address references
  checks.push({
    name: 'References address or contact info',
    passed: /\b(street|avenue|blvd|road|apt|suite|address|phone|email)\b/i.test(doc) ||
            /\b\d{3,5}\s+[A-Z]/m.test(doc),
    weight: 0.5,
  })

  // 7. First-person voice appropriate for self-represented litigant
  checks.push({
    name: 'Uses appropriate first-person voice',
    passed: /\bI\b/.test(doc) || /\bmy\b/i.test(doc),
    weight: 0.5,
  })

  return checksToScore(checks)
}

/**
 * Score a generated document across all 4 dimensions.
 */
export function scoreDocument(
  doc: string,
  scenario: EvalScenario
): ScenarioResult['scores'] {
  return {
    legalAccuracy: scoreLegalAccuracy(doc, scenario),
    formatting: scoreFormatting(doc, scenario),
    completeness: scoreCompleteness(doc, scenario),
    filingReadiness: scoreFilingReadiness(doc, scenario),
  }
}

// ---------------------------------------------------------------------------
// AI generation (calls OpenAI directly, no HTTP server needed)
// ---------------------------------------------------------------------------

async function generateDocument(scenario: EvalScenario): Promise<string> {
  // Dynamic import so the script fails gracefully if openai isn't available
  const { default: OpenAI } = await import('openai')

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not set')
  }

  const openai = new OpenAI({ apiKey })

  const systemPrompt = getSystemPrompt(scenario.documentType)
  const userPrompt = buildUserPrompt({
    documentType: scenario.documentType,
    caseDetails: scenario.caseDetails,
    documentDetails: scenario.documentDetails,
  })

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  })

  const content = completion.choices[0]?.message?.content
  if (!content) throw new Error('Empty response from OpenAI')

  // Run through the same safety filter the production code uses
  return isDocumentSafe(content) ? content : sanitizeDocument(content)
}

// ---------------------------------------------------------------------------
// Output formatting
// ---------------------------------------------------------------------------

function formatMarkdownTable(results: ScenarioResult[]): string {
  const lines: string[] = []
  lines.push('| # | Scenario | Dispute | Legal | Format | Complete | Filing | Avg | Status |')
  lines.push('|---|----------|---------|-------|--------|----------|--------|-----|--------|')

  results.forEach((r, i) => {
    if (r.status === 'skipped' || r.status === 'error') {
      lines.push(
        `| ${i + 1} | ${r.scenarioName} | ${r.disputeType} | - | - | - | - | - | ${r.status.toUpperCase()} |`
      )
    } else {
      const s = r.scores!
      lines.push(
        `| ${i + 1} | ${r.scenarioName} | ${r.disputeType} | ${s.legalAccuracy.score}/5 | ${s.formatting.score}/5 | ${s.completeness.score}/5 | ${s.filingReadiness.score}/5 | ${r.averageScore} | ${r.status.toUpperCase()} |`
      )
    }
  })

  return lines.join('\n')
}

function formatCheckDetails(result: ScenarioResult): string {
  if (!result.scores) return ''
  const lines: string[] = [`\n### ${result.scenarioName}\n`]

  for (const [dim, score] of Object.entries(result.scores)) {
    lines.push(`**${dim}** (${(score as DimensionScore).score}/5):`)
    for (const check of (score as DimensionScore).checks) {
      const icon = check.passed ? '[PASS]' : '[FAIL]'
      lines.push(`  ${icon} ${check.name} (weight: ${check.weight})`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const PASSING_THRESHOLD = 3.5

async function main() {
  console.log('=== Document Quality Evaluation ===\n')
  console.log(`Scenarios: ${ALL_SCENARIOS.length}`)
  console.log(`Passing threshold: >= ${PASSING_THRESHOLD} (${PASSING_THRESHOLD / 5 * 100}%)\n`)

  const hasKey = !!process.env.OPENAI_API_KEY
  if (!hasKey) {
    console.log('WARNING: OPENAI_API_KEY not set. All scenarios will be skipped.\n')
    console.log('To run with AI generation, set the OPENAI_API_KEY environment variable.\n')
  }

  const results: ScenarioResult[] = []

  for (const scenario of ALL_SCENARIOS) {
    process.stdout.write(`Running: ${scenario.name}... `)

    if (!hasKey) {
      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        disputeType: scenario.disputeType,
        status: 'skipped',
        scores: null,
        averageScore: null,
        documentLength: null,
        error: 'OPENAI_API_KEY not set',
      })
      console.log('SKIPPED (no API key)')
      continue
    }

    try {
      const document = await generateDocument(scenario)
      const scores = scoreDocument(document, scenario)
      const avg = averageDimensions(scores)
      const status = avg !== null && avg >= PASSING_THRESHOLD ? 'pass' : 'fail'

      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        disputeType: scenario.disputeType,
        status,
        scores,
        averageScore: avg,
        documentLength: document.length,
      })

      console.log(`${status.toUpperCase()} (avg: ${avg})`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        disputeType: scenario.disputeType,
        status: 'error',
        scores: null,
        averageScore: null,
        documentLength: null,
        error: message,
      })
      console.log(`ERROR: ${message}`)
    }
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------

  const completed = results.filter((r) => r.status === 'pass' || r.status === 'fail')
  const passed = results.filter((r) => r.status === 'pass')
  const failed = results.filter((r) => r.status === 'fail')
  const skipped = results.filter((r) => r.status === 'skipped')
  const errored = results.filter((r) => r.status === 'error')

  const overallAverage = completed.length > 0
    ? parseFloat(
        (completed.reduce((sum, r) => sum + (r.averageScore ?? 0), 0) / completed.length).toFixed(2)
      )
    : null

  const summary: EvalSummary = {
    timestamp: new Date().toISOString(),
    totalScenarios: ALL_SCENARIOS.length,
    completed: completed.length,
    skipped: skipped.length,
    errored: errored.length,
    passed: passed.length,
    failed: failed.length,
    passingThreshold: PASSING_THRESHOLD,
    overallAverage,
    results,
  }

  // Markdown output
  console.log('\n---\n')
  console.log('## Results\n')
  console.log(formatMarkdownTable(results))

  // Per-scenario check details
  for (const result of completed) {
    console.log(formatCheckDetails(result))
  }

  // Overall verdict
  console.log('\n---\n')
  console.log('## Summary\n')
  console.log(`Total:    ${summary.totalScenarios}`)
  console.log(`Passed:   ${summary.passed}`)
  console.log(`Failed:   ${summary.failed}`)
  console.log(`Skipped:  ${summary.skipped}`)
  console.log(`Errors:   ${summary.errored}`)
  console.log(`Average:  ${summary.overallAverage ?? 'N/A'}`)
  console.log(`Threshold: ${PASSING_THRESHOLD}`)

  if (overallAverage !== null) {
    const verdict = overallAverage >= PASSING_THRESHOLD ? 'PASS' : 'FAIL'
    console.log(`\nOverall: ${verdict}`)
  }

  // JSON summary to stdout
  console.log('\n---\n')
  console.log('## JSON Summary\n')
  console.log(JSON.stringify(summary, null, 2))

  // Exit code: 0 if all completed scenarios pass, 1 otherwise
  if (failed.length > 0 || errored.length > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(2)
})
