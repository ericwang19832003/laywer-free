# Priority Alerts — Dashboard Escalation Display

**Date:** 2026-02-27
**Status:** Approved

## Overview

Add a "Priority Alerts" section to the top of the case dashboard that surfaces unacknowledged `reminder_escalations` with visual urgency tiering. Users can review or acknowledge each alert. The section disappears entirely when no alerts are active.

## Approach

Standalone section with individual alert cards (Approach A). Each alert is its own card with a colored left border indicating escalation level. Collapses when empty — no placeholder.

## Visual Design

### Border colors by level

| Level | Left Border | Background Tint | Tone |
|-------|-------------|-----------------|------|
| 3 (high) | `border-l-red-500` | `bg-red-50` | Firm but calm — "This needs your attention soon." |
| 2 (medium) | `border-l-calm-amber` | `bg-calm-amber/5` | Warm nudge |
| 1 (low) | `border-l-warm-border` | `bg-warm-bg` | Neutral info |

### Card anatomy

- Section label: `text-xs font-medium text-warm-muted uppercase tracking-wide` — "Priority Alerts"
- Message: `text-sm text-warm-text`
- Due date: `text-xs text-warm-muted`
- Buttons: "Review" (`variant="outline" size="sm"`) and "Acknowledge" (`variant="ghost" size="sm"`)

### Empty state

Section omitted from DOM entirely.

### Mobile

Cards stack naturally within `max-w-2xl`. Buttons flex-row with wrapping.

## Data Flow

### Fetching (Server Component)

Dashboard page adds a Supabase query joining `reminder_escalations` with `deadlines`:

```sql
SELECT re.id, re.case_id, re.deadline_id, re.escalation_level, re.message,
       re.triggered_at, d.due_at, d.key as deadline_key
FROM reminder_escalations re
JOIN deadlines d ON d.id = re.deadline_id
WHERE re.case_id = :caseId AND re.acknowledged = false
ORDER BY re.escalation_level DESC, re.triggered_at DESC
```

Results passed as props to `<PriorityAlertsSection>`.

### Acknowledging (API Route)

`PATCH /api/reminder-escalations/[id]/acknowledge`

- Validates ownership via RLS
- Sets `acknowledged = true`
- Returns `{ success: true }`

Client uses optimistic UI — removes card immediately, rolls back + Sonner toast on failure.

### Review button

Links to `/case/[caseId]/deadlines`.

## New Files

| File | Type | Purpose |
|------|------|---------|
| `src/components/dashboard/priority-alerts-section.tsx` | Client Component | Renders alerts, handles acknowledge |
| `src/app/api/reminder-escalations/[id]/acknowledge/route.ts` | API Route | PATCH acknowledged=true |
| `src/lib/schemas/reminder-escalation.ts` | Schema | Zod validation |

## Modified Files

| File | Change |
|------|--------|
| `src/app/case/[id]/page.tsx` | Query escalations, render `<PriorityAlertsSection>` above `<NextStepCard>` |

## Testing

### Unit tests

- `tests/unit/schemas/reminder-escalation.test.ts` — Zod schema validation
- `tests/unit/components/priority-alerts-section.test.ts` — Rendering, border colors, sort order, acknowledge behavior, empty state

### Key test cases

1. Empty array renders nothing
2. Correct card count
3. Level 3 → red border, Level 2 → amber border, Level 1 → neutral border
4. Sort: level desc, triggered_at desc
5. "Review" links to deadlines page
6. "Acknowledge" removes card from DOM
7. Due date and message displayed correctly

### RLS

Existing isolation pattern ensures cross-user data protection.

### Manual

- Mobile responsive at 375px
- Optimistic UI rollback on network error

## Acceptance Criteria

- Alerts render correctly with proper border colors per escalation level
- Acknowledge updates `reminder_escalations.acknowledged = true` and removes card
- Mobile responsive
- Calm, steady tone — no panic language
