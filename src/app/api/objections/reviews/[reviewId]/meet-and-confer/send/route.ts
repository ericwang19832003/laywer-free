import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { sendEmail } from '@/lib/email/provider'
import { createHash } from 'crypto'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/security/rate-limit'

export const runtime = 'nodejs'

const sendSchema = z.object({
  draft_id: z.string().uuid(),
  recipient_email: z.string().email(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const { reviewId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    // Rate limit: 5 emails per hour per user
    const rl = checkRateLimit(user.id, 'email', RATE_LIMITS.email.maxRequests, RATE_LIMITS.email.windowMs)
    if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs)

    const body = await request.json()
    const parsed = sendSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { draft_id, recipient_email } = parsed.data

    // Fetch draft (RLS ensures ownership via case_id)
    const { data: draft, error: draftError } = await supabase
      .from('meet_and_confer_drafts')
      .select('id, case_id, review_id, status, content_text, sha256')
      .eq('id', draft_id)
      .single()

    if (draftError || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    // Verify draft belongs to this review
    if (draft.review_id !== reviewId) {
      return NextResponse.json(
        { error: 'Draft does not belong to this review' },
        { status: 403 }
      )
    }

    // Guard: draft must be in 'draft' status
    if (draft.status === 'sent') {
      return NextResponse.json(
        { error: 'Draft has already been sent' },
        { status: 409 }
      )
    }

    const subject = 'Meet and Confer — Discovery Objections'
    const bodyText = draft.content_text ?? ''
    const bodySha = draft.sha256 ?? createHash('sha256').update(bodyText, 'utf8').digest('hex')

    // Insert communications record (queued)
    const { data: comm, error: commError } = await supabase
      .from('communications')
      .insert({
        case_id: draft.case_id,
        channel: 'email',
        to_value: recipient_email,
        subject,
        body_preview: bodyText.slice(0, 500),
        body_sha256: bodySha,
        status: 'queued',
      })
      .select()
      .single()

    if (commError || !comm) {
      return NextResponse.json(
        { error: 'Failed to create communication record', details: commError?.message },
        { status: 500 }
      )
    }

    // Send email
    const result = await sendEmail({
      to: recipient_email,
      subject,
      body: bodyText,
    })

    // Update communications status
    if (result.success) {
      await supabase
        .from('communications')
        .update({
          status: 'sent',
          provider_message_id: result.messageId,
          sent_at: new Date().toISOString(),
        })
        .eq('id', comm.id)

      // Update draft status to 'sent'
      await supabase
        .from('meet_and_confer_drafts')
        .update({ status: 'sent' })
        .eq('id', draft_id)
    } else {
      await supabase
        .from('communications')
        .update({ status: 'failed' })
        .eq('id', comm.id)
    }

    // Write timeline event
    await supabase.from('task_events').insert({
      case_id: draft.case_id,
      kind: 'meet_and_confer_sent',
      payload: {
        review_id: reviewId,
        draft_id,
        communications_id: comm.id,
        recipient_email,
        status: result.success ? 'sent' : 'failed',
        provider_message_id: result.messageId,
      },
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Email send failed', details: result.error, communications_id: comm.id },
        { status: 502 }
      )
    }

    console.log(`[email-audit] user=${user.id} to=${recipient_email} type=meet_and_confer`)

    return NextResponse.json(
      {
        communications_id: comm.id,
        status: 'sent',
        provider_message_id: result.messageId,
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
