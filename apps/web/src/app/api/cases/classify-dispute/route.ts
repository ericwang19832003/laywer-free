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

// Valid sub-type values per card_id — used to validate AI suggestions
const VALID_SUB_TYPES_BY_CARD: Record<string, Set<string>> = {
  personal_injury: new Set(['auto_accident', 'pedestrian_cyclist', 'rideshare', 'uninsured_motorist', 'slip_and_fall', 'dog_bite', 'product_liability', 'other_injury']),
  property_damage: new Set(['vehicle_damage', 'property_damage_negligence', 'vandalism', 'other_property_damage']),
  landlord_tenant: new Set(['eviction', 'nonpayment', 'security_deposit', 'property_damage', 'repair_maintenance', 'lease_termination', 'habitability', 'other']),
  small_claims: new Set(['security_deposit', 'breach_of_contract', 'consumer_refund', 'property_damage', 'car_accident', 'neighbor_dispute', 'unpaid_loan', 'other']),
  family: new Set(['divorce', 'custody', 'child_support', 'visitation', 'spousal_support', 'protective_order', 'modification']),
  debt_collection: new Set(['credit_card', 'medical_bills', 'personal_loan', 'auto_loan', 'payday_loan', 'debt_buyer', 'other']),
  business: new Set(['partnership', 'employment', 'b2b_commercial']),
}

const SYSTEM_PROMPT = `You are a legal intake classifier. Given a user's description of their dispute, return a JSON object with exactly these fields:
- "primary": dispute type (see list A)
- "card_id": UI card to highlight (see list B — this is the most important field)
- "reasoning": 1-2 sentences explaining what happened and why this category fits
- "confidence": "high", "medium", or "low"
- "secondary": array of 0-2 other types that may also apply (use [] if none)
- "suggested_sub_type": most specific sub-category for the chosen type (see list C), or null if unclear
- "suggested_role": "plaintiff" or "defendant" for debt_collection only (see list D), else null

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

LIST C — suggested_sub_type (pick the best match, or null):
- card_id "personal_injury": "auto_accident" | "pedestrian_cyclist" | "rideshare" | "uninsured_motorist" | "slip_and_fall" | "dog_bite" | "product_liability" | "other_injury"
- card_id "property_damage": "vehicle_damage" | "property_damage_negligence" | "vandalism" | "other_property_damage"
- primary "landlord_tenant": "eviction" | "nonpayment" | "security_deposit" | "property_damage" | "repair_maintenance" | "lease_termination" | "habitability" | "other"
- primary "small_claims": "security_deposit" | "breach_of_contract" | "consumer_refund" | "property_damage" | "car_accident" | "neighbor_dispute" | "unpaid_loan" | "other"
- primary "family": "divorce" | "custody" | "child_support" | "visitation" | "spousal_support" | "protective_order" | "modification"
- primary "debt_collection": "credit_card" | "medical_bills" | "personal_loan" | "auto_loan" | "payday_loan" | "debt_buyer" | "other"
- primary "business": "partnership" | "employment" | "b2b_commercial"
- all other types: null

LIST D — suggested_role (debt_collection only):
- "plaintiff": the user is owed money and filing suit
- "defendant": the user is being sued for a debt
- null for all other primary types

Examples:
- "Rented a truck, it caught fire, my belongings were destroyed" → card_id: "property_damage", primary: "personal_injury", suggested_sub_type: "other_property_damage", suggested_role: null
- "Slipped and fell at a store, broke my arm" → card_id: "personal_injury", primary: "personal_injury", suggested_sub_type: "slip_and_fall", suggested_role: null
- "Car hit mine, my car is totaled but I'm fine" → card_id: "property_damage", primary: "personal_injury", suggested_sub_type: "vehicle_damage", suggested_role: null
- "Landlord kept my deposit" → card_id: "landlord_tenant", primary: "landlord_tenant", suggested_sub_type: "security_deposit", suggested_role: null
- "Credit card company is suing me for $3000" → card_id: "debt_collection", primary: "debt_collection", suggested_sub_type: "credit_card", suggested_role: "defendant"
- "My tenant hasn't paid rent in 3 months and I need to evict them" → card_id: "landlord_tenant", primary: "landlord_tenant", suggested_sub_type: "eviction", suggested_role: null

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
      maxTokens: 350,
      jsonMode: true,
      caller: 'classify-dispute',
    })

    let parsed: { primary?: string; card_id?: string; reasoning?: string; confidence?: string; secondary?: unknown[]; suggested_sub_type?: unknown; suggested_role?: unknown }
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

    // Validate suggested_sub_type against the valid set for the resolved card_id
    const validSubTypes = VALID_SUB_TYPES_BY_CARD[cardId]
    const suggestedSubType =
      typeof parsed.suggested_sub_type === 'string' && validSubTypes?.has(parsed.suggested_sub_type)
        ? parsed.suggested_sub_type
        : null

    // Only return suggested_role for debt_collection
    const suggestedRole =
      parsed.primary === 'debt_collection' &&
      (parsed.suggested_role === 'plaintiff' || parsed.suggested_role === 'defendant')
        ? parsed.suggested_role
        : null

    return NextResponse.json({
      primary: parsed.primary,
      card_id: cardId,
      reasoning: typeof parsed.reasoning === 'string' ? parsed.reasoning : '',
      confidence: ['high', 'medium', 'low'].includes(parsed.confidence ?? '') ? parsed.confidence : 'medium',
      secondary,
      suggested_sub_type: suggestedSubType,
      suggested_role: suggestedRole,
    })
  } catch (err) {
    console.error('classify-dispute error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
