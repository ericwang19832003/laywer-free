# Legal-Tech Compliance — Phase 2 (Should Fix)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 10 should-fix compliance issues: freshness warning on case law, lower doc gen temperature, fix conflicting statute instructions, jurisdiction confirmation, data deletion, block high-risk case types, Gmail consent, disclaimer prominence, DV safety detection, FDCPA warning.

**Architecture:** Mix of UI components, prompt strings, and one DB-optional setting. No new API routes required. Each task is self-contained and touches 1–2 files.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS, Supabase client

---

## Task 1: Add freshness warning to case law citations

Case law citations displayed in `ResearchAnswer` have no staleness warning. Users may rely on old precedent.

**Files:**
- Modify: `apps/web/src/components/research/research-answer.tsx` (line 55–58)

**Step 1: Replace the footer disclaimer**

Find the current footer (line 55–58):
```tsx
<p className="text-xs" style={{ color: '#A8A29E' }}>
  This analysis is based on case law excerpts and is for educational purposes only. It is not legal advice.
</p>
```

Replace with:
```tsx
<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 space-y-1">
  <p className="font-medium">Important: Case law may have changed.</p>
  <p>
    Always verify the current status of any cited authority before relying on it.
    Cases can be overruled, distinguished, or superseded by new legislation.
    This analysis is for educational purposes only — not legal advice.
  </p>
</div>
```

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "research-answer" | head -5
```

Expected: no output.

**Step 3: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/research/research-answer.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add case law freshness warning to research answer"
```

---

## Task 2: Lower document generation temperature

The document generation API uses `temperature: 0.7` which allows too much creative drift. Lower it to reduce hallucinated citations and reduce inconsistency.

**Files:**
- Modify: `apps/web/src/app/api/document-generation/route.ts` (line 185)

**Step 1: Change temperature**

Find (line 183–186):
```typescript
const { content: rawContent, usage } = await aiClient.complete({
  systemPrompt,
  userPrompt,
  temperature: 0.7,
```

Change to:
```typescript
const { content: rawContent, usage } = await aiClient.complete({
  systemPrompt,
  userPrompt,
  temperature: 0.3,
```

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "document-generation/route" | head -5
```

Expected: no output.

**Step 3: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/app/api/document-generation/route.ts
git -C "/Users/minwang/lawyer free" commit -m "fix(compliance): lower document generation temperature to 0.3"
```

---

## Task 3: Fix conflicting statute-reference instructions in SHARED_RULES

`SHARED_RULES` in `document-generation.ts` contains a contradiction:
- Safety rule: "Never fabricate case law, statutes, or citations. If referencing legal principles, use general language"
- Required elements rule: "Reference at least one specific legal statute, code section, or regulation"

These are mutually contradictory when no statutes are provided in the case data.

**Files:**
- Modify: `apps/web/src/lib/ai/document-generation.ts` (lines 65–85, SHARED_RULES constant)

**Step 1: Fix the REQUIRED ELEMENTS statute instruction**

Find in SHARED_RULES (around line 82):
```
- Reference at least one specific legal statute, code section, or regulation relevant to this dispute type and jurisdiction.
```

Replace with:
```
- If specific statutes or code sections are provided in the case data, reference them precisely. If no specific statutes are provided, use general language only (e.g., "applicable state law", "relevant provisions of the Texas Property Code") — never invent a statute or section number.
```

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "document-generation" | head -5
```

Expected: no output.

**Step 3: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/lib/ai/document-generation.ts
git -C "/Users/minwang/lawyer free" commit -m "fix(compliance): resolve conflicting statute-reference instructions in SHARED_RULES"
```

---

## Task 4: Add jurisdiction confirmation step to case creation wizard

After the user selects their state (step 1 of the wizard), they should confirm: "This case is in [State] — all guidance will be tailored to [State] law. Is that correct?"

This prevents users from accidentally creating cases in the wrong jurisdiction.

**Files:**
- Modify: `apps/web/src/components/cases/new-case-dialog.tsx`

The wizard state machine uses a `step` counter. State selection is step 1 (`SET_STATE` advances to step 2). We'll show a jurisdiction confirmation inline in the step-1 UI by preventing immediate step advancement — instead, the `StateStep` component will call back with the state, and the dialog will show a confirm message before dispatching.

**Step 1: Add `pendingState` to wizard state**

In the `WizardState` interface, add:
```typescript
pendingState: State | ''
```

In `initialState`, add:
```typescript
pendingState: '',
```

Add new action type in `WizardAction`:
```typescript
| { type: 'CONFIRM_STATE' }
| { type: 'SET_PENDING_STATE'; pendingState: State }
```

