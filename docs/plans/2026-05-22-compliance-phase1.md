# Legal-Tech Compliance — Phase 1 (Launch Blockers)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 8 must-have compliance issues before launch: consent at signup, ToS page, restrict high-risk AI prompts, fix PI marketing copy, document generation warnings, OpenAI disclosure, product name tagline.

**Architecture:** All changes are isolated to UI components and prompt strings. No new API routes or database migrations. Each task touches 1–2 files maximum.

**Tech Stack:** Next.js 15, React, TypeScript, Tailwind CSS (custom tokens: `text-warm-text`, `text-warm-muted`, `bg-calm-amber`)

---

## Task 1: Add legal consent checkbox to signup form

**Files:**
- Modify: `apps/web/src/components/auth/welcome-auth-card.tsx` (lines 88–108 — `handleSignup` + the signup form JSX below)

The signup form is rendered inside the `AuthTabs` component when `mode === 'signup'` and `authTab === 'email'`. The form currently calls `handleSignup` on submit with no consent gate.

**Step 1: Add consent state variable**

In the existing `useState` block (around line 26), add:
```typescript
const [consentChecked, setConsentChecked] = useState(false)
```

Reset it in `handleModeChange`:
```typescript
function handleModeChange(newMode: AuthMode) {
  setMode(newMode)
  setError(null)
  setShowForgotPassword(false)
  setConsentChecked(false)   // add this line
}
```

**Step 2: Block signup if unchecked**

In `handleSignup` (line 88), add a guard at the top:
```typescript
async function handleSignup(e: React.FormEvent) {
  e.preventDefault()
  if (!consentChecked) {
    setError('Please acknowledge the terms to continue.')
    return
  }
  setLoading(true)
  setError(null)
  // ... rest unchanged
```

**Step 3: Add consent checkbox to the signup form JSX**

Find the signup form (currently ends with the Submit button labeled "Create Account" or similar). Add the checkbox block ABOVE the submit button:

```tsx
{mode === 'signup' && (
  <div className="flex items-start gap-2">
    <input
      id="consent"
      type="checkbox"
      checked={consentChecked}
      onChange={(e) => setConsentChecked(e.target.checked)}
      className="mt-1 h-4 w-4 shrink-0 rounded border-warm-border accent-calm-indigo"
    />
    <label htmlFor="consent" className="text-xs text-warm-muted leading-relaxed">
      I understand that Lawyer Free provides general legal information and self-help tools — not legal advice — and that no attorney-client relationship is formed by using this service. My case data will be processed by OpenAI to generate AI responses.{' '}
      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-calm-indigo underline">
        Terms of Service
      </a>
    </label>
  </div>
)}
```

Also disable the submit button when consent is not checked in signup mode:
```tsx
disabled={loading || (mode === 'signup' && !consentChecked)}
```

**Step 4: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "welcome-auth-card" | head -5
```

Expected: no output.

**Step 5: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/auth/welcome-auth-card.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add legal consent checkbox to signup form"
```

---

## Task 2: Create Terms of Service page

**Files:**
- Create: `apps/web/src/app/terms/page.tsx`

**Step 1: Create the file**

