import OpenAI from 'openai'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgentTool } from '../state'

interface SearchCaseDocumentsConfig {
  caseId: string
  supabaseClient: SupabaseClient
}

export function createSearchCaseDocumentsTool({ caseId, supabaseClient }: SearchCaseDocumentsConfig): AgentTool {
  return {
    name: 'search_case_documents',
    definition: {
      type: 'function',
      function: {
        name: 'search_case_documents',
        description:
          "Search the user's own uploaded case documents and evidence. Use when the user asks about their specific files, contracts, photos, letters, or any document they have uploaded. Always call this before giving advice about document contents.",
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'What to search for in the case documents',
            },
            source_types: {
              type: 'array',
              items: { type: 'string', enum: ['court_document', 'evidence_item', 'generated_document'] },
              description: 'Optional: filter to specific document types',
            },
            top_k: {
              type: 'number',
              description: 'Number of results to return (default 5)',
            },
          },
          required: ['query'],
        },
      },
    },
    async invoke(args) {
      const query = String(args.query ?? '')
      const sourceTypes = Array.isArray(args.source_types) ? (args.source_types as string[]) : null
      const topK = typeof args.top_k === 'number' ? args.top_k : 5

      const embClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      const embResponse = await embClient.embeddings.create({
        model: 'text-embedding-3-small',
        dimensions: 1536,
        input: query,
      })
      const embedding = embResponse.data[0].embedding

      const { data: chunks, error } = await supabaseClient.rpc('match_case_documents', {
        p_case_id: caseId,
        query_embedding: embedding,
        match_count: topK,
        source_types: sourceTypes,
      })

      if (error || !chunks?.length) {
        return 'No relevant content found in case documents. Files are not yet indexed or no matches were found — try again in a moment or ask the user to re-upload.'
      }

      type Chunk = { source_type: string; content: string; similarity: number }
      return (chunks as Chunk[])
        .map((chunk, i) => `[${i + 1}] (${chunk.source_type}, relevance: ${(chunk.similarity * 100).toFixed(0)}%)\n${chunk.content}`)
        .join('\n\n')
    },
  }
}
