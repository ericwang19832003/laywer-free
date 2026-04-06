# Security Hardening Design

**Date:** 2026-03-04
**Status:** Approved

## Goal

Close 12 security findings (3 HIGH, 5 MEDIUM, 4 LOW) identified during a comprehensive security audit, hardening the application for production deployment.

## Architecture: Layered Defense

Each finding is fixed at its natural layer — RLS in migrations, rate limiting as a utility, headers in next.config, auth refactoring in shared utilities. Fixes are independent, testable, and ship incrementally.

## Audit Summary

| Severity | Count | Findings |
|----------|-------|----------|
| HIGH | 3 | Shared case RLS leak, no rate limiting on AI routes, no security headers |
| MEDIUM | 5 | Middleware `/api` exemption, cron info leak, error log leak, email spam relay, nullable auth types |
| LOW | 4 | Password min length, no CSRF check, LIKE wildcard escape, no dependency scanning |

---

## Section 1: Shared Case RLS Fix (HIGH-1)

**Problem:** The `cases` RLS policy `WHERE share_enabled = true AND share_token IS NOT NULL` lets any authenticated user SELECT all shared cases. Child table policies (tasks, deadlines, evidence) that JOIN through `cases` also leak.

**Fix:**
1. Drop the overly broad SELECT policy on `cases`
2. Create `get_shared_case(p_token uuid)` as a `SECURITY DEFINER` function returning limited case fields only when the token matches
3. Create `get_shared_case_tasks(p_token uuid)` for child data
4. Update `/shared/[token]/page.tsx` to use `.rpc()` calls instead of direct table queries

**Key decisions:**
- SECURITY DEFINER functions bypass RLS intentionally — they validate the token themselves
- Only expose fields needed for the shared view (no user_id, no internal metadata)
- Child table access is also through RPC, not RLS pass-through

---

## Section 2: Rate Limiting (HIGH-2)

**Problem:** No rate limiting on any of the 67 API routes. AI routes (Anthropic, OpenAI) incur per-token costs. Email routes can be abused as spam relays.

**Fix:**
- Create `src/lib/security/rate-limit.ts` with in-memory sliding window rate limiter
- `checkRateLimit(userId, endpoint, { maxRequests, windowMs })` returns boolean
- `withRateLimit()` wrapper returns 429 + `Retry-After` header on limit exceeded

**Tiers:**

| Tier | Routes | Limit |
|------|--------|-------|
| AI generation | generate-filing, strategy, risk/tips, research/ask, evidence/categorize, ai/* | 10 req/user/hour |
| Email sending | preservation-letter/send, meet-and-confer/send | 5 req/user/hour |
| Standard CRUD | All other routes | 60 req/user/minute |

**Design:**
- In-memory Map store (suitable for single Vercel instance; upgrade to Upstash Redis later)
- Sliding window algorithm: stores timestamps per user+endpoint key
- Automatic cleanup of expired entries every 5 minutes
- Key format: `${userId}:${endpoint}`

---

## Section 3: Security Headers (HIGH-3)

**Problem:** `next.config.ts` has no security headers.

**Fix:** Add `headers()` to next.config.ts:

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'` | XSS protection |
| X-Frame-Options | DENY | Clickjacking protection |
| X-Content-Type-Options | nosniff | MIME sniffing protection |
| Referrer-Policy | strict-origin-when-cross-origin | Prevent legal URLs in referrers |
| Strict-Transport-Security | max-age=31536000; includeSubDomains | Force HTTPS |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Disable unused browser features |

---

## Section 4: Middleware Auth Tightening (MEDIUM-1)

**Problem:** Middleware blanket-exempts all `/api` routes from auth redirection.

**Fix:** Replace `!request.nextUrl.pathname.startsWith('/api')` with a whitelist:
```
const PUBLIC_PATHS = ['/', '/login', '/signup', '/reset-password', '/shared']
const PUBLIC_API_PREFIXES = ['/api/cron']
```

All other `/api/*` routes get middleware-level session validation as defense-in-depth. Routes still validate auth internally via `getAuthenticatedClient()`, but middleware catches any new route that forgets.

---

## Section 5: Error Logging Cleanup (MEDIUM-2, MEDIUM-3)

**Problem:** Cron endpoints return internal case IDs. 14 routes log full error objects that may contain API keys.

**Fix:**
1. Create `src/lib/security/safe-log.ts`:
   ```typescript
   export function safeError(context: string, err: unknown): void {
     const message = err instanceof Error ? err.message : String(err)
     console.error(`[${context}]`, message)
   }
   ```
2. Replace all `console.error('[context] Error:', err)` with `safeError('context', err)`
3. Cron health/escalation endpoints: return only aggregate counts, log details server-side

---

## Section 6: Email Safety (MEDIUM-4)

**Problem:** Email routes accept arbitrary recipients with no rate limiting.

**Fix:**
- Apply rate limit tier (5/user/hour) to both email-sending routes
- Add audit logging: `console.log('[email] user=${userId} to=${email} template=${type}')`
- No recipient allowlisting for now (users legitimately need to email opposing parties)

---

## Section 7: Auth Types Refactoring (MEDIUM-5)

**Problem:** `getAuthenticatedClient()` returns nullable types; consumers use `supabase!` non-null assertions.

**Fix:** Refactor to discriminated union:
```typescript
type AuthResult =
  | { ok: true; supabase: SupabaseClient; user: User }
  | { ok: false; error: NextResponse }
```

Consumer pattern becomes:
```typescript
const auth = await getAuthenticatedClient()
if (!auth.ok) return auth.error
const { supabase, user } = auth
// supabase is correctly typed as non-null
```

This is a breaking change across 65 routes. Apply with find-and-replace pattern.

---

## Section 8: Minor Hardening (LOW-1 to LOW-4)

**LOW-1: Password minimum 6 → 8**
- Update `src/lib/auth/password-strength.ts` MIN_LENGTH constant
- Update `src/app/reset-password/page.tsx` validation
- Update any related test assertions

**LOW-2: CSRF Origin check**
- Add Origin header verification in middleware for POST/PATCH/DELETE requests
- Allow same-origin and Supabase domains
- Return 403 for cross-origin state-mutating requests without valid Origin

**LOW-3: LIKE wildcard escaping**
- In `src/app/api/search/route.ts`, escape `%` and `_` in user input before building LIKE patterns

**LOW-4: Dependency scanning**
- Add `"audit": "npm audit --production"` to package.json scripts
- Document in README that this should run in CI

---

## File Summary

| File | Action | Section |
|------|--------|---------|
| `supabase/migrations/20260304200001_fix_shared_case_rls.sql` | Create | 1 |
| `src/app/shared/[token]/page.tsx` | Modify | 1 |
| `src/lib/security/rate-limit.ts` | Create | 2 |
| 15+ API route files | Modify | 2 |
| `next.config.ts` | Modify | 3 |
| `src/middleware.ts` | Modify | 4 |
| `src/lib/security/safe-log.ts` | Create | 5 |
| 14 API route files | Modify | 5 |
| `src/app/api/cron/health/route.ts` | Modify | 5 |
| `src/app/api/cron/escalation/route.ts` | Modify | 5 |
| 2 email route files | Modify | 6 |
| `src/lib/supabase/route-handler.ts` | Modify | 7 |
| 65 API route files | Modify | 7 |
| `src/lib/auth/password-strength.ts` | Modify | 8 |
| `src/app/reset-password/page.tsx` | Modify | 8 |
| `src/app/api/search/route.ts` | Modify | 8 |
| `package.json` | Modify | 8 |
