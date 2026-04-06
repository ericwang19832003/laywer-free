# Email & Phone Authentication Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add phone number (SMS OTP) login/signup alongside existing email/password auth via a tab switcher on login/signup pages.

**Architecture:** Extends existing Supabase email/password auth with phone OTP. Tab switcher component wraps existing email forms. Phone OTP form is shared between login and signup. Supabase handles phone auth natively via `signInWithOtp`/`verifyOtp`. No new tables needed.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase Auth (phone OTP via Twilio), vitest

---

## Task 1: Supabase Config — Enable SMS Auth

**Files:**
- Modify: `supabase/config.toml`

**Changes:**

In `[auth.sms]` section (line 238-246), change:
```toml
[auth.sms]
enable_signup = true
enable_confirmations = true
```

In `[auth.sms.twilio]` section (line 270-275), change:
```toml
[auth.sms.twilio]
enabled = true
```

No other config changes needed — `account_sid`, `message_service_sid`, and `auth_token` are configured via Supabase dashboard / env vars for production.

---

## Task 2: Auth Tab Switcher Component + Tests (TDD)

**Files:**
- Create: `src/components/auth/auth-tabs.tsx`
- Create: `tests/unit/auth/auth-tabs.test.tsx`

**Tests (write first):**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthTabs } from '@/components/auth/auth-tabs'

