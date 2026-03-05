import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResearchShell } from '@/components/research/research-shell'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'

export default async function ResearchLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: caseData } = await supabase
    .from('cases')
    .select('id, dispute_type, county, court_type')
    .eq('id', id)
    .single()

  if (!caseData) redirect('/cases')

  const { count } = await supabase
    .from('case_authorities')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', id)

  const caseLabelParts = [caseData.dispute_type, caseData.county, caseData.court_type]
    .filter(Boolean)
    .map((part) => String(part))

  const caseLabel = caseLabelParts.length > 0
    ? caseLabelParts.join(' · ')
    : 'Case Research'

  return (
    <div className="min-h-screen bg-warm-bg">
      <ResearchShell
        caseId={id}
        caseLabel={caseLabel}
        authorityCount={count ?? 0}
      >
        {children}
        <div className="mt-10">
          <LegalDisclaimer />
        </div>
      </ResearchShell>
    </div>
  )
}
