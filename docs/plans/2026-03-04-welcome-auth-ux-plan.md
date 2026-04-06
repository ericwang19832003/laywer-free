# Welcome Page & Auth UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Replace the redirect-only root page with a split-screen welcome page and polish auth UX with forgot password, password strength, and friendlier errors.

**Architecture:** Single unified page at `/` with left panel (value proposition) and right panel (auth card with login/signup toggle). Existing `/login` and `/signup` become simple redirects. New `/reset-password` page handles Supabase password reset callback. All new components are pure client components reusing existing UI primitives.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind, Supabase Auth, Lucide React, vitest

---

## Task 1: Password Strength Utility + Tests (TDD)

**Files:**
- Create: `src/lib/auth/password-strength.ts`
- Create: `tests/unit/auth/password-strength.test.ts`

**Tests:**

```typescript
import { describe, it, expect } from 'vitest'
import { getPasswordStrength } from '@/lib/auth/password-strength'

describe('getPasswordStrength', () => {
  it('returns weak for empty string', () => {
    expect(getPasswordStrength('')).toEqual({ level: 'weak', label: 'Weak', score: 0 })
  })

  it('returns weak for under 6 characters', () => {
    expect(getPasswordStrength('ab1')).toEqual({ level: 'weak', label: 'Weak', score: 1 })
  })

  it('returns fair for 6-7 characters', () => {
    const result = getPasswordStrength('abcdef')
    expect(result.level).toBe('fair')
    expect(result.label).toBe('Fair')
  })

  it('returns good for 8+ with mixed case', () => {
    const result = getPasswordStrength('Abcdefgh')
    expect(result.level).toBe('good')
    expect(result.label).toBe('Good')
  })

  it('returns strong for 8+ with mixed case, numbers, and symbols', () => {
    const result = getPasswordStrength('Abcdef1!')
    expect(result.level).toBe('strong')
    expect(result.label).toBe('Strong')
  })
})
```

**Implementation:**

```typescript
export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordStrength {
  level: StrengthLevel
  label: string
  score: number // 0-3
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return { level: 'weak', label: 'Weak', score: 0 }
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)

  if (password.length < 6) {
    return { level: 'weak', label: 'Weak', score: 1 }
  }

  if (password.length < 8) {
    return { level: 'fair', label: 'Fair', score: 1 }
  }

  // 8+ characters
  if (hasLower && hasUpper && hasNumber && hasSymbol) {
    return { level: 'strong', label: 'Strong', score: 3 }
  }

  if (hasLower && hasUpper) {
    return { level: 'good', label: 'Good', score: 2 }
  }

  return { level: 'fair', label: 'Fair', score: 1 }
}
```

---

## Task 2: Password Strength Indicator Component

**Files:**
- Create: `src/components/auth/password-strength.tsx`

**Component (no separate tests — visual component, tested through utility):**

```typescript
'use client'

import { getPasswordStrength, type StrengthLevel } from '@/lib/auth/password-strength'

const COLORS: Record<StrengthLevel, string> = {
  weak: 'bg-red-400',
  fair: 'bg-amber-400',
  good: 'bg-green-400',
  strong: 'bg-green-500',
}

const SEGMENT_COUNT = 4
const SEGMENTS_FILLED: Record<StrengthLevel, number> = {
  weak: 1,
  fair: 2,
  good: 3,
  strong: 4,
}

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const strength = getPasswordStrength(password)
  const filled = SEGMENTS_FILLED[strength.level]
  const color = COLORS[strength.level]

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < filled ? color : 'bg-warm-border'
            }`}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: '#78716C' }}>{strength.label}</p>
    </div>
  )
}
```

---

## Task 3: Auth Mode Toggle Component + Tests (TDD)

**Files:**
- Create: `src/components/auth/auth-mode-toggle.tsx`
- Create: `tests/unit/auth/auth-mode-toggle.test.tsx`

**Tests:**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AuthModeToggle } from '@/components/auth/auth-mode-toggle'

describe('AuthModeToggle', () => {
  it('renders Sign In and Create Account buttons', () => {
    render(<AuthModeToggle mode="login" onModeChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeDefined()
  })

  it('calls onModeChange when toggled', () => {
    let changed = ''
    render(<AuthModeToggle mode="login" onModeChange={(m) => { changed = m }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))
    expect(changed).toBe('signup')
  })

  it('highlights active mode', () => {
    render(<AuthModeToggle mode="signup" onModeChange={() => {}} />)
    const signupBtn = screen.getByRole('button', { name: 'Create Account' })
    expect(signupBtn.className).toContain('bg-primary')
  })
})
```

