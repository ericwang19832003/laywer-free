import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { courtDocumentSchema } from '@/lib/schemas/court-document'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const doc_type = formData.get('doc_type') as string | null
    const sha256 = formData.get('sha256') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 422 }
      )
    }

    // Validate metadata via Zod schema
    const parsed = courtDocumentSchema.safeParse({
      doc_type,
      file_name: file.name,
      mime_type: file.type,
      sha256,
      file_size: file.size,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

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

    // Upload file to Storage
    const fileId = crypto.randomUUID()
    const storagePath = `cases/${caseId}/court-docs/${fileId}`

    const { error: uploadError } = await supabase!.storage
      .from('case-documents')
      .upload(storagePath, file, {
        contentType: parsed.data.mime_type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    // Insert court_documents row
    const { data: document, error: insertError } = await supabase!
      .from('court_documents')
      .insert({
        case_id: caseId,
        doc_type: parsed.data.doc_type,
        storage_path: storagePath,
        file_name: parsed.data.file_name,
        mime_type: parsed.data.mime_type,
        sha256: parsed.data.sha256,
        uploaded_by: user!.id,
      })
      .select()
      .single()

    if (insertError) {
      // Cleanup: remove uploaded file on DB insert failure
      await supabase!.storage
        .from('case-documents')
        .remove([storagePath])

      return NextResponse.json(
        { error: 'Failed to save document record', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'court_document_uploaded',
      payload: {
        document_id: document.id,
        doc_type: parsed.data.doc_type,
        file_name: parsed.data.file_name,
        mime_type: parsed.data.mime_type,
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
