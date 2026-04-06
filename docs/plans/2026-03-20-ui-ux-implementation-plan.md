# UI/UX Implementation Plan

## Priority 1: Quick Wins (This Session)

### 1. Card-Based Case List
**File**: `src/components/cases/case-table.tsx` → `src/components/cases/case-cards.tsx`

**Changes**:
- Replace table with visual cards
- Add progress bars
- Color-code by case type
- Show next action and deadline

**Visual**:
```
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🏠 Personal Injury • Harris County               │   │
│  │                                                  │   │
│  │ ████████████████░░░░░░░░░░░ 55% Complete        │   │
│  │                                                  │   │
│  │ Next: File with Court                           │   │
│  │ ⚠️ Deadline: March 25, 2026 (5 days)           │   │
│  │                                                  │   │
│  │ [Continue] [View] [⋮]                           │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2. Improved Empty State
**File**: `src/components/cases/case-table.tsx`

**Changes**:
- Add friendly illustration
- Clear CTA button
- Helpful tips

### 3. Toast Notifications
**File**: Create `src/components/ui/toast.tsx`

**Changes**:
- Auto-save success notifications
- Error notifications
- Celebration toasts

### 4. Skeleton Loaders
**File**: Create `src/components/ui/skeleton.tsx`

**Changes**:
- Shimmer animation
- Card skeletons
- List skeletons

---

## Priority 2: TurboTax-Style Wizard

### 1. Wizard Sidebar
**File**: `src/components/ui/wizard-shell.tsx`

**Changes**:
- Add collapsible sidebar showing all steps
- Mark completed steps with checkmarks
- Show current step highlighted
- Add "Learn More" contextual links

### 2. Celebration Animations
**File**: `src/components/step/celebration-banner.tsx`

**Changes**:
- Confetti effect on step completion
- Progress celebration
- Encouraging messages

### 3. Auto-Save Indicator
**File**: `src/components/ui/wizard-shell.tsx`

**Changes**:
- "Saving..." → "Saved ✓" indicator
- Subtle animation
- Persist form data continuously

### 4. Smart Field Validation
**File**: `src/lib/validation/messages.ts`

**Changes**:
- Inline validation messages
- "Why do we need this?" tooltips
- Encouraging error messages

---

## Priority 3: Learn Page Gamification

### 1. Streak Tracker
**File**: `src/app/(authenticated)/learn/page.tsx`

**Changes**:
- Track daily learning streak
- Visual streak indicator
- Streak preservation (localStorage)

### 2. Progress Rings
**File**: Create `src/components/ui/progress-ring.tsx`

**Changes**:
- Circular progress indicator
- Animated fill
- Percentage display

### 3. Achievement Badges
**File**: Create `src/components/education/achievements.tsx`

**Changes**:
- Unlock badges for milestones
- Visual badge display
- Badge notifications

---

## Files to Create/Modify

### New Components
```
src/components/ui/toast.tsx              (toast notification system)
src/components/ui/skeleton.tsx           (loading skeletons)
src/components/ui/progress-ring.tsx      (circular progress)
src/components/ui/bottom-sheet.tsx        (mobile bottom sheet)
src/components/cases/case-cards.tsx       (card-based case display)
src/components/education/achievements.tsx  (gamification badges)
src/components/education/streak-tracker.tsx (learning streaks)
src/components/animations/confetti.tsx    (celebration effects)
```

### Components to Modify
```
src/components/ui/wizard-shell.tsx         (add sidebar, auto-save)
src/components/step/celebration-banner.tsx (add confetti)
src/components/cases/case-table.tsx        (use case-cards instead)
src/app/(authenticated)/learn/page.tsx     (add streaks, progress)
src/app/(authenticated)/cases/page.tsx     (use new case cards)
src/app/layout.tsx                         (add toast provider)
```

---

## Implementation Order

1. **Toast System** - Foundation for other improvements
2. **Skeletons** - Better loading experience
3. **Case Cards** - Immediate visual improvement
4. **Wizard Sidebar** - Core TurboTax feature
5. **Celebrations** - Motivation and feedback
6. **Learn Streaks** - Engagement feature
7. **Progress Rings** - Visual polish

---

## Technical Notes

### Animation Library
Consider using `framer-motion` for:
- Page transitions
- Component animations
- Gesture-based interactions

### State Management
- Use `localStorage` for:
  - Learning streaks
  - Achievement unlocks
  - User preferences (dark mode)

- Use React state for:
  - Form data
  - Current wizard step
  - UI state

### Performance
- Lazy load Learn page components
- Use skeleton screens for async data
- Debounce auto-save
- Optimize re-renders with memo