**Component:**

```typescript
'use client'

export type AuthMode = 'login' | 'signup'

interface AuthModeToggleProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
}

export function AuthModeToggle({ mode, onModeChange }: AuthModeToggleProps) {
  return (
    <div className="flex gap-1 mb-6 p-1 bg-warm-bg rounded-lg">
      <button
        type="button"
        onClick={() => onModeChange('login')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'login'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-warm-muted hover:text-warm-text'
        }`}
      >
        Sign In
      </button>
      <button
        type="button"
        onClick={() => onModeChange('signup')}
        className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${
          mode === 'signup'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-warm-muted hover:text-warm-text'
        }`}
      >
        Create Account
      </button>
    </div>
  )
}
```

---

## Task 4: Welcome Panel Component + Tests (TDD)

**Files:**
- Create: `src/components/auth/welcome-panel.tsx`
- Create: `tests/unit/auth/welcome-panel.test.tsx`

**Tests:**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WelcomePanel } from '@/components/auth/welcome-panel'

describe('WelcomePanel', () => {
  it('renders the headline', () => {
    render(<WelcomePanel />)
    expect(screen.getByText(/organize your legal situation/i)).toBeDefined()
  })

  it('renders three benefit items', () => {
    render(<WelcomePanel />)
    expect(screen.getByText(/step-by-step case management/i)).toBeDefined()
    expect(screen.getByText(/know your deadlines/i)).toBeDefined()
    expect(screen.getByText(/ai-drafted legal documents/i)).toBeDefined()
  })
})
```

**Component:**

```typescript
import { ClipboardList, Calendar, FileText } from 'lucide-react'

const BENEFITS = [
  { icon: ClipboardList, text: 'Step-by-step case management' },
  { icon: Calendar, text: 'Know your deadlines and next moves' },
  { icon: FileText, text: 'AI-drafted legal documents' },
]

export function WelcomePanel() {
  return (
    <div className="flex flex-col justify-center h-full px-8 lg:px-16 py-12">
      <h1
        className="text-3xl lg:text-4xl font-bold leading-tight mb-2"
        style={{ color: '#1C1917' }}
      >
        Lawyer Free
      </h1>
      <p
        className="text-lg lg:text-xl mb-10 leading-relaxed"
        style={{ color: '#78716C' }}
      >
        Organize your legal situation with calm, structured guidance.
      </p>

      <div className="space-y-5">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style={{ backgroundColor: '#F0EFFD' }}
            >
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm lg:text-base" style={{ color: '#1C1917' }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      <p
        className="mt-12 text-sm"
        style={{ color: '#A8A29E' }}
      >
        Free to use. No lawyers required.
      </p>
    </div>
  )
}
```

---

## Task 5: Forgot Password Form Component + Tests (TDD)

**Files:**
- Create: `src/components/auth/forgot-password-form.tsx`
- Create: `tests/unit/auth/forgot-password-form.test.tsx`

**Tests:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

const mockResetPasswordForEmail = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ForgotPasswordForm', () => {
  it('renders email input and send button', () => {
    render(<ForgotPasswordForm onBack={() => {}} />)
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeDefined()
  })

  it('calls resetPasswordForEmail on submit', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    render(<ForgotPasswordForm onBack={() => {}} />)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({ redirectTo: expect.any(String) })
      )
    })
  })

  it('shows success message after sending', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null })
    render(<ForgotPasswordForm onBack={() => {}} />)
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeDefined()
    })
  })

  it('calls onBack when back link is clicked', () => {
    const onBack = vi.fn()
    render(<ForgotPasswordForm onBack={onBack} />)
    fireEvent.click(screen.getByText('Back to Sign In'))
    expect(onBack).toHaveBeenCalled()
  })
})
```

**Component:**

```typescript
'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ForgotPasswordFormProps {
  onBack: () => void
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm" style={{ color: '#1C1917' }}>
          Check your email — we sent a password reset link to <strong>{email}</strong>.
        </p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={onBack}
        >
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <p className="text-sm" style={{ color: '#78716C' }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {error && (
          <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading || !email}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <p className="text-center">
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={onBack}
        >
          Back to Sign In
        </button>
      </p>
    </div>
  )
}
```

---

## Task 6: Friendly Error Messages Utility

**Files:**
- Create: `src/lib/auth/friendly-errors.ts`

**Implementation (simple map, no tests needed for a static map):**

