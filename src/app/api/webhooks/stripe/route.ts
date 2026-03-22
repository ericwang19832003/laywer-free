import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Idempotency: skip already-processed events
  const { data: alreadyProcessed } = await supabase
    .from('processed_events')
    .select('event_id')
    .eq('event_id', event.id)
    .maybeSingle()

  if (alreadyProcessed) {
    return NextResponse.json({ received: true })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.metadata?.user_id && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const tier = session.metadata.tier ?? 'pro'
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end
          ?? sub.items.data[0]?.current_period_end
        await supabase.from('user_subscriptions').upsert({
          user_id: session.metadata.user_id,
          tier,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }
      break
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const { data: existing } = await supabase
        .from('user_subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', sub.id)
        .maybeSingle()

      if (existing) {
        const isActive = sub.status === 'active' || sub.status === 'trialing'
        const periodEnd = (sub as unknown as { current_period_end?: number }).current_period_end
          ?? sub.items.data[0]?.current_period_end
        await supabase.from('user_subscriptions').update({
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : new Date().toISOString(),
          tier: isActive ? (sub.metadata?.tier ?? 'pro') : 'free',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('user_subscriptions').update({
        tier: 'free',
        stripe_subscription_id: null,
        current_period_end: null,
        updated_at: new Date().toISOString(),
      }).eq('stripe_subscription_id', sub.id)
      break
    }
  }

  // Record event as processed
  await supabase.from('processed_events').insert({
    event_id: event.id,
    event_type: event.type,
  })

  return NextResponse.json({ received: true })
}