```tsx
import { LegalDisclaimer } from '@/components/layout/legal-disclaimer'

export const metadata = {
  title: 'Terms of Service | Lawyer Free',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-warm-text">Terms of Service</h1>
      <p className="text-sm text-warm-muted">Last updated: May 22, 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">1. Not a Law Firm</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          Lawyer Free is not a law firm and does not provide legal advice. Use of this platform
          does not create an attorney-client relationship. The information, documents, and
          AI-generated content provided are for general informational and self-help purposes only.
          For advice specific to your situation, consult a licensed attorney.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">2. AI-Generated Content</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          This platform uses artificial intelligence (powered by OpenAI) to generate documents,
          summaries, and legal research. AI-generated content may contain errors, omissions, or
          outdated information. You are responsible for reviewing all AI-generated content for
          accuracy before using it in any legal proceeding. Lawyer Free makes no warranty that
          AI-generated documents are suitable for filing in any court.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">3. OpenAI Data Processing</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          To generate AI responses, the facts and case details you enter are sent to OpenAI&apos;s
          API. Do not enter sensitive personal information (Social Security numbers, bank account
          numbers, medical records) that you do not want processed by a third party. Review
          OpenAI&apos;s privacy policy at openai.com/policies/privacy-policy for details on how
          they handle data.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">4. Limitation of Liability</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          To the maximum extent permitted by law, Lawyer Free shall not be liable for any
          damages arising from your use of this platform, including adverse legal outcomes,
          missed deadlines, or reliance on AI-generated content. You use this service at your
          own risk.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">5. Jurisdiction</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          This platform is designed to assist with civil cases in U.S. state courts. It is not
          designed for criminal matters, immigration proceedings, or cases outside the
          United States. Laws vary by jurisdiction — always verify that information applies to
          your specific court and state.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-warm-text">6. Data Retention</h2>
        <p className="text-sm text-warm-text leading-relaxed">
          Your case data is stored on our servers for as long as your account is active. You
          may delete your account and all associated data by contacting support. We retain
          anonymized usage logs for up to 12 months.
        </p>
      </section>

      <LegalDisclaimer />
    </div>
  )
}
```

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "terms" | head -5
```

Expected: no output.

**Step 3: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/app/terms/page.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add Terms of Service page with liability, AI, and data sections"
```

---

## Task 3: Restrict STRATEGY_NOTES_SYSTEM_PROMPT

The current `STRATEGY_NOTES_SYSTEM_PROMPT` in `apps/web/src/lib/ai/case-summary.ts` generates trial strategy including "Opening Statement Themes", "Cross-Exam Points", and "Closing Framework". These sections constitute legal advice and are the highest-risk content in the codebase.

**Files:**
- Modify: `apps/web/src/lib/ai/case-summary.ts` (lines 35–51)

**Step 1: Replace the prompt**

Replace the entire `STRATEGY_NOTES_SYSTEM_PROMPT` constant (lines 35–51) with:

```typescript
export const STRATEGY_NOTES_SYSTEM_PROMPT = `You help a pro se litigant organize their trial preparation materials.

Given case details and evidence, produce an organizational guide covering:
1. Key Exhibits — which exhibits to organize and a suggested logical grouping order
2. Witness List — anticipated witnesses and the topics they may address
3. Anticipated Objections — common objections that arise in this dispute type and general information on how they work procedurally
4. Document Checklist — documents that are typically relevant for this type of case
5. Preparation Reminders — organizational reminders (e.g., arrive early, bring extra copies)

RULES:
- You are NOT a lawyer. This is an organizational aid, not legal strategy.
- Never give legal advice or predict outcomes
- Never use directive language ("you must", "you should")
- Never suggest specific arguments, themes, or what to say to a jury
- Frame everything as things to "consider organizing" or "commonly relevant"
- Focus on logistics and organization, not legal arguments or advocacy
- Include a footer: "This organizational guide is a self-help tool only. Consult a licensed attorney before trial."

Respond with structured sections as described above.`
```

**Step 2: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "case-summary" | head -5
```

Expected: no output.

**Step 3: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/lib/ai/case-summary.ts
git -C "/Users/minwang/lawyer free" commit -m "fix(compliance): restrict STRATEGY_NOTES_SYSTEM_PROMPT — remove Opening Statement, Cross-Exam, Closing Framework"
```

---

## Task 4: Fix personal injury marketing copy

**Files:**
- Modify: `apps/web/src/app/learn-more/personal-injury/page.tsx`

The hero subtext on line 29–32 says "You don't need a lawyer to fight for fair compensation." This implies the platform can substitute for legal representation, which is the core UPL risk.

**Step 1: Fix the hero subtext (lines 29–32)**

