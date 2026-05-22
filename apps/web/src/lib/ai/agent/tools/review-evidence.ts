import { tool } from '@langchain/core/tools'
import { z } from 'zod'

interface ReviewEvidenceConfig {
  evidenceCount: number
  disputeType: string
}

const EVIDENCE_GUIDANCE: Record<string, string[]> = {
  landlord_tenant: ['Move-in/out photos', 'Written lease agreement', 'Payment receipts', 'Communication records', 'Repair request logs'],
  debt_defense: ['Original debt agreement', 'Payment history', 'Dispute letters', 'Creditor communications', 'Credit reports'],
  personal_injury: ['Medical records', 'Photos of injuries/scene', 'Witness statements', 'Police report', 'Medical bills'],
}

export function createReviewEvidenceTool({ evidenceCount, disputeType }: ReviewEvidenceConfig) {
  return tool(
    async (_input: Record<string, never>) => {
      const strength = evidenceCount >= 5 ? 'strong' : evidenceCount >= 3 ? 'moderate' : 'thin'
      const guidance = EVIDENCE_GUIDANCE[disputeType] ?? ['Document all relevant communications', 'Preserve all records']

      const lines = [
        `Evidence vault: ${evidenceCount} items uploaded — ${strength} foundation.`,
        '',
        'Recommended evidence for this dispute type:',
        ...guidance.map((g) => `• ${g}`),
      ]

      if (evidenceCount < 3) {
        lines.push('', 'Action needed: upload more supporting documents before your hearing.')
      }

      return lines.join('\n')
    },
    {
      name: 'review_evidence',
      description:
        'Review the evidence vault to assess case strength and identify gaps. Use when the user asks how strong their case is or what evidence they should gather.',
      schema: z.object({}),
    }
  )
}
