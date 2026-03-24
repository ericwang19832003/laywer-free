import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET() {
  try {
    const auth = await getAuthenticatedClient()
    if (!auth.ok) return auth.error
    const { supabase, user } = auth

    const userId = user.id

    // First, fetch the user's case IDs
    const { data: userCases } = await supabase
      .from('cases')
      .select('id')
      .eq('user_id', userId)

    const caseIds = (userCases ?? []).map((c) => c.id)

    // Fetch all user data in parallel
    const [cases, tasks, deadlines, events, notes, documents, communications] = await Promise.all([
      supabase.from('cases').select('id, user_id, role, court_type, dispute_type, county, state, status, description, outcome, incident_date, created_at, updated_at').eq('user_id', userId).limit(10000),
      caseIds.length > 0
        ? supabase.from('tasks').select('id, case_id, task_key, status, completed_at, created_at').in('case_id', caseIds).limit(10000)
        : Promise.resolve({ data: [] }),
      caseIds.length > 0
        ? supabase.from('deadlines').select('id, case_id, key, due_at, rationale, created_at').in('case_id', caseIds).limit(10000)
        : Promise.resolve({ data: [] }),
      caseIds.length > 0
        ? supabase.from('task_events').select('id, case_id, kind, payload, created_at').in('case_id', caseIds).limit(10000)
        : Promise.resolve({ data: [] }),
      supabase.from('case_notes').select('id, user_id, case_id, title, body, created_at, updated_at').eq('user_id', userId).limit(10000),
      caseIds.length > 0
        ? supabase.from('court_documents').select('id, case_id, file_name, doc_type, created_at').in('case_id', caseIds).limit(10000)
        : Promise.resolve({ data: [] }),
      caseIds.length > 0
        ? supabase.from('communications').select('id, case_id, direction, channel, subject, body, sent_at, created_at').in('case_id', caseIds).limit(10000)
        : Promise.resolve({ data: [] }),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user: { id: userId, email: user.email },
      cases: cases.data ?? [],
      tasks: tasks.data ?? [],
      deadlines: deadlines.data ?? [],
      events: events.data ?? [],
      notes: notes.data ?? [],
      documents: documents.data ?? [],
      communications: communications.data ?? [],
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lawyer-free-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
