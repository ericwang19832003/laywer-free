import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { DashboardTabs } from './dashboard-tabs'
import { FocusTab } from './focus-tab'
import { OverviewTab } from './overview-tab'
import { ToolsTab } from './tools-tab'
import { TabSkeleton } from './tab-skeleton'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caseRow, error } = await supabase
    .from('cases')
    .select('dispute_type, jurisdiction, court_type, county, created_at, outcome')
    .eq('id', id)
    .single()

  if (error || !caseRow) {
    return (
      <div className="min-h-screen bg-warm-bg">
        <main className="mx-auto max-w-2xl px-4 py-10">
          <SupportiveHeader
            title="Case not found"
            subtitle="We couldn't find this case. It may have been removed, or you may not have access."
          />
        </main>
      </div>
    )
  }

  const shared = {
    caseId: id,
    disputeType: caseRow.dispute_type ?? 'other',
    jurisdiction: caseRow.jurisdiction ?? 'TX',
    courtType: caseRow.court_type ?? 'unknown',
    county: caseRow.county ?? null,
    outcome: caseRow.outcome ?? null,
    createdAt: caseRow.created_at ?? null,
  }

  return (
    <div className="bg-warm-bg min-h-full">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="One step at a time."
          subtitle="You're in control. We'll guide the process and track deadlines."
        />

        <DashboardTabs
          focusContent={
            <Suspense fallback={<TabSkeleton />}>
              <FocusTab {...shared} />
            </Suspense>
          }
          overviewContent={
            <Suspense fallback={<TabSkeleton />}>
              <OverviewTab {...shared} />
            </Suspense>
          }
          toolsContent={
            <Suspense fallback={<TabSkeleton />}>
              <ToolsTab caseId={id} />
            </Suspense>
          }
        />

        <LegalDisclaimer />
      </main>
    </div>
  )
}
