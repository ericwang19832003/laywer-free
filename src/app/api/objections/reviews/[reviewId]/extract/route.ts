import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { extractTextFromPdf } from '@/lib/extraction/pdf-text'
import { extractTextFromImage } from '@/lib/extraction/ocr'

export const runtime = 'nodejs'
export const maxDuration = 60

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/tiff']
const MIN_TEXT_LENGTH = 50

// POST /api/objections/reviews/:reviewId/extract — extract text from the associated discovery response file
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

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

    // Guard: status must be 'queued'
    if (review.status !== 'queued') {
      return NextResponse.json(
        { error: 'Review is not in queued status', current_status: review.status },
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
      // Mark as needs_review on failure
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

    // Extract text
    let text = ''
    let extractor: string = 'pdf-parse'

    try {
      if (response.mime_type === 'application/pdf') {
        text = await extractTextFromPdf(buffer)
      }

      // For images, use OCR directly (tesseract cannot process raw PDF buffers)
      if (IMAGE_MIMES.includes(response.mime_type)) {
        text = await extractTextFromImage(buffer, response.mime_type)
        extractor = 'ocr'
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Text extraction failed'
      await setErrorStatus(supabase!, reviewId, review.case_id, message)
      return NextResponse.json(
        { error: 'Text extraction failed', details: message },
        { status: 500 }
      )
    }

    // Determine outcome
    let status: string
    let error: string | null = null

    if (text.length >= MIN_TEXT_LENGTH) {
      status = 'classifying'
    } else {
      status = 'needs_review'
      error = 'Could not extract readable text from this file.'
    }

    // Update objection_reviews
    const { data: updatedReview, error: updateError } = await supabase!
      .from('objection_reviews')
      .update({ status, extractor, error })
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
      kind: 'objection_text_extracted',
      payload: {
        review_id: reviewId,
        extractor,
        text_length: text.length,
        status,
      },
    })

    return NextResponse.json({ review: updatedReview, text_length: text.length })
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
    .update({ status: 'needs_review', error: errorMessage })
    .eq('id', reviewId)

  await supabase.from('task_events').insert({
    case_id: caseId,
    kind: 'objection_text_extracted',
    payload: {
      review_id: reviewId,
      status: 'needs_review',
      error: errorMessage,
    },
  })
}
