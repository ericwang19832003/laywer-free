import type { JurisdictionRuleConfig } from '../../jurisdiction-rules/schema'
import type { ReviewCheckResult } from './types'

export function buildLegalCorrectnessPrompt(
  config: JurisdictionRuleConfig,
  petitionDraft: string,
): { system: string; user: string } {
  const elementsList: string[] = []
  for (const section of config.requiredSections) {
    for (const element of section.legalElements ?? []) {
      elementsList.push(`${section.id} > ${element}`)
    }
  }

  const system = `You are a legal correctness reviewer for a ${config.state} ${config.disputeType.replace(/_/g, ' ')} petition.

Your job: check whether the petition draft contains each of the required legal elements.

For each element listed, respond with exactly one line in this format:
SECTION > ELEMENT: YES — brief explanation
or
SECTION > ELEMENT: NO — what is missing

Only output these lines. No preamble, no summary. Answer YES or NO for every element.`

  const user = `## Required legal elements to check:

${elementsList.map(e => `- ${e}`).join('\n')}

## Petition draft to review:

${petitionDraft}`

  return { system, user }
}

export function parseLegalCorrectnessResponse(raw: string): ReviewCheckResult[] {
  const results: ReviewCheckResult[] = []
  const lines = raw.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(.+?)\s*>\s*(.+?):\s*(YES|NO)\s*[—-]\s*(.+)$/i)
    if (match) {
      results.push({
        section: match[1].trim(),
        element: match[2].trim(),
        passed: match[3].toUpperCase() === 'YES',
        reason: match[4].trim(),
      })
    }
  }

  return results
}
