import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { z } from 'zod'

const injectTasksSchema = z.object({
  task_keys: z.array(z.string().min(1)).min(1).max(10),
  insert_after: z.string().min(1),
  incident_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format').optional(),
  gov_entity_type: z.enum(['city', 'county', 'state', 'federal']).optional(),
}).strict()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    // Verify case ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    if (caseData.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = injectTasksSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { task_keys, insert_after, incident_date, gov_entity_type } = parsed.data

    const { error: rpcError } = await supabase.rpc('inject_conditional_tasks', {
      p_case_id: caseId,
      p_task_keys: task_keys,
      p_insert_after: insert_after,
      p_incident_date: incident_date ?? null,
      p_gov_entity_type: gov_entity_type ?? null,
    })

    if (rpcError) {
      const status = rpcError.message.includes('unauthorized') ? 403 : 500
      return NextResponse.json(
        { error: 'Failed to inject tasks', details: rpcError.message },
        { status }
      )
    }

    return NextResponse.json({ success: true, injected: task_keys })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
