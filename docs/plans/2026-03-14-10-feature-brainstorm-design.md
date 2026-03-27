# Lawyer Free — 10-Feature Improvement Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 10 major features across UX, growth, revenue, AI, mobile, and data to transform Lawyer Free from a filing tool into a full case companion platform.

**Architecture:** Each feature is designed as an independent module that integrates with the existing case/task/wizard architecture. Features share common infrastructure (Supabase tables, API routes, React components) but can be built and shipped independently.

**Tech Stack:** Next.js 16, Supabase (Postgres + RLS), React 19, Tailwind CSS 4, Claude AI, shadcn/ui

---

## Implementation Phases

| Phase | Features | Batch Theme |
|-------|----------|-------------|
| **Phase 1** (Foundation) | #5 Freemium Gating, #10 Case Analytics, #4 Confidence Score | Revenue + Data + UX |
| **Phase 2** (Intelligence) | #7 Proactive Case Intelligence, #1 Post-Filing Lifecycle | AI + Retention |
| **Phase 3** (Growth) | #2 Case Assessment Pages, #8 Courtroom Companion | Acquisition + Differentiation |
| **Phase 4** (Platform) | #3 Attorney Marketplace, #9 Mobile-First, #6 PWA + Encryption | Revenue + Reach |

---

## Feature 1: Post-Filing Lifecycle Tracker

### Problem
Users complete wizard steps and file with the court, but the app goes silent. No guidance for waiting periods, hearings, settlement negotiations, or post-judgment collection.

### Design

**New task phases per dispute type** — extend the existing workflow-phases.ts:

```
Current:  Getting Started → Building Case → Filing & Service → [end]
New:      ... → Court Response → Pre-Trial → Trial/Hearing → Post-Resolution
```

**New task_keys (6 per workflow, appended after existing chains):**

| Task Key | Title | Description |
|----------|-------|-------------|
| `wait_for_response` | Wait for Court Response | Track filing confirmation, case number assignment, hearing date |
| `pre_hearing_prep` | Prepare for Your Hearing | Courtroom prep checklist, what to wear, what to bring |
| `hearing_day_guide` | Hearing Day Guide | Step-by-step courtroom script |
| `record_outcome` | Record Your Outcome | Log result (won/lost/settled/dismissed/continued) |
| `post_judgment` | After the Judgment | Next steps based on outcome (collect, appeal, comply) |
| `case_closure` | Close Your Case | Final checklist, document archival |

**Outcome-based branching in `record_outcome`:**
- Won → collection guidance (abstract of judgment, writ of execution)
- Lost → appeal evaluation, deadline tracking
- Settled → settlement agreement review, compliance monitoring
- Dismissed → refiling guidance if applicable
- Continued → update hearing date, extend timeline

**DB changes:**
- Add `outcome` column to `cases` table: `enum('won', 'lost', 'settled', 'dismissed', 'continued', null)`
- Add `hearing_date` column to `cases` table
- New tasks seeded by `seed_case_tasks()` (locked until filing task completed)
- `unlock_next_task()` extended for the new chain

**UI changes:**
- New phase labels in workflow sidebar
- Outcome recording step with radio cards
- Post-judgment guided steps based on outcome
- Hearing countdown on case dashboard

---

## Feature 2: Free Case Assessment Landing Pages

### Problem
No SEO-driven acquisition funnel. Users must sign up before seeing any value.

### Design

**Public (unauthenticated) assessment pages** at `/assess/[disputeType]`:
- `/assess/landlord-tenant`
- `/assess/small-claims`
- `/assess/personal-injury`
- `/assess/debt-defense`
- `/assess/family-law`
- `/assess/contract`

**Each page has a 5-question quick assessment:**

1. What happened? (dispute-specific dropdown)
2. When did it happen? (date picker — SOL check)
3. How much is at stake? (amount → court type recommendation)
4. What evidence do you have? (checklist)
5. Where are you located? (state + county)

**Assessment result (no signup required):**
- Case viability score: "Strong / Moderate / Challenging"
- Estimated timeline
- Recommended court type
- Filing fee estimate
- Key deadlines (SOL countdown)
- "Start your case" CTA → pre-fills wizard with assessment answers

