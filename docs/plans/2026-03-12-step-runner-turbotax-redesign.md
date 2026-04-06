# Step Runner TurboTax-Style Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the step runner page from a clinical admin panel into a warm, TurboTax-style guided experience.

**Architecture:** Three files modified — left sidebar (workflow-sidebar.tsx), main content wrapper (step-runner.tsx), and page layout (layout.tsx). All changes are CSS/JSX — no schema, API, or business logic changes.

**Tech Stack:** Next.js 16, Tailwind CSS 4, Lucide React, Sonner (toast)

---

### Task 1: Page-Level Cohesion — Layout Background & Sidebar Borders

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/layout.tsx`

**Step 1: Update sidebar and main area styling**

In `layout.tsx`, change the three container elements:

Left sidebar (line 67): Replace
```
className="hidden lg:block w-64 shrink-0 border-r border-warm-border bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
```
with
```
className="hidden lg:block w-64 shrink-0 bg-warm-bg shadow-[1px_0_3px_0_rgba(0,0,0,0.04)] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
```

Main area (line 71): Replace
```
className="flex-1 min-w-0"
```
with
```
className="flex-1 min-w-0 bg-warm-bg"
```

Right sidebar (line 75): Replace
```
className="hidden xl:block w-72 shrink-0 border-l border-warm-border bg-white sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
```
with
```
className="hidden xl:block w-72 shrink-0 bg-white shadow-[-1px_0_3px_0_rgba(0,0,0,0.04)] sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
```

**Step 2: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 2: Left Sidebar — Progress Section

**Files:**
- Modify: `src/components/case/workflow-sidebar.tsx`

**Step 1: Update progress header**

Replace line 148:
```
<span className="text-[11px] font-semibold text-warm-muted/70 uppercase tracking-widest">
  Progress
</span>
```
with:
```
<span className="text-xs font-medium text-warm-muted">
  Your progress
</span>
```

**Step 2: Thicken progress bar**

Replace line 153:
```
<div className="h-1.5 bg-warm-border/40 rounded-full overflow-hidden">
```
with:
```
<div className="h-2 bg-warm-border/40 rounded-full overflow-hidden">
```

**Step 3: Normalize step count text**

Replace line 159:
```
<p className="text-[11px] text-warm-muted/60 mt-1.5 tabular-nums">
```
with:
```
<p className="text-xs text-warm-muted/60 mt-1.5 tabular-nums">
```

**Step 4: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 3: Left Sidebar — Phase Headers

**Files:**
- Modify: `src/components/case/workflow-sidebar.tsx`

**Step 1: Add Check icon import (already imported)**

`Check` is already imported on line 7. No change needed.

**Step 2: Determine current phase**

Inside the component, after line 108 (`const percentage = ...`), we need to know which phase is "current" (contains the `currentTaskKey`). Add a helper:

```typescript
const currentPhaseIdx = phases.findIndex((phase) =>
  phase.taskKeys.includes(currentTaskKey ?? '')
)
```

Add this after line 103 (after `currentTaskKey` is defined).

**Step 3: Update phase header button content**

Replace the phase header `<button>` inner content (lines 186-204). The key changes:
- Remove `uppercase tracking-widest` from label span
- Add conditional phase-state classes: completed (green + checkmark), current (indigo), pending (muted)
- Style badge as pill with phase-appropriate colors

Replace the entire `<button>` content from line 186 to 204:

```tsx
<div className="flex items-center gap-2">
  <span className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-0'}`}>
    {isCollapsed ? (
      <ChevronRight className="size-3.5 text-warm-muted/50 group-hover:text-warm-muted" />
    ) : (
      <ChevronDown className="size-3.5 text-warm-muted/50 group-hover:text-warm-muted" />
    )}
  </span>
  {allPhaseComplete && (
    <Check className="size-3 text-calm-green" strokeWidth={2.5} />
  )}
  <span className={`text-xs font-medium ${
    allPhaseComplete
      ? 'text-calm-green/70'
      : phaseIdx === currentPhaseIdx
      ? 'text-calm-indigo font-semibold'
      : 'text-warm-muted/70'
  }`}>
    {phase.label}
  </span>
</div>
<span className={`text-xs tabular-nums rounded-full px-1.5 py-0.5 font-medium ${
  allPhaseComplete
    ? 'bg-calm-green/10 text-calm-green'
    : phaseIdx === currentPhaseIdx
    ? 'bg-calm-indigo/10 text-calm-indigo'
    : 'text-warm-muted/40'
}`}>
  {doneInPhase}/{phaseTasks.length}
