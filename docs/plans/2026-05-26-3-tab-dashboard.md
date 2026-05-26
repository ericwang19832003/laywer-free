# 3-Tab Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the case dashboard from a single-page card stack into Focus / Overview / Tools tabs, surfacing NextStepCard at position #1 in a clean information hierarchy.

**Architecture:** `page.tsx` (Server Component) fetches above-tabs data and passes three Suspense-wrapped async Server Components (`FocusTab`, `OverviewTab`, `ToolsTab`) as slot props to `DashboardTabs` (Client Component). All three tabs stream in parallel on load. Tab switching is instant via CSS `hidden` — no remount, no refetch.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase SSR (`@supabase/ssr`), Tailwind 4, Vitest + Testing Library

**Design doc:** `docs/plans/2026-05-26-3-tab-dashboard-design.md`

---

### Task 1: `DashboardTabs` client component + tests

**Files:**
- Create: `apps/web/src/components/dashboard/dashboard-tabs.tsx`
- Create: `apps/web/tests/unit/dashboard/dashboard-tabs.test.tsx`

**Step 1: Write the failing test**

```tsx
// apps/web/tests/unit/dashboard/dashboard-tabs.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'

describe('DashboardTabs', () => {
  function setup() {
    return render(
      <DashboardTabs
        focus={<div>focus content</div>}
        overview={<div>overview content</div>}
        tools={<div>tools content</div>}
      />
    )
  }

  it('shows Focus tab content by default', () => {
    setup()
    expect(screen.getByText('focus content')).toBeVisible()
    expect(screen.getByText('overview content')).not.toBeVisible()
    expect(screen.getByText('tools content')).not.toBeVisible()
  })

  it('switches to Overview tab on click', async () => {
    setup()
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }))
    expect(screen.getByText('overview content')).toBeVisible()
    expect(screen.getByText('focus content')).not.toBeVisible()
  })

  it('switches to Tools tab on click', async () => {
    setup()
    await userEvent.click(screen.getByRole('tab', { name: 'Tools' }))
    expect(screen.getByText('tools content')).toBeVisible()
    expect(screen.getByText('focus content')).not.toBeVisible()
  })

  it('marks the active tab as selected', async () => {
    setup()
    expect(screen.getByRole('tab', { name: 'Focus' })).toHaveAttribute('aria-selected', 'true')
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }))
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Focus' })).toHaveAttribute('aria-selected', 'false')
  })
})
```

**Step 2: Run test to verify it fails**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run tests/unit/dashboard/dashboard-tabs.test.tsx
```

Expected: FAIL — `DashboardTabs` not found.

**Step 3: Implement `DashboardTabs`**

```tsx
// apps/web/src/components/dashboard/dashboard-tabs.tsx
'use client'

import { useState } from 'react'

const TABS = ['Focus', 'Overview', 'Tools'] as const
type Tab = typeof TABS[number]

interface DashboardTabsProps {
  focus: React.ReactNode
  overview: React.ReactNode
  tools: React.ReactNode
}

