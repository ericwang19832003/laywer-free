import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { safeEquals } from '@/lib/security/timing-safe'

export const maxDuration = 60

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (!safeEquals(authHeader ?? '', `Bearer ${process.env.CRON_SECRET ?? ''}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  // Find delivered letters older than 14 days where case has no outcome
  const { data: deliveries, error } = await supabase
    .from('demand_letter_deliveries')
    .select('id, case_id, recipient_name, delivered_at')
    .eq('status', 'delivered')
    .lte('delivered_at', fourteenDaysAgo)

  if (error || !deliveries?.length) {
    return NextResponse.json({ processed: 0 })
  }

  const caseIds = deliveries.map(d => d.case_id)

  // Check which cases already have an outcome recorded
  const { data: casesWithOutcome } = await supabase
    .from('cases')
    .select('id, outcome')
    .in('id', caseIds)
    .not('outcome', 'is', null)

  const resolvedCaseIds = new Set((casesWithOutcome ?? []).map(c => c.id))

  // Filter to only unresolved cases
  const unresolvedDeliveries = deliveries.filter(d => !resolvedCaseIds.has(d.case_id))

  if (unresolvedDeliveries.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  // Create notification for each unresolved case
  let notified = 0
  for (const delivery of unresolvedDeliveries) {
    // Get the case owner
    const { data: caseRow } = await supabase
      .from('cases')
      .select('user_id')
      .eq('id', delivery.case_id)
      .single()

    if (!caseRow) continue

    // Check if we already sent a follow-up notification for this delivery
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', caseRow.user_id)
      .eq('kind', 'demand_followup')
      .eq('payload->>delivery_id', delivery.id)
      .maybeSingle()

    if (existing) continue

    await supabase.from('notifications').insert({
      user_id: caseRow.user_id,
      kind: 'demand_followup',
      title: 'Your demand letter was delivered',
      body: `Your letter to ${delivery.recipient_name} was delivered ${Math.round((Date.now() - new Date(delivery.delivered_at!).getTime()) / 86400000)} days ago. Did they respond?`,
      payload: {
        delivery_id: delivery.id,
        case_id: delivery.case_id,
        actions: ['resolved', 'no_response', 'rejected'],
      },
    })

    notified++
  }

  return NextResponse.json({ processed: unresolvedDeliveries.length, notified })
}
