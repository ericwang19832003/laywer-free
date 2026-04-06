# Legal Education & User-Friendly Experience Plan

**Goal:** Enable users with zero legal knowledge to successfully file petitions and navigate the legal process

**Core Philosophy:** Teach as you go — deliver the right information at the moment of need, not all at once.

---

## Part 1: Learn-As-You-Go System

### 1.1 Contextual Legal Education Cards

**Concept:** When users encounter a legal term or concept, show an educational card BEFORE asking for information.

**Implementation:**
```tsx
// src/components/education/legal-education-card.tsx
interface LegalEducationCardProps {
  topic: string
  children: React.ReactNode
  variant?: 'info' | 'tip' | 'example' | 'warning'
}

// Usage pattern:
<LegalEducationCard topic="defendant">
  <p>Before we ask about the defendant, let's understand what this means...</p>
  <Definition>
    <Term>Defendant</Term>
    <PlainLanguage>The person you're suing</PlainLanguage>
    <Definition>
      The individual or business that the petition is filed against. 
      They are the party you believe is responsible for harming you.
    </Definition>
    <Example>
      If you're suing a landlord for not returning your deposit, 
      the landlord is the defendant.
    </Example>
    <WhyNeeded>
      The court needs to know who is being sued so they can be 
      formally notified of the lawsuit.
    </WhyNeeded>
  </Definition>
</LegalEducationCard>
```

**Card Types:**
| Type | Color | Purpose |
|------|-------|---------|
| `info` | Blue | General information |
| `tip` | Green | Helpful hints |
| `example` | Purple | Real-world examples |
| `warning` | Amber | Important warnings |
| `confused` | Indigo | "Not sure?" guidance |

### 1.2 "What Is This?" Inline Education

**Concept:** Every form field has an instant "What is this?" tooltip with education.

```tsx
// Before showing a field about "damages":
┌─────────────────────────────────────────────────┐
│  💡 What are "damages"?                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  In legal terms, "damages" means the money   │
│  you're asking the court to award you.        │
│                                                 │
│  Think of it as: "How much do you want?"      │
│                                                 │
│  Common types of damages:                    │
│  • Compensatory: To cover your losses       │
│  • Consequential: To cover indirect costs    │
│  • Punitive: To punish bad behavior (rare)   │
│                                                 │
│  You can estimate even if you're not certain.│
│  The judge will make the final decision.       │
│                                                 │
│  [Got it, let's continue]                     │
└─────────────────────────────────────────────────┘
```

### 1.3 Decision Helper Popovers

**Concept:** When users must make a decision, show a "Help me decide" option.

```tsx
// For choosing court type:
┌─────────────────────────────────────────────────┐
│  Not sure which court is right?                 │
│                                                 │
│  Let's break it down simply:                    │
│                                                 │
│  Question: How much money are you seeking?    │
│                                                 │
│  Under $10,000 → Justice Court (JP)          │
│  • Fast, informal                             │
│  • Low filing fees                            │
│  • Limited appeals                            │
│                                                 │
│  $10,000 - $200,000 → County Court           │
│  • More formal                               │
│  • Jury trials available                      │
│                                                 │
│  Over $200,000 → District Court               │
│  • Most formal                               │
│  • Complex rules                             │
│                                                 │
│  Still unsure?                               │
│  [Take the court selector quiz →]            │
└─────────────────────────────────────────────────┘
```

### 1.4 "Why Do You Need This?" Explanations

**Every question should answer:**
1. What is this asking for?
2. Why does the court need it?
3. What happens if I don't know?
4. What if I'm not sure?

