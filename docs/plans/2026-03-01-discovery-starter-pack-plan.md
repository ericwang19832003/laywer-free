# Discovery Starter Pack Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the existing `discovery_starter_pack` task into a guided onboarding step and add a persistent Dashboard card for navigating to the discovery hub.

**Architecture:** Two new components (`DiscoveryStarterPackStep` and `DiscoveryCard`), two modified files (step page switch and dashboard page). No new API routes, migrations, or schemas — the step uses the existing `PATCH /api/tasks/[id]` endpoint and the dashboard card uses existing Supabase queries.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase, shadcn/ui (`Card`, `Button`, `Badge`)

---

## Task 1: Discovery Starter Pack Step Component

**Files:**
- Create: `src/components/step/discovery-starter-pack-step.tsx`

This is the onboarding step that educates users about discovery tools. It uses `StepRunner` with `skipReview` (same pattern as `src/components/step/file-with-court-step.tsx`). The content is static educational text organized in expandable accordion-style sections, with court-type-specific guidance.

**Step 1: Create the step component**

```tsx
// src/components/step/discovery-starter-pack-step.tsx
'use client'

import { useState } from 'react'
import { StepRunner } from './step-runner'
import Link from 'next/link'

interface DiscoveryStarterPackStepProps {
  caseId: string
  taskId: string
  courtType: string
}

interface SectionItem {
  key: string
  title: string
  content: React.ReactNode
}

function ExpandableSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-warm-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-warm-text">{title}</span>
        <span
          className={`text-warm-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>
      {isOpen && (
        <div className="border-t border-warm-border px-4 py-3">
          {children}
        </div>
      )}
    </div>
  )
}

function getCourtIntro(courtType: string): string {
  switch (courtType) {
    case 'jp':
      return 'Justice of the Peace courts have limited formal discovery. You may still be able to request documents through subpoenas or informal requests.'
    case 'federal':
      return 'Federal courts follow the Federal Rules of Civil Procedure (FRCP) Rules 26–37. Discovery is a structured process with specific requirements, including mandatory initial disclosures.'
    default:
      return 'Texas state courts follow the Texas Rules of Civil Procedure for discovery. You can request documents, ask written questions, and request admissions from the other side.'
  }
}

function getDeadlinesContent(courtType: string): React.ReactNode {
  if (courtType === 'jp') {
    return (
      <div className="space-y-2 text-sm text-warm-muted">
        <p>
          JP courts have limited formal discovery rules. If you need documents
          from the other party, consider:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Requesting documents informally in writing</li>
          <li>Asking the court to issue a subpoena for specific records</li>
          <li>Bringing your evidence directly to trial</li>
        </ul>
      </div>
    )
  }

  if (courtType === 'federal') {
    return (
      <div className="space-y-2 text-sm text-warm-muted">
        <p>Key federal discovery rules (FRCP):</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Mandatory disclosures</strong> — Required within 14 days
            of the Rule 26(f) conference
          </li>
          <li>
            <strong>Response deadline</strong> — 30 days to respond to
            discovery requests
          </li>
          <li>
            <strong>Proportionality</strong> — Requests must be proportional
            to the needs of the case (Rule 26(b)(1))
          </li>
          <li>
            <strong>Interrogatory limit</strong> — 25 interrogatories
            (including subparts) unless the court orders otherwise
          </li>
        </ul>
      </div>
    )
  }

  // county / district (Texas state)
  return (
    <div className="space-y-2 text-sm text-warm-muted">
      <p>Key Texas discovery rules (TRCP):</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Response deadline</strong> — 30 days from the date you
          receive the discovery request
        </li>
        <li>
          <strong>Interrogatory limit</strong> — 25 interrogatories
          (including subparts)
        </li>
        <li>
          <strong>Discovery period</strong> — Generally ends 30 days before
          trial (Level 1 cases) or by court order
        </li>
        <li>
          <strong>Objections</strong> — Must be specific and timely, or
          they may be waived
        </li>
      </ul>
    </div>
  )
}

