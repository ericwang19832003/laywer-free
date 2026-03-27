# Dashboard Analytics, Audit Log & Activity Feed Design

**Date:** 2026-03-03
**Status:** Approved

## Goal

Add dashboard analytics to the cases list page, a unified activity/audit log page per case, and enhance the timeline card with load-more support.

## Feature 1: Dashboard Analytics (Enhanced /cases Page)

**Architecture:** Enhance the existing `/cases` page with aggregate stats cards above the case list and richer per-case cards. No new tables — query existing `tasks`, `deadlines`, `case_risk_scores`, and `task_events` server-side.

**Stats section:** 4 stat cards in a responsive grid above the case list:
- Active Cases — count
- Tasks Completed — completed/total across all cases
- Upcoming Deadlines — count within 7 days
- Average Health — mean overall_score from latest risk scores

**Enhanced CaseCard:** Shows county, role badge, court type, dispute type, health score badge (color-coded), next deadline, task progress (X/Y), last activity relative time.

## Feature 2: Unified Activity Page

**Architecture:** New `/case/[id]/activity` page consuming the existing paginated `GET /api/cases/[id]/timeline` route. Client component with infinite scroll.

**Filters:** Category dropdown: All, Tasks, Deadlines, Documents, Discovery, Evidence, Motions, System. Each maps to event kind prefixes.

**Event descriptions:** Fix ~20 unhandled event kinds in `describeEvent` so all events render properly.

**Navigation:** "View all activity" link at bottom of TimelineCard.

## Feature 3: Enhanced Timeline Card

**Architecture:** Add "Load more" button to existing TimelineCard. Initial 10 events server-rendered, additional pages fetched client-side via existing paginated API.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No cases | Stats show zeros, empty state |
| No events | "No activity recorded yet" |
| No risk score | Health badge shows "—" |
| Filter returns nothing | "No events match this filter" |
| 100+ events | Infinite scroll, 20 per page |
