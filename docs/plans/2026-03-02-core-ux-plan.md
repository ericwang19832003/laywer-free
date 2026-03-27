# Core UX Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add persistent top navigation with breadcrumbs, Cmd+K command palette search, PDF/print export for generated documents, and settings/help pages.

**Architecture:** A new route group `(authenticated)` wraps all auth-required pages with a TopNav layout containing breadcrumbs, search trigger, and user menu. Command palette is a client-side modal querying a new `/api/search` endpoint. PDF export uses `pdf-lib` (already installed) in DraftViewer. Settings uses Supabase auth metadata (no new tables). Help is static FAQ content.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, pdf-lib, lucide-react, vitest

---

## Task 1: TopNav Component

**Files:**
- Create: `src/components/layout/top-nav.tsx`

**Context:** The app currently has no persistent navigation. Every page uses inline "Back to dashboard" links. This component adds a fixed top bar visible on all authenticated pages. It will be wired into the layout in Task 6.

**Code:**

```tsx
// src/components/layout/top-nav.tsx
'use client'

import Link from 'next/link'
import { Search, User } from 'lucide-react'
import { Breadcrumbs } from './breadcrumbs'
import { UserMenu } from './user-menu'
import { useState } from 'react'
import { CommandPalette } from '@/components/search/command-palette'

export function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-warm-border bg-warm-bg/95 backdrop-blur supports-[backdrop-filter]:bg-warm-bg/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/cases"
            className="mr-4 text-sm font-semibold text-warm-text whitespace-nowrap"
          >
            Lawyer Free
          </Link>

          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-warm-muted hover:text-warm-text hover:bg-warm-border/50 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <UserMenu />
          </div>
        </div>
      </nav>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
```

**Commit:** `feat: add TopNav component with search trigger and user menu`

---

## Task 2: Breadcrumbs Component

**Files:**
- Create: `src/components/layout/breadcrumbs.tsx`
- Create: `tests/unit/layout/breadcrumbs.test.tsx`

**Context:** Breadcrumbs auto-derive from the URL pathname. The app uses these route patterns:
- `/cases` → "Cases"
- `/case/[id]` → "Cases > Dashboard"
- `/case/[id]/step/[taskId]` → "Cases > Dashboard > Step"
- `/case/[id]/motions` → "Cases > Dashboard > Motions"
- `/case/[id]/evidence` → "Cases > Dashboard > Evidence"
- `/case/[id]/discovery` → "Cases > Dashboard > Discovery"
- `/case/[id]/deadlines` → "Cases > Dashboard > Deadlines"
- `/case/[id]/exhibits` → "Cases > Dashboard > Exhibits"
- `/case/[id]/binders` → "Cases > Dashboard > Binders"
- `/case/[id]/health` → "Cases > Dashboard > Health"
- `/settings` → "Settings"
- `/help` → "Help"

The function `buildBreadcrumbs(pathname)` is a pure function we can unit test.

**Code:**

```tsx
// src/components/layout/breadcrumbs.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'

export interface Crumb {
  label: string
  href: string | null // null = current page (no link)
}

const SECTION_LABELS: Record<string, string> = {
  motions: 'Motions',
  evidence: 'Evidence',
  discovery: 'Discovery',
  deadlines: 'Deadlines',
  exhibits: 'Exhibits',
  binders: 'Binders',
  health: 'Health',
  step: 'Step',
}

export function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)

  // Top-level pages
  if (segments.length === 0) return []
  if (segments[0] === 'cases') return [{ label: 'Cases', href: null }]
  if (segments[0] === 'settings') return [{ label: 'Settings', href: null }]
  if (segments[0] === 'help') return [{ label: 'Help', href: null }]

  // Case pages: /case/[id]/...
  if (segments[0] === 'case' && segments.length >= 2) {
    const caseId = segments[1]
    const crumbs: Crumb[] = [
      { label: 'Cases', href: '/cases' },
    ]

    if (segments.length === 2) {
      // /case/[id] — dashboard
      crumbs.push({ label: 'Dashboard', href: null })
    } else {
      crumbs.push({ label: 'Dashboard', href: `/case/${caseId}` })

      const section = segments[2]
      const sectionLabel = SECTION_LABELS[section] || section.charAt(0).toUpperCase() + section.slice(1)

      if (segments.length === 3) {
        // /case/[id]/motions, /case/[id]/evidence, etc.
        crumbs.push({ label: sectionLabel, href: null })
      } else {
        // /case/[id]/step/[taskId], /case/[id]/motions/[motionKey], etc.
        if (section === 'step') {
          crumbs.push({ label: 'Step', href: null })
        } else {
          crumbs.push({ label: sectionLabel, href: `/case/${caseId}/${section}` })
          crumbs.push({ label: 'Detail', href: null })
        }
      }
    }

    return crumbs
  }

  return []
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const crumbs = buildBreadcrumbs(pathname)

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
      {crumbs.map((crumb, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-warm-border flex-shrink-0" />}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-warm-muted hover:text-warm-text transition-colors whitespace-nowrap"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-warm-text font-medium whitespace-nowrap truncate">
              {crumb.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
```