export function DashboardTabs({ focus, overview, tools }: DashboardTabsProps) {
  const [active, setActive] = useState<Tab>('Focus')
  const content = { Focus: focus, Overview: overview, Tools: tools }

  return (
    <div>
      <div role="tablist" className="flex border-b border-warm-border mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              active === tab
                ? 'border-calm-indigo text-calm-indigo'
                : 'border-transparent text-warm-muted hover:text-warm-text'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {TABS.map((tab) => (
        <div key={tab} role="tabpanel" className={active !== tab ? 'hidden' : ''}>
          {content[tab]}
        </div>
      ))}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run tests/unit/dashboard/dashboard-tabs.test.tsx
```

Expected: 4 PASS

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/components/dashboard/dashboard-tabs.tsx apps/web/tests/unit/dashboard/dashboard-tabs.test.tsx
git commit -m "feat: add DashboardTabs client component with tab switching"
```

---

### Task 2: `FocusTab` server component

Migrates content from `single-page-dashboard.tsx`. No logic changes — just a rename and new file location.

**Files:**
- Create: `apps/web/src/app/(authenticated)/case/[id]/focus-tab.tsx`

**Step 1: Create `FocusTab`**

Copy the body of `SinglePageDashboard` into a new `FocusTab` component, keeping all imports and data fetching identical. Only change: rename the exported function.

```tsx
// apps/web/src/app/(authenticated)/case/[id]/focus-tab.tsx
import { createClient } from '@/lib/supabase/server'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { InsightsCard } from '@/components/dashboard/insights-card'
import { StrategyCard } from '@/components/dashboard/strategy-card'
import ProSeBanner from '@/components/dashboard/pro-se-banner'
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
import { OutcomePrompt } from '@/components/dashboard/outcome-prompt'
import { SavingsCard } from '@/components/dashboard/savings-card'
import type { ReminderEscalation } from '@lawyer-free/shared/schemas/reminder-escalation'
import type { DashboardData, SharedCaseData } from './types'

export async function FocusTab({
  caseId,
  disputeType,
  jurisdiction,
  courtType,
  county,
  outcome,
  createdAt,
}: SharedCaseData) {
  try {
    const supabase = await createClient()

    const dashboardResult = await supabase.rpc('get_case_dashboard', { p_case_id: caseId })
    const dashboard = dashboardResult.data as DashboardData | null

    const [insightsResult, strategyResult, taskDescResult, skippedResult] = await Promise.all([
      supabase
        .from('case_insights')
        .select('id, insight_type, title, body, priority, created_at')
        .eq('case_id', caseId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', 'strategy')
        .single(),
      dashboard?.next_task
        ? supabase.from('tasks').select('metadata').eq('id', dashboard.next_task.id).single()
        : Promise.resolve({ data: null }),
      supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', caseId)
        .eq('status', 'skipped'),
    ])

    if (!dashboard) {
      return (
        <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
          <p className="text-warm-text font-medium mb-2">Dashboard data unavailable.</p>
          <p className="text-sm text-warm-muted">Try refreshing the page.</p>
        </div>
      )
    }

    const taskMeta = taskDescResult.data?.metadata as Record<string, unknown> | null
    const taskDescription =
      (taskMeta?.ai_description as
        | { description: string; importance: 'critical' | 'important' | 'helpful' }
        | undefined) ?? null

    const strategyRecs =
      (
        strategyResult.data?.content as {
          recommendations: { title: string; body: string; priority: string }[]
        } | null
      )?.recommendations?.slice(0, 3) ?? null

    const tasksSummary = dashboard.tasks_summary ?? {}
    const totalTasks = Object.values(tasksSummary).reduce((s: number, v) => s + (v as number), 0)
    const completedTasks =
      (tasksSummary.completed as number ?? 0) + (tasksSummary.skipped as number ?? 0)

    return (
      <div className="space-y-6">
        <NextStepCard
          caseId={caseId}
          nextTask={dashboard.next_task}
          taskDescription={taskDescription}
        />
        <DeadlinesCard caseId={caseId} deadlines={dashboard.upcoming_deadlines} />
        <ProgressCard tasksSummary={dashboard.tasks_summary} />
        <InsightsCard caseId={caseId} initialInsights={insightsResult.data ?? []} />
        <StrategyCard
          caseId={caseId}
          recommendations={strategyRecs}
          generatedAt={strategyResult.data?.generated_at ?? null}
        />
        <ProSeBanner />
        <BackfillBanner caseId={caseId} skippedCount={skippedResult.count ?? 0} />
        <OutcomePrompt
          caseId={caseId}
          currentOutcome={outcome}
          allTasksDone={totalTasks > 0 && completedTasks === totalTasks}
        />
        <SavingsCard disputeType={disputeType} outcome={outcome} userTier="free" />
      </div>
    )
  } catch (error) {
    console.error('FocusTab error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading this tab.</p>
        <p className="text-sm text-warm-muted mb-4">Your case data is safe. Try refreshing.</p>
      </div>
    )
  }
}
```

Note: `InsightsCard` and `StrategyCard` are temporarily kept on Focus tab — they move to Overview in Task 3. Keeping them here first ensures zero visual regression during the migration.

**Step 2: Type-check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/app/\(authenticated\)/case/\[id\]/focus-tab.tsx
git commit -m "feat: add FocusTab server component (migrated from single-page-dashboard)"
```

---

### Task 3: `OverviewTab` server component

**Files:**
- Create: `apps/web/src/app/(authenticated)/case/[id]/overview-tab.tsx`

**Step 1: Create `OverviewTab`**

```tsx
// apps/web/src/app/(authenticated)/case/[id]/overview-tab.tsx
import { createClient } from '@/lib/supabase/server'
import { CaseHealthCard } from '@/components/dashboard/case-health-card'
import { InsightsCard } from '@/components/dashboard/insights-card'
import { StrategyCard } from '@/components/dashboard/strategy-card'
import { ConfidenceScoreCard } from '@/components/dashboard/confidence-score-card'
import { TimelineCard } from '@/components/dashboard/timeline-card'
import type { ConfidenceBreakdown } from '@/lib/confidence/types'
import type { TimelineEvent } from '@/components/dashboard/timeline-card'

export async function OverviewTab({ caseId }: { caseId: string }) {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()
    const ago7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const ago30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [
      riskScoreResult,
      score7dResult,
      score30dResult,
      insightsResult,
      strategyResult,
      confidenceResult,
      eventsResult,
    ] = await Promise.all([
      supabase
        .from('case_risk_scores')
        .select('id, overall_score, deadline_risk, response_risk, evidence_risk, activity_risk, risk_level, breakdown, computed_at')
        .eq('case_id', caseId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_risk_scores')
        .select('overall_score')
        .eq('case_id', caseId)
        .lte('computed_at', ago7d)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_risk_scores')
        .select('overall_score')
        .eq('case_id', caseId)
        .lte('computed_at', ago30d)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('case_insights')
        .select('id, insight_type, title, body, priority, created_at')
        .eq('case_id', caseId)
        .eq('dismissed', false)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('ai_cache')
        .select('content, generated_at')
        .eq('case_id', caseId)
        .eq('cache_key', 'strategy')
        .single(),
      supabase
        .from('case_confidence_scores')
        .select('score, breakdown')
        .eq('case_id', caseId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('task_events')
        .select('id, kind, payload, created_at, tasks(title)')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    const strategyRecs =
      (
        strategyResult.data?.content as {
          recommendations: { title: string; body: string; priority: string }[]
        } | null
      )?.recommendations?.slice(0, 3) ?? null

    const events: TimelineEvent[] = (eventsResult.data ?? []).map((e: Record<string, unknown>) => ({
      id: e.id as string,
      kind: e.kind as string,
      payload: e.payload as Record<string, unknown>,
      created_at: e.created_at as string,
      task_title: (e.tasks as { title: string } | null)?.title,
    }))

    return (
      <div className="space-y-6">
        <CaseHealthCard
          caseId={caseId}
          riskScore={riskScoreResult.data}
          score7DaysAgo={score7dResult.data}
          score30DaysAgo={score30dResult.data}
        />
        {confidenceResult.data && (
          <ConfidenceScoreCard
            score={confidenceResult.data.score}
            breakdown={confidenceResult.data.breakdown as ConfidenceBreakdown}
          />
        )}
        <InsightsCard caseId={caseId} initialInsights={insightsResult.data ?? []} />
        <StrategyCard
          caseId={caseId}
          recommendations={strategyRecs}
          generatedAt={strategyResult.data?.generated_at ?? null}
        />
        <TimelineCard caseId={caseId} events={events} />
      </div>
    )
  } catch (error) {
    console.error('OverviewTab error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading this tab.</p>
        <p className="text-sm text-warm-muted">Try refreshing the page.</p>
      </div>
    )
  }
}
```

**Step 2: Type-check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/app/\(authenticated\)/case/\[id\]/overview-tab.tsx
git commit -m "feat: add OverviewTab server component (health, insights, confidence, timeline)"
```

---

### Task 4: `ToolsTab` server component

**Files:**
- Create: `apps/web/src/app/(authenticated)/case/[id]/tools-tab.tsx`

**Step 1: Create `ToolsTab`**

```tsx
// apps/web/src/app/(authenticated)/case/[id]/tools-tab.tsx
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
      discoveryResult,
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

    const packs = discoveryResult.data ?? []
    const packCount = packs.length
    const servedCount = packs.filter((p: { status: string }) => p.status === 'served').length

    const packItemsResult = packCount > 0
      ? await supabase
          .from('discovery_items')
          .select('id', { count: 'exact', head: true })
          .in('pack_id', packs.map((p: { id: string }) => p.id))
      : { count: 0 }

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
```

**Step 2: Type-check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/app/\(authenticated\)/case/\[id\]/tools-tab.tsx
git commit -m "feat: add ToolsTab server component (research, discovery, emails, notes, share)"
```

---

### Task 5: Restructure `page.tsx`

Wire `DashboardTabs` with all three tab slots. Fetch above-tabs data in `page.tsx`.

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/page.tsx`

**Step 1: Rewrite `page.tsx`**

```tsx
// apps/web/src/app/(authenticated)/case/[id]/page.tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { CaseStatusStrip } from '@/components/dashboard/case-status-strip'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
import { PriorityBanners } from '@/components/dashboard/priority-banners'
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs'
import { FocusTab } from './focus-tab'
import { OverviewTab } from './overview-tab'
import { ToolsTab } from './tools-tab'
import { TabSkeleton } from './tab-skeleton'
import type { ReminderEscalation } from '@lawyer-free/shared/schemas/reminder-escalation'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: caseRow, error },
    { data: escalationRows },
    { data: riskScore },
    { data: taskRows },
    { data: upcomingDeadlines },
  ] = await Promise.all([
    supabase
      .from('cases')
      .select('dispute_type, jurisdiction, court_type, county, created_at, outcome')
      .eq('id', id)
      .single(),
    supabase
      .from('reminder_escalations')
      .select('id, case_id, deadline_id, escalation_level, message, triggered_at, deadlines(due_at, key)')
      .eq('case_id', id)
      .eq('acknowledged', false)
      .order('escalation_level', { ascending: false })
      .order('triggered_at', { ascending: false }),
    supabase
      .from('case_risk_scores')
      .select('risk_level')
      .eq('case_id', id)
      .order('computed_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('tasks')
      .select('status')
      .eq('case_id', id),
    supabase
      .from('deadlines')
      .select('due_at, label')
      .eq('case_id', id)
      .gte('due_at', new Date().toISOString())
      .order('due_at', { ascending: true })
      .limit(3),
  ])

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

  const alerts: ReminderEscalation[] = (escalationRows ?? []).map(
    (row: Record<string, unknown>) => {
      const deadline = row.deadlines as { due_at: string; key: string } | null
      return {
        id: row.id as string,
        case_id: row.case_id as string,
        deadline_id: (row.deadline_id as string | null) ?? null,
        escalation_level: row.escalation_level as number,
        message: row.message as string,
        triggered_at: row.triggered_at as string,
        due_at: deadline?.due_at ?? '',
        deadline_key: deadline?.key ?? '',
      }
    }
  )

  const tasksSummary = (taskRows ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="bg-warm-bg min-h-full">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="One step at a time."
          subtitle="You're in control. We'll guide the process and track deadlines."
        />

        <div className="space-y-4 mb-6">
          <CaseStatusStrip
            upcomingDeadlines={upcomingDeadlines ?? []}
            tasksSummary={tasksSummary}
            riskLevel={riskScore?.risk_level}
          />
          <PriorityAlertsSection caseId={id} alerts={alerts} />
          <PriorityBanners
            caseId={id}
            disputeType={shared.disputeType}
            jurisdiction={shared.jurisdiction}
            courtType={shared.courtType}
            county={shared.county}
            placement="focus"
          />
        </div>

        <DashboardTabs
          focus={
            <Suspense fallback={<TabSkeleton />}>
              <FocusTab {...shared} />
            </Suspense>
          }
          overview={
            <Suspense fallback={<TabSkeleton />}>
              <OverviewTab caseId={id} />
            </Suspense>
          }
          tools={
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
```

**Step 2: Type-check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors

**Step 3: Build**

```bash
cd "/Users/minwang/lawyer free" && npx turbo build --filter=@lawyer-free/web 2>&1 | tail -30
```

Expected: `✓ Compiled successfully`

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "feat: wire DashboardTabs into page.tsx with above-tabs section"
```

---

### Task 6: Delete `single-page-dashboard.tsx`

All content has migrated to `FocusTab`. The old file is now dead code.

**Files:**
- Delete: `apps/web/src/app/(authenticated)/case/[id]/single-page-dashboard.tsx`

**Step 1: Delete the file**

```bash
rm "/Users/minwang/lawyer free/apps/web/src/app/(authenticated)/case/[id]/single-page-dashboard.tsx"
```

**Step 2: Confirm no remaining imports**

```bash
grep -r "single-page-dashboard" "/Users/minwang/lawyer free/apps/web/src"
```

Expected: no output

**Step 3: Type-check + build**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -20
cd "/Users/minwang/lawyer free" && npx turbo build --filter=@lawyer-free/web 2>&1 | tail -20
```

Expected: clean

**Step 4: Run all unit tests**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run
```

Expected: all pass

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add -A
git commit -m "feat: complete 3-tab dashboard — remove single-page-dashboard"
```

---

## Done Criteria

- [ ] `DashboardTabs` passes 4 unit tests
- [ ] Focus tab renders `NextStepCard` at position #1
- [ ] Overview tab renders `CaseHealthCard`, `ConfidenceScoreCard`, `InsightsCard`, `StrategyCard`, `TimelineCard`
- [ ] Tools tab renders `ResearchCard`, `DiscoveryCard`, `EmailsCard`, `NotesCard`, `ShareCaseCard`
- [ ] `CaseStatusStrip` + `PriorityAlertsSection` + `PriorityBanners` appear above tabs on all tabs
- [ ] Tab switching is instant (no loading states after initial load)
- [ ] `single-page-dashboard.tsx` deleted
- [ ] `npx tsc --noEmit` clean
- [ ] `npx turbo build --filter=@lawyer-free/web` succeeds
- [ ] All unit tests pass
