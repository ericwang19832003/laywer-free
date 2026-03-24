# TODOs — Lawyer Free

## Deferred from CEO/Eng/Design Reviews (2026-03-22)

### P1 — Rate limit DB fallback
**What:** Add fallback to in-memory rate limiting when Supabase is unavailable.
**Why:** If the database is down, AI rate limits disappear entirely — attackers can spam expensive AI endpoints.
**Context:** Hybrid rate limiting stores AI/email limits in Supabase. When DB is unreachable, the `checkRateLimit` call fails. Need a try-catch that falls back to the in-memory Map store.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Hybrid rate limiting implementation (Sprint 1)

### P1 — Draft version save failure handling
**What:** Handle storage errors when saving draft versions.
**Why:** If version save fails silently, user thinks their edits are preserved but they're not. Trust-destroying for legal documents.
**Context:** Draft versioning (Sprint 2) will save prior drafts before regeneration. If the save fails, must alert user and block regeneration.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Draft versioning implementation (Sprint 2)

### P1 — Stripe webhook idempotency
**What:** Add idempotency keys to Stripe webhook processing to prevent double-charging.
**Why:** Stripe can retry webhooks. Without idempotency, a subscription event processed twice could double-charge or grant double access.
**Context:** Monetization infrastructure (Sprint 4). Use Stripe's event ID as idempotency key, store in a `processed_events` table.
**Effort:** S (human: ~4 hours / CC: ~10 min)
**Depends on:** Monetization/Stripe implementation (Sprint 4)

### P2 — Share token hardening
**What:** Replace UUID share tokens with longer base64url tokens, add expiration.
**Why:** UUIDs are guessable with enough attempts. Shared cases contain sensitive legal data.
**Context:** Current share_token is `randomUUID()`. Replace with `base64url(randomBytes(32))` and add `share_expires_at` column.
**Effort:** S (human: ~4 hours / CC: ~10 min)

### P2 — Input size limits on text fields
**What:** Add max-length validation to case description, notes, and other free-text API inputs.
**Why:** Prevents memory exhaustion from oversized payloads.
**Context:** No current limits on text_snippet in evidence categorize, description in case creation, etc.
**Effort:** S (human: ~2 hours / CC: ~5 min)

### P1 — AI response validation for document generation
**What:** Add schema validation on AI-generated document responses before returning to user.
**Why:** Empty or malformed AI output on a legal document is worse than an error — user might file gibberish. Currently uncaught.
**Context:** `POST /api/document-generation` passes AI output directly to client. Need Zod schema for expected doc structure, reject/retry on malformed.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Nothing

### P2 — AI abstraction layer
**What:** Create `src/lib/ai/client.ts` wrapping OpenAI/Anthropic calls with retry, validation, and structured logging.
**Why:** Citation verification, model switching, and response validation all need a single integration point. Currently OpenAI is called directly in route handlers.
**Context:** Enables cleaner Citation Verification (Guided Depth Phase 3) and model flexibility.
**Effort:** S (human: ~4 hours / CC: ~10 min)
**Depends on:** Nothing (but enables Citation Verification)

## Design Review TODOs (2026-03-23)

### P1 — 3-tab dashboard workbench
**What:** Restructure case dashboard from 25+ stacked cards into Focus/Overview/Tools tabs.
**Why:** NextStepCard (core value prop) is buried at position #7. Both Codex and Claude subagent flagged this as the #1 design problem. Users can't find what matters in a card dump.
**Context:** Focus tab: NextStep + Deadlines + Progress (what 90% of visits need). Overview tab: Health, Confidence, Comparison, Timeline, Insights. Tools tab: Discovery, Research, Motions, Notes, etc. Banners become one-time onboarding. Replaces the old P3 "Full dashboard redesign" TODO.
**Effort:** L (human: ~2 weeks / CC: ~2 hours)
**Depends on:** Nothing

