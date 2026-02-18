import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { extractRequestSchema } from '@/lib/schemas/document-extraction'
import { extractTextFromPdf } from '@/lib/extraction/pdf-text'
import { extractTextFromImage } from '@/lib/extraction/ocr'
import { extractRosFields } from '@/lib/extraction/ros-regex'
import { computeConfidence, deriveStatus } from '@/lib/extraction/confidence'

export const runtime = 'nodejs'
export const maxDuration = 60

const IMAGE_MIMES = ['image/jpeg', 'image/png']
const MIN_TEXT_LENGTH = 50

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Validate body
    const body = await request.json()
    const parsed = extractRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { court_document_id } = parsed.data

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

    // Load court document — verify it's a return_of_service and belongs to this case
    const { data: doc, error: docError } = await supabase!
      .from('court_documents')
      .select('id, case_id, doc_type, storage_path, mime_type')
      .eq('id', court_document_id)
      .single()

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Court document not found' },
        { status: 404 }
      )
    }

    if (doc.case_id !== caseId) {
      return NextResponse.json(
        { error: 'Document does not belong to this case' },
        { status: 422 }
      )
    }

    if (doc.doc_type !== 'return_of_service') {
      return NextResponse.json(
        { error: 'Document is not a return of service' },
        { status: 422 }
      )
    }

    // Check for existing non-failed extraction
    const { data: existing } = await supabase!
      .from('document_extractions')
      .select('id')
      .eq('court_document_id', court_document_id)
      .neq('status', 'failed')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'An extraction already exists for this document' },
        { status: 409 }
      )
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase!.storage
      .from('case-documents')
      .download(doc.storage_path)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Failed to download document', details: downloadError?.message },
        { status: 500 }
      )
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())

    // Extract text
    let text = ''
    let extractor: 'regex' | 'ocr' = 'regex'

    if (doc.mime_type === 'application/pdf') {
      text = await extractTextFromPdf(buffer)
    }

    // If PDF text extraction failed/short or input is an image, use OCR
    if (text.length < MIN_TEXT_LENGTH || IMAGE_MIMES.includes(doc.mime_type)) {
      try {
        text = await extractTextFromImage(buffer, doc.mime_type)
        extractor = 'ocr'
      } catch {
        // OCR failed — proceed with whatever text we have (may be empty)
      }
    }

    // Extract fields and compute confidence
    const fields = extractRosFields(text)
    const confidence = computeConfidence(fields)
    const status = deriveStatus(confidence)

    // Insert extraction row
    const { data: extraction, error: insertError } = await supabase!
      .from('document_extractions')
      .insert({
        case_id: caseId,
        court_document_id,
        extractor,
        status,
        confidence,
        fields,
        confirmed_by_user: false,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save extraction', details: insertError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'extraction_completed',
      payload: {
        extraction_id: extraction.id,
        court_document_id,
        extractor,
        status,
        confidence,
      },
    })

    return NextResponse.json({ extraction }, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
