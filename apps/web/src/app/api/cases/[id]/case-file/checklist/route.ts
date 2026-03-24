import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { buildStaticChecklist } from '@/lib/ai/evidence-checklist'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    // Fetch case details needed for checklist generation
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('dispute_type, state, role')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      )
    }

    // Delete existing checklist for this case (supports refresh)
    await supabase
      .from('case_file_checklist_items')
      .delete()
      .eq('checklist_id', caseId)

    await supabase
      .from('case_file_checklists')
      .delete()
      .eq('case_id', caseId)

    // Generate checklist items from static rules
    const { items } = buildStaticChecklist({
      dispute_type: caseData.dispute_type,
    })

    // Insert the checklist header
    const { data: checklist, error: checklistError } = await supabase
      .from('case_file_checklists')
      .insert({
        case_id: caseId,
        model: 'static',
      })
      .select()
      .single()

    if (checklistError || !checklist) {
      return NextResponse.json(
        { error: 'Failed to create checklist', details: checklistError?.message },
        { status: 500 }
      )
    }

    // Insert checklist items with sort_order
    const rows = items.map((item, index) => ({
      checklist_id: checklist.id,
      label: item.label,
      category: item.category,
      sort_order: index,
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from('case_file_checklist_items')
      .insert(rows)
      .select()

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to create checklist items', details: itemsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { checklist: { ...checklist, items: insertedItems } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
