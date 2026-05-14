import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI()

const DISPUTE_TYPES = [
  'small_claims',
  'personal_injury',
  'landlord_tenant',
  'contract',
  'family',
  'debt_defense',
  'property',
  'other',
] as const

type DisputeType = (typeof DISPUTE_TYPES)[number]

const LABELS: Record<DisputeType, string> = {
  small_claims: 'Small Claims',
  personal_injury: 'Personal Injury',
  landlord_tenant: 'Landlord-Tenant',
  contract: 'Contract Dispute',
  family: 'Family Law',
  debt_defense: 'Debt Defense',
  property: 'Property Dispute',
  other: 'Other',
}

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json()

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return NextResponse.json({ error: 'Please describe your situation in more detail.' }, { status: 400 })
    }

    const trimmed = description.trim().slice(0, 1000)

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 60,
      messages: [
        {
          role: 'system',
          content: `You are a legal case classifier. Given a user's description of their legal situation, classify it into exactly one of these categories:

- small_claims: Money owed, unpaid debt, bad service, security deposits under $20k
- personal_injury: Physical injury, accidents, medical malpractice, pain and suffering
- landlord_tenant: Eviction, repairs, lease disputes, landlord issues
- contract: Breach of contract, agreement violations, business disputes, property damage caused by another party's breach
- family: Divorce, custody, child support, adoption
- debt_defense: Debt collectors, credit card debt, sued for debt
- property: Real estate, title, boundary, neighbor disputes
- other: Anything that doesn't fit above

Respond with JSON only: {"disputeType": "<type>", "confidence": "high|medium|low", "reasoning": "<one sentence>"}`
        },
        {
          role: 'user',
          content: trimmed,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''

    let parsed: { disputeType: string; confidence: string; reasoning: string }
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Classification failed. Please try again.' }, { status: 500 })
    }

    const disputeType = DISPUTE_TYPES.includes(parsed.disputeType as DisputeType)
      ? (parsed.disputeType as DisputeType)
      : 'other'

    return NextResponse.json({
      disputeType,
      label: LABELS[disputeType],
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
