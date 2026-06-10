import { sha256Hex } from '@/lib/edge-crypto'

export async function buildQueryHash(question: string, caseId: string): Promise<string> {
  // Keep key ordering stable for hash determinism.
  return sha256Hex(JSON.stringify({ question, caseId }))
}
