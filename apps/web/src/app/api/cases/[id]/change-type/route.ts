import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { z } from 'zod'

const schema = z.object({
  new_type: z.enum([
    'personal_injury', 'landlord_tenant', 'small_claims', 'family',
    'business', 'debt_collection', 'contract', 'property',
    'real_estate', 'other',
  ]),
  family_sub_type: z.string().optional(),
  business_sub_type: z.string().optional(),
  lt_sub_type: z.string().optional(),
  pi_sub_type: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { new_type, family_sub_type, business_sub_type, lt_sub_type, pi_sub_type } = parsed.data

    const { data: newCaseId, error } = await supabase.rpc('change_case_type', {
      p_case_id: id,
      p_new_type: new_type,
      p_family_sub_type: family_sub_type ?? null,
      p_business_sub_type: business_sub_type ?? null,
      p_lt_sub_type: lt_sub_type ?? null,
      p_pi_sub_type: pi_sub_type ?? null,
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to change case type', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ new_case_id: newCaseId })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
