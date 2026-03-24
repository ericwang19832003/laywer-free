# Dialog Scroll Indicators Design

## Problem
The New Case wizard dialog has steps with many options (e.g., 12 Personal Injury subtypes). The dialog grows beyond the viewport with no scroll affordance, making bottom options unreachable.

## Solution
Add a scrollable content area within the dialog with fade gradients and floating chevron buttons.

## Layout
```
DialogContent (max-h-[85vh], flex column)
├── DialogHeader (pinned)
├── WizardProgress (pinned)
├── ScrollableArea (flex-1, overflow-y-auto)
│   ├── Top fade (sticky, visible when scrolled)
│   ├── Step content
│   └── Bottom fade (sticky, visible when more below)
├── Up/Down chevron buttons (absolute, right edge)
└── Error message (pinned)
```

## Behavior
- Scroll position tracked via `useRef` + `onScroll`
- Fade gradients: 24px, pointer-events-none, bg-background to transparent
- Chevron buttons: circular, scroll 200px smooth, appear/disappear based on scroll position
- Auto-reset scroll to top on step change

## Files
- `src/components/cases/new-case-dialog.tsx` — only file changed
