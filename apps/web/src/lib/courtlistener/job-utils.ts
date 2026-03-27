const BASE_BACKOFF_MINUTES = 5
const MAX_BACKOFF_MINUTES = 60

export function computeJobBackoffMs(attempts: number): number {
  const safeAttempts = Math.max(1, attempts)
  const minutes = Math.min(MAX_BACKOFF_MINUTES, BASE_BACKOFF_MINUTES * Math.pow(2, safeAttempts - 1))
  return minutes * 60 * 1000
}
