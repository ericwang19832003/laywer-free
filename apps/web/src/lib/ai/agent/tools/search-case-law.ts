import OpenAI from 'openai'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgentTool } from '../state'

interface SearchCaseLawConfig {
  disputeType: string
  supabaseClient: SupabaseClient
}

export function createSearchCaseLawTool({ disputeType, supabaseClient }: SearchCaseLawConfig): AgentTool {
  return {
    name: 'search_case_law',
    definition: {
      type: 'function',
      function: {
        name: 'search_case_law',
        description:
          'Search relevant Texas case law and statutes. Use when the user asks about legal standards, what courts have ruled, or needs citations to support their position.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'The legal question or topic to search for' },
          },
          required: ['query'],
        },
      },
    },
    async invoke(args) {
      const query = String(args.query ?? '')

      const embClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const embResponse = await embClient.embeddings.create({
        model: 'text-embedding-3-large',
        dimensions: 3072,
        input: query,
      })
      const embedding = embResponse.data[0].embedding

      const { data: docs, error } = await supabaseClient.rpc('match_case_law', {
        query_embedding: embedding,
        match_count: 3,
        filter: { dispute_type: disputeType },
      })

      if (error || !docs?.length) {
        return 'No relevant case law found for this query.'
      }

      return (docs as Array<{ case_name?: string; citation?: string; year?: string; content: string }>)
        .map((doc, i) => {
          const header = [doc.case_name, doc.citation, doc.year].filter(Boolean).join(', ')
          return `[${i + 1}] ${header || 'Unknown case'}\n${doc.content}`
        })
        .join('\n\n')
    },
  }
}
