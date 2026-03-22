# Lawyer Free — Design System

## Philosophy
Warm, calming, confidence-building. Users are anxious self-represented litigants.
Every design decision should make them feel supported, not overwhelmed.

## Color Tokens
[Document the existing tokens from globals.css - warm-bg, warm-text, warm-muted, warm-border, calm-green, calm-amber, calm-indigo, and the shadcn tokens]

## Color Usage
- Success/completion: `calm-green` (#16A34A)
- Attention/deadlines: `calm-amber` (#D97706) — NEVER use red for urgency
- Interactive/info: `calm-indigo` (#4F46E5)
- Backgrounds: `warm-bg` (#FAFAF8)
- Primary text: `warm-text` (#1C1917)
- Secondary text: `warm-muted` (#78716C)
- Borders: `warm-border` (#E7E5E4)

## Typography
- Font: Geist Sans (system), Geist Mono (code)
- Body: 14px/16px base
- Headings: Tailwind defaults (text-lg, text-xl, text-2xl)

## Component Patterns
- Card-based layouts (shadcn Card)
- WizardShell for multi-step flows (sidebar + content)
- Button variants: default (primary), outline, ghost, destructive
- Progress bar for wizard completion
- Toast notifications (sonner) for feedback

## Interaction States
Every new feature must specify: loading, empty, error, success, partial states.
See the interaction state table in the CEO plan for the required format.

## Responsive Breakpoints
- Mobile: < 768px (single column, drawer navigation)
- Tablet: 768-1279px (sidebar collapses to top nav)
- Desktop: 1280px+ (full sidebar + content layout)

## Accessibility Requirements
- Minimum 44x44px touch targets
- ARIA live regions for dynamic content
- Focus management in modals and wizards
- Color contrast: WCAG AA minimum

## Copy & Tone
See `docs/ux-copy-style-guide.md` for complete guidelines.
Key rule: NEVER use "ERROR", "FAILED", "WARNING", "URGENT", "OVERDUE" in user-facing text.
