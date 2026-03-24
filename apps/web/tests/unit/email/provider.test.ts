import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// We test sendEmail behavior by mocking the resend module
// and controlling env vars

describe('sendEmail', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses stub provider by default', async () => {
    delete process.env.EMAIL_PROVIDER
    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(true)
    expect(result.messageId).toMatch(/^stub-/)
  })

  it('uses stub provider when EMAIL_PROVIDER=stub', async () => {
    process.env.EMAIL_PROVIDER = 'stub'
    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(true)
    expect(result.messageId).toMatch(/^stub-/)
  })

  it('returns error for unknown provider', async () => {
    process.env.EMAIL_PROVIDER = 'unknown_provider'
    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Unknown email provider')
  })

  it('calls Resend when EMAIL_PROVIDER=resend and key is set', async () => {
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.RESEND_API_KEY = 're_test_123'
    process.env.EMAIL_FROM_ADDRESS = 'noreply@example.com'

    // Mock the resend module with a proper class constructor
    vi.doMock('resend', () => {
      return {
        Resend: class MockResend {
          emails = {
            send: vi.fn().mockResolvedValue({
              data: { id: 'resend-msg-abc123' },
              error: null,
            }),
          }
        },
      }
    })

    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Test', body: 'Body' })
    expect(result.success).toBe(true)
    expect(result.messageId).toBe('resend-msg-abc123')
  })

  it('falls back to stub when RESEND_API_KEY is missing', async () => {
    process.env.EMAIL_PROVIDER = 'resend'
    delete process.env.RESEND_API_KEY

    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', body: 'Hello' })
    expect(result.success).toBe(true)
    expect(result.messageId).toMatch(/^stub-/)
  })

  it('returns error when Resend API fails', async () => {
    process.env.EMAIL_PROVIDER = 'resend'
    process.env.RESEND_API_KEY = 're_test_123'
    process.env.EMAIL_FROM_ADDRESS = 'noreply@example.com'

    // Mock the resend module with a proper class constructor
    vi.doMock('resend', () => {
      return {
        Resend: class MockResend {
          emails = {
            send: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Rate limit exceeded' },
            }),
          }
        },
      }
    })

    const { sendEmail } = await import('@/lib/email/provider')
    const result = await sendEmail({ to: 'test@example.com', subject: 'Test', body: 'Body' })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Rate limit exceeded')
  })
})
