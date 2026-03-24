# Step Context Sidebar Design

## Problem

Step pages have a large empty area on the right side of the screen. Users working through tasks have no contextual guidance about why a step matters, what to prepare, or awareness of upcoming deadlines. This makes the experience feel sparse compared to professional legal platforms.

## Solution

Add a right-side context sidebar (`w-72`, visible on `xl+` screens) to the case layout. It contains two zones: step-specific guidance at the top and case pulse cards below.

## Layout

```
┌──────────┬─────────────────────────────┬──────────────┐
│ Workflow  │                             │   Context    │
│ Sidebar   │      Step Content           │   Sidebar    │
│  w-64     │      flex-1                 │    w-72      │
│  (lg+)    │                             │   (xl+)      │
└──────────┴─────────────────────────────┴──────────────┘
```

- Left sidebar: `w-64`, visible `lg+` (unchanged)
- Right sidebar: `w-72`, visible `xl+`, sticky, scrolls independently
- Step content: `flex-1`, drops `max-w-2xl mx-auto` centering, uses `max-w-3xl` left-aligned
- No mobile representation for right sidebar — supplementary content only

### Responsive Breakpoints

| Breakpoint | Left Sidebar | Right Sidebar | Step Content |
|-----------|-------------|--------------|-------------|
| `< lg` | Hidden (drawer) | Hidden | Full width |
| `lg` to `xl` | Visible `w-64` | Hidden | `flex-1` |
| `xl+` | Visible `w-64` | Visible `w-72` | `flex-1` |

## Step Guide Card (top)

A card with step-specific guidance driven by a static config map (`src/lib/step-guidance.ts`):

```typescript
export const STEP_GUIDANCE: Record<string, {
  title: string
  why: string           // 1-2 sentences
  checklist: string[]   // What to have ready
  tip?: string          // Optional pro tip
}>
```

Visual: Card titled "About This Step" with:
- "Why this matters" paragraph in muted text
- Checklist with checkmark icons (static, not interactive)
- Optional blue-tinted tip callout

If no guidance exists for a `task_key`, the card is not rendered.

## Case Pulse Cards (bottom)

Three small stacked cards:

1. **Next Deadline** — Nearest upcoming deadline with countdown. From `deadlines` table. Fallback: "No upcoming deadlines" with green checkmark.

2. **Case Health** — Compact risk score badge (green/yellow/red) + top AI suggestion. From `case_risk_scores` table. Fallback: "Complete more steps to unlock insights."

3. **Quick Links** — Links to Evidence Vault, Case File, Dashboard with icons.

## Data Flow

The right sidebar is a server component in the case layout. It fetches:
- `task_key` of the current step (from URL params)
- Nearest deadline from `deadlines` table
- Case health score from `case_risk_scores` table

Step page components remain untouched — the sidebar is purely additive.

## Changes

### 1. Case layout (`src/app/(authenticated)/case/[id]/layout.tsx`)
- Add right sidebar column: `hidden xl:block w-72 shrink-0 border-l`
- Render `ContextSidebar` server component
- Pass case data (deadlines, health score, current task_key)

### 2. New: Step guidance config (`src/lib/step-guidance.ts`)
- Static map of `task_key` → guidance content
- Covers all task keys across all dispute types

### 3. New: Context sidebar component (`src/components/case/context-sidebar.tsx`)
- Server component assembling the card stack
- Step Guide card (from config)
- Next Deadline card
- Case Health card
- Quick Links card

### 4. Step content width adjustment
- Remove `max-w-2xl mx-auto` from `StepRunner`
- Apply `max-w-3xl` with consistent left padding

### 5. No new API routes or database changes
- All data already available via existing Supabase queries
