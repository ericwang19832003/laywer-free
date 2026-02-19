import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  aiPreservationLetterRequestSchema,
  aiPreservationLetterResponseSchema,
} from '@/lib/schemas/ai-preservation-letter'

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
  const { error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  // Check if OpenAI is configured
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'AI generation is not configured', fallback: true },
      { status: 503 }
    )
  }

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    })

    const raw = completion.choices[0]?.message?.content
    if (!raw) {
      return NextResponse.json(
        { error: 'AI returned empty response', fallback: true },
        { status: 502 }
      )
    }

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
