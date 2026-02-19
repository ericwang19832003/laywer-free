import type { DiscoveryItemType } from '@/lib/schemas/discovery'

/**
 * Deterministic template generators for discovery items.
 * No AI. No legal advice. Neutral and professional.
 */

// ============================================
// Prompt lint
// ============================================

const MIN_PROMPT_LENGTH = 10

const FORBIDDEN_PHRASES = [
  'sanction',
  'penalty',
  'sue',
  'lawsuit',
  'criminal',
  'illegal',
  'motion to compel',
] as const

export type LintSeverity = 'error' | 'warning'

export interface LintResult {
  severity: LintSeverity
  message: string
}

/**
 * Lint prompt_text before generation.
 * Returns an array of issues. Empty array = clean.
 */
export function lintPromptText(promptText: string): LintResult[] {
  const results: LintResult[] = []

  if (promptText.length < MIN_PROMPT_LENGTH) {
    results.push({
      severity: 'error',
      message: `Prompt text must be at least ${MIN_PROMPT_LENGTH} characters (got ${promptText.length}).`,
    })
  }

  const lower = promptText.toLowerCase()
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) {
      results.push({
        severity: 'warning',
        message: `Prompt contains discouraged phrase: "${phrase}". Discovery requests should remain neutral and professional.`,
      })
    }
  }

  return results
}

/**
 * Returns true if lint results contain any errors (not warnings).
 */
export function hasLintErrors(results: LintResult[]): boolean {
  return results.some((r) => r.severity === 'error')
}

// ============================================
// Generators
// ============================================

/**
 * Generate a Request for Production (RFP).
 */
export function generateRFP(itemNo: number, promptText: string): string {
  return [
    `REQUEST FOR PRODUCTION NO. ${itemNo}`,
    '',
    'Please produce copies of the following documents or materials:',
    '',
    promptText,
    '',
    'Please produce the above-described documents within the time period prescribed by applicable rules. If any document is withheld on the basis of privilege, provide a privilege log identifying the document, its date, author, recipients, and the privilege asserted.',
  ].join('\n')
}

/**
 * Generate an Interrogatory (ROG).
 */
export function generateROG(itemNo: number, promptText: string): string {
  return [
    `INTERROGATORY NO. ${itemNo}`,
    '',
    'Please answer the following question:',
    '',
    promptText,
    '',
    'Your answer must be made under oath and must be complete. If you lack sufficient information to fully answer, so state and provide whatever information you do possess. Identify all persons with knowledge and all documents consulted in preparing your answer.',
  ].join('\n')
}

/**
 * Generate a Request for Admission (RFA).
 */
export function generateRFA(itemNo: number, promptText: string): string {
  return [
    `REQUEST FOR ADMISSION NO. ${itemNo}`,
    '',
    'Admit or deny the following statement:',
    '',
    promptText,
    '',
    'If you cannot admit or deny this request in its entirety, state in detail the reasons why you cannot, and admit or deny each part that you can. You must respond within the time prescribed by applicable rules.',
  ].join('\n')
}

const GENERATORS: Record<DiscoveryItemType, (itemNo: number, promptText: string) => string> = {
  rfp: generateRFP,
  rog: generateROG,
  rfa: generateRFA,
}

/**
 * Dispatch to the correct generator by item type.
 * Runs lint first — blocks on errors, passes through warnings.
 *
 * Returns { generatedText, warnings } on success.
 * Throws on lint errors.
 */
export function generateDiscoveryText(
  itemType: DiscoveryItemType,
  itemNo: number,
  promptText: string
): { generatedText: string; warnings: LintResult[] } {
  const lint = lintPromptText(promptText)

  if (hasLintErrors(lint)) {
    throw new PromptLintError(lint)
  }

  const warnings = lint.filter((r) => r.severity === 'warning')
  const generatedText = GENERATORS[itemType](itemNo, promptText)

  return { generatedText, warnings }
}

/**
 * Error thrown when prompt text fails lint with blocking errors.
 */
export class PromptLintError extends Error {
  public readonly issues: LintResult[]

  constructor(issues: LintResult[]) {
    const messages = issues.map((i) => i.message).join('; ')
    super(`Prompt lint failed: ${messages}`)
    this.name = 'PromptLintError'
    this.issues = issues
  }
}
