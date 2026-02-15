# TurboTax Case Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a TurboTax-style Case Dashboard for Texas pro se litigation — Dashboard + Tasks + Timeline + Deadlines backbone.

**Architecture:** Next.js 15 App Router with route handlers calling Supabase via `@supabase/ssr`. All data access goes through Supabase RLS. Auth is email/password via Supabase Auth. UI uses Tailwind + shadcn/ui with warm, calming tone.

**Tech Stack:** Next.js 15, TypeScript, Supabase (Postgres, Auth), Tailwind CSS, shadcn/ui, Zod, Vitest, Playwright

**Working directory:** `/Users/minwang/lawyer free`

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Next.js project

**Step 1: Create Next.js app**

```bash
cd "/Users/minwang/lawyer free"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the Next.js 15 project with App Router and Tailwind.

**Step 2: Install core dependencies**

```bash
cd "/Users/minwang/lawyer free"
npm install @supabase/supabase-js @supabase/ssr zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add -A
git commit -m "feat: initialize Next.js 15 project with core dependencies"
```

---

### Task 2: Initialize Supabase local dev

**Step 1: Initialize Supabase**

```bash
cd "/Users/minwang/lawyer free"
npx supabase init
```

This creates `supabase/` directory with `config.toml`.

**Step 2: Create `.env.local.example`**

Create: `"/Users/minwang/lawyer free/.env.local.example"`

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<from supabase start output>
```

**Step 3: Create `.env.local`** with same values (will be populated after `supabase start`).

**Step 4: Add `.env.local` to `.gitignore`** (should already be there from Next.js, verify).

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/ .env.local.example .gitignore
git commit -m "feat: initialize Supabase local dev environment"
```

---

### Task 3: Set up shadcn/ui

**Step 1: Initialize shadcn/ui**

```bash
cd "/Users/minwang/lawyer free"
npx shadcn@latest init
```

Choose: New York style, Slate base color, CSS variables: yes.

**Step 2: Add required components**

```bash
cd "/Users/minwang/lawyer free"
npx shadcn@latest add button card input label select textarea badge skeleton separator progress dropdown-menu dialog form
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add -A
git commit -m "feat: add shadcn/ui with core components"
```

---

### Task 4: Configure Vitest

**Step 1: Create vitest config**

Create: `"/Users/minwang/lawyer free/vitest.config.ts"`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**Step 2: Create test setup file**

Create: `"/Users/minwang/lawyer free/tests/setup.ts"`

```typescript
import '@testing-library/jest-dom'
```

**Step 3: Add test script to package.json**

In `package.json`, add to "scripts":

```json
"test": "vitest",
"test:unit": "vitest run",
"test:e2e": "playwright test"
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add vitest.config.ts tests/setup.ts package.json
git commit -m "feat: configure Vitest for unit testing"
```

---

## Phase 2: Supabase Schema & Migrations

### Task 5: Create backbone tables migration

**Step 1: Create migration file**

```bash
cd "/Users/minwang/lawyer free"
npx supabase migration new backbone_tables
```

This creates `supabase/migrations/<timestamp>_backbone_tables.sql`.

**Step 2: Write the migration SQL**

Edit the generated migration file with:

```sql
-- ============================================
-- BACKBONE TABLES for TurboTax Case Dashboard
-- ============================================

-- 1) cases
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  jurisdiction text DEFAULT 'TX',
  county text,
  court_type text CHECK (court_type IN ('jp', 'county', 'district', 'unknown')) DEFAULT 'unknown',
  role text CHECK (role IN ('plaintiff', 'defendant')) NOT NULL,
  dispute_type text,
  status text CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- 2) tasks
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  task_key text NOT NULL,
  title text NOT NULL,
  status text CHECK (status IN ('locked', 'todo', 'in_progress', 'needs_review', 'completed', 'skipped')) DEFAULT 'locked',
  due_at timestamptz,
  unlocked_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3) task_events (timeline)
CREATE TABLE public.task_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  kind text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 4) deadlines
CREATE TABLE public.deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  key text NOT NULL,
  due_at timestamptz NOT NULL,
  source text CHECK (source IN ('system', 'user_confirmed', 'court_notice')) DEFAULT 'system',
  rationale text,
  created_at timestamptz DEFAULT now()
);

