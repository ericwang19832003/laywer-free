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
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = updateMotionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { data: motion, error: updateError } = await supabase!
      .from('motions')
      .update(parsed.data)
      .eq('id', motionId)
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
