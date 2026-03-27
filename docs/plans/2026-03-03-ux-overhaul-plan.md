# Zero-Knowledge Petition Filing UX Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Make the petition filing flow accessible to plaintiffs with zero legal knowledge — replace jargon-heavy forms with a conversational wizard, add annotated draft viewing, interactive service guide, and comprehensive educational polish across 19 UX fixes.

**Architecture:** Reusable `WizardShell` component orchestrates multi-step flows with progress bar, auto-save, and navigation. Enhanced `AnnotatedDraftViewer` adds numbered annotations with a sidebar for plain-English explanations. New `ServiceGuide` provides interactive step-by-step service of process guidance. Filing prompts modified to generate annotations and handle government entities. All existing data flows preserved — changes are additive to the UI layer.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS (warm design tokens), shadcn/ui, Supabase, Anthropic Claude API, lucide-react

---

## Task 1: WizardShell + HelpTooltip Infrastructure

**Files:**
- Create: `src/components/ui/wizard-shell.tsx`
- Create: `src/components/ui/help-tooltip.tsx`

### WizardShell Component

A reusable multi-step wizard container that manages step navigation, progress bar, and auto-save. This replaces StepRunner for multi-step flows while keeping StepRunner for simpler single-phase steps.

```typescript
// src/components/ui/wizard-shell.tsx
'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

export interface WizardStep {
  id: string
  title: string           // e.g. "Who are you?"
  subtitle?: string       // e.g. "Tell us about yourself"
  estimateMinutes?: number // e.g. 3
}

interface WizardShellProps {
  caseId: string
  title: string                    // Page title
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSave?: () => Promise<void>     // Auto-save callback
  onComplete?: () => Promise<void> // Final submit
  children: React.ReactNode        // Current step content
  canAdvance?: boolean             // Validation gate
  totalEstimateMinutes?: number    // e.g. 20
  completeButtonLabel?: string     // Default: "Generate My Petition"
}
```

**Implementation details:**
- Progress bar: `(currentStep / steps.length) * 100`
- Step indicator shows: step title + "Step X of Y"
- Auto-save fires `onSave()` on step change (debounced) via `useEffect` watching `currentStep`
- Back button: goes to previous step (or back to dashboard on step 0)
- Next button: calls `canAdvance` check, then `onStepChange(currentStep + 1)`
- On final step: shows `completeButtonLabel` and calls `onComplete()`
- Time estimate shows if `totalEstimateMinutes` provided: "About 20 minutes" with Clock icon
- Uses warm design tokens: `bg-warm-bg`, `text-warm-text`, `text-warm-muted`
- Progress bar uses `bg-calm-indigo` fill
- Mobile responsive: step list collapses to just progress bar on small screens

**Key JSX structure:**
```jsx
<div className="max-w-2xl mx-auto px-4 py-8">
  <Link href={`/case/${caseId}`} className="text-sm text-warm-muted hover:text-warm-text mb-4 inline-block">
    ← Back to dashboard
  </Link>
  <h1 className="text-2xl font-semibold text-warm-text mb-1">{title}</h1>

  {/* Time estimate */}
  {totalEstimateMinutes && (
    <div className="flex items-center gap-1.5 text-xs text-warm-muted mb-4">
      <Clock className="h-3.5 w-3.5" />
      About {totalEstimateMinutes} minutes
    </div>
  )}

  {/* Progress bar */}
  <div className="mb-6">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-warm-muted">
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </span>
      <span className="text-xs text-warm-muted">{Math.round(progressPercent)}%</span>
    </div>
    <Progress value={progressPercent} className="h-2" />
  </div>

  {/* Content card */}
  <Card>
    <CardContent className="pt-6">
      <h2 className="text-lg font-medium text-warm-text mb-1">
        {steps[currentStep].title}
      </h2>
      {steps[currentStep].subtitle && (
        <p className="text-sm text-warm-muted mb-6">{steps[currentStep].subtitle}</p>
      )}

      {children}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBack} disabled={loading}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {currentStep === 0 ? 'Dashboard' : 'Back'}
        </Button>

        <div className="flex items-center gap-3">
          {onSave && (
            <button onClick={handleSave} className="text-xs text-warm-muted hover:text-warm-text" disabled={loading}>
              Save for later
            </button>
          )}
          <Button onClick={handleNext} disabled={!canAdvance || loading}>
            {isLastStep ? (completeButtonLabel ?? 'Continue') : 'Next'}
            {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
```

### HelpTooltip Component

An inline help component that provides contextual explanations for legal terminology and form fields. Can be used in two modes: inline hint (always visible) and expandable tooltip (click to reveal).

```typescript
// src/components/ui/help-tooltip.tsx
'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface HelpTooltipProps {
  label: string              // e.g. "What does this mean?"
  children: React.ReactNode  // Explanation content
  variant?: 'inline' | 'expandable' // Default: 'expandable'
  icon?: boolean             // Show ? icon. Default: true
}
```