```typescript
const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': "That email/password combination didn't work. Double-check and try again.",
  'User already registered': 'An account with this email already exists. Try signing in instead.',
  'Password should be at least 6 characters': 'Password needs at least 6 characters.',
  'Email rate limit exceeded': 'Too many attempts. Please wait a moment and try again.',
  'For security purposes, you can only request this after 60 seconds': 'Please wait 60 seconds before requesting another reset link.',
}

export function friendlyError(message: string): string {
  return ERROR_MAP[message] ?? message
}
```

---

## Task 7: Welcome Page — Unified Split-Screen

**Files:**
- Rewrite: `src/app/page.tsx`

This is the main page that brings everything together. It's a server component that checks auth and either redirects authenticated users or renders the split-screen welcome.

**Implementation:**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WelcomePanel } from '@/components/auth/welcome-panel'
import { WelcomeAuthCard } from '@/components/auth/welcome-auth-card'

interface HomeProps {
  searchParams: Promise<{ mode?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/cases')
  }

  const params = await searchParams
  const initialMode = params.mode === 'signup' ? 'signup' : 'login'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: '#FAFAF8' }}>
      {/* Left panel — value proposition */}
      <div
        className="lg:w-[55%] w-full"
        style={{
          background: 'linear-gradient(135deg, #FAFAF8 0%, #F5F5F0 100%)',
        }}
      >
        <WelcomePanel />
      </div>

      {/* Right panel — auth card */}
      <div className="lg:w-[45%] w-full flex items-center justify-center px-4 py-8 lg:py-0">
        <WelcomeAuthCard initialMode={initialMode as 'login' | 'signup'} />
      </div>
    </div>
  )
}
```

---

## Task 8: Welcome Auth Card — Combined Login/Signup Component

**Files:**
- Create: `src/components/auth/welcome-auth-card.tsx`

This is the right-panel auth card that combines mode toggle, login form, signup form, forgot password, and phone OTP. It ties together all the components from Tasks 1-6.

**Implementation:**

```typescript
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthModeToggle, type AuthMode } from '@/components/auth/auth-mode-toggle'
import { AuthTabs, type AuthTabValue } from '@/components/auth/auth-tabs'
import { PhoneOtpForm } from '@/components/auth/phone-otp-form'
import { PasswordStrengthIndicator } from '@/components/auth/password-strength'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { friendlyError } from '@/lib/auth/friendly-errors'

interface WelcomeAuthCardProps {
  initialMode: AuthMode
}

