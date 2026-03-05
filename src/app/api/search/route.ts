import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: { cases: [], tasks: [], documents: [], deadlines: [] } })
  }

  const auth = await getAuthenticatedClient()
  if (!auth.ok) return auth.error
  const { supabase } = auth

  const escaped = q.replace(/%/g, '\\%').replace(/_/g, '\\_')
  const pattern = `%${escaped}%`

  const [casesResult, tasksResult, documentsResult, deadlinesResult] = await Promise.all([
    supabase
      .from('cases')
      .select('id, county, role, dispute_type, status')
      .eq('status', 'active')
      .or(`county.ilike.${pattern},dispute_type.ilike.${pattern},role.ilike.${pattern}`)
      .limit(5),
    supabase
      .from('tasks')
      .select('id, case_id, task_key, title, status')
      .ilike('title', pattern)
      .limit(5),
    supabase
      .from('court_documents')
      .select('id, case_id, doc_type, original_filename')
      .or(`doc_type.ilike.${pattern},original_filename.ilike.${pattern}`)
      .limit(5),
    supabase
      .from('deadlines')
      .select('id, case_id, key, due_at, source')
      .ilike('key', pattern)
      .limit(5),
  ])

  return NextResponse.json({
    results: {
      cases: casesResult.data ?? [],
      tasks: tasksResult.data ?? [],
      documents: documentsResult.data ?? [],
      deadlines: deadlinesResult.data ?? [],
    },
  })
}
