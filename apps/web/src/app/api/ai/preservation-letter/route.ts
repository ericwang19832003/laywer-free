import { NextRequest, NextResponse } from 'next/server'
import { aiClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import {
  aiPreservationLetterRequestSchema,
  aiPreservationLetterResponseSchema,
} from '@lawyer-free/shared/schemas/ai-preservation-letter'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { validateAIInput } from '@/lib/ai/input-validation'

const PROMPT_VERSION = '2.0.0'

const SYSTEM_PROMPT = `You are a legal letter drafting assistant specializing in evidence preservation letters for pro se litigants.

Your job is to draft a formal, comprehensive preservation letter tailored to the specific incident described.

TONE RULES:
- "polite": Respectful and cooperative, but still formal. "I respectfully request that you preserve..."
- "neutral": Professional and direct. Clear, factual preservation request.
- "firm": Full formal legal language. Use: "litigation is reasonably anticipated and/or pending", "you are hereby instructed to preserve", "electronically stored information ('ESI')", "native format", "suspend any routine, automatic, or scheduled deletion, overwriting, modification, or destruction", "third-party vendors or contractors". This is a formal legal notice, not a casual request.

EVIDENCE CATEGORIES — READ THE CASE SUMMARY CAREFULLY:
The user may have checked some categories, but you must also derive case-specific categories by analyzing the incident. Think like a plaintiff's attorney: what evidence would the opposing party hold that is critical to this case?
Examples:
- Vehicle/rental incident → vehicle inspection records, maintenance/repair/service records, registration and compliance records, VIN and unit assignment records, substitution/reassignment records, internal alerts or system flags about vehicle condition, telematics or GPS data, fleet management records
- Employment → HR files, performance reviews, disciplinary records, internal communications about the employee
- Slip and fall → incident reports, maintenance logs, inspection records, security footage
- Medical → treatment records, billing records, internal communications about patient care
Always include both what the user selected AND additional case-relevant categories you derive from the summary.

LETTER STRUCTURE (use this order):
1. Today's date
2. Recipient name (or "To Whom It May Concern")
3. "Re: Notice of Anticipated Litigation and Demand to Preserve Evidence"
4. Opening paragraph: state that litigation is anticipated/pending arising from the described incident
5. Preservation demand paragraph: formal instruction to preserve all documents, data, and ESI
6. Bullet list of specific evidence categories (user-selected + case-derived)
7. ESI/scope paragraph: cover all formats, electronic systems, databases, backup media, third-party vendors; instruct to suspend routine deletion schedules
8. Written confirmation request
9. Sign-off and signature block using provided sender name/email; if no name is provided use "[Your Name]"; include "Pro Se Plaintiff / Claimant" under the name
10. Disclaimer: "This letter is for informational purposes only and is not legal advice. Consider consulting a licensed attorney before sending legal correspondence."

NEVER invent facts. Use only what is provided. Do not threaten sanctions or cite specific statutes.

OUTPUT FORMAT — respond with valid JSON only:
{
  "subject": "A short email subject line",
  "body": "The full letter text with proper formatting and line breaks",
  "evidenceBullets": ["All evidence categories listed in the letter, including case-derived ones"],
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

    // Sender info from auth metadata — included in the letter signature block
    const senderName =
      (user.user_metadata?.display_name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      null
    const senderEmail = user.email ?? null

    // Build the user prompt
    const parts: string[] = []
    parts.push(`Write a preservation letter with a ${tone} tone.`)
    if (opponent_name) parts.push(`Address it to: ${opponent_name}`)
    if (incident_date) parts.push(`The incident occurred on or around: ${incident_date}`)
    parts.push(`Summary of the situation: ${summary}`)
    if (evidence_categories.length > 0) {
      parts.push(`Evidence categories the user selected (also derive additional case-specific ones): ${evidence_categories.join(', ')}`)
    } else {
      parts.push('The user did not select specific categories — derive appropriate ones from the case summary.')
    }
    if (senderName) parts.push(`Sender name: ${senderName}`)
    if (senderEmail) parts.push(`Sender email: ${senderEmail}`)

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