### P1 — Problem-first landing page
**What:** Redesign welcome panel to lead with user's problem, add social proof, trust badges, and product screenshot.
**Why:** Landing page leads with brand name no one recognizes. No trust signals. Users in legal crisis bounce if they don't see their problem acknowledged in 3 seconds.
**Context:** Lead with "Facing a legal matter without a lawyer?" Add social proof ("12,000+ self-represented litigants"), 2 trust badges (encryption + data privacy), 1-2 product screenshots. Brand stays in nav.
**Effort:** M (human: ~1 week / CC: ~30 min)
**Depends on:** Nothing

### P1 — Milestone celebration system
**What:** Replace toast-only celebrations with contextual progress cards at key milestones.
**Why:** Product serves people in crisis; step completion and case creation get 4-second disappearing toasts — no emotional reinforcement.
**Context:** Step completion: progress card/modal ("3 of 12 steps done"). 50% milestone: encouragement (triggers once — needs state machine with defined source of truth). Case won: full celebration with savings estimate and share prompt. Celebrations are modals/overlays that work independently of dashboard layout.
**Effort:** M (human: ~1 week / CC: ~30 min)
**Depends on:** Nothing (ships independently of dashboard workbench)

### P1 — Design token cleanup (red→amber + hex→token)
**What:** (1) Replace all red-500 Tailwind classes with calm-amber/destructive tokens + add overdue remediation text. (2) Replace all inline style hex values with CSS custom property tokens. Merged per Codex review — same cleanup, one pass.
**Why:** DESIGN.md says "NEVER use red for urgency" but 6+ components use red-500. Landing page uses hardcoded hex instead of tokens, breaking dark mode. One token audit, one PR.
**Context:** Audit all components using red-500 (health card, deadlines, alerts, SOL banner, strategy, insights). Replace with calm-amber or destructive token. For overdue items: "This deadline has passed. Here's what you can do:" with action link. Also sweep auth components for inline hex → Tailwind token classes. Solve severity colors in Tailwind theme config, not a TypeScript utility.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Nothing

