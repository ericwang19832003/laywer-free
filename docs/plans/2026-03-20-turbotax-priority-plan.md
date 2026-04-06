# TurboTax Legal Filing — Implementation Priority Matrix

## Quick Wins (Week 1)

### 1.1 Plain Language Glossary
**Impact:** High | **Effort:** Low

Add tooltips to all legal terms throughout the app:

```typescript
// src/components/ui/legal-term.tsx
export const LEGAL_GLOSSARY = {
  plaintiff: 'You (the person filing the lawsuit)',
  defendant: 'The person or business you\'re suing',
  venue: 'Which court location is right for your case',
  jurisdiction: 'Whether this court has authority over your case',
  cause_of_action: 'The legal reason you believe the defendant is liable',
  summons: 'The official notice that tells the defendant about the lawsuit',
  // ... etc
}
```

**Files to update:**
- `src/components/step/wizard-steps/*`
- `src/components/filing/*`
- Any component with legal terminology

### 1.2 Encouraging Validation Messages
**Impact:** High | **Effort:** Low

Replace all "Required field" and "Invalid" with helpful guidance:

```typescript
// src/lib/validation/messages.ts
export const VALIDATION_MESSAGES = {
  required: 'We need this to continue.',
  email: 'That doesn\'t look like an email address. Try something like name@example.com',
  phone: 'Enter a 10-digit phone number.',
  date: 'That date doesn\'t look right. Try MM/DD/YYYY.',
  zip: 'Enter a 5-digit ZIP code.',
}
```

### 1.3 Progress Celebration Messages
**Impact:** Medium | **Effort:** Low

Add congratulatory messages after section completion:

```typescript
// In petition-wizard.tsx
const SECTION_COMPLETION_MESSAGES = {
  parties: 'You\'ve identified everyone involved in your case!',
  venue: 'You\'ve picked the right court for your case!',
  facts: 'You\'ve told your story. The court will understand what happened.',
  claims: 'You\'ve identified why the defendant is responsible.',
  relief: 'You\'ve told the court what you\'re asking for.',
  review: 'Everything looks good. You\'re ready to file!',
}
```

---

## Core UX (Week 2-3)

### 2.1 Live Petition Preview
**Impact:** High | **Effort:** Medium

Add a toggle in the petition wizard to show live preview:

```tsx
// In WizardShell, add toggle button
<div className="flex gap-2 mb-4">
  <Button 
    variant={viewMode === 'edit' ? 'default' : 'outline'}
    onClick={() => setViewMode('edit')}
  >
    Edit Mode
  </Button>
  <Button 
    variant={viewMode === 'preview' ? 'default' : 'outline'}
    onClick={() => setViewMode('preview')}
  >
    Preview
  </Button>
</div>
```

**Components to create:**
- `src/components/step/petition-preview.tsx` - Renders petition from answers
- `src/components/step/split-view.tsx` - Side-by-side layout

### 2.2 Real-Time Completeness Score
**Impact:** High | **Effort:** Medium

```tsx
// src/hooks/usePetitionCompleteness.ts
export function usePetitionCompleteness(schema: Schema, answers: Answers) {
  // Calculate which fields are filled
  // Return percentage and missing fields
  // Identify critical vs recommended missing fields
}
```

**UI:** Progress bar at top of petition wizard showing completeness

### 2.3 Section Navigator
**Impact:** Medium | **Effort:** Medium

Add sidebar showing petition sections with status:

```
┌──────────────────┐
│ PETITION SECTIONS│
├──────────────────┤
│ ✓ Parties (3/3) │
│ ✓ Venue (2/2)  │
│ ● Facts (1/3) ←│
│ ○ Claims (0/2) │
│ ○ Relief (0/3) │
│ ○ Review        │
└──────────────────┘
```

---

## Filing Flow (Week 4-5)

### 3.1 Court Fee Calculator
**Impact:** Medium | **Effort:** Low

```typescript
// src/lib/filing/fees.ts
export const COURT_FEES: Record<string, Record<string, number>> = {
  TX: {
    JP: { filing: 46, efile: 5 },
    COUNTY: { filing: 100, efile: 5 },
    DISTRICT: { filing: 300, efile: 5 },
  },
  // ... other states
}
```

