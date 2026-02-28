import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { extractTextFromPdf } from '@/lib/extraction/pdf-text'
import { extractTextFromImage } from '@/lib/extraction/ocr'
import {
  OBJECTION_LABELS,
  ITEM_TYPES,
  classificationOutputSchema,
} from '@/lib/schemas/objection-classification'
import type { ClassificationItem } from '@/lib/schemas/objection-classification'

export const runtime = 'nodejs'
export const maxDuration = 60

const PROMPT_VERSION = '1.0.0'
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/tiff']
const MIN_TEXT_LENGTH = 50

const SYSTEM_PROMPT = `You are a document analysis assistant. You read discovery response documents and classify the objections found in them.

RULES:
- Classify ONLY — never advise what to do about objections.
- Never say "you should", "file a motion", "sanctions", or any legal conclusions.
- Use ONLY the allowed labels: ${OBJECTION_LABELS.join(', ')}.
- Allowed item_type values: ${ITEM_TYPES.join(', ')}.
- If unsure about item_type, use "unknown". If unsure about item_no, use null.
- One sentence neutral_summary per item — factual, no recommendations.
- Output valid JSON matching the schema exactly.

OUTPUT FORMAT — respond with valid JSON only:
{
  "items": [
    {
      "item_type": "rfp" | "rog" | "rfa" | "unknown",
      "item_no": <positive integer or null>,
      "labels": ["<label>", ...],
      "neutral_summary": "<one sentence factual summary>",
      "follow_up_flag": <true if objection blocks meaningful production>,
      "confidence": <0.0 to 1.0>
    }
  ]
}`

