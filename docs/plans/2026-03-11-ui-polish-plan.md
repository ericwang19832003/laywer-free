# UI Polish — Buttons, Nav & Menus Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish all interactive UI primitives (buttons, dropdowns, nav, breadcrumbs, user menu, notification bell, step CTAs) for a consistent, modern feel.

**Architecture:** Pure CSS/Tailwind changes to existing shadcn primitives and layout components. No new libraries, no layout changes, no new components. Each task modifies one or two files with class string updates.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Radix UI, Lucide icons

---

### Task 1: Global Styles — Primary Color & Scroll Shadow Utility

Update CSS variables so `--primary` matches `calm-indigo`, and add a scroll shadow utility class.

**Files:**
- Modify: `src/app/globals.css:57-97` (`:root` block and add utility)

**Step 1: Update `--primary` to match `calm-indigo`**

In `src/app/globals.css`, inside the `:root` block, change these two lines:

```css
/* Old */
--primary: oklch(0.457 0.24 277);
/* ... */
--ring: oklch(0.457 0.24 277);
```

To:

```css
/* New — match calm-indigo (#4F46E5) */
--primary: oklch(0.442 0.218 264.83);
--ring: oklch(0.442 0.218 264.83);
```

Also update sidebar primary to match:

```css
/* Old */
--sidebar-primary: oklch(0.457 0.24 277);
/* ... */
--sidebar-ring: oklch(0.457 0.24 277);
```

To:

```css
--sidebar-primary: oklch(0.442 0.218 264.83);
--sidebar-ring: oklch(0.442 0.218 264.83);
```

**Step 2: Add scroll shadow utility class**

After the `@layer base` block (after line 106), add:

```css
/* Scroll shadow for sticky headers */
.scroll-shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04);
}
```

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style: align --primary with calm-indigo, add scroll-shadow utility"
```

---

### Task 2: Button Variants — Transitions, Rounded-lg, Shadows

Update all button variants with brand colors, micro-interactions, and consistent border radius.

**Files:**
- Modify: `src/components/ui/button.tsx:7-38` (the `buttonVariants` cva call)

**Step 1: Update the buttonVariants cva base and variants**

Replace the entire `buttonVariants` definition (lines 7-38) with:

```typescript
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-calm-indigo/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-calm-indigo text-white shadow-sm hover:bg-calm-indigo/90 hover:shadow-md active:scale-[0.98] active:shadow-sm",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90 hover:shadow-md active:scale-[0.98] active:shadow-sm focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-warm-bg hover:border-warm-muted/30 hover:shadow-sm dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-lg px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-lg",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-lg",
        "icon-lg": "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

Key changes from original:
- Base: `rounded-md` → `rounded-lg`, added `transition-all duration-150`, updated focus ring to `focus-visible:ring-2 focus-visible:ring-calm-indigo/30 focus-visible:ring-offset-2`
- `default` variant: `bg-primary text-primary-foreground hover:bg-primary/90` → `bg-calm-indigo text-white shadow-sm hover:bg-calm-indigo/90 hover:shadow-md active:scale-[0.98] active:shadow-sm`
- `outline` variant: hover now uses `hover:bg-warm-bg hover:border-warm-muted/30 hover:shadow-sm`
- All size variants: `rounded-md` → `rounded-lg`

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/ui/button.tsx
git commit -m "style: update button variants with brand colors, micro-interactions, rounded-lg"
```

---

### Task 3: Dropdown Menu — Animations, Padding, Shadow

Polish dropdown menu content and items with consistent animations, increased padding, and shadow upgrade.

**Files:**
- Modify: `src/components/ui/dropdown-menu.tsx:34-52` (DropdownMenuContent) and `62-83` (DropdownMenuItem)

**Step 1: Update DropdownMenuContent className**

In `src/components/ui/dropdown-menu.tsx`, find the `DropdownMenuContent` function (line 34). Replace the className string in the `cn()` call (line 45) with:

```
"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border p-1.5 shadow-lg"
```

Changes: `rounded-md` → `rounded-lg`, `p-1` → `p-1.5`, `shadow-md` → `shadow-lg`

**Step 2: Update DropdownMenuItem className**

In the `DropdownMenuItem` function (line 62), replace the className string in the `cn()` call (line 77) with:

```
"focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-hidden select-none transition-colors duration-150 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
```

Changes: `rounded-sm` → `rounded-md`, `px-2 py-1.5` → `px-3 py-2`, added `transition-colors duration-150`

**Step 3: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/ui/dropdown-menu.tsx
git commit -m "style: polish dropdown menus with rounded-lg, increased padding, shadow-lg"
```