In the reducer, add cases:
```typescript
case 'SET_PENDING_STATE':
  return { ...state, pendingState: action.pendingState }
case 'CONFIRM_STATE':
  return { ...state, selectedState: state.pendingState, step: 2 }
```

Also change `SET_STATE` to no longer advance step immediately:
```typescript
case 'SET_STATE':
  return { ...state, selectedState: action.selectedState, step: 2 }
```
stays as-is (this action is used by the sessionStorage prefill path — leave it alone). The new path uses `SET_PENDING_STATE` + `CONFIRM_STATE`.

**Step 2: Update the StateStep dispatcher to use pending state**

Find in the JSX render (around line 602):
```tsx
{state.step === 1 && (
  <StateStep
    value={state.selectedState}
    onSelect={(s) => dispatch({ type: 'SET_STATE', selectedState: s })}
  />
)}
```

Change to:
```tsx
{state.step === 1 && !state.pendingState && (
  <StateStep
    value={state.selectedState}
    onSelect={(s) => dispatch({ type: 'SET_PENDING_STATE', pendingState: s })}
  />
)}

{state.step === 1 && state.pendingState && (
  <div className="space-y-4 py-2">
    <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4 space-y-2">
      <p className="text-sm font-medium text-warm-text">
        You selected: <strong>{state.pendingState}</strong>
      </p>
      <p className="text-sm text-warm-muted">
        All guidance, court rules, and deadlines will be based on <strong>{state.pendingState}</strong> law.
        If your case is in a different state, go back and select the correct state.
      </p>
    </div>
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => dispatch({ type: 'SET_PENDING_STATE', pendingState: '' as State })}
      >
        Go Back
      </Button>
      <Button
        className="flex-1"
        onClick={() => dispatch({ type: 'CONFIRM_STATE' })}
      >
        Yes, this is correct →
      </Button>
    </div>
  </div>
)}
```

**Step 3: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "new-case-dialog" | head -5
```

Expected: no output.

**Step 4: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/cases/new-case-dialog.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add jurisdiction confirmation step to case creation wizard"
```

---

## Task 5: Add high-risk case type warnings

Family law (especially child custody) and any `family` dispute type cases should show a strong recommendation to consult an attorney. The warning should appear after the user selects the family dispute type, before they continue.

**Files:**
- Modify: `apps/web/src/components/cases/wizard/family-sub-type-step.tsx`

**Step 1: Read the current file**

Read `apps/web/src/components/cases/wizard/family-sub-type-step.tsx` fully to understand the current structure.

**Step 2: Add warning banner at the top of the component**

After whatever heading/description the step has, add a warning banner at the top of the rendered content (before the option list):

```tsx
<div className="rounded-lg border border-calm-amber/30 bg-calm-amber/10 p-4 mb-4 space-y-2">
  <div className="flex items-start gap-2">
    <svg className="h-5 w-5 text-calm-amber shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <div className="space-y-1">
      <p className="text-sm font-semibold text-warm-text">Attorney Consultation Strongly Recommended</p>
      <p className="text-xs text-warm-muted leading-relaxed">
        Family law cases — especially those involving child custody, divorce, or domestic violence —
        are among the most legally complex matters. Mistakes can have serious long-term consequences.
        Lawyer Free can help you organize your materials, but we strongly recommend consulting a
        licensed family law attorney before proceeding.
      </p>
    </div>
  </div>
</div>
```

**Step 3: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "family-sub-type" | head -5
```

Expected: no output.

**Step 4: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/cases/wizard/family-sub-type-step.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add attorney consultation warning to family law case type"
```

---

## Task 6: Add domestic violence safety detection and referral

For family cases where a user indicates domestic circumstances, show a safety message with the National DV Hotline.

**Files:**
- Modify: `apps/web/src/components/cases/wizard/family-sub-type-step.tsx` (continuing from Task 5)

**Step 1: Read the FamilySubType values**

Read `apps/web/src/components/cases/wizard/family-sub-type-step.tsx` to find the available sub-type values (look for the type definition and option list). Identify if there is a `domestic_violence` or similar sub-type.

**Step 2: Add DV safety message on selection of any family sub-type**

At the bottom of the component (after the sub-type selection list), add a persistent safety block:

```tsx
<div className="rounded-lg border border-red-200 bg-red-50 p-4 mt-4 space-y-2">
  <p className="text-sm font-semibold text-red-900">Safety First</p>
  <p className="text-xs text-red-800 leading-relaxed">
    If you are in a situation involving domestic violence or feel unsafe, please reach out for help.
  </p>
  <a
    href="tel:18007997233"
    className="inline-block text-xs font-semibold text-red-900 underline"
  >
    National DV Hotline: 1-800-799-7233 (available 24/7)
  </a>
  <p className="text-xs text-red-700">
    Text START to 88788 · Chat at thehotline.org
  </p>
</div>
```

