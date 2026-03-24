import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

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
  const result = await getAuthenticatedClient()
  if (!result.ok) {
    return result.error
  }
  const { supabase } = result
  const { id: caseId } = await params

  const { data: deadlines, error } = await supabase
    .from('deadlines')
    .select('id, key, label, due_at, source, consequence, rationale')
    .eq('case_id', caseId)
    .order('due_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!deadlines || deadlines.length === 0) {
    return NextResponse.json({ error: 'No deadlines found' }, { status: 404 })
  }

  const now = new Date()
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    'T',
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
    'Z',
  ].join('')

  const uid = `${now.getTime()}@lawyerfree.app`

  const events = deadlines.map((deadline: Deadline) => {
    const startDate = new Date(deadline.due_at)
    const dateStr = [
      startDate.getFullYear(),
      String(startDate.getMonth() + 1).padStart(2, '0'),
      String(startDate.getDate()).padStart(2, '0'),
    ].join('')

    const description = [
      deadline.source ? `Source: ${deadline.source}` : '',
      deadline.consequence ? `Consequence: ${deadline.consequence}` : '',
      deadline.rationale ? `Rationale: ${deadline.rationale}` : '',
    ].filter(Boolean).join('\\n')

    const eventUid = `${dateStr}-${deadline.id}@lawyerfree.app`

    return `BEGIN:VEVENT
UID:${eventUid}
DTSTAMP:${stamp}
DTSTART;VALUE=DATE:${dateStr}
SUMMARY:${escapeICS(deadline.label || deadline.key)}
DESCRIPTION:${escapeICS(description)}
URL:https://lawyerfree.app/case/${caseId}/deadlines
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:${escapeICS(deadline.label || deadline.key)} is tomorrow
END:VALARM
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
DESCRIPTION:${escapeICS(deadline.label || deadline.key)} is in 7 days
END:VALARM
END:VEVENT`
  }).join('\n')

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Lawyer Free//Deadlines//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="lawyer-free-deadlines.ics"',
    },
  })
}

function escapeICS(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