```tsx
// Example for "Defendant's Address":
┌─────────────────────────────────────────────────┐
│  Why do we need the defendant's address?        │
│                                                 │
│  The court needs this for "service of process"│
│  — the official way of telling someone about   │
│  the lawsuit.                                  │
│                                                 │
│  📋 What happens next:                        │
│  1. You file the petition                    │
│  2. The court issues a "citation"           │
│  3. Someone delivers both to the defendant    │
│  4. They have [X] days to respond           │
│                                                 │
│  ❓ What if I don't know the exact address?  │
│  • Use what you know (street + city)         │
│  • For businesses, search SOS Texas           │
│  • Leave blank if completely unknown          │
│                                                 │
│  [I understand, let's continue]                 │
└─────────────────────────────────────────────────┘
```

---

## Part 2: Legal Knowledge Library

### 2.1 Interactive Legal Dictionary

**Structure:**
```
/learn/
├── /basics/
│   ├── what-is-a-lawsuit/
│   ├── parties-explained/
│   ├── how-courts-work/
│   └── legal-terminology/
├── /your-rights/
│   ├── right-to-sue/
│   ├── statute-of-limitations/
│   ├── burden-of-proof/
│   └── defenses-explained/
├── /filing-guides/
│   ├── how-to-file/
│   ├── serving-documents/
│   ├── responding-to-lawsuits/
│   └── amending-petitions/
├── /courtroom/
│   ├── what-to-expect/
│   ├── presenting-evidence/
│   ├── questioning-witnesses/
│   └── closing-arguments/
└── /glossary/
    └── (A-Z legal terms)
```

### 2.2 Video Learning Modules

**Format:** 2-3 minute videos with transcripts

```
┌─────────────────────────────────────────────────┐
│  📹 What Happens at Your First Court Date?      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │         [VIDEO PLAYER]                 │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Duration: 3:24 | Views: 12,453              │
│                                                 │
│  Chapters:                                     │
│  • 0:00 - Introduction                        │
│  • 1:15 - What to wear                       │
│  • 2:00 - What to bring                     │
│  • 2:45 - What to say                       │
│                                                 │
│  📝 [Read Transcript]                          │
│  📋 [Related: Checklist for Court Day]        │
└─────────────────────────────────────────────────┘
```

### 2.3 Interactive Quizzes

**Purpose:** Help users understand their situation before proceeding.

```tsx
// "Which Court Is Right for You?" quiz
┌─────────────────────────────────────────────────┐
│  🧠 Quiz: Find Your Court                       │
│                                                 │
│  Question 1 of 4                               │
│                                                 │
│  How much money are you asking for?            │
│                                                 │
│  ○ Less than $10,000                          │
│  ○ $10,000 - $75,000                         │
│  ○ $75,000 - $200,000                       │
│  ○ More than $200,000                         │
│  ○ I'm not sure yet                           │
│  ○ I'm not asking for money                   │
│                                                 │
│  [Skip quiz and decide later]                  │
└─────────────────────────────────────────────────┘

// After quiz completion:
┌─────────────────────────────────────────────────┐
│  🎉 Based on your answers, here's what we      │
│     recommend:                                │
│                                                 │
│  Most likely: Justice Court (JP)              │
│  • Lower filing fees (~$50)                   │
│  • Less formal procedures                     │
│  • Faster resolution                          │
│                                                 │
│  This looks right → [Continue]               │
│  I think I need something else → [Learn more] │
└─────────────────────────────────────────────────┘
```

### 2.4 Common Scenarios Library

**Real situations with step-by-step guides:**

| Scenario | Guide Includes |
|----------|---------------|
| Sue a contractor who didn't finish work | Demand letter template → Filing checklist → Evidence gathering |
| Get security deposit back from landlord | Demand letter → Filing guide → Court forms |
| Sue after car accident | Evidence checklist → Doctor bills → Witness list |
| Defend against debt collection | Validation letter → Answer template → Discovery requests |
| Respond to eviction notice | Tenant rights → Answer forms → Continuance requests |

---

## Part 3: Step-by-Step Process Education

### 3.1 Process Visualization

**Before each major step, show an animated visual of what happens:**

