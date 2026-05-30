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

const SYSTEM_PROMPT = `You are a legal intake classifier. Given a user's description of their dispute, return a JSON object with:
- "primary": the single best matching dispute type
- "card_id": the specific UI card to highlight (see card list below)
- "reasoning": 1-2 sentence plain English explanation starting with "This looks like a [card label] case because..."
- "confidence": "high", "medium", or "low"
- "secondary": array of 0-2 additional dispute types that may also apply (omit or use [] if none)

Valid dispute types for "primary":
- "debt_collection": money owed, credit card debt, someone owes you money, debt collector contacting you
- "landlord_tenant": rent, lease, eviction, security deposit, repairs, habitability
- "personal_injury": ANY injury or damage caused by someone else's negligence or fault
- "contract": breach of written or oral agreement, broken promise, services not delivered
- "property": land ownership, boundary disputes, title disputes
- "real_estate": real estate transactions, liens, deed issues, closing disputes
- "business": business partnership disputes, employment, commercial contracts, IP
- "family": divorce, custody, child support, protective orders, domestic matters
- "small_claims": general money dispute under the small claims limit that doesn't fit above
- "other": truly doesn't fit any category above

Card IDs for "card_id" (choose the most specific):
- "debt_collection" — debt, money owed, credit card lawsuit
- "landlord_tenant" — landlord/tenant disputes
- "personal_injury" — physical injury to a person (bodily harm, pain and suffering)
- "property_damage" — damage to property or belongings (fire, accident, vandalism) WITHOUT physical injury to a person; primary must be "personal_injury"
- "contract" — contract/agreement disputes
- "business" — business disputes
- "property" — land/boundary/title
- "real_estate" — real estate transactions
- "family" — family law
- "small_claims" — small claims
- "other" — other

Examples:
- Truck fire destroyed belongings → primary: "personal_injury", card_id: "property_damage"
- Car accident injury → primary: "personal_injury", card_id: "personal_injury"
- Landlord won't return deposit → primary: "landlord_tenant", card_id: "landlord_tenant"

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
