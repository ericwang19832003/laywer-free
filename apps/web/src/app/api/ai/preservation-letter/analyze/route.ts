import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  aiPreservationLetterAnalyzeRequestSchema,
  aiPreservationLetterAnalyzeResponseSchema,
} from '@lawyer-free/shared/schemas/ai-preservation-letter-analyze'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { validateAIInput } from '@/lib/ai/input-validation'

const SYSTEM_PROMPT = `You are a legal case analyst. Analyze the civil dispute and output a structured JSON case profile for generating a litigation hold letter.

OUTPUT JSON:
{
  "defendant_type": "Precise entity type — be specific (e.g. 'residential property management company', 'commercial trucking carrier', 'health insurance company', 'debt collection agency', 'parking enforcement operator', 'general contractor')",
  "defendant_systems": ["8-12 specific platforms, databases, or data sources this entity type operates that contain relevant evidence. Name real platforms where applicable: 'Entrata/RealPage property management platform', 'DocuSign e-signature audit trail', 'Epic EHR system', 'Salesforce CRM', 'ALPR/LPR camera system', 'ELD telematics device'. Draw on your knowledge of the industry's actual technology stack."],
  "deletion_risks": ["3-6 data types at this entity that auto-delete on a schedule — the most urgent preservation risks. Include approximate retention: 'E-signature platform session logs — may be overwritten within 30 days', 'Video surveillance footage — typically purged every 7-30 days', 'ELD telematics data — FMCSR minimum 6 months but some systems purge sooner'"],
  "suggested_claims": ["3-6 legal claims most applicable based on the case facts — use standard legal claim names"],
  "case_context": "1-2 sentences in formal legal language summarizing the core dispute and identifying why evidence is at urgent risk of deletion"
}

Rules:
- Be specific about platforms — generic descriptions like 'company database' are not acceptable
- Draw on your full knowledge of industry software systems, even if not mentioned in the case summary
- Do not invent facts not stated in the case description
- Output valid JSON only`

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase, user } = auth

  const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

  try {
    const body = await request.json()
    const parsed = aiPreservationLetterAnalyzeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 422 })
    }

    const { summary, opponent_name, defendant_description } = parsed.data

    for (const [field, value] of [
      ['summary', summary],
      ['opponent_name', opponent_name ?? ''],
      ['defendant_description', defendant_description ?? ''],
    ] as const) {
      if (!value) continue
      const check = validateAIInput(value)
      if (!check.safe) {
        return NextResponse.json({ error: `${field}: ${check.reason}` }, { status: 400 })
      }
    }

    const parts: string[] = [`Case summary: ${summary}`]
    if (opponent_name) parts.push(`Opponent/defendant name: ${opponent_name}`)
    if (defendant_description) parts.push(`User describes the defendant as: ${defendant_description}`)

    const { raw } = await aiClient.complete({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: parts.join('\n'),
      temperature: 0.2,
      jsonMode: true,
      caller: 'preservation-letter-analyze',
    })

    let aiOutput: unknown
    try {
      aiOutput = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 502 })
    }

    const validated = aiPreservationLetterAnalyzeResponseSchema.safeParse(aiOutput)
    if (!validated.success) {
      return NextResponse.json({ error: 'AI output failed validation' }, { status: 502 })
    }

    return NextResponse.json(validated.data)
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
