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

      <Card className="border-warm-border">
        <CardContent className="divide-y divide-warm-border p-0">
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-warm-text text-xs font-bold text-white">
              1
            </div>
            <p className="flex-1 min-w-0 text-sm font-semibold text-warm-text leading-snug">Search for case law</p>
            <Button asChild size="sm" className="flex-shrink-0 bg-warm-text text-white hover:bg-warm-text/90">
              <Link href={`/case/${id}/research/search`}>Search →</Link>
            </Button>
          </div>
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-warm-muted/20 text-xs font-bold text-warm-muted">
              2
            </div>
            <p className="flex-1 min-w-0 text-sm font-semibold text-warm-text leading-snug">Ask a research question</p>
            <Button asChild size="sm" variant="outline" className="flex-shrink-0">
              <Link href={`/case/${id}/research/ask`}>Ask →</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