describe('AuthTabs', () => {
  it('renders Email and Phone tabs', () => {
    render(
      <AuthTabs activeTab="email" onTabChange={() => {}}>
        <div>content</div>
      </AuthTabs>
    )
    expect(screen.getByRole('button', { name: 'Email' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Phone' })).toBeDefined()
  })

  it('default active tab is Email', () => {
    render(
      <AuthTabs activeTab="email" onTabChange={() => {}}>
        <div>content</div>
      </AuthTabs>
    )
    const emailTab = screen.getByRole('button', { name: 'Email' })
    expect(emailTab.className).toContain('bg-primary')
  })

  it('calls onTabChange when Phone tab is clicked', () => {
    let changed = ''
    render(
      <AuthTabs activeTab="email" onTabChange={(tab) => { changed = tab }}>
        <div>content</div>
      </AuthTabs>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Phone' }))
    expect(changed).toBe('phone')
  })

  it('renders children', () => {
    render(
      <AuthTabs activeTab="email" onTabChange={() => {}}>
        <div data-testid="child">hello</div>
      </AuthTabs>
    )
    expect(screen.getByTestId('child')).toBeDefined()
  })
})
```

**Component:**

```typescript
'use client'

import { ReactNode } from 'react'

export type AuthTabValue = 'email' | 'phone'

interface AuthTabsProps {
  activeTab: AuthTabValue
  onTabChange: (tab: AuthTabValue) => void
  children: ReactNode
}

export function AuthTabs({ activeTab, onTabChange, children }: AuthTabsProps) {
  return (
    <div>
      <div className="flex gap-1 mb-6 p-1 bg-warm-bg rounded-lg">
        <button
          type="button"
          role="button"
          onClick={() => onTabChange('email')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'email'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-warm-muted hover:text-warm-text'
          }`}
        >
          Email
        </button>
        <button
          type="button"
          role="button"
          onClick={() => onTabChange('phone')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'phone'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-warm-muted hover:text-warm-text'
          }`}
        >
          Phone
        </button>
      </div>
      {children}
    </div>
  )
}
```

---

## Task 3: Phone OTP Form Component + Tests (TDD)

**Files:**
- Create: `src/components/auth/phone-otp-form.tsx`
- Create: `tests/unit/auth/phone-otp-form.test.tsx`

**Tests (write first):**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'

// Mock supabase client
const mockSignInWithOtp = vi.fn()
const mockVerifyOtp = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: mockSignInWithOtp,
      verifyOtp: mockVerifyOtp,
    },
  }),
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PhoneOtpForm', () => {
  it('renders phone input initially', () => {
    render(<PhoneOtpForm />)
    expect(screen.getByLabelText('Phone Number')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Send Code' })).toBeDefined()
  })

  it('does not show OTP input initially', () => {
    render(<PhoneOtpForm />)
    expect(screen.queryByLabelText('Verification Code')).toBeNull()
  })

  it('validates phone number format', async () => {
    render(<PhoneOtpForm />)
    const phoneInput = screen.getByLabelText('Phone Number')
    fireEvent.change(phoneInput, { target: { value: '123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByText(/enter a valid.*phone number/i)).toBeDefined()
    })
    expect(mockSignInWithOtp).not.toHaveBeenCalled()
  })

  it('shows OTP input after sending code', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<PhoneOtpForm />)
    const phoneInput = screen.getByLabelText('Phone Number')
    fireEvent.change(phoneInput, { target: { value: '+12125551234' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeDefined()
    })
  })

  it('calls signInWithOtp with phone number', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(mockSignInWithOtp).toHaveBeenCalledWith({ phone: '+12125551234' })
    })
  })

  it('displays error when OTP send fails', async () => {
    mockSignInWithOtp.mockResolvedValue({
      error: { message: 'Rate limit exceeded' },
    })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByText('Rate limit exceeded')).toBeDefined()
    })
  })

  it('redirects on successful OTP verification', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      data: { session: { access_token: 'tok' } },
      error: null,
    })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeDefined()
    })
    fireEvent.change(screen.getByLabelText('Verification Code'), {
      target: { value: '123456' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }))
    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        phone: '+12125551234',
        token: '123456',
        type: 'sms',
      })
      expect(mockPush).toHaveBeenCalledWith('/cases')
    })
  })

  it('displays error on wrong OTP', async () => {
    mockSignInWithOtp.mockResolvedValue({ error: null })
    mockVerifyOtp.mockResolvedValue({
      data: { session: null },
      error: { message: 'Invalid OTP' },
    })
    render(<PhoneOtpForm />)
    fireEvent.change(screen.getByLabelText('Phone Number'), {
      target: { value: '+12125551234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Code' }))
    await waitFor(() => {
      expect(screen.getByLabelText('Verification Code')).toBeDefined()
    })
    fireEvent.change(screen.getByLabelText('Verification Code'), {
      target: { value: '000000' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Verify' }))
    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeDefined()
    })
  })
})
```

**Component:**

```typescript
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const PHONE_REGEX = /^\+1\d{10}$/

export function PhoneOtpForm() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  function startCooldown() {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  async function handleSendCode() {
    setError(null)

    if (!PHONE_REGEX.test(phone)) {
      setError('Please enter a valid US phone number (e.g. +12125551234)')
      return
    }

    setLoading(true)
    const { error } = await getSupabase().auth.signInWithOtp({ phone })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
      startCooldown()
    }
  }

  async function handleVerify() {
    setError(null)
    setLoading(true)

    const { error } = await getSupabase().auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/cases')
      router.refresh()
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError(null)
    setLoading(true)
    const { error } = await getSupabase().auth.signInWithOtp({ phone })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      startCooldown()
    }
  }

  if (step === 'otp') {
    return (
      <div className="space-y-4">
        <p className="text-sm" style={{ color: '#78716C' }}>
          We sent a 6-digit code to <strong>{phone}</strong>
        </p>
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            required
          />
        </div>
        {error && (
          <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
        )}
        <Button
          type="button"
          className="w-full"
          disabled={loading || otp.length !== 6}
          onClick={handleVerify}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
        <p className="text-center text-sm" style={{ color: '#78716C' }}>
          {resendCooldown > 0 ? (
            <>Resend code in {resendCooldown}s</>
          ) : (
            <button
              type="button"
              className="text-primary underline"
              onClick={handleResend}
              disabled={loading}
            >
              Resend Code
            </button>
          )}
        </p>
        <button
          type="button"
          className="w-full text-center text-sm text-primary underline"
          onClick={() => {
            setStep('phone')
            setOtp('')
            setError(null)
          }}
        >
          Change phone number
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+12125551234"
          required
        />
        <p className="text-xs" style={{ color: '#78716C' }}>
          US numbers only. Include country code +1.
        </p>
      </div>
      {error && (
        <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
      )}
      <Button
        type="button"
        className="w-full"
        disabled={loading || !phone}
        onClick={handleSendCode}
      >
        {loading ? 'Sending...' : 'Send Code'}
      </Button>
    </div>
  )
}
```

---

## Task 4: Update Login Page with Tabs

**Files:**
- Modify: `src/app/login/page.tsx`

**Changes:**

Wrap existing email form with `AuthTabs`. Add phone tab content with `PhoneOtpForm`. Add state for active tab.

**Updated login page:**

```typescript
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AuthTabs, type AuthTabValue } from '@/components/auth/auth-tabs'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<AuthTabValue>('email')
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await getSupabase().auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/cases')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAFAF8' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold" style={{ color: '#1C1917' }}>Welcome back</CardTitle>
          <CardDescription style={{ color: '#78716C' }}>
            Sign in to continue managing your case.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthTabs activeTab={activeTab} onTabChange={setActiveTab}>
            {activeTab === 'email' ? (
              <>
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
                    <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm" style={{ color: '#78716C' }}>
                  New here?{' '}
                  <Link href="/signup" className="text-primary underline">
                    Create an account
                  </Link>
                </p>
              </>
            ) : (
              <>
                <PhoneOtpForm />
                <p className="mt-4 text-center text-sm" style={{ color: '#78716C' }}>
                  New here?{' '}
                  <Link href="/signup" className="text-primary underline">
                    Create an account
                  </Link>
                </p>
              </>
            )}
          </AuthTabs>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Task 5: Update Signup Page with Tabs

**Files:**
- Modify: `src/app/signup/page.tsx`

**Changes:**

Same pattern as login — wrap with `AuthTabs`, add `PhoneOtpForm` for phone tab.

**Updated signup page:**

```typescript
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { AuthTabs, type AuthTabValue } from '@/components/auth/auth-tabs'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<AuthTabValue>('email')
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await getSupabase().auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/cases')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAFAF8' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold" style={{ color: '#1C1917' }}>
            Let&apos;s get started
          </CardTitle>
          <CardDescription style={{ color: '#78716C' }}>
            Create your free account. No credit card needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm" style={{ color: '#1C1917' }}>
                Check your email to confirm your account.
              </p>
              <p className="text-sm" style={{ color: '#78716C' }}>
                We sent a confirmation link to <strong>{email}</strong>.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-2">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'email' ? (
                <>
                  <form onSubmit={handleSignup} className="space-y-4">
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
                        placeholder="At least 6 characters"
                        required
                        minLength={6}
                      />
                    </div>
                    {error && (
                      <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                  <p className="mt-4 text-center text-sm" style={{ color: '#78716C' }}>
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary underline">
                      Sign in
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <PhoneOtpForm />
                  <p className="mt-4 text-center text-sm" style={{ color: '#78716C' }}>
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary underline">
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </AuthTabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Task 6: Update User Menu & Settings for Phone Users

**Files:**
- Modify: `src/components/layout/user-menu.tsx`
- Modify: `src/app/(authenticated)/settings/page.tsx`

### User Menu Changes

In `user-menu.tsx`, the `useEffect` currently only reads `email`. Update to also read `phone`:

```typescript
// Replace the current useEffect and state
const [userIdentifier, setUserIdentifier] = useState<string | null>(null)

useEffect(() => {
  getSupabase().auth.getUser().then(({ data }) => {
    setUserIdentifier(data.user?.email ?? data.user?.phone ?? null)
  })
}, [])
```

In the JSX, replace `{email && (` with `{userIdentifier && (` and `{email}` with `{userIdentifier}`.

### Settings Page Changes

In `settings/page.tsx`:

1. Add state for phone:
```typescript
const [phone, setPhone] = useState('')
const [isPhoneUser, setIsPhoneUser] = useState(false)
```

2. In the `useEffect`, add phone detection:
```typescript
useEffect(() => {
  getSupabase().auth.getUser().then(({ data }) => {
    if (data.user) {
      setEmail(data.user.email ?? '')
      setPhone(data.user.phone ?? '')
      setIsPhoneUser(!data.user.email && !!data.user.phone)
      setDisplayName(data.user.user_metadata?.display_name ?? '')
      const prefs = data.user.user_metadata?.notification_prefs
      if (prefs) {
        setNotificationPrefs({
          deadline_approaching: prefs.deadline_approaching ?? true,
          task_unlocked: prefs.task_unlocked ?? true,
          escalation_triggered: prefs.escalation_triggered ?? true,
        })
      }
    }
  })
}, [])
```

3. In the Profile card, show phone for phone-only users:
```typescript
{isPhoneUser ? (
  <div className="space-y-2">
    <Label htmlFor="phone">Phone Number</Label>
    <Input id="phone" value={phone} disabled className="bg-warm-bg" />
    <p className="text-xs text-warm-muted">Phone number cannot be changed.</p>
  </div>
) : (
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" value={email} disabled className="bg-warm-bg" />
    <p className="text-xs text-warm-muted">Email cannot be changed.</p>
  </div>
)}
```

4. Conditionally hide the Change Password card for phone-only users:
```typescript
{!isPhoneUser && (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Change Password</CardTitle>
    </CardHeader>
    {/* ... existing password change form ... */}
  </Card>
)}
```

---

## Task 7: Build & Test Verification

1. Run all tests: `npx vitest run` — expect all passing including new auth tests
2. Run build: `npx next build` — no type errors
3. Verify:
   - Login page shows Email/Phone tabs
   - Signup page shows Email/Phone tabs
   - Email tab works exactly as before (no regression)
   - Phone tab shows phone input, "Send Code" button
   - User menu displays phone number for phone-only users
   - Settings hides password section for phone-only users

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `supabase/config.toml` | Modify | 1 |
| `src/components/auth/auth-tabs.tsx` | Create | 2 |
| `tests/unit/auth/auth-tabs.test.tsx` | Create | 2 |
| `src/components/auth/phone-otp-form.tsx` | Create | 3 |
| `tests/unit/auth/phone-otp-form.test.tsx` | Create | 3 |
| `src/app/login/page.tsx` | Modify | 4 |
| `src/app/signup/page.tsx` | Modify | 5 |
| `src/components/layout/user-menu.tsx` | Modify | 6 |
| `src/app/(authenticated)/settings/page.tsx` | Modify | 6 |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| User enters phone without +1 | Validation error: "Include country code +1" |
| Wrong OTP entered | Error message from Supabase: "Invalid OTP" |
| OTP expired (after 60s) | Error message; user clicks "Resend Code" |
| Rapid resend attempts | 60-second cooldown timer prevents spam |
| Phone user visits settings | Sees phone (not email), password section hidden |
| Email user unaffected | No changes to email flow |
| Phone number already registered | Supabase sends OTP to existing account (login flow) |
| New phone number | Supabase auto-creates account on first OTP verification |
