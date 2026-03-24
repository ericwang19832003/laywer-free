export interface AssessmentResult {
  viabilityScore: number     // 0-100
  viabilityLabel: string     // 'Strong', 'Moderate', 'Uncertain'
  courtType: string          // 'Small Claims', 'County', 'District'
  estimatedFilingFee: string // '$35 - $100'
  timeEstimate: string       // '2-4 weeks'
  keyInsights: string[]      // array of helpful observations
}

export function evaluateAssessment(
  disputeType: string,
  answers: Record<string, string>
): AssessmentResult {
  let score = 50 // base score

  // Evidence quality
  if (answers.evidence === 'strong') score += 25
  else if (answers.evidence === 'some') score += 15
  else if (answers.evidence === 'witnesses') score += 5
  else if (answers.evidence === 'none') score -= 10

  // Timeliness (statute of limitations risk)
  if (answers.when === 'over_2_years') score -= 20
  else if (answers.when === '1_2_years') score -= 5
  else if (answers.when === 'last_month' || answers.when === 'this_week' || answers.when === 'recent') score += 10

  // Treatment (PI specific)
  if (answers.treatment === 'yes_ongoing') score += 10
  else if (answers.treatment === 'yes_completed') score += 5

  // Communication (LT specific)
  if (answers.communication === 'written') score += 10
  else if (answers.communication === 'verbal') score += 5

  // Resolution attempt
  if (answers.tried_resolve === 'yes') score += 5

  score = Math.max(0, Math.min(100, score))

  // Court type
  let courtType = 'County Court'
  if (disputeType === 'small_claims') courtType = 'Small Claims / JP Court'
  else if (disputeType === 'personal_injury') courtType = 'District Court'
  else if (disputeType === 'landlord_tenant') courtType = 'Justice of the Peace Court'
  else if (disputeType === 'family') courtType = 'Family Court'

  // Filing fee estimate
  let estimatedFilingFee = '$50 - $300'
  if (disputeType === 'small_claims') estimatedFilingFee = '$35 - $100'
  else if (disputeType === 'personal_injury') estimatedFilingFee = '$200 - $400'
  else if (disputeType === 'landlord_tenant') estimatedFilingFee = '$35 - $75'

  // Over $20k not appropriate for small claims
  if (disputeType === 'small_claims' && answers.amount === 'over_20000') {
    score -= 15
  }

  const viabilityLabel = score >= 70 ? 'Strong' : score >= 40 ? 'Moderate' : 'Uncertain'

  // Key insights
  const keyInsights: string[] = []
  if (answers.when === 'over_2_years') {
    keyInsights.push('The statute of limitations may be an issue. Consider consulting an attorney about your deadline.')
  }
  if (answers.evidence === 'none') {
    keyInsights.push('Gathering evidence will strengthen your case. Start collecting any documentation you can find.')
  }
  if (disputeType === 'small_claims' && answers.amount === 'over_20000') {
    keyInsights.push('Small claims courts typically handle cases up to $10,000-$20,000. You may need to file in a higher court.')
  }
  if (score >= 70) {
    keyInsights.push('Based on your answers, you appear to have a viable case worth pursuing.')
  }

  return {
    viabilityScore: score,
    viabilityLabel,
    courtType,
    estimatedFilingFee,
    timeEstimate: disputeType === 'small_claims' ? '2-6 weeks' : '3-12 months',
    keyInsights,
  }
}
