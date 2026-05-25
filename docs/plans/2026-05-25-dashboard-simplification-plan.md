# Dashboard Simplification Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 3-tab, 3-column case dashboard with a single scrollable page that shows stressed non-lawyers exactly one action to take, removing technical sub-metrics they can't interpret.

**Architecture:** Remove the right sidebar from the case layout, auto-collapse the workflow sidebar to the current phase, then replace the `DashboardTabs` component in `page.tsx` with a new `SinglePageDashboard` server component that merges FocusTab + selected OverviewTab content in a fixed order. No new DB tables or API routes needed.

**Tech Stack:** Next.js App Router (Server Components), Supabase server client, Tailwind CSS, shadcn/ui Card + Badge

---

### Task 1: Remove the right context sidebar from case layout

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/layout.tsx`

**Step 1: Identify what to remove**

The right sidebar is the `<aside className="hidden xl:block w-72...">` block at lines 100-113.
The queries that fed it (and are no longer needed) are: `deadline` (line 36-40), `riskScore` (line 41-47).
`piDetails`, `familyDetails`, `businessDetails` must stay — they compute `phaseKey` for the WorkflowSidebar.
`currentTaskKey` (lines 82-88) was only passed to `ContextSidebar` — remove it.

**Step 2: Edit layout.tsx**

Remove from the `Promise.all` destructure and queries:
- Remove `{ data: deadline }` and its `.from('deadlines')` query (lines 36-40)
- Remove `{ data: riskScore }` and its `.from('case_risk_scores')` query (lines 41-47)

Remove the variables:
- Remove `currentTaskKey` block (lines 82-88)

Remove from imports:
- Remove `import { ContextSidebar } from '@/components/case/context-sidebar'`

Remove from JSX:
- Remove the entire right `<aside>` block (lines 100-113)

Final Promise.all should look like:
```tsx
const [{ data: tasks }, { data: caseRow }, { data: piDetails }, { data: familyDetails }, { data: businessDetails }] =
  await Promise.all([
    supabase
      .from('tasks')
      .select('id, task_key, title, status')
      .eq('case_id', id)
      .order('created_at', { ascending: true }),
    supabase
      .from('cases')
      .select('dispute_type, court_type, county, jurisdiction')
      .eq('id', id)
      .single(),
    supabase
      .from('personal_injury_details')
      .select('pi_sub_type')
      .eq('case_id', id)
      .maybeSingle(),
    supabase
      .from('family_case_details')
      .select('family_sub_type')
      .eq('case_id', id)
      .maybeSingle(),
    supabase
      .from('business_details')
      .select('business_sub_type')
      .eq('case_id', id)
      .maybeSingle(),
  ])
```

Final JSX return (remove right aside, keep everything else):
```tsx
return (
  <>
    <div className="flex min-h-[calc(100vh-3.5rem)] pb-24 lg:pb-0">
      <aside className="hidden lg:block w-64 shrink-0 bg-warm-bg shadow-[1px_0_3px_0_rgba(0,0,0,0.04)] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <WorkflowSidebar caseId={id} tasks={taskList} phases={phases} />
      </aside>

      <main className="flex-1 min-w-0 bg-warm-bg" id="main-content">
        {children}
      </main>

      <MobileSidebarDrawer caseId={id} tasks={taskList} phases={phases} />
    </div>
    <MobileNav caseId={id} />
    <BottomNav caseId={id} />
  </>
)
```

**Step 3: Verify TypeScript compiles**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors about `ContextSidebar`, `riskScore`, `deadline`, `currentTaskKey`.

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/app/\(authenticated\)/case/\[id\]/layout.tsx
git commit -m "feat: remove right context sidebar from case layout"
```

---

### Task 2: Collapse WorkflowSidebar to current phase by default

**Files:**
- Modify: `apps/web/src/components/case/workflow-sidebar.tsx:189-198`

**Step 1: Understand current collapse logic**

Lines 189-198 build `initialCollapsed`: a Set of phase indices that start collapsed. Currently it only collapses phases where ALL tasks are done (completed or skipped).

New rule: collapse ALL phases except the current one (where `phaseIdx === currentPhaseIdx`). Users can still click a phase header to expand it.

**Step 2: Edit the initialCollapsed block**

Replace lines 189-198:
```tsx
const initialCollapsed = new Set<number>()
phases.forEach((phase, idx) => {
  const phaseTasks = phase.taskKeys
    .map((k) => taskMap.get(k))
    .filter(Boolean) as SidebarTask[]
  const allDone =
    phaseTasks.length > 0 &&
    phaseTasks.every((t) => t.status === 'completed' || t.status === 'skipped')
  if (allDone) initialCollapsed.add(idx)
})
```