**Step 3: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "family-sub-type" | head -5
```

Expected: no output.

**Step 4: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/cases/wizard/family-sub-type-step.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add domestic violence safety referral to family case wizard"
```

---

## Task 7: Add FDCPA/federal jurisdiction warning for debt collection cases

Debt collection defendant cases often involve federal FDCPA claims that state court guidance doesn't cover.

**Files:**
- Modify: `apps/web/src/components/cases/wizard/debt-sub-type-step.tsx`

**Step 1: Read the current file**

Read `apps/web/src/components/cases/wizard/debt-sub-type-step.tsx` fully.

**Step 2: Add FDCPA notice when `side === 'defendant'`**

Find where the component renders its content. Add this notice at the top when `side === 'defendant'`:

```tsx
{side === 'defendant' && (
  <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4 mb-4 space-y-2">
    <p className="text-sm font-semibold text-warm-text">Federal Law May Apply</p>
    <p className="text-xs text-warm-muted leading-relaxed">
      If you are being sued for a consumer debt, you may have rights under the federal
      Fair Debt Collection Practices Act (FDCPA) regardless of which state you are in.
      Federal FDCPA claims can be filed in federal court and may entitle you to statutory
      damages. This platform covers state court procedures — consult an attorney or
      visit consumerfinance.gov for FDCPA information.
    </p>
  </div>
)}
```

**Step 3: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "debt-sub-type" | head -5
```

Expected: no output.

**Step 4: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/cases/wizard/debt-sub-type-step.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add FDCPA federal jurisdiction notice to debt collection wizard"
```

---

## Task 8: Increase disclaimer prominence

The footer disclaimer uses `text-xs text-warm-muted` (12px, muted color). Users literally cannot read it. Make it more prominent.

**Files:**
- Modify: `apps/web/src/components/layout/legal-disclaimer.tsx`

**Step 1: Update the component**

Replace the entire file content with:

```tsx
export function LegalDisclaimer() {
  return (
    <footer className="mt-12 border-t border-warm-border pt-6 pb-8">
      <div className="max-w-2xl mx-auto text-center space-y-1">
        <p className="text-sm font-medium text-warm-text">
          Lawyer Free is not a law firm.
        </p>
        <p className="text-sm text-warm-muted">
          This tool provides general legal information and self-help organization — not legal advice.
          No attorney-client relationship is created by using this service.
          For advice specific to your situation, consult a licensed attorney.
        </p>
      </div>
    </footer>
  )
}
```

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "legal-disclaimer" | head -5
```

Expected: no output.

**Step 3: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/layout/legal-disclaimer.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): increase legal disclaimer font size and prominence"
```

---

## Task 9: Add Gmail/Google import consent notice

Before users connect their Gmail to import case-related emails, show a consent notice explaining what data is accessed.

**Files:**
- Modify: `apps/web/src/app/(authenticated)/case/[id]/emails/page.tsx`

**Step 1: Read the current emails page**

Read `apps/web/src/app/(authenticated)/case/[id]/emails/page.tsx` to understand the current Google auth trigger point.

**Step 2: Add consent notice in the connect-to-Gmail UI**

Find where the Gmail connect button or prompt is shown (look for `auth/google`, `disconnect`, or similar). Before the connect action, display:

```tsx
<div className="rounded-lg border border-warm-border bg-warm-bg p-4 space-y-3 mb-4">
  <p className="text-sm font-medium text-warm-text">Before connecting Gmail</p>
  <ul className="text-xs text-warm-muted space-y-1 list-disc pl-4">
    <li>Lawyer Free will read your Gmail messages to help identify case-related emails.</li>
    <li>We access only messages — we do not send emails on your behalf.</li>
    <li>You can disconnect Gmail at any time from your account settings.</li>
    <li>Email content may be processed by OpenAI to generate summaries.</li>
  </ul>
</div>
```

If the page is a server component that shows a connect link, wrap the connect button in this notice. If there is no connect UI visible (already connected), skip this notice display.

**Step 3: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "emails/page" | head -5
```

Expected: no output.

**Step 4: Commit**

```bash
git -C "/Users/minwang/lawyer free" add "apps/web/src/app/(authenticated)/case/[id]/emails/page.tsx"
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add Gmail import consent notice before Google auth"
```

---

## Task 10: Verify all Phase 2 changes compile and pass tests

**Step 1: Full TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output.

**Step 2: Run existing tests**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run --reporter=verbose 2>&1 | tail -20
```

Expected: all existing tests pass.
