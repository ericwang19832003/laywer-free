# Priority Alerts Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a "Priority Alerts" section to the top of the case dashboard that surfaces unacknowledged reminder escalations with visual urgency tiering (red/amber/neutral borders), Review and Acknowledge buttons, and optimistic UI.

**Architecture:** Server Component fetches unacknowledged `reminder_escalations` joined with `deadlines` and passes them as props to a Client Component. A new API route handles acknowledgment via PATCH. The section renders above the existing NextStepCard and disappears when empty.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (RLS), Zod 4, shadcn/ui (Card, Button), Sonner (toasts), Vitest + React Testing Library.

---

### Task 1: Zod Schema for Reminder Escalation

**Files:**
- Create: `src/lib/schemas/reminder-escalation.ts`
- Test: `tests/unit/schemas/reminder-escalation.test.ts`

**Step 1: Write the failing test**

Create `tests/unit/schemas/reminder-escalation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { reminderEscalationSchema } from '@/lib/schemas/reminder-escalation'

describe('reminderEscalationSchema', () => {
  const valid = {
    id: 'esc-001',
    case_id: 'case-001',
    deadline_id: 'dl-001',
    escalation_level: 3,
    message: 'Your answer deadline is tomorrow.',
    triggered_at: '2026-03-14T00:00:00Z',
    due_at: '2026-03-15T00:00:00Z',
    deadline_key: 'answer_deadline_confirmed',
  }

  it('accepts valid escalation data', () => {
    const result = reminderEscalationSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects missing id', () => {
    const { id, ...rest } = valid
    const result = reminderEscalationSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects escalation_level outside 1-3', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, escalation_level: 5 })
    expect(result.success).toBe(false)
  })

  it('rejects escalation_level of 0', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, escalation_level: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects empty message', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, message: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid triggered_at datetime', () => {
    const result = reminderEscalationSchema.safeParse({ ...valid, triggered_at: 'not-a-date' })
    expect(result.success).toBe(false)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/schemas/reminder-escalation.test.ts`
Expected: FAIL — cannot resolve `@/lib/schemas/reminder-escalation`

**Step 3: Write minimal implementation**

Create `src/lib/schemas/reminder-escalation.ts`:

```typescript
import { z } from 'zod'

export const reminderEscalationSchema = z.object({
  id: z.string().min(1),
  case_id: z.string().min(1),
  deadline_id: z.string().min(1),
  escalation_level: z.number().int().min(1).max(3),
  message: z.string().min(1),
  triggered_at: z.string().datetime(),
  due_at: z.string().datetime(),
  deadline_key: z.string().min(1),
})

export type ReminderEscalation = z.infer<typeof reminderEscalationSchema>
```

**Step 4: Run test to verify it passes**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/schemas/reminder-escalation.test.ts`
Expected: All 6 tests PASS

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/lib/schemas/reminder-escalation.ts tests/unit/schemas/reminder-escalation.test.ts
git commit -m "feat: add Zod schema for reminder escalations"
```

---

### Task 2: Acknowledge API Route

**Files:**
- Create: `src/app/api/reminder-escalations/[id]/acknowledge/route.ts`
- Test: `tests/unit/api/acknowledge-escalation.test.ts`

**Step 1: Write the failing test**

Create `tests/unit/api/acknowledge-escalation.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock supabase route-handler before importing route
const mockUpdate = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/route-handler', () => ({
  getAuthenticatedClient: vi.fn().mockResolvedValue({
    supabase: {
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockImplementation((data) => {
          mockUpdate(data)
          return {
            eq: vi.fn().mockImplementation((col, val) => {
              mockEq(col, val)
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { id: 'esc-001', acknowledged: true },
                    error: null,
                  }),
                }),
              }
            }),
          }
        }),
      }),
    },
    user: { id: 'user-001' },
    error: null,
  }),
}))

import { PATCH } from '@/app/api/reminder-escalations/[id]/acknowledge/route'

describe('PATCH /api/reminder-escalations/[id]/acknowledge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 and sets acknowledged=true', async () => {
    const request = new Request('http://localhost/api/reminder-escalations/esc-001/acknowledge', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ id: 'esc-001' }) })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockUpdate).toHaveBeenCalledWith({ acknowledged: true })
    expect(mockEq).toHaveBeenCalledWith('id', 'esc-001')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/api/acknowledge-escalation.test.ts`
