import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { servePackSchema } from '@lawyer-free/shared/schemas/discovery'
import { discoveryResponseDeadline } from '@lawyer-free/shared/rules/discovery-deadlines'


// POST /api/discovery/packs/:packId/serve — record service of discovery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = servePackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Fetch pack to verify access and get case_id (RLS handles ownership)
    const { data: pack, error: packError } = await supabase
      .from('discovery_packs')
      .select('id, case_id')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Discovery pack not found' }, { status: 404 })
    }

    const { data: log, error: insertError } = await supabase
      .from('discovery_service_logs')
      .insert({
        pack_id: packId,
        served_at: parsed.data.served_at,
        service_method: parsed.data.service_method,
        served_to_name: parsed.data.served_to_name ?? null,
        served_to_email: parsed.data.served_to_email ?? null,
        served_to_address: parsed.data.served_to_address ?? null,
        notes: parsed.data.notes ?? null,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to record service', details: insertError.message },
        { status: 500 }
      )
    }

    // Auto-create discovery response deadline (served_at + 30 days, TRCP 196.2(a))
    const responseDeadline = discoveryResponseDeadline(parsed.data.served_at)
    await supabase.from('deadlines').upsert({
      case_id: pack.case_id,
      key: `discovery_response_deadline_${packId}`,
      label: 'Discovery Response Deadline',
      due_at: responseDeadline.toISOString(),
      source: 'system',
      rationale: 'Opposing party has 30 days to respond to served discovery (TRCP 196.2(a)).',
      consequence: 'Failure to timely object may waive objections. Unanswered requests may be deemed admitted.',
      auto_generated: true,
    }, { onConflict: 'case_id,key' })

    // Write timeline event
    await supabase.from('task_events').insert({
      case_id: pack.case_id,
      kind: 'discovery_pack_served',
      payload: {
        pack_id: packId,
        service_log_id: log.id,
        service_method: parsed.data.service_method,
        served_to_name: parsed.data.served_to_name ?? null,
      },
    })

    return NextResponse.json({ service_log: log }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
