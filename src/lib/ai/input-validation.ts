/**
 * Input validation for AI document generation.
 * Detects prompt injection and suspicious patterns BEFORE sending to the AI.
 */

export interface ValidationResult {
  safe: boolean
  reason?: string
  sanitized?: string
}

const MAX_FIELD_LENGTH = 10_000

/**
 * Prompt injection phrases (case-insensitive).
 * Each entry is checked as a substring of the lowercased input.
 */
const INJECTION_PHRASES = [
  'ignore previous instructions',
  'ignore all instructions',
  'ignore your instructions',
  'disregard previous instructions',
  'disregard your instructions',
  'forget your instructions',
  'forget previous instructions',
  'override your instructions',
  'system prompt',
  'you are now',
  'act as',
  'pretend to be',
  'new instructions:',
  'ignore the above',
  'do not follow',
  'bypass your',
  'jailbreak',
  'developer mode',
  'dan mode',
  'ignore safety',
  'reveal your prompt',
  'show your prompt',
  'output your instructions',
  'repeat your system',
] as const

/**
 * Patterns that look like system-level directives injected into user text.
 */
const DIRECTIVE_PATTERNS = [
  /^#{2,}\s+(system|role|instruction|directive|prompt)/im,
  /^(SYSTEM|ASSISTANT|USER)\s*:/m,
  /\[INST\]/i,
  /<<\s*SYS\s*>>/i,
  /<\|im_start\|>/i,
  /\{\{#system\}\}/i,
] as const

/**
 * Non-printable / control characters (except common whitespace).
 * Allows \t (0x09), \n (0x0A), \r (0x0D).
 */
const CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/

export function validateAIInput(input: string): ValidationResult {
  // Length check
  if (input.length > MAX_FIELD_LENGTH) {
    return {
      safe: false,
      reason: `Input exceeds maximum length of ${MAX_FIELD_LENGTH.toLocaleString()} characters.`,
    }
  }

  // Control character check
  if (CONTROL_CHAR_RE.test(input)) {
    return {
      safe: false,
      reason: 'Input contains invalid control characters.',
    }
  }

  // Prompt injection phrase check
  const lower = input.toLowerCase()
  for (const phrase of INJECTION_PHRASES) {
    if (lower.includes(phrase)) {
      return {
        safe: false,
        reason: 'Input contains a pattern that could not be processed safely.',
      }
    }
  }

  // System directive pattern check
  for (const pattern of DIRECTIVE_PATTERNS) {
    if (pattern.test(input)) {
      return {
        safe: false,
        reason: 'Input contains formatting that resembles system directives.',
      }
    }
  }

  return { safe: true }
}

/**
 * Validate all string fields in a facts object.
 * Returns the first failure found, or { safe: true }.
 */
export function validateFactsObject(
  facts: Record<string, unknown>
): ValidationResult {
  for (const [key, value] of Object.entries(facts)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      const result = validateAIInput(value)
      if (!result.safe) {
        return {
          safe: false,
          reason: `Field "${key}": ${result.reason}`,
        }
      }
    }
  }
  return { safe: true }
}
