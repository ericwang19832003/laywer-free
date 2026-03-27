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
    .eq('conference_type', 'rule_26f')
    .order('created_at', { ascending: false })

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
      conference_type: 'rule_26f',
      conference_date: body.caseInfo?.conferenceDate || new Date().toISOString().split('T')[0],
      conference_time: body.caseInfo?.conferenceTime,
      conference_location: body.caseInfo?.conferenceLocation,
      your_name: body.participants?.yourName,
      opposing_counsel: body.participants?.opposingCounsel,
      topics_discussed: body.agendaItems?.map((item: { id: string; label: string; description: string; notes: string; agreed: boolean | null }) => ({
        topic: item.label,
        description: item.description,
        notes: item.notes,
        outcome: item.agreed === true ? 'agreed' : item.agreed === false ? 'disagreed' : 'pending',
      })),
      additional_notes: JSON.stringify(body),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
