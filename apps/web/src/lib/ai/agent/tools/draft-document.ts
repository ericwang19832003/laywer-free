import { AIClient } from '@/lib/ai/client'
import type { AgentTool } from '../state'

interface DraftDocumentConfig {
  caseId: string
  disputeType: string
  role: string
  saveDraft: (params: { caseId: string; documentType: string; content: string }) => Promise<string>
}

const SYSTEM_PROMPT = `You are a Texas civil litigation expert drafting legal documents for pro se litigants.
Write clearly, professionally, and in plain English. Follow Texas procedural rules.
This is general legal information to help self-represented litigants — not a substitute for legal advice.`

export function createDraftDocumentTool({ caseId, disputeType, role, saveDraft }: DraftDocumentConfig): AgentTool {
  return {
    name: 'draft_document',
    definition: {
      type: 'function',
      function: {
        name: 'draft_document',
        description:
          'Draft a legal document such as a demand letter, motion, or discovery request. Saves to the case draft versions. Use when the user asks to generate or write a document. Call immediately without asking for more context — infer the documentType from the request and use the case context as instructions if the user does not provide specifics. Draft first, offer to refine after.',
        parameters: {
          type: 'object',
          properties: {
            documentType: {
              type: 'string',
              enum: ['demand_letter', 'motion_to_compel', 'answer', 'discovery_request', 'notice'],
              description: 'The type of document to draft',
            },
            instructions: {
              type: 'string',
              description: 'Specific instructions, facts, or context for the document',
            },
          },
          required: ['documentType', 'instructions'],
        },
      },
    },
    async invoke(args) {
      const documentType = String(args.documentType ?? 'demand_letter')
      const instructions = String(args.instructions ?? '')

      const client = new AIClient({ model: 'claude-sonnet-4-6' })
      const { content } = await client.complete({
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: `Draft a ${documentType} for a ${role} in a ${disputeType} case in Texas.\nAdditional instructions: ${instructions}\n\nFormat the document professionally with proper headings and signature lines.`,
        temperature: 0.3,
        caller: 'draft-document',
      })

      const draftId = await saveDraft({ caseId, documentType, content })

      return `Draft ${documentType} created and saved (id: ${draftId}).\n\n${content}`
    },
  }
}