// POST /api/objections/reviews/:reviewId/classify — classify objections via OpenAI
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI classification is not configured', fallback: true },
        { status: 503 }
      )
    }

    // Fetch objection_review by reviewId (RLS ensures ownership)
    const { data: review, error: reviewError } = await supabase!
      .from('objection_reviews')
      .select('id, case_id, response_id, status')
      .eq('id', reviewId)
      .single()

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Objection review not found' },
        { status: 404 }
      )
    }

    // Guard: status must be 'classifying'
    if (review.status !== 'classifying') {
      return NextResponse.json(
        { error: 'Review is not in classifying status', current_status: review.status },
        { status: 409 }
      )
    }

    // Set status → 'running'
    const { error: runningError } = await supabase!
      .from('objection_reviews')
      .update({ status: 'running' })
      .eq('id', reviewId)

    if (runningError) {
      return NextResponse.json(
        { error: 'Failed to update review status', details: runningError.message },
        { status: 500 }
      )
    }

    // Load the discovery_response row
    const { data: response, error: responseError } = await supabase!
      .from('discovery_responses')
      .select('id, storage_path, mime_type')
      .eq('id', review.response_id)
      .single()

    if (responseError || !response) {
      await setErrorStatus(supabase!, reviewId, review.case_id, 'Discovery response not found')
      return NextResponse.json(
        { error: 'Discovery response not found' },
        { status: 404 }
      )
    }

    // Download file from Supabase Storage
    let buffer: Buffer
    try {
      const { data: fileData, error: downloadError } = await supabase!.storage
        .from('case-documents')
        .download(response.storage_path)

      if (downloadError || !fileData) {
        await setErrorStatus(supabase!, reviewId, review.case_id, `Failed to download file: ${downloadError?.message}`)
        return NextResponse.json(
          { error: 'Failed to download file', details: downloadError?.message },
          { status: 500 }
        )
      }

      buffer = Buffer.from(await fileData.arrayBuffer())
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown download error'
      await setErrorStatus(supabase!, reviewId, review.case_id, message)
      return NextResponse.json(
        { error: 'Failed to download file', details: message },
        { status: 500 }
      )
    }

    // Re-extract text (extract endpoint does not persist text)
    let text = ''
    try {
      if (response.mime_type === 'application/pdf') {
        text = await extractTextFromPdf(buffer)
      }

      if (text.length < MIN_TEXT_LENGTH || IMAGE_MIMES.includes(response.mime_type)) {
        text = await extractTextFromImage(buffer, response.mime_type)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Text extraction failed'
      await setErrorStatus(supabase!, reviewId, review.case_id, message)
      return NextResponse.json(
        { error: 'Text extraction failed', details: message },
        { status: 500 }
      )
    }

    if (text.length < MIN_TEXT_LENGTH) {
      await setErrorStatus(supabase!, reviewId, review.case_id, 'Could not extract readable text for classification')
      return NextResponse.json(
        { error: 'Insufficient text for classification' },
        { status: 422 }
      )
    }

    // Call OpenAI
    let aiOutput: unknown
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: text },
        ],
      })

      const raw = completion.choices[0]?.message?.content
      if (!raw) {
        await setErrorStatus(supabase!, reviewId, review.case_id, 'AI returned empty response')
        return NextResponse.json(
          { error: 'AI returned empty response', fallback: true },
          { status: 502 }
        )
      }

      try {
        aiOutput = JSON.parse(raw)
      } catch {
        await setErrorStatus(supabase!, reviewId, review.case_id, 'AI returned invalid JSON')
        return NextResponse.json(
          { error: 'AI returned invalid JSON', fallback: true },
          { status: 502 }
        )
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OpenAI call failed'
      await setErrorStatus(supabase!, reviewId, review.case_id, message)
      return NextResponse.json(
        { error: 'AI classification failed', details: message, fallback: true },
        { status: 500 }
      )
    }

    // Validate AI output with Zod
    const validated = classificationOutputSchema.safeParse(aiOutput)

    if (!validated.success) {
      // Invalid output — mark as needs_review but don't insert items
      await supabase!
        .from('objection_reviews')
        .update({
          status: 'needs_review',
          model: 'gpt-4o-mini',
          prompt_version: PROMPT_VERSION,
          error: 'AI output failed validation',
        })
        .eq('id', reviewId)

      await supabase!.from('task_events').insert({
        case_id: review.case_id,
        kind: 'objection_classified',
        payload: {
          review_id: reviewId,
          status: 'needs_review',
          error: 'AI output failed validation',
          validation_errors: validated.error.issues,
        },
      })

      return NextResponse.json(
        { error: 'AI output failed validation', fallback: true },
        { status: 502 }
      )
    }

    // Insert objection_items rows
    const itemRows = validated.data.items.map((item: ClassificationItem) => ({
      review_id: reviewId,
      item_type: item.item_type,
      item_no: item.item_no,
      labels: item.labels,
      neutral_summary: item.neutral_summary,
      follow_up_flag: item.follow_up_flag,
      confidence: item.confidence,
    }))

    const { error: insertError } = await supabase!
      .from('objection_items')
      .insert(itemRows)

    if (insertError) {
      await setErrorStatus(supabase!, reviewId, review.case_id, `Failed to insert items: ${insertError.message}`)
      return NextResponse.json(
        { error: 'Failed to save classification results', details: insertError.message },
        { status: 500 }
      )
    }

    // Update review to needs_review with model info
    const { data: updatedReview, error: updateError } = await supabase!
      .from('objection_reviews')
      .update({
        status: 'needs_review',
        model: 'gpt-4o-mini',
        prompt_version: PROMPT_VERSION,
        error: null,
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update review', details: updateError.message },
        { status: 500 }
      )
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: review.case_id,
      kind: 'objection_classified',
      payload: {
        review_id: reviewId,
        status: 'needs_review',
        items_count: validated.data.items.length,
        model: 'gpt-4o-mini',
        prompt_version: PROMPT_VERSION,
      },
    })

    // Fetch inserted items to return
    const { data: items } = await supabase!
      .from('objection_items')
      .select('*')
      .eq('review_id', reviewId)
      .order('item_type')
      .order('item_no')

    return NextResponse.json({ review: updatedReview, items })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper: set review to needs_review with error and write task_events
async function setErrorStatus(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  reviewId: string,
  caseId: string,
  errorMessage: string
) {
  await supabase
    .from('objection_reviews')
    .update({
      status: 'needs_review',
      model: 'gpt-4o-mini',
      prompt_version: PROMPT_VERSION,
      error: errorMessage,
    })
    .eq('id', reviewId)

  await supabase.from('task_events').insert({
    case_id: caseId,
    kind: 'objection_classified',
    payload: {
      review_id: reviewId,
      status: 'needs_review',
      error: errorMessage,
    },
  })
}
