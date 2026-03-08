export interface RAGQueryContext {
  dispute_type: string | null
  jurisdiction: string | null
  role: string
  county?: string | null
}

export type HybridSource = 'vector' | 'keyword'

export interface HybridResult {
  id: string
  score: number
  source: HybridSource
}

export function expandQueryWithContext(query: string, _context: RAGQueryContext): string {
  // Return the user's query as-is. Context fields (jurisdiction, dispute_type,
  // role, county) are applied via CourtListener's filter parameters rather than
  // appended as search terms, which would dilute keyword relevance.
  return query.trim()
}

export function mergeHybridResults(
  vectorResults: HybridResult[],
  keywordResults: HybridResult[],
  options: { limit: number }
): HybridResult[] {
  const merged = new Map<string, HybridResult>()

  for (const result of vectorResults) {
    merged.set(result.id, result)
  }

  for (const result of keywordResults) {
    const existing = merged.get(result.id)
    if (!existing || result.score > existing.score) {
      merged.set(result.id, result)
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit)
}
