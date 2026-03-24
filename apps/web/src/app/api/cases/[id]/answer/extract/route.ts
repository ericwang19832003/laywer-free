import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { extractRequestSchema } from '@lawyer-free/shared/schemas/document-extraction'
import { extractTextFromPdf } from '@/lib/extraction/pdf-text'
import { extractTextFromImage } from '@/lib/extraction/ocr'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const IMAGE_MIMES = ['image/jpeg', 'image/png']
const MIN_TEXT_LENGTH = 50

interface AnswerExtractionFields {
  is_general_denial: boolean
  affirmative_defenses: string[]
  has_counterclaim: boolean
  counterclaim_summary: string | null
  key_admissions: string[]
  key_denials: string[]
}

const EMPTY_FIELDS: AnswerExtractionFields = {
  is_general_denial: false,
  affirmative_defenses: [],
  has_counterclaim: false,
  counterclaim_summary: null,
  key_admissions: [],
  key_denials: [],
}

const SYSTEM_PROMPT =
  'You are a legal document analysis assistant. Extract structured fields from the following court answer document. Return a JSON object with these exact fields: is_general_denial (boolean), affirmative_defenses (string array), has_counterclaim (boolean), counterclaim_summary (string or null), key_admissions (string array), key_denials (string array). Return ONLY the JSON object, no markdown formatting or explanation.'

function parseAnswerFields(raw: string): AnswerExtractionFields {
  try {
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)

    return {
      is_general_denial: typeof parsed.is_general_denial === 'boolean' ? parsed.is_general_denial : false,
      affirmative_defenses: Array.isArray(parsed.affirmative_defenses)
        ? parsed.affirmative_defenses.filter((s: unknown) => typeof s === 'string')
        : [],
      has_counterclaim: typeof parsed.has_counterclaim === 'boolean' ? parsed.has_counterclaim : false,
      counterclaim_summary: typeof parsed.counterclaim_summary === 'string' ? parsed.counterclaim_summary : null,
      key_admissions: Array.isArray(parsed.key_admissions)
        ? parsed.key_admissions.filter((s: unknown) => typeof s === 'string')
        : [],
      key_denials: Array.isArray(parsed.key_denials)
        ? parsed.key_denials.filter((s: unknown) => typeof s === 'string')
        : [],
    }
  } catch {
    return { ...EMPTY_FIELDS }
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(supabase, user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

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
    const { data: caseData, error: caseError } = await supabase
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

    // Load court document — verify it's an answer and belongs to this case
    const { data: doc, error: docError } = await supabase
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

    if (doc.doc_type !== 'answer') {
      return NextResponse.json(
        { error: 'Document is not an answer' },
        { status: 422 }
      )
    }

    // Idempotency: if non-failed extraction exists, return it
    const { data: existing } = await supabase
      .from('document_extractions')
      .select('id, case_id, court_document_id, extractor, status, confidence, fields, confirmed_by_user, confirmed_fields, created_at')
      .eq('court_document_id', court_document_id)
      .neq('status', 'failed')
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { extraction: existing[0] },
        { status: 200 }
      )
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
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

    if (doc.mime_type === 'application/pdf') {
      text = await extractTextFromPdf(buffer)
    }

    // If PDF text extraction failed/short or input is an image, use OCR
    if (text.length < MIN_TEXT_LENGTH || IMAGE_MIMES.includes(doc.mime_type)) {
      try {
        text = await extractTextFromImage(buffer, doc.mime_type)
      } catch {
        // OCR failed — proceed with whatever text we have (may be empty)
      }
    }

    // Extract fields via Claude AI
    let fields: AnswerExtractionFields = { ...EMPTY_FIELDS }

    if (text.length > 0) {
      try {
        const anthropic = new Anthropic()
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: text }],
        })

        const responseText = message.content
          .filter((block) => block.type === 'text')
          .map((block) => block.text)
          .join('\n')

        fields = parseAnswerFields(responseText)
      } catch {
        // AI extraction failed — use empty defaults
      }
    }

    // Insert extraction row
    const { data: extraction, error: insertError } = await supabase
      .from('document_extractions')
      .insert({
        case_id: caseId,
        court_document_id,
        extractor: 'openai' as const,
        status: 'needs_review' as const,
        confidence: null,
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

    // Audit event
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'extraction_completed',
      payload: {
        extraction_id: extraction.id,
        court_document_id,
        extractor: 'openai',
        status: 'needs_review',
        confidence: null,
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
