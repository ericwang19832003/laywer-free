import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

const AI_MODEL = 'gpt-4o-mini'

const glossaryTermSchema = z.object({
  term: z.string(),
  plain: z.string(),
})

const historyItemSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().max(2000),
})

const requestSchema = z.object({
  taskKey: z.string().max(100),
  stepName: z.string().max(200),
  disputeType: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  glossaryTerms: z.array(glossaryTermSchema).optional(),
  message: z.string().min(1).max(1000),
  history: z.array(historyItemSchema).max(20).optional(),
})

function buildSystemPrompt(
  stepName: string,
  taskKey: string,
  disputeType?: string,
  state?: string,
  glossaryTerms?: { term: string; plain: string }[]
): string {
  const location = state ? ` in ${state}` : ''
  const dispute = disputeType ? ` for a ${disputeType} dispute` : ''
  const glossarySection =
    glossaryTerms && glossaryTerms.length > 0
      ? `\n\nKey terms for this step:\n${glossaryTerms.map((g) => `- ${g.term}: ${g.plain}`).join('\n')}`
      : ''

  return `You are a plain-English legal guide helping a self-represented person navigate the "${stepName}" step of the "${taskKey}" process${dispute}${location}.

Your role is to give clear legal INFORMATION — not legal advice. You explain what things mean, what to expect, and how processes generally work. You do not tell users what to do in their specific situation.

Rules:
- Keep every answer under 150 words.
- Use simple, everyday language. Avoid jargon; if you must use a legal term, define it immediately.
- Always end with: "This is general legal information, not advice for your specific situation. Consider consulting a licensed attorney."
- Stay grounded in the current step context: "${stepName}".
- Do not speculate about case outcomes or recommend legal strategies.
- If a question is outside the scope of this step, gently redirect.${glossarySection}`
}

export async function POST(request: NextRequest) {
  try {
    // Auth
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    // Rate limiting — reuse the AI tier (10 requests/hour)
    const rl = await checkDistributedRateLimit(
      supabase,
      user.id,
      'ai',
      RATE_LIMITS.ai.maxRequests,
      RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Parse + validate body
    let body: z.infer<typeof requestSchema>
    try {
      const raw = await request.json()
      body = requestSchema.parse(raw)
    } catch (err) {
      const message =
        err instanceof z.ZodError
          ? err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
          : 'Invalid request body'
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { taskKey, stepName, disputeType, state, glossaryTerms, message, history } = body

    // Build messages array
    const systemPrompt = buildSystemPrompt(stepName, taskKey, disputeType, state, glossaryTerms)
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history ?? []).map(
        (h): OpenAI.Chat.ChatCompletionMessageParam => ({
          role: h.role,
          content: h.content,
        })
      ),
      { role: 'user', content: message },
    ]

    // OpenAI streaming
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const openai = new OpenAI({ apiKey })

    const stream = await openai.chat.completions.create({
      model: AI_MODEL,
      messages,
      max_tokens: 250,
      temperature: 0.3,
      stream: true,
    })

    // Stream response as text/plain
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content
            if (delta) {
              controller.enqueue(encoder.encode(delta))
            }
          }
        } catch (err) {
          console.error('[step-chat] Streaming error:', err)
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[step-chat] Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'An unexpected error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