With:
```tsx
const initialCollapsed = new Set<number>()
phases.forEach((_, idx) => {
  if (idx !== currentPhaseIdx) initialCollapsed.add(idx)
})
```

This collapses every phase except the current one on first render.

**Step 3: Verify TypeScript compiles**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors.

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/components/case/workflow-sidebar.tsx
git commit -m "feat: collapse workflow sidebar to current phase by default"
```

---

### Task 3: Create CaseStatusStrip component

**Files:**
- Create: `apps/web/src/components/dashboard/case-status-strip.tsx`

**Step 1: Understand the data shape**

The strip needs three pills:
1. **Deadline pill**: from `upcomingDeadlines[0]` — compute days until due and show "Next deadline: X days" or "No upcoming deadlines"
2. **Progress pill**: from `tasksSummary` — "X of Y steps done"
3. **Strength pill**: from `riskLevel` — map to plain English:
   - `'low'` → "Your case looks solid"
   - `'medium'` → "A few things to watch"  
   - `'high'` → "Needs your attention"
   - `null/undefined` → "Still gathering data"

**Step 2: Create the component**

```tsx
// apps/web/src/components/dashboard/case-status-strip.tsx
import { differenceInCalendarDays } from 'date-fns'

interface CaseStatusStripProps {
  upcomingDeadlines: Array<{ due_at: string; label: string | null }>
  tasksSummary: Record<string, number>
  riskLevel: string | null | undefined
}

function deadlineText(deadlines: Array<{ due_at: string; label: string | null }>): string {
  if (!deadlines.length) return 'No upcoming deadlines'
  const days = differenceInCalendarDays(new Date(deadlines[0].due_at), new Date())
  if (days === 0) return 'Deadline today'
  if (days === 1) return 'Deadline tomorrow'
  if (days < 0) return 'Deadline passed'
  return `Next deadline: ${days} days`
}

function progressText(tasksSummary: Record<string, number>): string {
  const total = Object.values(tasksSummary).reduce((s, v) => s + v, 0)
  const done = (tasksSummary['completed'] ?? 0) + (tasksSummary['skipped'] ?? 0)
  if (total === 0) return 'Getting started'
  return `${done} of ${total} steps done`
}

function strengthText(riskLevel: string | null | undefined): { text: string; color: string } {
  switch (riskLevel) {
    case 'low': return { text: 'Your case looks solid', color: 'bg-calm-green/10 text-calm-green' }
    case 'medium': return { text: 'A few things to watch', color: 'bg-calm-amber/10 text-calm-amber' }
    case 'high': return { text: 'Needs your attention', color: 'bg-red-100 text-red-700' }
    default: return { text: 'Still gathering data', color: 'bg-warm-border/40 text-warm-muted' }
  }
}