**Implementation:**
- `expandable` (default): Shows a small "? What does this mean?" button. Click toggles a light indigo panel below with the explanation.
- `inline`: Always-visible hint text styled with `text-xs text-warm-muted` below the label.
- Panel styling: `rounded-lg bg-calm-indigo/5 border border-calm-indigo/20 p-3 text-sm text-warm-text`
- Smooth height transition: use CSS `overflow-hidden` + `max-h-0`/`max-h-96` with `transition-all duration-200`
- The `children` prop allows rich content (paragraphs, lists, examples)

**Example usage:**
```jsx
<Label htmlFor="amount">How much money are you asking for?</Label>
<HelpTooltip label="How do I figure out the right amount?">
  <p>Add up all the money you lost or spent because of what happened:</p>
  <ul className="list-disc pl-4 mt-2 space-y-1">
    <li>Money the other person owes you</li>
    <li>Repair or replacement costs</li>
    <li>Medical bills</li>
    <li>Lost wages</li>
  </ul>
</HelpTooltip>
```

---

## Task 2: Pre-flight Checklist

**Files:**
- Create: `src/components/step/filing/preflight-checklist.tsx`

A "What to prepare before you start" component shown at the beginning of the petition wizard. Helps users gather their information before diving into the form.

**Props:**
```typescript
interface PreflightChecklistProps {
  disputeType: string | null
  onReady: () => void  // Called when user clicks "I'm ready"
}
```

**Content structure:**
- Title: "Before You Start"
- Subtitle: "Having these items ready will make this go faster."
- Checklist sections (using HelpTooltip for expandable details):

1. **Your personal information** — Full legal name, current mailing address
2. **The other party's information** — Their full legal name, last known address (if known)
3. **What happened** — A brief description of the dispute (dates, amounts, key events)
4. **Documents & evidence** (expandable) — Contracts, receipts, photos, text messages, emails
5. **What you want** — Dollar amount or other resolution you're seeking

- Dispute-type-specific hint below the list:
  - `debt_collection`: "Have the original agreement or contract, payment records, and demand letters"
  - `landlord_tenant`: "Have your lease agreement, photos of damage, and communication records"
  - `personal_injury`: "Have medical records, bills, photos of injuries, and incident reports"
  - `contract`: "Have the contract, evidence of breach, and records of any damages"
  - `property`: "Have property records, appraisals, and photos"
  - `family`: "Have relevant court orders, financial records, and documentation"
  - default: "Gather all relevant documents and records"

- "I have my information ready" button at bottom
- Time estimate: "This will take about 15-20 minutes"

**Style:** Uses Card with `bg-white`, warm design tokens, HelpTooltip for expandable sections.

---

## Task 3: Venue Helper + Jurisdiction Validation

**Files:**
- Create: `src/lib/rules/venue-helper.ts`
- Create: `tests/unit/rules/venue-helper.test.ts`

### Venue Helper (Pure Functions, TDD)

```typescript
// src/lib/rules/venue-helper.ts

export interface VenueRecommendation {
  recommended_county: string | null  // null if we can't determine
  explanation: string                 // Plain-English why
  alternativeNote?: string           // "You could also file in..."
  rule_citation: string              // e.g. "Tex. Civ. Prac. & Rem. Code § 15.002"
}

/**
 * Recommends the correct county for filing based on Texas venue rules.
 * Pure function — zero side effects.
 */
export function recommendVenue(input: {
  disputeType: string
  defendantCounty: string | null     // Where defendant resides
  incidentCounty: string | null      // Where the event occurred
  propertyCounty: string | null      // Where real property is (if applicable)
  contractCounty: string | null      // Where contract was to be performed
}): VenueRecommendation
```

**Texas venue rules (simplified for pro se users):**
1. **Real property** → county where property is located (mandatory venue)
2. **Landlord-tenant** → county where property is located (mandatory venue)
3. **Personal injury** → county where injury occurred OR defendant's county
4. **Contract** → county where contract to be performed OR defendant's county
5. **Default** → county where defendant resides (general venue rule)

**Jurisdiction validation function:**
```typescript
export interface JurisdictionCheck {
  valid: boolean
  warning?: string    // Shown to user if amount/court mismatch
  suggestion?: string // Alternative court if mismatch
}

/**
 * Validates that the amount sought matches the court's jurisdictional limits.
 */
export function validateJurisdiction(input: {
  courtType: string      // jp, county, district, federal
  amountSought: number
  isOutOfState: boolean
}): JurisdictionCheck
```

**Jurisdiction limits:**
- JP: $0 – $20,000. Warning if amount > $20,000: "JP Court handles claims up to $20,000. Consider filing in County Court."
- County: $200.01 – $200,000 (no minimum for injunctive relief). Warning if amount > $200,000: "County Court handles claims up to $200,000. Consider filing in District Court."
- District: No upper limit, no minimum. Always valid.
- Federal: Must exceed $75,000 for diversity. Warning if amount < $75,001 and not federal question.

