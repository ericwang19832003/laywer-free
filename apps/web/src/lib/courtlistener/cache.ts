import { createHash } from 'crypto'

export function buildQueryHash(question: string, caseId: string): string {
  return createHash('sha256')
    // Keep key ordering stable for hash determinism.
    .update(JSON.stringify({ question, caseId }))
    .digest('hex')
}
