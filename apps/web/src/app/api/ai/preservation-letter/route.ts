import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  aiPreservationLetterRequestSchema,
  aiPreservationLetterResponseSchema,
} from '@lawyer-free/shared/schemas/ai-preservation-letter'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { validateAIInput } from '@/lib/ai/input-validation'

const PROMPT_VERSION = '1.0.0'

const SYSTEM_PROMPT = `You are a professional letter-writing assistant. You help draft preservation letters — polite, written requests asking someone to keep documents and materials safe while a dispute is being resolved.

RULES YOU MUST FOLLOW:
- Write in plain, everyday English. No legal jargon.
- This is a REQUEST, not a demand. Never threaten consequences.
- NEVER use these words or phrases: sanctions, spoliation, contempt, court order, legal obligation, pursuant to, hereby, forthwith, litigation hold, duty to preserve.
- NEVER give legal advice or claim to be a lawyer.
- NEVER reference specific laws, statutes, or legal precedents.
- Keep the tone matched to what the user requests (polite, neutral, or firm).
- Include a disclaimer at the end: "This letter is for reference only and is not legal advice."

OUTPUT FORMAT — respond with valid JSON only:
{
  "subject": "A short email subject line",
  "body": "The full letter text with proper formatting and line breaks",
  "evidenceBullets": ["List of evidence types mentioned"],
  "disclaimers": ["List of disclaimers included in the letter"]
}`

export async function POST(request: NextRequest) {
  // Auth check
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  try {
    const body = await request.json()
    const parsed = aiPreservationLetterRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues, fallback: true },
        { status: 422 }
      )
    }

    const { summary, incident_date, evidence_categories, tone, opponent_name } = parsed.data

    // Prompt injection check on user-provided text
    const summaryCheck = validateAIInput(summary)
    if (!summaryCheck.safe) {
      return NextResponse.json(
        { error: `summary: ${summaryCheck.reason}` },
        { status: 400 }
      )
    }
    if (opponent_name) {
      const nameCheck = validateAIInput(opponent_name)
      if (!nameCheck.safe) {
        return NextResponse.json(
          { error: `opponent_name: ${nameCheck.reason}` },
          { status: 400 }
        )
      }
    }

    // Build the user prompt
    const parts: string[] = []
    parts.push(`Write a preservation letter with a ${tone} tone.`)
    if (opponent_name) parts.push(`Address it to: ${opponent_name}`)
    if (incident_date) parts.push(`The incident occurred on or around: ${incident_date}`)
    parts.push(`Summary of the situation: ${summary}`)
    if (evidence_categories.length > 0) {
      parts.push(`Types of evidence to preserve: ${evidence_categories.join(', ')}`)
    }

    const userPrompt = parts.join('\n')

    const { raw } = await aiClient.complete({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.4,
      jsonMode: true,
      caller: 'preservation-letter',
    })

    let aiOutput: unknown
    try {
      aiOutput = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid JSON', fallback: true },
        { status: 502 }
      )
    }

    const validated = aiPreservationLetterResponseSchema.safeParse(aiOutput)
    if (!validated.success) {
      return NextResponse.json(
        { error: 'AI output failed validation', fallback: true },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ...validated.data,
      _meta: {
        model: 'gpt-4o-mini',
        prompt_version: PROMPT_VERSION,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'AI generation failed', fallback: true },
      { status: 500 }
    )
  }
}