**Technical approach:**
- Static pages with client-side logic (no AI calls for assessment — deterministic rules)
- Store assessment in URL params or localStorage so signup preserves answers
- SEO-optimized with meta tags, structured data, FAQ schema
- No new DB tables — assessment data flows into case creation

**New files:**
- `src/app/(public)/assess/[disputeType]/page.tsx` — assessment page
- `src/lib/assessment/rules.ts` — deterministic assessment logic per dispute type
- `src/lib/assessment/questions.ts` — question configs per dispute type

---

## Feature 3: Attorney Marketplace

### Problem
Some cases need a lawyer. The app says "consult an attorney" but offers no path.

### Design

**Phase 1 (MVP): Document Review Service**
- Users can request an attorney review of their AI-generated petition ($99-149 flat fee)
- "Get Attorney Review" button on filing/petition review step
- Payment via Stripe Checkout (one-time)
- Review request stored in DB, manually fulfilled initially
- Attorney feedback returned as annotated comments on the petition

**Phase 2: Attorney Directory**
- Curated list of attorneys by state/county/dispute type
- Attorney profiles with ratings, specialties, pricing
- "Request Consultation" button → schedules via Calendly or similar
- Referral fee tracking (15-20%)

**DB tables (Phase 1 only):**

```sql
CREATE TABLE attorney_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id),
  user_id uuid REFERENCES auth.users(id),
  document_type text NOT NULL,      -- 'petition', 'answer', 'motion'
  document_url text NOT NULL,       -- Supabase storage path
  status text NOT NULL DEFAULT 'pending', -- pending, in_review, completed, cancelled
  payment_id text,                  -- Stripe payment intent ID
  amount_cents int NOT NULL,
  attorney_notes jsonb,             -- Structured feedback
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
```

**UI:**
- "Get Attorney Review" card on petition review step
- Review status badge on case dashboard
- Attorney feedback viewer (inline annotations)
- Payment flow (Stripe Checkout redirect → webhook → status update)

**New dependencies:** Stripe SDK (`stripe`, `@stripe/stripe-js`)

---

## Feature 4: Confidence Score & Progress Celebration

### Problem
Risk score focuses on what could go wrong. No positive reinforcement for anxious users.

### Design

**Confidence Score (0-100)** displayed prominently on case dashboard:

Scoring formula (deterministic, additive):
```
Base: 20 points (for creating the case)
+10: Completed intake
+10: Uploaded at least 1 evidence item
+10: Completed filing prep wizard
+5:  Filed with court
+5:  Served defendant
+5:  No missed deadlines
+5:  Evidence vault has 3+ items
+5:  Discovery pack created
+5:  All current tasks up to date
+5:  Research authorities saved
+5:  Case notes added
+5:  Trial binder created
+5:  Courtroom prep completed
```
Max: 100

**Milestone celebrations (toast notifications):**
- 25%: "Great start! You've taken the first steps to protect your rights."
- 50%: "Halfway there! Your case is more organized than most."
- 75%: "Almost ready! You're better prepared than 80% of self-represented litigants."
- 100%: "Fully prepared! You've done everything possible to give yourself the best chance."

**UI components:**
- `ConfidenceScoreCard` on case dashboard (circular progress ring)
- `MilestoneToast` triggered when thresholds crossed
- `ConfidenceBreakdown` expandable section showing what's earning points
- Warm color gradient (calm-indigo at low, green at high)

**DB changes:**
- `case_confidence_scores` table (case_id, score, breakdown jsonb, computed_at)
- Recomputed on task completion (via `unlock_next_task` trigger or API call)

---

## Feature 5: Freemium with Smart Gating

### Problem
No monetization. AI calls are expensive. App needs revenue.

### Design

**Tier structure:**

| | Free | Pro ($29/mo) | Premium ($79/mo) |
|--|------|-------------|-------------------|
| Active cases | 1 | 3 | Unlimited |
| AI generations | 5/month | Unlimited | Unlimited + priority |
| Discovery tools | View only | Full access | Full access |
| Trial binders | No | Yes | Yes |
| Research | 3 queries/mo | Unlimited | Unlimited |
| Email integration | No | Yes | Yes |
| Case sharing | No | Yes | Yes |
| Attorney review | No | No | 1/month included |