**Tests (12):**
- `recommendVenue`: returns defendant's county by default, returns property county for real property, returns property county for landlord-tenant, returns incident county for personal injury with fallback, returns contract county for contract dispute, handles nulls gracefully, returns correct rule citation per type
- `validateJurisdiction`: valid for JP under $20K, warns for JP over $20K, valid for county in range, warns for county over $200K, warns for federal under $75K, always valid for district

---

## Task 4: Petition Wizard Component

**Files:**
- Create: `src/components/step/petition-wizard.tsx`
- Create: `src/components/step/wizard-steps/parties-step.tsx`
- Create: `src/components/step/wizard-steps/venue-step.tsx`
- Create: `src/components/step/wizard-steps/facts-step.tsx`
- Create: `src/components/step/wizard-steps/claims-step.tsx`
- Create: `src/components/step/wizard-steps/relief-step.tsx`
- Create: `src/components/step/wizard-steps/review-step.tsx`
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` — change `prepare_filing` case

This is the core component that replaces `prepare-filing-step.tsx` with a conversational wizard.

### PetitionWizard (orchestrator)

```typescript
// src/components/step/petition-wizard.tsx
'use client'

interface PetitionWizardProps {
  caseId: string
  taskId: string
  existingMetadata?: Record<string, unknown>
  caseData: {
    role: string
    court_type: string
    county: string | null
    dispute_type: string | null
    government_entity?: boolean
  }
}
```

**Wizard steps (plaintiff flow — 7 steps):**
```typescript
const PLAINTIFF_STEPS: WizardStep[] = [
  { id: 'preflight', title: 'Before You Start', subtitle: "Let's make sure you have what you need.", estimateMinutes: 2 },
  { id: 'parties', title: 'Who Is Involved?', subtitle: 'Tell us about yourself and who you are suing.', estimateMinutes: 3 },
  { id: 'venue', title: 'Where Should You File?', subtitle: "We'll help you pick the right court location.", estimateMinutes: 2 },
  { id: 'facts', title: 'What Happened?', subtitle: 'Tell your story in your own words.', estimateMinutes: 5 },
  { id: 'claims', title: 'Why Is This Wrong?', subtitle: "Let's identify the legal basis for your case.", estimateMinutes: 3 },
  { id: 'relief', title: 'What Do You Want the Court to Do?', subtitle: 'Tell us how you want this resolved.', estimateMinutes: 3 },
  { id: 'review', title: 'Review Everything', subtitle: 'Make sure all your information is correct before we generate your petition.', estimateMinutes: 2 },
]
```

**State management:**
- All form state stored in a single `formData` object (same fields as current `buildMetadata()`)
- Auto-save via `onSave()` calls `patchTask('in_progress', formData)` — saves to task metadata
- Hydrate from `existingMetadata` on mount
- `currentStep` tracked in state, persisted to metadata for resume
- `canAdvance` computed per step (validates required fields)

**Step components:**

### PartiesStep (`wizard-steps/parties-step.tsx`)
Same data collection as current `parties-section.tsx` but with plain-English labels:
- "What is your full legal name?" (with HelpTooltip: "Use your full legal name as it appears on your driver's license or government ID")
- "What is your mailing address?" (with HelpTooltip: "The court will send documents here. Use your current address.")
- "Who are you suing?" (with HelpTooltip: "Use their full legal name. If suing a business, use the registered business name.")
- "What is their address?" (with HelpTooltip: "This is needed to serve them court papers. If unknown, you can look it up later.")
- Same add/remove party functionality

### VenueStep (`wizard-steps/venue-step.tsx`)
New step that helps users determine where to file:
- Shows current court type recommendation with explanation
- "Where does the person you're suing live?" — county input with HelpTooltip explaining venue
- "Where did this happen?" — county input
- For property/landlord: "Where is the property located?" — county input
- For contracts: "Where was the contract supposed to be performed?" — county input
- Calls `recommendVenue()` and `validateJurisdiction()` from Task 3
- Shows recommendation with rule citation in an info card
- If jurisdiction mismatch detected: amber warning card with suggestion
- County input: text input (not dropdown — too many Texas counties)
- Read-only court type display with explanation from court-recommendation

### FactsStep (`wizard-steps/facts-step.tsx`)
Guided fact-gathering with examples:
- "In your own words, what happened?" — textarea (required, min 50 chars)
  - HelpTooltip with dispute-specific examples:
    - debt_collection: "Example: 'I loaned John $3,000 on March 1, 2025. He signed a promissory note agreeing to repay by June 1. He has not paid any of it back despite multiple requests.'"
    - landlord_tenant: "Example: 'I rented an apartment at 123 Main St. The lease started January 2025. The landlord never fixed a water leak I reported three times...'"
    - etc.
- "When did this happen?" — date input with hint "If it happened over time, pick the most important date"
- "Where did this happen?" — text input
- Real-time character count below textarea with gentle nudge: "Tip: More detail helps. Aim for at least 3-4 sentences."
- Validation: description must be >= 50 characters (up from current 10)

### ClaimsStep (`wizard-steps/claims-step.tsx`)
Replaces the raw "Claim Details" textarea with guided questions:
- Title: "Why Is This Wrong?"
- Subtitle: "You don't need to know legal terms — just tell us what went wrong."
- Context card (indigo): "The court needs to know why what happened was wrong. This is different from your story (what happened). Think of it as: 'What rule or agreement did they break?'"
- HelpTooltip with dispute-specific explanations:
  - debt_collection: "They owe you money and won't pay. Common reasons: broke a contract, refused to pay for services, bounced a check."
  - landlord_tenant: "They violated the lease or broke housing laws. Common reasons: didn't make repairs, kept your deposit unfairly, illegal lockout."
  - personal_injury: "They were careless or reckless and you got hurt. Common reasons: car accident, slip and fall, defective product."
  - contract: "They didn't hold up their end of the deal. Common reasons: didn't deliver what was promised, delivered late, delivered defective goods."
  - property: "They're interfering with your property rights. Common reasons: boundary dispute, damage to property, trespassing."
  - family: "The court needs to know what family issue needs resolving."
  - other: "Explain what agreement, duty, or law was violated."
- Textarea with prompt specific to dispute type (same prompts as current DISPUTE_PROMPTS but with plain-English preamble)

### ReliefStep (`wizard-steps/relief-step.tsx`)
Replaces "Relief Requested" with plain English:
- Title: "What Do You Want the Court to Do?"
- "How much money are you asking for?" — number input with HelpTooltip explaining how to calculate (same as Task 2 help content)
- Jurisdiction validation inline: if amount exceeds court limit, show amber warning from `validateJurisdiction()`
- "Is there anything else you want besides money?" — textarea with examples: "For example: 'Return my property', 'Stop doing X', 'Fix the damage'"
- HelpTooltip: "Besides money, courts can also order someone to do something or stop doing something. This is called an 'injunction.' You don't need to use that word — just describe what you want."
- "Ask the court to make them pay your filing costs?" — checkbox (default: checked)
  - HelpTooltip: "Filing a lawsuit costs money (court fees, serving papers). If you win, the court can order the other side to reimburse these costs."
- "Ask the court to make them pay reasonable attorney fees?" — checkbox (default: unchecked)
  - HelpTooltip: "Even though you're representing yourself (which is called 'pro se'), some Texas laws allow you to ask for attorney fees. This doesn't mean you need a lawyer — it's a type of additional compensation the law allows in certain cases, like breach of contract."

### ReviewStep (`wizard-steps/review-step.tsx`)
Summary of all collected information before generating the draft:
- Read-only display of all sections with "Edit" link per section (goes back to that step)
- Government entity warning if applicable (amber card): "You indicated you're filing against a government entity. Special rules may apply, including shorter deadlines and notice requirements."
- Summary cards for: Parties, Venue, Facts, Claims, Relief
- "Generate My Petition" button triggers `onComplete()`

### Page Router Change

In `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx`, change the `prepare_filing` case:

```typescript
case 'prepare_filing': {
  const { data: caseRow } = await supabase
    .from('cases')
    .select('role, court_type, county, dispute_type')
    .eq('id', id)
    .single()

  // Also check if government_entity flag exists from case creation
  const { data: intakeTask } = await supabase
    .from('tasks')
    .select('metadata')
    .eq('case_id', id)
    .eq('task_key', 'intake')
    .maybeSingle()

  const intakeMeta = intakeTask?.metadata as Record<string, unknown> | null
  const governmentEntity = (intakeMeta?.government_entity as boolean) ?? false

  if (!caseRow || caseRow.court_type === 'unknown') {
    // Same "Court type needed" error as before
  }

  return (
    <PetitionWizard
      caseId={id}
      taskId={taskId}
      existingMetadata={task.metadata}
      caseData={{
        ...caseRow,
        government_entity: governmentEntity,
      }}
    />
  )
}
```

**Important: Keep `PrepareFilingStep` import and component.** The wizard replaces only the `prepare_filing` switch case. The old component stays for potential future use or defendant flow if we decide to keep it simpler.

---

## Task 5: Annotated Draft Viewer + AI Annotations

**Files:**
- Create: `src/components/step/filing/annotated-draft-viewer.tsx`
- Modify: `src/lib/rules/filing-prompts.ts` — add annotation instructions to prompt
- Modify: `src/app/api/cases/[id]/generate-filing/route.ts` — parse annotations from response
- Modify: `src/components/step/petition-wizard.tsx` — use AnnotatedDraftViewer

### AnnotatedDraftViewer Component

Enhanced version of `DraftViewer` that displays the legal document with numbered annotations and a sidebar for plain-English explanations.

```typescript
// src/components/step/filing/annotated-draft-viewer.tsx
'use client'

