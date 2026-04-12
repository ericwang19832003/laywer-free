import type { JurisdictionRuleConfig } from '../../jurisdiction-rules/schema'
import type { ReviewCheckResult } from './types'

export function buildJurisdictionCompliancePrompt(
  config: JurisdictionRuleConfig,
  petitionDraft: string,
): { system: string; user: string } {
  const sectionChecks = config.requiredSections.map(
    s => `- ${s.id}: Is the "${s.label}" section present? (${s.description})`,
  )

  const filingChecks: string[] = [
    `- court_name_correct: Does the court name match "${config.filingRules.courtName}"?`,
    `- certificate_of_service: Is a certificate of service included per "${config.filingRules.serviceRequirements}"?`,
  ]

  if (config.filingRules.fontRequirements) {
    filingChecks.push(
      `- font_requirements: Does the document meet font requirements? (${config.filingRules.fontRequirements})`,
    )
  }
  if (config.filingRules.marginRequirements) {
    filingChecks.push(
      `- margin_requirements: Does the document meet margin requirements? (${config.filingRules.marginRequirements})`,
    )
  }
  if (config.filingRules.maxPages) {
    filingChecks.push(
      `- max_pages: Is the document within the ${config.filingRules.maxPages}-page limit?`,
    )
  }

  const system = `You are a jurisdiction compliance reviewer for a ${config.state} ${config.disputeType.replace(/_/g, ' ')} petition.

Your job: check whether the petition draft meets all jurisdiction-specific filing requirements.

For each check listed, respond with exactly one line in this format:
CHECK_ID: YES — brief explanation
or
CHECK_ID: NO — what is missing or incorrect

Only output these lines. No preamble, no summary. Answer YES or NO for every check.`

  const user = `## Required sections to verify:

${sectionChecks.join('\n')}

## Filing rule checks:

Court name: ${config.filingRules.courtName}

${filingChecks.join('\n')}

## Petition draft to review:

${petitionDraft}`

  return { system, user }
}

export function parseJurisdictionComplianceResponse(raw: string): ReviewCheckResult[] {
  const results: ReviewCheckResult[] = []
  const lines = raw.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(YES|NO)\s*[—-]\s*(.+)$/i)
    if (match) {
      results.push({
        section: 'jurisdiction',
        element: match[1].trim(),
        passed: match[2].toUpperCase() === 'YES',
        reason: match[3].trim(),
      })
    }
  }

  return results
}
