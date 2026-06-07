import { z } from 'zod'

// ── Schemas ────────────────────────────────────────────────────────

const optionItemSchema = z.object({
  name: z.string().max(70),
  description: z.string().max(350),
  pros: z.array(z.string().max(160)).min(1).max(3),
  cons: z.array(z.string().max(160)).min(1).max(3),
  recommended: z.boolean(),
})

const decisionPointSchema = z.object({
  question: z.string().max(120),
  context: z.string().max(300),
  options: z.array(optionItemSchema).min(2).max(3),
  urgency: z.enum(['now', 'soon', 'when_ready']),
})

export const optionsAdvisorSchema = z.object({
  decisions: z.array(decisionPointSchema).min(1).max(3),
})

export type OptionItem = z.infer<typeof optionItemSchema>
export type DecisionPoint = z.infer<typeof decisionPointSchema>
export type OptionsAdvisor = z.infer<typeof optionsAdvisorSchema>

// ── Safety ─────────────────────────────────────────────────────────

const BLOCKED_PHRASES = Object.freeze([
  'you will win',
  'you will lose',
  'guaranteed',
  'certain to',
  'hire a lawyer',
  'as your attorney',
  'in my legal opinion',
  'legal advice',
  'you must argue',
  'you are likely to',
  'i recommend filing',
])

export function isOptionsAdvisorSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((p) => lower.includes(p))
}

// ── Static fallback ────────────────────────────────────────────────

export function buildStaticOptionsAdvisor(
  disputeType: string,
  completedTasks: string[],
  pendingTasks: string[]
): OptionsAdvisor {
  const isEarlyStage =
    completedTasks.length <= 3 ||
    pendingTasks.some((k) => k.includes('intake') || k.includes('demand'))

  if (isEarlyStage) {
    return {
      decisions: [
        {
          question: 'Should you try to negotiate first or file with the court right away?',
          context:
            'Most disputes can be resolved without going to court. Filing is a bigger commitment — it costs money, takes time, and creates a formal record.',
          urgency: 'soon',
          options: [
            {
              name: 'Negotiate first',
              description:
                'Send a formal demand letter, give the other party a deadline to respond, and see if a deal can be reached before filing.',
              pros: [
                'Faster and cheaper than litigation — most disputes settle this way.',
                'Preserves the option to file if negotiation fails.',
                'No court fees or filing paperwork yet.',
              ],
              cons: [
                'Gives the other party time to hide assets or prepare defenses.',
                'Does not stop the statute of limitations clock — you must still file before the deadline.',
              ],
              recommended: true,
            },
            {
              name: 'File with the court now',
              description:
                'Skip negotiation and file your petition directly, then serve the other party.',
              pros: [
                'Stops the statute of limitations immediately.',
                'Shows seriousness — sometimes motivates faster settlement.',
              ],
              cons: [
                'Court filing fees ($200–$400 typically) are non-refundable.',
                'Adds months to the timeline even if a settlement is reached later.',
              ],
              recommended: false,
            },
          ],
        },
      ],
    }
  }

  return {
    decisions: [
      {
        question: 'Should you accept a settlement offer or continue pursuing the case?',
        context:
          'Settling gives you certainty; continuing to litigate carries risk and takes time. This decision depends on the offer amount, your evidence strength, and how much time you can invest.',
        urgency: 'soon',
        options: [
          {
            name: 'Accept the settlement',
            description:
              'Agree to the offered terms, sign a release, and close the case.',
            pros: [
              'Certainty — you get paid now without further risk.',
              'Saves months of additional litigation time and effort.',
              'Avoids the risk of a worse outcome at trial.',
            ],
            cons: [
              'May be less than your full claimed amount.',
              'Signing a release means you cannot sue again on the same issue.',
            ],
            recommended: false,
          },
          {
            name: 'Counter-offer or continue litigating',
            description:
              'Reject the current offer and either propose a higher number or proceed toward trial.',
            pros: [
              'Keeps the possibility of a better recovery alive.',
              'Counter-offers often lead to higher settlements without going to trial.',
            ],
            cons: [
              'No guarantee of a better outcome — could end in less or nothing.',
              'More time, effort, and potential additional costs ahead.',
            ],
            recommended: true,
          },
        ],
      },
    ],
  }
}

// ── Prompts ────────────────────────────────────────────────────────