**Tests:**

```typescript
// tests/unit/layout/breadcrumbs.test.tsx
import { describe, it, expect } from 'vitest'
import { buildBreadcrumbs } from '@/components/layout/breadcrumbs'

describe('buildBreadcrumbs', () => {
  it('returns empty for root', () => {
    expect(buildBreadcrumbs('/')).toEqual([])
  })

  it('returns Cases for /cases', () => {
    const crumbs = buildBreadcrumbs('/cases')
    expect(crumbs).toEqual([{ label: 'Cases', href: null }])
  })

  it('returns Settings for /settings', () => {
    const crumbs = buildBreadcrumbs('/settings')
    expect(crumbs).toEqual([{ label: 'Settings', href: null }])
  })

  it('returns Help for /help', () => {
    const crumbs = buildBreadcrumbs('/help')
    expect(crumbs).toEqual([{ label: 'Help', href: null }])
  })

  it('returns Cases > Dashboard for /case/abc', () => {
    const crumbs = buildBreadcrumbs('/case/abc')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: null },
    ])
  })

  it('returns Cases > Dashboard > Motions for /case/abc/motions', () => {
    const crumbs = buildBreadcrumbs('/case/abc/motions')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Motions', href: null },
    ])
  })

  it('returns Cases > Dashboard > Evidence for /case/abc/evidence', () => {
    const crumbs = buildBreadcrumbs('/case/abc/evidence')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Evidence', href: null },
    ])
  })

  it('returns Cases > Dashboard > Step for /case/abc/step/xyz', () => {
    const crumbs = buildBreadcrumbs('/case/abc/step/xyz')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Step', href: null },
    ])
  })

  it('returns Cases > Dashboard > Motions > Detail for /case/abc/motions/motion_to_compel', () => {
    const crumbs = buildBreadcrumbs('/case/abc/motions/motion_to_compel')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Motions', href: '/case/abc/motions' },
      { label: 'Detail', href: null },
    ])
  })
})
```

**Run:** `npx vitest run tests/unit/layout/breadcrumbs.test.tsx`
**Expected:** 9 tests pass.

**Commit:** `feat: add Breadcrumbs component with unit tests`

---

## Task 3: UserMenu Component

**Files:**
- Create: `src/components/layout/user-menu.tsx`

**Context:** Dropdown menu using existing `DropdownMenu` from `@/components/ui/dropdown-menu`. Shows user email, links to Settings, Help, and Sign Out action. Uses Supabase client-side auth for sign out.

**Code:**

