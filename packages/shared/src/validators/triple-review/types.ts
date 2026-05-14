export interface ReviewCheckResult {
  section: string
  element: string
  passed: boolean
  reason: string
}

export interface ReviewAgentResult {
  agentName: string
  checks: ReviewCheckResult[]
  passCount: number
  totalCount: number
}

export interface TripleReviewResult {
  legalCorrectness: ReviewAgentResult
  jurisdictionCompliance: ReviewAgentResult
  plainLanguage: ReviewAgentResult
  allPassed: boolean
}