---

### Task 4: Top Navigation — Scroll Shadow & Icon Button Sizing

Add scroll-aware shadow to the nav bar, tighten action button spacing, and polish icon button hit targets.

**Files:**
- Modify: `src/components/layout/top-nav.tsx`

**Step 1: Add scroll shadow state**

In `src/components/layout/top-nav.tsx`, add scroll detection. Replace the entire file with:

```tsx
'use client'

import Link from 'next/link'
import { Search, Scale } from 'lucide-react'
import { Breadcrumbs } from './breadcrumbs'
import { NotificationBell } from './notification-bell'
import { UserMenu } from './user-menu'
import { useState, useEffect } from 'react'
import { CommandPalette } from '@/components/search/command-palette'

export function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`sticky top-0 z-40 w-full border-b border-warm-border bg-warm-bg/95 backdrop-blur supports-[backdrop-filter]:bg-warm-bg/80 transition-shadow duration-200 ${scrolled ? 'scroll-shadow' : ''}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/cases"
            className="mr-4 flex items-center gap-2 text-sm font-semibold text-warm-text whitespace-nowrap"
          >
            <div className="w-7 h-7 rounded-lg bg-calm-indigo flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:inline">Lawyer Free</span>
          </Link>

          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center justify-center size-9 rounded-lg text-warm-muted hover:text-warm-text hover:bg-warm-border/40 transition-colors duration-150"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </nav>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
```

Changes from original:
- Added `scrolled` state with scroll event listener
- Nav element: added `transition-shadow duration-200` and conditional `scroll-shadow` class
- Action buttons container: `gap-1` → `gap-2`
- Search button: `rounded-md p-2` → `size-9 rounded-lg`, hover: `hover:bg-warm-border/50` → `hover:bg-warm-border/40`, added `duration-150`

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/layout/top-nav.tsx
git commit -m "style: add scroll shadow to nav, tighten spacing, polish icon buttons"
```

---

### Task 5: Breadcrumbs — Lighter Separators & Hover Transitions

Replace heavy `ChevronRight` icon separators with a lighter `›` character and add hover transitions.

**Files:**
- Modify: `src/components/layout/breadcrumbs.tsx`

**Step 1: Update separator and add transitions**

In `src/components/layout/breadcrumbs.tsx`:

1. Remove `ChevronRight` from the lucide-react import (line 5). The import should become:
```typescript
import { Fragment } from 'react'
```
(Remove the `ChevronRight` import entirely and move `Fragment` to standalone if needed.)

Actually, update the import line from:
```typescript
import { ChevronRight } from 'lucide-react'
```
to remove it entirely (delete that import line).

2. In the `Breadcrumbs` component JSX, replace the separator element (line 88):

Old:
```tsx
{i > 0 && <ChevronRight className="h-3.5 w-3.5 text-warm-border flex-shrink-0" />}
```

New:
```tsx
{i > 0 && <span className="text-warm-border flex-shrink-0 text-sm" aria-hidden="true">›</span>}
```

3. Add transition to link items (line 90-93). Update the Link className:

Old:
```tsx
className="text-warm-muted hover:text-warm-text transition-colors whitespace-nowrap"
```

