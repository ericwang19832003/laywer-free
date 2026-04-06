import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ResearchShell } from '@/components/research/research-shell'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { getDisputeLabel, getCourtLabel } from '@/lib/labels'

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

  // Fetch pi_sub_type for PI cases to show "Property Damage" when applicable
  let piSubType: string | undefined
  if (caseData.dispute_type === 'personal_injury') {
    const { data: piDetails } = await supabase
      .from('personal_injury_details').select('pi_sub_type').eq('case_id', id).maybeSingle()
    piSubType = piDetails?.pi_sub_type ?? undefined
  }

  const disputeLabel = getDisputeLabel(caseData.dispute_type, piSubType)
  const courtLabel = getCourtLabel(caseData.court_type)
  const caseLabelParts = [disputeLabel, caseData.county, courtLabel]
    .filter(Boolean)

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
