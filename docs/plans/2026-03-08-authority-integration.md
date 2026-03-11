# Authority Integration Into Guided Steps — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let users see and cite their saved case authorities while working through PI guided steps (demand letter, petition, settlement negotiation).

**Architecture:** Shared `<StepAuthoritySidebar>` component fetches saved authorities for the case. In "select" mode (demand letter, petition), users check authorities to include in generated drafts. In "read-only" mode (settlement negotiation), authorities display as reference. The `generate-filing` API accepts optional `authority_cluster_ids` and weaves citations into LLM output.

**Tech Stack:** React (client component), Supabase queries, existing `generate-filing` API, Tailwind CSS

---

### Task 1: Create `<StepAuthoritySidebar>` Component

**Files:**
- Create: `src/components/step/step-authority-sidebar.tsx`

**Step 1: Create the sidebar component**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

interface Authority {
  id: string
  cluster_id: number
  case_name: string
  court_name: string | null
  date_filed: string | null
  citations: string[]
  snippet: string | null
  pinned: boolean
}

interface StepAuthoritySidebarProps {
  caseId: string
  mode: 'select' | 'read-only'
  selectedClusterIds?: number[]
  onSelectionChange?: (clusterIds: number[]) => void
}

function courtListenerUrl(clusterId: number, caseName: string): string {
  const slug = caseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 75)
  return `https://www.courtlistener.com/opinion/${clusterId}/${slug}/`
}

