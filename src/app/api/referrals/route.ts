import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET() {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    // Check for existing referral code
    let { data: existing } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', user.id)
      .limit(1)
      .maybeSingle()

    let referralCode = existing?.referral_code

    // Generate one if none exists
    if (!referralCode) {
      referralCode = randomBytes(6).toString('base64url')
      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: user.id,
          referral_code: referralCode,
          status: 'pending',
        })
      if (error) {
        return NextResponse.json({ error: 'Failed to create referral code' }, { status: 500 })
      }
    }

    // Gather stats from all referral rows for this user
    const { data: referrals } = await supabase
      .from('referrals')
      .select('status')
      .eq('referrer_id', user.id)

    const stats = {
      totalReferred: referrals?.filter((r) => r.status !== 'pending').length ?? 0,
      signedUp: referrals?.filter((r) => r.status === 'signed_up').length ?? 0,
      converted: referrals?.filter((r) => r.status === 'converted' || r.status === 'credited').length ?? 0,
      credited: referrals?.filter((r) => r.status === 'credited').length ?? 0,
    }

    const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?ref=${referralCode}`

    return NextResponse.json({ referralCode, referralUrl, stats })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const { referralCode } = await request.json()
    if (!referralCode || typeof referralCode !== 'string') {
      return NextResponse.json({ error: 'Missing referral code' }, { status: 422 })
    }

    // Find the pending referral row with this code
    const { data: referral, error: findError } = await supabase
      .from('referrals')
      .select('id, referrer_id')
      .eq('referral_code', referralCode)
      .eq('status', 'pending')
      .maybeSingle()

    if (findError || !referral) {
      return NextResponse.json({ error: 'Invalid or already used referral code' }, { status: 404 })
    }

    // Prevent self-referral
    if (referral.referrer_id === user.id) {
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 422 })
    }

    // Update referral: set referee and status
    const { error: updateError } = await supabase
      .from('referrals')
      .update({ referee_id: user.id, status: 'signed_up' })
      .eq('id', referral.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 })
    }

    // Grant referee bonus AI generations — use atomic upsert to prevent TOCTOU race
    const { error: rpcError } = await supabase.rpc('grant_bonus_generations', {
      p_user_id: user.id,
      p_bonus: 5,
      p_default_total: 10,
    })
    if (rpcError) {
      // Fallback: simple upsert if RPC doesn't exist yet
      await supabase
        .from('ai_usage')
        .upsert(
          { user_id: user.id, generations_remaining: 10 },
          { onConflict: 'user_id' }
        )
    }

    // Create a new pending referral row so the referrer's code stays active
    await supabase
      .from('referrals')
      .insert({
        referrer_id: referral.referrer_id,
        referral_code: referralCode,
        status: 'pending',
      })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
