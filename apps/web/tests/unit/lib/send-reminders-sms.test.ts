import { describe, it, expect } from 'vitest'
import { shouldSendSms } from '@/app/api/cron/send-reminders/sms-helpers'

describe('shouldSendSms', () => {
  it('returns true when opt-in and phone present', () => {
    expect(shouldSendSms({ smsOptIn: true, phone: '+15551234567' })).toBe(true)
  })

  it('returns false when opt-in false', () => {
    expect(shouldSendSms({ smsOptIn: false, phone: '+15551234567' })).toBe(false)
  })

  it('returns false when phone missing', () => {
    expect(shouldSendSms({ smsOptIn: true, phone: null })).toBe(false)
  })

  it('returns false when phone empty string', () => {
    expect(shouldSendSms({ smsOptIn: true, phone: '' })).toBe(false)
  })
})
