import { createClient } from '@/lib/supabase/server'
import { ResearchCard } from '@/components/dashboard/research-card'
import { DiscoveryCard } from '@/components/dashboard/discovery-card'
import { EmailsCard } from '@/components/dashboard/emails-card'
import { NotesCard } from '@/components/dashboard/notes-card'
import { ShareCaseCard } from '@/components/dashboard/share-case-card'

export async function ToolsTab({ caseId }: { caseId: string }) {
  try {
    const supabase = await createClient()

    const [
      authorityResult,
      packsResult,
      discoveryTaskResult,
      notesResult,
      sharingResult,
    ] = await Promise.all([
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
    ])

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

    return (
      <div className="space-y-6">
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
        <ShareCaseCard
          caseId={caseId}
          initialEnabled={sharingResult.data?.share_enabled ?? false}
          initialToken={sharingResult.data?.share_token ?? null}
        />
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
