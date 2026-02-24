import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export const runtime = 'nodejs'

// GET /api/exhibit-sets/:setId/export?format=csv|json
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  try {
    const { setId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const format = request.nextUrl.searchParams.get('format') || 'csv'
    if (format !== 'csv' && format !== 'json') {
      return NextResponse.json(
        { error: 'Invalid format. Use "csv" or "json".' },
        { status: 422 }
      )
    }

    // Verify exhibit set exists and get case_id (RLS handles ownership)
    const { data: setData, error: setError } = await supabase!
      .from('exhibit_sets')
      .select('id, case_id, title')
      .eq('id', setId)
      .single()

    if (setError || !setData) {
      return NextResponse.json({ error: 'Exhibit set not found' }, { status: 404 })
    }

    // Fetch exhibits joined with evidence_items, sorted by sort_order
    const { data: exhibits, error: fetchError } = await supabase!
      .from('exhibits')
      .select('exhibit_no, sort_order, title, description, evidence_items(file_name, label, notes, created_at)')
      .eq('exhibit_set_id', setId)
      .order('sort_order', { ascending: true })

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch exhibits', details: fetchError.message },
        { status: 500 }
      )
    }

    // Flatten joined evidence data into export rows
    const rows = (exhibits || []).map((ex) => {
      // Supabase returns the FK join as an object (to-one) or array depending on types
      const raw = ex.evidence_items as unknown
      const ev = Array.isArray(raw) ? raw[0] : raw as {
        file_name: string
        label: string | null
        notes: string | null
        created_at: string
      } | null

      return {
        exhibit_no: ex.exhibit_no,
        title: ex.title || ex.description || '',
        evidence_file_name: ev?.file_name || '',
        category: ev?.label || '',
        uploaded_date: ev?.created_at
          ? new Date(ev.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : '',
        notes: ev?.notes || '',
      }
    })

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: setData.case_id,
      kind: 'exhibit_list_exported',
      payload: {
        exhibit_set_id: setId,
        format,
        exhibit_count: rows.length,
      },
    })

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const baseName = `Exhibit_List_${dateStr}`

    if (format === 'json') {
      const body = JSON.stringify({ exhibits: rows }, null, 2)
      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${baseName}.json"`,
        },
      })
    }

    // CSV format
    const csvHeaders = [
      'Exhibit No',
      'Title',
      'Evidence File Name',
      'Category',
      'Uploaded Date',
      'Notes',
    ]
    const csvRows = rows.map((r) =>
      [
        r.exhibit_no,
        r.title,
        r.evidence_file_name,
        r.category,
        r.uploaded_date,
        r.notes,
      ]
        .map(csvEscape)
        .join(',')
    )
    const csv = [csvHeaders.join(','), ...csvRows].join('\r\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseName}.csv"`,
      },
    })
  } catch (err) {
    console.error('Exhibit export error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Escape a value for CSV (RFC 4180) */
function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
