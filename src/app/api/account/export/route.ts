import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const userId = user!.id

    // First, fetch the user's case IDs
    const { data: userCases } = await supabase!
      .from('cases')
      .select('id')
      .eq('user_id', userId)

    const caseIds = (userCases ?? []).map((c) => c.id)

    // Fetch all user data in parallel
    const [cases, tasks, deadlines, events, notes, documents, communications] = await Promise.all([
      supabase!.from('cases').select('*').eq('user_id', userId),
      caseIds.length > 0
        ? supabase!.from('tasks').select('*').in('case_id', caseIds)
        : Promise.resolve({ data: [] }),
      caseIds.length > 0
        ? supabase!.from('deadlines').select('*').in('case_id', caseIds)
        : Promise.resolve({ data: [] }),
      caseIds.length > 0
        ? supabase!.from('task_events').select('*').in('case_id', caseIds)
        : Promise.resolve({ data: [] }),
      supabase!.from('case_notes').select('*').eq('user_id', userId),
      caseIds.length > 0
        ? supabase!.from('court_documents').select('id, case_id, file_name, doc_type, created_at').in('case_id', caseIds)
        : Promise.resolve({ data: [] }),
      caseIds.length > 0
        ? supabase!.from('communications').select('*').in('case_id', caseIds)
        : Promise.resolve({ data: [] }),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user: { id: userId, email: user!.email },
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
