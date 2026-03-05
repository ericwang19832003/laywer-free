import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseSearchBar } from '@/components/research/case-search-bar'
import { AuthorityList } from '@/components/research/authority-list'
import { ResearchQuestion } from '@/components/research/research-question'

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

  // Fetch existing authorities
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF8' }}>
      <SupportiveHeader
        title="Legal Research"
        subtitle="Search for case law that supports your position."
      />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <CaseSearchBar
          caseId={id}
          caseContext={{
            jurisdiction: caseData.jurisdiction,
            dispute_type: caseData.dispute_type,
            court_type: caseData.court_type,
          }}
        />

        <AuthorityList
          caseId={id}
          initialAuthorities={authorities ?? []}
        />

        <ResearchQuestion caseId={id} />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
