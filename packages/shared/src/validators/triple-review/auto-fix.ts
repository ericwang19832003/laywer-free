import type { ReviewCheckResult } from './types'

export function buildAutoFixPrompt(
  originalDraft: string,
  failedChecks: ReviewCheckResult[],
  state: string,
): { system: string; user: string } {
  const system = `You are a legal document editor for ${state} court filings.

Your job: make minimal, targeted additions to fix the specific issues listed below.

Rules:
- Only add what is missing. Do not restructure existing content.
- Preserve all existing text exactly as-is.
- Add missing sections or paragraphs in the appropriate location within the document.
- Use proper legal formatting consistent with the rest of the document.
- Include the standard legal disclaimer that this is prepared by a self-represented party.

Return the complete updated petition with your additions integrated.`

  const issuesList = failedChecks
    .map(c => `- ${c.section} > ${c.element}: ${c.reason}`)
    .join('\n')

  const user = `## Issues to fix:

${issuesList}

## Original petition draft (${state}):

${originalDraft}`

  return { system, user }
}