```
┌─────────────────────────────────────────────────────────┐
│  BEFORE YOU FILE                                       │
│                                                         │
│  Here's what filing a lawsuit looks like:              │
│                                                         │
│  ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐  │
│  │ FILE  │───▶│ SERVE │───▶│ANSWER │───▶│ TRIAL │  │
│  │ PET.  │    │ DEF.  │    │PERIOD │    │       │  │
│  └───────┘    └───────┘    └───────┘    └───────┘  │
│     ✓           ⏱️           ⏱️           📅        │
│    Done       30 days    20-30 days    Scheduled     │
│                                                         │
│  📍 YOU ARE HERE: About to file                        │
│                                                         │
│  [See full timeline →]                                 │
└─────────────────────────────────────────────────────────┘
```

### 3.2 "What Happens If..." Branching Education

**Show consequences of choices in plain terms:**

```tsx
// When user is deciding whether to include punitive damages:
┌─────────────────────────────────────────────────┐
│  ℹ️ About Punitive Damages                       │
│                                                 │
│  You've asked for compensation for your        │
│  losses. Here's what adding punitive damages   │
│  means:                                        │
│                                                 │
│  Compensatory (what you're owed):              │
│  • Covers your actual losses                   │
│  • Easier to get                              │
│  • Example: Medical bills, lost wages          │
│                                                 │
│  Punitive (punishment):                        │
│  • Extra money to punish bad behavior          │
│  • Only if defendant was especially bad        │
│  • Much harder to get                        │
│  • Example: Drunk driver, intentional fraud    │
│                                                 │
│  Recommendation for beginners:                  │
│  Start with compensatory only. You can amend  │
│  later if you learn more about the case.       │
│                                                 │
│  [Continue with compensatory only]             │
│  [Add punitive damages too]                    │
│  [Tell me more about punitive damages]         │
└─────────────────────────────────────────────────┘
```

### 3.3 Court-Day Preparation Module

**When users reach trial phase:**

```tsx
// /learn/courtday/
export const COURTDAY_MODULE = {
  title: "Your Day in Court",
  sections: [
    {
      title: "Before You Leave Home",
      items: [
        { done: false, label: "Gather all documents & evidence", tip: "Bring originals + 2 copies" },
        { done: false, label: "Print your petition & any filed documents", tip: "3 copies: judge, other side, you" },
        { done: false, label: "Dress professionally", tip: "Business casual at minimum" },
        { done: false, label: "Arrive 30 minutes early", tip: "Parking + security takes time" },
        { done: false, label: "Bring ID and case number", tip: "You'll need both to enter" },
      ]
    },
    {
      title: "At the Courthouse",
      items: [
        { done: false, label: "Check the docket board", tip: "Confirms your courtroom" },
        { done: false, label: "Tell the clerk you're there", tip: "They'll mark you present" },
        { done: false, label: "Find your courtroom", tip: "Wait outside until called" },
        { done: false, label: "Turn off your phone", tip: "Respect the court" },
      ]
    },
    {
      title: "In the Courtroom",
      items: [
        { done: false, label: "Stand when judge enters/exits", tip: "Shows respect" },
        { done: false, label: "Speak clearly and loudly", tip: "The court reporter needs to hear you" },
        { done: false, label: "Address the judge as 'Your Honor'", tip: "Never interrupt the judge" },
        { done: false, label: "Be honest - always", tip: "Lying to a judge is perjury" },
      ]
    }
  ]
}
```

---

## Part 4: Interactive Legal Coach

### 4.1 Conversational AI Guide

**Build a chat-style interface for questions:**

```tsx
// src/components/education/legal-coach.tsx
<LegalCoach
  userProfile={{
    state: "TX",
    caseType: "debt_collection",
    stage: "pre_filing"
  }}
  welcomeMessage={`
    Hi! I'm your legal guide. I can help you:
    
    • Understand legal terms
    • Know what to expect next
    • Answer questions about your case
    • Prepare for court
    
    What would you like help with?
  `}
  quickTopics={[
    { label: "What is a defendant?", topic: "defendant" },
    { label: "How do I file?", topic: "filing_process" },
    { label: "What happens if I win?", topic: "collecting_judgment" },
    { label: "I don't understand this form", topic: "form_help" },
  ]}
  examples={[
    "What does 'cause of action' mean?",
    "Can I sue without a lawyer?",
    "What if I can't afford filing fees?",
    "How long will this take?",
  ]}
/>
```