export function DiscoveryStarterPackStep({
  caseId,
  taskId,
  courtType,
}: DiscoveryStarterPackStepProps) {
  const [openSection, setOpenSection] = useState<string | null>(null)

  function toggleSection(key: string) {
    setOpenSection((prev) => (prev === key ? null : key))
  }

  async function patchTask(status: string) {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to update task')
    }
  }

  async function handleConfirm() {
    await patchTask('in_progress')
    await patchTask('completed')
  }

  const intro = getCourtIntro(courtType)

  return (
    <StepRunner
      caseId={caseId}
      taskId={taskId}
      title="Discovery Starter Pack"
      reassurance="Learn about the tools you can use to request documents and information from the other side."
      onConfirm={handleConfirm}
      skipReview
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
          <p className="text-sm text-warm-text">{intro}</p>
        </div>

        <ExpandableSection
          title="What is Discovery?"
          isOpen={openSection === 'what'}
          onToggle={() => toggleSection('what')}
        >
          <div className="space-y-2 text-sm text-warm-muted">
            <p>
              Discovery is the formal process of exchanging information
              between parties in a lawsuit. It happens after the case is
              filed and before trial.
            </p>
            <p>
              The goal is to prevent surprises at trial — both sides get to
              see the evidence and understand each other&apos;s positions
              beforehand.
            </p>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Tools Available to You"
          isOpen={openSection === 'tools'}
          onToggle={() => toggleSection('tools')}
        >
          <div className="space-y-3 text-sm text-warm-muted">
            <div>
              <p className="font-medium text-warm-text">
                Requests for Production (RFP)
              </p>
              <p>
                Ask the other side to produce documents, photos, contracts,
                communications, or other tangible evidence relevant to the
                case.
              </p>
            </div>
            <div>
              <p className="font-medium text-warm-text">
                Interrogatories (ROG)
              </p>
              <p>
                Written questions the other party must answer under oath.
                Useful for getting facts, timelines, and identifying
                witnesses.
              </p>
            </div>
            <div>
              <p className="font-medium text-warm-text">
                Requests for Admissions (RFA)
              </p>
              <p>
                Ask the other side to admit or deny specific facts. If they
                don&apos;t respond within the deadline, the facts are
                considered admitted.
              </p>
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection
          title="Key Deadlines & Rules"
          isOpen={openSection === 'rules'}
          onToggle={() => toggleSection('rules')}
        >
          {getDeadlinesContent(courtType)}
        </ExpandableSection>

        <div className="pt-2">
          <Link
            href={`/case/${caseId}/discovery`}
            className="text-sm text-calm-indigo hover:underline"
          >
            Go to Discovery Hub →
          </Link>
        </div>
      </div>
    </StepRunner>
  )
}
```

**Step 2: Verify the build compiles**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds (the component isn't imported anywhere yet, but it should compile on its own)

**Step 3: Commit**

```bash
git add src/components/step/discovery-starter-pack-step.tsx
git commit -m "feat: add discovery starter pack step component

Court-type-specific onboarding with expandable sections for
discovery education (What is Discovery, Tools, Rules)."
```

---

## Task 2: Wire Step into Step Page

**Files:**
- Modify: `src/app/case/[id]/step/[taskId]/page.tsx:1-11,76-198`

Add a `discovery_starter_pack` case to the switch statement. It needs `court_type` from the case, same query pattern as `file_with_court`.

**Step 1: Add import and switch case**

At the top of `src/app/case/[id]/step/[taskId]/page.tsx`, add the import (after line 9, the `FileWithCourtStep` import):

```tsx
import { DiscoveryStarterPackStep } from '@/components/step/discovery-starter-pack-step'
```

Then add a new case **before the `default:` case** (before line 177), after the `check_docket_for_answer` case:

```tsx
    case 'discovery_starter_pack': {
      const { data: caseRow } = await supabase
        .from('cases')
        .select('court_type')
        .eq('id', id)
        .single()

      return (
        <DiscoveryStarterPackStep
          caseId={id}
          taskId={taskId}
          courtType={caseRow?.court_type ?? 'district'}
        />
      )
    }
```

**Step 2: Verify the build compiles**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/app/case/[id]/step/[taskId]/page.tsx
git commit -m "feat: wire discovery_starter_pack into step page

Replaces 'coming soon' fallback with actual onboarding step."
```

---

## Task 3: Discovery Dashboard Card

**Files:**
- Create: `src/components/dashboard/discovery-card.tsx`

This card has three visual states based on the `discovery_starter_pack` task status and whether discovery packs exist. It follows the same `Card` / `CardHeader` / `CardContent` pattern as `DeadlinesCard` and `NextStepCard`.

**Step 1: Create the dashboard card component**

```tsx
// src/components/dashboard/discovery-card.tsx
'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DiscoveryCardProps {
  caseId: string
  discoveryTask: {
    id: string
    status: string
  } | null
  packCount: number
  servedCount: number
  itemCount: number
}

export function DiscoveryCard({
  caseId,
  discoveryTask,
  packCount,
  servedCount,
  itemCount,
}: DiscoveryCardProps) {
  // Hidden if task doesn't exist or is locked
  if (!discoveryTask || discoveryTask.status === 'locked') {
    return null
  }

  // State B: step not completed yet
  if (discoveryTask.status !== 'completed') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Discovery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-muted mb-4">
            Learn about discovery tools available for your case and how to use them.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/case/${caseId}/step/${discoveryTask.id}`}>
              Get Started →
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // State C: completed, packs exist
  if (packCount > 0) {
    const parts: string[] = []
    parts.push(`${packCount} pack${packCount !== 1 ? 's' : ''}`)
    if (servedCount > 0) {
      parts.push(`${servedCount} served`)
    }
    parts.push(`${itemCount} item${itemCount !== 1 ? 's' : ''}`)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-warm-text">Discovery</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-warm-muted mb-4">{parts.join(' · ')}</p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/case/${caseId}/discovery`}>
              View Discovery Hub →
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // State D: completed, no packs yet
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-warm-text">Discovery</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-warm-muted mb-4">
          Ready to start building your discovery requests.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/case/${caseId}/discovery`}>
            Go to Discovery Hub →
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Step 2: Verify the build compiles**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/dashboard/discovery-card.tsx
git commit -m "feat: add discovery dashboard card component