export function WelcomeAuthCard({ initialMode }: WelcomeAuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [authTab, setAuthTab] = useState<AuthTabValue>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  function handleModeChange(newMode: AuthMode) {
    setMode(newMode)
    setError(null)
    setShowForgotPassword(false)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await getSupabase().auth.signInWithPassword({ email, password })

    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
    } else {
      router.push('/cases')
      router.refresh()
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await getSupabase().auth.signUp({ email, password })

    if (error) {
      setError(friendlyError(error.message))
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/cases')
      router.refresh()
    } else {
      setSignupSuccess(true)
      setLoading(false)
    }
  }

  const title = mode === 'login' ? 'Welcome back' : "Let's get started"
  const subtitle = mode === 'login'
    ? 'Sign in to continue managing your case.'
    : 'Create your free account. No credit card needed.'

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-semibold" style={{ color: '#1C1917' }}>
          {title}
        </CardTitle>
        <CardDescription style={{ color: '#78716C' }}>
          {subtitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthModeToggle mode={mode} onModeChange={handleModeChange} />

        {signupSuccess ? (
          <div className="text-center space-y-4">
            <p className="text-sm" style={{ color: '#1C1917' }}>
              Check your email to confirm your account.
            </p>
            <p className="text-sm" style={{ color: '#78716C' }}>
              We sent a confirmation link to <strong>{email}</strong>.
            </p>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setSignupSuccess(false)
                handleModeChange('login')
              }}
            >
              Back to Sign In
            </Button>
          </div>
        ) : showForgotPassword ? (
          <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
        ) : (
          <AuthTabs activeTab={authTab} onTabChange={setAuthTab}>
            {authTab === 'email' ? (
              mode === 'login' ? (
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button
                        type="button"
                        className="text-xs text-primary underline"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
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
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                    />
                    <PasswordStrengthIndicator password={password} />
                  </div>
                  {error && (
                    <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              )
            ) : (
              <PhoneOtpForm />
            )}
          </AuthTabs>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Task 9: Login/Signup Redirects + Middleware Update

**Files:**
- Rewrite: `src/app/login/page.tsx`
- Rewrite: `src/app/signup/page.tsx`
- Modify: `src/middleware.ts`

**Login page — simple redirect:**

```typescript
import { redirect } from 'next/navigation'

export default function LoginPage() {
  redirect('/?mode=login')
}
```

**Signup page — simple redirect:**

```typescript
import { redirect } from 'next/navigation'

export default function SignupPage() {
  redirect('/?mode=signup')
}
```

**Middleware update — allow `/` and `/reset-password` for unauthenticated users:**

Change the condition in `src/middleware.ts` (around line 31-37). The current code redirects unauthenticated users to `/login` for most routes. Update it to:

```typescript
  if (
    !user &&
    request.nextUrl.pathname !== '/' &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/reset-password') &&
    !request.nextUrl.pathname.startsWith('/api') &&
    !request.nextUrl.pathname.startsWith('/shared')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
```

Key changes:
1. Add `request.nextUrl.pathname !== '/'` — allow root for unauthenticated
2. Add `/reset-password` to the allow-list
3. Redirect to `/` instead of `/login` (since `/` is now the welcome page)

---

## Task 10: Reset Password Page

**Files:**
- Create: `src/app/reset-password/page.tsx`

**Implementation:**

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordStrengthIndicator } from '@/components/auth/password-strength'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    // Supabase sets session from the URL hash fragment automatically
    getSupabase().auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
    })
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password needs at least 6 characters.')
      return
    }

    setLoading(true)
    const { error } = await getSupabase().auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  if (hasSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAF8' }}>
        <p className="text-sm" style={{ color: '#78716C' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAFAF8' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold" style={{ color: '#1C1917' }}>
            {success ? 'Password Updated' : 'Set New Password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm" style={{ color: '#1C1917' }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
              <Link href="/">
                <Button className="w-full mt-2">Go to Sign In</Button>
              </Link>
            </div>
          ) : !hasSession ? (
            <div className="text-center space-y-4">
              <p className="text-sm" style={{ color: '#D97706' }}>
                This reset link is invalid or has expired. Please request a new one.
              </p>
              <Link href="/">
                <Button variant="outline" className="w-full mt-2">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
                <PasswordStrengthIndicator password={password} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm" style={{ color: '#D97706' }}>{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Task 11: Build & Test Verification

1. Run all tests: `npx vitest run` — all passing including new auth tests
2. Run build: `npx next build` — no type errors
3. Verify:
   - `/` shows split-screen welcome page with value prop + auth card
   - Login/Signup toggle switches between modes
   - Email/Phone tabs work within each mode
   - Password strength indicator shows on signup
   - "Forgot password?" link shows reset form
   - `/login` redirects to `/?mode=login`
   - `/signup` redirects to `/?mode=signup`
   - `/reset-password` shows new password form (with valid token)
   - Authenticated users on `/` redirect to `/cases`
   - Error messages use friendly copy

---

## File Summary

| File | Action | Task |
|------|--------|------|
| `src/lib/auth/password-strength.ts` | Create | 1 |
| `tests/unit/auth/password-strength.test.ts` | Create | 1 |
| `src/components/auth/password-strength.tsx` | Create | 2 |
| `src/components/auth/auth-mode-toggle.tsx` | Create | 3 |
| `tests/unit/auth/auth-mode-toggle.test.tsx` | Create | 3 |
| `src/components/auth/welcome-panel.tsx` | Create | 4 |
| `tests/unit/auth/welcome-panel.test.tsx` | Create | 4 |
| `src/components/auth/forgot-password-form.tsx` | Create | 5 |
| `tests/unit/auth/forgot-password-form.test.tsx` | Create | 5 |
| `src/lib/auth/friendly-errors.ts` | Create | 6 |
| `src/app/page.tsx` | Rewrite | 7 |
| `src/components/auth/welcome-auth-card.tsx` | Create | 8 |
| `src/app/login/page.tsx` | Rewrite | 9 |
| `src/app/signup/page.tsx` | Rewrite | 9 |
| `src/middleware.ts` | Modify | 9 |
| `src/app/reset-password/page.tsx` | Create | 10 |

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Authenticated user visits `/` | Server-side redirect to `/cases` |
| `/login` visited directly | Redirects to `/?mode=login` |
| `/signup` visited directly | Redirects to `/?mode=signup` |
| Invalid reset token | Shows "link expired" message + back to sign in |
| Password mismatch on reset | Client-side validation error |
| Supabase error not in friendly map | Passes through original message |
| Phone OTP on mobile | Full-width layout, tabs stack properly |
| Empty password in strength indicator | Returns null (no bar shown) |
