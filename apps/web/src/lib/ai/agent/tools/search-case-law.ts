import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import type { SupabaseClient } from '@supabase/supabase-js'

interface SearchCaseLawConfig {
  disputeType: string
  supabaseClient: SupabaseClient
}

export function createSearchCaseLawTool({ disputeType, supabaseClient }: SearchCaseLawConfig) {
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-large', dimensions: 3072 })
  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'case_law_embeddings',
    queryName: 'match_case_law',
  })
  const retriever = vectorStore.asRetriever({
    k: 3,
    filter: { dispute_type: disputeType },
  })

  return tool(
    async (input: { query: string }) => {
      const docs = await retriever.invoke(input.query)

      if (docs.length === 0) {
        return 'No relevant case law found for this query.'
      }

      return docs
        .map((doc, i) => {
          const { case_name, citation, year } = doc.metadata ?? {}
          const header = [case_name, citation, year].filter(Boolean).join(', ')
          return `[${i + 1}] ${header || 'Unknown case'}\n${doc.pageContent}`
        })
        .join('\n\n')
    },
    {
      name: 'search_case_law',
      description:
        'Search relevant Texas case law and statutes. Use when the user asks about legal standards, what courts have ruled, or needs citations to support their position.',
      schema: z.object({
        query: z.string().describe('The legal question or topic to search for'),
      }),
    }
  )
}
