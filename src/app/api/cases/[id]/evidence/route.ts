import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { evidenceUploadSchema } from '@/lib/schemas/evidence'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { data, error } = await supabase!
      .from('evidence_items')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch evidence', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ evidence: data })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { evidence_id } = await request.json()
    if (!evidence_id) {
      return NextResponse.json(
        { error: 'evidence_id is required' },
        { status: 422 }
      )
    }

    // Fetch the evidence item to get storage_path (RLS ensures ownership)
    const { data: item, error: fetchError } = await supabase!
      .from('evidence_items')
      .select('id, storage_path')
      .eq('id', evidence_id)
      .eq('case_id', caseId)
      .single()

    if (fetchError || !item) {
      return NextResponse.json(
        { error: 'Evidence item not found' },
        { status: 404 }
      )
    }

    // Delete from storage first — abort if it fails to avoid orphaned files
    const { error: storageError } = await supabase!.storage
      .from('case-documents')
      .remove([item.storage_path])

    if (storageError) {
      return NextResponse.json(
        { error: 'Failed to remove file from storage', details: storageError.message },
        { status: 500 }
      )
    }

    // Delete from database
    const { error: deleteError } = await supabase!
      .from('evidence_items')
      .delete()
      .eq('id', evidence_id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete evidence', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const label = formData.get('label') as string | null
    const notes = formData.get('notes') as string | null
    const captured_at = formData.get('captured_at') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 422 }
      )
    }

    // Validate metadata via Zod schema
    const parsed = evidenceUploadSchema.safeParse({
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      label: label || undefined,
      notes: notes || undefined,
      captured_at: captured_at || undefined,
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

    // Read file buffer for SHA256 and upload
    const buffer = Buffer.from(await file.arrayBuffer())
    const sha256 = createHash('sha256').update(buffer).digest('hex')

    // Upload file to Storage
    const fileId = crypto.randomUUID()
    const storagePath = `cases/${caseId}/evidence/${fileId}`

    const { error: uploadError } = await supabase!.storage
      .from('case-documents')
      .upload(storagePath, buffer, {
        contentType: parsed.data.mime_type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    // Insert evidence_items row
    const { data: evidence, error: insertError } = await supabase!
      .from('evidence_items')
      .insert({
        case_id: caseId,
        file_name: parsed.data.file_name,
        storage_path: storagePath,
        mime_type: parsed.data.mime_type,
        file_size: parsed.data.file_size,
        sha256,
        label: parsed.data.label ?? null,
        notes: parsed.data.notes ?? null,
        captured_at: parsed.data.captured_at ?? null,
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
        { error: 'Failed to save evidence record', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'evidence_uploaded',
      payload: {
        evidence_id: evidence.id,
        file_name: parsed.data.file_name,
        label: parsed.data.label ?? null,
      },
    })

    return NextResponse.json({ evidence }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