export interface DraftAnnotation {
  id: number
  section: string      // e.g. "Caption", "Parties", "Facts", "Prayer"
  text: string         // The annotation explanation in plain English
  startLine: number    // Line number in the draft where this annotation applies
}

interface AnnotatedDraftViewerProps {
  draft: string
  annotations: DraftAnnotation[]
  onDraftChange: (v: string) => void
  onRegenerate: () => void
  regenerating: boolean
  acknowledged: boolean
  onAcknowledgeChange: (v: boolean) => void
  documentTitle?: string
}
```

**Layout:**
- Two-column layout on desktop: draft text (70%) + annotation sidebar (30%)
- Single column on mobile: annotations appear above/below sections
- Numbered annotation markers in the left gutter of the draft textarea
- Clicking a marker highlights the corresponding annotation in the sidebar
- Active annotation has indigo highlight
- Sidebar scrolls to follow the cursor position in the draft

**Annotation sidebar content:**
```jsx
<div className="space-y-3">
  {annotations.map((ann) => (
    <div
      key={ann.id}
      className={`rounded-lg p-3 border text-sm cursor-pointer transition-colors ${
        activeAnnotation === ann.id
          ? 'bg-calm-indigo/10 border-calm-indigo/30'
          : 'bg-white border-warm-border hover:border-calm-indigo/20'
      }`}
      onClick={() => scrollToLine(ann.startLine)}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="h-5 w-5 rounded-full bg-calm-indigo text-white text-xs flex items-center justify-center font-medium">
          {ann.id}
        </span>
        <span className="text-xs font-medium text-calm-indigo">{ann.section}</span>
      </div>
      <p className="text-warm-text">{ann.text}</p>
    </div>
  ))}
