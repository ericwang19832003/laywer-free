# TurboTax-Style Legal Filing Experience — Improvement Plan

**Date:** 2026-03-20
**Goal:** Transform Lawyer Free into a true TurboTax-style experience for pro se litigants filing petitions

---

## Vision

Every screen should feel like a supportive conversation, not a legal form. Users should feel confident they're doing things correctly, never overwhelmed, and always knowing exactly what comes next.

---

## 1. Progressive Disclosure & Interview Flow

### 1.1 One-Question-at-a-Time Mode (Optional)
Add a "focused mode" toggle for users who want TurboTax's famous one-at-a-time experience:

```
┌─────────────────────────────────────────┐
│  Step 3 of 7: Who is the defendant?    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Full legal name                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Address (optional)              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [ ← Back ]            [Next → ]       │
│                                         │
│  ● ● ● ○ ○ ○ ○                         │
└─────────────────────────────────────────┘
```

**Implementation:**
- Add `focused_mode` toggle in user preferences
- Create `QuestionCard` component with slide transitions
- Smart "back" remembers all previous answers
- Progress dots show completion

### 1.2 Smart Question Branching
Current: Static questions with `showIf` conditions
**Improve:** AI-guided question paths

```
┌─────────────────────────────────────────┐
│  Based on your answers...               │
│                                         │
│  We noticed you're suing a business.    │
│  Do you know the registered agent?     │
│                                         │
│  [Yes - I'll enter it]                  │
│  [No - I'll search for it]              │
│  [I'm not sure]                        │
└─────────────────────────────────────────┘
```

### 1.3 Plain Language Translations
Every legal term should have a plain language equivalent:

| Legal Term | Plain Language |
|------------|----------------|
| Plaintiff | "You (the person filing)" |
| Defendant | "The person you're filing against" |
| Cause of action | "Why you think this is wrong" |
| Venue | "Which court is the right one" |
| Jurisdiction | "Where this court has authority" |
| Prayer for relief | "What you want the court to do" |
| Summons | "Notice to the other party" |
| Service of process | "Legally telling them about the lawsuit" |

---

## 2. Live Document Preview

### 2.1 Split-Screen Petition Builder
Show the document being built in real-time:

```
┌──────────────────────┬──────────────────────┐
│  YOUR ANSWERS        │  LIVE PREVIEW        │
├──────────────────────┼──────────────────────┤
│                      │                      │
│  [Form fields]      │  ┌────────────────┐  │
│                      │  │ IN THE ____    │  │
│  Step 2 of 7:       │  │ COURT OF ____  │  │
│  Party Information  │  │                │  │
│                      │  │ Plaintiff:    │  │
│  Your name: [____]  │  │ John Doe       │  │
│                      │  │                │  │
│  Defendant:         │  │ Defendant:     │  │
│  Name: [____]       │  │ Jane Smith     │  │
│  Address: [____]    │  │                │  │
│                      │  │ CAUSE NO: __  │  │
│                      │  └────────────────┘  │
│                      │                      │
│  [← Back] [Preview]  │  [Edit Mode]         │
└──────────────────────┴──────────────────────┘
```

### 2.2 Highlight-Connected-Text
When user focuses on a field, highlight the corresponding text in preview:
- Smooth scroll to relevant section
- Gentle highlight animation
- "You're editing this section" indicator

### 2.3 Document Section Navigator
Sidebar showing petition sections with completion status:

```
┌──────────────────┐
│ PETITION SECTIONS│
├──────────────────┤
│ ✓ Caption        │
│ ✓ Parties        │
│ ● Venue      ←  │
│ ○ Facts         │
│ ○ Claims        │
│ ○ Relief        │
│ ○ Signature     │
└──────────────────┘
```

---

## 3. Smart Completeness Checking

### 3.1 Real-Time Completeness Score
```
┌─────────────────────────────────────────┐
│  Petition Completeness                   │
│  ████████████░░░░░░░  68%              │
│                                         │
│  Missing:                               │
│  • Defendant address                    │
│  • Incident date                        │
│  • At least one claim                  │
└─────────────────────────────────────────┘
```

### 3.2 Section-Level Validation
Not just "required field" — contextual guidance:

| Field | Missing Guidance |
|-------|------------------|
| Defendant address | "The court needs this to serve them. If unknown, we can help you find it." |
| Incident date | "Approximate dates work. Use 'on or about' if uncertain." |
| Claim selection | "Select at least one. Unsure? Here are common ones for your case type." |

### 3.3 "Good Enough" Detection
TurboTax doesn't block progress — it guides:

```
┌─────────────────────────────────────────┐
│  ℹ️ Your description is helpful!        │
│                                         │
│  You've written 45 words. For the      │
│  strongest petition, aim for at least   │
│  100 words covering:                    │
│                                         │
│  • What happened (when, where)         │
│  • Why it's the defendant's fault      │
│  • What you want because of it         │
│                                         │
│  [Continue with what I have]            │
│  [Add more detail]                      │
└─────────────────────────────────────────┘
```

---

## 4. Guided Filing Experience

### 4.1 Court Fee Calculator
```
┌─────────────────────────────────────────┐
│  Estimated Filing Fees                   │
├─────────────────────────────────────────┤
│  Base filing fee         $________      │
│  Digital filing surcharge  $____        │
│  Service of process       $____         │
│  ─────────────────────────────────      │
│  Total estimate:          $____         │
│                                         │
│  [Apply for Fee Waiver]                 │
│                                         │
│  💡 Many courts offer fee waivers for   │
│     those who qualify. We can help      │
│     you apply.                          │
└─────────────────────────────────────────┘
```

### 4.2 E-Filing Step-by-Step Guide
```
┌─────────────────────────────────────────┐
│  How to File Online (eFileTexas)        │
│                                         │
│  Step 1 of 4: Create Account          │
│  ┌─────────────────────────────────┐   │
│  │ Visit eFileTexas.gov            │   │
│  │ Click "Create Account"           │   │
│  │ Select "Individual"             │   │
│  │ Enter your email and password   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [I did this ✓]    [Show me how →]      │
│                                         │
│  ● ○ ○ ○                                │
└─────────────────────────────────────────┘
```

### 4.3 Filing Calendar & Deadline Tracker
After filing:
- Auto-detect answer deadline
- Generate service deadline
- Create calendar events
- Send reminders

---

## 5. Post-Filing Transition

### 5.1 "What Happens Next" Timeline
```
┌─────────────────────────────────────────┐
│  After You File                          │
│                                         │
│  Week 1-2                               │
│  ├── Court assigns case number          │
│  └── You receive confirmation           │
│                                         │
│  Week 2-4                               │
│  ├── Serve the defendant               │
│  ├── File proof of service             │
│  └── Wait for their answer             │
│                                         │
│  We'll remind you before each deadline.  │
└─────────────────────────────────────────┘
```

### 5.2 Answer Tracking Dashboard
```
┌─────────────────────────────────────────┐
│  Case Status: Awaiting Response         │
│                                         │
│  The defendant has until [DATE] to      │
│  file their answer.                     │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ We'll notify you when we detect │   │
│  │ a filing on the court docket.  │   │
│  │                                │   │
│  │ [Set up docket alerts]          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 5.3 Responsive Pleading Generator
When defendant files answer, guide user through counter-response:

```
┌─────────────────────────────────────────┐
│  The Defendant Filed an Answer          │
│                                         │
│  They admitted: X claims                │
│  They denied: Y claims                  │
│  They asserted: Z defenses              │
│                                         │
│  What would you like to do next?        │
│                                         │
│  [File a Reply] (guided)               │
│  [Request Discovery] (guided)           │
│  [Continue to Next Step]                 │
└─────────────────────────────────────────┘
```

---

## 6. Confidence & Reassurance

### 6.1 "You're Doing Great" Moments
After each section completion:
```
┌─────────────────────────────────────────┐
│  ✓ Parties section complete!            │
│                                         │
│  Your petition now identifies:          │
│  • You as the Plaintiff                │
│  • John Smith as the Defendant          │
│  • Jane Doe as a Co-Defendant          │
│                                         │
│  [Continue to Venue →]                  │
└─────────────────────────────────────────┘
```

### 6.2 Progress Celebrations
- Section completion animations (confetti-free, calm)
- "X of 7 sections complete"
- Time saved estimate ("You've answered 47 questions that would take hours on paper")

### 6.3 Help Available Everywhere
```
┌─────────────────────────────────────────┐
│  What is a defendant? [?]               │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  The "defendant" is the person or       │
│  business you're filing the lawsuit      │
│  against. Think of it as "the other    │
│  side" of the case.                    │
│                                         │
│  [Got it!]  [Learn more →]             │
└─────────────────────────────────────────┘
```

---

## 7. Roadmap/Doreahboard View

### 7.1 Case Journey Map
Visual representation of entire case lifecycle:

```
┌──────────────────────────────────────────────────────────┐
│  YOUR CASE JOURNEY                                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ●────────────────────────────────────────────────────► │
│  FILE    SERVE   ANSWER   DISCOVER  TRIAL    RESOLVE    │
│  PETITION       PERIOD                                │
│                                                          │
│  [You]    [✓]    [→]      [○]      [○]      [○]        │
│                                                          │
│  Current: Awaiting defendant's answer (Day 12 of 30)     │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Jump-To Section
Quick navigation to any completed/current section:
- Not just forward/back — jump anywhere
- Shows completion status
- Highlights current section

