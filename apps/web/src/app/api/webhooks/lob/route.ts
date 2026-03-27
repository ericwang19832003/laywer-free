import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const STATUS_MAP: Record<string, string> = {
  'letter.created': 'created',
  'letter.rendered_pdf': 'created',
  'letter.mailed': 'mailed',
  'letter.in_transit': 'in_transit',
  'letter.in_local_area': 'in_transit',
  'letter.processed_for_delivery': 'in_transit',
  'letter.delivered': 'delivered',
  'letter.re-routed': 'in_transit',
  'letter.returned_to_sender': 'returned',
}

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LOB_WEBHOOK_SECRET
  if (!secret) return false
  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('lob-signature') ?? ''

    if (!process.env.LOB_WEBHOOK_SECRET) {
      console.error('LOB_WEBHOOK_SECRET not configured — rejecting webhook')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }
    if (!verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event_type?.id as string | undefined
    const letterId = event.body?.id as string | undefined

    if (!eventType || !letterId) {
      return NextResponse.json({ ok: true })
    }

    const newStatus = STATUS_MAP[eventType]
    if (!newStatus) {
      return NextResponse.json({ ok: true })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const updates: Record<string, unknown> = { status: newStatus }
    if (newStatus === 'delivered') updates.delivered_at = new Date().toISOString()
    if (event.body?.tracking_number) updates.tracking_number = event.body.tracking_number

    await supabase
      .from('demand_letter_deliveries')
      .update(updates)
      .eq('lob_letter_id', letterId)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Lob webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
