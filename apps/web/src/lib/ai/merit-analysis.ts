import { z } from 'zod'

export const meritAnalysisSchema = z.object({
  verdict: z.enum(['strong', 'moderate', 'weak']),
  score: z.number().min(0).max(100),
  summary: z.string().max(500),
  strengths: z
    .array(
      z.object({
        element: z.string().max(80),
        reason: z.string().max(250),
      })
    )
    .max(5),
  gaps: z
    .array(
      z.object({
        element: z.string().max(80),
        recommendation: z.string().max(250),
      })
    )
    .max(5),
  next_actions: z
    .array(
      z.object({
        action: z.string().max(220),
        priority: z.enum(['high', 'medium', 'low']),
      })
    )
    .max(4),
})

export type MeritAnalysis = z.infer<typeof meritAnalysisSchema>

const BLOCKED_PHRASES = Object.freeze([
  'you will win',
  'you will lose',
  'guaranteed',
  'certain to',
  'hire a lawyer',
  'as your attorney',
  'in my legal opinion',
  'i advise you',
  'legal advice',
  'you must file',
  'you are likely to',
])

export function isMeritAnalysisSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((p) => lower.includes(p))
}

export function buildStaticMeritAnalysis(
  disputeType: string,
  evidenceCount: number
): MeritAnalysis {
  const label = disputeType.replace(/_/g, ' ')
  const hasEvidence = evidenceCount >= 3
  return {
    verdict: hasEvidence ? 'moderate' : 'weak',
    score: hasEvidence ? 50 : 25,
    summary: `Your ${label} case assessment is not yet complete. Finishing your intake and uploading supporting documents will enable a detailed merit analysis.`,
    strengths: hasEvidence
      ? [
          {
            element: 'Evidence on file',
            reason: `You have uploaded ${evidenceCount} evidence item${evidenceCount !== 1 ? 's' : ''}.`,
          },
        ]
      : [],
    gaps: [
      {
        element: 'Case facts incomplete',
        recommendation:
          'Complete your intake and guided steps so the system has enough facts to evaluate your case.',
      },
    ],
    next_actions: [
      {
        action: 'Complete your case intake and all guided-step questions.',
        priority: 'high',
      },
      {
        action: 'Upload photos, documents, and correspondence to the evidence vault.',
        priority: 'high',
      },
    ],
  }
}

export const MERIT_ANALYSIS_SYSTEM_PROMPT = `You are a case merit analyst helping pro se litigants understand the factual and legal strength of their case.

Your job: read the case facts provided and identify (1) what supports the user's position, (2) what is missing or weak, and (3) concrete actions the user can take this week to improve their position.

RULES:
- Be honest but constructive — users are self-represented and need clear, practical guidance
- Never predict outcomes or guarantee results ("you will win/lose", "you are likely to")
- Never give specific courtroom legal advice ("argue X", "file a motion for Y")
- Focus on evidence, documentation, and preparation — not legal strategy
- Be specific: name the exact gap and what document/record would fill it
- Evaluate against the key legal elements for the dispute type

Key legal elements by dispute type:
- personal_injury: Duty of care, Breach of duty (fault), Causation (injury linked to incident), Damages (medical + financial losses)
- small_claims: Agreement or obligation, Breach or non-payment, Quantifiable damages with receipts
- contract: Valid written agreement, Your performance, Defendant's breach, Financial damages
- landlord_tenant: Lease terms documented, Written notice to landlord, Landlord's failure to act, Documented damages or costs
- real_estate: Transaction terms, Disclosures/representations made, Breach of obligation, Damages
- divorce: Documented marital assets and debts, Living arrangement facts, Settlement position clarity
- custody: Parenting history documented, Child's best-interest factors, Prior agreements or orders
- child_support: Income documentation, Child's needs, Existing order if any
- employment: Employment terms, Documented incidents with dates, Protected class or activity, Financial damages
- debt_collection: Debt validation status, Your payment records, Statute of limitations, FDCPA violations if any
- partnership / b2b_commercial: Written agreement, Your performance, Breach by other party, Business damages
- other / civil: Core obligation or harm, Evidence of breach or wrongdoing, Quantifiable damages

Score guidance:
- 75-100: Strong — core elements well documented, minor gaps only
- 50-74: Moderate — key elements present but important gaps remain
- 25-49: Weak — significant evidence missing for one or more core elements
- 0-24: Very weak — case facts incomplete or most elements unsupported

Respond with JSON only:
{
  "verdict": "strong" | "moderate" | "weak",
  "score": 0-100,
  "summary": "2-3 sentence honest assessment of where the case stands",
  "strengths": [{ "element": "element name", "reason": "specific reason this supports the case" }],
  "gaps": [{ "element": "element name", "recommendation": "exactly what to collect or do" }],
  "next_actions": [{ "action": "concrete step", "priority": "high|medium|low" }]
}`

export function buildMeritAnalysisPrompt(input: {
  disputeType: string
  jurisdiction: string
  courtType: string
  guidedAnswers: Record<string, string>
  evidenceCount: number
  tasksCompleted: number
  tasksTotal: number
}): string {
  const answersText = Object.entries(input.guidedAnswers)
    .filter(([, v]) => v && v !== 'acknowledged' && v.length < 500)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')

  return [
    `CASE TYPE: ${input.disputeType.replace(/_/g, ' ')}`,
    `JURISDICTION: ${input.jurisdiction}`,
    `COURT TYPE: ${input.courtType}`,
    `EVIDENCE ITEMS UPLOADED: ${input.evidenceCount}`,
    `TASK PROGRESS: ${input.tasksCompleted} of ${input.tasksTotal} steps completed`,
    '',
    'CASE FACTS FROM INTAKE & GUIDED STEPS:',
    answersText.length > 0 ? answersText : '  (No guided step answers recorded yet)',
  ].join('\n')
}
