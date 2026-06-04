import OpenAI from 'openai'

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
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY is required')

  const openai = new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' })

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: JUDGE_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Question asked: ${question}\n\nAgent response: ${agentResponse}\n\nRubric: ${rubric}`,
      },
    ],
  })

  const raw = response.choices[0]?.message?.content ?? '{}'
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
