import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { validateAIInput } from '@/lib/ai/input-validation'

export const maxDuration = 15

const VALID_TYPES = new Set([
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'contract',
  'property',
  'real_estate',
  'business',
  'family',
  'small_claims',
  'other',
])

const SYSTEM_PROMPT = `You are a legal intake classifier. Given a user's description of their dispute, return a JSON object with:
- "primary": the single best matching dispute type
- "reasoning": 1-2 sentence plain English explanation (e.g. "This sounds like a personal injury claim because...")
- "confidence": "high", "medium", or "low"
- "secondary": array of 0-2 additional types that may also apply (omit or use [] if none)

Valid dispute types:
- "debt_collection": money owed, credit card debt, someone owes you money, debt collector contacting you
- "landlord_tenant": rent, lease, eviction, security deposit, repairs, habitability
- "personal_injury": accidents, injuries, fire damage to belongings, vehicle damage from negligence, slip and fall, product malfunction causing harm
- "contract": breach of written or oral agreement, broken promise, services not delivered
- "property": land ownership, boundary disputes, title disputes
- "real_estate": real estate transactions, liens, deed issues, closing disputes
- "business": business partnership disputes, employment, commercial contracts, IP
- "family": divorce, custody, child support, protective orders, domestic matters
- "small_claims": general money dispute under the small claims limit that doesn't fit above
- "other": truly doesn't fit any category above

Return only the JSON object. No explanation outside the JSON.`

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase,
      user.id,
      'ai',
      RATE_LIMITS.ai.maxRequests,
      RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const { description } = body

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 })
    }

    const inputCheck = validateAIInput(description)
    if (!inputCheck.safe) {
      return NextResponse.json({ error: inputCheck.reason }, { status: 400 })
    }

    const { content: raw } = await aiClient.complete({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `Classify this dispute: "${description.trim().slice(0, 1000)}"`,
      temperature: 0.1,
      maxTokens: 250,
      jsonMode: true,
      caller: 'classify-dispute',
    })

    let parsed: { primary?: string; reasoning?: string; confidence?: string; secondary?: unknown[] }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Classification failed' }, { status: 502 })
    }

    if (!parsed.primary || !VALID_TYPES.has(parsed.primary)) {
      return NextResponse.json({ error: 'Classification failed' }, { status: 502 })
    }

    const secondary = (Array.isArray(parsed.secondary) ? parsed.secondary : [])
      .filter((t): t is string => typeof t === 'string' && VALID_TYPES.has(t) && t !== parsed.primary)
      .slice(0, 2)

    return NextResponse.json({
      primary: parsed.primary,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence ?? '') ? parsed.confidence : 'medium',
      secondary,
    })
  } catch (err) {
    console.error('classify-dispute error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
