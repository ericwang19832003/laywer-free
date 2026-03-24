# Zero-Knowledge Petition Filing UX Overhaul — Design

**Date:** 2026-03-03
**Goal:** Make the petition filing flow accessible to plaintiffs with zero legal knowledge by replacing jargon-heavy forms with conversational wizards, annotated draft viewing, and interactive guides.

## Problem

The current filing flow assumes users understand legal terminology (relief, venue, service of process, pro se), presents raw multi-section forms, and generates unannoted legal text. A plaintiff with no legal background faces 19 distinct UX pain points that create confusion, abandonment, and errors.

## Architecture: 3 Pillars

### Pillar 1 — Conversational Wizard
Replace the multi-section `prepare-filing-step` form with a step-by-step wizard:
- One question per screen with plain-English prompts
- Examples and contextual help at every step
- Progress bar showing completion
- Auto-save on every step for resume support
- Steps: Parties → Venue → Facts → Claims → Relief → Review

### Pillar 2 — Annotated Draft Viewer
Enhance the `DraftViewer` to explain the generated petition:
- Numbered margin annotations on key legal sections
- Click annotation → sidebar panel with plain-English explanation
- AI generates annotations alongside the legal text in a single pass
- "Verify this" highlights for user-provided facts to double-check

### Pillar 3 — Interactive Guides
New educational components throughout the flow:
- Service of process guide: defendant type → method → costs → checklist
- Venue/county helper: walks through where to file
- Pre-flight "What to prepare" checklist before starting
- Contextual tooltips on all form fields

## Fixes by Priority

### HIGH (7)
1. Replace "Relief Requested" label with "What do you want the court to do for you?"
2. Add venue/county guidance wizard step
3. Amount-jurisdiction validation (warn if amount exceeds court limit)
4. Annotated draft viewer with sidebar explanations
5. Interactive service of process guide
6. Move preservation letter earlier in task flow (after intake, before filing)
7. Wire government entity flag to AI prompt (sovereign immunity warning + special service rules)

### MEDIUM (7)
8. Contextual tooltips on every wizard/form field
9. Explain "What happened" vs "Legal claims" with examples
10. Real-time validation feedback (not just on submit)
11. Smart minimum data requirements with "your petition needs more detail" prompts
12. Pre-flight "What to prepare" checklist (before starting petition)
13. "Pro Se" explanation banner on case dashboard
14. Clarify "attorney fees" checkbox with plain-English description

### LOW (5)
15. Auto-save/resume on all wizard steps
16. Time/progress estimate ("About 20 minutes to complete")
17. FAQ accordion on key steps
18. Mobile-responsive polish for wizard
19. Success celebration screen after filing

## User Choices
- **Form style:** Conversational wizard (one question at a time, TurboTax-style)
- **Draft display:** Annotated draft with sidebar explanations
- **Service guidance:** Interactive service guide with defendant type → method → costs → checklist

## Technical Approach
- Reusable `WizardShell` component (progress bar, navigation, auto-save)
- Enhanced `DraftViewer` with annotation overlay and sidebar
- New `ServiceGuide` component with step-by-step flow
- All changes additive — no breaking changes to existing data model
- AI prompt modifications for annotation generation and government entity handling