### 4.2 Smart Answer Engine

**Pre-built Q&A for common questions:**

| Question | Answer |
|----------|--------|
| "Can I sue someone?" | "Anyone can file a lawsuit, but you need: (1) standing - you were harmed, (2) jurisdiction - right court, (3) a valid claim - legal basis for relief." |
| "Do I need a lawyer?" | "No, but having one helps. You can represent yourself (pro se) in any court. This app helps you do that." |
| "How much will this cost?" | "Filing fees vary: $46-300+ depending on court. Service: $50-150. You may qualify for a fee waiver." |
| "How long will this take?" | "Small claims: 30-90 days. Regular cases: 6-18 months. Appeals add more time." |

### 4.3 "Am I Doing This Right?" Check

**Before critical steps, offer validation:**

```tsx
// Before filing:
┌─────────────────────────────────────────────────┐
│  🤔 Let me check your petition before you file  │
│                                                 │
│  Checking...                                    │
│                                                 │
│  ✓ Your information is complete                  │
│  ✓ Defendant is clearly identified             │
│  ✓ Court has proper jurisdiction              │
│  ✓ Claims are properly stated                  │
│  ⚠️ Missing: Defendant's full address         │
│    → Service may be harder                   │
│    → But you can proceed if unknown          │
│                                                 │
│  Overall: Ready to file ✅                     │
│                                                 │
│  [File My Petition]                             │
│  [Go back and add address]                      │
│  [Learn about service options]                 │
└─────────────────────────────────────────────────┘
```

---

## Part 5: Visual Learning Aids

### 5.1 Animated Process Flows

**CSS-based animations showing legal processes:**

```tsx
// Service of Process Animation
┌─────────────────────────────────────────────────┐
│  HOW SERVICE WORKS                               │
│                                                 │
│  YOU                                           │
│    │                                           │
│    ▼ (file petition)                           │
│  ┌─────────┐                                   │
│  │  COURT  │─── issues citation ──▶ ┌────────┐ │
│  └─────────┘                          │CITATION│ │
│                                      └────────┘ │
│                                           │     │
│    ┌──────────────────────────────────────┘     │
│    ▼                                               │
│  ┌──────────────┐                                  │
│  │ SERVE ON    │                                  │
│  │ DEFENDANT   │                                  │
│  └──────────────┘                                  │
│    │                                           │
│    ▼ (return signed proof)                       │
│  ┌─────────┐                                    │
│  │  FILE   │                                    │
│  │  PROOF  │                                    │
│  └─────────┘                                    │
│                                                 │
│  Deadline: 30 days from filing                  │
│                                                 │
│  [Next: How to serve →]                         │
└─────────────────────────────────────────────────┘
```

### 5.2 Timeline Visualizations

**Show the entire case journey:**