-- 5) reminders
CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE NOT NULL,
  deadline_id uuid REFERENCES public.deadlines(id) ON DELETE CASCADE NOT NULL,
  channel text CHECK (channel IN ('email', 'push')) DEFAULT 'email',
  send_at timestamptz NOT NULL,
  status text CHECK (status IN ('scheduled', 'sent', 'skipped', 'failed')) DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_cases_user_created ON public.cases (user_id, created_at DESC);
CREATE INDEX idx_tasks_case_status_due ON public.tasks (case_id, status, due_at);
CREATE INDEX idx_task_events_case_created ON public.task_events (case_id, created_at DESC);
CREATE INDEX idx_deadlines_case_due ON public.deadlines (case_id, due_at);
CREATE INDEX idx_reminders_status_send ON public.reminders (status, send_at);

-- ============================================
-- RLS
-- ============================================

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- cases: direct user_id check
CREATE POLICY "Users can view own cases"
  ON public.cases FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cases"
  ON public.cases FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cases"
  ON public.cases FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- tasks: join through cases
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = tasks.case_id AND cases.user_id = auth.uid()
  ));

-- task_events: join through cases
CREATE POLICY "Users can view own events"
  ON public.task_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = task_events.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own events"
  ON public.task_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = task_events.case_id AND cases.user_id = auth.uid()
  ));

-- deadlines: join through cases
CREATE POLICY "Users can view own deadlines"
  ON public.deadlines FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = deadlines.case_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own deadlines"
  ON public.deadlines FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases WHERE cases.id = deadlines.case_id AND cases.user_id = auth.uid()
  ));

-- reminders: join through cases
CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cases
    JOIN public.deadlines ON deadlines.case_id = cases.id
    WHERE deadlines.id = reminders.deadline_id AND cases.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cases
    JOIN public.deadlines ON deadlines.case_id = cases.id
    WHERE deadlines.id = reminders.deadline_id AND cases.user_id = auth.uid()
  ));
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/
git commit -m "feat: add backbone tables with RLS policies and indexes"
```

---

### Task 6: Create dashboard function migration

**Step 1: Create migration**

```bash
cd "/Users/minwang/lawyer free"
npx supabase migration new dashboard_function
```

**Step 2: Write the function SQL**

```sql
-- ============================================
-- get_case_dashboard(p_case_id uuid)
-- Returns JSON with: next_task, tasks_summary, upcoming_deadlines, recent_events
-- ============================================

CREATE OR REPLACE FUNCTION public.get_case_dashboard(p_case_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
  v_next_task jsonb;
  v_tasks_summary jsonb;
  v_upcoming_deadlines jsonb;
  v_recent_events jsonb;
BEGIN
  -- Verify ownership
  SELECT user_id INTO v_user_id
  FROM public.cases
  WHERE id = p_case_id;

  IF v_user_id IS NULL OR v_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;

  -- Next task: earliest unlocked todo/in_progress/needs_review
  SELECT to_jsonb(t) INTO v_next_task
  FROM (
    SELECT id, task_key, title, status, due_at, unlocked_at, metadata
    FROM public.tasks
    WHERE case_id = p_case_id
      AND status IN ('todo', 'in_progress', 'needs_review')
    ORDER BY created_at ASC
    LIMIT 1
  ) t;

  -- Tasks summary: counts by status
  SELECT jsonb_object_agg(status, cnt) INTO v_tasks_summary
  FROM (
    SELECT status, count(*)::int AS cnt
    FROM public.tasks
    WHERE case_id = p_case_id
    GROUP BY status
  ) s;

  -- Upcoming deadlines: next 14 days
  SELECT COALESCE(jsonb_agg(d ORDER BY d.due_at), '[]'::jsonb) INTO v_upcoming_deadlines
  FROM (
    SELECT id, key, due_at, source, rationale
    FROM public.deadlines
    WHERE case_id = p_case_id
      AND due_at >= now()
      AND due_at <= now() + interval '14 days'
    ORDER BY due_at ASC
    LIMIT 5
  ) d;

  -- Recent events: last 15
  SELECT COALESCE(jsonb_agg(e ORDER BY e.created_at DESC), '[]'::jsonb) INTO v_recent_events
  FROM (
    SELECT te.id, te.task_id, te.kind, te.payload, te.created_at,
           t.title AS task_title
    FROM public.task_events te
    LEFT JOIN public.tasks t ON t.id = te.task_id
    WHERE te.case_id = p_case_id
    ORDER BY te.created_at DESC
    LIMIT 15
  ) e;

  v_result := jsonb_build_object(
    'next_task', COALESCE(v_next_task, 'null'::jsonb),
    'tasks_summary', COALESCE(v_tasks_summary, '{}'::jsonb),
    'upcoming_deadlines', v_upcoming_deadlines,
    'recent_events', v_recent_events
  );

  RETURN v_result;
END;
$$;
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/
git commit -m "feat: add get_case_dashboard Postgres function"
```

---

### Task 7: Create seed trigger migration

**Step 1: Create migration**

```bash
cd "/Users/minwang/lawyer free"
npx supabase migration new seed_trigger
```

**Step 2: Write the trigger SQL**

```sql
-- ============================================
-- Auto-seed tasks when a case is created
-- Texas Civil Generic V1 (Backbone)
-- ============================================

CREATE OR REPLACE FUNCTION public.seed_case_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Welcome task: unlocked immediately
  INSERT INTO public.tasks (case_id, task_key, title, status, unlocked_at)
  VALUES (NEW.id, 'welcome', 'Welcome — Get Started', 'todo', now());

  -- Intake task: locked until welcome is completed
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'intake', 'Tell Us About Your Case', 'locked');

  -- Evidence vault: locked
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'evidence_vault', 'Organize Your Evidence', 'locked');

  -- Preservation letter: locked
  INSERT INTO public.tasks (case_id, task_key, title, status)
  VALUES (NEW.id, 'preservation_letter', 'Draft a Preservation Letter', 'locked');

  -- Write a timeline event for case creation
  INSERT INTO public.task_events (case_id, kind, payload)
  VALUES (NEW.id, 'case_created', jsonb_build_object(
    'role', NEW.role,
    'county', NEW.county,
    'court_type', NEW.court_type
  ));

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_seed_case_tasks
  AFTER INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_case_tasks();

