import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateICS } from '@/lib/calendar-export'

interface Deadline {
  id: string
  key: string
  label: string | null
  due_at: string
  source: string | null
  consequence: string | null
  rationale: string | null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params
  const result = await getAuthenticatedClient()

  if (!result.ok) {
    return result.error
  }

  const { supabase } = result

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('id, key, label, due_at, source, consequence, rationale')
    .eq('case_id', caseId)
    .order('due_at', { ascending: true })

  if (error || !deadlines) {
    return NextResponse.json(
      { error: 'Failed to fetch deadlines' },
      { status: 500 }
    )
  }

  const events = deadlines.map((deadline: Deadline) => {
    const startDate = new Date(deadline.due_at)
    const description = [
      deadline.source ? `Source: ${deadline.source}` : '',
      deadline.rationale || '',
      deadline.consequence ? `Consequence: ${deadline.consequence}` : '',
      '',
      `Add to calendar: https://lawyerfree.app/case/${caseId}/deadlines`,
    ]
      .filter(Boolean)
      .join('\\n')

    return generateICS({
      title: `[Lawyer Free] ${deadline.label || deadline.key.replace(/_/g, ' ')}`,
      description,
      startDate,
      url: `https://lawyerfree.app/case/${caseId}/deadlines`,
    })
  })

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lawyer Free//Deadlines//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="lawyer-free-deadlines.ics"',
      'Cache-Control': 'no-cache',
    },
  })
}
