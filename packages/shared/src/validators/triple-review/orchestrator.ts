import type { JurisdictionRuleConfig } from '../../jurisdiction-rules/schema'
import type { TripleReviewResult, ReviewAgentResult, ReviewCheckResult } from './types'
import { buildLegalCorrectnessPrompt, parseLegalCorrectnessResponse } from './legal-correctness'
import { buildJurisdictionCompliancePrompt, parseJurisdictionComplianceResponse } from './jurisdiction-compliance'
import { buildPlainLanguagePrompt, parsePlainLanguageResponse } from './plain-language'

type CallAI = (system: string, user: string) => Promise<string>

function toAgentResult(agentName: string, checks: ReviewCheckResult[]): ReviewAgentResult {
  return {
    agentName,
    checks,
    passCount: checks.filter(c => c.passed).length,
    totalCount: checks.length,
  }
}

export async function runTripleReview(
  config: JurisdictionRuleConfig,
  petitionDraft: string,
  callAI: CallAI,
): Promise<TripleReviewResult> {
  const legalPrompt = buildLegalCorrectnessPrompt(config, petitionDraft)
  const jurisdictionPrompt = buildJurisdictionCompliancePrompt(config, petitionDraft)
  const languagePrompt = buildPlainLanguagePrompt(config, petitionDraft)

  const [legalRaw, jurisdictionRaw, languageRaw] = await Promise.all([
    callAI(legalPrompt.system, legalPrompt.user),
    callAI(jurisdictionPrompt.system, jurisdictionPrompt.user),
    callAI(languagePrompt.system, languagePrompt.user),
  ])

  const legalCorrectness = toAgentResult('Legal Correctness', parseLegalCorrectnessResponse(legalRaw))
  const jurisdictionCompliance = toAgentResult('Jurisdiction Compliance', parseJurisdictionComplianceResponse(jurisdictionRaw))
  const plainLanguage = toAgentResult('Plain Language', parsePlainLanguageResponse(languageRaw))

  const allPassed = [legalCorrectness, jurisdictionCompliance, plainLanguage]
    .every(r => r.totalCount > 0 && r.checks.every(c => c.passed))

  return { legalCorrectness, jurisdictionCompliance, plainLanguage, allPassed }
}