**Never gated (safety-critical):**
- Deadline tracking and reminders
- Basic wizard steps (intake, evidence upload, filing guide)
- Fee waiver information
- Court directory
- Case dashboard and health score

**Technical approach:**
- `user_subscription` table: user_id, tier (free/pro/premium), stripe_customer_id, stripe_subscription_id, current_period_end
- `ai_usage` table: user_id, month, generation_count
- Middleware helper: `checkFeatureAccess(userId, feature)` → boolean
- Gate checks in API routes (return 403 with upgrade prompt)
- Client-side: `useSubscription()` hook for conditional UI rendering
- Stripe integration: Checkout, Customer Portal, Webhooks

**New dependencies:** Stripe SDK

**UI:**
- Upgrade prompts at gate points (non-intrusive, warm tone)
- `/settings` billing section (manage subscription, view usage)
- Usage meter in sidebar ("3 of 5 AI generations used this month")

---

## Feature 6: Offline-First PWA + Client-Side Encryption

### Problem
Users access app from courthouses with spotty internet. Sensitive data (DV cases) needs extra protection.

### Design

**PWA (Progressive Web App):**
- `next-pwa` plugin for service worker generation
- Cache strategy: Network-first for API, Cache-first for static assets
- IndexedDB for offline case data (current case dashboard, deadlines, checklist)
- Background sync for form submissions queued offline
- Web app manifest for "Add to Home Screen"
- Push notifications via Web Push API (deadline reminders)

**Client-side encryption (for sensitive fields):**
- Encrypt: case notes, DV flag, evidence descriptions, timeline entries
- Encryption key derived from user password via PBKDF2
- Encrypted fields stored as `encrypted_` prefixed columns (encrypted_content jsonb)
- Decrypt client-side only — server never sees plaintext
- "Privacy mode" toggle in settings
- "Panic button" in header — one-click logout + clear local storage + redirect to benign page (e.g., Google)

**DB changes:**
- Add `encrypted_content` jsonb column to `case_notes`
- Add `privacy_mode` boolean to user profile
- No migration of existing data — opt-in only

**New files:**
- `src/lib/crypto.ts` — encryption/decryption utilities
- `src/components/layout/panic-button.tsx`
- `public/manifest.json` — PWA manifest
- `next.config.ts` — PWA plugin config

---

## Feature 7: Proactive Case Intelligence

### Problem
AI is reactive — generates content when asked. Doesn't proactively surface risks, opportunities, or missing elements.

### Design

**Background intelligence engine** that runs on case events (task completion, deadline changes, evidence uploads):

**Alert types:**

| Alert | Trigger | Example |
|-------|---------|---------|
| SOL Warning | Case created, incident_date set | "Based on your incident date, you have 47 days left to file" |
| Missing Evidence | Filing prep reached, evidence gap | "Cases like yours typically include medical records" |
| Deadline Risk | Deadline approaching without action | "Your answer deadline is in 3 days — have you filed?" |
| Procedural Tip | Task completed, next step has requirements | "Your court requires a Certificate of Conference before motions" |
| Settlement Window | Filing complete, typical timing reached | "Most defendants respond within 30 days of service" |
| Weekly Digest | Cron (Sunday evening) | "This week: 2 tasks completed, 1 deadline upcoming" |

**Architecture:**
- `case_insights` table: case_id, insight_type, title, body, priority, dismissed, created_at
- Insights generated by deterministic rules (not AI) for speed and cost
- AI used only for weekly digest narrative (one Claude call per case per week)
- API route: `GET /api/cases/[id]/insights` — returns active insights
- Cron route: `POST /api/cron/generate-insights` — batch process all active cases
- Dashboard widget: `InsightsCard` showing top 3 undismissed insights
- Email: Weekly digest via Resend (opt-in)

**Rules engine (`src/lib/insights/rules.ts`):**
- Each rule is a pure function: `(caseData, tasks, deadlines, evidence) → Insight | null`
- Rules evaluated on task completion and daily cron
- ~15 initial rules covering the most common gaps

