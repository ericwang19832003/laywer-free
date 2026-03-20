import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { extractTextFromPdf } from '@/lib/extraction/pdf-text'
import { extractTextFromImage } from '@/lib/extraction/ocr'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 60

const IMAGE_MIMES = ['image/jpeg', 'image/png']
const MIN_TEXT_LENGTH = 50

const requestSchema = z.object({
  court_document_id: z.string().uuid(),
})

const SYSTEM_PROMPT = `You are a legal document analysis assistant helping a self-represented (pro se) litigant understand an opponent's court filing.

Analyze the document text and return a JSON object with these exact fields:

{
  "document_type": "answer" | "motion" | "counterclaim" | "discovery_response" | "other",
  "summary": "2-3 sentence plain-English summary of what this document says and what it means for the user",
  "claims_response": {
    "admitted": ["list of claims or facts the opponent admits"],
    "denied": ["list of claims or facts the opponent denies"],
    "insufficient_knowledge": ["claims where opponent says they don't have enough info to respond"]
  },
  "defenses_raised": [
    {
      "defense": "name of the defense (e.g., Statute of Limitations, Comparative Negligence)",
      "explanation": "plain-English explanation of what this defense means",
      "strength_hint": "strong" | "moderate" | "weak"
    }
  ],
  "counterclaim": {
    "has_counterclaim": true/false,
    "summary": "what the opponent is suing YOU for (null if no counterclaim)",
    "amount": "dollar amount if stated (null if not stated)"
  },
  "deadlines_triggered": [
    {
      "action": "what you need to do",
      "typical_deadline": "e.g., '20 days' or '30 days'",
      "urgency": "high" | "medium" | "low"
    }
  ],
  "recommended_next_steps": [
    {
      "step": "what to do",
      "why": "why this matters",
      "priority": "immediate" | "soon" | "when_ready"
    }
  ],
  "red_flags": ["any concerning elements the user should pay attention to"],
  "opportunities": ["any weaknesses in the opponent's response the user could leverage"]
}

RULES:
- Use simple language a high school student could understand.
- Do NOT provide legal advice. Present information objectively.
- Do NOT predict outcomes.
- If you cannot determine a field, use empty arrays or null.
- Return ONLY the JSON object, no markdown formatting.`

function parseAnalysis(raw: string): Record<string, unknown> {
  try {
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return { error: 'Failed to parse AI response', raw_preview: raw.slice(0, 200) }
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

    const rl = checkRateLimit(user.id, 'ai', RATE_LIMITS.ai.maxRequests, RATE_LIMITS.ai.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { court_document_id } = parsed.data

    // Verify case ownership
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('id, dispute_type, role')
      .eq('id', caseId)
      .single()

    if (caseError || !caseData) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Load court document
    const { data: doc, error: docError } = await supabase
      .from('court_documents')
      .select('id, case_id, doc_type, storage_path, mime_type')
      .eq('id', court_document_id)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: 'Court document not found' }, { status: 404 })
    }

    if (doc.case_id !== caseId) {
      return NextResponse.json({ error: 'Document does not belong to this case' }, { status: 422 })
    }

    // Check AI cache to avoid re-analyzing
    const cacheKey = `answer_analysis_${court_document_id}`
    const { data: cached } = await supabase
      .from('ai_cache')
      .select('content')
      .eq('case_id', caseId)
      .eq('cache_key', cacheKey)
      .maybeSingle()

    if (cached?.content) {
      return NextResponse.json({ analysis: cached.content, _meta: { source: 'cache' } })
    }

    // Download and extract text
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

    let text = ''
    if (doc.mime_type === 'application/pdf') {
      text = await extractTextFromPdf(buffer)
    }

    if (text.length < MIN_TEXT_LENGTH || IMAGE_MIMES.includes(doc.mime_type)) {
      try {
        text = await extractTextFromImage(buffer, doc.mime_type)
      } catch {
        // OCR failed
      }
    }

    if (text.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the document. Try uploading a clearer scan.' },
        { status: 422 }
      )
    }

    // Analyze with Claude
    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analyze this court document for a ${caseData.role} in a ${caseData.dispute_type?.replace(/_/g, ' ')} case:\n\n${text.slice(0, 8000)}`,
      }],
    })

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    const analysis = parseAnalysis(responseText)

    // Cache the analysis
    await supabase.from('ai_cache').upsert(
      {
        case_id: caseId,
        cache_key: cacheKey,
        content: analysis,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'case_id,cache_key' }
    )

    // Audit event
    await supabase.from('task_events').insert({
      case_id: caseId,
      kind: 'answer_analyzed',
      payload: { court_document_id, document_type: analysis.document_type ?? doc.doc_type },
    })

    return NextResponse.json({ analysis, _meta: { source: 'ai', model: 'claude-sonnet-4-20250514' } }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
