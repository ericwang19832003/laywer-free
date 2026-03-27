# TODOs — Lawyer Free

## Deferred from CEO/Eng/Design Reviews (2026-03-22)

### ~~P1 — Rate limit DB fallback~~ ✅ DONE (2026-03-24)
Fallback already existed in checkDistributedRateLimit. 6 tests added in commit `2d0c2ef`.

### ~~P1 — Draft version save failure handling~~ ✅ DONE (2026-03-24)
Draft viewers now block regeneration on save failure with error banner. Commit `ea96c59`. 6 tests.

### P1 — Stripe webhook idempotency
**What:** Add idempotency keys to Stripe webhook processing to prevent double-charging.
**Why:** Stripe can retry webhooks. Without idempotency, a subscription event processed twice could double-charge or grant double access.
**Context:** Monetization infrastructure (Sprint 4). Use Stripe's event ID as idempotency key, store in a `processed_events` table.
**Effort:** S (human: ~4 hours / CC: ~10 min)
**Depends on:** Monetization/Stripe implementation (Sprint 4)

### ~~P2 — Share token hardening~~ ✅ DONE (2026-03-24)
Replaced UUID with base64url(256-bit) + 30-day expiration. Migration included. Commit `02ac859`. 6 tests.

### ~~P2 — Input size limits on text fields~~ ✅ DONE (2026-03-24)
Case description 5000 chars, notes 10000. Commit `e22f7b3`. 11 tests.

### ~~P1 — AI response validation for document generation~~ ✅ DONE (2026-03-24)
Added paragraph structure + gibberish detection to Zod schema. Commit `afc5725`. 14 tests.

### ~~P2 — AI abstraction layer~~ ✅ DONE (2026-03-24)
Created src/lib/ai/client.ts with retry, Zod validation, typed errors, structured logging. Commit `2d75e7b`. 17 tests.

## Design Review TODOs (2026-03-23)

### P1 — 3-tab dashboard workbench
**What:** Restructure case dashboard from 25+ stacked cards into Focus/Overview/Tools tabs.
**Why:** NextStepCard (core value prop) is buried at position #7. Both Codex and Claude subagent flagged this as the #1 design problem. Users can't find what matters in a card dump.
**Context:** Focus tab: NextStep + Deadlines + Progress (what 90% of visits need). Overview tab: Health, Confidence, Comparison, Timeline, Insights. Tools tab: Discovery, Research, Motions, Notes, etc. Banners become one-time onboarding. Replaces the old P3 "Full dashboard redesign" TODO.
**Effort:** L (human: ~2 weeks / CC: ~2 hours)
**Depends on:** Nothing

### ~~P1 — Problem-first landing page~~ ✅ DONE (2026-03-24)
Shipped in commit `213c1f3`. Welcome panel leads with "Facing a legal matter without a lawyer?"

### ~~P1 — Milestone celebration system~~ ✅ DONE (2026-03-24)
Modal overlays for step completion, 50% milestone, case resolved. localStorage per case. Commit `3e5f3d3`. 33 tests.

### ~~P1 — Design token cleanup (red→amber + hex→token)~~ ✅ DONE (2026-03-24)
Auth components (commit `2db3223`) + full codebase audit of 37 files (commit `98d7f0f`).

### ~~P1 — Post-signup onboarding flow~~ ✅ DONE (2026-03-24)
3-screen flow: How it works → Situation cards → Case wizard pre-fill. Commit `d29c0c7`. 9 tests.

### ~~P2 — Trust-first pricing page redesign~~ ✅ DONE (2026-03-24)
Trust-first layout with recommended plan, comparison table, testimonial. Commit `1bfc1f4`.

### ~~P2 — Full-screen wizard on mobile~~ ✅ DONE (2026-03-24)
CSS-only responsive fix via max-sm: utilities. Commit `b3718af`. 4 tests.

### ~~P1 — Email confirmation recovery flow~~ ✅ DONE (2026-03-24)
Already existed in welcome-auth-card.tsx. Added 4 tests in commit `77a359c`.

### ~~P2 — Table-default cases list on desktop~~ ✅ DONE (2026-03-24)
Table view on desktop 1280px+, cards on mobile. Toggle with localStorage. Commit `37e7959`. 16 tests.

### ~~P1 — Dashboard error boundaries~~ ✅ DONE (2026-03-24)
Shipped in commit `8cd936c`. Route-level error.tsx + tab-level try/catch. 3 tests.

### ~~P2 — Design system extension~~ ✅ DONE (2026-03-24)
Added spacing, typography, card anatomy, animation tokens, empty state, card policy to DESIGN.md. Commit `4580f88`.

### ~~P2 — Event tracking / analytics baseline~~ ✅ DONE (2026-03-24)
Plausible analytics with typed event catalogue. Domain via env var. Commit `e9abeaf`. 10 tests.

## Design Review TODOs (2026-03-24)

### ~~P1 — Reorder Focus Tab hierarchy~~ ✅ DONE (2026-03-24)
Shipped in commit `932bf63`. NextStepCard moved to position #1 on Focus tab.

### ~~P1 — Distinct overdue deadline styling~~ ✅ DONE (2026-03-24)
Shipped in commit `2e3cb3e`. Destructive tokens for overdue, amber for due-today. 11 tests.

### ~~P2 — Health score human-readable labels~~ ✅ DONE (2026-03-24)
0-39 "Needs attention", 40-69 "On track", 70-100 "Strong position". Null shows "Pending". Commit `7bba938`. 15 tests.

### ~~P2 — Consolidate priority banner logic~~ ✅ DONE (2026-03-24)
Shared <PriorityBanners> component replaces duplicated logic in FocusTab/OverviewTab. Commit `51bff0f`. 8 tests.

### ~~P2 — Deadline source labels (confirmed vs estimated)~~ ✅ DONE (2026-03-24)
"Confirmed" (green) / "Estimated" (amber) badges inline. Shows "Originally estimated" when superseded. Commit `0c5c30a`. 9 tests.

## Eng Review TODOs (2026-03-24)

### ~~P1 — Banner self-dismiss after first view~~ ✅ DONE (2026-03-24)
Shipped in commits `4a4724f` + `256e9bb`. Auto-dismiss after 3 views; critical SOL banners exempt. 10 tests.

### ~~P1 — Onboarding dispute type pre-fill wiring~~ ✅ DONE (2026-03-24)
Already implemented. 5 tests added in commit `691ea9a`.

### P2 — Eliminate duplicate queries between layout and dashboard
**What:** Remove redundant Supabase queries in case layout.tsx that are also fetched by FocusTab/OverviewTab RPCs.
**Why:** Outside voice found layout.tsx makes 7 parallel queries (tasks, deadlines, risk_score) that duplicate what the tab-level RPCs also fetch. Double-fetching on every dashboard visit.
**Status:** INVESTIGATED — queries are NOT redundant. All 7 feed the layout shell (WorkflowSidebar, ContextSidebar, MobileSidebarDrawer). Tabs fetch their own versions with different columns. Next.js server components can't pass data upward from children to layout. Closing as "won't fix."
