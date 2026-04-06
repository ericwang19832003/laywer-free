/**
 * Output validation for AI-generated legal documents.
 * Catches dangerous content and flags items needing human review.
 */

import type { ValidationResult } from './input-validation'

/**
 * Dangerous recommendations that should cause rejection.
 */
const DANGEROUS_PHRASES = [
  'represent yourself at trial without',
  'waive your right to',
  "ignore the court's order",
  'ignore the court order',
  'disobey the judge',
  'do not appear in court',
  'skip your court date',
  'destroy evidence',
  'hide evidence',
  'lie to the court',
  'commit perjury',
  'threaten the opposing',
  'intimidate the witness',
] as const

/**
 * Forbidden legal-advice language per UX copy style guide.
 */
const FORBIDDEN_ADVICE_PHRASES = [
  'you must',
  'you are required',
  'failure to comply',
  'the law requires you',
  'you are obligated to',
  'you shall',
] as const

/**
 * Patterns that look like case citations — flagged for human verification.
 */
const CITATION_PATTERN =
  /(?:\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+v\.\s+(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*\d+\s+[A-Z][A-Za-z.]+(?:\s+\d+)?(?:\s*\(\d{4}\))?/g

/**
 * Patterns that look like court rules or statutes — flagged for verification.
 */
const RULE_PATTERN = /\b(?:Rule|Section|Sec\.|Art\.)\s+\d+[.\-]?\d*/g

/**
 * Validate AI-generated output for dangerous content and flag items
 * that need human review.
 */
export function validateAIOutput(output: string): ValidationResult {
  const lower = output.toLowerCase()

  // Check for dangerous recommendations — reject entirely
  for (const phrase of DANGEROUS_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        safe: false,
        reason: `Generated document contains dangerous recommendation: "${phrase}". Document rejected for safety.`,
      }
    }
  }

  // Check for forbidden legal-advice language — reject entirely
  for (const phrase of FORBIDDEN_ADVICE_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        safe: false,
        reason: `Generated document contains prohibited legal-advice language: "${phrase}".`,
      }
    }
  }

  // Flag citations and rules for human verification (don't reject)
  let sanitized = output

  // Flag case citations with [VERIFY: ...]
  sanitized = sanitized.replace(CITATION_PATTERN, (match) => {
    // Don't double-wrap if already flagged
    if (sanitized.includes(`[VERIFY: ${match}]`)) return match
    return `[VERIFY: ${match}]`
  })

  // Flag rule/statute references with [VERIFY: ...]
  sanitized = sanitized.replace(RULE_PATTERN, (match) => {
    if (sanitized.includes(`[VERIFY: ${match}]`)) return match
    return `[VERIFY: ${match}]`
  })

  const wasModified = sanitized !== output

  return {
    safe: true,
    sanitized: wasModified ? sanitized : undefined,
  }
}
