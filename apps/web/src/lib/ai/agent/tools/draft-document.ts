import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { ChatOpenAI } from '@langchain/openai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'

interface DraftDocumentConfig {
  caseId: string
  disputeType: string
  role: string
  saveDraft: (params: { caseId: string; documentType: string; content: string }) => Promise<string>
}

const SYSTEM_PROMPT = `You are a Texas civil litigation expert drafting legal documents for pro se litigants.
Write clearly, professionally, and in plain English. Follow Texas procedural rules.
This is general legal information to help self-represented litigants — not a substitute for legal advice.`

export function createDraftDocumentTool({ caseId, disputeType, role, saveDraft }: DraftDocumentConfig) {
  const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0.3 })

  return tool(
    async (input: { documentType: string; instructions: string }) => {
      const userPrompt = `Draft a ${input.documentType} for a ${role} in a ${disputeType} case in Texas.
Additional instructions: ${input.instructions}

Format the document professionally with proper headings and signature lines.`

      const response = await llm.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ])

      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
      const draftId = await saveDraft({ caseId, documentType: input.documentType, content })

      return `Draft ${input.documentType} created and saved (id: ${draftId}).\n\n${content}`
    },
    {
      name: 'draft_document',
      description:
        'Draft a legal document such as a demand letter, motion, or discovery request. Saves to the case draft versions. Use when the user asks to generate or write a document.',
      schema: z.object({
        documentType: z
          .enum(['demand_letter', 'motion_to_compel', 'answer', 'discovery_request', 'notice'])
          .describe('The type of document to draft'),
        instructions: z.string().describe('Specific instructions, facts, or context for the document'),
      }),
    }
  )
}
