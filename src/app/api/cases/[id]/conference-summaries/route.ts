import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('conference_summaries')
    .select('*')
    .eq('case_id', caseId)
    .order('conference_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const supabase = await createClient()

  const body = await request.json()

  const { data, error } = await supabase
    .from('conference_summaries')
    .insert({
      case_id: caseId,
      conference_type: body.conferenceType,
      conference_date: body.conferenceDate,
      conference_time: body.conferenceTime,
      conference_location: body.conferenceLocation,
      your_name: body.yourName,
      opposing_counsel: body.opposingCounsel,
      attendees: body.attendees,
      topics_discussed: body.topicsDiscussed,
      agreements: body.agreements,
      disagreements: body.disagreements,
      follow_up_items: body.followUpItems,
      next_conference: body.nextConference,
      additional_notes: body.additionalNotes,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
