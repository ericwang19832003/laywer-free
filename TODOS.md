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

### P3 — Full dashboard redesign
**What:** Reduce 27 dashboard cards to a focused, prioritized view.
**Why:** Information overload. Users can't find what matters.
**Context:** Dashboard Focus Mode (Guided Depth Phase 3) addresses this for PI/Debt/Landlord types. Full redesign for all 10 types deferred.
**Effort:** L (human: ~2 weeks / CC: ~2 hours)