-- ============================================
-- Unlock next task when welcome is completed
-- ============================================

CREATE OR REPLACE FUNCTION public.unlock_next_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- When welcome is completed, unlock intake
  IF NEW.task_key = 'welcome' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key = 'intake'
      AND status = 'locked';

    -- Write timeline event
    INSERT INTO public.task_events (case_id, task_id, kind, payload)
    VALUES (NEW.case_id, (
      SELECT id FROM public.tasks WHERE case_id = NEW.case_id AND task_key = 'intake'
    ), 'task_unlocked', jsonb_build_object('task_key', 'intake'));
  END IF;

  -- When intake is completed, unlock evidence_vault
  IF NEW.task_key = 'intake' AND NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.tasks
    SET status = 'todo', unlocked_at = now()
    WHERE case_id = NEW.case_id
      AND task_key = 'evidence_vault'
      AND status = 'locked';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_unlock_next_task
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.unlock_next_task();
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/migrations/
git commit -m "feat: add task seed trigger and unlock chain"
```

---

### Task 8: Create seed data

**Step 1: Write seed.sql**

Create: `"/Users/minwang/lawyer free/supabase/seed.sql"`

```sql
-- Seed data is only used for local development.
-- Test users are created via Supabase Auth API during testing.
-- This file intentionally left minimal — the trigger handles task creation.
```

**Step 2: Verify migrations run cleanly**

```bash
cd "/Users/minwang/lawyer free"
npx supabase start
npx supabase db reset
```

Expected: all migrations apply without errors.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add supabase/seed.sql
git commit -m "feat: add seed.sql placeholder"
```

---

## Phase 3: Supabase Client Setup & Auth

### Task 9: Create Supabase client utilities

**Step 1: Create browser client**

Create: `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client**

Create: `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — ignore
          }
        },
      },
    }
  )
}
```

**Step 3: Create middleware for auth refresh**

Create: `src/middleware.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login (except auth pages)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/supabase/ src/middleware.ts
git commit -m "feat: add Supabase client utilities and auth middleware"
```

---

### Task 10: Create auth pages (login + signup)

**Step 1: Create login page**

Create: `src/app/login/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/cases')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-bg px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold text-warm-text">Welcome back</CardTitle>
          <CardDescription className="text-warm-muted">
            Sign in to continue managing your case.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-amber-600">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-warm-muted">
            New here?{' '}
            <Link href="/signup" className="text-primary underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 2: Create signup page**

Create: `src/app/signup/page.tsx`

