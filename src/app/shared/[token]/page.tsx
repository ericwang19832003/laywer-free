import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

interface SharedCase {
  id: string
  county: string | null
  court_type: string
  role: string
  dispute_type: string | null
  status: string
  created_at: string
}

interface SharedDeadline {
  key: string
  due_at: string
  source: string | null
}

interface SharedEvent {
  kind: string
  payload: unknown
  created_at: string
}

export default async function SharedCasePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Use SECURITY DEFINER functions — validates token server-side
  const { data: caseData } = await supabase.rpc('get_shared_case', { p_token: token })

  if (!caseData) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-warm-text">Link not available</p>
            <p className="text-xs text-warm-muted mt-2">
              This shared link is no longer active or doesn&apos;t exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const caseRow = caseData as SharedCase

  // Fetch child data via token-validated RPC functions
  const [deadlinesResult, eventsResult] = await Promise.all([
    supabase.rpc('get_shared_case_deadlines', { p_token: token }),
    supabase.rpc('get_shared_case_events', { p_token: token }),
  ])

  const deadlines = (deadlinesResult.data ?? []) as SharedDeadline[]
  const events = (eventsResult.data ?? []) as SharedEvent[]

  const courtLabels: Record<string, string> = {
    jp: 'Justice Court',
    county: 'County Court',
    district: 'District Court',
    unknown: 'Court TBD',
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <nav className="w-full border-b border-warm-border bg-warm-bg/95 px-4 py-3">
        <p className="text-sm font-semibold text-warm-text text-center">Lawyer Free — Shared Case View</p>
      </nav>
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div>
          <p className="text-xs text-warm-muted uppercase tracking-wide">Read-only view</p>
          <h1 className="text-lg font-semibold text-warm-text mt-1">
            {caseRow.dispute_type ?? 'Legal Case'} — {caseRow.county ? `${caseRow.county} County` : 'County TBD'}
          </h1>
          <p className="text-sm text-warm-muted mt-1">
            {courtLabels[caseRow.court_type] ?? 'Court TBD'} · {caseRow.role === 'plaintiff' ? 'Plaintiff' : 'Defendant'} · Created {new Date(caseRow.created_at).toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardContent className="pt-5 pb-4">
            <h2 className="text-sm font-semibold text-warm-text mb-3">Deadlines</h2>
            {deadlines.length === 0 ? (
              <p className="text-sm text-warm-muted">No deadlines set.</p>
            ) : (
              <div className="space-y-2">
                {deadlines.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-warm-text">{d.key.replace(/_/g, ' ')}</span>
                    <span className="text-warm-muted">{new Date(d.due_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <h2 className="text-sm font-semibold text-warm-text mb-3">Recent Activity</h2>
            {events.length === 0 ? (
              <p className="text-sm text-warm-muted">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-warm-text">{e.kind.replace(/_/g, ' ')}</span>
                    <span className="text-warm-muted">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-warm-muted text-center">
          This is a read-only view. Lawyer Free does not provide legal advice.
        </p>
      </main>
    </div>
  )
}
