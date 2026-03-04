'use client'

import { useState, useRef, useEffect } from 'react'
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  function startCooldown() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setResendCooldown(60)
    intervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          intervalRef.current = null
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
