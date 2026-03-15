import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { tier } = await request.json()
    const PRICE_IDS: Record<string, string> = {
      pro: process.env.STRIPE_PRO_PRICE_ID ?? '',
      premium: process.env.STRIPE_PREMIUM_PRICE_ID ?? '',
    }
    const priceId = PRICE_IDS[tier]
    if (!priceId) return NextResponse.json({ error: 'Invalid tier' }, { status: 422 })

    // Check for existing Stripe customer
    const { data: sub } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?billing=cancelled`,
      metadata: { user_id: user.id, tier },
      subscription_data: { metadata: { tier } },
    }

    if (sub?.stripe_customer_id) {
      sessionParams.customer = sub.stripe_customer_id
    } else {
      sessionParams.customer_email = user.email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
