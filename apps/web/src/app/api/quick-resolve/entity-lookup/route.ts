import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { entityLookupSchema } from '@lawyer-free/shared/schemas/quick-resolve'
import { lookupBusinessEntity } from '@/lib/entity-lookup/opencorporates'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const parsed = entityLookupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const result = await lookupBusinessEntity(parsed.data.name, parsed.data.state)

    return NextResponse.json({ entity: result })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
