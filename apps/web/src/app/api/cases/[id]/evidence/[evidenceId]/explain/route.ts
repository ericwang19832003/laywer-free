import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { extractTextFromPdf } from '@/lib/extraction/pdf-text'
import { extractTextFromImage } from '@/lib/extraction/ocr'
import { safeError } from '@/lib/security/safe-log'
import { checkDistributedRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const maxDuration = 60

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp']
const MIN_TEXT_LENGTH = 50
const CACHE_EXPLAIN_HOURS = 168 // 7 days — doc content doesn't change

const requestSchema = z.object({
  question: z.string().max(500).optional(),
})

const explainResponseSchema = z.object({
  document_type: z.string(),
  summary: z.string(),
  key_points: z.array(z.string()).default([]),
  important_dates: z.array(z.object({ label: z.string(), date: z.string() })).default([]),
  warnings: z.array(z.string()).default([]),
  answer: z.string().nullable().default(null),
})

export type DocumentExplanation = z.infer<typeof explainResponseSchema>

const SYSTEM_PROMPT = `You are a plain-language document assistant helping a self-represented (pro se) litigant understand a document they uploaded.

Your job is to read the document text and explain it clearly so a non-lawyer can understand it.

Return a JSON object with these exact fields:

{
  "document_type": "short label like Contract, Medical Record, Police Report, Lease Agreement, Court Notice, etc.",
  "summary": "2-4 sentence plain-English summary of what this document is and what it means for the reader",
  "key_points": ["up to 5 most important facts or obligations from this document"],
  "important_dates": [
    { "label": "what this date is for", "date": "the date as written in the document" }
  ],
  "warnings": ["anything the reader should pay attention to — deadlines, obligations, risks"],
  "answer": "if the user asked a specific question, answer it here in plain English. null if no question was asked."
}

RULES:
- Use simple language — no legal jargon without explanation.
- Do NOT provide legal advice or predict outcomes.
- Be specific about what the document actually says, not generic.
- If you cannot determine a field, use an empty array or null.
- Return ONLY the JSON object, no markdown.`

function parseExplanation(raw: string): DocumentExplanation | null {
  try {
    const cleaned = raw.replace(/```json?\s*/g, '').replace(/```\s*/g, '').trim()
    const parsed = JSON.parse(cleaned)
    const result = explainResponseSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}

function staticExplanation(fileName: string): DocumentExplanation {
  return {
    document_type: 'Document',
    summary: `We received your file "${fileName}" but could not extract its text automatically. This may happen with scanned images that are not clear enough, or certain PDF formats.`,
    key_points: [],
    important_dates: [],
    warnings: ['Try uploading a clearer scan or a text-based PDF for better results.'],
    answer: null,
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { id: caseId, evidenceId } = await params

    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const rl = await checkDistributedRateLimit(
      supabase,
      user.id,
      'ai',
      RATE_LIMITS.ai.maxRequests,
      RATE_LIMITS.ai.windowMs
    )
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 422 })
    }
    const { question } = parsed.data

    // Fetch evidence item (RLS ensures this user owns it)
    const { data: item, error: itemError } = await supabase
      .from('evidence_items')
      .select('id, case_id, file_name, storage_path, mime_type')
      .eq('id', evidenceId)
      .eq('case_id', caseId)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: 'Evidence item not found' }, { status: 404 })
    }

    // Cache key — only cache generic explanations (no custom question)
    const cacheKey = `doc_explain_${evidenceId}`
    if (!question) {
      const { data: cached } = await supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', cacheKey)
        .maybeSingle()

      if (cached?.content) {
        const ageMs = Date.now() - new Date(cached.generated_at).getTime()
        if (ageMs < CACHE_EXPLAIN_HOURS * 60 * 60 * 1000) {
          return NextResponse.json({
            explanation: cached.content,
            _meta: { source: 'cached', generated_at: cached.generated_at },
          })
        }
      }
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('case-documents')
      .download(item.storage_path)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: 'Could not download the file. Please try again.' },
        { status: 500 }
      )
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const mimeType = item.mime_type ?? 'application/octet-stream'

    // Extract text
    let text = ''
    if (mimeType === 'application/pdf') {
      text = await extractTextFromPdf(buffer)
    }
    if (text.length < MIN_TEXT_LENGTH || IMAGE_MIMES.includes(mimeType)) {
      try {
        text = await extractTextFromImage(buffer, mimeType)
      } catch {
        /* OCR failed — use what we have */
      }
    }

    if (text.length < MIN_TEXT_LENGTH) {
      return NextResponse.json({
        explanation: staticExplanation(item.file_name),
        _meta: { source: 'static', reason: 'text_extraction_failed' },
      })
    }

    // Build user prompt
    const questionLine = question
      ? `\n\nUser's question: "${question}"\n\nMake sure to answer the question in the "answer" field.`
      : ''

    const userPrompt = `Please explain this document:\n\nFile name: ${item.file_name}\n\n---\n\n${text.slice(0, 10000)}${questionLine}`

    // Call DeepSeek
    let explanation: DocumentExplanation | null = null

    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const deepseek = new OpenAI({
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com',
        })

        const message = await deepseek.chat.completions.create({
          model: 'deepseek-chat',
          max_tokens: 1500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
        })

        const raw = message.choices[0]?.message?.content ?? ''
        explanation = parseExplanation(raw)
      } catch (err) {
        safeError('doc-explain', err)
      }
    }

    if (!explanation) {
      explanation = staticExplanation(item.file_name)
    }

    // Cache only generic explanations
    if (!question && explanation) {
      await supabase.from('ai_cache').upsert(
        {
          case_id: caseId,
          cache_key: cacheKey,
          content: explanation,
          generated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + CACHE_EXPLAIN_HOURS * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'case_id,cache_key' }
      )
    }

    return NextResponse.json({ explanation, _meta: { source: 'ai' } })
  } catch (err) {
    safeError('doc-explain', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
