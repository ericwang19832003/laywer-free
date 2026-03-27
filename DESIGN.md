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

## Spacing Scale
All spacing uses a 4px base unit. Use these values consistently:

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Inline icon gaps, tight element pairs |
| `space-2` | 8px | Between related items (label + input, icon + text) |
| `space-3` | 12px | Intra-card padding between content blocks |
| `space-4` | 16px | Card internal padding, form field gaps |
| `space-6` | 24px | Between card sections, group separators |
| `space-8` | 32px | Between major page sections |
| `space-12` | 48px | Page top/bottom margins, hero spacing |

Map to Tailwind: `p-1`=4, `p-2`=8, `p-3`=12, `p-4`=16, `p-6`=24, `p-8`=32, `p-12`=48.

## Typography Hierarchy

| Role | Class | Size | Weight | Color |
|------|-------|------|--------|-------|
| Page heading | `text-2xl font-bold` | 24px | 700 | `warm-text` |
| Card heading | `text-lg font-semibold` | 18px | 600 | `warm-text` |
| Body | `text-sm` | 14px | 400 | `warm-text` |
| Caption / helper | `text-xs text-warm-muted` | 12px | 400 | `warm-muted` |

- One page heading per view. Card headings for each grouped section.
- Captions for timestamps, helper text, metadata — never for primary content.

## Card Anatomy
Every card follows this structure:

```
┌─ Card ─────────────────────────────────┐
│  p-4 (16px padding all sides)          │
│  ┌─ Header ──────────────────────────┐ │
│  │  text-lg font-semibold            │ │
│  │  optional: subtitle (text-xs)     │ │
│  └───────────────────────────────────┘ │
│  gap-3 (12px)                          │
│  ┌─ Content ─────────────────────────┐ │
│  │  body content, forms, lists       │ │
│  └───────────────────────────────────┘ │
│  gap-3 (12px) — only if footer exists  │
│  ┌─ Footer (optional) ──────────────┐ │
│  │  actions aligned right            │ │
│  └───────────────────────────────────┘ │
└────────────────────────────────────────┘
```

- Internal spacing: `space-y-3` between header/content/footer.
- Card padding: `p-4` (16px). Never `p-2` or `p-6` on cards.
- Border: `warm-border`. Border radius: `rounded-lg`.

## Card Usage Policy
Use cards **only** when:
1. **Grouping related actions** — the card bundles 2+ controls that belong together (e.g., a case summary with edit + view actions).
2. **The card IS the interaction** — the entire card is clickable/tappable as a single unit (e.g., case list items, document cards).

Do **not** wrap content in a card when:
- It's a single standalone element (a lone button, a single paragraph).
- The content is a flat list that doesn't need visual grouping.
- You're nesting cards inside cards — flatten the hierarchy instead.

## Animation Tokens

| Token | Property | Value | Usage |
|-------|----------|-------|-------|
| Entrance | `animate-in fade-in` | opacity 0→1, 150ms ease-out | New elements appearing on screen |
| Hover lift | `hover:scale-[1.02]` | scale 1→1.02, 200ms ease | Interactive cards, clickable items |
| Color transition | `transition-colors duration-150` | 150ms ease | Buttons, links, hover states |

- Keep all durations ≤ 200ms. Anxious users need snappy feedback, not theatrics.
- Never animate layout shifts (width/height). Only opacity, transform, color.
- Reduce motion: respect `prefers-reduced-motion` — disable entrance and hover animations.

## Empty State Pattern
When a view has no data, show:

```
┌────────────────────────────────────┐
│         [warm illustration]        │  ← Simple, friendly SVG (not a sad face)
│                                    │
│     "No [items] yet"              │  ← text-lg font-semibold, warm-text
│     "[Encouraging context]"        │  ← text-sm, warm-muted
│                                    │
│     [ Primary Action Button ]      │  ← Default button variant
└────────────────────────────────────┘
```

- Illustration: small (max 120px), warm-toned, non-technical.
- Heading: state the absence plainly — "No cases yet", "No documents uploaded".
- Context: one sentence explaining what will appear here or what to do next.
- Action: always provide a primary CTA to resolve the empty state.
- Never show an empty table/list with column headers and no rows.

## Copy & Tone
See `docs/ux-copy-style-guide.md` for complete guidelines.
Key rule: NEVER use "ERROR", "FAILED", "WARNING", "URGENT", "OVERDUE" in user-facing text.