---

## Feature 8: Courtroom Companion

### Problem
Document prep is handled, but courtroom performance is the #1 reason pro se litigants lose.

### Design

**Three components:**

**A) Hearing Prep Guide (new guided step)**
- Task key: `courtroom_prep` (added to each workflow after `pre_hearing_prep`)
- Interactive Q&A checklist:
  - What to wear (business casual, no logos)
  - What to bring (case file, evidence copies, pen, notepad)
  - Arrive 30 minutes early
  - Where to sit, when to stand
  - How to address the judge ("Your Honor")
  - Courtroom etiquette (no phones, no interrupting)

**B) Courtroom Script Generator**
- Based on case type + court type, generate a step-by-step script:
  - "When your case is called, stand and say: 'Ready, Your Honor'"
  - "The judge will ask if you've attempted to resolve this. Say: 'Yes, Your Honor, I sent a demand letter on [date]'"
  - "Present your evidence by saying: 'Your Honor, I'd like to introduce Exhibit A'"
- Script stored as task metadata, downloadable as PDF
- AI-generated based on case context (one Claude call)

**C) Objection Quick-Reference**
- Static reference card (no AI needed):

| Objection | When to Use | Example |
|-----------|-------------|---------|
| Hearsay | Other side reads from a document not in evidence | "Objection, hearsay" |
| Relevance | Question/evidence unrelated to the case | "Objection, relevance" |
| Leading | Attorney asks yes/no questions to their own witness | "Objection, leading" |
| Foundation | Document introduced without authenticating it | "Objection, lack of foundation" |
| Asked & Answered | Same question repeated | "Objection, asked and answered" |

- Rendered as swipeable cards in the hearing prep step
- Printable PDF version

**New files:**
- `src/lib/guided-steps/courtroom/courtroom-prep-config.ts`
- `src/lib/guided-steps/courtroom/script-generator.ts`
- `src/lib/guided-steps/courtroom/objection-reference.ts`
- `src/components/step/courtroom/courtroom-prep-step.tsx`
- `src/components/step/courtroom/objection-cards.tsx`

---

## Feature 9: Mobile-First Case Dashboard

### Problem
App is desktop-oriented. Pro se litigants primarily use phones.

### Design

**Responsive redesign of key pages (not a separate app):**

**A) Case dashboard mobile layout:**
- Stack cards vertically (single column)
- "Next Step" card is hero-sized at top with large CTA
- Deadline countdown as a sticky banner
- Swipeable cards for secondary sections
- Bottom navigation bar: Dashboard | Tasks | Evidence | Research | More

**B) Quick-capture features:**
- Camera button in evidence vault (uses `navigator.mediaDevices`)
- Photo → auto-upload to Supabase storage → evidence item created
- Voice-to-text for case notes (Web Speech API → `SpeechRecognition`)
- Quick-add deadline from phone notification

**C) Mobile-optimized wizard:**
- Full-screen steps (no sidebar on mobile)
- Larger touch targets (48px minimum)
- Swipe gestures for next/previous step
- Progress bar at top (thin, non-intrusive)

**Implementation approach:**
- Tailwind responsive classes (`sm:`, `md:`, `lg:`) on existing components
- New `MobileNav` component (bottom tab bar, visible on `sm:` only)
- Existing desktop layout preserved for `md:` and above
- No new routes — same pages, responsive layouts

**New components:**
- `src/components/layout/mobile-nav.tsx` — bottom tab navigation
- `src/components/evidence/quick-capture.tsx` — camera + upload
- `src/components/case-notes/voice-note.tsx` — speech-to-text

---

## Feature 10: Case Analytics & Success Patterns

### Problem
No feedback loop. Don't know which features drive success, where users drop off, or what outcomes look like.

### Design

**A) User-facing analytics (Case Comparison):**
- "How you compare" widget on case dashboard:
  - "Your case has more evidence than 65% of similar cases"
  - "Average time to file for your case type: 14 days (you: 8 days)"
  - "Completion rate for cases like yours: 72%"
- Data is anonymized and aggregated (never individual case details)

**B) Product analytics (internal):**
- Track key events via `case_analytics` table:

