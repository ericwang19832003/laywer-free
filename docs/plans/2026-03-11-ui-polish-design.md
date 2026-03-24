# UI Polish — Buttons, Nav & Menus Design

## Problem

The app's buttons, navigation bar, and dropdown menus feel flat and generic. The primary button variant is never used (everything defaults to `ghost`/`outline`), inline color hacks override the theme, icon buttons lack consistent styling, and the notification dropdown doesn't use the standard Radix pattern. The overall feel is functional but not polished.

## Solution

Polish the existing shadcn primitives at the source. No new libraries, no layout changes. Update button variants, nav bar, dropdowns, step page CTAs, and focus states for a consistent, modern feel that preserves the warm/calming brand identity.

## Changes

### 1. Primary Action Buttons (`src/components/ui/button.tsx`)

Update the `default` variant to use brand colors and micro-interactions:
- Base: `bg-calm-indigo text-white shadow-sm`
- Hover: `hover:bg-calm-indigo/90 hover:shadow-md` (subtle lift)
- Active: `active:scale-[0.98] active:shadow-sm` (press feedback)
- Transition: `transition-all duration-150` on all variants
- Focus: `focus-visible:ring-2 focus-visible:ring-calm-indigo/30 focus-visible:ring-offset-2`
- Border radius: `rounded-lg` on all sizes (was `rounded-md`)

Outline variant:
- Hover: `hover:bg-warm-bg hover:border-warm-muted/30 hover:shadow-sm`

Ghost variant: smoother hover transition, same duration-150.

### 2. Top Navigation Bar (`src/components/layout/top-nav.tsx`)

- Add scroll shadow: subtle `shadow-sm` when page has scrolled
- Tighter spacing between action buttons (`gap-2`)
- Icon button hit targets: `size-9` with `rounded-lg` and `hover:bg-warm-border/40`

### 3. Breadcrumbs (`src/components/layout/breadcrumbs.tsx`)

- Replace `ChevronRight` icon separators with lighter `›` character
- Add hover transition on link items

### 4. User Menu (`src/components/layout/user-menu.tsx`)

- Show user initials in a colored circle instead of plain icon
- Polish dropdown items with consistent padding

### 5. Dropdown Menus (`src/components/ui/dropdown-menu.tsx`)

- Consistent entrance/exit animations (fade + zoom)
- Items: `rounded-md`, increased padding (`px-3 py-2`)
- Shadow: upgrade to `shadow-lg`

### 6. Notification Bell (`src/components/layout/notification-bell.tsx`)

- Migrate from custom dropdown to standard Radix `DropdownMenu` for consistent behavior and animations

### 7. Step Page CTAs (`src/components/step/step-runner.tsx`)

- Main CTAs: larger size (`h-11 px-6 text-base`)
- Arrow icon with hover translate animation on "Review" and "Confirm" buttons
- Secondary actions: `hover:text-calm-indigo` instead of plain muted

### 8. Global Styles (`src/app/globals.css`)

- Update `--primary` CSS variable to match `calm-indigo` values
- Add scroll shadow utility class

### 9. Focus & Accessibility

Uniform across all interactive elements:
- `focus-visible:ring-2 focus-visible:ring-calm-indigo/30 focus-visible:ring-offset-2`
- Sidebar links: `focus-visible:bg-calm-indigo/5 focus-visible:rounded-md`

## Files

| File | Action |
|------|--------|
| `src/components/ui/button.tsx` | Modify — variants, transitions, rounded-lg, shadows |
| `src/components/ui/dropdown-menu.tsx` | Modify — animations, item padding, shadow |
| `src/components/layout/top-nav.tsx` | Modify — scroll shadow, spacing |
| `src/components/layout/breadcrumbs.tsx` | Modify — lighter separators |
| `src/components/layout/user-menu.tsx` | Modify — initials avatar |
| `src/components/layout/notification-bell.tsx` | Modify — migrate to Radix DropdownMenu |
| `src/components/step/step-runner.tsx` | Modify — larger CTA, arrow animation |
| `src/app/globals.css` | Modify — primary color, scroll shadow utility |

No new components, no new dependencies, no layout changes.
