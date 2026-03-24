import { type AnalysisResult, analysisResultSchema } from '@/lib/schemas/quick-resolve'

const DISPUTE_TYPES = [
  'small_claims', 'personal_injury', 'landlord_tenant', 'family',
  'debt_collection', 'contract', 'property', 'real_estate', 'business', 'other',
]

export function buildAnalysisSystemPrompt(): string {
  return `You are a legal intake assistant. Extract structured case data from a user's description of their legal situation.

Return a JSON object with these fields:
- disputeType: one of ${JSON.stringify(DISPUTE_TYPES)}
- subType: optional specific sub-type (e.g., "security_deposit", "breach_of_contract", "car_accident")
- role: "plaintiff" (the user is suing/making a claim) or "defendant" (being sued)
- opposingParty: { name: string (best guess from context), type: "person" | "business" }
- approximateAmount: number in dollars (0 if not monetary)
- state: 2-letter US state code (extract from context, default "TX" if unclear)
- summary: one-sentence summary of the dispute
- confidence: "high" if all fields are clear, "medium" if some inferred, "low" if mostly guessed

Rules:
- Extract the opposing party name from context (e.g., "my landlord John" → "John")
- If a business name contains LLC, Inc, Corp, or similar → type: "business"
- Amounts like "$2,400" or "two thousand" should be parsed to numbers
- If the user says "being sued" or "received papers" → role: "defendant"
- If the user says "want to sue" or "they owe me" → role: "plaintiff"
- Return ONLY valid JSON, no markdown wrapping
`
}

export function buildAnalysisUserPrompt(story: string): string {
  return `Here is the user's description of their legal situation:\n\n${story}`
}

export function parseAnalysisResult(raw: string): AnalysisResult | null {
  try {
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const result = analysisResultSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
