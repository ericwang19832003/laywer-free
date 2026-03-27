# Missing Standard Features — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add 5 standard features: in-app notification center, case notes/journal, read-only case sharing, account management enhancements, and welcome checklist onboarding.

**Architecture:** Notifications use a new `notifications` table + bell icon in TopNav. Case notes use a new `case_notes` table + CRUD API + dashboard card. Case sharing adds `share_token`/`share_enabled` to the existing `cases` table + public viewer page. Account management expands the settings page with delete account, data export, and notification preferences. Onboarding stores checklist state in `auth.user_metadata` + dashboard card.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase, Zod, vitest

---

## Task 1: Migration — `notifications` table

**Files:**
- Create: `supabase/migrations/20260302000001_notifications_table.sql`

```sql
-- Notifications table for in-app notification center
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN (
    'deadline_approaching', 'task_unlocked', 'email_sent',
    'email_failed', 'escalation_triggered'
  )),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Service role inserts notifications (from cron/API routes)
CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
```

Run: `npx supabase db push` (or apply migration locally)

---

## Task 2: Migration — `case_notes` table

**Files:**
- Create: `supabase/migrations/20260302000002_case_notes_table.sql`

```sql
-- Case notes / journal for user-authored notes
CREATE TABLE public.case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_case_notes_case_created
  ON public.case_notes (case_id, pinned DESC, created_at DESC);

ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own case notes"
  ON public.case_notes FOR ALL
  USING (user_id = auth.uid());
```

---

## Task 3: Migration — add sharing columns to `cases`

**Files:**
- Create: `supabase/migrations/20260302000003_case_sharing.sql`

```sql
-- Add sharing columns to cases table
ALTER TABLE public.cases
  ADD COLUMN share_token uuid DEFAULT NULL,
  ADD COLUMN share_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX idx_cases_share_token
  ON public.cases (share_token) WHERE share_token IS NOT NULL;

-- Public read policy for shared cases (no auth required)
CREATE POLICY "Anyone can read shared cases by token"
  ON public.cases FOR SELECT
  USING (share_enabled = true AND share_token IS NOT NULL);
```

---

## Task 4: Notifications API — list + mark read

**Files:**
- Create: `src/app/api/notifications/route.ts`
- Create: `src/app/api/notifications/read-all/route.ts`

