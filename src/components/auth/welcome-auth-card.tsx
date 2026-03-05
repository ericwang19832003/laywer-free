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
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
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