### 3.2 E-Filing Step-by-Step Guide
**Impact:** High | **Effort:** Medium

Create guided e-filing wizard:

```
┌─────────────────────────────────────────┐
│  How to File Online                       │
│                                          │
│  Step 1: Create eFileTexas Account     │
│  Step 2: Select Your Court             │
│  Step 3: Upload Documents              │
│  Step 4: Pay Filing Fee                │
│  Step 5: Confirm Submission            │
│                                          │
│  [Start E-Filing Guide →]               │
└─────────────────────────────────────────┘
```

### 3.3 Filing Checklist
**Impact:** High | **Effort:** Low

Pre-filing checklist component with checkboxes:

```tsx
// src/components/filing/filing-checklist.tsx
interface FilingChecklistProps {
  caseId: string
  petitionDraft: string
  courtType: string
  county: string
}
```

---

## Post-Filing (Week 6-7)

### 4.1 "What Happens Next" Timeline
**Impact:** High | **Effort:** Medium

After filing, show clear timeline:

```tsx
// src/components/case/filing-timeline.tsx
const FILING_NEXT_STEPS = [
  { 
    phase: 'service', 
    title: 'Serve the Defendant',
    description: 'Formally deliver the petition and summons',
    deadline: '30 days from filing',
    status: 'upcoming'
  },
  // ... more steps
]
```

### 4.2 Answer Tracking Dashboard
**Impact:** Medium | **Effort:** Medium

Auto-detect when defendant files answer:

```typescript
// src/app/api/cases/[id]/docket-check/route.ts
// Check court docket for new filings
// Send notification when answer detected
```

### 4.3 Case Journey Map
**Impact:** Medium | **Effort:** Medium

Visual roadmap component:

```
┌──────────────────────────────────────────────────────┐
│  YOUR CASE JOURNEY                                   │
│                                                      │
│  [FILE]──[SERVE]──[ANSWER]──[DISCOVER]──[TRIAL]  │
│     ✓         ●         ○         ○         ○      │
│                                                      │
│  Currently: Serving the defendant (Day 8 of 30)      │
└──────────────────────────────────────────────────────┘
```

---

## Polish (Week 8)

### 5.1 One-Question Mode Toggle
**Impact:** Medium | **Effort:** Medium

Add TurboTax-style one-at-a-time mode:

```tsx
// src/components/step/focused-mode-toggle.tsx
export function FocusedModeToggle({ enabled, onToggle }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Classic view</span>
      <Switch checked={enabled} onCheckedChange={onToggle} />
      <span className="text-sm">Focused mode</span>
    </div>
  )
}
```

### 5.2 Smart Branching Questions
**Impact:** Low | **Effort:** High

Replace static `showIf` with dynamic question paths based on answers.

### 5.3 Voice Input Support
**Impact:** Low | **Effort:** High

Add microphone icon for text areas, use Web Speech API for transcription.

---

## Summary: Prioritized Task List

| Priority | Task | Week | Impact |
|----------|------|------|--------|
| 1 | Plain language glossary | 1 | High |
| 2 | Encouraging validation messages | 1 | High |
| 3 | Progress celebration messages | 1 | Medium |
| 4 | Live petition preview | 2 | High |
| 5 | Completeness score | 2 | High |
| 6 | Section navigator | 3 | Medium |
| 7 | Court fee calculator | 4 | Medium |
| 8 | E-filing guide | 4 | High |
| 9 | Filing checklist | 5 | High |
| 10 | Filing timeline | 6 | High |
| 11 | Answer tracking | 6 | Medium |
| 12 | Case journey map | 7 | Medium |
| 13 | Focused mode | 8 | Medium |

---

## Design Principles Summary

1. **One thing at a time** — Never overwhelm users
2. **Plain language** — Legal terms explained simply
3. **Encourage, don't block** — Guide users forward
4. **Show progress** — Clear "where am I" indicators
5. **Save everything** — Auto-save, resume anytime
6. **Celebrate wins** — Positive feedback on completion
7. **Guide to finish** — Clear path from start to filed
