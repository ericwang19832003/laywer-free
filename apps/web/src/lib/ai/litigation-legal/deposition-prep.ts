export type WitnessRole = 'opposing_party' | 'expert_witness' | 'fact_witness'
export type DepoPerspective = 'deposing' | 'defending'

export interface DepoInput {
  witnessName: string
  witnessRole: WitnessRole
  depositionPerspective: DepoPerspective
  caseContext: string
  keyFacts: string
  evidenceSummary: string
}

const WITNESS_ROLE_LABELS: Record<WitnessRole, string> = {
  opposing_party: 'opposing party',
  expert_witness: 'expert witness',
  fact_witness: 'fact witness',
}

export function buildDepoPrompt(input: DepoInput): { systemPrompt: string; userPrompt: string } {
  const isDeposing = input.depositionPerspective === 'deposing'

  const systemPrompt = `You are helping a self-represented litigant prepare for a deposition.

${input.caseContext}

Perspective: ${isDeposing ? 'The user is deposing (questioning) the witness.' : 'The user is defending their own deposition (being questioned).'}

Rules:
- Use plain English. No legal jargon without explanation.
- Never predict outcomes or guarantee results.
- Never use directive language ("you must").
- Flag any question that is likely to draw an objection with: [May draw objection — consider rephrasing].
- Organize questions by topic with clear headers.
- Include a "what to bring" section listing relevant evidence items.`

  const userPrompt = `${isDeposing
    ? `Prepare deposition questions to ask ${input.witnessName} (${WITNESS_ROLE_LABELS[input.witnessRole]}).`
    : `Help me prepare for my own deposition. The opposing party may question me as a ${WITNESS_ROLE_LABELS[input.witnessRole]}.`
  }

Key facts:
${input.keyFacts}

Available evidence:
${input.evidenceSummary}

Generate:
1. Key topics to cover (in order of importance)
2. ${isDeposing ? '5-8 questions per topic' : 'How to answer questions about each topic'}
3. What to bring / have ready for the deposition
4. Common pitfalls to avoid`

  return { systemPrompt, userPrompt }
}