Same pattern as login but calls `supabase.auth.signUp({ email, password })`. Title: "Let's get started", description: "Create your free account. No credit card needed."

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/login/ src/app/signup/
git commit -m "feat: add login and signup pages with warm UX"
```

---

## Phase 4: Zod Schemas & Types

### Task 11: Create Zod validation schemas

**Step 1: Create case schema**

Create: `src/lib/schemas/case.ts`

```typescript
import { z } from 'zod'

export const createCaseSchema = z.object({
  role: z.enum(['plaintiff', 'defendant']),
  county: z.string().optional(),
  court_type: z.enum(['jp', 'county', 'district', 'unknown']).optional().default('unknown'),
  dispute_type: z.string().optional(),
})

export type CreateCaseInput = z.infer<typeof createCaseSchema>
```

**Step 2: Create task schema**

Create: `src/lib/schemas/task.ts`

```typescript
import { z } from 'zod'

export const updateTaskSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'needs_review', 'completed', 'skipped']),
  metadata: z.record(z.unknown()).optional(),
})

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// Valid status transitions
export const VALID_TRANSITIONS: Record<string, string[]> = {
  locked: [],  // cannot transition from locked via API (only trigger)
  todo: ['in_progress', 'skipped'],
  in_progress: ['needs_review', 'completed', 'skipped'],
  needs_review: ['completed', 'in_progress'],
  completed: [],  // terminal
  skipped: ['todo'],  // can un-skip
}
```

**Step 3: Create deadline schema**

Create: `src/lib/schemas/deadline.ts`

```typescript
import { z } from 'zod'

export const createDeadlineSchema = z.object({
  key: z.string().min(1),
  due_at: z.string().datetime(),
  source: z.enum(['system', 'user_confirmed', 'court_notice']).optional().default('user_confirmed'),
  rationale: z.string().optional(),
})

export type CreateDeadlineInput = z.infer<typeof createDeadlineSchema>
```

**Step 4: Create event schema**

Create: `src/lib/schemas/event.ts`

```typescript
import { z } from 'zod'

