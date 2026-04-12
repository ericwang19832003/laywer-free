import type { JurisdictionRuleConfig } from '../../jurisdiction-rules/schema'
import type { ReviewCheckResult } from './types'

export function buildPlainLanguagePrompt(
  config: JurisdictionRuleConfig,
  petitionDraft: string,
): { system: string; user: string } {
  const glossaryList = config.glossary.map(
    g => `- ${g.term}: ${g.plainEnglish}`,
  )

  const system = `You are a plain language reviewer for a ${config.state} ${config.disputeType.replace(/_/g, ' ')} petition.

Your job: check whether the petition draft is readable and understandable by a non-lawyer.

Perform these checks:
1. glossary_coverage — Are all legal terms in the draft covered by the provided glossary? Every legal term used should have a plain English equivalent available.
2. unexplained_jargon — Is there any unexplained jargon or Latin phrases that a layperson would not understand?
3. next_steps_clear — Are the next steps for the user (filing instructions, deadlines, what to do after filing) clearly explained?
4. summary_readable — Is the user-facing summary readable with no complex legalese that would confuse a self-represented litigant?

For each check, respond with exactly one line in this format:
CHECK_ID: YES — brief explanation
or
CHECK_ID: NO — what is unclear or missing

Only output these lines. No preamble, no summary. Answer YES or NO for every check.`

  const user = `## Glossary of approved plain English terms:

${glossaryList.join('\n')}

## Petition draft to review:

${petitionDraft}`

  return { system, user }
}

export function parsePlainLanguageResponse(raw: string): ReviewCheckResult[] {
  const results: ReviewCheckResult[] = []
  const lines = raw.split('\n').filter(l => l.trim())

  for (const line of lines) {
    const match = line.match(/^(.+?):\s*(YES|NO)\s*[—-]\s*(.+)$/i)
    if (match) {
      results.push({
        section: 'plain_language',
        element: match[1].trim(),
        passed: match[2].toUpperCase() === 'YES',
        reason: match[3].trim(),
      })
    }
  }

  return results
}