```tsx
// Case Timeline Component
┌─────────────────────────────────────────────────────────────┐
│  YOUR CASE TIMELINE                                           │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                     │    │
│  │  📅 FILE      📅 SERVE     📅 ANSWER    📅 TRIAL   │    │
│  │    │            │            │           │          │    │
│  │    ●────────────●────────────●───────────●          │    │
│  │  Mar 1      Mar 31      Apr 20       Jun 15       │    │
│  │                                                     │    │
│  │  YOU ARE HERE → Day 12                             │    │
│  │  Deadline: Serve defendant by March 31 (19 days)   │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [View Full Timeline] [Add to Calendar] [Set Reminders]       │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Document Templates with Annotations

**Show what each document section means:**

```tsx
// Petition Annotation View
┌─────────────────────────────────────────────────┐
│  YOUR PETITION (with annotations)                 │
│                                                 │
│  IN THE JUSTICE COURT                   [?]     │
│  PRECINCT 4                                  │
│  HARRIS COUNTY, TEXAS                         │
│  ▲                                           │
│  │ This identifies WHERE you're filing        │
│  │ We filled this based on your county       │
│                                                 │
│  JANE DOE,                        [?]        │
│    Plaintiff,                                  │
│  ▲                                           │
│  │ "Plaintiff" = You (the person filing)    │
│                                                 │
│  vs.                                         │
│                                                 │
│  JOHN SMITH,                                  │
│    Defendant.                                  │
│  ▲                                           │
│  │ "Defendant" = Who you're suing            │
│  │ We need their name exactly as it appears │
│                                                 │
│  CAUSE NO. _______________                     │
│  ▲                                           │
│  │ Leave blank - the court assigns this      │
│                                                 │
│  [Hide Annotations] [Print Clean Version]       │
└─────────────────────────────────────────────────┘
```

---

## Part 6: Practice & Preparation

### 6.1 Practice Courtroom

**Simulated courtroom experience:**

```tsx
// /learn/practice/courtroom-simulator
export const COURTROOM_SIMULATOR = {
  title: "Practice Courtroom",
  description: "Before your real court date, practice answering questions in a simulated environment.",
  
  scenarios: [
    {
      id: "opening_statement",
      title: "Your Opening Statement",
      prompt: "In 2-3 minutes, tell the judge what your case is about.",
      tips: [
        "State your name and that you're representing yourself",
        "Briefly explain what happened",
        "State what you want the judge to do",
        "Keep it factual, not emotional",
      ],
      practiceQuestions: [
        "What would you say first?",
        "How would you describe the incident?",
        "What evidence do you have?",
      ],
      exampleResponse: "Your Honor, my name is Jane Doe. I'm here today because...",
    },
    {
      id: "answering_questions",
      title: "Answering Questions",
      prompt: "Practice answering questions clearly and honestly.",
      scenarios: [
        { q: "Please state your name for the record.", tip: "Speak clearly, spell if unusual" },
        { q: "How long have you known the defendant?", tip: "Give approximate time" },
        { q: "Can you describe what happened on that day?", tip: "Be specific about time and place" },
      ],
    },
  ],
  
  recording: {
    enabled: true,
    saveLocal: true,
    shareWithTutor: false,
  },
  
  feedback: {
    "clarity": "Did you speak clearly?",
    "completeness": "Did you answer the question?",
    "honesty": "Were you truthful?",
    "organization": "Was your answer well-structured?",
  }
}
```

### 6.2 Flashcard Learning

**For memorizing key legal concepts:**

```tsx
// /learn/flashcards
export const FLASHCARD_DECKS = {
  basics: {
    title: "Legal Basics",
    cards: [
      {
        front: "Plaintiff",
        back: "The person who files the lawsuit (YOU in most cases)",
      },
      {
        front: "Defendant",
        back: "The person or business being sued",
      },
      {
        front: "Jurisdiction",
        back: "The court's authority to hear your case",
      },
      {
        front: "Venue",
        back: "The specific location/county where your case is heard",
      },
      // ... 50+ more cards
    ],
  },
  evidence: {
    title: "Evidence Rules",
    cards: [
      // ... cards about exhibits, hearsay, relevance
    ],
  },
  procedures: {
    title: "Court Procedures",
    cards: [
      // ... cards about filing deadlines, service rules
    ],
  },
}
```

### 6.3 Knowledge Tests

**Check understanding before critical steps:**

```tsx
// Before filing - knowledge check
┌─────────────────────────────────────────────────┐
│  📝 Quick Check: Filing Basics                  │
│                                                 │
│  Before you file, let's make sure you          │
│  understand what happens next.                  │
│                                                 │
│  Question 1: After you file, what must        │
│  happen within 30 days?                       │
│                                                 │
│  ○ The judge makes a decision                 │
│  ○ The defendant must be served                │
│  ○ You receive payment                        │
│  ○ The case is dismissed                      │
│                                                 │
│  [Submit Answer]                               │
│                                                 │
│  ✓ Correct! The defendant must be served       │
│    within 30 days or the case may be           │
│    dismissed.                                  │
│                                                 │
│  Question 2 of 5 →                             │
└─────────────────────────────────────────────────┘
```

---

## Part 7: Emotional Support & Encouragement

### 7.1 "This Is Normal" Reassurance

**Acknowledge the difficulty:**

```tsx
// When user seems stuck or overwhelmed:
┌─────────────────────────────────────────────────┐
│  💙 This can feel overwhelming                  │
│                                                 │
│  You're not alone. Filing a lawsuit can feel  │
│  intimidating, especially if you've never done │
│  it before.                                    │
│                                                 │
│  Here's what others in your situation have     │
│  said:                                        │
│                                                 │
│  "I was terrified my first time, but once I │
│   got there, it wasn't as bad as I expected." │
│                                                 │
│  "The judge was actually understanding of     │
│   people representing themselves."             │
│                                                 │
│  "Taking it one step at a time really helped."│
│                                                 │
│  You're doing great by preparing!              │
│                                                 │
│  [Continue]  [Talk to someone about this]      │
└─────────────────────────────────────────────────┘
```

### 7.2 Progress Encouragement

**Celebrate small wins:**

```tsx
// After completing a section:
┌─────────────────────────────────────────────────┐
│  🌟 Section Complete: Parties!                  │
│                                                 │
│  Great job! You've identified everyone         │
│  involved in your case.                        │
│                                                 │
│  What you accomplished:                       │
│  ✓ Named yourself as the plaintiff            │
│  ✓ Identified the defendant                   │
│  ✓ Gathered contact information               │
│                                                 │
│  People who've done this:                     │
│  • Feel more prepared                         │
│  • Have clearer understanding of their case   │
│  • Are one step closer to resolution          │
│                                                 │
│  You're now ready for the Venue section.     │
│                                                 │
│  [Continue →]                                │
└─────────────────────────────────────────────────┘
```

### 7.3 "What If I Fail?" Honest Answers

**Address fears directly:**

```tsx
// When user expresses doubt:
┌─────────────────────────────────────────────────┐
│  What if I don't win?                           │
│                                                 │
│  It's natural to worry about this. Here's      │
│  the honest truth:                             │
│                                                 │
│  If you don't win:                            │
│  • You owe nothing more (usually)            │
│  • You can appeal (sometimes)                │
│  • You can try again with new evidence       │
│  • You learn what worked and what didn't     │
│                                                 │
│  If you don't try:                            │
│  • The status quo remains                     │
│  • The other party wins by default           │
│  • You may always wonder "what if"           │
│                                                 │
│  Trying — win or lose — puts you in control. │
│                                                 │
│  Most people who use this app say they       │
│  felt better just having done something.       │
│                                                 │
│  [Continue with confidence]                     │
│  [Learn about appeals]                         │
└─────────────────────────────────────────────────┘
```

---

## Part 8: Accessibility & Support

### 8.1 Multiple Learning Formats

**Everyone learns differently:**

| Format | Best For |
|--------|----------|
| Video tutorials | Visual learners |
| Text guides | Readers, detail-oriented |
| Interactive quizzes | Active learners |
| Audio explanations | Busy people, auditory learners |
| Infographics | Quick overview seekers |
| Chat/Q&A | Specific question askers |
| Practice exercises | Kinesthetic learners |

### 8.2 Help at Every Step

**"Need Help?" buttons everywhere:**

```tsx
// Floating help button
<FloatingHelpButton 
  context="petition-filing"
  options={[
    { label: "What should I put here?", icon: "question" },
    { label: "I don't understand this term", icon: "dictionary" },
    { label: "Talk to a human", icon: "chat" },
    { label: "See examples", icon: "example" },
  ]}
