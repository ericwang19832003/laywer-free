import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  pinned: z.boolean().optional().default(false),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case ownership (RLS)
    const { data: caseRow, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { data: notes, error } = await supabase!
      .from('case_notes')
      .select('id, content, pinned, created_at, updated_at')
      .eq('case_id', caseId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notes: notes ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = createNoteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Verify case ownership
    const { data: caseRow, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { data: note, error: insertError } = await supabase!
      .from('case_notes')
      .insert({
        case_id: caseId,
        user_id: user!.id,
        content: parsed.data.content,
        pinned: parsed.data.pinned,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'note_added',
      payload: { note_id: note.id },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