Three states: onboarding CTA, pack summary, or empty hub link."
```

---

## Task 4: Wire Dashboard Card into Dashboard Page

**Files:**
- Modify: `src/app/case/[id]/page.tsx:1-144`

Add the `DiscoveryCard` to the dashboard layout. This requires:
1. Import the component
2. Query for the `discovery_starter_pack` task status
3. Query for discovery pack/item counts (only if step is completed)
4. Add the card between `DeadlinesCard` and `ProgressCard`

**Step 1: Add import**

At the top of `src/app/case/[id]/page.tsx`, add after the `CaseHealthCard` import (line 9):

```tsx
import { DiscoveryCard } from '@/components/dashboard/discovery-card'
```

**Step 2: Add queries to the data-fetching block**

After the existing `Promise.all` block (after line 78), add:

```tsx
  // Discovery card data
  const { data: discoveryTaskRow } = await supabase
    .from('tasks')
    .select('id, status')
    .eq('case_id', id)
    .eq('task_key', 'discovery_starter_pack')
    .maybeSingle()

  let discoveryPackCount = 0
  let discoveryServedCount = 0
  let discoveryItemCount = 0

  if (discoveryTaskRow?.status === 'completed') {
    const [packResult, itemResult] = await Promise.all([
      supabase
        .from('discovery_packs')
        .select('id, status')
        .eq('case_id', id),
      supabase
        .from('discovery_items')
        .select('id, pack_id')
        .in(
          'pack_id',
          (await supabase
            .from('discovery_packs')
            .select('id')
            .eq('case_id', id)
          ).data?.map((p: { id: string }) => p.id) ?? []
        ),
    ])
    const packs = packResult.data ?? []
    discoveryPackCount = packs.length
    discoveryServedCount = packs.filter((p: { status: string }) => p.status === 'served').length
    discoveryItemCount = (itemResult.data ?? []).length
  }
```

**Important note:** The above nested query is a bit wasteful. A cleaner approach avoids the nested await. Let's simplify:

Replace the `if` block above with:

```tsx
  if (discoveryTaskRow?.status === 'completed') {
    const { data: packs } = await supabase
      .from('discovery_packs')
      .select('id, status')
      .eq('case_id', id)

    const packList = packs ?? []
    discoveryPackCount = packList.length
    discoveryServedCount = packList.filter((p: { status: string }) => p.status === 'served').length

    if (packList.length > 0) {
      const { count } = await supabase
        .from('discovery_items')
        .select('id', { count: 'exact', head: true })
        .in('pack_id', packList.map((p: { id: string }) => p.id))

      discoveryItemCount = count ?? 0
    }
  }
```

**Step 3: Add the card to the layout**

In the JSX, add between the `<DeadlinesCard>` and `<ProgressCard>` lines (between lines 135 and 136):

```tsx
          <DiscoveryCard
            caseId={id}
            discoveryTask={discoveryTaskRow}
            packCount={discoveryPackCount}
            servedCount={discoveryServedCount}
            itemCount={discoveryItemCount}
          />
```

**Step 4: Verify the build compiles**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/app/case/[id]/page.tsx
git commit -m "feat: wire discovery card into case dashboard

Shows after DeadlinesCard. Hidden while locked, onboarding CTA
when unlocked, pack summary when completed."
```

---

## Task 5: Build & Test Verification

**Files:** (none — verification only)

**Step 1: Run the full test suite**

Run: `npx vitest run 2>&1 | tail -30`
Expected: All tests pass (should be ~492+ tests)

**Step 2: Run the build**

Run: `npx next build 2>&1 | tail -20`
Expected: Build succeeds with no type errors

**Step 3: Manual smoke test checklist**

Run: `npm run dev`

Verify these scenarios in the browser:

1. **Dashboard** — Visit `/case/[id]` for a case where `discovery_starter_pack` is `locked` → no Discovery card visible
2. **Dashboard** — For a case where `discovery_starter_pack` is `todo` → Discovery card shows "Get Started →" linking to the step
3. **Step page** — Click "Get Started →" → sees onboarding content with expandable sections
4. **Step page** — Expand each section (What is Discovery, Tools, Rules) → content renders correctly
5. **Step page** — Click "I'm ready" → task completes, redirects to dashboard
6. **Dashboard** — After completion with no packs → Discovery card shows "Go to Discovery Hub →"
7. **Dashboard** — Card links to `/case/[id]/discovery` → discovery hub loads

**Step 4: Commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address issues found during verification"
```