</div>
```

**Desktop layout:**
```jsx
<div className="flex gap-4">
  {/* Draft area */}
  <div className="flex-1 min-w-0">
    {/* Safety banner (same as current DraftViewer) */}
    <textarea ... />
    {/* Action buttons (same as current) */}
    {/* Acknowledge checkbox (same as current) */}
  </div>

  {/* Annotation sidebar */}
  <div className="w-72 shrink-0 hidden lg:block">
    <h3 className="text-sm font-medium text-warm-text mb-3">
      What Each Section Means
    </h3>
    {/* Annotations list */}
  </div>
</div>
```

**Mobile layout:** Below the draft, show annotations in a collapsible accordion:
```jsx
<div className="lg:hidden mt-4">
  <button onClick={toggleAnnotations} className="flex items-center gap-2 text-sm font-medium text-calm-indigo">
    <BookOpen className="h-4 w-4" />
    {showAnnotations ? 'Hide' : 'Show'} section explanations ({annotations.length})
  </button>
  {showAnnotations && /* Same annotation list */}
</div>
```

### Filing Prompt Modification

Modify `buildFilingPrompt()` in `src/lib/rules/filing-prompts.ts` to request annotations:

Add to the system prompt:
```
ANNOTATIONS:
After the document text, output a section starting with "---ANNOTATIONS---" on its own line.
Below that, output one annotation per line in this exact format:
[N] SECTION_NAME: Plain-English explanation of what this section means and why it's in the document.