</span>
```

Note: `currentPhaseIdx` must be accessible in this scope — it's computed at the component level.

**Step 4: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 4: Left Sidebar — Task List Items

**Files:**
- Modify: `src/components/case/workflow-sidebar.tsx`

**Step 1: Normalize task text size**

Replace on line 219:
```
className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all duration-150 ${
```
with:
```
className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all duration-150 ${
```

**Step 2: Add opacity for locked steps**

In the same className template (the big ternary on lines 220-227), add `opacity-40` for locked steps. Replace the empty string fallback for non-clickable items:

The current code has the ternary ending with:
```
: clickable
  ? 'hover:bg-warm-border/20'
  : ''
```
Change to:
```
: clickable
  ? 'hover:bg-warm-border/20'
  : 'opacity-40'
```

**Step 3: Normalize skip button text**

Replace line 255:
```
className="ml-auto shrink-0 text-[11px] text-warm-muted/50 hover:text-warm-muted transition-colors duration-150"
```
with:
```
className="ml-auto shrink-0 text-xs text-warm-muted/50 hover:text-warm-muted transition-colors duration-150"
```

**Step 4: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 5: Main Content — Breadcrumb, Reassurance Banner, Card Shadow, Spacing

**Files:**
- Modify: `src/components/step/step-runner.tsx`

**Step 1: Add Lightbulb import and new props**

Add `Lightbulb` to imports. Replace line 5:
```
import { SkipForward } from 'lucide-react'
```
with:
```
import { Lightbulb, SkipForward } from 'lucide-react'
```

Add optional props to the interface (after line 23, before the closing `}`):
```typescript
phaseLabel?: string
stepPosition?: string
```

Add them to the destructured props (after `skippable = false,` on line 39):
```typescript
phaseLabel,
stepPosition,
```

**Step 2: Update header area**

Replace lines 91-100 (the back link, h1, and reassurance paragraph) with:

```tsx
<div className={wrapperClassName ?? "max-w-2xl mx-auto px-4 py-10"}>
  {phaseLabel && stepPosition ? (
    <div className="mb-6">
      <p className="text-xs font-medium text-warm-muted">
        {phaseLabel} · {stepPosition}
      </p>
      <Link
        href={`/case/${caseId}`}
        className="text-xs text-warm-muted/60 hover:text-warm-muted mt-0.5 inline-block"
      >
        ← Back to dashboard
      </Link>
    </div>
  ) : (
    <Link
      href={`/case/${caseId}`}
      className="text-sm text-warm-muted hover:text-warm-text mb-6 inline-block"
    >
      ← Back to dashboard
    </Link>
  )}

  <h1 className="text-2xl font-semibold text-warm-text mb-3">{title}</h1>

  <div className="rounded-lg bg-calm-indigo/[0.03] border border-calm-indigo/10 px-4 py-3 flex items-start gap-2.5 mb-8">
    <Lightbulb className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
    <p className="text-sm text-warm-muted leading-relaxed">{reassurance}</p>
  </div>
```

Note: The opening `<div>` with `wrapperClassName` is now part of this block. Remove the original line 91 opening div since we're replacing it here. Also change `py-8` to `py-10` in the default wrapper class.

**Step 3: Add shadow to Card**

Replace line 102:
```
<Card>
```
with:
```
<Card className="shadow-sm">
```

**Step 4: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 6: Main Content — Step Completion Toast

**Files:**
- Modify: `src/components/step/step-runner.tsx`

**Step 1: Import toast**

Add after the existing imports (after line 8):
```typescript
import { toast } from 'sonner'
```

**Step 2: Add toast to handleConfirm**

In `handleConfirm()`, add toast after `await onConfirm()` succeeds (line 69-70):

Replace:
```typescript
async function handleConfirm() {
  setLoading(true)
  try {
    await onConfirm()
    router.push(`/case/${caseId}`)
    router.refresh()
  } catch {
    setLoading(false)
  }
}
```
with:
```typescript
async function handleConfirm() {
  setLoading(true)
  try {
    await onConfirm()
    toast.success('Nice work! Step complete.')
    router.push(`/case/${caseId}`)
    router.refresh()
  } catch {
    setLoading(false)
  }
}
```

**Step 3: Build and verify**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

---

### Task 7: Final Build Verification

**Step 1: Full build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -30`
Expected: Build succeeds with no errors

**Step 2: Visual verification checklist**
- [ ] Left sidebar has warm background (bg-warm-bg), no hard border
- [ ] Progress label says "Your progress" in title case
- [ ] Progress bar is thicker (h-2)
- [ ] Phase headers are title case (not ALL-CAPS)
- [ ] Completed phases show green checkmark + green badge pill
- [ ] Current phase shows indigo text + indigo badge pill
- [ ] Locked steps are dimmed (opacity-40)
- [ ] Task text is text-sm (not text-[13px])
- [ ] Main content has warm background
- [ ] Step title + reassurance banner with lightbulb renders
- [ ] Form card has subtle shadow
- [ ] Right sidebar has soft shadow (no hard border)
- [ ] Mobile breakpoints: no layout breaks at lg/xl
