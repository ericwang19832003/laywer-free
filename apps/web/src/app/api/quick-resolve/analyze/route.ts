import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { storyInputSchema } from '@lawyer-free/shared/schemas/quick-resolve'
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt, parseAnalysisResult } from '@/lib/ai/story-analysis'
import { lookupBusinessEntity } from '@/lib/entity-lookup/opencorporates'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { user } = auth

    const rl = checkRateLimit(user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const parsed = storyInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const openai = new OpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildAnalysisSystemPrompt() },
        { role: 'user', content: buildAnalysisUserPrompt(parsed.data.story) },
      ],
      temperature: 0.2,
      max_tokens: 500,
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 502 })
    }

    const analysis = parseAnalysisResult(raw)
    if (!analysis) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 502 })
    }

    // Auto-lookup business entity via OpenCorporates
    if (analysis.opposingParty.type === 'business') {
      const entity = await lookupBusinessEntity(analysis.opposingParty.name, analysis.state)
      if (entity) {
        analysis.opposingParty.legalName = entity.legalName
        analysis.opposingParty.registeredAgent = entity.registeredAgent ?? undefined
        analysis.opposingParty.entityType = entity.entityType
        analysis.opposingParty.entityStatus = entity.status
      }
    }

    return NextResponse.json({ analysis })
  } catch (err) {
    console.error('Quick Resolve analyze error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