### P1 — Post-signup onboarding flow
**What:** 3-screen onboarding after first login: (1) How Lawyer Free works, (2) What's your situation? (situation cards), (3) Into case wizard pre-filled with dispute type.
**Why:** Post-signup empty state is the highest-anxiety moment with zero hand-holding. Users land confused on empty cases page.
**Context:** Screen 1: 3-step visual explaining the product. Screen 2: Situation cards (Being sued? Eviction? Debt? Family? Other). Selection pre-fills dispute type in new case wizard. Track onboarding completion via `user_preferences` table (not user_metadata — that's auth state, not product state). Needs migration: `CREATE TABLE user_preferences (user_id uuid primary key references auth.users, onboarding_completed boolean default false, created_at timestamptz default now())` with RLS.
**Effort:** M (human: ~1 week / CC: ~30 min)
**Depends on:** Nothing

### P2 — Trust-first pricing page redesign
**What:** Replace generic SaaS 3-card pricing grid with trust-first layout.
**Why:** Codex hard-rejected pricing as "textbook generic SaaS." For a legal product, looking like a commodity subscription undermines credibility.
**Context:** First viewport: who this is for + what "first case free" means + which plan in one glance. Single recommended plan highlighted, comparison table below. Add user testimonial.
**Effort:** M (human: ~1 week / CC: ~30 min)
**Depends on:** Nothing

### P2 — Full-screen wizard on mobile
**What:** Convert new case wizard from Dialog to full-screen page on mobile (< 768px).
**Why:** Wizard in 95vh modal overflows on some steps (court recommendation + county input). Mobile is cramped.
**Context:** Keep modal on desktop. Full-screen on mobile. Test every wizard step at 375px width. Also move "Back to dashboard" from top of guided steps to bottom or menu.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Nothing

### P1 — Email confirmation recovery flow
**What:** Add resend button, spam-folder guidance, and 30-second cooldown to email confirmation screen.
**Why:** Activation blocker — if confirmation email never arrives, user is stuck with no recovery path. Nothing else matters if users can't get in. Promoted to P1 per Codex review.
**Context:** After signup success state: add "Didn't get the email?" link with resend capability and "Check your spam folder" note.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Nothing

### P2 — Table-default cases list on desktop
**What:** Default to table/list view on desktop (1280px+), keep card view on mobile.
**Why:** Power users managing multiple cases scroll oversized card stacks. Table view is denser and more scannable.
**Context:** Case name, type, progress bar, next deadline, last activity in columns. Add visible toggle for user preference.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Nothing

### P1 — Dashboard error boundaries
**What:** Add error.tsx at route level + Suspense error boundaries per tab. Promoted to P1 per Codex review — must be in place before adding Suspense fragmentation.
**Why:** If any of 10+ parallel Supabase queries fail, the whole page crashes with no recovery. Trust-destroying for a user mid-legal-case.
**Context:** Use Next.js error.tsx convention (zero custom components). Page-level: "Something went wrong. Your case data is safe." with retry button. Each Suspense tab boundary catches its own errors. Ship BEFORE the 3-tab workbench restructure.
**Effort:** S (human: ~2 hours / CC: ~10 min)
**Depends on:** Nothing (but must ship BEFORE dashboard workbench)

### P2 — Design system extension
**What:** Extend DESIGN.md with spacing scale, typography hierarchy, card anatomy, animation tokens, empty state pattern, and card usage policy.
**Why:** Current design system is 4/10 specificity. Components use arbitrary spacing/typography values.
**Context:** Spacing: 4/8/12/16/24/32/48px. Typography: heading-page (2xl bold), heading-card (lg semibold), body (sm), caption (xs muted). Card anatomy: consistent padding/header/content. Animation: entrance (fade-in 150ms), hover (scale 1.02, 200ms), transition (colors 150ms). Empty state: warm illustration + primary action + context text. Card policy: cards only when grouping related actions or card IS the interaction.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Nothing

### P2 — Event tracking / analytics baseline
**What:** Add privacy-respecting analytics to capture baselines before shipping design changes.
**Why:** Dashboard restructure, onboarding, celebrations, and landing page changes need before/after data. Without baselines, optimizing blind.
**Context:** Posthog or Plausible. Minimum events: page views, tab switches, onboarding completion rate, celebration interactions, signup conversion, time-to-next-action on dashboard. Capture baselines BEFORE shipping design changes.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Nothing (but should ship before design changes to capture baselines)

## Design Review TODOs (2026-03-24)

### P1 — Reorder Focus Tab hierarchy
**What:** Move NextStepCard to position #1 on Focus tab. Push informational banners (ProSeBanner, BackfillBanner) below ProgressCard.
**Why:** NextStepCard is the core value prop but is buried at position #5 behind 4 informational banners. Claude subagent independently flagged this as the #1 design problem. Users in legal crisis need to see their next action within 2 seconds.
**Context:** New order: NextStepCard → PriorityAlerts → SOL Banner → DeadlinesCard → ProgressCard → CaseHealthCard → ProSeBanner/BackfillBanner → FilingInstructions → OutcomePrompt → SavingsCard. Edit `focus-tab.tsx` render order.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** Nothing (but should ship before dashboard workbench restructure)

### P1 — Distinct overdue deadline styling
**What:** Use destructive token (bg-destructive/10 + destructive text + icon) for overdue deadlines instead of same amber as "due today."
**Why:** Overdue and "due today" deadlines currently look identical (both amber). A user can miss that a critical court deadline already passed. Trust-destroying.
**Context:** In DeadlinesCard, change overdue border from `border-amber-500` to `border-destructive`. Add background `bg-destructive/10`. Text: "This deadline passed on [date]. Here's what you can do:" with action link. Respects DESIGN.md spirit (destructive token, not raw red-500).
**Effort:** S (human: ~2 hours / CC: ~10 min)
**Depends on:** Nothing

### P2 — Health score human-readable labels
**What:** Add labels to health score ranges: 0-39 "Needs attention" (destructive), 40-69 "On track" (amber), 70-100 "Strong position" (green). Document thresholds in DESIGN.md.
**Why:** Bare number "68" means nothing to a non-technical user in legal crisis. Labels provide instant understanding.
**Context:** Update CaseHealthCard + case-card.tsx to show label next to score. Add score range documentation to DESIGN.md. Handle null state: "Health · Pending" with muted styling.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Nothing

### P2 — Consolidate priority banner logic
**What:** Create a shared `<PriorityBanners>` server component encapsulating `getPriorityCards()` + banner rendering. Both FocusTab and OverviewTab import it.
**Why:** Currently `getPriorityCards()` logic and banner rendering is duplicated between FocusTab and OverviewTab. Adding a new dispute type's filing instructions requires updating both files or one tab will be wrong.
**Context:** Extract SOL Banner + Filing Instructions banner logic into one component. Both tabs pass case data props; component decides which banners to show and renders them.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Nothing

### P2 — Deadline source labels (confirmed vs estimated)
**What:** Display "Confirmed" vs "Estimated" labels on deadline cards. When confirmed deadline exists alongside estimated, show both with confirmed prominent and estimated in smaller text below.
**Why:** Currently DeadlinesCard silently filters out estimated deadlines when confirmed exists. User never sees which version was used, potentially planning around the wrong date.
**Context:** Update DeadlinesCard to show source label inline: "Answer deadline · July 15 · Confirmed". If both exist: show confirmed prominently + "Originally estimated: July 12" in smaller muted text below.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Nothing

## Eng Review TODOs (2026-03-24)

### P1 — Banner self-dismiss after first view
**What:** Add dismiss logic to ProSeBanner, BackfillBanner, and SolBanner so they show once (or a few times), not on every dashboard visit.
**Why:** Outside voice caught that informational banners render on EVERY dashboard visit. Users see "Pro se means representing yourself" on their 50th visit. This is stale content noise that buries the core value prop even after reordering.
**Context:** ProSeBanner already has localStorage dismiss. Apply same pattern to BackfillBanner and SolBanner. Alternatively, track banner dismissal in user_preferences table for cross-device persistence. Show banners max 3 times, then auto-dismiss.
**Effort:** S (human: ~4 hours / CC: ~10 min)
**Depends on:** Focus tab reorder (should ship together)

### P1 — Onboarding dispute type pre-fill wiring
**What:** Wire the onboarding flow's dispute type selection through to the new case wizard so users don't re-select their situation.
**Why:** Outside voice caught that handleSelect() stores dispute type in sessionStorage but the new case wizard doesn't read it. Users pick "Being sued" in onboarding, then land in wizard with no pre-fill — friction at highest-anxiety moment.
**Context:** OnboardingFlow stores `sessionStorage.setItem('onboarding_dispute_type', disputeType)`. NewCaseDialog needs to read this on mount and pre-select the dispute type step. Clear sessionStorage after use.
**Effort:** S (human: ~2 hours / CC: ~5 min)
**Depends on:** Nothing

### P2 — Eliminate duplicate queries between layout and dashboard
**What:** Remove redundant Supabase queries in case layout.tsx that are also fetched by FocusTab/OverviewTab RPCs.
**Why:** Outside voice found layout.tsx makes 7 parallel queries (tasks, deadlines, risk_score) that duplicate what the tab-level RPCs also fetch. Double-fetching on every dashboard visit.
**Context:** Audit layout.tsx queries vs get_case_dashboard RPC return data. Remove layout queries for data already in RPC. Pass RPC data down via props or React context instead.
**Effort:** S (human: ~4 hours / CC: ~15 min)
**Depends on:** N+1 RPC fix (include task metadata in RPC)
