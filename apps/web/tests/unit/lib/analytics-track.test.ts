import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  trackEvent,
  startTimer,
  trackTimeTo,
  PlausibleEvent,
  getPlausibleDomain,
} from '@/lib/analytics/plausible'

describe('Plausible analytics', () => {
  beforeEach(() => {
    // Reset window.plausible before each test
    window.plausible = vi.fn()
  })

  afterEach(() => {
    delete window.plausible
    vi.restoreAllMocks()
  })

  // ---------- trackEvent ----------

  describe('trackEvent', () => {
    it('calls window.plausible with event name', () => {
      trackEvent(PlausibleEvent.TAB_SWITCH)

      expect(window.plausible).toHaveBeenCalledWith(
        'Tab Switch',
        undefined,
      )
    })

    it('passes props when provided', () => {
      trackEvent(PlausibleEvent.CASE_CREATED, { case_type: 'small_claims' })

      expect(window.plausible).toHaveBeenCalledWith('Case Created', {
        props: { case_type: 'small_claims' },
      })
    })

    it('no-ops when window.plausible is not a function', () => {
      delete window.plausible

      // Should not throw
      expect(() =>
        trackEvent(PlausibleEvent.SIGNUP_COMPLETED),
      ).not.toThrow()
    })

    it('no-ops with undefined window.plausible', () => {
      window.plausible = undefined

      expect(() =>
        trackEvent(PlausibleEvent.STEP_COMPLETED),
      ).not.toThrow()
    })
  })

  // ---------- Timer helpers ----------

  describe('startTimer / trackTimeTo', () => {
    it('tracks elapsed time between start and end', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(now) // startTimer
        .mockReturnValueOnce(now + 5000) // trackTimeTo

      startTimer('onboarding')
      trackTimeTo('onboarding', { step: 'first' })

      expect(window.plausible).toHaveBeenCalledWith(
        'Time To Next Action',
        {
          props: {
            step: 'first',
            key: 'onboarding',
            seconds: 5,
          },
        },
      )
    })

    it('no-ops if timer was never started', () => {
      trackTimeTo('nonexistent')

      expect(window.plausible).not.toHaveBeenCalled()
    })

    it('cleans up timer after tracking', () => {
      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      startTimer('signup')
      trackTimeTo('signup')

      // Second call should no-op (timer deleted)
      ;(window.plausible as ReturnType<typeof vi.fn>).mockClear()
      trackTimeTo('signup')

      expect(window.plausible).not.toHaveBeenCalled()
    })
  })

  // ---------- Event catalogue ----------

  describe('PlausibleEvent', () => {
    it('contains all required baseline events', () => {
      expect(PlausibleEvent.TAB_SWITCH).toBe('Tab Switch')
      expect(PlausibleEvent.ONBOARDING_COMPLETED).toBe('Onboarding Completed')
      expect(PlausibleEvent.SIGNUP_COMPLETED).toBe('Signup Completed')
      expect(PlausibleEvent.CASE_CREATED).toBe('Case Created')
      expect(PlausibleEvent.STEP_COMPLETED).toBe('Step Completed')
      expect(PlausibleEvent.TIME_TO_NEXT_ACTION).toBe('Time To Next Action')
    })
  })

  // ---------- Config ----------

  describe('getPlausibleDomain', () => {
    it('returns env var when set', () => {
      const original = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = 'custom.example.com'

      expect(getPlausibleDomain()).toBe('custom.example.com')

      // Restore
      if (original === undefined) {
        delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      } else {
        process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = original
      }
    })

    it('falls back to lawyerfree.app', () => {
      const original = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN
      delete process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN

      expect(getPlausibleDomain()).toBe('lawyerfree.app')

      if (original !== undefined) {
        process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN = original
      }
    })
  })
})