New:
```tsx
className="text-warm-muted hover:text-warm-text transition-colors duration-150 whitespace-nowrap"
```

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/layout/breadcrumbs.tsx
git commit -m "style: lighter breadcrumb separators, smoother hover transitions"
```

---

### Task 6: User Menu — Initials Avatar & Consistent Padding

Show user initials in a colored circle instead of a plain icon. Polish dropdown items.

**Files:**
- Modify: `src/components/layout/user-menu.tsx`

**Step 1: Replace the entire file**

Replace `src/components/layout/user-menu.tsx` with:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { Settings, HelpCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRef, useState, useEffect } from 'react'

function getInitials(identifier: string): string {
  const email = identifier.trim()
  if (email.includes('@')) {
    const local = email.split('@')[0]
    const parts = local.split(/[._-]/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return local.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function UserMenu() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setUserIdentifier(data.user?.email ?? data.user?.phone ?? null)
    })
  }, [])

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center size-9 rounded-lg text-warm-muted hover:text-warm-text hover:bg-warm-border/40 transition-colors duration-150"
          aria-label="User menu"
        >
          {userIdentifier ? (
            <span className="flex items-center justify-center size-7 rounded-full bg-calm-indigo/10 text-calm-indigo text-xs font-semibold">
              {getInitials(userIdentifier)}
            </span>
          ) : (
            <span className="flex items-center justify-center size-7 rounded-full bg-warm-border/50 text-warm-muted text-xs font-semibold">
              ··
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userIdentifier && (
          <>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-warm-text truncate">{userIdentifier}</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help &amp; FAQ
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

Changes from original:
- Removed `User` icon import (no longer used)
- Added `getInitials()` helper that extracts 2-letter initials from email
- Trigger button: `rounded-md p-2` → `size-9 rounded-lg`, hover: `hover:bg-warm-border/50` → `hover:bg-warm-border/40`, added `duration-150`
- Shows colored initials circle (`bg-calm-indigo/10 text-calm-indigo`) instead of `<User>` icon
- Fallback `··` when no user loaded yet
- Dropdown header padding: `px-2 py-1.5` → `px-3 py-2`

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/layout/user-menu.tsx
git commit -m "style: user menu with initials avatar, polished trigger and padding"
```

---

### Task 7: Notification Bell — Migrate to Radix DropdownMenu

Replace the custom `open` state + click-outside handler with Radix `DropdownMenu` for consistent behavior and animations.

**Files:**
- Modify: `src/components/layout/notification-bell.tsx`

**Step 1: Replace the entire file**

Replace `src/components/layout/notification-bell.tsx` with:

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  case_id: string | null
  type: string
  title: string
  body: string
  read: boolean
  link: string | null
  created_at: string
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications?limit=20')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  async function handleMarkAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) fetchNotifications() }}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative inline-flex items-center justify-center size-9 rounded-lg text-warm-muted hover:text-warm-text hover:bg-warm-border/40 transition-colors duration-150"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-warm-border px-4 py-3">
          <p className="text-sm font-medium text-warm-text">Notifications</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto px-2 py-1 text-xs">
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-warm-muted">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <a
                key={n.id}
                href={n.link ?? '#'}
                className={`block border-b border-warm-border/50 px-4 py-3 text-left transition-colors hover:bg-warm-bg ${
                  !n.read ? 'bg-calm-indigo/5' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm ${!n.read ? 'font-medium text-warm-text' : 'text-warm-muted'}`}>
                    {n.title}
                  </p>
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-calm-indigo" />
                  )}
                </div>
                {n.body && (
                  <p className="mt-0.5 text-xs text-warm-muted line-clamp-2">{n.body}</p>
                )}
                <p className="mt-1 text-xs text-warm-muted/70">{relativeTime(n.created_at)}</p>
              </a>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