Number annotations sequentially starting from 1. Cover these sections at minimum:
- Caption (the header with court name and parties)
- Parties (who is involved)
- Facts/Allegations (your story)
- Causes of Action/Claims (why this is wrong legally)
- Damages/Relief (what you're asking for)
- Prayer (the formal request to the court)
- Signature Block (where you sign)

Use simple language a high school student could understand. Do NOT use legal jargon in the explanations.
```

### API Route Modification

In `src/app/api/cases/[id]/generate-filing/route.ts`, parse the annotations from the AI response:

```typescript
// After getting the raw draft text, split on annotations marker
const fullText = message.content
  .filter((block) => block.type === 'text')
  .map((block) => block.text)
  .join('\n')

const annotationMarker = '---ANNOTATIONS---'
const markerIndex = fullText.indexOf(annotationMarker)

let draft: string
let annotations: { id: number; section: string; text: string; startLine: number }[] = []

if (markerIndex !== -1) {
  draft = fullText.substring(0, markerIndex).trim()
  const annotationText = fullText.substring(markerIndex + annotationMarker.length).trim()

  // Parse annotations: [N] SECTION_NAME: explanation
  const annotationRegex = /\[(\d+)\]\s+([^:]+):\s+(.+)/g
  let match
  while ((match = annotationRegex.exec(annotationText)) !== null) {
    annotations.push({
      id: parseInt(match[1]),
      section: match[2].trim(),
      text: match[3].trim(),
      startLine: 0, // Will be computed client-side
    })
  }
} else {
  draft = fullText
}

// Return both draft and annotations
return NextResponse.json({ draft, annotations })
```

---

## Task 6: Interactive Service Guide

**Files:**
- Create: `src/components/step/filing/service-guide.tsx`

A step-by-step interactive guide that helps users understand and complete service of process. This is shown in the `file_with_court` step after the filing checklist, or as a standalone educational component.

```typescript
// src/components/step/filing/service-guide.tsx
'use client'

interface ServiceGuideProps {
  courtType: string
  county: string | null
  onComplete?: () => void // When user marks service section as understood
}
```

**Multi-step flow within the component:**

**Step 1: "Who are you serving?"**
- Radio buttons: Individual, Business, Government Entity
- Each option has a HelpTooltip with explanation

**Step 2: "How to serve them" (based on defendant type)**

For **Individual**:
- **Option A: Hire a process server** (recommended)
  - Explanation: "A process server is someone who delivers court papers for you. They're not expensive (usually $50-$100) and it's the most reliable method."
  - Link placeholder: "Find process servers in [county] County" (with note that they should search online)
  - Cost estimate: $50-$150

- **Option B: County sheriff/constable**
  - Explanation: "You can ask the county sheriff or constable to deliver the papers. This is official but may take longer."
  - Cost estimate: $75-$100

- **Option C: Certified mail (JP Court only)**
  - Only shown if `courtType === 'jp'`
  - Explanation: "For small claims, you can send papers by certified mail with return receipt requested."
  - Cost estimate: $10-$15

For **Business**:
- Must serve registered agent
- Explanation: "Every business registered in Texas has a 'registered agent' — a person designated to receive legal documents."
- HelpTooltip: "You can look up a business's registered agent at the Texas Secretary of State website (sos.state.tx.us)"
- Same delivery methods as Individual

For **Government Entity**:
- Special notice requirements
- Explanation: "Suing a government entity has special rules. You usually must send written notice of your claim BEFORE filing suit."
- Warning card (amber): "Government entities often have shorter deadlines. You may need to send a formal notice 6 months before filing."

**Step 3: "What happens next?"**
- After serving: "The other party has a deadline to respond (usually 14-26 days depending on how they were served)."
- "You'll need proof of service (called a 'Return of Service') — your process server or the sheriff will provide this."
- "Upload the Return of Service in your next step."

**Step 4: Checklist**
- [ ] I know who I need to serve
- [ ] I know how I'll serve them
- [ ] I understand I need proof of service
- "I understand the service process" button

**Style:** Card-based layout, warm design tokens, indigo highlights for key info, amber for warnings.

---

## Task 7: Government Entity Prompt + Pro Se Banner + Attorney Fees Clarification

**Files:**
- Modify: `src/lib/rules/filing-prompts.ts` — add government entity handling
- Modify: `src/app/(authenticated)/case/[id]/page.tsx` — add Pro Se banner
- (Attorney fees clarification handled in Task 4 ReliefStep)

### Government Entity Prompt Enhancement

In `buildFilingPrompt()`, add government entity awareness:

```typescript
// After building the format string, check for government entity
if (facts.government_entity) {
  format += `\n\nGOVERNMENT ENTITY NOTICE:
One or more defendants are government entities. Include:
- Reference to the Texas Tort Claims Act (Tex. Civ. Prac. & Rem. Code Ch. 101) if applicable
- Note that sovereign immunity may limit available damages
- Include a statement that proper notice was provided under § 101.101
- Do NOT include punitive damages claims against government entities
- Flag that the filer should verify notice requirements were met before filing`
}
```

Also update the `FilingFacts` type and schema to include `government_entity`:

Modify `src/lib/schemas/filing.ts`:
```typescript
// Add to filingFactsSchema
government_entity: z.boolean().optional().default(false),
```

### Pro Se Explanation Banner

Add to the case dashboard page (`src/app/(authenticated)/case/[id]/page.tsx`), at the top of the page content, above the first card:

```jsx
{/* Pro Se Explanation — shown once until dismissed */}
<ProSeBanner />
```

Create a small client component inline or as a separate file:

```typescript
// src/components/dashboard/pro-se-banner.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Scale, X } from 'lucide-react'

export function ProSeBanner() {
  const [dismissed, setDismissed] = useState(true) // Start hidden, check localStorage

  useEffect(() => {
    const wasDismissed = localStorage.getItem('pro-se-banner-dismissed')
    if (!wasDismissed) setDismissed(false)
  }, [])

  function dismiss() {
    localStorage.setItem('pro-se-banner-dismissed', 'true')
    setDismissed(true)
  }

  if (dismissed) return null

  return (
    <Card className="mb-4 border-calm-indigo/20 bg-calm-indigo/5">
      <CardContent className="py-4 px-4">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-calm-indigo shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-text">You are representing yourself ("Pro Se")</p>
            <p className="text-xs text-warm-muted mt-1">
              "Pro se" (pronounced "pro say") means you're handling your own case without a lawyer.
              This is completely legal and common. We'll guide you through every step and explain legal
              terms as they come up. This tool is not a lawyer — it helps you format documents, but
              you make all the decisions.
            </p>
          </div>
          <button onClick={dismiss} className="text-warm-muted hover:text-warm-text shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Task 8: Preservation Letter Reordering

**Files:**
- Modify: `src/lib/rules/gatekeeper.ts` — no changes needed (preservation_letter is unlocked by DB trigger `unlock_next_task` after `evidence_vault`)
- This is actually handled by the task seeding order in the database, not the gatekeeper

**Investigation needed:** Check how tasks are seeded for a new case. The preservation letter task ordering is controlled by the `sort_order` in the `tasks` table when a case is created. The gatekeeper doesn't control preservation_letter — the DB trigger `unlock_next_task` does.

**Action:** Check `src/app/api/cases/route.ts` (the case creation endpoint) for task seeding order. The preservation letter should come after intake and before prepare_filing:

Current order (likely):
1. welcome
2. intake
3. prepare_filing
4. file_with_court
5. evidence_vault
6. preservation_letter ← should be BEFORE prepare_filing

Target order:
1. welcome
2. intake
3. evidence_vault (educational, quick)
4. preservation_letter ← moved up
5. prepare_filing
6. file_with_court

**Modify the task seeding array** in the case creation API to reorder. The `unlock_next_task` trigger uses `sort_order` to determine which task to unlock next, so changing the sort_order is all that's needed.

Also check if any task has an explicit `unlock_next_task` trigger that would break with reordering. The trigger likely just finds the next `locked` task by `sort_order` and sets it to `todo`.

---

## Task 9: FAQ Accordion + Success Celebration + Progress Estimate

**Files:**
- Create: `src/components/ui/faq-accordion.tsx`
- Create: `src/components/step/filing/success-celebration.tsx`

### FAQ Accordion Component

Reusable accordion for FAQ sections on key steps.

```typescript
// src/components/ui/faq-accordion.tsx
'use client'

interface FAQItem {
  question: string
  answer: string | React.ReactNode
}

interface FAQAccordionProps {
  items: FAQItem[]
  title?: string // Default: "Common Questions"
}
```

**Implementation:**
- Uses `useState` to track which item is expanded (single-expand mode)
- Click question toggles answer visibility
- Chevron rotates on expand
- Styled with warm design tokens

**FAQ content for filing steps:**

For prepare_filing / petition wizard:
```typescript
const PETITION_FAQ: FAQItem[] = [
  {
    question: "Do I need a lawyer to file a petition?",
    answer: "No. Anyone can represent themselves in court. This is called filing 'pro se.' This tool helps you format your documents, but it's not a substitute for legal advice."
  },
  {
    question: "How much does it cost to file?",
    answer: "Filing fees vary by court: JP Court ($35-$75), County Court ($200-$300), District Court ($250-$350), Federal Court ($405). If you can't afford it, you can apply for a fee waiver."
  },
  {
    question: "What if I make a mistake?",
    answer: "You can amend (fix) your petition after filing. Courts are generally lenient with pro se filers. It's better to file and correct later than to wait."
  },
  {
    question: "How long does a case take?",
    answer: "Small claims (JP Court) typically resolve in 1-3 months. County/District Court cases can take 6-18 months. Federal cases often take 1-2 years."
  },
  {
    question: "What happens after I file?",
    answer: "You'll need to 'serve' (deliver) the papers to the other party. They then have a deadline to respond. We'll guide you through each step."
  },
]
```

### Success Celebration Screen

Shown after the user completes the `file_with_court` step (the final step in the filing flow).

```typescript
// src/components/step/filing/success-celebration.tsx
'use client'

interface SuccessCelebrationProps {
  caseId: string
  courtType: string
  filingType: string // 'petition' | 'answer'
}
```

**Content:**
- Confetti animation (CSS-only, no library — use `@keyframes` with pseudo-elements)
- Large green checkmark icon
- "Your [Petition/Answer] Has Been Filed!"
- Summary of what was accomplished
- "What's Next" card with 3 items:
  1. "Serve the other party" — with link to service guide
  2. "Keep track of deadlines" — with link to dashboard
  3. "Gather your evidence" — with link to evidence vault
- "Go to Dashboard" button

**Integration:** Modify `file-with-court-step.tsx` to show the celebration after task completion instead of immediately redirecting to dashboard.

---

## Task 10: Mobile Polish + Real-time Validation

**Files:**
- Modify: `src/components/ui/wizard-shell.tsx` — responsive adjustments
- Add validation logic to wizard step components from Task 4

### Mobile Responsiveness

The WizardShell already uses Tailwind responsive classes. Additional polish:

- Progress bar: full width on mobile, step title below bar
- Navigation buttons: stack vertically on mobile (< sm breakpoint)
- Card padding: reduce from `pt-6` to `pt-4` on mobile
- Font sizes: keep as-is (already small enough)
- Annotation sidebar: hidden on mobile, shown as accordion (handled in Task 5)

### Real-time Validation

Add to each wizard step component:

```typescript
// Validation pattern for wizard steps
interface ValidationResult {
  valid: boolean
  errors: Record<string, string> // field → error message
}

function validatePartiesStep(data: FormData): ValidationResult {
  const errors: Record<string, string> = {}
  if (!data.yourInfo.full_name.trim()) errors.your_name = "Please enter your full legal name"
  if (!data.opposingParties[0]?.full_name.trim()) errors.opp_name = "Please enter the other party's name"
  return { valid: Object.keys(errors).length === 0, errors }
}
```

- Show red border on invalid fields: `border-red-300 focus:ring-red-500/20`
- Error message below field: `text-xs text-red-500 mt-1`
- Errors appear after user interacts with the field (onBlur), not immediately
- The `canAdvance` prop on WizardShell is computed from step validation

---

## Task 11: Wire Everything + Build Verification

**Files:**
- Modify: `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` — import PetitionWizard, update prepare_filing case
- Modify: `src/components/step/file-with-court-step.tsx` — integrate ServiceGuide and SuccessCelebration
- Verify: `npx next build` passes with no errors

### Step Page Router Updates

1. Add import for PetitionWizard at top of file
2. Change `prepare_filing` case to render PetitionWizard (as specified in Task 4)
3. Keep all other switch cases unchanged

### File With Court Step Integration

In `file-with-court-step.tsx`, add after the existing filing checklist:
```jsx
<div className="mt-8">
  <h2 className="text-sm font-semibold text-warm-text mb-4">After Filing: Serve the Other Party</h2>
  <ServiceGuide courtType={courtType} county={county} />
</div>
```

### FAQ Integration

Add FAQ accordion to the petition wizard's review step and the file-with-court step:
```jsx
<div className="mt-6">
  <FAQAccordion items={PETITION_FAQ} />
</div>
```

### Build Verification

1. Run all existing tests: `npx vitest run` — expect all 712+ passing
2. Run build: `npx next build` — expect no type errors
3. Verify new components render correctly for all task_keys

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/components/ui/wizard-shell.tsx` | Create | 1 |
| `src/components/ui/help-tooltip.tsx` | Create | 1 |
| `src/components/step/filing/preflight-checklist.tsx` | Create | 2 |
| `src/lib/rules/venue-helper.ts` | Create | 3 |
| `tests/unit/rules/venue-helper.test.ts` | Create | 3 |
| `src/components/step/petition-wizard.tsx` | Create | 4 |
| `src/components/step/wizard-steps/parties-step.tsx` | Create | 4 |
| `src/components/step/wizard-steps/venue-step.tsx` | Create | 4 |
| `src/components/step/wizard-steps/facts-step.tsx` | Create | 4 |
| `src/components/step/wizard-steps/claims-step.tsx` | Create | 4 |
| `src/components/step/wizard-steps/relief-step.tsx` | Create | 4 |
| `src/components/step/wizard-steps/review-step.tsx` | Create | 4 |
| `src/components/step/filing/annotated-draft-viewer.tsx` | Create | 5 |
| `src/lib/rules/filing-prompts.ts` | Modify | 5, 7 |
| `src/app/api/cases/[id]/generate-filing/route.ts` | Modify | 5 |
| `src/lib/schemas/filing.ts` | Modify | 7 |
| `src/components/step/filing/service-guide.tsx` | Create | 6 |
| `src/components/dashboard/pro-se-banner.tsx` | Create | 7 |
| `src/app/(authenticated)/case/[id]/page.tsx` | Modify | 7 |
| `src/app/api/cases/route.ts` | Modify | 8 |
| `src/components/ui/faq-accordion.tsx` | Create | 9 |
| `src/components/step/filing/success-celebration.tsx` | Create | 9 |
| `src/app/(authenticated)/case/[id]/step/[taskId]/page.tsx` | Modify | 4, 11 |
| `src/components/step/file-with-court-step.tsx` | Modify | 11 |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User resumes wizard mid-flow | `currentStep` and all form data hydrate from task metadata |
| Amount exceeds court jurisdiction | Amber warning with suggestion, not blocking |
| Government entity selected | Extra prompt instructions for sovereign immunity |
| No annotations in AI response | Fallback to standard DraftViewer (no sidebar) |
| Very long draft text | Annotation sidebar scrolls independently |
| Mobile screen | Wizard uses full-width, annotations collapse to accordion |
| Defendant (not plaintiff) role | Wizard adjusts steps — no venue/claims steps, adds defendant response steps |
| User clicks "Save for later" | All data saved to task metadata, task stays `in_progress` |

## Verification

1. All unit tests pass (including new venue-helper tests)
2. `npx next build` — compiles clean
3. Navigate to `prepare_filing` task → see wizard with progress bar
4. Complete all wizard steps → generate petition → see annotated draft with sidebar
5. Navigate to `file_with_court` → see service guide after filing checklist
6. Dashboard shows Pro Se banner on first visit
7. Pre-flight checklist displays before wizard steps
8. Venue helper recommends correct county
9. Jurisdiction validation warns on amount/court mismatch
10. FAQ accordion on review step and file-with-court step
11. Mobile responsive — wizard, annotations, and service guide work on small screens
12. Government entity flag produces modified AI prompt
