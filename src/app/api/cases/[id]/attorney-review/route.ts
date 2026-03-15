import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: reviews } = await supabase
      .from('attorney_reviews')
      .select('id, status, document_type, review_comments, created_at, updated_at')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ reviews: reviews ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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

    const { documentType, notes } = await request.json()
    if (!documentType) return NextResponse.json({ error: 'documentType required' }, { status: 422 })

    // Create payment intent
    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4900, // $49
      currency: 'usd',
      metadata: { case_id: caseId, user_id: user.id, document_type: documentType },
    })

    // Create review record
    const { data: review, error } = await supabase
      .from('attorney_reviews')
      .insert({
        case_id: caseId,
        user_id: user.id,
        document_type: documentType,
        notes: notes ?? null,
        stripe_payment_intent_id: paymentIntent.id,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      review,
      clientSecret: paymentIntent.client_secret,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