export function CaseStatusStrip({ upcomingDeadlines, tasksSummary, riskLevel }: CaseStatusStripProps) {
  const strength = strengthText(riskLevel)

  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center rounded-full bg-calm-indigo/10 px-3 py-1 text-xs font-medium text-calm-indigo">
        {deadlineText(upcomingDeadlines)}
      </span>
      <span className="inline-flex items-center rounded-full bg-warm-border/40 px-3 py-1 text-xs font-medium text-warm-muted">
        {progressText(tasksSummary)}
      </span>
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${strength.color}`}>
        {strength.text}
      </span>
    </div>
  )
}
```

Note: `date-fns` is already installed in the project (check with `ls node_modules/date-fns`). If not available, implement `differenceInCalendarDays` inline:
```tsx
function differenceInCalendarDays(a: Date, b: Date): number {
  const msPerDay = 86400000
  return Math.floor((a.setHours(0,0,0,0) - b.setHours(0,0,0,0)) / msPerDay)
}
```

**Step 3: Verify date-fns is available**

```bash
ls "/Users/minwang/lawyer free/node_modules/date-fns" 2>/dev/null && echo "available" || echo "not found"
```

If not found, use the inline implementation instead.

**Step 4: Verify TypeScript compiles**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -20
```

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/components/dashboard/case-status-strip.tsx
git commit -m "feat: add CaseStatusStrip component with 3 plain-language pills"
```

---

### Task 4: Create SinglePageDashboard server component

**Files:**
- Create: `apps/web/src/app/(authenticated)/case/[id]/single-page-dashboard.tsx`

**Step 1: Understand the data requirements**

The new dashboard needs data from both the old FocusTab and parts of OverviewTab:

- `get_case_dashboard` RPC → `next_task`, `upcoming_deadlines`, `tasks_summary` (for CaseStatusStrip, NextStepCard, DeadlinesCard)
- `reminder_escalations` → alerts for PriorityAlertsSection
- `case_risk_scores` → `risk_level` for CaseStatusStrip strength pill
- `tasks` (task description metadata) → for NextStepCard AI description
- `tasks` (skipped count) → for BackfillBanner
- `case_insights` limit 3 → for InsightsCard
- `ai_cache` strategy → for StrategyCard (slice to 3)

**NOT needed** (removed features):
- `ai_cache` health_tips (fed CaseHealthCard — removed)
- `case_risk_scores` 7d/30d comparison (fed CaseHealthCard trends — removed)
- `computeConfidenceScore` (fed ConfidenceScoreCard — removed)
- `evidence_items` count (fed CaseComparisonCard — removed)
- `ai_cache` timeline_summary (fed TimelineCard — removed)

**Step 2: Create the component**

```tsx
// apps/web/src/app/(authenticated)/case/[id]/single-page-dashboard.tsx
import { createClient } from '@/lib/supabase/server'
import { NextStepCard } from '@/components/dashboard/next-step-card'
import { DeadlinesCard } from '@/components/dashboard/deadlines-card'
import { ProgressCard } from '@/components/dashboard/progress-card'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
import { InsightsCard } from '@/components/dashboard/insights-card'
import { StrategyCard } from '@/components/dashboard/strategy-card'
import { PriorityBanners } from '@/components/dashboard/priority-banners'
import ProSeBanner from '@/components/dashboard/pro-se-banner'
import { BackfillBanner } from '@/components/dashboard/backfill-banner'
import { OutcomePrompt } from '@/components/dashboard/outcome-prompt'
import { SavingsCard } from '@/components/dashboard/savings-card'
import { CaseStatusStrip } from '@/components/dashboard/case-status-strip'
import type { ReminderEscalation } from '@lawyer-free/shared/schemas/reminder-escalation'
import type { DashboardData, SharedCaseData } from './types'

export async function SinglePageDashboard({
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

    const [
      escalationResult,
      riskScoreResult,
      insightsResult,
      strategyResult,
      taskDescResult,
      skippedResult,
    ] = await Promise.all([
      supabase
        .from('reminder_escalations')
        .select('id, case_id, deadline_id, escalation_level, message, triggered_at, deadlines(due_at, key)')
        .eq('case_id', caseId)
        .eq('acknowledged', false)
        .order('escalation_level', { ascending: false })
        .order('triggered_at', { ascending: false }),
      supabase
        .from('case_risk_scores')
        .select('risk_level')
        .eq('case_id', caseId)
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
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

    const alerts: ReminderEscalation[] = (escalationResult.data ?? []).map(
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
        {/* 1. Today's Action */}
        <NextStepCard
          caseId={caseId}
          nextTask={dashboard.next_task}
          taskDescription={taskDescription}
        />

        {/* 2. Case Status Strip */}
        <CaseStatusStrip
          upcomingDeadlines={dashboard.upcoming_deadlines}
          tasksSummary={tasksSummary}
          riskLevel={riskScoreResult.data?.risk_level}
        />

        {/* Priority alerts (urgent, stays near top) */}
        <PriorityAlertsSection caseId={caseId} alerts={alerts} />

        <PriorityBanners
          caseId={caseId}
          disputeType={disputeType}
          jurisdiction={jurisdiction}
          courtType={courtType}
          county={county}
          placement="focus"
        />

        {/* 3. Insights & Recommendations */}
        <InsightsCard caseId={caseId} initialInsights={insightsResult.data ?? []} />
        <StrategyCard
          caseId={caseId}
          recommendations={strategyRecs}
          generatedAt={strategyResult.data?.generated_at ?? null}
        />

        {/* 4. Deadlines */}
        <DeadlinesCard caseId={caseId} deadlines={dashboard.upcoming_deadlines} />

        {/* 5. Progress */}
        <ProgressCard tasksSummary={dashboard.tasks_summary} />

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
    console.error('SinglePageDashboard error:', error)
    return (
      <div className="rounded-xl border border-warm-border bg-white p-6 text-center">
        <p className="text-warm-text font-medium mb-2">Something went wrong loading the dashboard.</p>
        <p className="text-sm text-warm-muted mb-4">Your case data is safe. Try refreshing the page.</p>
      </div>
    )
  }
}
```

**Step 3: Verify TypeScript compiles**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/app/\(authenticated\)/case/\[id\]/single-page-dashboard.tsx
git commit -m "feat: add SinglePageDashboard server component"
```

---

### Task 5: Replace DashboardTabs in page.tsx with SinglePageDashboard

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/page.tsx`

**Step 1: Understand current page.tsx**

Current `page.tsx` (lines 1-78):
- Imports: `DashboardTabs`, `FocusTab`, `OverviewTab`, `ToolsTab`, `TabSkeleton`
- Renders: `SupportiveHeader` + `DashboardTabs` (with Suspense-wrapped tabs)

New `page.tsx`:
- Remove: `DashboardTabs`, `FocusTab`, `OverviewTab`, `ToolsTab`, `TabSkeleton` imports
- Add: `SinglePageDashboard` import
- Wrap `SinglePageDashboard` in `Suspense`

**Step 2: Write the new page.tsx**

```tsx
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'
import { SinglePageDashboard } from './single-page-dashboard'
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

        <Suspense fallback={<TabSkeleton />}>
          <SinglePageDashboard {...shared} />
        </Suspense>

        <LegalDisclaimer />
      </main>
    </div>
  )
}
```

**Step 3: Verify TypeScript compiles**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors. The old tab components (`FocusTab`, `OverviewTab`, `ToolsTab`, `DashboardTabs`) are no longer imported by page.tsx. They still exist on disk — don't delete them yet until the new page is verified in browser.

**Step 4: Start dev server and verify in browser**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npm run dev
```

Open `http://localhost:3000` and navigate to a case page. Verify:
- [ ] No tab bar visible (Focus / Overview / Tools tabs gone)
- [ ] No right sidebar visible at any screen width
- [ ] Workflow sidebar shows only current phase expanded
- [ ] Three status pills visible (deadline, progress, strength)
- [ ] NextStepCard at top with single CTA
- [ ] InsightsCard and StrategyCard visible
- [ ] DeadlinesCard visible
- [ ] No CaseHealthCard sub-metrics
- [ ] No ConfidenceScoreCard percentage

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add apps/web/src/app/\(authenticated\)/case/\[id\]/page.tsx
git commit -m "feat: replace 3-tab dashboard with single-page layout"
```

---

### Task 6: Clean up unused tab components (optional, after browser verification)

**Files:**
- These are now unused by `page.tsx` but still on disk:
  - `apps/web/src/app/(authenticated)/case/[id]/dashboard-tabs.tsx`
  - `apps/web/src/app/(authenticated)/case/[id]/focus-tab.tsx`
  - `apps/web/src/app/(authenticated)/case/[id]/overview-tab.tsx`
  - `apps/web/src/app/(authenticated)/case/[id]/tab-skeleton.tsx` — still used by new page.tsx as Suspense fallback, keep it

**Step 1: Check nothing else imports the tab files**

```bash
grep -r "DashboardTabs\|FocusTab\|OverviewTab" "/Users/minwang/lawyer free/apps/web/src" --include="*.tsx" --include="*.ts"
```
Expected: only the files themselves, no external imports.

Note: `ToolsTab` may be linked from mobile nav or other routes — check before deleting:
```bash
grep -r "ToolsTab\|tools-tab" "/Users/minwang/lawyer free/apps/web/src" --include="*.tsx" --include="*.ts"
```

**Step 2: Delete unused files if confirmed safe**

Only delete if grep above shows zero external imports:
```bash
rm "/Users/minwang/lawyer free/apps/web/src/app/(authenticated)/case/[id]/dashboard-tabs.tsx"
rm "/Users/minwang/lawyer free/apps/web/src/app/(authenticated)/case/[id]/focus-tab.tsx"
rm "/Users/minwang/lawyer free/apps/web/src/app/(authenticated)/case/[id]/overview-tab.tsx"
```

Keep `tools-tab.tsx` if it's referenced anywhere (Tools content may be reachable from BottomNav).

**Step 3: Verify TypeScript still compiles after deletion**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add -A
git commit -m "chore: remove unused tab components after dashboard simplification"
```

---

## Testing Checklist

After completing all tasks, verify in browser:

**Layout**
- [ ] Case page has 2 columns (sidebar + main), not 3 — no right panel at any width
- [ ] Left sidebar shows current phase steps only (other phases collapsed, expandable)
- [ ] Page scrolls naturally, no overflow or horizontal scroll at 1280px

**Status Strip**
- [ ] Deadline pill shows "Next deadline: X days" or "No upcoming deadlines"
- [ ] Progress pill shows "X of Y steps done"
- [ ] Strength pill shows plain-language text (not a percentage)

**Content**
- [ ] NextStepCard is the first content block after the header
- [ ] InsightsCard shows ≤ 3 insights
- [ ] StrategyCard shows ≤ 3 recommendations
- [ ] DeadlinesCard visible
- [ ] ProgressCard visible
- [ ] CaseHealthCard NOT visible
- [ ] ConfidenceScoreCard NOT visible
- [ ] CaseComparisonCard NOT visible
- [ ] No "Focus / Overview / Tools" tab bar

**Edge cases**
- [ ] Case with no upcoming deadlines: status strip still renders (shows "No upcoming deadlines")
- [ ] Case with no risk score yet: strength pill shows "Still gathering data"
- [ ] Case with no next step (all done): NextStepCard handles gracefully