---

## 8. Mobile-First Refinements

### 8.1 Conversational Mobile Entry
```
┌─────────────────────────────────────┐
│  📱 Mobile: One Question Per View  │
├─────────────────────────────────────┤
│                                     │
│  What is your full legal name?      │
│                                     │
│  ┌─────────────────────────────┐    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│              [Continue →]           │
│                                     │
│  ● ● ○ ○ ○                         │
└─────────────────────────────────────┘
```

### 8.2 Voice Input Support
For users who prefer speaking:
- Microphone icon on text fields
- "Tell us in your own words"
- AI transcribes and extracts key info

---

## 9. State-Specific Intelligence

### 9.1 County Courthouse Finder
```
┌─────────────────────────────────────────┐
│  Find Your Courthouse                   │
│                                         │
│  [ZIP Code: _______ ] [Search]          │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  HARRIS COUNTY COURTHOUSE              │
│  1115 Congress Ave, Houston, TX 77002   │
│                                         │
│  📞 (713) 755-6000                     │
│  🕐 8:00 AM - 5:00 PM, Mon-Fri        │
│                                         │
│  [Get Directions]  [Add to Calendar]    │
└─────────────────────────────────────────┘
```

### 9.2 Local Rule Warnings
Before filing, check for local requirements:
```
⚠️ Harris County requires:
• 3 copies of petition
• Specific caption format
• Additional forms for >$10,000

[We'll help you prepare these]
```

---

## 10. Implementation Phases

### Phase 1: Core UX (Weeks 1-2)
- [ ] Add focused mode toggle
- [ ] Implement QuestionCard component
- [ ] Create plain language glossary
- [ ] Add completeness score component
- [ ] Improve section-level validation messages

### Phase 2: Live Preview (Weeks 3-4)
- [ ] Build split-screen petition builder
- [ ] Implement highlight-connected-text
- [ ] Create section navigator sidebar
- [ ] Add "Edit" vs "Preview" mode toggle

### Phase 3: Filing Assistance (Weeks 5-6)
- [ ] Court fee calculator
- [ ] E-filing step-by-step guide
- [ ] Filing checklist
- [ ] Post-filing timeline

### Phase 4: Post-Filing (Weeks 7-8)
- [ ] Answer tracking dashboard
- [ ] "What Happens Next" timeline
- [ ] Responsive pleading generator
- [ ] Docket alert integration

### Phase 5: Polish (Weeks 9-10)
- [ ] Case journey map/roadmap
- [ ] Mobile conversational entry
- [ ] State-specific intelligence
- [ ] Help everywhere improvements

---

## Success Metrics

1. **Completion Rate:** % of users who start petition wizard who complete it
2. **Time to Complete:** Average time from start to filing
3. **Error Rate:** % of filings rejected due to missing/incorrect info
4. **User Confidence:** Post-completion survey score
5. **Return Rate:** % of users who return for next case

---

## Design Principles

1. **One thing at a time:** Never overwhelm with too many questions
2. **Plain language always:** Legal terms = tooltip explanations
3. **Encourage, don't block:** "Add more" instead of "Required"
4. **Show progress:** Users always know where they are
5. **Save everything:** Auto-save, exit anytime, resume where you left off
6. **Celebrate wins:** Section completion = positive feedback
7. **Guide to finish:** Clear path from start to filed
