# 3-Tab Dashboard Design

**Date:** 2026-05-26  
**Status:** Approved — ready for implementation

## Problem

The current case dashboard (`/case/[id]`) is a single-page vertical card stack in `single-page-dashboard.tsx`. All 12+ cards render stacked, making it hard for users to find what matters. The core value prop (`NextStepCard`) was buried; it was moved to position #1 in commit `932bf63` but the underlying information architecture problem (a card dump) remains.

## Solution

Restructure the dashboard into three tabs — **Focus / Overview / Tools** — using Next.js App Router's server-children-to-client pattern. Each tab is an async Server Component that fetches only its own data. A thin Client Component (`DashboardTabs`) holds tab state and CSS-hides inactive content.

## Content Map

### Above tabs (always visible)
Fetched in `page.tsx`, shown regardless of active tab:
- `CaseStatusStrip` — task counts, upcoming deadlines, risk level
- `PriorityAlertsSection` — urgent escalations
- `PriorityBanners` — time-sensitive warnings (SOL, etc.)

### Focus tab (default)
What 90% of visits need:
- `NextStepCard` (#1 — core value prop)
- `DeadlinesCard`
- `ProgressCard`
- `ProSeBanner` / `BackfillBanner` (low-priority, Focus only)
- `OutcomePrompt` / `SavingsCard`

### Overview tab
Deeper case health picture (currently unused cards):
- `CaseHealthCard` — full score + sub-health bars + 7d/30d trends
- `InsightsCard` — AI-generated case insights
- `StrategyCard` — AI strategic recommendations
- `ConfidenceScoreCard` — confidence breakdown
- `TimelineCard` — case event timeline

### Tools tab
Launcher grid — status summaries with links out to full pages:
- `ResearchCard` (saved authority count → `/research`)
- `DiscoveryCard` (pack counts → `/discovery`)
- `EmailsCard` → `/emails`
- `NotesCard` → case notes
- `ShareCaseCard` → share link
- `FilingInstructionsCard` / `DeliveryTrackingCard` (conditional)

## Architecture

**Approach:** Server-children-to-client (idiomatic Next.js App Router).

`page.tsx` (Server Component) renders three async Server Component trees, each wrapped in `<Suspense>`, and passes them as slots to `<DashboardTabs>` (Client Component). All three tabs stream in parallel on page load — switching tabs is instant (CSS show/hide, no remount, no refetch).

```tsx
// page.tsx (Server Component)
<AboveTabsSection {...aboveTabData} />
<DashboardTabs
  focus={<Suspense fallback={<TabSkeleton />}><FocusTab {...shared} /></Suspense>}
  overview={<Suspense fallback={<TabSkeleton />}><OverviewTab caseId={id} /></Suspense>}
  tools={<Suspense fallback={<TabSkeleton />}><ToolsTab caseId={id} /></Suspense>}
/>
```

### Tab state
- Client-side `useState('Focus')` only — no URL params, no persistence
- Inactive tabs: `hidden` via Tailwind class — already mounted, instant switch

## File Changes

**New files (4):**
```
apps/web/src/app/(authenticated)/case/[id]/focus-tab.tsx
apps/web/src/app/(authenticated)/case/[id]/overview-tab.tsx
apps/web/src/app/(authenticated)/case/[id]/tools-tab.tsx
apps/web/src/components/dashboard/dashboard-tabs.tsx
```

**Modified files (2):**
```
apps/web/src/app/(authenticated)/case/[id]/page.tsx
apps/web/src/app/(authenticated)/case/[id]/single-page-dashboard.tsx  ← deleted
```

**Untouched:** layout.tsx, tab-skeleton.tsx, all existing card components, all other routes.

## Data Flow

| Location | Queries |
|---|---|
| `page.tsx` | `cases` row, `reminder_escalations`, `case_risk_scores` latest, task summary counts, upcoming deadlines count |
| `focus-tab.tsx` | `get_case_dashboard` RPC, `tasks` skipped count |
| `overview-tab.tsx` | `case_risk_scores` (+ 7d/30d history), `case_insights`, `ai_cache` strategy, `case_confidence_scores`, `task_events` for timeline |
| `tools-tab.tsx` | `case_authorities` count, `discovery_packs` count + served, `tasks` discovery task status, `case_notes` count, `case_sharing` token |

## Tab Chrome UI

```
┌─────────────────────────────────────────────┐
│  [CaseStatusStrip]                           │
│  [PriorityAlerts — if any]                   │
│  [PriorityBanners — if any]                  │
├─────────────────────────────────────────────┤
│  Focus    Overview    Tools                  │
│  ──────                                      │
├─────────────────────────────────────────────┤
│  [tab content]                               │
└─────────────────────────────────────────────┘
```

- Active tab: `border-b-2 border-calm-indigo text-calm-indigo`
- Inactive: `border-transparent text-warm-muted hover:text-warm-text`
- No pills, no fills — consistent with existing design system
- Mobile: tabs stretch equally (`flex-1 text-center`)
