# Email & Phone Authentication Design

**Goal:** Add phone number (SMS OTP) login/signup alongside existing email/password auth, giving users two ways to access the app.

**Architecture:** Extends existing Supabase email/password auth with phone OTP. Tab switcher on login/signup pages. Supabase handles phone auth natively via `signInWithOtp`/`verifyOtp`. No new tables needed.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase Auth (phone OTP via Twilio), vitest

---

## Section 1: Auth Flow Architecture

### Login Page — Two Tabs
- **Email tab** (default): Existing email + password form. No changes.
- **Phone tab**: Enter phone number -> click "Send Code" -> `supabase.auth.signInWithOtp({ phone })` -> show OTP input (6 digits) -> `supabase.auth.verifyOtp({ phone, token, type: 'sms' })` -> redirect to `/cases`

### Signup Page — Two Tabs
- **Email tab** (default): Existing email + password form. No changes.
- **Phone tab**: Enter phone number -> click "Send Code" -> `supabase.auth.signInWithOtp({ phone })` -> OTP input -> verify -> redirect to `/cases`. Supabase auto-creates the user on first phone OTP verification (no separate signup needed).

### Key Points
- Supabase treats phone OTP as both signup AND login — `signInWithOtp` creates the account if it doesn't exist
- No password needed for phone users
- Existing email/password users are unaffected
- Phone numbers stored in Supabase `auth.users.phone` column (built-in)
- User menu shows email OR phone number (whichever they signed up with)

---

## Section 2: UI Components

### Tab Switcher
A simple "Email / Phone" toggle at the top of the auth card. Two buttons styled as tabs — selected tab has primary styling, unselected is muted.

### Phone Auth Form (shared between login & signup)
1. **Phone input state**: Text input with `+1` prefix placeholder (US numbers), "Send Code" button
2. **OTP input state**: 6-digit code input, countdown timer (60s resend cooldown), "Verify" button, "Resend Code" link
3. Error handling: invalid phone format, wrong OTP code, expired OTP, rate limiting

### Component Structure
- `src/components/auth/auth-tabs.tsx` — Tab switcher component (Email | Phone)
- `src/components/auth/phone-otp-form.tsx` — Phone number input + OTP verification (reused on both login and signup pages)
- Modify existing `login/page.tsx` and `signup/page.tsx` to wrap current forms with tabs

### User Menu Update
- `user-menu.tsx` — Display phone number when email is null (phone-only users show their number instead of email)

---

## Section 3: Supabase Configuration & Backend

### Supabase Config (`supabase/config.toml`)
- Enable phone signup: `enable_signup = true` (under `[auth.sms]`)
- Enable phone confirmations: `enable_confirmations = true`
- SMS provider: Twilio (configured via Supabase dashboard, not in code)
- OTP expiry: 60 seconds (default)
- Rate limit: 30 SMS per hour (already set)

### No Database Changes
- Phone numbers are stored in Supabase's built-in `auth.users.phone` column
- No new tables or migrations needed
- Existing RLS policies work unchanged (they use `auth.uid()`, not email)

### Middleware — No Changes
- Middleware checks `supabase.auth.getUser()` which works for both email and phone users
- Route protection is identity-agnostic

### Settings Page Update
- Show phone number (read-only) in profile section when user has one
- Phone-only users see phone instead of email
- Password change section hidden for phone-only users (they have no password)

---

## Section 4: Testing & Implementation Strategy

### Testing (~12 tests)
- `tests/unit/auth/phone-otp-form.test.tsx` — Component tests:
  - Renders phone input initially
  - Shows OTP input after sending code
  - Validates phone number format
  - Handles resend cooldown timer
  - Displays error messages
- `tests/unit/auth/auth-tabs.test.tsx` — Tab switcher tests:
  - Renders Email and Phone tabs
  - Switches between tabs
  - Default tab is Email

### Implementation Strategy — 10-Person Team

#### Batch 1 (Foundation)
1. Supabase config update (enable SMS auth in `config.toml`)
2. Auth tab switcher component + phone OTP form component

#### Batch 2 (Wiring, parallel)
3. Update login page with tabs + phone OTP
4. Update signup page with tabs + phone OTP
5. Update user menu + settings for phone users

#### Batch 3 (Verification)
6. Full test suite + build verification

### Out of Scope
- Social login (Google, Apple, GitHub)
- Multi-factor authentication (MFA)
- Phone number formatting/international support (US-only `+1` for now)
- SMS provider setup (user configures Twilio in Supabase dashboard)
