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

export function expandQueryWithContext(query: string, context: RAGQueryContext): string {
  const parts = [query.trim()]

  if (context.dispute_type) parts.push(context.dispute_type)
  if (context.jurisdiction) parts.push(context.jurisdiction)
  if (context.role) parts.push(context.role)
  if (context.county) parts.push(context.county)

  return parts.join(' ').replace(/\s+/g, ' ').trim()
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