Replace:
```tsx
<p className="text-lg text-warm-muted max-w-2xl mx-auto">
  You don&apos;t need a lawyer to fight for fair compensation. We guide you through every
  step.
</p>
```

With:
```tsx
<p className="text-lg text-warm-muted max-w-2xl mx-auto">
  We help you organize your claim, understand your options, and prepare your
  documentation — step by step.
</p>
```

**Step 2: Fix the CTA heading (line 99)**

Replace:
```tsx
<h2 className="text-2xl font-bold text-warm-text mb-4">
  Ready to fight for fair compensation?
</h2>
```

With:
```tsx
<h2 className="text-2xl font-bold text-warm-text mb-4">
  Ready to organize your personal injury claim?
</h2>
```

**Step 3: Add attorney consultation note to the disclaimer footer**

The existing footer disclaimer (lines 111–118) is adequate but add one sentence. Replace the `<p>` content with:

```tsx
<p>
  Lawyer Free is not a law firm and does not provide legal advice. The information and
  documents generated by this platform are for educational and self-help purposes only.
  Personal injury cases — especially those involving serious injuries, insurance disputes,
  or comparative fault — can be complex. You should consult a licensed attorney for advice
  specific to your situation. Use of this platform does not create an attorney-client
  relationship.
</p>
```

