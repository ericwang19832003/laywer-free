import type { AgentTool } from '../state'

interface ReviewEvidenceConfig {
  evidenceCount: number
  disputeType: string
}

const EVIDENCE_GUIDANCE: Record<string, string[]> = {
  landlord_tenant: ['Move-in/out photos', 'Written lease agreement', 'Payment receipts', 'Communication records', 'Repair request logs'],
  debt_defense: ['Original debt agreement', 'Payment history', 'Dispute letters', 'Creditor communications', 'Credit reports'],
  personal_injury: ['Medical records', 'Photos of injuries/scene', 'Witness statements', 'Police report', 'Medical bills'],
}

export function createReviewEvidenceTool({ evidenceCount, disputeType }: ReviewEvidenceConfig): AgentTool {
  return {
    name: 'review_evidence',
    definition: {
      type: 'function',
      function: {
        name: 'review_evidence',
        description:
          'Review the evidence file to identify organization gaps and suggested document categories. Use when the user asks what evidence they have organized or what evidence they should gather. Do not predict outcomes or assess whether the user will win.',
        parameters: { type: 'object', properties: {}, required: [] },
      },
    },
    async invoke(_args) {
      const completeness =
        evidenceCount >= 5 ? 'more complete' : evidenceCount >= 3 ? 'developing' : 'limited'
      const guidance = EVIDENCE_GUIDANCE[disputeType] ?? ['Document all relevant communications', 'Preserve all records']

      const lines = [
        `Evidence file: ${evidenceCount} item(s) uploaded — ${completeness} organization record.`,
        '',
        'Recommended evidence for this dispute type:',
        ...guidance.map((g) => `• ${g}`),
      ]

      if (evidenceCount < 3) {
        lines.push('', 'Consider adding more supporting documents before your hearing.')
      }

      return lines.join('\n')
    },
  }
}
