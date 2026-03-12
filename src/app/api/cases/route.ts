import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createCaseSchema } from '@/lib/schemas/case'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const body = await request.json()
    const parsed = createCaseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { role, county, court_type, dispute_type, family_sub_type, small_claims_sub_type, landlord_tenant_sub_type, debt_sub_type, pi_sub_type, contract_sub_type, property_sub_type, other_sub_type, state } = parsed.data

    // Insert the case
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        user_id: user.id,
        role,
        county,
        court_type,
        dispute_type,
        state,
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
      const { error: familyError } = await supabase
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
      const { error: smallClaimsError } = await supabase
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
      const { error: ltError } = await supabase
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

    // Insert debt defense details if this is a debt collection defendant case
    if (debt_sub_type && role === 'defendant') {
      const { error: debtError } = await supabase
        .from('debt_defense_details')
        .insert({
          case_id: newCase.id,
          debt_sub_type,
        })

      if (debtError) {
        return NextResponse.json(
          { error: 'Case created but failed to save debt defense details', details: debtError.message },
          { status: 500 }
        )
      }
    }

    // Insert personal injury details if this is a PI case
    if (pi_sub_type) {
      const { error: piError } = await supabase
        .from('personal_injury_details')
        .insert({
          case_id: newCase.id,
          pi_sub_type,
        })

      if (piError) {
        return NextResponse.json(
          { error: 'Case created but failed to save personal injury details', details: piError.message },
          { status: 500 }
        )
      }
    }

    // Insert contract details if this is a contract case
    if (contract_sub_type) {
      const { error: contractError } = await supabase
        .from('contract_details')
        .insert({
          case_id: newCase.id,
          contract_sub_type,
        })

      if (contractError) {
        return NextResponse.json(
          { error: 'Case created but failed to save contract details', details: contractError.message },
          { status: 500 }
        )
      }
    }

    // Insert property dispute details if this is a property case
    if (property_sub_type) {
      const { error: propertyError } = await supabase
        .from('property_dispute_details')
        .insert({
          case_id: newCase.id,
          property_sub_type,
        })

      if (propertyError) {
        return NextResponse.json(
          { error: 'Case created but failed to save property dispute details', details: propertyError.message },
          { status: 500 }
        )
      }
    }

    // Insert other case details if this is an other case
    if (other_sub_type) {
      const { error: otherError } = await supabase
        .from('other_case_details')
        .insert({
          case_id: newCase.id,
          other_sub_type,
        })

      if (otherError) {
        return NextResponse.json(
          { error: 'Case created but failed to save other case details', details: otherError.message },
          { status: 500 }
        )
      }
    }

    // Fetch auto-created tasks (created by the seed_case_tasks trigger)
    const { data: tasks, error: tasksError } = await supabase
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
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: cases, error: casesError } = await supabase
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