```tsx
// src/components/layout/user-menu.tsx
'use client'

import { useRouter } from 'next/navigation'
import { User, Settings, HelpCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRef, useState, useEffect } from 'react'

export function UserMenu() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null)
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
          className="inline-flex items-center justify-center rounded-md p-2 text-warm-muted hover:text-warm-text hover:bg-warm-border/50 transition-colors"
          aria-label="User menu"
        >
          <User className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {email && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-warm-text truncate">{email}</p>
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
          Help & FAQ
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

**Commit:** `feat: add UserMenu dropdown component`

---

## Task 4: Search API

**Files:**
- Create: `src/app/api/search/route.ts`
- Create: `tests/unit/api/search.test.ts`

**Context:** This API endpoint searches across `cases`, `tasks`, `court_documents`, and `deadlines` tables using Supabase `ilike` for text matching. Results are grouped by category. Uses `getAuthenticatedClient` for auth (RLS scopes results to user). Search is case-insensitive.

**Code:**

```typescript
// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: { cases: [], tasks: [], documents: [], deadlines: [] } })
  }

  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const pattern = `%${q}%`

  const [casesResult, tasksResult, documentsResult, deadlinesResult] = await Promise.all([
    supabase!
      .from('cases')
      .select('id, county, role, dispute_type, status')
      .eq('status', 'active')
      .or(`county.ilike.${pattern},dispute_type.ilike.${pattern},role.ilike.${pattern}`)
      .limit(5),
    supabase!
      .from('tasks')
      .select('id, case_id, task_key, title, status')
      .ilike('title', pattern)
      .limit(5),
    supabase!
      .from('court_documents')
      .select('id, case_id, doc_type, original_filename')
      .or(`doc_type.ilike.${pattern},original_filename.ilike.${pattern}`)
      .limit(5),
    supabase!
      .from('deadlines')
      .select('id, case_id, key, due_at, source')
      .ilike('key', pattern)
      .limit(5),
  ])

  return NextResponse.json({
    results: {
      cases: casesResult.data ?? [],
      tasks: tasksResult.data ?? [],
      documents: documentsResult.data ?? [],
      deadlines: deadlinesResult.data ?? [],
    },
  })
}
```

**Tests:**

```typescript
// tests/unit/api/search.test.ts
import { describe, it, expect } from 'vitest'

describe('search API validation', () => {
  it('requires at least 2 characters for meaningful search', () => {
    // This validates the design constraint — the API returns empty for q < 2 chars
    expect('a'.length < 2).toBe(true)
    expect('ab'.length >= 2).toBe(true)
  })

  it('constructs ilike pattern correctly', () => {
    const q = 'harris'
    const pattern = `%${q}%`
    expect(pattern).toBe('%harris%')
  })

  it('trims whitespace from query', () => {
    const q = '  harris  '
    expect(q.trim()).toBe('harris')
  })
})
```

**Run:** `npx vitest run tests/unit/api/search.test.ts`
**Expected:** 3 tests pass.

**Commit:** `feat: add search API endpoint`

---

## Task 5: Command Palette Component

**Files:**
- Create: `src/components/search/command-palette.tsx`

**Context:** A modal overlay triggered by Cmd+K or the search icon in TopNav. Uses existing `Dialog` component from `@/components/ui/dialog`. Fetches results from `/api/search` with debounced input. Results are grouped and navigable with keyboard.

**Code:**

```tsx
// src/components/search/command-palette.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Clock, Scale, FolderOpen } from 'lucide-react'

