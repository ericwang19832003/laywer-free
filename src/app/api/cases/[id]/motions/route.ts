import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

const createMotionSchema = z.object({
  motion_type: z.string().min(1),
  status: z.enum(['draft', 'finalized', 'filed']).default('draft'),
  facts: z.record(z.string(), z.unknown()).default({}),
  draft_text: z.string().nullable().optional(),
  final_text: z.string().nullable().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case exists (RLS handles ownership)
    const { data: caseData, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const parsed = createMotionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { data: motion, error: insertError } = await supabase!
      .from('motions')
      .insert({ case_id: caseId, ...parsed.data })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create motion', details: insertError.message },
        { status: 500 }
      )
    }

    // Audit event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'motion_created',
      payload: {
        motion_id: motion.id,
        motion_type: parsed.data.motion_type,
      },
    })

    return NextResponse.json({ motion }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { data: motions, error } = await supabase!
      .from('motions')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to list motions', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ motions })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
