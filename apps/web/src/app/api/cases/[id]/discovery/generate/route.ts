import { NextRequest, NextResponse } from 'next/server'
import { AIClient } from '@/lib/ai/client'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'
import { incrementAiUsage } from '@/lib/subscription/check'
import { safeError } from '@/lib/security/safe-log'
import {
  discoverySuggestionSchema,
  DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
  buildDiscoverySuggestionPrompt,
  buildStaticDiscoveryPack,
} from '@/lib/ai/discovery-suggestions'

export const maxDuration = 60

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const [caseResult, evidenceResult] = await Promise.all([
      supabase
        .from('cases')
        .select('dispute_type, state, role')
        .eq('id', caseId)
        .single(),
      supabase
        .from('evidence_items')
        .select('category')
        .eq('case_id', caseId)
        .limit(20),
    ])

    if (caseResult.error || !caseResult.data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { dispute_type, state, role } = caseResult.data
    const evidenceCategories = [
      ...new Set(
        (evidenceResult.data ?? [])
          .map((e) => e.category)
          .filter((c): c is string => Boolean(c))
      ),
    ]

    let suggestion = buildStaticDiscoveryPack({ dispute_type: dispute_type ?? 'general' })

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userPrompt = buildDiscoverySuggestionPrompt({
          dispute_type: dispute_type ?? 'general',
          state: state ?? 'TX',
          role: role ?? 'plaintiff',
          evidence_categories: evidenceCategories,
        })
        const client = new AIClient({ model: 'claude-sonnet-4-6', maxRetries: 1 })
        const { raw } = await client.complete({
          systemPrompt: DISCOVERY_SUGGESTION_SYSTEM_PROMPT,
          userPrompt,
          temperature: 0.3,
          jsonMode: true,
          caller: 'discovery-generate',
        })
        if (raw) {
          const parsed = JSON.parse(raw)
          const validated = discoverySuggestionSchema.safeParse(parsed)
          if (validated.success) suggestion = validated.data
        }
      } catch (err) {
        safeError('discovery-generate', err)
      }
    }

    const counters: Record<string, number> = {}
    const numberedItems = suggestion.items.map((item) => {
      counters[item.item_type] = (counters[item.item_type] ?? 0) + 1
      return { ...item, item_no: counters[item.item_type] }
    })

    const { data: pack, error: packError } = await supabase
      .from('discovery_packs')
      .insert({
        case_id: caseId,
        title: suggestion.title,
        status: 'draft',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Failed to create discovery pack' }, { status: 500 })
    }

    await supabase.from('discovery_items').insert(
      numberedItems.map((item) => ({
        pack_id: pack.id,
        item_type: item.item_type,
        item_no: item.item_no,
        prompt_text: item.prompt_text,
      }))
    )

    await incrementAiUsage(supabase).catch(() => {})

    return NextResponse.json({
      packId: pack.id,
      title: suggestion.title,
      items: numberedItems,
    })
  } catch (err) {
    safeError('discovery-generate', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
