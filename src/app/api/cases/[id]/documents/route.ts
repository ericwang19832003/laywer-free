import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createDocumentSchema } from '@/lib/schemas/document'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = createDocumentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { task_id, doc_type, content_text, sha256, metadata } = parsed.data

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

    // Determine next version number
    const { data: existing } = await supabase!
      .from('documents')
      .select('version')
      .eq('case_id', caseId)
      .eq('doc_type', doc_type)
      .order('version', { ascending: false })
      .limit(1)

    const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

    // Insert document
    const { data: doc, error: docError } = await supabase!
      .from('documents')
      .insert({
        case_id: caseId,
        task_id: task_id ?? null,
        doc_type,
        version: nextVersion,
        status: 'draft',
        content_text,
        sha256,
        metadata: metadata ?? {},
      })
      .select()
      .single()

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Failed to create document', details: docError?.message },
        { status: 500 }
      )
    }

    // Write timeline events
    await supabase!.from('task_events').insert([
      {
        case_id: caseId,
        task_id: task_id ?? null,
        kind: 'preservation_letter_draft_generated',
        payload: { document_id: doc.id, version: nextVersion, doc_type, generator: metadata?.generator ?? 'template' },
      },
      {
        case_id: caseId,
        task_id: task_id ?? null,
        kind: 'preservation_letter_draft_saved',
        payload: { document_id: doc.id, version: nextVersion, sha256 },
      },
    ])

    return NextResponse.json({ document: doc }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
