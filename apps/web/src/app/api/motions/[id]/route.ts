import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

const updateMotionSchema = z.object({
  status: z.enum(['draft', 'finalized', 'filed']).optional(),
  facts: z.record(z.string(), z.unknown()).optional(),
  draft_text: z.string().nullable().optional(),
  final_text: z.string().nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: motionId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = updateMotionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // First, read the motion to get its case_id for scoped access
    const { data: existing, error: fetchError } = await supabase
      .from('motions')
      .select('id, case_id')
      .eq('id', motionId)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Motion not found' },
        { status: 404 }
      )
    }

    // Update scoped by both motion id and case_id
    const { data: motion, error: updateError } = await supabase
      .from('motions')
      .update(parsed.data)
      .eq('id', motionId)
      .eq('case_id', existing.case_id)
      .select()
      .single()

    if (updateError || !motion) {
      return NextResponse.json(
        { error: 'Motion not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({ motion })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