Expected: FAIL — cannot resolve the route module

**Step 3: Write minimal implementation**

Create `src/app/api/reminder-escalations/[id]/acknowledge/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedClient } from '@/lib/supabase/route-handler'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { supabase, error: authError } = await getAuthenticatedClient()
    if (authError) return authError

    const { data, error } = await supabase!
      .from('reminder_escalations')
      .update({ acknowledged: true })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Escalation not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Step 4: Run test to verify it passes**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/api/acknowledge-escalation.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/api/reminder-escalations/[id]/acknowledge/route.ts tests/unit/api/acknowledge-escalation.test.ts
git commit -m "feat: add PATCH endpoint to acknowledge reminder escalations"
```

---

### Task 3: PriorityAlertsSection Component

**Files:**
- Create: `src/components/dashboard/priority-alerts-section.tsx`
- Test: `tests/unit/components/priority-alerts-section.test.tsx`

**Step 1: Write the failing test**

Create `tests/unit/components/priority-alerts-section.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock next/navigation
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { error: vi.fn() },
}))

// ── Fixtures ─────────────────────────────────────

const makeAlert = (overrides = {}) => ({
  id: 'esc-001',
  case_id: 'case-001',
  deadline_id: 'dl-001',
  escalation_level: 3,
  message: 'Your answer deadline is tomorrow (March 15, 2026).',
  triggered_at: '2026-03-14T00:00:00Z',
  due_at: '2026-03-15T00:00:00Z',
  deadline_key: 'answer_deadline_confirmed',
  ...overrides,
})

beforeEach(() => {
  vi.clearAllMocks()
  global.fetch = vi.fn()
})

describe('PriorityAlertsSection', () => {
  describe('empty state', () => {
    it('renders nothing when alerts array is empty', () => {
      const { container } = render(
        <PriorityAlertsSection caseId="case-001" alerts={[]} />
      )
      expect(container.innerHTML).toBe('')
    })
  })

  describe('rendering alerts', () => {
    it('renders the section label', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByText('Priority Alerts')).toBeInTheDocument()
    })

    it('renders correct number of alert cards', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[
            makeAlert({ id: 'esc-001', escalation_level: 3 }),
            makeAlert({ id: 'esc-002', escalation_level: 2, message: 'Discovery due in 3 days.' }),
          ]}
        />
      )
      expect(screen.getByText('Your answer deadline is tomorrow (March 15, 2026).')).toBeInTheDocument()
      expect(screen.getByText('Discovery due in 3 days.')).toBeInTheDocument()
    })

    it('displays message text', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByText('Your answer deadline is tomorrow (March 15, 2026).')).toBeInTheDocument()
    })

    it('displays formatted due date', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByText(/March 15, 2026/)).toBeInTheDocument()
    })
  })

  describe('border colors by level', () => {
    it('level 3 has red left border', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[makeAlert({ escalation_level: 3 })]}
        />
      )
      const card = screen.getByTestId('alert-card-esc-001')
      expect(card.className).toContain('border-l-red-500')
      expect(card.className).toContain('bg-red-50')
    })

    it('level 2 has amber left border', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[makeAlert({ id: 'esc-002', escalation_level: 2 })]}
        />
      )
      const card = screen.getByTestId('alert-card-esc-002')
      expect(card.className).toContain('border-l-calm-amber')
      expect(card.className).toContain('bg-calm-amber/5')
    })

    it('level 1 has neutral border', () => {
      render(
        <PriorityAlertsSection
          caseId="case-001"
          alerts={[makeAlert({ id: 'esc-003', escalation_level: 1 })]}
        />
      )
      const card = screen.getByTestId('alert-card-esc-003')
      expect(card.className).toContain('border-l-warm-border')
      expect(card.className).toContain('bg-warm-bg')
    })
  })

  describe('buttons', () => {
    it('"Review" links to the deadlines page', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      const reviewLink = screen.getByRole('link', { name: 'Review' })
      expect(reviewLink).toHaveAttribute('href', '/case/case-001/deadlines')
    })

    it('"Acknowledge" button is present', () => {
      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )
      expect(screen.getByRole('button', { name: 'Acknowledge' })).toBeInTheDocument()
    })
  })

  describe('acknowledge flow', () => {
    it('removes card from DOM on successful acknowledge', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(screen.queryByText('Your answer deadline is tomorrow (March 15, 2026).')).not.toBeInTheDocument()
      })
    })

    it('calls the correct API endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
      global.fetch = mockFetch

      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/reminder-escalations/esc-001/acknowledge',
          expect.objectContaining({ method: 'PATCH' })
        )
      })
    })

    it('restores card on API failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      })

      render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(screen.getByText('Your answer deadline is tomorrow (March 15, 2026).')).toBeInTheDocument()
      })
    })

    it('hides entire section when last alert is acknowledged', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      const { container } = render(
        <PriorityAlertsSection caseId="case-001" alerts={[makeAlert()]} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Acknowledge' }))

      await waitFor(() => {
        expect(container.innerHTML).toBe('')
      })
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/components/priority-alerts-section.test.tsx`
Expected: FAIL — cannot resolve the component module

