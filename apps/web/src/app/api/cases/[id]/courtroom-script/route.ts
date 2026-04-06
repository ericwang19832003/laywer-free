import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { isStrategySafe } from '@/lib/ai/strategy-recommendations'
import { aiClient } from '@/lib/ai/client'
import { z } from 'zod'
import { validateAIInput } from '@/lib/ai/input-validation'

const courtroomScriptSchema = z.object({
  steps: z.array(z.object({
    phase: z.string().max(100),
    instruction: z.string().max(300),
    tip: z.string().max(300),
  })).min(1).max(20),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    // Check cache first
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content')
      .eq('case_id', caseId)
      .eq('cache_key', 'courtroom_script')
      .maybeSingle()

    if (cached) return NextResponse.json({ script: cached.content })

    // Get case details
    const { data: caseData } = await supabase
      .from('cases')
      .select('dispute_type, court_type, county, state')
      .eq('id', caseId)
      .single()

    if (!caseData) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

    // Prompt injection check on case data that will be interpolated into the prompt
    const disputeText = caseData.dispute_type ?? ''
    const stateText = caseData.state ?? ''
    for (const [field, value] of Object.entries({ dispute_type: disputeText, state: stateText })) {
      if (value) {
        const check = validateAIInput(value)
        if (!check.safe) {
          return NextResponse.json({ error: `${field}: ${check.reason}` }, { status: 400 })
        }
      }
    }

    // Get evidence summary
    const { count: evidenceCount } = await supabase
      .from('evidence_items')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', caseId)

    const userPrompt = `Create a step-by-step courtroom script for a self-represented litigant in a ${caseData.dispute_type.replace(/_/g, ' ')} case in ${caseData.state ?? 'Texas'}, ${caseData.court_type?.replace(/_/g, ' ') ?? 'county'} court. They have ${evidenceCount ?? 0} evidence items.

Return a JSON object with this structure:
{
  "steps": [
    { "phase": "Arrival", "instruction": "...", "tip": "..." },
    { "phase": "Check In", "instruction": "...", "tip": "..." },
    ...
  ]
}

Include phases: Arrival, Check In, Opening Statement, Presenting Evidence, Cross-Examination, Closing Statement, Awaiting Decision. Keep each instruction under 50 words. Make tips practical and encouraging.`

    const { raw: text } = await aiClient.complete({
      systemPrompt: 'You are a helpful assistant that generates courtroom preparation scripts in JSON format.',
      userPrompt,
      maxTokens: 1500,
      jsonMode: true,
      caller: 'courtroom-script',
    })
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const validated = courtroomScriptSchema.safeParse(parsed)
    if (!validated.success) {
      return NextResponse.json({ error: 'AI response did not match expected schema' }, { status: 500 })
    }

    // Safety check — block phrases that sound like legal advice
    const allText = validated.data.steps.map((s) => `${s.instruction} ${s.tip}`).join(' ')
    if (!isStrategySafe(allText)) {
      return NextResponse.json({ error: 'AI response failed safety check' }, { status: 500 })
    }

    const script = validated.data

    // Cache the result
    await supabase.from('ai_cache').upsert({
      case_id: caseId,
      cache_key: 'courtroom_script',
      content: script,
    }, { onConflict: 'case_id,cache_key' })

    return NextResponse.json({ script })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