/>

// Sidebar help panel
<HelpPanel
  sections={["Context", "Examples", "Common Mistakes", "Get Help"]}
/>
```

### 8.3 Human Escalation Path

**Clear path when self-service isn't enough:**

```tsx
// "I need help from a person" flow
┌─────────────────────────────────────────────────┐
│  Need to Talk to Someone?                       │
│                                                 │
│  We have several options:                     │
│                                                 │
│  💬 Chat with Legal Aid Bot                   │
│     Free, instant, 24/7                        │
│     Good for: forms, process, basic questions │
│                                                 │
│  📞 Texas Legal Aid Hotline                   │
│     Phone: 1-800-622-2520                      │
│     Hours: Mon-Fri 9am-5pm                    │
│     Good for: complex questions, eligibility │
│                                                 │
│  👨‍⚖️ Court Self-Help Center                 │
│     In-person at your courthouse               │
│     Good for: court-specific questions        │
│                                                 │
│  ⚖️ Attorney Consultation (paid)             │
│     $50-$200 for 30 min                       │
│     Good for: strategic advice, review       │
│                                                 │
│  [Learn more about each option →]              │
└─────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Core Education Infrastructure (Week 1-2)

| Task | Description | Files |
|------|-------------|-------|
| Legal Education Card | Component for contextual education | `src/components/education/legal-education-card.tsx` |
| Legal Dictionary API | Hooks and data for glossary | `src/hooks/useLegalDictionary.ts` |
| Education Content Library | Content for each topic | `src/content/education/` |
| Quiz Framework | Reusable quiz component | `src/components/education/quiz.tsx` |
| Coach Chat UI | Chat interface for Q&A | `src/components/education/legal-coach.tsx` |

