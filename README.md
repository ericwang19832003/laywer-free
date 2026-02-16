# Lawyer Free — Texas Pro Se Litigation Assistant

A TurboTax-style case dashboard that helps self-represented litigants in Texas organize their cases, track deadlines, and prepare documents — one step at a time.

> **Important:** This tool provides general legal information and organization — not legal advice. For legal advice, please consult a licensed attorney.

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Database:** Supabase (Postgres, Auth, RLS)
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Validation:** Zod 4
- **Testing:** Vitest (unit) + Playwright (e2e)

## Prerequisites

- Node.js 20+
- Docker (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Local Development Setup

### 1. Clone and install

```bash
cd "lawyer free"
npm install
```

### 2. Start Supabase (local)

```bash
npx supabase start
```

This starts Postgres, Auth, and other Supabase services in Docker. Copy the output values.

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with the values from `supabase start`:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From `supabase start` output |
| `SUPABASE_SERVICE_ROLE_KEY` | From `supabase start` output |

### 4. Run migrations

```bash
npx supabase db reset
```

This applies all migrations and seed data.

### 5. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Running Tests

### Unit tests (Vitest)

```bash
npm run test:unit
```

Tests Zod schemas, business logic (reminder date calculations), and status transitions.

### RLS isolation tests

```bash
npm run test:rls
```

Requires local Supabase running. Creates two test users and verifies they cannot access each other's data.

### E2E tests (Playwright)

```bash
npx playwright install  # first time only
npm run test:e2e
```

Requires local Supabase + dev server. Tests the full flow: signup → create case → complete steps → add deadline.

## Project Structure

```
src/
├── app/
│   ├── api/           # API route handlers
│   │   ├── cases/     # POST/GET cases, dashboard, deadlines, timeline
│   │   └── tasks/     # PATCH task status
│   ├── case/[id]/     # Dashboard, step runner, deadlines pages
│   ├── cases/         # Case list page
│   ├── login/         # Login page
│   └── signup/        # Signup page
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── dashboard/     # Dashboard card components
│   ├── cases/         # Case list components
│   ├── step/          # Step runner components
│   ├── deadlines/     # Deadline components
│   └── layout/        # Header, disclaimer
└── lib/
    ├── supabase/      # Supabase client utilities
    └── schemas/       # Zod validation schemas

supabase/
├── migrations/        # SQL migrations (tables, RLS, functions, triggers)
└── seed.sql          # Seed data

tests/
├── unit/             # Vitest unit tests
├── rls/              # RLS isolation tests
└── e2e/              # Playwright e2e tests
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `cases` | User's litigation cases |
| `tasks` | Step-by-step checklist items per case |
| `task_events` | Immutable audit log / timeline |
| `deadlines` | Date-based deadlines with source tracking |
| `reminders` | Scheduled reminder records (sending not yet implemented) |

## How to Verify RLS

1. Start Supabase: `npx supabase start`
2. Run: `npm run test:rls`
3. Tests create User A and User B, create cases for each, and verify:
   - User A cannot see User B's cases, tasks, events, or deadlines
   - User B cannot see User A's data
   - Each user can only access their own data