export const OPTIONS_ADVISOR_SYSTEM_PROMPT = `You are a case options advisor for pro se (self-represented) litigants. Your role is to identify the 1–3 most critical decisions the user faces RIGHT NOW in their case, and lay out the options clearly so they can decide.

For each decision point:
- State the question in plain, direct English
- Briefly explain why this decision matters at this stage (context)
- Present 2–3 concrete options with honest, SPECIFIC pros and cons
- Mark exactly ONE option as recommended based on their specific case facts
- Set urgency: "now" (decide this week), "soon" (this month), "when_ready" (no immediate pressure)

RULES:
- Be SPECIFIC to their case facts — no generic platitudes
- Prioritize decisions that are directly relevant given their current workflow phase (completed vs pending tasks)
- Do NOT predict outcomes or guarantee results ("you will win/lose", "you are likely to")
- Do NOT give courtroom legal strategy ("argue X in court", "raise this defense")
- Focus on practical, procedural tradeoffs the user can evaluate themselves
- Each pro/con must be specific and concrete (≥40 characters, says something real)
- Recommended should be true for exactly one option per decision point

Common decision points by stage:
EARLY (intake/demand): negotiate vs. file; self-rep vs. attorney; small claims vs. district court
MID (filed/pending): accept settlement vs. continue; request mediation vs. go to hearing; file motions vs. wait
LATE (trial prep): stipulate to facts vs. contest everything; request continuance vs. proceed; accept last-minute offer

Common decision points by dispute type:
- personal_injury: negotiate with insurance vs. file; accept settlement vs. trial; mediation vs. hearing
- small_claims: small claims vs. district court (based on amount); settle vs. hearing; default judgment vs. wait
- contract: negotiation vs. litigation; arbitration vs. court; accept payment plan vs. full judgment
- landlord_tenant: negotiate vs. file; small claims vs. civil court; accept partial vs. full amount
- divorce/custody/family: contested vs. uncontested; temporary orders vs. wait; mediation vs. hearing
- debt_collection: validation dispute vs. defense; consent judgment vs. trial; payment plan vs. dismiss
- employment: EEOC/agency route vs. direct filing; settle vs. continue; document more vs. file now

Respond with JSON only:
{
  "decisions": [
    {
      "question": "Should you negotiate first or file with the court?",
      "context": "Why this decision matters now given their stage",
      "urgency": "now" | "soon" | "when_ready",
      "options": [
        {
          "name": "Option name (short)",
          "description": "What this option means in practice",
          "pros": ["specific pro 1", "specific pro 2"],
          "cons": ["specific con 1"],
          "recommended": true
        }
      ]
    }
  ]
}`

export function buildOptionsAdvisorPrompt(input: {
  disputeType: string
  jurisdiction: string
  courtType: string
  completedTasks: string[]
  pendingTasks: string[]
  nextTaskKey: string | null
  guidedAnswers: Record<string, string>
  evidenceCount: number
  upcomingDeadlines: { key: string; due_at: string }[]
}): string {
  const { disputeType, jurisdiction, courtType, completedTasks, pendingTasks, nextTaskKey, guidedAnswers, evidenceCount, upcomingDeadlines } = input

  const answersText = Object.entries(guidedAnswers)
    .filter(([, v]) => v && v !== 'acknowledged' && v.length < 500)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')

  const deadlineText = upcomingDeadlines.length > 0
    ? upcomingDeadlines
        .map((d) => {
          const days = Math.ceil((new Date(d.due_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          return `  ${d.key}: ${days} days`
        })
        .join('\n')
    : '  (none)'

  return [
    `CASE TYPE: ${disputeType.replace(/_/g, ' ')}`,
    `JURISDICTION: ${jurisdiction}`,
    `COURT TYPE: ${courtType}`,
    `EVIDENCE ITEMS UPLOADED: ${evidenceCount}`,
    '',
    `COMPLETED STEPS: ${completedTasks.length > 0 ? completedTasks.join(', ') : 'none'}`,
    `PENDING STEPS: ${pendingTasks.length > 0 ? pendingTasks.slice(0, 10).join(', ') : 'none'}`,
    `CURRENT NEXT STEP: ${nextTaskKey ?? 'unknown'}`,
    '',
    'UPCOMING DEADLINES:',
    deadlineText,
    '',
    'CASE FACTS FROM INTAKE & GUIDED STEPS:',
    answersText.length > 0 ? answersText : '  (no guided step answers yet)',
  ].join('\n')
}
