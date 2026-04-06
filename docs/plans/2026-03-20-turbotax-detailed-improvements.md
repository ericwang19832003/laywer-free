# TurboTax-Style Legal Filing — Detailed Improvement Ideas

## Overview

This document outlines specific UX/UI improvements to make the petition filing experience feel like TurboTax — conversational, confidence-building, and impossible to get lost in.

---

## 1. Progressive Disclosure & Interview Flow

### 1.1 One-Question-at-a-Time Mode

**Current State:** All fields shown in a single form
**Desired:** One focused question per screen with clear progress

**Implementation:**
```typescript
// src/components/step/focused-question-card.tsx
interface FocusedQuestionCardProps {
  question: string
  helpText?: string
  inputType: 'text' | 'textarea' | 'yes_no' | 'choice'
  options?: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
  progress: { current: number; total: number }
}
```

**UX Details:**
- Slide transitions between questions (left/right)
- Large, touch-friendly answer buttons for mobile
- Auto-advance on selection for simple choices
- "Why do we need this?" expandable help
- Swipe gestures for mobile

### 1.2 Smart Branching Engine

**Current State:** Static `showIf` conditions
**Desired:** AI-guided adaptive questioning

**Implementation:**
```typescript
// src/lib/filing/question-engine.ts
interface QuestionNode {
  id: string
  prompt: string
  helpText?: string
  inputType: InputType
  options?: Option[]
  nextNodes: {
    condition?: (answers: Answers) => boolean
    nextQuestionId: string
  }[]
  storeIn: 'petition' | 'metadata'
  fieldPath: string // e.g., 'defendant.name'
}
```

**Branching Examples:**
- If "defendant_type = business" → ask for registered agent
- If "dispute_type = PI" → ask injury details
- If "amount > $20,000" → suggest district court

### 1.3 Plain Language Layer

**Implementation:**
```typescript
// src/lib/filing/plain-language.ts
export const LEGAL_TO_PLAIN: Record<string, { term: string; definition: string }> = {
  'plaintiff': {
    term: 'You (the person filing)',
    definition: 'The person who starts the lawsuit by filing a petition.'
  },
  'defendant': {
    term: 'The person you\'re suing',
    definition: 'The person or business the petition is filed against.'
  },
  'venue': {
    term: 'Which court location',
    definition: 'The specific courthouse where your case will be heard.'
  },
  'cause_of_action': {
    term: 'Why you think this is wrong',
    definition: 'The legal reason you believe the defendant is liable.'
  },
  'prayer_for_relief': {
    term: 'What you want the court to do',
    definition: 'The specific outcomes you\'re requesting from the judge.'
  },
}
```

---

## 2. Live Document Preview