Changes from original:
- Removed: custom `open` state, `useRef` for click-outside, `useEffect` for click-outside handler
- Added: Radix `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuTrigger` imports
- Wrapped in `<DropdownMenu>` with `onOpenChange` to fetch on open
- Trigger button: `rounded-md p-2` → `size-9 rounded-lg`, hover: `hover:bg-warm-border/50` → `hover:bg-warm-border/40`, added `duration-150`
- Content uses `DropdownMenuContent` with `p-0` (custom inner layout)
- Gets consistent Radix entrance/exit animations + keyboard nav for free

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/layout/notification-bell.tsx
git commit -m "refactor: migrate notification bell to Radix DropdownMenu"
```

---

### Task 8: Step Page CTAs — Larger Buttons & Arrow Animation

Make step page primary CTAs larger and add an arrow hover animation on "Review" and "Confirm" buttons. Style secondary actions with calm-indigo hover.

**Files:**
- Modify: `src/components/step/step-runner.tsx:66-145`

**Step 1: Update the StepRunner JSX**

In `src/components/step/step-runner.tsx`, replace lines 82-116 (the input phase buttons section, starting from `<div className="mt-6 flex flex-col gap-3">`) with:

```tsx
              <div className="mt-6 flex flex-col gap-3">
                {skipReview ? (
                  <Button className="h-11 px-6 text-base" onClick={handleConfirm} disabled={loading}>
                    {loading ? 'Saving...' : "I'm ready"}
                  </Button>
                ) : (
                  <Button
                    className="h-11 px-6 text-base group"
                    onClick={async () => {
                      if (onBeforeReview) {
                        setLoading(true)
                        try {
                          await onBeforeReview()
                          setPhase('review')
                        } finally {
                          setLoading(false)
                        }
                      } else {
                        setPhase('review')
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (reviewButtonLabel ?? 'Review')}
                    {!loading && <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">→</span>}
                  </Button>
                )}
                {onSave && !skipReview && (
                  <button
                    onClick={handleSave}
                    className="text-sm text-warm-muted hover:text-calm-indigo transition-colors duration-150"
                    disabled={loading}
                  >
                    Save and come back later
                  </button>
                )}
              </div>
```

Then replace lines 127-138 (the review phase buttons section, starting from `<div className="flex flex-col gap-3">`) with:

```tsx
              <div className="flex flex-col gap-3">
                <Button className="h-11 px-6 text-base group" onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Saving...' : 'Confirm & Continue'}
                  {!loading && <span className="inline-block transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true">→</span>}
                </Button>
                <button
                  onClick={() => setPhase('input')}
                  className="text-sm text-warm-muted hover:text-calm-indigo transition-colors duration-150"
                  disabled={loading}
                >
                  &larr; Back to edit
                </button>
              </div>
```

Key changes:
- Primary buttons: added `className="h-11 px-6 text-base group"` for larger CTA size
- Arrow: `→` character with `group-hover:translate-x-0.5` animation, hidden when loading
- Review button label: removed ` →` from default text (arrow is now a separate animated element)
- Secondary actions: `hover:text-warm-text` → `hover:text-calm-indigo`, added `duration-150`

**Step 2: Verify build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -5`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/step/step-runner.tsx
git commit -m "style: larger step CTAs with arrow animation, calm-indigo secondary hover"
```

---

### Task 9: Final Verification

Run a full build to verify all changes work together.

**Step 1: Full build**

Run: `cd "/Users/minwang/lawyer free" && npx next build 2>&1 | tail -15`
Expected: Build succeeds with no errors

**Step 2: Visual verification checklist**

Start dev server and manually verify:
- [ ] Buttons: rounded-lg, calm-indigo default, shadow on hover, press feedback
- [ ] Dropdown menus: larger padding, shadow-lg, smooth entrance animation
- [ ] Top nav: subtle shadow appears on scroll
- [ ] Breadcrumbs: `›` separators instead of chevron icons
- [ ] User menu: initials circle instead of person icon
- [ ] Notification bell: Radix dropdown behavior (click outside closes, keyboard nav works)
- [ ] Step page: larger CTAs, arrow slides on hover, secondary links turn calm-indigo