**Step 3: Write minimal implementation**

Create `src/components/dashboard/priority-alerts-section.tsx`:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { ReminderEscalation } from '@/lib/schemas/reminder-escalation'

interface PriorityAlertsSectionProps {
  caseId: string
  alerts: ReminderEscalation[]
}

const LEVEL_STYLES: Record<number, string> = {
  3: 'border-l-red-500 bg-red-50',
  2: 'border-l-calm-amber bg-calm-amber/5',
  1: 'border-l-warm-border bg-warm-bg',
}

function formatDueDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PriorityAlertsSection({ caseId, alerts: initialAlerts }: PriorityAlertsSectionProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const router = useRouter()

  if (alerts.length === 0) return null

  async function handleAcknowledge(id: string) {
    const previous = alerts
    setAlerts((current) => current.filter((a) => a.id !== id))

    try {
      const res = await fetch(`/api/reminder-escalations/${id}/acknowledge`, {
        method: 'PATCH',
      })

      if (!res.ok) {
        setAlerts(previous)
        toast.error('Could not acknowledge this alert. Please try again.')
        return
      }

      router.refresh()
    } catch {
      setAlerts(previous)
      toast.error('Could not acknowledge this alert. Please try again.')
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-warm-muted uppercase tracking-wide">
        Priority Alerts
      </p>

      {alerts.map((alert) => (
        <div
          key={alert.id}
          data-testid={`alert-card-${alert.id}`}
          className={`rounded-lg border-l-4 px-4 py-3 ${LEVEL_STYLES[alert.escalation_level] ?? LEVEL_STYLES[1]}`}
        >
          <p className="text-sm text-warm-text">{alert.message}</p>
          <p className="text-xs text-warm-muted mt-1">
            Due: {formatDueDate(alert.due_at)}
          </p>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/case/${caseId}/deadlines`}>Review</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAcknowledge(alert.id)}
            >
              Acknowledge
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run tests/unit/components/priority-alerts-section.test.tsx`
Expected: All 12 tests PASS

**Step 5: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/components/dashboard/priority-alerts-section.tsx tests/unit/components/priority-alerts-section.test.tsx
git commit -m "feat: add PriorityAlertsSection component with tests"
```

---

### Task 4: Wire Into Dashboard Page

**Files:**
- Modify: `src/app/case/[id]/page.tsx`

**Step 1: Add import and type**

At the top of `src/app/case/[id]/page.tsx`, add:

```typescript
import { PriorityAlertsSection } from '@/components/dashboard/priority-alerts-section'
```

And add the escalation type alongside the existing `DashboardData` interface:

```typescript
interface EscalationAlert {
  id: string
  case_id: string
  deadline_id: string
  escalation_level: number
  message: string
  triggered_at: string
  due_at: string
  deadline_key: string
}
```

**Step 2: Add the Supabase query**

Inside the `DashboardPage` function, after the existing `supabase.rpc('get_case_dashboard', ...)` call and before the error check, add a parallel query:

```typescript
const { data: escalationData } = await supabase
  .from('reminder_escalations')
  .select('id, case_id, deadline_id, escalation_level, message, triggered_at, deadlines(due_at, key)')
  .eq('case_id', id)
  .eq('acknowledged', false)
  .order('escalation_level', { ascending: false })
  .order('triggered_at', { ascending: false })
```

Then transform the joined data into the flat shape the component expects:

```typescript
const alerts: EscalationAlert[] = (escalationData ?? []).map((row: Record<string, unknown>) => {
  const deadline = row.deadlines as { due_at: string; key: string } | null
  return {
    id: row.id as string,
    case_id: row.case_id as string,
    deadline_id: row.deadline_id as string,
    escalation_level: row.escalation_level as number,
    message: row.message as string,
    triggered_at: row.triggered_at as string,
    due_at: deadline?.due_at ?? '',
    deadline_key: deadline?.key ?? '',
  }
})
```

**Step 3: Render the component**

Inside the `<div className="space-y-6">` block, add `<PriorityAlertsSection>` as the first child (above `<NextStepCard>`):

```tsx
<div className="space-y-6">
  <PriorityAlertsSection caseId={id} alerts={alerts} />
  <NextStepCard caseId={id} nextTask={dashboard.next_task} />
  {/* ... rest unchanged */}
</div>
```

**Step 4: Build to verify compilation**

Run: `cd "/Users/minwang/lawyer free" && npm run build`
Expected: Build succeeds with no type errors

**Step 5: Run all tests**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run`
Expected: All existing + new tests pass

**Step 6: Commit**

```bash
cd "/Users/minwang/lawyer free"
git add src/app/case/[id]/page.tsx
git commit -m "feat: wire PriorityAlertsSection into case dashboard"
```

---

### Task 5: Run Full Test Suite and Verify

**Step 1: Run unit tests**

Run: `cd "/Users/minwang/lawyer free" && npx vitest run`
Expected: All tests pass, including:
- `tests/unit/schemas/reminder-escalation.test.ts` (6 tests)
- `tests/unit/api/acknowledge-escalation.test.ts` (1 test)
- `tests/unit/components/priority-alerts-section.test.tsx` (12 tests)

**Step 2: Run build**

Run: `cd "/Users/minwang/lawyer free" && npm run build`
Expected: Production build succeeds

**Step 3: Manual verification checklist**

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to a case dashboard
- [ ] Verify: if no unacknowledged escalations, no Priority Alerts section appears
- [ ] Trigger escalations via cron endpoint or insert test data
- [ ] Verify: Level 3 alert shows red left border
- [ ] Verify: Level 2 alert shows amber left border
- [ ] Verify: Level 1 alert shows neutral border
- [ ] Verify: "Review" navigates to deadlines page
- [ ] Verify: "Acknowledge" removes the card with smooth optimistic UI
- [ ] Verify: After acknowledging all alerts, section disappears
- [ ] Verify: Mobile responsive at 375px width
- [ ] Verify: No panic language — tone is calm and steady