### 2.1 Split-Screen Petition Builder

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  PREPARE YOUR PETITION              [Preview] [Edit]  │
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│  YOUR ANSWERS         │  LIVE PREVIEW                  │
│                        │                                │
│  Step 2 of 7:        │  ╔══════════════════════════╗  │
│  Who Is Involved?    │  ║                          ║  │
│                        │  ║  IN THE JUSTICE COURT  ║  │
│  Your Information:   │  ║  PRECINCT 4             ║  │
│  ┌──────────────┐    │  ║  HARRIS COUNTY, TEXAS   ║  │
│  │ Full name   │    │  ║                          ║  │
│  └──────────────┘    │  ║  JOHN DOE,              ║  │
│                        │  ║    Plaintiff,          ║  │
│  Defendant:           │  ║                          ║  │
│  ┌──────────────┐    │  ║  vs.                   ║  │
│  │ Full name   │    │  ║                          ║  │
│  └──────────────┘    │  ║  JANE SMITH,           ║  │
│  ┌──────────────┐    │  ║    Defendant           ║  │
│  │ Address     │    │  ║                          ║  │
│  └──────────────┘    │  ╚══════════════════════════╝  │
│                        │                                │
│  [← Back] [Preview]   │                                │
└────────────────────────┴────────────────────────────────┘
```

**Implementation:**
```typescript
// src/components/step/petition-builder.tsx
interface PetitionBuilderProps {
  sections: PetitionSection[]
  answers: PetitionAnswers
  onAnswerChange: (field: string, value: unknown) => void
  viewMode: 'split' | 'edit' | 'preview'
  activeSection?: string
}
```

### 2.2 Highlight-Connected-Text

**Implementation:**
```typescript
// When user focuses on field, highlight corresponding preview text
function handleFieldFocus(fieldPath: string) {
  const previewElement = document.querySelector(`[data-petition-field="${fieldPath}"]`)
  previewElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  previewElement?.classList.add('highlight-pulse')
  setTimeout(() => previewElement?.classList.remove('highlight-pulse'), 2000)
}
```

**CSS:**
```css
.highlight-pulse {
  animation: highlightFade 2s ease-out;
}
@keyframes highlightFade {
  0% { background-color: #FEF3C7; }
  100% { background-color: transparent; }
}
```

### 2.3 Section Navigator

**Component:**
```typescript
// src/components/step/section-navigator.tsx
interface SectionStatus {
  id: string
  title: string
  status: 'complete' | 'in_progress' | 'not_started'
  completionPercent: number
  fields: { name: string; filled: boolean }[]
}
```

---

## 3. Smart Completeness

### 3.1 Real-Time Completeness Score

**Implementation:**
```typescript
// src/hooks/usePetitionCompleteness.ts
interface CompletenessResult {
  score: number // 0-100
  sections: {
    id: string
    label: string
    completedFields: string[]
    missingFields: { name: string; guidance: string }[]
  }[]
  criticalMissing: string[] // Blocks filing
  recommendedMissing: string[] // Improves case
}

function calculateCompleteness(
  petitionSchema: PetitionSchema,
  answers: PetitionAnswers
): CompletenessResult
```

**UI Component:**
```
┌─────────────────────────────────────────┐
│  Petition Readiness                      │
│  ████████████░░░░░░░  68%              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ● Missing critical items:        │   │
│  │   - Defendant's address          │   │
│  │   - At least one claim          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ✓ Parties section complete             │
│  ✓ Venue section complete              │
│  ○ Facts: 2 of 4 fields               │
└─────────────────────────────────────────┘
```

### 3.2 Encouraging Validation Messages

**Current:** "Required field"
**Better:** Contextual guidance

```typescript
const FIELD_GUIDANCE: Record<string, string> = {
  'defendant.address': 'The court needs this to formally notify the defendant. If you don\'t know it exactly, you can use what you know.',
  'incident_date': 'An approximate date works fine. Use "on or about" if you\'re not certain of the exact date.',
  'damages_amount': 'This is what you\'re requesting. For uncertainty, you can write "to be determined at trial."',
  'statement_of_facts': 'Think of this as telling your story. Include: what happened, when, where, and why the defendant is responsible.',
}
```

### 3.3 "Good Enough" Detection

**Not a blocker — guidance:**
```
┌─────────────────────────────────────────┐
│  ℹ️ Your facts section is a good start │
│                                         │
│  You\'ve described the incident well.   │
│  For the strongest petition, consider   │
│  adding:                               │
│                                         │
│  ✓ When it happened (date/time)        │
│  ✓ Where it happened                    │
│  ✓ What the defendant did or didn\'t do │
│  ○ What you want because of it         │
│                                         │
│  [Continue anyway]  [Add more details] │
└─────────────────────────────────────────┘
```

---

## 4. Filing Assistance

### 4.1 Court Fee Calculator

**Component:**
```typescript
// src/components/filing/fee-calculator.tsx
interface FeeCalculation {
  baseFee: number
  digitalFilingFee: number
  serviceOfProcessFee: number
  copyFees: number
  total: number
  waiverAvailable: boolean
  waiverFormUrl?: string
}
```

**UI:**
```
┌─────────────────────────────────────────┐
│  Estimated Filing Costs                   │
├─────────────────────────────────────────┤
│  Petition filing fee      $______        │
│  Digital filing (e-file)   $____         │
│  Sheriff/constable service  $____         │
│  Certified copies (3)       $____        │
│  ─────────────────────────────────      │
│  Total Estimate:           $______      │
│                                         │
│  💡 Can\'t afford fees?                 │
│  Texas courts offer fee waivers for     │
│  those who qualify.                      │
│  [Learn about fee waivers →]             │
└─────────────────────────────────────────┘
```

### 4.2 E-Filing Step-by-Step Guide

**Implementation:**
```typescript
// src/lib/filing/efiling-guides.ts
export const EFILING_GUIDES: Record<string, FilingGuideStep[]> = {
  TX: [
    {
      step: 1,
      title: 'Create Your Account',
      description: 'Visit eFileTexas.gov and click "Create Account"',
      checklist: [
        'Go to eFileTexas.gov',
        'Click "Create Account"',
        'Select "Individual" as your account type',
        'Enter your email and create a password',
      ],
      helpUrl: 'https://eFileTexas.gov/help',
    },
    // ... more steps
  ]
}
```

**UI:**
```
┌─────────────────────────────────────────┐
│  How to File Online (Texas)             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  STEP 1 of 4: Create Account    │   │
│  │                                 │   │
│  │  Visit eFileTexas.gov          │   │
│  │  Click "Create Account"        │   │
│  │  Select "Individual"           │   │
│  │  Enter your email              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ✅ I created my account                │
│  ○ I need help with this step          │
│                                         │
│  ────────────────────────────────────  │
│  ● ● ○ ○                                │
│  [← Back]              [Next Step →]   │
└─────────────────────────────────────────┘
```

### 4.3 Filing Checklist

**Before filing:**
```
┌─────────────────────────────────────────┐
│  Filing Checklist                        │
├─────────────────────────────────────────┤
│  DOCUMENT CHECKLIST                     │
│  ☐ Petition (signed)                   │
│  ☐ Civil case information sheet         │
│  ☐ Citation request form                 │
│  ☐ Fee waiver (if applicable)           │
│                                         │
│  COPIES                                 │
│  ☐ Original + 2 copies (Harris County)  │
│                                         │
│  IDENTIFICATION                         │
│  ☐ Government-issued photo ID          │
│                                         │
│  [Mark all as prepared]                  │
│  [Start Filing →]                        │
└─────────────────────────────────────────┘
```

---

## 5. Post-Filing Support

### 5.1 "What Happens Next" Timeline

**Component:**
```typescript
// src/components/case/filing-timeline.tsx
interface FilingTimelineEvent {
  phase: 'filing' | 'service' | 'answer' | 'discovery' | 'trial'
  title: string
  description: string
  deadlineDays?: number // days from previous event
  deadlineDate?: string
  status: 'completed' | 'current' | 'upcoming' | 'future'
  resources: { label: string; url: string }[]
}
```

**UI:**
```
┌─────────────────────────────────────────────────────────┐
│  After You File                                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Week 1-2                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ File Petition                                │   │
│  │    Court assigns case number                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Week 2                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📍 Serve the Defendant ← YOU ARE HERE          │   │
│  │    Must complete by [DATE] (30 days from filing)│   │
│  │                                                  │   │
│  │    Options:                                     │   │
│  │    • Sheriff/constable (~$50-100)              │   │
│  │    • Process server (~$75-150)                 │   │
│  │    • Certified mail (for some courts)          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Week 3-4                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ File Proof of Service                        │   │
│  │   Return the signed citation to the court       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Week 4+                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ○ Await Defendant's Answer                      │   │
│  │   They have until [DATE] to respond            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  We'll send reminders before each deadline.               │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Answer Tracking

**Auto-detect court docket updates:**
```
┌─────────────────────────────────────────┐
│  Case Status: Answer Due                  │
│                                         │
│  Deadline: March 25, 2026                │
│  Days remaining: 12                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔔 We\'ll check the court      │   │
│  │ docket daily for filings and    │   │
│  │ notify you when we detect       │   │
│  │ activity.                      │   │
│  │                                 │   │
│  │ [Set up manual check reminder]   │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 5.3 Responsive Pleading Generator

**When defendant files:**
```
┌─────────────────────────────────────────┐
│  The Defendant Filed an Answer            │
│                                         │
│  Filed: March 15, 2026                  │
│                                         │
│  Their Response:                        │
│  ┌─────────────────────────────────┐   │
│  │ ✓ Admits: 2 allegations        │   │
│  │ ✗ Denies: 4 allegations        │   │
│  │ 🛡️ Asserts: 1 affirmative defense│   │
│  └─────────────────────────────────┘   │
│                                         │
│  Suggested Next Steps:                  │
│                                         │
│  [File a Reply] — Address their denials │
│  [Start Discovery] — Get more evidence  │
│  [Continue to Next Step]                │
└─────────────────────────────────────────┘
```

---

## 6. Confidence & Reassurance

### 6.1 Section Completion Celebrations

**After completing each section:**
```
┌─────────────────────────────────────────┐
│  ✅ Parties section complete!            │
│                                         │
│  Your petition now clearly identifies:   │
│  • You as the Plaintiff                │
│  • John Smith (Defendant)              │
│  • Acme Corp (Co-Defendant)           │
│                                         │
│  This is 2 of 7 sections done.         │
│                                         │
│  [Continue to Venue →]                  │
└─────────────────────────────────────────┘
```

### 6.2 Progress Statistics

**Sidebar or footer of petition wizard:**
```
┌─────────────────────────────────────────┐
│  Your Progress                          │
│                                         │
│  Sections: 3 of 7 complete             │
│  Questions: 18 of 32 answered          │
│  Time spent: ~12 minutes               │
│                                         │
│  💡 On average, filing a petition      │
│     takes 45-60 minutes. You\'re       │
│     ahead of schedule!                  │
└─────────────────────────────────────────┘
```

### 6.3 Help Tooltips Everywhere

**Implementation:**
```typescript
// src/components/ui/help-tooltip.tsx
interface HelpTooltipProps {
  term: string
  children: React.ReactNode
}

// Usage in forms:
// <HelpTooltip term="defendant">
//   <Input placeholder="Defendant name" />
// </HelpTooltip>

// Renders as:
// [?] next to label
// On hover/focus: popover with plain language definition
```

---

## 7. Case Journey Map

### 7.1 Roadmap Component

**Visual:**
```
┌──────────────────────────────────────────────────────────────┐
│  YOUR CASE JOURNEY                                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐│
│  │ FILE │───▶│SERVE │───▶│ANSWER│───▶│DISCV │───▶│TRIAL ││
│  └──────┘    └──────┘    └──────┘    └──────┘    └──────┘│
│     ✓           ●           ○           ○           ○       │
│                                                              │
│  ───────────────────────────────────────────────────────────  │
│  Current: Serving the defendant (Day 8 of 30)                │
│  Next deadline: File proof of service by April 1              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Jump Navigation

**Sidebar:**
```
┌──────────────────┐
│ CASE SECTIONS    │
├──────────────────┤
│ ✓ Petition       │
│ ✓ Parties        │
│ ● Venue (active)│
│ ○ Facts         │
│ ○ Claims        │
│ ○ Relief        │
│ ○ Review        │
└──────────────────┘
[Section Navigator]
```

---

## 8. Implementation Roadmap

### Phase 1: Core UX Improvements (Week 1-2)

| Task | Description | Effort |
|------|-------------|--------|
| FocusedQuestionCard | One question per screen component | Medium |
| QuestionCard transitions | Slide animations between questions | Small |
| Plain language glossary | Static translations of legal terms | Small |
| CompletenessScore | Real-time progress component | Medium |
| Encouraging validation | Replace "Required field" with guidance | Small |

### Phase 2: Live Preview (Week 3-4)

| Task | Description | Effort |
|------|-------------|--------|
| SplitScreenBuilder | Side-by-side form + preview | Large |
| HighlightConnected | Connect field focus to preview | Medium |
| SectionNavigator | Jump-to section sidebar | Medium |

### Phase 3: Filing Flow (Week 5-6)

| Task | Description | Effort |
|------|-------------|--------|
| FeeCalculator | Court fee estimation | Small |
| EfilingGuide | Step-by-step e-filing | Medium |
| FilingChecklist | Pre-filing verification | Small |
| FilingTimeline | Post-filing "what's next" | Medium |

### Phase 4: Post-Filing (Week 7-8)

| Task | Description | Effort |
|------|-------------|--------|
| AnswerTracker | Docket monitoring | Large |
| ResponsiveGenerator | Guide to defendant's answer | Medium |
| CaseJourneyMap | Visual roadmap component | Medium |

---

## Technical Notes

### Auto-Save Strategy
- Debounced save on every field change (500ms)
- Save on step navigation
- Save on blur
- "Saved" indicator with timestamp

### State Management
- Keep answers in React state + localStorage
- Sync to server on save
- Resume from server on page load

### Accessibility
- Full keyboard navigation
- ARIA labels on all interactive elements
- Screen reader announcements on step change
- High contrast mode support

### Mobile Optimization
- Touch-friendly button sizes (min 44x44px)
- Swipe gestures for navigation
- Auto-focus on input fields
- Virtual keyboard consideration

---

## Success Metrics

1. **Completion Rate:** Target 75%+ petition completion
2. **Time to Complete:** Reduce from 60min to 30min average
3. **Error Rate:** <5% filing rejection due to missing info
4. **User Satisfaction:** 4.5+ stars post-filing survey
5. **Return Rate:** 40%+ users start second case
