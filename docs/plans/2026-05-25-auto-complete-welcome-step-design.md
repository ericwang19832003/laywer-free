# Auto-Complete Welcome Step Design

**Date:** 2026-05-25  
**Status:** Approved  
**Approach:** A — Auto-complete at case creation

## Problem

The "Welcome — Get Started" step is the first task in every case workflow. It contains no user input and no actionable content — just a static welcome message and an "I'm ready" button. Because it's the first `todo` task, the dashboard's "Today's Next Step" card always shows it as the recommended action for new users, requiring two wasted clicks before reaching the first real step ("Tell Us About Your Situation").

## Approved Design

**Auto-complete the welcome task server-side at case creation time.**

In `POST /api/cases/route.ts`, immediately after the tasks are fetched from the DB, find the task with `task_key = 'welcome'` and update its status directly to `completed` (with `completed_at` set) via a Supabase update. Return the updated task list in the API response.

### Why direct DB update (not two API calls)

The task state machine (`VALID_TRANSITIONS`) requires `todo → in_progress → completed`. Calling the task PATCH API twice would work but adds latency and fires analytics/webhook side effects that are meaningless for a welcome step. A direct `.update()` on the tasks table is appropriate here — we're in a server route with the authenticated Supabase client, and the welcome task is purely structural (no user value, no downstream dependencies on its `task_event` records).

### What changes

| File | Change |
|------|--------|
| `apps/web/src/app/api/cases/route.ts` | After fetching tasks post-creation, find welcome task and update status to `completed` |

### What does NOT change

- `WelcomeStep` component — kept as-is (handles direct navigation edge cases)
- Workflow phase definitions — welcome task stays in the list
- `/case/[id]/step` redirect logic — no change needed; welcome will be `completed` so it won't be selected
- Progress calculation — `completed` already counts toward done steps

### Result

New users land on the dashboard and see "Tell Us About Your Situation" as their first action. The welcome step shows as already completed (green checkmark) in the sidebar. No user ever sees the welcome interstitial.

## Success Criteria

- Creating a new case → dashboard shows intake step as next action (not welcome)
- Welcome task has status `completed` in DB immediately after case creation
- Progress starts at 3% (same as before — welcome counted as done)
- Existing cases with welcome already completed: no change
