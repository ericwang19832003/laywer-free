# Auto-Complete Welcome Step Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-complete the "welcome" task at case creation so new users land on their first real step instead of a content-free interstitial.

**Architecture:** In `POST /api/cases/route.ts`, after fetching the seeded tasks, find the task with `task_key === 'welcome'` and update it directly in Supabase to `status: 'completed'` with `completed_at` set. The API VALID_TRANSITIONS map blocks `todo → completed` via the task PATCH endpoint, so we use a direct `.update()` here — we're already in an authenticated server context and this task has no meaningful side effects. Update the in-memory tasks array so the response reflects the completed state.

**Tech Stack:** Next.js App Router API route, Supabase server client, TypeScript

---

### Task 1: Auto-complete welcome task in case creation route

**Files:**
- Modify: `apps/web/src/app/api/cases/route.ts:94-108`

**Step 1: Implement the change**

After the tasks are fetched (line 106), add a block that finds the welcome task and marks it completed directly in Supabase. Insert this between the `tasksError` guard and the `return NextResponse.json(...)`:

```typescript
    // Auto-complete the welcome task — it's a content-free interstitial with no user value.
    // We bypass the task PATCH API here because VALID_TRANSITIONS blocks todo→completed directly.
    const welcomeTask = (tasks ?? []).find((t) => t.task_key === 'welcome')
    if (welcomeTask && welcomeTask.status === 'todo') {
      const now = new Date().toISOString()
      await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: now })
        .eq('id', welcomeTask.id)
      welcomeTask.status = 'completed'
      welcomeTask.completed_at = now
    }
```

The full POST handler return block then stays as-is:
```typescript
    return NextResponse.json({ case: newCase, tasks }, { status: 201 })
```

**Step 2: Verify with TypeScript**

```bash
cd apps/web && npx tsc --noEmit 2>&1 | grep "route.ts"
```

Expected: no output (no errors in this file).

**Step 3: Manual smoke test**

1. Start the dev server: `cd apps/web && npm run dev`
2. Create a new case through the UI
3. After creation, check the case dashboard — "Today's Next Step" should show the intake step (e.g. "Tell Us About Your Situation"), NOT "Welcome — Get Started"
4. In the left sidebar, "Welcome — Get Started" should show a green checkmark (completed)
5. Progress bar should start at 3% (same as before)

**Step 4: Commit**

```bash
git add apps/web/src/app/api/cases/route.ts
git commit -m "feat: auto-complete welcome task at case creation

New users no longer see the content-free welcome interstitial as their
first recommended action. The welcome task is marked completed server-side
when the case is created, so the dashboard immediately surfaces the first
real step (intake)."
```
