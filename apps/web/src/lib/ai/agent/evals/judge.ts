import { AIClient } from '@/lib/ai/client'

export interface JudgeResult {
  score: number  // 0, 1, or 2
  reason: string
}

const JUDGE_SYSTEM_PROMPT = `You are evaluating the quality of an AI legal assistant's response for a pro se litigant in Texas.
Today's date is ${new Date().toISOString().slice(0, 10)}. Dates in 2026 are current, not future.
Score the response 0, 1, or 2 based on the rubric provided.
Respond with JSON only: { "score": <number>, "reason": "<one sentence>" }`

export async function judgeResponse(
  question: string,
  agentResponse: string,
  rubric: string
): Promise<JudgeResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required')

  const client = new AIClient({ model: 'claude-sonnet-4-6' })

  const { raw } = await client.complete({
    systemPrompt: JUDGE_SYSTEM_PROMPT,
    userPrompt: `Question asked: ${question}\n\nAgent response: ${agentResponse}\n\nRubric: ${rubric}`,
    temperature: 0,
    jsonMode: true,
    caller: 'judge',
  })

  try {
    const parsed = JSON.parse(raw) as { score?: number; reason?: string }
    return {
      score: typeof parsed.score === 'number' ? Math.min(2, Math.max(0, parsed.score)) : 0,
      reason: parsed.reason ?? 'No reason provided',
    }
  } catch {
    return { score: 0, reason: 'Judge returned unparseable response' }
  }
}