export const createEventSchema = z.object({
  kind: z.string().min(1),
  payload: z.record(z.unknown()).optional().default({}),
  task_id: z.string().uuid().optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
```

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/schemas/
git commit -m "feat: add Zod validation schemas for cases, tasks, deadlines, events"
```

---

## Phase 5: API Route Handlers

### Task 12: Create helper for authenticated route handlers

**Step 1: Create auth helper**

Create: `src/lib/supabase/route-handler.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function getAuthenticatedClient() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignore
          }
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase: null, user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { supabase, user, error: null }
}
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/supabase/route-handler.ts
git commit -m "feat: add authenticated route handler helper"
```

---

### Task 13: Cases API routes (POST + GET)

**Step 1: Create cases route handler**

Create: `src/app/api/cases/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createCaseSchema } from '@/lib/schemas/case'

export async function POST(request: NextRequest) {
  const { supabase, user, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const body = await request.json()
  const parsed = createCaseSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  const { data: caseData, error } = await supabase!
    .from('cases')
    .insert({
      user_id: user!.id,
      role: parsed.data.role,
      county: parsed.data.county,
      court_type: parsed.data.court_type,
      dispute_type: parsed.data.dispute_type,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fetch the auto-created tasks
  const { data: tasks } = await supabase!
    .from('tasks')
    .select()
    .eq('case_id', caseData.id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ case: caseData, tasks }, { status: 201 })
}

export async function GET() {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { data: cases, error } = await supabase!
    .from('cases')
    .select()
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cases })
}
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/api/cases/route.ts
git commit -m "feat: add POST/GET /api/cases route handlers"
```

---

### Task 14: Dashboard API route

**Step 1: Create dashboard route handler**

Create: `src/app/api/cases/[id]/dashboard/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { id } = await params

  const { data, error } = await supabase!.rpc('get_case_dashboard', {
    p_case_id: id,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/api/cases/\\[id\\]/dashboard/
git commit -m "feat: add GET /api/cases/[id]/dashboard route"
```

---

### Task 15: Tasks API route (PATCH)

**Step 1: Create tasks route handler**

Create: `src/app/api/tasks/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { updateTaskSchema, VALID_TRANSITIONS } from '@/lib/schemas/task'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { id } = await params
  const body = await request.json()
  const parsed = updateTaskSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  // Fetch current task (RLS ensures ownership)
  const { data: task, error: fetchError } = await supabase!
    .from('tasks')
    .select()
    .eq('id', id)
    .single()

  if (fetchError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Validate status transition
  const allowedNext = VALID_TRANSITIONS[task.status] || []
  if (!allowedNext.includes(parsed.data.status)) {
    return NextResponse.json(
      { error: `Cannot transition from '${task.status}' to '${parsed.data.status}'` },
      { status: 422 }
    )
  }

  // Build update
  const update: Record<string, unknown> = {
    status: parsed.data.status,
  }

  if (parsed.data.status === 'completed') {
    update.completed_at = new Date().toISOString()
  }

  if (parsed.data.metadata) {
    update.metadata = { ...task.metadata, ...parsed.data.metadata }
  }

  const { data: updated, error: updateError } = await supabase!
    .from('tasks')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Write timeline event
  await supabase!.from('task_events').insert({
    case_id: task.case_id,
    task_id: id,
    kind: 'task_status_changed',
    payload: {
      task_key: task.task_key,
      from: task.status,
      to: parsed.data.status,
    },
  })

  return NextResponse.json({ task: updated })
}
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/api/tasks/
git commit -m "feat: add PATCH /api/tasks/[id] with status validation and timeline events"
```

---

### Task 16: Events & Timeline API routes

**Step 1: Create events route handler**

Create: `src/app/api/cases/[id]/events/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createEventSchema } from '@/lib/schemas/event'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { id } = await params
  const body = await request.json()
  const parsed = createEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  // Verify case access (RLS handles, but explicit check for 404)
  const { data: caseData } = await supabase!
    .from('cases')
    .select('id')
    .eq('id', id)
    .single()

  if (!caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  const { data: event, error } = await supabase!
    .from('task_events')
    .insert({
      case_id: id,
      task_id: parsed.data.task_id || null,
      kind: parsed.data.kind,
      payload: parsed.data.payload,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ event }, { status: 201 })
}
```

**Step 2: Create timeline route handler**

Create: `src/app/api/cases/[id]/timeline/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { id } = await params
  const searchParams = request.nextUrl.searchParams
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  let query = supabase!
    .from('task_events')
    .select('*, tasks(title, task_key)')
    .eq('case_id', id)
    .order('created_at', { ascending: false })
    .limit(limit + 1)  // fetch one extra to detect hasMore

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data: events, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const hasMore = (events?.length || 0) > limit
  const items = events?.slice(0, limit) || []
  const nextCursor = hasMore ? items[items.length - 1]?.created_at : null

  return NextResponse.json({ events: items, next_cursor: nextCursor, has_more: hasMore })
}
```

**Step 3: Create timeline export route**

Create: `src/app/api/cases/[id]/timeline/export/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { id } = await params

  const { data: events, error } = await supabase!
    .from('task_events')
    .select('*')
    .eq('case_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ case_id: id, exported_at: new Date().toISOString(), events })
}
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/api/cases/\\[id\\]/events/ src/app/api/cases/\\[id\\]/timeline/
git commit -m "feat: add events, timeline, and timeline export API routes"
```

---

### Task 17: Deadlines API route

**Step 1: Create deadlines route handler**

Create: `src/app/api/cases/[id]/deadlines/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'
import { createDeadlineSchema } from '@/lib/schemas/deadline'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { id } = await params
  const body = await request.json()
  const parsed = createDeadlineSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 422 })
  }

  // Verify case access
  const { data: caseData } = await supabase!
    .from('cases')
    .select('id')
    .eq('id', id)
    .single()

  if (!caseData) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 })
  }

  // Create deadline
  const { data: deadline, error } = await supabase!
    .from('deadlines')
    .insert({
      case_id: id,
      key: parsed.data.key,
      due_at: parsed.data.due_at,
      source: parsed.data.source,
      rationale: parsed.data.rationale,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-create reminders at -7d, -3d, -1d (skip past dates)
  const dueDate = new Date(parsed.data.due_at)
  const now = new Date()
  const offsets = [7, 3, 1]
  const reminders: Array<{
    case_id: string
    deadline_id: string
    channel: string
    send_at: string
  }> = []

  for (const days of offsets) {
    const sendAt = new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000)
    if (sendAt > now) {
      reminders.push({
        case_id: id,
        deadline_id: deadline.id,
        channel: 'email',
        send_at: sendAt.toISOString(),
      })
    }
  }

  if (reminders.length > 0) {
    await supabase!.from('reminders').insert(reminders)
  }

  // Write timeline event
  await supabase!.from('task_events').insert({
    case_id: id,
    kind: 'deadline_created',
    payload: {
      deadline_id: deadline.id,
      key: parsed.data.key,
      due_at: parsed.data.due_at,
      reminders_created: reminders.length,
    },
  })

  // Fetch created reminders
  const { data: createdReminders } = await supabase!
    .from('reminders')
    .select()
    .eq('deadline_id', deadline.id)
    .order('send_at', { ascending: true })

  return NextResponse.json({ deadline, reminders: createdReminders }, { status: 201 })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, error: authError } = await getAuthenticatedClient()
  if (authError) return authError

  const { id } = await params

  const { data: deadlines, error } = await supabase!
    .from('deadlines')
    .select('*, reminders(*)')
    .eq('case_id', id)
    .order('due_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deadlines })
}
```

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/api/cases/\\[id\\]/deadlines/
git commit -m "feat: add deadlines API with auto-reminder creation"
```

---

## Phase 6: UI Pages

### Task 18: Configure Tailwind warm theme

**Step 1: Extend tailwind.config.ts**

Add custom warm colors to the Tailwind config:

```typescript
// In tailwind.config.ts, extend theme.colors:
{
  'warm-bg': '#FAFAF8',
  'warm-text': '#1C1917',
  'warm-muted': '#78716C',
  'warm-border': '#E7E5E4',
  'warm-card': '#FFFFFF',
  'calm-green': '#16A34A',
  'calm-amber': '#D97706',
  'calm-indigo': '#4F46E5',
}
```

**Step 2: Add global warm styles to `src/app/globals.css`**

```css
/* Add to existing globals.css */
body {
  background-color: #FAFAF8;
  color: #1C1917;
}
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: configure warm Tailwind theme colors"
```

---

### Task 19: Create shared layout components

**Step 1: Create supportive header**

Create: `src/components/layout/supportive-header.tsx`

```tsx
interface SupportiveHeaderProps {
  title: string
  subtitle: string
}

export function SupportiveHeader({ title, subtitle }: SupportiveHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-warm-text">{title}</h1>
      <p className="mt-1 text-warm-muted">{subtitle}</p>
    </div>
  )
}
```

**Step 2: Create legal disclaimer**

Create: `src/components/layout/legal-disclaimer.tsx`

```tsx
export function LegalDisclaimer() {
  return (
    <footer className="mt-12 border-t border-warm-border pt-4 pb-8">
      <p className="text-xs text-warm-muted text-center">
        This tool provides general legal information and organization — not legal advice.
        For legal advice, please consult a licensed attorney.
      </p>
    </footer>
  )
}
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/layout/
git commit -m "feat: add supportive header and legal disclaimer components"
```

---

### Task 20: Build `/cases` page (case list)

**Step 1: Create cases page**

Create: `src/app/cases/page.tsx`

Server component that fetches cases and renders cards. Each card shows county + role + created date with a "Continue" CTA. Empty state: "No cases yet. Let's get started." with a "Start a New Case" button. New case button opens a simple dialog asking for role (plaintiff/defendant).

**Step 2: Create case card component**

Create: `src/components/cases/case-card.tsx`

Card with county, role badge, date. Single "Continue" button linking to `/case/[id]`.

**Step 3: Create new case dialog component**

Create: `src/components/cases/new-case-dialog.tsx`

Dialog with role selector. Calls POST /api/cases. On success, navigates to `/case/[id]`.

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/cases/ src/components/cases/
git commit -m "feat: add cases list page with case cards and new case dialog"
```

---

### Task 21: Build `/case/[id]` dashboard page

**Step 1: Create dashboard page**

Create: `src/app/case/[id]/page.tsx`

Server component that calls `/api/cases/[id]/dashboard`. Renders 4 cards:

- **Next Step Card**: Shows next_task title + reassurance line + "Review & Continue" button (primary CTA)
- **Upcoming Deadlines Card**: List of deadlines or friendly empty state + secondary "Add a deadline" link
- **Progress Card**: Status counts as progress bar
- **Timeline Card**: Last 10 events, human-friendly timestamps

**Step 2: Create dashboard card components**

Create the following files:
- `src/components/dashboard/next-step-card.tsx`
- `src/components/dashboard/deadlines-card.tsx`
- `src/components/dashboard/progress-card.tsx`
- `src/components/dashboard/timeline-card.tsx`

Each card is a self-contained component receiving data props. Uses shadcn Card + Skeleton for loading.

**Step 3: Add loading skeleton**

Create: `src/app/case/[id]/loading.tsx`

```tsx
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  )
}
```

**Step 4: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/case/ src/components/dashboard/
git commit -m "feat: add TurboTax-style dashboard with supportive cards"
```

---

### Task 22: Build step runner (`/case/[id]/step/[taskId]`)

**Step 1: Create step runner page**

Create: `src/app/case/[id]/step/[taskId]/page.tsx`

Fetches task by ID. Renders appropriate step component based on `task_key`. Two-phase flow: input → review/confirm.

**Step 2: Create step runner shell component**

Create: `src/components/step/step-runner.tsx`

Generic wrapper: back link, title, reassurance line, phase management (input vs review). Handles "Save and come back later" (sets in_progress) and "Confirm & Continue" (sets completed, redirects to dashboard).

**Step 3: Create welcome step**

Create: `src/components/step/welcome-step.tsx`

No input fields. Title: "Welcome — Get Started". Reassurance: "This is your case organizer. We'll walk you through each step at your own pace." Single button: "I'm ready". On click: mark completed via PATCH API, redirect to dashboard.

**Step 4: Create intake step**

Create: `src/components/step/intake-step.tsx`

Fields: county (text input), court_type (dropdown: JP / County / District / Unknown), brief description (optional textarea). Phase 1 shows form + "Review" button. Phase 2 shows summary + "Confirm & Continue" button. "Save and come back later" link saves as in_progress with metadata.

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/case/\\[id\\]/step/ src/components/step/
git commit -m "feat: add step runner with welcome and intake steps"
```

---

### Task 23: Build deadlines page (`/case/[id]/deadlines`)

**Step 1: Create deadlines page**

Create: `src/app/case/[id]/deadlines/page.tsx`

Lists deadlines sorted by due_at. Each deadline shows key, due date, source, and its scheduled reminders. "Add a deadline" button opens a form dialog.

**Step 2: Create deadline form dialog**

Create: `src/components/deadlines/deadline-form.tsx`

Fields: key (dropdown: answer_deadline, hearing_date, other), due date (date input), source (user_confirmed / court_notice), rationale (optional). On submit: POST to /api/cases/[id]/deadlines. Success message: "Got it. We'll remind you ahead of time."

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/case/\\[id\\]/deadlines/ src/components/deadlines/
git commit -m "feat: add deadlines page with form and reminders display"
```

---

### Task 24: Wire up root layout and navigation

**Step 1: Update root layout**

Modify: `src/app/layout.tsx`

Add warm background, inter font, max-width container. Include LegalDisclaimer in the layout.

**Step 2: Update root page**

Modify: `src/app/page.tsx`

Redirect to `/cases` if authenticated, `/login` if not.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: wire up root layout with warm theme and navigation"
```

---

## Phase 7: Testing

### Task 25: Write RLS isolation test

**Step 1: Create RLS test script**

Create: `tests/rls/rls-isolation.test.sql`

SQL script that:
1. Creates test user A and user B via `auth.users` insert (or supabase auth admin API)
2. User A creates a case → verify tasks are created
3. Set role to user B → SELECT from cases/tasks/deadlines/events → all return 0 rows
4. User B creates their own case → can see only their own
5. Clean up test data

**Step 2: Create a Node wrapper to run the SQL test**

Create: `tests/rls/rls-isolation.test.ts`

Uses Supabase client with service role to create test users, then uses per-user clients to verify isolation.

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add tests/rls/
git commit -m "test: add RLS isolation verification tests"
```

---

### Task 26: Write unit tests (Vitest)

**Step 1: Schema validation tests**

Create: `tests/unit/schemas/case.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { createCaseSchema } from '@/lib/schemas/case'

describe('createCaseSchema', () => {
  it('accepts valid plaintiff case', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff' })
    expect(result.success).toBe(true)
  })

  it('accepts full case data', () => {
    const result = createCaseSchema.safeParse({
      role: 'defendant',
      county: 'Travis',
      court_type: 'district',
      dispute_type: 'landlord',
    })
    expect(result.success).toBe(true)
  })

  it('rejects missing role', () => {
    const result = createCaseSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it('rejects invalid role', () => {
    const result = createCaseSchema.safeParse({ role: 'judge' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid court_type', () => {
    const result = createCaseSchema.safeParse({ role: 'plaintiff', court_type: 'supreme' })
    expect(result.success).toBe(false)
  })
})
```

**Step 2: Task schema + transition tests**

Create: `tests/unit/schemas/task.test.ts`

Tests for updateTaskSchema validation and VALID_TRANSITIONS map.

**Step 3: Deadline schema tests**

Create: `tests/unit/schemas/deadline.test.ts`

Tests for createDeadlineSchema — valid/invalid due_at, required key, valid sources.

**Step 4: Reminder date calculation tests**

Create: `tests/unit/logic/reminders.test.ts`

Test the reminder offset logic: deadline 30 days out → 3 reminders. Deadline 2 days out → only 1 reminder. Deadline in the past → 0 reminders.

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add tests/unit/
git commit -m "test: add unit tests for Zod schemas and business logic"
```

---

### Task 27: Install and configure Playwright

**Step 1: Install Playwright**

```bash
cd "/Users/minwang/lawyer free"
npm install -D @playwright/test
npx playwright install
```

**Step 2: Create Playwright config**

Create: `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**Step 3: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add playwright.config.ts package.json package-lock.json
git commit -m "feat: configure Playwright for e2e testing"
```

---

### Task 28: Write e2e test

**Step 1: Create dashboard e2e test**

Create: `tests/e2e/dashboard.spec.ts`

Full flow test:
1. Sign up with test email/password
2. Redirected to `/cases` — sees empty state
3. Create a new case (plaintiff)
4. Dashboard shows "Welcome — Get Started" as next step
5. Click "Review & Continue" → step runner page
6. Complete Welcome ("I'm ready")
7. Redirected to dashboard → shows "Tell Us About Your Case" as next step
8. Complete Intake (fill county: "Travis", court_type: "district")
9. Add a deadline (answer_deadline, 30 days out)
10. Dashboard shows deadline in "Upcoming Deadlines"
11. Timeline shows all events in chronological order

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add tests/e2e/
git commit -m "test: add e2e test for full dashboard flow"
```

---

## Phase 8: Documentation & Quality

### Task 29: Write UX Copy Style Guide

**Step 1: Create style guide**

Create: `docs/ux-copy-style-guide.md`

Contents:
- **Approved phrases**: "One step at a time", "You're in control", "A common next step is...", "We'll remind you ahead of time", "That's okay", "Take your time", "You can update this anytime"
- **Forbidden phrases**: "You must", "Required", "Urgent", "Warning", "Error", "Failed", "Overdue", "ASAP", "Immediately", any imperative legal language
- **Empty state examples**: friendly, reassuring copy for each card
- **Reminder copy examples**: calm reminder language
- **Color rules**: no red, use warm amber for urgency

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add docs/ux-copy-style-guide.md
git commit -m "docs: add UX copy style guide"
```

---

### Task 30: Write API reference

**Step 1: Create API reference**

Create: `docs/api-reference.md`

Document each endpoint with:
- Method + path
- Auth required: yes
- Request body (Zod schema)
- Response shape
- Example curl command
- Error codes

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add docs/api-reference.md
git commit -m "docs: add API reference with curl examples"
```

---

### Task 31: Write README

**Step 1: Create comprehensive README**

Create/overwrite: `README.md`

Contents:
- Project description (TurboTax-style case dashboard for Texas pro se litigants)
- Prerequisites (Node.js 20+, Docker, Supabase CLI)
- Local dev setup instructions (step by step)
- Environment variables table
- How to run migrations (`supabase db reset`)
- How to run tests (`npm run test:unit`, `npm run test:e2e`)
- How to verify RLS (instructions for running RLS test)
- Project structure overview
- Tech stack summary

**Step 2: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add README.md
git commit -m "docs: add comprehensive README with setup instructions"
```

---

## Summary

| Phase | Tasks | What it delivers |
|-------|-------|------------------|
| 1: Scaffolding | 1-4 | Next.js + Supabase + shadcn/ui + Vitest configured |
| 2: Schema | 5-8 | All 5 tables, RLS, indexes, dashboard function, seed trigger |
| 3: Auth | 9-10 | Supabase client utilities, middleware, login/signup pages |
| 4: Schemas | 11 | Zod validation for all API inputs |
| 5: API | 12-17 | All route handlers with validation and timeline events |
| 6: UI | 18-24 | Dashboard, case list, step runner, deadlines page |
| 7: Testing | 25-28 | RLS isolation, unit tests, e2e flow |
| 8: Docs | 29-31 | UX style guide, API reference, README |

Total: 31 tasks across 8 phases.