export function StepAuthoritySidebar({
  caseId,
  mode,
  selectedClusterIds = [],
  onSelectionChange,
}: StepAuthoritySidebarProps) {
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    async function fetchAuthorities() {
      try {
        const res = await fetch(`/api/cases/${caseId}/research/authority`)
        if (!res.ok) return
        const data = await res.json()
        setAuthorities(data.authorities ?? [])
      } catch {
        // Non-fatal
      } finally {
        setLoading(false)
      }
    }
    fetchAuthorities()
  }, [caseId])

  function handleToggle(clusterId: number) {
    if (!onSelectionChange) return
    const next = selectedClusterIds.includes(clusterId)
      ? selectedClusterIds.filter((id) => id !== clusterId)
      : [...selectedClusterIds, clusterId]
    onSelectionChange(next)
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-warm-border p-4">
        <p className="text-xs text-warm-muted">Loading saved cases...</p>
      </div>
    )
  }

  if (authorities.length === 0) {
    return (
      <div className="rounded-lg border border-warm-border p-4">
        <p className="text-xs font-medium text-warm-muted uppercase tracking-wide mb-1">
          Saved Cases
        </p>
        <p className="text-sm text-warm-muted">
          No saved cases yet. Use the{' '}
          <a
            href={`/case/${caseId}/research`}
            className="text-calm-indigo hover:underline"
          >
            Research tab
          </a>{' '}
          to find relevant case law.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-warm-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-warm-bg/50 transition-colors"
      >
        <span className="text-xs font-medium text-warm-muted uppercase tracking-wide">
          {mode === 'select' ? 'Cite Saved Cases' : 'Your Saved Cases'}{' '}
          ({authorities.length})
        </span>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-warm-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-warm-muted" />
        )}
      </button>

      {!collapsed && (
        <div className="border-t border-warm-border divide-y divide-warm-border">
          {mode === 'select' && (
            <div className="px-3 py-2 bg-calm-indigo/5">
              <p className="text-xs text-warm-muted">
                Check the cases you want cited in your draft.
              </p>
            </div>
          )}
          {authorities.map((auth) => (
            <div key={auth.id} className="px-3 py-2.5 flex items-start gap-2">
              {mode === 'select' && (
                <Checkbox
                  checked={selectedClusterIds.includes(auth.cluster_id)}
                  onCheckedChange={() => handleToggle(auth.cluster_id)}
                  className="mt-0.5"
                />
              )}
              <div className="min-w-0 flex-1">
                <a
                  href={courtListenerUrl(auth.cluster_id, auth.case_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-start gap-1"
                >
                  <span className="text-xs font-medium text-warm-text group-hover:text-blue-700 group-hover:underline transition-colors leading-tight">
                    {auth.case_name}
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 mt-0.5 shrink-0 text-warm-muted group-hover:text-blue-700 transition-colors" />
                </a>
                <p className="text-[11px] text-warm-muted leading-tight">
                  {auth.court_name}
                  {auth.date_filed ? ` · ${auth.date_filed}` : ''}
                </p>
                {auth.citations.length > 0 && (
                  <p className="text-[11px] text-warm-muted/70 leading-tight">
                    {auth.citations.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Verify the build compiles**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds (component is not imported anywhere yet)

**Step 3: Commit**

```bash
git add src/components/step/step-authority-sidebar.tsx
git commit -m "feat: create StepAuthoritySidebar shared component"
```

---

### Task 2: Integrate Sidebar Into PI Demand Letter Step

**Files:**
- Modify: `src/components/step/personal-injury/pi-demand-letter-step.tsx`

**Step 1: Add authority sidebar state and import**

At the top of `pi-demand-letter-step.tsx`, add import:

```tsx
import { StepAuthoritySidebar } from '../step-authority-sidebar'
```

Inside the component, after the `genError` state declaration (line 132), add:

```tsx
const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<number[]>([])
```

**Step 2: Pass authority IDs in generateDraft()**

In the `generateDraft()` function, add `authority_cluster_ids` to the JSON body, inside the object passed to `JSON.stringify()`, after the `facts` property:

```tsx
body: JSON.stringify({
  document_type: 'pi_demand_letter',
  facts: { /* ...existing facts... */ },
  authority_cluster_ids: selectedAuthorityIds.length > 0 ? selectedAuthorityIds : undefined,
}),
```

**Step 3: Add sidebar to the JSX layout**

The current `StepRunner` component uses a single-column `max-w-2xl` layout. We need to wrap it in a two-column layout when authorities exist. Replace the entire `return (` block with a wrapper:

```tsx
return (
  <div className="max-w-5xl mx-auto px-4 py-8">
    <div className="flex gap-6 items-start">
      {/* Main form column */}
      <div className="flex-1 min-w-0">
        <StepRunner
          caseId={caseId}
          taskId={taskId}
          title="Draft Your Demand Letter"
          reassurance={isPropertyDamage
            ? "A demand letter formally notifies the at-fault party's insurance of your property damage claim and the compensation you are seeking."
            : "A demand letter is your first step in seeking fair compensation. It puts the insurance company on notice of your claim."
          }
          onConfirm={handleConfirm}
          onSave={handleSave}
          onBeforeReview={generateDraft}
          reviewContent={reviewContent}
          reviewButtonLabel="Generate Letter &rarr;"
          wrapperClassName=""
        >
          {/* ...all existing form sections stay identical... */}
        </StepRunner>
      </div>

      {/* Authority sidebar column */}
      <div className="hidden lg:block w-72 shrink-0 sticky top-8">
        <StepAuthoritySidebar
          caseId={caseId}
          mode="select"
          selectedClusterIds={selectedAuthorityIds}
          onSelectionChange={setSelectedAuthorityIds}
        />
      </div>
    </div>

    {/* Mobile: show sidebar below form */}
    <div className="lg:hidden mt-6">
      <StepAuthoritySidebar
        caseId={caseId}
        mode="select"
        selectedClusterIds={selectedAuthorityIds}
        onSelectionChange={setSelectedAuthorityIds}
      />
    </div>
  </div>
)
```

**IMPORTANT:** This requires `StepRunner` to accept an optional `wrapperClassName` prop that overrides the default `max-w-2xl mx-auto px-4 py-8` wrapper. See Task 5 for that small change.

**Step 4: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/step/personal-injury/pi-demand-letter-step.tsx
git commit -m "feat: integrate authority sidebar into PI demand letter step"
```

---

### Task 3: Integrate Sidebar Into PI Petition Wizard

**Files:**
- Modify: `src/components/step/personal-injury-wizard.tsx`

**Step 1: Add import and state**

Add import at top:
```tsx
import { StepAuthoritySidebar } from './step-authority-sidebar'
```

Add state inside the component (after existing state declarations):
```tsx
const [selectedAuthorityIds, setSelectedAuthorityIds] = useState<number[]>([])
```

**Step 2: Pass authority IDs in generateDraft()**

In the `generateDraft()` function (~line 611), add to the `JSON.stringify` body:

```tsx
body: JSON.stringify({
  document_type: 'pi_petition',
  facts: buildFacts(),
  authority_cluster_ids: selectedAuthorityIds.length > 0 ? selectedAuthorityIds : undefined,
}),
```

**Step 3: Add sidebar to the layout**

The PersonalInjuryWizard currently returns JSX starting around the Link + WizardShell. Wrap it similarly to the demand letter. The approach is identical: two-column flex on large screens, sidebar below on mobile. The WizardShell already has its own container styling, so wrap the entire return in a similar outer div:

Find the `return (` and wrap in a flex layout with the sidebar on the right.

**Step 4: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/components/step/personal-injury-wizard.tsx
git commit -m "feat: integrate authority sidebar into PI petition wizard"
```

---

### Task 4: Integrate Read-Only Sidebar Into Settlement Negotiation Step

**Files:**
- Modify: `src/components/step/personal-injury/pi-settlement-negotiation-step.tsx`

**Step 1: Add import**

```tsx
import { StepAuthoritySidebar } from '../step-authority-sidebar'
```

**Step 2: Add sidebar to layout**

The current component wraps `<GuidedStep>` in a simple return. Change to a two-column layout:

```tsx
export function PISettlementNegotiationStep({ caseId, taskId, existingAnswers, piSubType }: Props) {
  const config = isPropertyDamageSubType(piSubType)
    ? piSettlementNegotiationPropertyConfig
    : piSettlementNegotiationConfig

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <GuidedStep
            caseId={caseId}
            taskId={taskId}
            config={config}
            existingAnswers={existingAnswers}
            wrapperClassName=""
          />
        </div>
        <div className="hidden lg:block w-72 shrink-0 sticky top-8">
          <StepAuthoritySidebar
            caseId={caseId}
            mode="read-only"
          />
        </div>
      </div>
      <div className="lg:hidden mt-6">
        <StepAuthoritySidebar
          caseId={caseId}
          mode="read-only"
        />
      </div>
    </div>
  )
}
```

**IMPORTANT:** This requires `<GuidedStep>` to accept an optional `wrapperClassName` prop. See Task 5.

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/step/personal-injury/pi-settlement-negotiation-step.tsx
git commit -m "feat: integrate read-only authority sidebar into settlement negotiation"
```

---

### Task 5: Add `wrapperClassName` Prop to StepRunner and GuidedStep

Both `StepRunner` and `GuidedStep` currently hard-code their outer wrapper with `max-w-2xl mx-auto px-4 py-8`. When embedded in a two-column layout, the parent component needs to control the wrapper styling.

**Files:**
- Modify: `src/components/step/step-runner.tsx`
- Modify: `src/components/step/guided-step.tsx`

**Step 1: Update StepRunner**

Add `wrapperClassName?: string` to the `StepRunnerProps` interface. In the JSX, replace:

```tsx
<div className="max-w-2xl mx-auto px-4 py-8">
```

with:

```tsx
<div className={wrapperClassName ?? "max-w-2xl mx-auto px-4 py-8"}>
```

**Step 2: Update GuidedStep**

Add `wrapperClassName?: string` to the `GuidedStepProps` interface. In the JSX, replace:

```tsx
<div className="max-w-2xl mx-auto px-4 py-8">
```

with:

```tsx
<div className={wrapperClassName ?? "max-w-2xl mx-auto px-4 py-8"}>
```

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds. All existing usages pass no `wrapperClassName`, so default is used and no behavior changes.

**Step 4: Commit**

```bash
git add src/components/step/step-runner.tsx src/components/step/guided-step.tsx
git commit -m "feat: add wrapperClassName prop to StepRunner and GuidedStep"
```

---

### Task 6: Update `generate-filing` API to Accept and Use Authority Citations

**Files:**
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts`

**Step 1: Add authority fetching logic**

After the existing `const body = await request.json()` line (~318), add authority fetching:

```tsx
// Fetch authority citations if provided
const authorityClusterIds = body.authority_cluster_ids as number[] | undefined
let authorityCitationBlock = ''

if (authorityClusterIds && authorityClusterIds.length > 0) {
  const { data: authorities } = await supabase
    .from('case_authorities')
    .select(`
      cluster_id,
      cl_case_clusters!inner (
        case_name,
        court_name,
        date_filed,
        citations,
        snippet
      )
    `)
    .eq('case_id', caseId)
    .in('cluster_id', authorityClusterIds)

  if (authorities && authorities.length > 0) {
    const citationLines = authorities.map((a: any) => {
      const c = a.cl_case_clusters
      const cite = (c.citations as string[])?.length > 0
        ? (c.citations as string[])[0]
        : c.case_name
      const snippetText = c.snippet
        ? `\n  Key passage: "${(c.snippet as string).replace(/<[^>]*>/g, '').trim().slice(0, 300)}"`
        : ''
      return `- ${c.case_name}, ${cite} (${c.court_name ?? 'Court unknown'}, ${c.date_filed ?? 'date unknown'})${snippetText}`
    })

    authorityCitationBlock = `\n\nCASE AUTHORITIES TO CITE:\nThe user has selected these cases to support their position. Weave relevant citations naturally into the document where they strengthen the legal arguments. Use standard legal citation format (e.g., "See *Case Name*, Citation."). Do NOT fabricate additional citations.\n\n${citationLines.join('\n')}\n`
  }
}
```

**Step 2: Inject citation block into the prompt**

After the `prompt` variable is constructed (around line 333 for registry entries, or line 346 for original filings), append the authority block to the user prompt:

```tsx
if (authorityCitationBlock) {
  prompt = {
    system: prompt.system,
    user: prompt.user + authorityCitationBlock,
  }
}
```

Place this right before the `const anthropic = new Anthropic()` line (~349).

**Step 3: Build and verify**

Run: `npm run build 2>&1 | tail -20`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/api/cases/[id]/generate-filing/route.ts
git commit -m "feat: accept authority_cluster_ids in generate-filing and weave citations into prompts"
```

---

### Task 7: Fetch Authorities in Step Router (Server-Side)

The authority sidebar fetches data client-side via the GET endpoint, so no server-side changes are needed in `page.tsx`. The sidebar component handles its own data fetching.

This task is a **verification task** — confirm that the GET endpoint at `src/app/api/cases/[id]/research/authority/route.ts` returns the data shape the sidebar expects.

**Files:**
- Read: `src/app/api/cases/[id]/research/authority/route.ts` (verify GET response)

**Step 1: Verify GET endpoint returns correct shape**

The GET endpoint should return `{ authorities: [...] }` where each authority has:
- `id`, `cluster_id`, `case_name`, `court_name`, `date_filed`, `citations`, `snippet`, `pinned`

Read the endpoint and confirm. If the shape doesn't match, add a mapping in the sidebar's `fetchAuthorities()`.

**Step 2: Manual test**

1. Open a PI case that has saved authorities
2. Navigate to the demand letter step
3. Verify sidebar appears with saved cases
4. Check/uncheck authorities
5. Generate a draft — confirm citations appear in the output
6. Navigate to settlement negotiation step
7. Verify sidebar appears in read-only mode (no checkboxes)

---

### Task 8: Build Verification and Final Review

**Step 1: Full build**

Run: `npm run build 2>&1 | tail -30`
Expected: Build succeeds with no errors

**Step 2: Review all changes**

Run: `git diff --stat HEAD~6` to see all changed files
Verify: 7 files changed (1 new, 6 modified)

**Step 3: Final commit if needed**

If any fixes were required during review, commit them.
