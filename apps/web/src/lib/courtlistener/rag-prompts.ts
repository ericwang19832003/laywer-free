import { z } from 'zod'

export const ragQuestionSchema = z.object({
  question: z.string().min(10).max(2000),
})

export interface RAGChunkContext {
  case_name: string
  court_name: string
  date_filed: string
  opinion_type: string
  content: string
  similarity: number
}

export interface RAGCaseContext {
  dispute_type: string | null
  jurisdiction: string | null
  role: string
  county: string | null
}

export const RAG_SYSTEM_PROMPT = `You are a legal research assistant helping a pro se litigant (someone representing themselves in court).

Your job is to answer legal questions based ONLY on the provided case law excerpts. Follow these rules strictly:

1. ONLY cite cases from the provided excerpts. Never invent or hallucinate case citations.
2. For every legal conclusion, include a citation in this format: [Case Name, Court (Year)]
3. Quote relevant text from the excerpts to support each point.
4. If no excerpt supports a point, explicitly say "No supporting case law found in the provided excerpts."
5. You are NOT a lawyer. Frame answers as educational information, not legal advice.
6. Never use directive language like "you must" or "you should file."
7. Focus on explaining what the case law says, not recommending actions.
8. If the excerpts are insufficient to answer the question, say so clearly.

Respond in clear, plain English that a non-lawyer can understand.`

const BLOCKED_PHRASES = Object.freeze([
  'as your attorney', 'legal advice', 'i recommend that you',
  'you must file', 'guaranteed', 'you will win', 'you will lose',
  'hire a lawyer', 'in my legal opinion',
])

export function isRAGAnswerSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}

export function buildRAGPrompt(
  question: string,
  chunks: RAGChunkContext[],
  caseContext: RAGCaseContext
): { system: string; user: string } {
  const contextLines = [
    '## Your Case Context',
    `Dispute type: ${caseContext.dispute_type ?? 'general'}`,
    `Jurisdiction: ${caseContext.jurisdiction ?? 'not specified'}`,
    `Role: ${caseContext.role}`,
    caseContext.county ? `County: ${caseContext.county}` : null,
    '',
    '## Retrieved Case Law Excerpts',
    '',
  ].filter((l): l is string => l !== null)

  chunks.forEach((chunk, i) => {
    const year = chunk.date_filed ? new Date(chunk.date_filed).getFullYear() : 'n.d.'
    contextLines.push(`[${i + 1}] ${chunk.case_name}, ${chunk.court_name} (${year})`)
    contextLines.push(`Opinion type: ${chunk.opinion_type}`)
    contextLines.push(`"${chunk.content}"`)
    contextLines.push('')
  })

  contextLines.push('## Question')
  contextLines.push(question)

  return {
    system: RAG_SYSTEM_PROMPT,
    user: contextLines.join('\n'),
  }
}