**`src/app/api/notifications/route.ts`** (GET — list notifications):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(request: NextRequest) {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const url = new URL(request.url)
    const limit = Math.min(Number(url.searchParams.get('limit') ?? 20), 50)
    const unreadOnly = url.searchParams.get('unread') === 'true'

    let query = supabase!
      .from('notifications')
      .select('id, case_id, type, title, body, read, link, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('read', false)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Also get unread count
    const { count } = await supabase!
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user!.id)
      .eq('read', false)

    return NextResponse.json({ notifications: data ?? [], unread_count: count ?? 0 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**`src/app/api/notifications/read-all/route.ts`** (POST — mark all read):
```typescript
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function POST() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { error } = await supabase!
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user!.id)
      .eq('read', false)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Task 5: Notification Bell + Dropdown UI

**Files:**
- Create: `src/components/layout/notification-bell.tsx`
- Modify: `src/components/layout/top-nav.tsx`

**`src/components/layout/notification-bell.tsx`:**
```typescript
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  async function handleMarkAllRead() {
    await fetch('/api/notifications/read-all', { method: 'POST' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="relative inline-flex items-center justify-center rounded-md p-2 text-warm-muted hover:text-warm-text hover:bg-warm-border/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-warm-border bg-white shadow-lg z-50">
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
        </div>
      )}
    </div>
  )
}
```

**Modify `src/components/layout/top-nav.tsx`** — add NotificationBell between search and UserMenu:

Add import:
```typescript
import { NotificationBell } from './notification-bell'
```

In the button row (after the search button, before UserMenu):
```tsx
<NotificationBell />
```

---

## Task 6: Wire notifications into escalation cron

**Files:**
- Modify: `src/app/api/cron/escalation/route.ts`

After the existing code that inserts escalations into `reminder_escalations`, add notification inserts. After the line that inserts escalations, add:

```typescript
// Insert in-app notifications for each triggered escalation
if (actions.length > 0) {
  // Get user_ids for each case
  const caseIds = [...new Set(actions.map(a => a.case_id))]
  const { data: caseUsers } = await adminSupabase
    .from('cases')
    .select('id, user_id')
    .in('id', caseIds)

  const userMap = new Map((caseUsers ?? []).map(c => [c.id, c.user_id]))

  const notificationRows = actions
    .map(a => {
      const userId = userMap.get(a.case_id)
      if (!userId) return null
      return {
        user_id: userId,
        case_id: a.case_id,
        type: 'escalation_triggered' as const,
        title: a.escalation_level >= 3 ? 'Urgent Deadline Alert' : 'Deadline Reminder',
        body: a.message,
        link: `/case/${a.case_id}/deadlines`,
      }
    })
    .filter(Boolean)

  if (notificationRows.length > 0) {
    await adminSupabase.from('notifications').insert(notificationRows)
  }
}
```

---

## Task 7: Case Notes — CRUD API

**Files:**
- Create: `src/app/api/cases/[id]/notes/route.ts`
- Create: `src/app/api/cases/[id]/notes/[noteId]/route.ts`

**`src/app/api/cases/[id]/notes/route.ts`** (GET list + POST create):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  pinned: z.boolean().optional().default(false),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    // Verify case ownership (RLS)
    const { data: caseRow, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { data: notes, error } = await supabase!
      .from('case_notes')
      .select('id, content, pinned, created_at, updated_at')
      .eq('case_id', caseId)
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ notes: notes ?? [] })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = createNoteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    // Verify case ownership
    const { data: caseRow, error: caseError } = await supabase!
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single()

    if (caseError || !caseRow) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    const { data: note, error: insertError } = await supabase!
      .from('case_notes')
      .insert({
        case_id: caseId,
        user_id: user!.id,
        content: parsed.data.content,
        pinned: parsed.data.pinned,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Write timeline event
    await supabase!.from('task_events').insert({
      case_id: caseId,
      kind: 'note_added',
      payload: { note_id: note.id },
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**`src/app/api/cases/[id]/notes/[noteId]/route.ts`** (PATCH update + DELETE):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

const updateNoteSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  pinned: z.boolean().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: caseId, noteId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const parsed = updateNoteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.issues },
        { status: 422 }
      )
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (parsed.data.content !== undefined) updates.content = parsed.data.content
    if (parsed.data.pinned !== undefined) updates.pinned = parsed.data.pinned

    const { data: note, error } = await supabase!
      .from('case_notes')
      .update(updates)
      .eq('id', noteId)
      .eq('case_id', caseId)
      .select()
      .single()

    if (error || !note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const { id: caseId, noteId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { error } = await supabase!
      .from('case_notes')
      .delete()
      .eq('id', noteId)
      .eq('case_id', caseId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Task 8: Case Notes — Dashboard Card UI

**Files:**
- Create: `src/components/dashboard/notes-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**`src/components/dashboard/notes-card.tsx`:**
```typescript
'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { PlusIcon, PinIcon, Trash2Icon, Loader2Icon } from 'lucide-react'
import { toast } from 'sonner'

interface Note {
  id: string
  content: string
  pinned: boolean
  created_at: string
  updated_at: string
}

interface NotesCardProps {
  caseId: string
  initialNotes: Note[]
}

function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export function NotesCard({ caseId, initialNotes }: NotesCardProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newContent, setNewContent] = useState('')
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleAdd() {
    if (!newContent.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim() }),
      })
      if (!res.ok) throw new Error('Failed to add note')
      const { note } = await res.json()
      setNotes((prev) => [note, ...prev])
      setNewContent('')
      setShowForm(false)
    } catch {
      toast.error('Failed to add note')
    } finally {
      setAdding(false)
    }
  }

  async function handleTogglePin(noteId: string, currentPinned: boolean) {
    const res = await fetch(`/api/cases/${caseId}/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !currentPinned }),
    })
    if (res.ok) {
      setNotes((prev) =>
        prev
          .map((n) => (n.id === noteId ? { ...n, pinned: !currentPinned } : n))
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          })
      )
    }
  }

  async function handleDelete(noteId: string) {
    const res = await fetch(`/api/cases/${caseId}/notes/${noteId}`, { method: 'DELETE' })
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== noteId))
    } else {
      toast.error('Failed to delete note')
    }
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-warm-text">Notes</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="h-auto px-2 py-1 text-xs"
          >
            <PlusIcon className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        {showForm && (
          <div className="mb-4 space-y-2">
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write a note..."
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={adding || !newContent.trim()}>
                {adding ? <Loader2Icon className="mr-1 h-3 w-3 animate-spin" /> : null}
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setNewContent('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 ? (
          <p className="text-sm text-warm-muted py-4 text-center">
            No notes yet. Add one to keep track of important details.
          </p>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 5).map((note) => (
              <div
                key={note.id}
                className={`group rounded-md border px-3 py-2.5 ${
                  note.pinned ? 'border-calm-indigo/20 bg-calm-indigo/5' : 'border-warm-border'
                }`}
              >
                <p className="text-sm text-warm-text whitespace-pre-wrap">{note.content}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-xs text-warm-muted">{relativeDate(note.created_at)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleTogglePin(note.id, note.pinned)}
                      className={`p-1 rounded hover:bg-warm-border/50 ${
                        note.pinned ? 'text-calm-indigo' : 'text-warm-muted'
                      }`}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      <PinIcon className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded text-warm-muted hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2Icon className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {notes.length > 5 && (
              <p className="text-xs text-warm-muted text-center pt-1">
                +{notes.length - 5} more notes
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Modify `src/app/(authenticated)/case/[id]/page.tsx`:**

Add import:
```typescript
import { NotesCard } from '@/components/dashboard/notes-card'
```

Add data fetch (in the server component, after existing queries):
```typescript
const { data: caseNotes } = await supabase
  .from('case_notes')
  .select('id, content, pinned, created_at, updated_at')
  .eq('case_id', id)
  .order('pinned', { ascending: false })
  .order('created_at', { ascending: false })
  .limit(10)
```

Add component between ProgressCard and TimelineCard:
```tsx
<NotesCard caseId={id} initialNotes={caseNotes ?? []} />
```

---

## Task 9: Case Sharing — API routes

**Files:**
- Create: `src/app/api/cases/[id]/share/route.ts`

**`src/app/api/cases/[id]/share/route.ts`** (POST toggle share, GET status):
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { randomUUID } from 'crypto'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { data, error } = await supabase!
      .from('cases')
      .select('share_token, share_enabled')
      .eq('id', caseId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    return NextResponse.json({
      share_enabled: data.share_enabled,
      share_token: data.share_enabled ? data.share_token : null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    const enabled = Boolean(body.enabled)

    // If enabling, generate token if none exists
    let updates: Record<string, unknown> = { share_enabled: enabled }

    if (enabled) {
      const { data: existing } = await supabase!
        .from('cases')
        .select('share_token')
        .eq('id', caseId)
        .single()

      if (!existing?.share_token) {
        updates.share_token = randomUUID()
      }
    }

    const { data, error } = await supabase!
      .from('cases')
      .update(updates)
      .eq('id', caseId)
      .select('share_token, share_enabled')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update sharing' }, { status: 500 })
    }

    return NextResponse.json({
      share_enabled: data.share_enabled,
      share_token: data.share_enabled ? data.share_token : null,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## Task 10: Case Sharing — Public Viewer Page

**Files:**
- Create: `src/app/shared/[token]/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export default async function SharedCasePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = await createClient()

  // Fetch shared case by token (public RLS policy allows this)
  const { data: caseRow, error } = await supabase
    .from('cases')
    .select('id, county, court_type, role, dispute_type, status, created_at, share_enabled')
    .eq('share_token', token)
    .eq('share_enabled', true)
    .single()

  if (error || !caseRow) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-sm font-medium text-warm-text">Link not available</p>
            <p className="text-xs text-warm-muted mt-2">
              This shared link is no longer active or doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch limited public data
  const [deadlinesResult, timelineResult] = await Promise.all([
    supabase
      .from('deadlines')
      .select('key, due_at, source')
      .eq('case_id', caseRow.id)
      .order('due_at', { ascending: true })
      .limit(10),
    supabase
      .from('task_events')
      .select('kind, payload, created_at')
      .eq('case_id', caseRow.id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const deadlines = deadlinesResult.data ?? []
  const events = timelineResult.data ?? []

  const courtLabels: Record<string, string> = {
    jp: 'Justice Court',
    county: 'County Court',
    district: 'District Court',
    unknown: 'Court TBD',
  }

  return (
    <div className="min-h-screen bg-warm-bg">
      <nav className="w-full border-b border-warm-border bg-warm-bg/95 px-4 py-3">
        <p className="text-sm font-semibold text-warm-text text-center">Lawyer Free — Shared Case View</p>
      </nav>
      <main className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div>
          <p className="text-xs text-warm-muted uppercase tracking-wide">Read-only view</p>
          <h1 className="text-lg font-semibold text-warm-text mt-1">
            {caseRow.dispute_type ?? 'Legal Case'} — {caseRow.county ? `${caseRow.county} County` : 'County TBD'}
          </h1>
          <p className="text-sm text-warm-muted mt-1">
            {courtLabels[caseRow.court_type] ?? 'Court TBD'} · {caseRow.role === 'plaintiff' ? 'Plaintiff' : 'Defendant'} · Created {new Date(caseRow.created_at).toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardContent className="pt-5 pb-4">
            <h2 className="text-sm font-semibold text-warm-text mb-3">Deadlines</h2>
            {deadlines.length === 0 ? (
              <p className="text-sm text-warm-muted">No deadlines set.</p>
            ) : (
              <div className="space-y-2">
                {deadlines.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-warm-text">{d.key.replace(/_/g, ' ')}</span>
                    <span className="text-warm-muted">{new Date(d.due_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <h2 className="text-sm font-semibold text-warm-text mb-3">Recent Activity</h2>
            {events.length === 0 ? (
              <p className="text-sm text-warm-muted">No activity yet.</p>
            ) : (
              <div className="space-y-2">
                {events.map((e, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-warm-text">{e.kind.replace(/_/g, ' ')}</span>
                    <span className="text-warm-muted">{new Date(e.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-warm-muted text-center">
          This is a read-only view. Lawyer Free does not provide legal advice.
        </p>
      </main>
    </div>
  )
}
```

**Modify `src/middleware.ts`** — exclude `/shared` from auth check:

Add `/shared` to the public routes check. The middleware currently skips `/login`, `/signup`, and `/api`. Add `pathname.startsWith('/shared')` to the same check.

---

## Task 11: Case Sharing — Share Button on Dashboard

**Files:**
- Create: `src/components/dashboard/share-case-card.tsx`
- Modify: `src/app/(authenticated)/case/[id]/page.tsx`

**`src/components/dashboard/share-case-card.tsx`:**
```typescript
'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Share2Icon, CopyIcon, CheckIcon } from 'lucide-react'
import { toast } from 'sonner'

interface ShareCaseCardProps {
  caseId: string
  initialEnabled: boolean
  initialToken: string | null
}

export function ShareCaseCard({ caseId, initialEnabled, initialToken }: ShareCaseCardProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [token, setToken] = useState(initialToken)
  const [toggling, setToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = token ? `${typeof window !== 'undefined' ? window.location.origin : ''}/shared/${token}` : ''

  async function handleToggle() {
    setToggling(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !enabled }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setEnabled(data.share_enabled)
      setToken(data.share_token)
      toast.success(data.share_enabled ? 'Share link enabled' : 'Share link disabled')
    } catch {
      toast.error('Failed to update sharing')
    } finally {
      setToggling(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-warm-text">Share Case</h3>
          <Button
            variant={enabled ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggle}
            disabled={toggling}
            className="h-auto px-3 py-1.5 text-xs"
          >
            <Share2Icon className="mr-1.5 h-3 w-3" />
            {enabled ? 'Disable Link' : 'Enable Link'}
          </Button>
        </div>
        <p className="text-xs text-warm-muted mb-3">
          {enabled
            ? 'Anyone with this link can view basic case info (deadlines, status). No documents or evidence are shared.'
            : 'Generate a read-only link to share basic case info with a family member or advisor.'}
        </p>
        {enabled && token && (
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="text-xs bg-warm-bg" />
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

**Modify `src/app/(authenticated)/case/[id]/page.tsx`:**

Add import:
```typescript
import { ShareCaseCard } from '@/components/dashboard/share-case-card'
```

Add data fetch (after existing queries):
```typescript
const { data: shareData } = await supabase
  .from('cases')
  .select('share_token, share_enabled')
  .eq('id', id)
  .single()
```

Add component after TimelineCard:
```tsx
<ShareCaseCard
  caseId={id}
  initialEnabled={shareData?.share_enabled ?? false}
  initialToken={shareData?.share_token ?? null}
/>
```

---

## Task 12: Account Management — Delete + Export + Preferences

**Files:**
- Modify: `src/app/(authenticated)/settings/page.tsx`
- Create: `src/app/api/account/export/route.ts`
- Create: `src/app/api/account/delete/route.ts`

**`src/app/api/account/export/route.ts`:**
```typescript
import { NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET() {
  try {
    const { supabase, user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const userId = user!.id

    // Fetch all user data in parallel
    const [cases, tasks, deadlines, events, notes, documents, communications] = await Promise.all([
      supabase!.from('cases').select('*').eq('user_id', userId),
      supabase!.from('tasks').select('*').in('case_id',
        supabase!.from('cases').select('id').eq('user_id', userId)
      ),
      supabase!.from('deadlines').select('*').in('case_id',
        supabase!.from('cases').select('id').eq('user_id', userId)
      ),
      supabase!.from('task_events').select('*').in('case_id',
        supabase!.from('cases').select('id').eq('user_id', userId)
      ),
      supabase!.from('case_notes').select('*').eq('user_id', userId),
      supabase!.from('court_documents').select('id, case_id, file_name, doc_type, created_at').in('case_id',
        supabase!.from('cases').select('id').eq('user_id', userId)
      ),
      supabase!.from('communications').select('*').in('case_id',
        supabase!.from('cases').select('id').eq('user_id', userId)
      ),
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      user: { id: userId, email: user!.email },
      cases: cases.data ?? [],
      tasks: tasks.data ?? [],
      deadlines: deadlines.data ?? [],
      events: events.data ?? [],
      notes: notes.data ?? [],
      documents: documents.data ?? [],
      communications: communications.data ?? [],
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lawyer-free-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**`src/app/api/account/delete/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const body = await request.json()
    if (body.confirmation !== 'DELETE') {
      return NextResponse.json(
        { error: 'Must confirm with "DELETE"' },
        { status: 422 }
      )
    }

    // Use admin client to delete user (cascades to all data via FK constraints)
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.auth.admin.deleteUser(user!.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Modify `src/app/(authenticated)/settings/page.tsx`** — add three new sections after the existing Account card:

1. **Notification Preferences card** — toggles for each notification type, stored in user_metadata
2. **Data Export card** — button that triggers download from `/api/account/export`
3. **Delete Account card** — red danger zone with confirmation dialog

Add these new sections:
```tsx
{/* Notification Preferences */}
<Card>
  <CardHeader>
    <CardTitle className="text-base">Notification Preferences</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    {(['deadline_approaching', 'task_unlocked', 'escalation_triggered'] as const).map((type) => (
      <label key={type} className="flex items-center justify-between">
        <span className="text-sm text-warm-text">
          {type === 'deadline_approaching' ? 'Deadline reminders' :
           type === 'task_unlocked' ? 'Task unlocked' :
           'Escalation alerts'}
        </span>
        <input
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-warm-border"
          onChange={async (e) => {
            // Store in user_metadata
            const prefs = { ...notificationPrefs, [type]: e.target.checked }
            setNotificationPrefs(prefs)
            await getSupabase().auth.updateUser({ data: { notification_prefs: prefs } })
          }}
        />
      </label>
    ))}
    <p className="text-xs text-warm-muted">Controls which in-app notifications you receive.</p>
  </CardContent>
</Card>

{/* Data Export */}
<Card>
  <CardHeader>
    <CardTitle className="text-base">Your Data</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-warm-muted mb-3">
      Download all your case data as a JSON file. This includes cases, tasks, deadlines, notes, and activity history.
    </p>
    <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
      {exporting ? 'Preparing...' : 'Export My Data'}
    </Button>
  </CardContent>
</Card>

{/* Danger Zone */}
<Card className="border-red-200">
  <CardHeader>
    <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <p className="text-sm text-warm-muted">
      Permanently delete your account and all associated data. This cannot be undone.
    </p>
    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setShowDeleteDialog(true)}>
      Delete Account
    </Button>
  </CardContent>
</Card>
```

Add the delete confirmation dialog and necessary state/handlers. The dialog requires typing "DELETE" to confirm.

---

## Task 13: Onboarding — Welcome Checklist Component

**Files:**
- Create: `src/components/dashboard/onboarding-checklist.tsx`
- Modify: `src/app/(authenticated)/cases/page.tsx`

**`src/components/dashboard/onboarding-checklist.tsx`:**
```typescript
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2Icon, CircleIcon, XIcon } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ChecklistItem {
  key: string
  label: string
  href: string
  completed: boolean
}

interface OnboardingChecklistProps {
  items: ChecklistItem[]
  dismissed: boolean
}

export function OnboardingChecklist({ items: initialItems, dismissed: initialDismissed }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(initialDismissed)
  const [items] = useState(initialItems)

  if (dismissed) return null

  const completedCount = items.filter((i) => i.completed).length
  if (completedCount === items.length) return null

  async function handleDismiss() {
    setDismissed(true)
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: { onboarding: { dismissed: true } },
    })
  }

  return (
    <Card className="border-calm-indigo/20 bg-calm-indigo/5 mb-6">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-warm-text">Getting Started</h3>
            <p className="text-xs text-warm-muted mt-0.5">
              {completedCount} of {items.length} complete
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded text-warm-muted hover:text-warm-text hover:bg-warm-border/50"
            aria-label="Dismiss checklist"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                item.completed
                  ? 'text-warm-muted'
                  : 'text-warm-text hover:bg-white/60'
              }`}
            >
              {item.completed ? (
                <CheckCircle2Icon className="h-4 w-4 text-calm-green shrink-0" />
              ) : (
                <CircleIcon className="h-4 w-4 text-warm-muted shrink-0" />
              )}
              <span className={item.completed ? 'line-through' : ''}>{item.label}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

**Modify `src/app/(authenticated)/cases/page.tsx`:**

Add import:
```typescript
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist'
```

Add data fetch (in the server component, after the cases query):
```typescript
const { data: { user } } = await supabase.auth.getUser()
const onboarding = (user?.user_metadata?.onboarding as { dismissed?: boolean } | undefined) ?? {}
const isDismissed = onboarding.dismissed === true

// Auto-detect completed steps
const hasCase = hasCases
const hasDocument = hasCases ? (await supabase
  .from('court_documents')
  .select('id', { count: 'exact', head: true })
  .in('case_id', (cases ?? []).map(c => c.id))
).count ?? 0 > 0 : false

const hasProfile = Boolean(user?.user_metadata?.display_name)

const checklistItems = [
  { key: 'create_case', label: 'Create your first case', href: '#new-case', completed: hasCase },
  { key: 'upload_document', label: 'Upload a document', href: hasCases ? `/case/${cases![0].id}` : '/cases', completed: hasDocument },
  { key: 'explore_evidence', label: 'Explore the evidence vault', href: hasCases ? `/case/${cases![0].id}/evidence` : '/cases', completed: false },
  { key: 'review_deadlines', label: 'Review your deadlines', href: hasCases ? `/case/${cases![0].id}/deadlines` : '/cases', completed: false },
  { key: 'setup_profile', label: 'Set up your profile', href: '/settings', completed: hasProfile },
]
```

Add component before the cases list:
```tsx
<OnboardingChecklist items={checklistItems} dismissed={isDismissed} />
```

---

## Task 14: Build & Test Verification

1. Run all existing tests: `npx vitest run` — expect all passing
2. Run build: `npx next build` — expect no type errors
3. Verify middleware allows `/shared` routes without auth
4. Verify notification bell appears in TopNav
5. Verify onboarding checklist appears on cases page for users without cases

---

## File Summary

| File | Action | Feature |
|------|--------|---------|
| `supabase/migrations/20260302000001_notifications_table.sql` | Create | Notifications |
| `supabase/migrations/20260302000002_case_notes_table.sql` | Create | Case Notes |
| `supabase/migrations/20260302000003_case_sharing.sql` | Create | Sharing |
| `src/app/api/notifications/route.ts` | Create | Notifications |
| `src/app/api/notifications/read-all/route.ts` | Create | Notifications |
| `src/components/layout/notification-bell.tsx` | Create | Notifications |
| `src/components/layout/top-nav.tsx` | Modify | Notifications |
| `src/app/api/cron/escalation/route.ts` | Modify | Notifications |
| `src/app/api/cases/[id]/notes/route.ts` | Create | Case Notes |
| `src/app/api/cases/[id]/notes/[noteId]/route.ts` | Create | Case Notes |
| `src/components/dashboard/notes-card.tsx` | Create | Case Notes |
| `src/app/(authenticated)/case/[id]/page.tsx` | Modify | Notes + Sharing |
| `src/app/api/cases/[id]/share/route.ts` | Create | Sharing |
| `src/app/shared/[token]/page.tsx` | Create | Sharing |
| `src/components/dashboard/share-case-card.tsx` | Create | Sharing |
| `src/middleware.ts` | Modify | Sharing |
| `src/app/api/account/export/route.ts` | Create | Account |
| `src/app/api/account/delete/route.ts` | Create | Account |
| `src/app/(authenticated)/settings/page.tsx` | Modify | Account |
| `src/components/dashboard/onboarding-checklist.tsx` | Create | Onboarding |
| `src/app/(authenticated)/cases/page.tsx` | Modify | Onboarding |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Notification for deleted case | case_id is nullable; UI skips link if case gone |
| Share link accessed after disabled | Public page shows "Link not available" |
| Account delete with active cases | Confirmation requires typing "DELETE"; FK cascades handle cleanup |
| Data export with large dataset | JSON response with Content-Disposition header triggers download |
| Onboarding dismissed | Stored in user_metadata; never shown again |
| No notifications | Bell shows no badge; dropdown shows empty state |
| Note content > 5000 chars | Zod validation rejects at API level |
| Multiple rapid mark-all-read clicks | Idempotent UPDATE query; no side effects |
