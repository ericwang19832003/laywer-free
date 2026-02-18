import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { sendPreservationLetterSchema } from '@/lib/schemas/preservation-letter-send'
import { sendEmail } from '@/lib/email/provider'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = sendPreservationLetterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const { document_id, to_email } = parsed.data

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

    // Verify document exists and belongs to this case
    const { data: doc, error: docError } = await supabase!
      .from('documents')
      .select('id, content_text, sha256, doc_type')
      .eq('id', document_id)
      .eq('case_id', caseId)
      .single()

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    if (doc.doc_type !== 'preservation_letter') {
      return NextResponse.json(
        { error: 'Document is not a preservation letter' },
        { status: 422 }
      )
    }

    // Verify disclaimer was acknowledged for this case
    const { data: ackEvents } = await supabase!
      .from('task_events')
      .select('id')
      .eq('case_id', caseId)
      .eq('kind', 'disclaimer_acknowledged')
      .limit(1)

    if (!ackEvents || ackEvents.length === 0) {
      return NextResponse.json(
        { error: 'Disclaimer must be acknowledged before sending' },
        { status: 403 }
      )
    }

    const subject = 'Request to Preserve Relevant Records'
    const bodyPreview = doc.content_text.slice(0, 500)

    // Insert communications row (queued)
    const { data: comm, error: commError } = await supabase!
      .from('communications')
      .insert({
        case_id: caseId,
        channel: 'email',
        to_value: to_email,
        subject,
        body_preview: bodyPreview,
        body_sha256: doc.sha256,
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

    // Send email (or stub in dev)
    const result = await sendEmail({
      to: to_email,
      subject,
      body: doc.content_text,
    })

    // Update communications status
    if (result.success) {
      await supabase!
        .from('communications')
        .update({
          status: 'sent',
          provider_message_id: result.messageId,
          sent_at: new Date().toISOString(),
        })
        .eq('id', comm.id)
    } else {
      await supabase!
        .from('communications')
        .update({
          status: 'failed',
        })
        .eq('id', comm.id)
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'preservation_letter_sent',
      payload: {
        to_email,
        communications_id: comm.id,
        document_id,
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
