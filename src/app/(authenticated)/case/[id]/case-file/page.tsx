import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CaseFileHub } from '@/components/case-file/case-file-hub'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import type { PipelineStage } from '@/lib/schemas/case-file'

export default async function CaseFilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ stage?: string }>
}) {
  const { id } = await params
  const { stage } = await searchParams
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Fetch initial data in parallel
  const [caseResult, evidenceCountResult, exhibitSetResult, discoveryResult, binderResult] =
    await Promise.all([
      supabase
        .from('cases')
        .select('id, dispute_type, state, role, county, status')
        .eq('id', id)
        .single(),
      supabase
        .from('evidence_items')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', id),
      supabase
        .from('exhibit_sets')
        .select('id, numbering_style, next_number')
        .eq('case_id', id)
        .maybeSingle(),
      supabase
        .from('discovery_packs')
        .select('id, status')
        .eq('case_id', id),
      supabase
        .from('trial_binders')
        .select('id, status')
        .eq('case_id', id),
    ])

  const caseData = caseResult.data
  if (!caseData) redirect('/cases')

  const evidenceCount = evidenceCountResult.count ?? 0
  const setData = exhibitSetResult.data
  const discoveryPacks = discoveryResult.data ?? []
  const binders = binderResult.data ?? []

  // If an exhibit set exists, count its exhibits
  let exhibitCount = 0
  if (setData) {
    const { count } = await supabase
      .from('exhibits')
      .select('id', { count: 'exact', head: true })
      .eq('exhibit_set_id', setData.id)
    exhibitCount = count ?? 0
  }

  // Compute discovery counts
  const discoveryComplete = discoveryPacks.filter(
    (p: { status: string }) => p.status === 'complete'
  ).length
  const bindersReady = binders.filter(
    (b: { status: string }) => b.status === 'ready'
  ).length

  // Validate stage from searchParams
  const validStages: PipelineStage[] = ['collect', 'organize', 'discover', 'prepare']
  const initialStage: PipelineStage = validStages.includes(stage as PipelineStage)
    ? (stage as PipelineStage)
    : 'collect'

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-6xl px-4 py-10">
        <CaseFileHub
          caseId={id}
          caseData={caseData}
          initialStage={initialStage}
          initialCounts={{
            evidence: evidenceCount,
            exhibited: exhibitCount,
            discoveryPacks: discoveryPacks.length,
            discoveryComplete,
            binders: binders.length,
            bindersReady,
          }}
        />
        <LegalDisclaimer />
      </main>
    </div>
  )
}
