import { z } from 'zod'

export const settlementValuationSchema = z.object({
  low: z.number(),
  mid: z.number(),
  high: z.number(),
  currency: z.literal('USD'),
  factors: z.array(z.string()).min(1).max(6),
  batna: z.string(),
  watna: z.string(),
  disclaimer: z.string(),
}).refine((d) => d.low < d.mid, { message: 'low must be less than mid' })
  .refine((d) => d.mid < d.high, { message: 'mid must be less than high' })

export type SettlementValuation = z.infer<typeof settlementValuationSchema>

export const SETTLEMENT_VALUATION_SYSTEM_PROMPT = `You help a pro se litigant think through settlement negotiation ranges for their civil case.

Outputs are illustrative ranges only — not legal guidance. Never predict court outcomes. Always include a disclaimer that ranges are for negotiation thinking only. Use plain English.

RULES:
- Avoid directive or predictive language (e.g. commands, guarantees, outcome predictions, win/loss framing)
- Never predict what a court will decide
- Provide low / mid / high estimates grounded in the case context provided
- low must be strictly less than mid; mid must be strictly less than high
- List 1–6 factors that influenced the range
- Include BATNA (best alternative to negotiated agreement) and WATNA (worst alternative) in plain English
- Always append a disclaimer

Respond with JSON only:
{
  "low": number,
  "mid": number,
  "high": number,
  "currency": "USD",
  "factors": ["..."],
  "batna": "...",
  "watna": "...",
  "disclaimer": "..."
}`

export function buildSettlementValuationPrompt(input: {
  dispute_type: string | null
  state: string | null
  role: string | null
  case_name: string | null
  opposing_party: string | null
  overall_score: number
  evidence_count: number
  tasks_completed: number
  upcoming_deadlines: number
}): string {
  return [
    `Dispute type: ${input.dispute_type ?? 'general'}`,
    `State: ${input.state ?? 'unknown'}`,
    `Role: ${input.role ?? 'unknown'}`,
    `Case: ${input.case_name ?? 'Unnamed case'} vs. ${input.opposing_party ?? 'Opposing party'}`,
    `Case health score: ${input.overall_score}/100`,
    `Evidence items: ${input.evidence_count}`,
    `Tasks completed: ${input.tasks_completed}`,
    `Upcoming deadlines: ${input.upcoming_deadlines}`,
  ].join('\n')
}

export function buildStaticSettlementValuation(): SettlementValuation {
  return {
    low: 0,
    mid: 1,
    high: 2,
    currency: 'USD',
    factors: ['Insufficient case data to estimate — add more case details for a tailored range'],
    batna: 'Continue building your case before making any settlement decisions',
    watna: 'Proceeding without clear case context may limit your negotiating position',
    disclaimer: 'These ranges are illustrative only and are not legal advice. Consult an attorney for guidance specific to your situation.',
  }
}
