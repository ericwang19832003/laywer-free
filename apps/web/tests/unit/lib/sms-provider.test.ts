import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock twilio before importing provider
vi.mock('twilio', () => {
  const mockCreate = vi.fn()
  return {
    default: vi.fn(() => ({
      messages: { create: mockCreate },
    })),
    __mockCreate: mockCreate,
  }
})

describe('sendSms', () => {
  beforeEach(() => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', 'ACtest123')
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'authtest')
    vi.stubEnv('TWILIO_FROM_NUMBER', '+15550001111')
  })

  it('returns success when Twilio responds', async () => {
    const { __mockCreate } = await import('twilio') as any
    __mockCreate.mockResolvedValueOnce({ sid: 'SMxxx' })
    const { sendSms } = await import('@/lib/sms/provider')
    const result = await sendSms({ to: '+15559876543', body: 'Test message' })
    expect(result.success).toBe(true)
    expect(__mockCreate).toHaveBeenCalledWith({
      from: '+15550001111',
      to: '+15559876543',
      body: 'Test message',
    })
  })

  it('returns error when Twilio throws', async () => {
    const { __mockCreate } = await import('twilio') as any
    __mockCreate.mockRejectedValueOnce(new Error('Invalid number'))
    const { sendSms } = await import('@/lib/sms/provider')
    const result = await sendSms({ to: '+15559876543', body: 'Test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid number')
  })

  it('returns error when env vars missing', async () => {
    vi.stubEnv('TWILIO_ACCOUNT_SID', '')
    const { sendSms } = await import('@/lib/sms/provider')
    const result = await sendSms({ to: '+15559876543', body: 'Test' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('not configured')
  })
})
