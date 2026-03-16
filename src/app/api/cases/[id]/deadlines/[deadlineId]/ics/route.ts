import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { generateICS } from '@/lib/calendar-export'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; deadlineId: string }> }
) {
  try {
    const { id, deadlineId } = await params
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase } = auth

    const { data: deadline, error } = await supabase
      .from('deadlines')
      .select('key, due_at, label, consequence, rationale')
      .eq('id', deadlineId)
      .eq('case_id', id)
      .single()

    if (error || !deadline) {
      return NextResponse.json({ error: 'Deadline not found' }, { status: 404 })
    }

    const title = `Lawyer Free: ${deadline.label || deadline.key.replace(/_/g, ' ')}`
    const description = deadline.consequence || deadline.rationale || 'Court deadline'

    const ics = generateICS({
      title,
      description,
      startDate: new Date(deadline.due_at),
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lawyerfree.app'}/case/${id}/deadlines`,
    })

    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${deadline.key}.ics"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
