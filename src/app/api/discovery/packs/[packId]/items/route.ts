import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { addItemSchema } from '@/lib/schemas/discovery'
import { generateDiscoveryText, PromptLintError } from '@/lib/discovery/templates'

export const runtime = 'nodejs'

// POST /api/discovery/packs/:packId/items — add a discovery item
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = addItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Fetch pack to verify access and get case_id (RLS handles ownership)
    const { data: pack, error: packError } = await supabase!
      .from('discovery_packs')
      .select('id, case_id, status')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Discovery pack not found' }, { status: 404 })
    }

    if (pack.status !== 'draft') {
      return NextResponse.json(
        { error: 'Cannot add items to a pack that is not in draft status' },
        { status: 409 }
      )
    }

    // Generate next item_no per type within this pack
    const { data: maxRow } = await supabase!
      .from('discovery_items')
      .select('item_no')
      .eq('pack_id', packId)
      .eq('item_type', parsed.data.item_type)
      .order('item_no', { ascending: false })
      .limit(1)
      .maybeSingle()

    const nextItemNo = (maxRow?.item_no ?? 0) + 1

    // Generate formal legal text from template (runs lint internally)
    let generatedText: string
    let warnings: { severity: string; message: string }[] = []
    try {
      const result = generateDiscoveryText(
        parsed.data.item_type,
        nextItemNo,
        parsed.data.prompt_text
      )
      generatedText = result.generatedText
      warnings = result.warnings
    } catch (err) {
      if (err instanceof PromptLintError) {
        return NextResponse.json(
          { error: 'Prompt text failed validation', details: err.issues },
          { status: 422 }
        )
      }
      throw err
    }

    const { data: item, error: insertError } = await supabase!
      .from('discovery_items')
      .insert({
        pack_id: packId,
        item_type: parsed.data.item_type,
        item_no: nextItemNo,
        prompt_text: parsed.data.prompt_text,
        generated_text: generatedText,
      })
      .select()
      .single()

    if (insertError) {
      // Handle unique constraint violation from concurrent requests
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Duplicate item number — please retry' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to add discovery item', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: pack.case_id,
      kind: 'discovery_item_added',
      payload: {
        pack_id: packId,
        item_id: item.id,
        item_type: parsed.data.item_type,
        item_no: nextItemNo,
      },
    })

    return NextResponse.json(
      { item, ...(warnings.length > 0 ? { warnings } : {}) },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
