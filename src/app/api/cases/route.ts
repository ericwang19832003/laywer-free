import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createCaseSchema } from '@/lib/schemas/case'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const body = await request.json()
    const parsed = createCaseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const {
      role, county, court_type, dispute_type, state,
      family_sub_type, small_claims_sub_type, landlord_tenant_sub_type,
      debt_sub_type, pi_sub_type, business_sub_type, contract_sub_type,
      property_sub_type, other_sub_type, re_sub_type,
    } = parsed.data

    // Atomic case + detail creation via database transaction
    const { data: caseId, error: rpcError } = await supabase.rpc('create_case_atomic', {
      p_role: role,
      p_county: county ?? null,
      p_court_type: court_type ?? null,
      p_dispute_type: dispute_type ?? null,
      p_state: state ?? 'Texas',
      p_family_sub_type: family_sub_type ?? null,
      p_small_claims_sub_type: small_claims_sub_type ?? null,
      p_landlord_tenant_sub_type: landlord_tenant_sub_type ?? null,
      p_debt_sub_type: debt_sub_type ?? null,
      p_pi_sub_type: pi_sub_type ?? null,
      p_business_sub_type: business_sub_type ?? null,
      p_contract_sub_type: contract_sub_type ?? null,
      p_property_sub_type: property_sub_type ?? null,
      p_other_sub_type: other_sub_type ?? null,
      p_re_sub_type: re_sub_type ?? null,
    })

    if (rpcError) {
      const status = rpcError.message.includes('required') ? 422 : 500
      return NextResponse.json(
        { error: 'Failed to create case', details: rpcError.message },
        { status }
      )
    }

    // Fetch the created case
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .select()
      .eq('id', caseId)
      .single()

    if (caseError) {
      return NextResponse.json(
        { error: 'Case created but failed to fetch', details: caseError.message },
        { status: 500 }
      )
    }

    // Fetch auto-created tasks (created by the seed_case_tasks trigger)
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select()
      .eq('case_id', caseId)
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

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const cursor = searchParams.get('cursor')

    // Backward compatible: no limit/cursor returns all cases
    if (!limitParam && !cursor) {
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
    }

    const limit = Math.min(Math.max(parseInt(limitParam || '12', 10), 1), 50)

    // If cursor provided, look up its created_at to paginate from
    let cursorDate: string | null = null
    if (cursor) {
      const { data: cursorCase } = await supabase
        .from('cases')
        .select('created_at')
        .eq('id', cursor)
        .single()
      cursorDate = cursorCase?.created_at ?? null
    }

    let query = supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit + 1) // fetch one extra to detect hasMore

    if (cursorDate) {
      query = query.lt('created_at', cursorDate)
    }

    const { data: cases, error: casesError, count } = await query

    if (casesError) {
      return NextResponse.json(
        { error: 'Failed to fetch cases', details: casesError.message },
        { status: 500 }
      )
    }

    const allFetched = cases ?? []
    const hasMore = allFetched.length > limit
    const pageCases = hasMore ? allFetched.slice(0, limit) : allFetched
    const nextCursor = hasMore ? pageCases[pageCases.length - 1]?.id ?? null : null

    return NextResponse.json({
      cases: pageCases,
      nextCursor,
      hasMore,
      totalCount: count ?? 0,
    })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
