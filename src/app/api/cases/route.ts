import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createCaseSchema } from '@/lib/schemas/case'

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = createCaseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { role, county, court_type, dispute_type, family_sub_type, small_claims_sub_type, landlord_tenant_sub_type } = parsed.data

    // Insert the case
    const { data: newCase, error: caseError } = await supabase!
      .from('cases')
      .insert({
        user_id: user!.id,
        role,
        county,
        court_type,
        dispute_type,
      })
      .select()
      .single()

    if (caseError) {
      return NextResponse.json(
        { error: 'Failed to create case', details: caseError.message },
        { status: 500 }
      )
    }

    // Insert family case details if this is a family case
    if (family_sub_type) {
      const { error: familyError } = await supabase!
        .from('family_case_details')
        .insert({
          case_id: newCase.id,
          family_sub_type,
          domestic_violence_flag: family_sub_type === 'protective_order',
        })

      if (familyError) {
        return NextResponse.json(
          { error: 'Case created but failed to save family details', details: familyError.message },
          { status: 500 }
        )
      }
    }

    // Insert small claims details if this is a small claims case
    if (small_claims_sub_type) {
      const { error: smallClaimsError } = await supabase!
        .from('small_claims_details')
        .insert({
          case_id: newCase.id,
          claim_sub_type: small_claims_sub_type,
        })

      if (smallClaimsError) {
        return NextResponse.json(
          { error: 'Case created but failed to save small claims details', details: smallClaimsError.message },
          { status: 500 }
        )
      }
    }

    // Insert landlord-tenant details if this is a landlord-tenant case
    if (landlord_tenant_sub_type) {
      const { error: ltError } = await supabase!
        .from('landlord_tenant_details')
        .insert({
          case_id: newCase.id,
          landlord_tenant_sub_type,
          party_role: role === 'plaintiff' ? 'landlord' : 'tenant',
        })

      if (ltError) {
        return NextResponse.json(
          { error: 'Case created but failed to save landlord-tenant details', details: ltError.message },
          { status: 500 }
        )
      }
    }

    // Fetch auto-created tasks (created by the seed_case_tasks trigger)
    const { data: tasks, error: tasksError } = await supabase!
      .from('tasks')
      .select()
      .eq('case_id', newCase.id)
      .order('created_at', { ascending: true })

    if (tasksError) {
      return NextResponse.json(
        { error: 'Case created but failed to fetch tasks', details: tasksError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ case: newCase, tasks }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { data: cases, error: casesError } = await supabase!
      .from('cases')
      .select()
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (casesError) {
      return NextResponse.json(
        { error: 'Failed to fetch cases', details: casesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ cases })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
