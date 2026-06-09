import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChronologyTimeline } from '@/components/chronology/chronology-timeline'

export default async function ChronologyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: caseRow }, { data: entries }] = await Promise.all([
    supabase.from('cases').select('name, role').eq('id', id).single(),
    supabase.from('chronologies').select('*').eq('case_id', id).order('entry_date'),
  ])

  const perspective = (caseRow?.role === 'defendant' ? 'defendant' : 'plaintiff') as 'plaintiff' | 'defendant'

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-warm-text">Case Chronology</h1>
        <p className="text-sm text-warm-muted mt-1">
          AI-extracted timeline of key events. Events are tagged by significance from your perspective as the {perspective}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
          <CardDescription>
            🔴 Key facts &nbsp;·&nbsp; 🟡 Supporting events &nbsp;·&nbsp; ⚪ Background
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChronologyTimeline
            caseId={id}
            initialEntries={entries ?? []}
            perspective={perspective}
          />
        </CardContent>
      </Card>
    </div>
  )
}
