import { createClient } from '@/lib/supabase/server'
import { ResearchCard } from '@/components/dashboard/research-card'
import { DiscoveryCard } from '@/components/dashboard/discovery-card'
import { EmailsCard } from '@/components/dashboard/emails-card'
import { NotesCard } from '@/components/dashboard/notes-card'
import { ShareCaseCard } from '@/components/dashboard/share-case-card'
import { AgentAdvisorCard } from '@/components/dashboard/agent-advisor-card'
import { BinderCta } from '@/components/binders/binder-cta'
import { MoreSection } from '@/components/dashboard/more-section'
import { EfilingGuide } from '@/components/filing/efiling-guide'
import { FeeCalculator } from '@/components/filing/fee-calculator'
import { getSubscription } from '@/lib/subscription/check'

interface ToolsTabProps {
  caseId: string
  courtType: string
  county: string | null
  jurisdiction: string
}

export async function ToolsTab({ caseId, courtType, county, jurisdiction }: ToolsTabProps) {
  try {
    const supabase = await createClient()

    const [
      { data: { user } },
      authorityResult,
      packsResult,
      discoveryTaskResult,
      notesResult,
      sharingResult,
      exhibitSetResult,
    ] = await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from('case_authorities')
        .select('id', { count: 'exact', head: true })
        .eq('case_id', caseId),
      supabase
        .from('discovery_packs')
        .select('id, status')
        .eq('case_id', caseId),
      supabase
        .from('tasks')
        .select('id, status')
        .eq('case_id', caseId)
        .eq('task_key', 'discovery_overview')
        .maybeSingle(),
      supabase
        .from('case_notes')
        .select('id, content, pinned, created_at, updated_at')
        .eq('case_id', caseId)
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('case_sharing')
        .select('share_token, share_enabled')
        .eq('case_id', caseId)
        .maybeSingle(),
      supabase
        .from('exhibit_sets')
        .select('id')
        .eq('case_id', caseId)
        .maybeSingle(),
    ])

    const subscription = user ? await getSubscription(supabase, user.id).catch(() => null) : null
    const isPro = subscription?.tier === 'pro' || subscription?.tier === 'essentials'

    const packs = packsResult.data ?? []
    const packCount = packs.length
    const servedCount = packs.filter((p) => p.status === 'served').length

    let packItemsResult: { count: number | null } = { count: 0 }
    if (packCount > 0) {
      const result = await supabase
        .from('discovery_items')
        .select('id', { count: 'exact', head: true })
        .in('pack_id', packs.map((p) => p.id))
      packItemsResult = { count: result.count }
    }

    const exhibitSetId = exhibitSetResult.data?.id ?? null
    const SUPPORTED_STATES = ['TX', 'CA'] as const
    const state = (SUPPORTED_STATES as readonly string[]).includes(jurisdiction) ? (jurisdiction as 'TX' | 'CA') : null
    const normalizedCourtType = courtType.toUpperCase()
    const isFederal = normalizedCourtType === 'FEDERAL'
    // CA DB court types (limited_civil, unlimited_civil) need mapping to fee table keys
    const CA_COURT_MAP: Record<string, string> = {
      UNLIMITED_CIVIL: 'SUPERIOR',
      LIMITED_CIVIL: 'SMALL_CLAIMS',
      SUPERIOR: 'SUPERIOR',
      SMALL_CLAIMS: 'SMALL_CLAIMS',
    }
    const feeCourtType = state === 'CA' ? (CA_COURT_MAP[normalizedCourtType] ?? null) : normalizedCourtType
    const showFiling = !!(state && !isFederal && feeCourtType)

    return (
      <div className="space-y-6">
        <AgentAdvisorCard caseId={caseId} isPro={isPro} />
        <ResearchCard caseId={caseId} authorityCount={authorityResult.count ?? 0} />
        <DiscoveryCard
          caseId={caseId}
          discoveryTask={discoveryTaskResult.data ?? null}
          packCount={packCount}
          servedCount={servedCount}
          itemCount={packItemsResult.count ?? 0}
        />
        <EmailsCard caseId={caseId} />
        <NotesCard caseId={caseId} initialNotes={notesResult.data ?? []} />
        <MoreSection>
          {showFiling && <EfilingGuide state={state!} courtType={feeCourtType!} county={county ?? undefined} />}
          {showFiling && <FeeCalculator courtType={feeCourtType!} county={county ?? ''} state={state!} />}
          <BinderCta caseId={caseId} exhibitSetId={exhibitSetId} />
          <ShareCaseCard
            caseId={caseId}
            initialEnabled={sharingResult.data?.share_enabled ?? false}
            initialToken={sharingResult.data?.share_token ?? null}
          />
        </MoreSection>
      </div>
    )
  } catch (error) {
    console.error('ToolsTab error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading this tab.</p>
        <p className="text-sm text-warm-muted">Try refreshing the page.</p>
      </div>
    )
  }
}
