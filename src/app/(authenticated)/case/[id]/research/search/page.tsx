import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CaseSearchBar } from '@/components/research/case-search-bar'

export default async function ResearchSearchPage({
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
    .select('id, jurisdiction, dispute_type, court_type')
    .eq('id', id)
    .single()

  if (!caseData) redirect('/cases')

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-warm-text">Search</h2>
        <p className="text-sm text-warm-muted mt-1">
          Use case-specific context to find relevant authorities.
        </p>
      </div>

      <CaseSearchBar
        caseId={id}
        caseContext={{
          jurisdiction: caseData.jurisdiction,
          dispute_type: caseData.dispute_type,
          court_type: caseData.court_type,
        }}
      />
    </div>
  )
}
