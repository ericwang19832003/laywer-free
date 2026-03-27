import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { storyInputSchema } from '@lawyer-free/shared/schemas/quick-resolve'
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt, parseAnalysisResult } from '@/lib/ai/story-analysis'
import { lookupBusinessEntity } from '@/lib/entity-lookup/opencorporates'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { validateAIInput } from '@/lib/ai/input-validation'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const parsed = storyInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Prompt injection check
    const inputCheck = validateAIInput(parsed.data.story)
    if (!inputCheck.safe) {
      return NextResponse.json({ error: inputCheck.reason }, { status: 400 })
    }

    const { content: raw } = await aiClient.complete({
      systemPrompt: buildAnalysisSystemPrompt(),
      userPrompt: buildAnalysisUserPrompt(parsed.data.story),
      temperature: 0.2,
      maxTokens: 500,
      jsonMode: true,
      caller: 'quick-resolve-analyze',
    })

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