### Phase 2: Guided Decision Making (Week 3-4)

| Task | Description |
|------|-------------|
| Decision Helper Popovers | "Help me decide" for choices |
| Court Selector Quiz | Interactive quiz to find right court |
| What-If Explainer | Show consequences of choices |
| Pre-Flight Checklist | Validation before filing |

### Phase 3: Learning Library (Week 5-6)

| Task | Description |
|------|-------------|
| Learn Page | `/learn` hub with all education |
| Video Embeds | Video learning modules |
| Flashcard App | Learning tool for concepts |
| Scenario Guides | Common situation walkthroughs |

### Phase 4: Practice & Preparation (Week 7-8)

| Task | Description |
|------|-------------|
| Courtroom Simulator | Practice Q&A environment |
| Knowledge Tests | Pre-step quizzes |
| Timeline Visualizer | Case journey visualization |
| Document Annotator | Explain petition sections |

### Phase 5: Support & Polish (Week 9-10)

| Task | Description |
|------|-------------|
| Human Escalation | Clear path to help |
| Emotional Support | Encouragement throughout |
| Accessibility Audit | Screen reader, contrast, etc. |
| User Testing | Test with real users |

---

## Success Metrics

1. **Completion Rate:** % users who start filing who complete
2. **Help Engagement:** % users who use education features
3. **Confusion Rate:** Support tickets related to legal terms/concepts
4. **Confidence Score:** Survey before/after using education
5. **Repeat Usage:** % users who return for learning content
6. **Success Rate:** % who report feeling prepared for court

---

## Design Principles Summary

1. **Teach at the moment of need** — Not upfront, not all at once
2. **Plain language always** — No jargon without explanation
3. **Show, don't tell** — Use visuals, examples, animations
4. **Validate before proceeding** — Check understanding at key steps
5. **Acknowledge emotions** — Legal processes are stressful
6. **Multiple formats** — Everyone learns differently
7. **Human backup** — Clear path when self-service isn't enough
8. **Celebrate progress** — Every step forward is an achievement
