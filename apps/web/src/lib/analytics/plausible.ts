/**
 * Privacy-respecting product analytics via Plausible.
 *
 * Plausible is cookie-free, GDPR/CCPA compliant out of the box.
 * Page views are tracked automatically by the Plausible script in layout.tsx.
 * This module provides typed custom event tracking for product metrics.
 *
 * Configure the domain via NEXT_PUBLIC_PLAUSIBLE_DOMAIN env var.
 */

// ---------- Event catalogue ----------

export const PlausibleEvent = {
  // Navigation
  TAB_SWITCH: 'Tab Switch',

  // Onboarding
  ONBOARDING_STARTED: 'Onboarding Started',
  ONBOARDING_STEP_COMPLETED: 'Onboarding Step Completed',
  ONBOARDING_COMPLETED: 'Onboarding Completed',
  ONBOARDING_ABANDONED: 'Onboarding Abandoned',

  // Conversion
  SIGNUP_STARTED: 'Signup Started',
  SIGNUP_COMPLETED: 'Signup Completed',

  // Core actions
  CASE_CREATED: 'Case Created',
  STEP_COMPLETED: 'Step Completed',

  // Engagement
  TIME_TO_NEXT_ACTION: 'Time To Next Action',
} as const

export type PlausibleEventName =
  (typeof PlausibleEvent)[keyof typeof PlausibleEvent]

// ---------- Plausible global type ----------

declare global {
  interface Window {
    plausible?: (
      event: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void
  }
}

// ---------- Public API ----------

/**
 * Fire a custom event to Plausible.
 *
 * Safe to call anywhere -- silently no-ops when:
 *  - running on the server (SSR)
 *  - Plausible script hasn't loaded (ad-blocker, local dev without script)
 */
export function trackEvent(
  name: PlausibleEventName,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return
  if (typeof window.plausible !== 'function') return

  window.plausible(name, props ? { props } : undefined)
}

/**
 * Track time between two actions (in seconds).
 * Call `startTimer` on the first action, then `trackTimeTo` on the second.
 */
const timers = new Map<string, number>()

export function startTimer(key: string): void {
  timers.set(key, Date.now())
}

export function trackTimeTo(
  key: string,
  props?: Record<string, string | number | boolean>,
): void {
  const start = timers.get(key)
  if (!start) return

  const seconds = Math.round((Date.now() - start) / 1000)
  timers.delete(key)

  trackEvent(PlausibleEvent.TIME_TO_NEXT_ACTION, {
    ...props,
    key,
    seconds,
  })
}

// ---------- Plausible domain config ----------

export function getPlausibleDomain(): string {
  return (
    process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? 'lawyerfree.app'
  )
}