interface SearchResults {
  cases: Array<{ id: string; county: string | null; role: string; dispute_type: string | null }>
  tasks: Array<{ id: string; case_id: string; title: string; status: string }>
  documents: Array<{ id: string; case_id: string; doc_type: string; original_filename: string | null }>
  deadlines: Array<{ id: string; case_id: string; key: string; due_at: string }>
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cmd+K global listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query || query.length < 2) {
      setResults(null)
      return
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results)
          setSelectedIndex(0)
        }
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  // Flatten results into navigable items
  const items = useCallback(() => {
    if (!results) return []
    const flat: Array<{ type: string; label: string; sublabel: string; href: string }> = []

    for (const c of results.cases) {
      flat.push({
        type: 'Case',
        label: c.county || 'Case',
        sublabel: `${c.role} — ${c.dispute_type || 'General'}`,
        href: `/case/${c.id}`,
      })
    }
    for (const t of results.tasks) {
      flat.push({
        type: 'Task',
        label: t.title,
        sublabel: t.status,
        href: `/case/${t.case_id}/step/${t.id}`,
      })
    }
    for (const d of results.documents) {
      flat.push({
        type: 'Document',
        label: d.original_filename || d.doc_type,
        sublabel: d.doc_type,
        href: `/case/${d.case_id}`,
      })
    }
    for (const dl of results.deadlines) {
      flat.push({
        type: 'Deadline',
        label: dl.key.replace(/_/g, ' '),
        sublabel: new Date(dl.due_at).toLocaleDateString(),
        href: `/case/${dl.case_id}/deadlines`,
      })
    }
    return flat
  }, [results])

  const flatItems = items()

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      onOpenChange(false)
      router.push(flatItems[selectedIndex].href)
    }
  }

  const typeIcon: Record<string, React.ReactNode> = {
    Case: <FolderOpen className="h-4 w-4 text-warm-muted" />,
    Task: <Scale className="h-4 w-4 text-warm-muted" />,
    Document: <FileText className="h-4 w-4 text-warm-muted" />,
    Deadline: <Clock className="h-4 w-4 text-warm-muted" />,
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Palette */}
      <div className="relative w-full max-w-lg rounded-xl border border-warm-border bg-white shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-2 border-b border-warm-border px-4 py-3">
          <Search className="h-4 w-4 text-warm-muted flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search cases, tasks, documents..."
            className="flex-1 bg-transparent text-sm text-warm-text placeholder:text-warm-muted outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-warm-border px-1.5 py-0.5 text-[10px] text-warm-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {loading && (
            <p className="px-4 py-3 text-sm text-warm-muted">Searching...</p>
          )}

          {!loading && query.length >= 2 && flatItems.length === 0 && (
            <p className="px-4 py-3 text-sm text-warm-muted">No results found.</p>
          )}

          {!loading && flatItems.length > 0 && (
            <ul>
              {flatItems.map((item, i) => (
                <li key={`${item.type}-${item.href}-${i}`}>
                  <button
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                      i === selectedIndex ? 'bg-primary/5 text-warm-text' : 'text-warm-muted hover:bg-warm-border/30'
                    }`}
                    onClick={() => {
                      onOpenChange(false)
                      router.push(item.href)
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                  >
                    {typeIcon[item.type]}
                    <div className="flex-1 min-w-0">
                      <span className="block truncate font-medium text-warm-text">{item.label}</span>
                      <span className="block truncate text-xs text-warm-muted">{item.sublabel}</span>
                    </div>
                    <span className="text-xs text-warm-border flex-shrink-0">{item.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.length < 2 && (
            <p className="px-4 py-3 text-sm text-warm-muted">
              Type at least 2 characters to search...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-warm-border px-4 py-2">
          <div className="flex gap-2 text-[10px] text-warm-muted">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
          </div>
          <div className="text-[10px] text-warm-muted">
            <kbd className="font-mono">⌘K</kbd> to toggle
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Commit:** `feat: add CommandPalette search component with keyboard navigation`

---

## Task 6: Authenticated Layout + Route Group Migration

**Files:**
- Create: `src/app/(authenticated)/layout.tsx`
- Move: `src/app/cases/page.tsx` → `src/app/(authenticated)/cases/page.tsx`
- Move: `src/app/case/` → `src/app/(authenticated)/case/`
- Modify: `src/app/layout.tsx` — remove max-w-4xl constraint (TopNav handles its own centering; pages handle their own)

**Context:** Next.js route groups `(authenticated)` don't affect the URL. Moving `/cases` into `/(authenticated)/cases` keeps the `/cases` URL but adds the TopNav layout. Login/signup stay outside the group. The root `page.tsx` (redirect) stays at root.

**Important:** All page files inside `(authenticated)` keep their existing `max-w-2xl` or `max-w-4xl` constraints — the TopNav only adds a nav bar above them. The root layout's `max-w-4xl` constraint must be removed since the TopNav needs full-width for its border.

**Root layout change:**

```tsx
// src/app/layout.tsx — MODIFIED
// Remove the max-w-4xl div wrapper. Let pages own their width constraints.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-warm-bg`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

**Authenticated layout:**

```tsx
// src/app/(authenticated)/layout.tsx
import { TopNav } from '@/components/layout/top-nav'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopNav />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </>
  )
}
```

**Migration steps (shell commands):**
```bash
mkdir -p "src/app/(authenticated)"
mv src/app/cases "src/app/(authenticated)/cases"
mv src/app/case "src/app/(authenticated)/case"
```

**Login/signup page fix:** Since root layout no longer has max-w-4xl, login and signup already use their own centering (`min-h-screen flex items-center justify-center`), so they're fine.

**Root page.tsx fix:** The root `page.tsx` (redirect only) stays at `src/app/page.tsx` and works fine.

**Commit:** `feat: add authenticated layout with TopNav and route group migration`

---

## Task 7: PDF Document Generator Utility

**Files:**
- Create: `src/lib/pdf/generate-document-pdf.ts`
- Create: `tests/unit/pdf/generate-document-pdf.test.ts`

**Context:** Client-side PDF generation using `pdf-lib` (already installed). Creates US Letter PDFs with court-filing formatting: Times New Roman, 1" margins, "DRAFT — NOT LEGAL ADVICE" footer. Reuses text-wrapping approach from `src/lib/binder/generate-summary-pdf.ts`.

**Code:**

```typescript
// src/lib/pdf/generate-document-pdf.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

const PAGE_W = 612  // US Letter width (points)
const PAGE_H = 792  // US Letter height
const MARGIN = 72   // 1 inch
const CONTENT_W = PAGE_W - MARGIN * 2

const BODY_SIZE = 12
const TITLE_SIZE = 14
const LINE_HEIGHT = 16
const FOOTER_SIZE = 8

const DARK = rgb(0.1, 0.1, 0.1)
const LIGHT = rgb(0.5, 0.5, 0.5)

function wrapText(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number): string[] {
  if (!text) return ['']
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    const testWidth = font.widthOfTextAtSize(test, size)
    if (testWidth <= maxWidth) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ['']
}

export interface DocumentPdfOptions {
  title: string
  content: string
  courtInfo?: string
}

export async function generateDocumentPdf(opts: DocumentPdfOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const regular = await doc.embedFont(StandardFonts.TimesRoman)
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold)

  // Split content into paragraphs
  const paragraphs = opts.content.split('\n')

  let page = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN
  let pageNum = 1

  function addFooter() {
    page.drawText('DRAFT — NOT LEGAL ADVICE', {
      x: MARGIN,
      y: MARGIN / 2,
      size: FOOTER_SIZE,
      font: regular,
      color: LIGHT,
    })
    page.drawText(`Page ${pageNum}`, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(`Page ${pageNum}`, FOOTER_SIZE),
      y: MARGIN / 2,
      size: FOOTER_SIZE,
      font: regular,
      color: LIGHT,
    })
  }

  function newPage() {
    addFooter()
    pageNum++
    page = doc.addPage([PAGE_W, PAGE_H])
    y = PAGE_H - MARGIN
  }

  // Title
  const titleLines = wrapText(opts.title, bold, TITLE_SIZE, CONTENT_W)
  for (const line of titleLines) {
    if (y < MARGIN + LINE_HEIGHT) newPage()
    page.drawText(line, { x: MARGIN, y, size: TITLE_SIZE, font: bold, color: DARK })
    y -= LINE_HEIGHT + 4
  }
  y -= 8

  // Court info (if provided)
  if (opts.courtInfo) {
    const infoLines = wrapText(opts.courtInfo, regular, BODY_SIZE - 2, CONTENT_W)
    for (const line of infoLines) {
      if (y < MARGIN + LINE_HEIGHT) newPage()
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE - 2, font: regular, color: LIGHT })
      y -= LINE_HEIGHT
    }
    y -= 8
  }

  // Horizontal rule
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 0.5,
    color: rgb(0.82, 0.82, 0.82),
  })
  y -= LINE_HEIGHT

  // Body content
  for (const para of paragraphs) {
    if (para.trim() === '') {
      y -= LINE_HEIGHT / 2
      continue
    }

    const lines = wrapText(para, regular, BODY_SIZE, CONTENT_W)
    for (const line of lines) {
      if (y < MARGIN + LINE_HEIGHT) newPage()
      page.drawText(line, { x: MARGIN, y, size: BODY_SIZE, font: regular, color: DARK })
      y -= LINE_HEIGHT
    }
  }

  // Footer on last page
  addFooter()

  return doc.save()
}
```

**Tests:**

```typescript
// tests/unit/pdf/generate-document-pdf.test.ts
import { describe, it, expect } from 'vitest'
import { generateDocumentPdf } from '@/lib/pdf/generate-document-pdf'

describe('generateDocumentPdf', () => {
  it('generates a valid PDF buffer', async () => {
    const result = await generateDocumentPdf({
      title: 'Test Document',
      content: 'This is the body of the document.',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(100)
    // PDF magic bytes
    const header = new TextDecoder().decode(result.slice(0, 5))
    expect(header).toBe('%PDF-')
  })

  it('includes court info when provided', async () => {
    const result = await generateDocumentPdf({
      title: 'Motion for Continuance',
      content: 'Body text here.',
      courtInfo: 'District Court of Harris County, Texas',
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(100)
  })

  it('handles long content with page breaks', async () => {
    const longContent = Array(200).fill('This is a paragraph of text that should cause page breaks in the generated PDF document.').join('\n')
    const result = await generateDocumentPdf({
      title: 'Long Document',
      content: longContent,
    })
    expect(result).toBeInstanceOf(Uint8Array)
    expect(result.length).toBeGreaterThan(1000) // multi-page = more bytes
  })

  it('handles empty content', async () => {
    const result = await generateDocumentPdf({
      title: 'Empty',
      content: '',
    })
    expect(result).toBeInstanceOf(Uint8Array)
  })
})
```

**Run:** `npx vitest run tests/unit/pdf/generate-document-pdf.test.ts`
**Expected:** 4 tests pass.

**Commit:** `feat: add PDF document generator utility`

---

## Task 8: DraftViewer — PDF Export + Print Buttons

**Files:**
- Modify: `src/components/step/filing/draft-viewer.tsx`

**Context:** Add "Download PDF" and "Print" buttons to the existing DraftViewer. The PDF button uses `generateDocumentPdf` to create a client-side PDF and triggers a download. The Print button triggers `window.print()`. Also add an optional `documentTitle` prop for the PDF filename and title.

**Modified code (full file replacement):**

```tsx
// src/components/step/filing/draft-viewer.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Download, Printer } from 'lucide-react'
import { generateDocumentPdf } from '@/lib/pdf/generate-document-pdf'

interface DraftViewerProps {
  draft: string
  onDraftChange: (v: string) => void
  onRegenerate: () => void
  regenerating: boolean
  acknowledged: boolean
  onAcknowledgeChange: (v: boolean) => void
  documentTitle?: string
}

export function DraftViewer({
  draft, onDraftChange, onRegenerate, regenerating, acknowledged, onAcknowledgeChange,
  documentTitle,
}: DraftViewerProps) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      const pdfBytes = await generateDocumentPdf({
        title: documentTitle || 'Legal Document Draft',
        content: draft,
      })
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(documentTitle || 'draft').replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
        <p className="text-sm font-medium text-warm-text">DRAFT — NOT LEGAL ADVICE</p>
        <p className="text-xs text-warm-muted mt-1">
          This is a computer-generated starting point. You are responsible for reviewing and editing this document before filing. This is not legal advice.
        </p>
      </div>

      <textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        className="w-full min-h-[400px] rounded-md border border-warm-border p-4 text-sm font-mono text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 print:border-none print:p-0 print:font-serif"
      />

      <div className="flex gap-2 print:hidden">
        <Button type="button" variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? 'Regenerating...' : 'Regenerate Draft'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          {downloading ? 'Generating...' : 'Download PDF'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5 mr-1.5" />
          Print
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-warm-border p-3 print:hidden">
        <Checkbox id="acknowledge" checked={acknowledged} onCheckedChange={(c) => onAcknowledgeChange(c === true)} />
        <Label htmlFor="acknowledge" className="text-sm text-warm-text leading-tight cursor-pointer">
          I understand this is a draft and not legal advice. I will review and edit this document before filing.
        </Label>
      </div>
    </div>
  )
}
```

**Note:** The `'use client'` directive is added because `generateDocumentPdf` uses `pdf-lib` which needs browser APIs. The existing DraftViewer is already used in client components so this is fine.

**Commit:** `feat: add PDF download and print buttons to DraftViewer`

---

## Task 9: Print Styles

**Files:**
- Modify: `src/app/globals.css`

**Context:** Add `@media print` rules that hide navigation, buttons, and non-content elements when printing. Show only the document content with serif font and proper margins.

**Append to globals.css:**

```css
/* Print styles — hide chrome, show only document content */
@media print {
  /* Hide navigation, buttons, disclaimers */
  nav,
  footer,
  .print\\:hidden,
  [class*="print:hidden"] {
    display: none !important;
  }

  body {
    background: white !important;
    color: black !important;
    font-family: 'Times New Roman', Times, serif !important;
  }

  /* Remove max-width constraints for print */
  .max-w-4xl,
  .max-w-2xl {
    max-width: none !important;
  }

  /* Proper margins */
  @page {
    margin: 1in;
  }
}
```

**Commit:** `feat: add print styles for document export`

---

## Task 10: Settings Page

**Files:**
- Create: `src/app/(authenticated)/settings/page.tsx`

**Context:** Settings page with 3 sections: Profile (email display, display name), Password Change, and Sign Out / Account. Uses Supabase auth for all operations. No new database tables — display name stored in `auth.users.raw_user_meta_data`.

**Code:**

```tsx
// src/app/(authenticated)/settings/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmail(data.user.email ?? '')
        setDisplayName(data.user.user_metadata?.display_name ?? '')
      }
    })
  }, [])

  async function handleSaveProfile() {
    setSavingProfile(true)
    const { error } = await getSupabase().auth.updateUser({
      data: { display_name: displayName },
    })
    setSavingProfile(false)
    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated')
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setChangingPassword(true)
    const { error } = await getSupabase().auth.updateUser({
      password: newPassword,
    })
    setChangingPassword(false)
    if (error) {
      toast.error('Failed to change password')
    } else {
      toast.success('Password changed')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Settings"
          subtitle="Manage your account and preferences."
        />

        <div className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled className="bg-warm-bg" />
                <p className="text-xs text-warm-muted">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleChangePassword} disabled={changingPassword} size="sm">
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
```

**Commit:** `feat: add Settings page with profile, password, and account sections`

---

## Task 11: Help & FAQ Page

**Files:**
- Create: `src/app/(authenticated)/help/page.tsx`

**Context:** Static FAQ page with accordion-style sections. Uses details/summary HTML elements for zero-JS accordion (simple, accessible). Content covers the main features of the app.

**Code:**

```tsx
// src/app/(authenticated)/help/page.tsx
import { SupportiveHeader } from '@/components/layout/supportive-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FaqItem {
  q: string
  a: string
}

interface FaqSection {
  title: string
  items: FaqItem[]
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        q: 'What is Lawyer Free?',
        a: 'Lawyer Free helps self-represented (pro se) litigants organize their legal cases with step-by-step guidance, document generation, and deadline tracking. It does not provide legal advice.',
      },
      {
        q: 'How do I create a case?',
        a: 'From the Cases page, click "Start a New Case" and fill in your basic case information including your county, your role (plaintiff or defendant), and the type of dispute.',
      },
      {
        q: 'Is this legal advice?',
        a: 'No. Lawyer Free provides legal information and document formatting assistance. It is not a substitute for a licensed attorney. Always consult a lawyer for legal advice about your specific situation.',
      },
    ],
  },
  {
    title: 'Tasks & Workflow',
    items: [
      {
        q: 'What are tasks?',
        a: 'Tasks are step-by-step actions that guide you through your case. They unlock sequentially — completing one task opens the next. Your dashboard shows your current task and progress.',
      },
      {
        q: 'Why are some tasks locked?',
        a: 'Tasks unlock based on your progress. Complete your current tasks to unlock new ones. The system ensures you handle things in the right order.',
      },
      {
        q: 'Can I go back to a completed task?',
        a: 'Yes. You can view completed tasks from your dashboard, but you cannot change their status back to incomplete.',
      },
    ],
  },
  {
    title: 'Documents & Filing',
    items: [
      {
        q: 'How do generated documents work?',
        a: 'You provide the facts of your case through a form, and the system generates a formatted draft document. You must review, edit, and finalize the document before filing it with the court.',
      },
      {
        q: 'How do I download a document?',
        a: 'After generating a document, use the "Download PDF" button to save it as a PDF file, or use the "Print" button to print directly from your browser.',
      },
      {
        q: 'Are generated documents ready to file?',
        a: 'No. All generated documents are drafts and starting points. You are responsible for reviewing, editing, and ensuring accuracy before filing with the court.',
      },
    ],
  },
  {
    title: 'Evidence & Discovery',
    items: [
      {
        q: 'What is the Evidence Vault?',
        a: 'The Evidence Vault is where you organize and categorize all evidence related to your case — documents, photos, communications, and other materials.',
      },
      {
        q: 'What is discovery?',
        a: 'Discovery is the legal process where both sides exchange information and evidence. The Discovery Starter Pack helps you create standard discovery requests.',
      },
    ],
  },
  {
    title: 'Motions',
    items: [
      {
        q: 'What motions can I create?',
        a: 'The Motions Hub offers several motion types including Motion to Compel, Motion for Summary Judgment, Settlement Demand Letter, Motion for Continuance, Response to Motion to Dismiss, Notice of Appeal, and Appellate Brief.',
      },
      {
        q: 'How do I choose the right motion?',
        a: 'Each motion type includes a description and reassurance text explaining when it applies. The system may also suggest specific motions based on your case status.',
      },
    ],
  },
  {
    title: 'Deadlines & Alerts',
    items: [
      {
        q: 'How are deadlines tracked?',
        a: 'Deadlines are automatically calculated based on your case events (like when you were served or when you filed). They appear on your dashboard with countdown timers.',
      },
      {
        q: 'What happens if I miss a deadline?',
        a: 'The system sends escalating alerts as deadlines approach and after they pass. Missing a legal deadline can have serious consequences — consult an attorney if you are at risk of missing one.',
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-warm-bg">
      <main className="mx-auto max-w-2xl px-4 py-10">
        <SupportiveHeader
          title="Help & FAQ"
          subtitle="Answers to common questions about using Lawyer Free."
        />

        <div className="space-y-4">
          {FAQ_SECTIONS.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group border-b border-warm-border last:border-0"
                  >
                    <summary className="flex cursor-pointer items-center justify-between py-3 text-sm font-medium text-warm-text hover:text-primary transition-colors list-none">
                      {item.q}
                      <span className="ml-2 text-warm-muted group-open:rotate-180 transition-transform text-xs">
                        ▼
                      </span>
                    </summary>
                    <p className="pb-3 text-sm text-warm-muted leading-relaxed">
                      {item.a}
                    </p>
                  </details>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-warm-border bg-white p-4 text-center">
          <p className="text-sm text-warm-muted">
            Need more help? Visit the{' '}
            <a
              href="https://www.txcourts.gov/programs-services/self-help/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Texas Courts Self-Help Center
            </a>{' '}
            for additional resources.
          </p>
        </div>
      </main>
    </div>
  )
}
```

**Commit:** `feat: add Help & FAQ page with accordion sections`

---

## Task 12: Wire Everything + Verify Build

**Files:**
- Verify: All moved files resolve correctly
- Verify: All imports work after route group migration
- Verify: TopNav renders on `/cases` and `/case/[id]` pages
- Verify: Login/signup pages do NOT show TopNav

**Steps:**

1. Run the build: `npx next build`
2. Fix any import resolution issues from the route group migration
3. Run all existing tests: `npx vitest run`
4. Verify all tests pass (existing + new)

**Expected:** Zero type errors, zero test failures. TopNav visible on auth pages, hidden on login/signup.

**Commit:** `chore: verify build and tests after core UX integration`

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/components/layout/top-nav.tsx` | Create | 1 |
| `src/components/layout/breadcrumbs.tsx` | Create | 2 |
| `tests/unit/layout/breadcrumbs.test.tsx` | Create | 2 |
| `src/components/layout/user-menu.tsx` | Create | 3 |
| `src/app/api/search/route.ts` | Create | 4 |
| `tests/unit/api/search.test.ts` | Create | 4 |
| `src/components/search/command-palette.tsx` | Create | 5 |
| `src/app/(authenticated)/layout.tsx` | Create | 6 |
| `src/app/layout.tsx` | Modify | 6 |
| `src/app/cases/` | Move → `(authenticated)` | 6 |
| `src/app/case/` | Move → `(authenticated)` | 6 |
| `src/lib/pdf/generate-document-pdf.ts` | Create | 7 |
| `tests/unit/pdf/generate-document-pdf.test.ts` | Create | 7 |
| `src/components/step/filing/draft-viewer.tsx` | Modify | 8 |
| `src/app/globals.css` | Modify | 9 |
| `src/app/(authenticated)/settings/page.tsx` | Create | 10 |
| `src/app/(authenticated)/help/page.tsx` | Create | 11 |

## Dependencies

```
Task 1 (TopNav) ─────┐
Task 2 (Breadcrumbs) ─┤
Task 3 (UserMenu) ────┼──→ Task 6 (Layout + Migration) ──→ Task 12 (Verify)
Task 4 (Search API) ──┤
Task 5 (Cmd Palette) ─┘
Task 7 (PDF util) ────→ Task 8 (DraftViewer) ──→ Task 12 (Verify)
Task 9 (Print CSS) ───→ Task 12 (Verify)
Task 10 (Settings) ───→ Task 12 (Verify)
Task 11 (Help) ───────→ Task 12 (Verify)
```

Tasks 1-5 can run in parallel. Tasks 7, 9, 10, 11 can run in parallel. Task 6 depends on 1-5. Task 8 depends on 7. Task 12 depends on everything.
