# Dashboard Simplification Design

**Date:** 2026-05-25  
**Status:** Approved  
**Approach:** B — Single Smart Page

## Problem

The case dashboard is too complex for non-lawyer pro se users. The current design presents:
- A 3-column layout (left sidebar with 33 workflow steps, center with 3 tabs, right contextual sidebar)
- Two separate content areas requiring mental juggling (Focus tab + Overview tab)
- Technical sub-metrics (Case Health with 5 sub-scores, Confidence Score %) that mean nothing to a stressed non-lawyer
- A right sidebar that duplicates information visible elsewhere

Users are stressed, time-poor, and have low legal literacy. They need to know one thing: **what to do right now**.

## Approved Design: Single Smart Page

### Layout Changes

**Remove the right sidebar** (`hidden xl:block w-72` in `case/[id]/layout.tsx`). 

**Collapse the left workflow sidebar** to show only the current phase (not all 33 steps). Steps outside the current phase are hidden by default. This reduces cognitive overwhelm without removing functionality.

**Remove the tab navigation** (Focus / Overview / Tools tabs in `case/[id]/page.tsx`). Everything lives on one scrollable page.

### Page Content Order

1. **Today's Action** — large hero card. One sentence describing what to do next. One CTA button. No sub-cards, no options.

2. **Case Status Strip** — three plain-language pills in a horizontal strip:
   - Deadline status ("Next deadline: 14 days")
   - Stage ("You're in: Pre-Trial Motions")  
   - Strength signal ("Your case looks solid" / "Needs attention")
   
   No sub-metrics. No percentage scores. No radar charts.

3. **Insights & Recommendations** — two cards, capped at 3 items each:
   - "What AI Noticed" (renamed from InsightsCard)
   - "What to Focus On" (renamed from StrategyCard)

4. **Deadlines** — existing DeadlinesCard, no changes needed.

5. **Phase Progress Strip** — compact list of steps in the current phase, showing which are done vs. upcoming. Replaces the ProgressCard.

### Removed Elements

- `CaseHealthCard` and all sub-metrics (Risk Score, Evidence Strength, Procedure Score, Document Score, Timeline Score)
- `ConfidenceScoreCard` (percentage scores confuse non-lawyers)
- `CaseComparisonCard` (too abstract for someone in crisis)
- 3-tab navigation (Focus / Overview / Tools)
- Right sidebar entirely

### Rationale

A pro se user in the middle of a lawsuit is overwhelmed. They don't need 12 data points about their case — they need confidence that the product knows what to do next. Every element removed reduces the chance they close the tab and give up.

The Overview tab already contained the most-visited content. Merging Focus + Overview into one page means zero extra clicks to see everything important.

Plain-language status ("Your case looks solid") tests better than percentage scores with non-lawyers because it matches how they think about risk: binary, not probabilistic.

## Files In Scope

| File | Change |
|------|--------|
| `apps/web/src/app/(authenticated)/case/[id]/layout.tsx` | Remove right sidebar |
| `apps/web/src/app/(authenticated)/case/[id]/page.tsx` | Remove tabs, render single-page content |
| `apps/web/src/components/case/workflow-sidebar.tsx` | Collapse to current phase only |
| `apps/web/src/app/(authenticated)/case/[id]/focus-tab.tsx` | Source of Today's Action + Deadlines |
| `apps/web/src/app/(authenticated)/case/[id]/overview-tab.tsx` | Source of Insights + Status |

New component needed: `apps/web/src/app/(authenticated)/case/[id]/dashboard-page.tsx` — the unified single-page dashboard.

## Success Criteria

- User lands on case page and sees exactly one action to take without scrolling
- No percentage scores visible on default view
- Page renders correctly at 1280px (MacBook Air) with no horizontal scroll
- Left sidebar shows ≤ 8 steps by default (current phase only)
- All existing data (deadlines, insights, strategy) still accessible without extra navigation
