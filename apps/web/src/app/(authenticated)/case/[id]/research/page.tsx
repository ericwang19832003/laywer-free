import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: caseData } = await supabase
    .from('cases')
    .select('id, jurisdiction, dispute_type, court_type, county')
    .eq('id', id)
    .single()

  if (!caseData) redirect('/cases')

  // Fetch existing authorities (preview)
  const { data: rawAuthorities } = await supabase
    .from('case_authorities')
    .select(`
      id,
      cluster_id,
      status,
      added_at,
      cl_case_clusters (
        case_name,
        court_id,
        court_name,
        date_filed,
        citations,
        snippet
      )
    `)
    .eq('case_id', id)
    .order('added_at', { ascending: false })

  // Supabase returns joined table as array; unwrap to single object
  const authorities = (rawAuthorities ?? []).map((a) => ({
    ...a,
    cl_case_clusters: Array.isArray(a.cl_case_clusters)
      ? a.cl_case_clusters[0] ?? null
      : a.cl_case_clusters,
  }))

  const recentAuthorities = authorities.slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-warm-text">Overview</h2>
        <p className="text-sm text-warm-muted mt-1">
          Build your authority library and return here for a quick pulse on research activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-warm-border bg-warm-bg/50">
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">Step 1</p>
            <h3 className="text-lg font-semibold text-warm-text">Search for case law</h3>
            <p className="text-sm text-warm-muted">
              Use filters and context to find authorities tailored to your case.
            </p>
            <Button asChild className="bg-warm-ink text-white hover:bg-warm-ink/90">
              <Link href={`/case/${id}/research/search`}>Go to Search</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-warm-border bg-warm-bg/50">
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">Step 2</p>
            <h3 className="text-lg font-semibold text-warm-text">Ask a research question</h3>
            <p className="text-sm text-warm-muted">
              Ask questions and get citation-backed responses from saved authorities.
            </p>
            <Button asChild variant="outline">
              <Link href={`/case/${id}/research/ask`}>Go to Ask</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-warm-border">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">Recent Authorities</p>
              <h3 className="text-base font-semibold text-warm-text">Saved case law</h3>
            </div>
            <Button asChild variant="ghost">
              <Link href={`/case/${id}/research/authorities`}>Manage</Link>
            </Button>
          </div>

          {recentAuthorities.length === 0 ? (
            <p className="mt-4 text-sm text-warm-muted">
              No authorities saved yet. Start with a search to build your library.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentAuthorities.map((authority) => (
                <li key={authority.id} className="rounded-lg border border-warm-border bg-white px-3 py-2">
                  <p className="text-sm font-medium text-warm-text">
                    {authority.cl_case_clusters?.case_name ?? 'Unknown case'}
                  </p>
                  <p className="text-xs text-warm-muted">
                    {authority.cl_case_clusters?.court_name ?? 'Unknown court'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