| Event | Data |
|-------|------|
| `wizard_step_completed` | case_id, step_id, duration_seconds |
| `wizard_step_skipped` | case_id, step_id |
| `wizard_abandoned` | case_id, step_id, time_spent |
| `ai_generation_used` | case_id, feature, model, tokens |
| `ai_generation_edited` | case_id, feature, edit_distance |
| `feature_accessed` | case_id, feature_name |
| `case_outcome_recorded` | case_id, outcome, dispute_type, court_type |
| `deadline_met` | case_id, deadline_key |
| `deadline_missed` | case_id, deadline_key |

**C) Aggregate insights API:**
- `GET /api/analytics/benchmarks?dispute_type=X&court_type=Y` — returns anonymized benchmarks
- Computed nightly via cron from `case_analytics` events
- Stored in `analytics_benchmarks` table (dispute_type, court_type, metric, value, sample_size)
- Minimum sample size of 10 before showing benchmarks (privacy)

**DB tables:**
```sql
CREATE TABLE case_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid REFERENCES cases(id),
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE analytics_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_type text NOT NULL,
  court_type text,
  metric text NOT NULL,
  value numeric NOT NULL,
  sample_size int NOT NULL,
  computed_at timestamptz DEFAULT now()
);
```

**New files:**
- `src/lib/analytics/track.ts` — `trackEvent(caseId, eventType, payload)` utility
- `src/lib/analytics/benchmarks.ts` — benchmark computation logic
- `src/components/dashboard/case-comparison-card.tsx` — user-facing widget
- `src/app/api/analytics/benchmarks/route.ts` — benchmarks API
- `src/app/api/cron/compute-benchmarks/route.ts` — nightly cron

---

## Cross-Cutting Concerns

### Stripe Integration (Features #3, #5)
- Single Stripe setup shared by freemium subscriptions and attorney review payments
- Webhook handler at `/api/webhooks/stripe`
- Environment variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Push Notifications (Features #6, #7)
- Web Push API for deadline reminders and insight alerts
- `push_subscriptions` table: user_id, endpoint, p256dh, auth
- VAPID keys in environment variables

### Cron Jobs (Features #7, #10)
- `POST /api/cron/generate-insights` — daily insight generation
- `POST /api/cron/compute-benchmarks` — nightly benchmark computation
- `POST /api/cron/weekly-digest` — Sunday evening digest emails
- Triggered by Vercel Cron or external scheduler

---

## Database Migration Summary

| Table | Feature | Purpose |
|-------|---------|---------|
| `user_subscriptions` | #5 | Subscription tier and Stripe IDs |
| `ai_usage` | #5 | Monthly AI generation counter |
| `case_confidence_scores` | #4 | Confidence score snapshots |
| `case_insights` | #7 | Proactive intelligence alerts |
| `case_analytics` | #10 | Event tracking |
| `analytics_benchmarks` | #10 | Aggregated comparison data |
| `attorney_reviews` | #3 | Document review requests |
| `push_subscriptions` | #6 | Web Push notification endpoints |
| `cases.outcome` | #1 | Case outcome tracking |
| `cases.hearing_date` | #1 | Hearing date tracking |
| New tasks in seed | #1, #8 | Post-filing and courtroom prep tasks |

---

## Success Metrics

| Feature | Primary Metric | Target |
|---------|---------------|--------|
| #1 Post-Filing | Retention at 30 days post-filing | 60% (vs. current ~20%) |
| #2 Assessment Pages | Organic signups from assessment | 30% of new users |
| #3 Attorney Marketplace | Reviews purchased per month | 50+ in first quarter |
| #4 Confidence Score | Wizard completion rate | +15% improvement |
| #5 Freemium | Monthly recurring revenue | $5K MRR in 3 months |
| #6 PWA | Mobile session duration | +40% |
| #7 Proactive Intelligence | Insight engagement rate | 50% of insights acted on |
| #8 Courtroom Companion | Hearing prep completion | 80% of users with hearings |
| #9 Mobile-First | Mobile conversion rate | Parity with desktop |
| #10 Analytics | Feature adoption visibility | Dashboard for all metrics |
