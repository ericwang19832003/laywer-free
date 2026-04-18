import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('user_preferences')
    .upsert(
      { user_id: user.id, onboarding_completed: true, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Validate phone_number if provided
  const E164_REGEX = /^\+[1-9]\d{1,14}$/
  if (body.phone_number !== undefined && body.phone_number !== null && body.phone_number !== '') {
    if (!E164_REGEX.test(body.phone_number)) {
      return NextResponse.json({ error: 'phone_number must be E.164 format, e.g. +15551234567' }, { status: 400 })
    }
  }

  const update: Record<string, unknown> = {}
  if (body.phone_number !== undefined) {
    update.phone_number = body.phone_number || null
    // If phone removed, force opt-out
    if (!body.phone_number) update.sms_opt_in = false
  }
  if (body.sms_opt_in !== undefined && typeof body.sms_opt_in === 'boolean') {
    update.sms_opt_in = body.sms_opt_in
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, ...update }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
