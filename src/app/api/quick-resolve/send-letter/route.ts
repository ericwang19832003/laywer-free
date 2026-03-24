import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { sendLetterSchema } from '@/lib/schemas/quick-resolve'
import { sendCertifiedLetter } from '@/lib/mail/lob-client'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const body = await request.json()
    const parsed = sendLetterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Verify case ownership
    const { data: caseRow } = await supabase
      .from('cases')
      .select('id')
      .eq('id', parsed.data.caseId)
      .single()

    if (!caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const displayName = user.user_metadata?.display_name
      || user.user_metadata?.full_name
      || user.email
      || 'Lawyer Free User'

    const lobResult = await sendCertifiedLetter({
      recipientName: parsed.data.recipientName,
      recipientAddress: parsed.data.recipientAddress,
      senderName: displayName,
      senderAddress: parsed.data.senderAddress,
      htmlContent: parsed.data.letterHtml,
    })

    const { data: delivery, error: insertError } = await supabase
      .from('demand_letter_deliveries')
      .insert({
        case_id: parsed.data.caseId,
        lob_letter_id: lobResult.id,
        tracking_number: lobResult.trackingNumber,
        status: 'created',
        recipient_name: parsed.data.recipientName,
        recipient_address: parsed.data.recipientAddress,
        sender_address: parsed.data.senderAddress,
        amount_charged_cents: 799,
        letter_content_url: lobResult.url,
        sent_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to store delivery:', insertError)
      return NextResponse.json({ error: 'Letter sent but tracking failed to save' }, { status: 500 })
    }

    return NextResponse.json({
      deliveryId: delivery.id,
      trackingNumber: lobResult.trackingNumber,
      expectedDelivery: lobResult.expectedDeliveryDate,
    })
  } catch (err) {
    console.error('Send letter error:', err)
    return NextResponse.json({ error: 'Failed to send letter' }, { status: 500 })
  }
}
