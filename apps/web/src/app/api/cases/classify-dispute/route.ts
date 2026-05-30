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

// Card IDs that exist in the UI (some types have multiple cards)
const VALID_CARD_IDS = new Set([
  'debt_collection',
  'landlord_tenant',
  'personal_injury',
  'property_damage',
  'contract',
  'business',
  'property',
  'real_estate',
  'family',
  'small_claims',
  'other',
])

const SYSTEM_PROMPT = `You are a legal intake classifier. Given a user's description of their dispute, return a JSON object with exactly these fields:
- "primary": dispute type (see list A)
- "card_id": UI card to highlight (see list B — this is the most important field)
- "reasoning": 1-2 sentences explaining what happened and why this category fits
- "confidence": "high", "medium", or "low"
- "secondary": array of 0-2 other types that may also apply (use [] if none)

LIST A — primary dispute types:
- "debt_collection": money owed, credit cards, debt collectors
- "landlord_tenant": rent, lease, eviction, deposit, repairs
- "personal_injury": harm caused by someone else's fault (covers both bodily injury AND property damage from negligence)
- "contract": broken agreement, services not delivered
- "property": land ownership, boundary, title
- "real_estate": real estate transactions, liens, deeds
- "business": business partnerships, employment, commercial
- "family": divorce, custody, child support
- "small_claims": general money dispute that doesn't fit above
- "other": truly doesn't fit

LIST B — card_id (pick the single most accurate card):
- "personal_injury": a PERSON was physically hurt (bodily injury, pain, medical bills, physical harm to the body)
- "property_damage": belongings, vehicles, or property were DAMAGED or DESTROYED — even by fire, accident, or negligence — but NO person was physically injured; set primary to "personal_injury"
- "debt_collection", "landlord_tenant", "contract", "business", "property", "real_estate", "family", "small_claims", "other": same as primary

CRITICAL RULE: Use card_id "property_damage" (NOT "personal_injury") whenever:
- Items/belongings were damaged or destroyed (fire, flood, car accident, etc.)
- Property damage occurred but no person suffered bodily injury

Use card_id "personal_injury" ONLY when a person's body was hurt.

Examples:
- "Rented a truck, it caught fire, my belongings were destroyed" → card_id: "property_damage", primary: "personal_injury"
- "Slipped and fell at a store, broke my arm" → card_id: "personal_injury", primary: "personal_injury"
- "Car hit mine, my car is totaled but I'm fine" → card_id: "property_damage", primary: "personal_injury"
- "Landlord kept my deposit" → card_id: "landlord_tenant", primary: "landlord_tenant"

Return only the JSON object.`

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

    let parsed: { primary?: string; card_id?: string; reasoning?: string; confidence?: string; secondary?: unknown[] }
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

    const cardId =
      typeof parsed.card_id === 'string' && VALID_CARD_IDS.has(parsed.card_id)
        ? parsed.card_id
        : parsed.primary

    return NextResponse.json({
      primary: parsed.primary,
      card_id: cardId,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence ?? '') ? parsed.confidence : 'medium',
      secondary,
    })
  } catch (err) {
    console.error('classify-dispute error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
