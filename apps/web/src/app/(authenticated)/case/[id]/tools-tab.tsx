import { createClient } from '@/lib/supabase/server'
import { CaseFileCard } from '@/components/dashboard/case-file-card'
import { DiscoveryCard } from '@/components/dashboard/discovery-card'
import { ResearchCard } from '@/components/dashboard/research-card'
import { EmailsCard } from '@/components/dashboard/emails-card'
import { NotesCard } from '@/components/dashboard/notes-card'
import { ShareCaseCard } from '@/components/dashboard/share-case-card'
import { DeleteCaseCard } from '@/components/dashboard/delete-case-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ToolsTabProps {
  caseId: string
}

export async function ToolsTab({ caseId }: ToolsTabProps) {
  try {
  const supabase = await createClient()

  // Fetch all tools data in parallel
  const [discoveryTaskResult, motionTaskResult, motionsCountResult, notesResult, shareResult, authorityResult, evidenceResult, binderResult] = await Promise.all([
    supabase.from('tasks').select('id, status').eq('case_id', caseId).eq('task_key', 'discovery_starter_pack').maybeSingle(),
    supabase.from('tasks').select('id, task_key, title, status').eq('case_id', caseId).in('task_key', ['motion_to_compel', 'trial_prep_checklist', 'appellate_brief']),
    supabase.from('motions').select('*', { count: 'exact', head: true }).eq('case_id', caseId),
    supabase.from('case_notes').select('id, content, pinned, created_at, updated_at').eq('case_id', caseId).order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(10),
    supabase.from('cases').select('share_token, share_enabled').eq('id', caseId).single(),
    supabase.from('case_authorities').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
    supabase.from('evidence_items').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
    supabase.from('trial_binders').select('id', { count: 'exact', head: true }).eq('case_id', caseId),
  ])

  // Discovery pack details
  let discoveryPackCount = 0
  let discoveryServedCount = 0
  let discoveryItemCount = 0

  if (discoveryTaskResult.data?.status === 'completed') {
    const { data: packs } = await supabase.from('discovery_packs').select('id, status').eq('case_id', caseId)
    const packList = packs ?? []
    discoveryPackCount = packList.length
    discoveryServedCount = packList.filter((p: { status: string }) => p.status === 'served').length

    if (packList.length > 0) {
      const { count } = await supabase
        .from('discovery_items')
        .select('id', { count: 'exact', head: true })
        .in('pack_id', packList.map((p: { id: string }) => p.id))
      discoveryItemCount = count ?? 0
    }
  }

  const motionTasks = motionTaskResult.data ?? []
  const motionsCount = motionsCountResult.count ?? 0
  const hasMotionActivity = motionTasks.some(t => t.status !== 'locked') || motionsCount > 0

  return (
    <div className="space-y-6">
      <CaseFileCard
        caseId={caseId}
        evidenceCount={evidenceResult.count ?? 0}
        exhibitCount={0}
        discoveryPackCount={discoveryPackCount}
        binderCount={binderResult.count ?? 0}
      />
      <DiscoveryCard
        caseId={caseId}
        discoveryTask={discoveryTaskResult.data}
        packCount={discoveryPackCount}
        servedCount={discoveryServedCount}
        itemCount={discoveryItemCount}
      />
      <ResearchCard caseId={caseId} authorityCount={authorityResult.count ?? 0} />
      <EmailsCard caseId={caseId} />
      {hasMotionActivity && (
        <Card>
          <CardContent className="pt-5 pb-4 px-5">
            <h3 className="text-sm font-semibold text-warm-text mb-3">Motions</h3>
            {motionTasks
              .filter(t => t.status === 'todo')
              .map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-warm-border last:border-0">
                  <div>
                    <span className="text-sm text-warm-text">{t.title}</span>
                    <span className="text-xs bg-calm-indigo/10 text-calm-indigo px-2 py-0.5 rounded-full ml-2">
                      Suggested
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/case/${caseId}/step/${t.id}`}>Start</Link>
                  </Button>
                </div>
              ))
            }
            {motionsCount > 0 && (
              <p className="text-xs text-warm-muted mt-2">
                {motionsCount} motion{motionsCount !== 1 ? 's' : ''} created
              </p>
            )}
            <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
              <Link href={`/case/${caseId}/motions`}>View Motions Hub &rarr;</Link>
            </Button>
          </CardContent>
        </Card>
      )}
      <NotesCard caseId={caseId} initialNotes={notesResult.data ?? []} />
      <ShareCaseCard
        caseId={caseId}
        initialEnabled={shareResult.data?.share_enabled ?? false}
        initialToken={shareResult.data?.share_token ?? null}
      />
      <DeleteCaseCard caseId={caseId} />
    </div>
  )
  } catch (error) {
    console.error('ToolsTab error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading this tab.</p>
        <p className="text-sm text-warm-muted mb-4">Your case data is safe. Try refreshing the page.</p>
      </div>
    )
  }
}
