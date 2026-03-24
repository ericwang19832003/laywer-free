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
