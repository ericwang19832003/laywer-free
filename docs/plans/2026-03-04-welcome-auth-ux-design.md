# Welcome Page & Auth UX Improvement Design

**Goal:** Replace the blank redirect-only root page with a split-screen welcome page that communicates value and provides polished auth, including forgot password, password strength indicator, and friendlier error messages.

**Architecture:** Single unified welcome page at `/` with value proposition on the left and auth card on the right. Login/signup toggle within the card replaces separate pages. Forgot password flow stays in-card. Reset password callback is a new page.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase Auth, vitest

---

## Section 1: Split-Screen Welcome Page Layout

**Route:** `/` (replaces current redirect-only page)

**Layout:** Two-column split on desktop (left 55% / right 45%), stacked on mobile (value prop on top, auth card below).

**Left Panel (Value Proposition):**
- Background: subtle warm gradient (`#FAFAF8` to `#F5F5F0`)
- App name "Lawyer Free" as a text logo (clean typography, primary color)
- Headline: "Organize your legal situation with calm, structured guidance"
- 3 benefit items with Lucide icons:
  - "Step-by-step case management" (ClipboardList)
  - "Know your deadlines and next moves" (Calendar)
  - "AI-drafted legal documents" (FileText)
- Reassuring tagline: "Free to use. No lawyers required."

**Right Panel:** Auth card centered vertically on white/warm background.

**Mobile:** Left panel collapses to compact header (logo + headline only), auth card takes full width.

**Routing:**
- `/login` → redirects to `/?mode=login`
- `/signup` → redirects to `/?mode=signup`
- Middleware allows `/` and `/reset-password` for unauthenticated users
- Authenticated users hitting `/` still redirect to `/cases`

---

## Section 2: Auth Card — Login/Signup Toggle + Forms

**Toggle:** Two buttons at card top — "Sign In" / "Create Account". Selected = primary fill, unselected = outlined.

**Login Mode:**
- Title: "Welcome back"
- Email/Phone tabs (existing AuthTabs)
- Email tab: email + password + "Forgot password?" link
- Phone tab: existing PhoneOtpForm
- No "New here?" link (replaced by toggle)

**Signup Mode:**
- Title: "Let's get started" / Subtitle: "Create your free account. No credit card needed."
- Email/Phone tabs
- Email tab: email + password with strength indicator + "Create Account" button
- Phone tab: existing PhoneOtpForm

**Password Strength Indicator (signup only):**
- 4-segment bar below password field
- Red (weak) → amber (fair) → green (good) → green (strong)
- Rules: <6 = weak, 6-7 = fair, 8+ mixed case = good, 8+ mixed case + numbers + symbols = strong

**Friendlier Error Messages:**
- "Invalid login credentials" → "That email/password combination didn't work. Double-check and try again."
- "User already registered" → "An account with this email already exists. Try signing in instead."
- "Password should be at least 6 characters" → "Password needs at least 6 characters."

**Tab Transitions:** CSS `transition-all duration-200` on form content swap.

---

## Section 3: Forgot Password Flow

1. "Forgot password?" link → card switches to reset request view (no navigation)
2. Reset request: email input + "Send Reset Link" button + "Back to Sign In" link
3. Submit: `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
4. Success: "Check your email — we sent a password reset link to **{email}**." + "Back to Sign In"
5. Reset callback (`/reset-password`): catches Supabase redirect token, shows new password form, calls `updateUser({ password })`, redirects to `/cases`

**Middleware:** Add `/reset-password` to unauthenticated allow-list.

---

## Section 4: Testing & Implementation Strategy

**Files:**

| File | Action | Purpose |
|------|--------|---------|
| `src/app/page.tsx` | Rewrite | Split-screen welcome page |
| `src/app/login/page.tsx` | Rewrite | Redirect to `/?mode=login` |
| `src/app/signup/page.tsx` | Rewrite | Redirect to `/?mode=signup` |
| `src/app/reset-password/page.tsx` | Create | Password reset callback |
| `src/components/auth/auth-mode-toggle.tsx` | Create | Login/Signup toggle |
| `src/components/auth/password-strength.tsx` | Create | Password strength indicator |
| `src/components/auth/forgot-password-form.tsx` | Create | Reset request + success views |
| `src/components/auth/welcome-panel.tsx` | Create | Left panel value proposition |
| `src/middleware.ts` | Modify | Allow `/` and `/reset-password` for unauth |
| `tests/unit/auth/password-strength.test.ts` | Create | Strength calculation tests |
| `tests/unit/auth/auth-mode-toggle.test.tsx` | Create | Toggle component tests |

**Tests (~14):**
- Password strength: 5 tests (weak/fair/good/strong thresholds, empty)
- Auth mode toggle: 3 tests (renders, switches, default)
- Forgot password form: 4 tests (renders, submits, success, back link)
- Welcome panel: 2 tests (renders benefits, renders headline)

**Implementation order:**
1. Foundation components (welcome-panel, auth-mode-toggle, password-strength, forgot-password-form)
2. Welcome page (page.tsx rewrite)
3. Login/signup redirects + middleware update
4. Reset password page
5. Verification (tests + build)

## Out of Scope

- Social login (Google, GitHub, Apple)
- CAPTCHA / bot protection
- "Remember me" checkbox
- Post-signup onboarding wizard
- Email verification page