**Step 4: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "personal-injury" | head -5
```

Expected: no output.

**Step 5: Commit**

```bash
git -C "/Users/minwang/lawyer free" add "apps/web/src/app/learn-more/personal-injury/page.tsx"
git -C "/Users/minwang/lawyer free" commit -m "fix(compliance): revise PI marketing copy — remove 'don't need a lawyer' language"
```

---

## Task 5: Add pre-generation confirmation to document generator

**Files:**
- Modify: `apps/web/src/components/discovery/document-generator.tsx`

Currently the "Generate Document" button calls `handleGenerate` directly with no warning. Users need to acknowledge AI limitations before generation.

**Step 1: Add confirmation state**

In the `useState` block at the top, add:
```typescript
const [showGenerateConfirm, setShowGenerateConfirm] = useState(false)
const [generateConsentChecked, setGenerateConsentChecked] = useState(false)
```

**Step 2: Change the button to show confirm first**

Change the "Generate Document" Button's `onClick` from `handleGenerate` to:
```tsx
onClick={() => {
  setGenerateConsentChecked(false)
  setShowGenerateConfirm(true)
}}
```

**Step 3: Add the confirmation dialog block**

Import Dialog components (they're already imported elsewhere in the project — check `@/components/ui/dialog`):

Add import at top:
```typescript
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
```

Add the dialog just before the closing `</CardContent>`:

```tsx
<Dialog open={showGenerateConfirm} onOpenChange={setShowGenerateConfirm}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Before You Generate</DialogTitle>
      <DialogDescription>
        AI-generated legal documents have important limitations.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-3 py-2">
      <ul className="text-sm text-warm-text space-y-2 list-disc pl-4">
        <li>This document is a <strong>draft only</strong> — it has not been reviewed by a licensed attorney.</li>
        <li>Do not file this document in any court without independent legal review.</li>
        <li>AI may make errors. Verify every factual statement and legal reference.</li>
        <li>Your case facts will be sent to OpenAI to generate this document.</li>
      </ul>
      <div className="flex items-start gap-2 pt-1">
        <input
          id="generate-consent"
          type="checkbox"
          checked={generateConsentChecked}
          onChange={(e) => setGenerateConsentChecked(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 rounded border-warm-border accent-calm-indigo"
        />
        <label htmlFor="generate-consent" className="text-xs text-warm-muted leading-relaxed">
          I understand this is an unreviewed AI draft and I will not file it without independent review.
        </label>
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowGenerateConfirm(false)}>
        Cancel
      </Button>
      <Button
        disabled={!generateConsentChecked}
        onClick={() => {
          setShowGenerateConfirm(false)
          handleGenerate()
        }}
      >
        Generate Document
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Step 4: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "document-generator" | head -5
```

Expected: no output.

**Step 5: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/discovery/document-generator.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add pre-generation consent modal to document generator"
```

---

## Task 6: Add export confirmation before document download

**Files:**
- Modify: `apps/web/src/components/discovery/document-generator.tsx` (continuing from Task 5)

The "Download" button currently calls `handleDownload` directly, delivering a document with no final warning.

**Step 1: Add download confirmation state**

In the `useState` block, add:
```typescript
const [showDownloadConfirm, setShowDownloadConfirm] = useState(false)
```

**Step 2: Change the Download button onClick**

Change:
```tsx
<Button variant="outline" size="sm" onClick={handleDownload}>
```
To:
```tsx
<Button variant="outline" size="sm" onClick={() => setShowDownloadConfirm(true)}>
```

**Step 3: Add download confirmation dialog**

Add this dialog after the generate-confirm dialog (both can coexist):

```tsx
<Dialog open={showDownloadConfirm} onOpenChange={setShowDownloadConfirm}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Download Draft Document</DialogTitle>
      <DialogDescription>
        Before downloading, please confirm you understand the following.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-2 py-2 text-sm text-warm-text">
      <p>This AI-generated document:</p>
      <ul className="list-disc pl-4 space-y-1">
        <li>Has <strong>NOT</strong> been reviewed by a licensed attorney</li>
        <li>Should be treated as a starting draft, not a finished document</li>
        <li>May contain errors in law, facts, or formatting</li>
      </ul>
      <p className="pt-1 text-warm-muted text-xs">
        Always have a qualified attorney review before filing or sending.
      </p>
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowDownloadConfirm(false)}>
        Cancel
      </Button>
      <Button
        onClick={() => {
          setShowDownloadConfirm(false)
          handleDownload()
        }}
      >
        Download Anyway
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Step 4: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | grep "document-generator" | head -5
```

Expected: no output.

**Step 5: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/discovery/document-generator.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add download confirmation dialog to document generator"
```

---

## Task 7: Add product name tagline

The product name "Lawyer Free" is ambiguous — it could mean "free of lawyers" (sounds like UPL) or "legal help that's free". Add a persistent clarifying tagline everywhere the product name appears without context.

**Files:**
- Modify: `apps/web/src/components/auth/welcome-panel.tsx`

**Step 1: Read the current welcome panel**

Read `apps/web/src/components/auth/welcome-panel.tsx` and find where the product name "Lawyer Free" is displayed (likely in an `<h1>` or logo).

**Step 2: Add tagline below the product name**

Find the element that renders "Lawyer Free" as text. Immediately after it, add:
```tsx
<p className="text-sm text-warm-muted mt-1">
  Legal self-help tools for pro se litigants
</p>
```

If the product name is an image/logo, add the tagline as a sibling element below the logo `<img>` or `<span>`.

**Step 3: Also update the app layout title**

In `apps/web/src/app/layout.tsx`, find the `metadata` export. If `description` is missing or generic, update it:
```typescript
export const metadata = {
  title: 'Lawyer Free',
  description: 'Legal self-help tools for pro se litigants — not a law firm, not legal advice.',
}
```

**Step 4: TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -5
```

Expected: no output.

**Step 5: Commit**

```bash
git -C "/Users/minwang/lawyer free" add apps/web/src/components/auth/welcome-panel.tsx apps/web/src/app/layout.tsx
git -C "/Users/minwang/lawyer free" commit -m "feat(compliance): add clarifying tagline to product name"
```

---

## Task 8: Verify all Phase 1 changes compile and type-check

**Step 1: Full TypeScript check**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (zero type errors).

**Step 2: Run existing tests to check for regressions**

```bash
cd "/Users/minwang/lawyer free/apps/web" && npx vitest run --reporter=verbose 2>&1 | tail -20
```

Expected: all existing tests pass.

**Step 3: Final commit if any cleanup was needed**

Only commit if there were fixup changes not covered by the previous task commits.
