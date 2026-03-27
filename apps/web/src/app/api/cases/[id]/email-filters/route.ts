import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { z } from 'zod/v4'

const addFilterSchema = z.object({
  email_address: z.email(),
  label: z.string().max(100).optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth
  const { id: caseId } = await params

  const { data, error } = await supabase
    .from('case_email_filters')
    .select('id, email_address, label, created_at')
    .eq('case_id', caseId)
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth
  const { id: caseId } = await params

  const body = await request.json()
  const parsed = addFilterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('case_email_filters')
    .insert({
      case_id: caseId,
      email_address: parsed.data.email_address.toLowerCase(),
      label: parsed.data.label ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This email is already being monitored' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
