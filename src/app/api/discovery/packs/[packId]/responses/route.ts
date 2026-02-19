import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { uploadResponseSchema } from '@/lib/schemas/discovery'

export const runtime = 'nodejs'

// POST /api/discovery/packs/:packId/responses — upload a discovery response file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> }
) {
  try {
    const { packId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Parse FormData
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const responseType = formData.get('response_type') as string | null
    const receivedAt = formData.get('received_at') as string | null
    const notes = formData.get('notes') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 422 })
    }

    if (!responseType) {
      return NextResponse.json({ error: 'response_type is required' }, { status: 422 })
    }

    // Validate metadata via Zod
    const parsed = uploadResponseSchema.safeParse({
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
      response_type: responseType,
      received_at: receivedAt || undefined,
      notes: notes || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Fetch pack to verify access and get case_id (RLS handles ownership)
    const { data: pack, error: packError } = await supabase!
      .from('discovery_packs')
      .select('id, case_id')
      .eq('id', packId)
      .single()

    if (packError || !pack) {
      return NextResponse.json({ error: 'Discovery pack not found' }, { status: 404 })
    }

    // Compute SHA256
    const buffer = Buffer.from(await file.arrayBuffer())
    const sha256 = createHash('sha256').update(buffer).digest('hex')

    // Upload to Supabase Storage
    const fileId = crypto.randomUUID()
    const storagePath = `cases/${pack.case_id}/discovery/${packId}/responses/${fileId}`

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

    // Insert discovery_responses row
    const { data: response, error: insertError } = await supabase!
      .from('discovery_responses')
      .insert({
        pack_id: packId,
        received_at: parsed.data.received_at ?? new Date().toISOString(),
        response_type: parsed.data.response_type,
        storage_path: storagePath,
        file_name: parsed.data.file_name,
        mime_type: parsed.data.mime_type,
        sha256,
        notes: parsed.data.notes ?? null,
      })
      .select()
      .single()

    if (insertError) {
      // Cleanup: remove uploaded file on DB insert failure
      await supabase!.storage
        .from('case-documents')
        .remove([storagePath])

      return NextResponse.json(
        { error: 'Failed to save response record', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: pack.case_id,
      kind: 'discovery_response_received',
      payload: {
        pack_id: packId,
        response_id: response.id,
        file_name: parsed.data.file_name,
        response_type: parsed.data.response_type,
      },
    })

    return NextResponse.json({ response }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
