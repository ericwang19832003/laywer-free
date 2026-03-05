import { createHash } from 'crypto'

export function buildQueryHash(question: string, caseId: string): string {
  return createHash('sha256')
    .update(JSON.stringify({ question, caseId }))
    .digest('hex')
}
