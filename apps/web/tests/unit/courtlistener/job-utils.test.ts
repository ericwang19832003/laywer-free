import { describe, it, expect } from 'vitest'
import { computeJobBackoffMs } from '@/lib/courtlistener/job-utils'

describe('computeJobBackoffMs', () => {
  it('uses 5 minutes for the first attempt', () => {
    expect(computeJobBackoffMs(1)).toBe(5 * 60 * 1000)
  })

  it('doubles backoff with each attempt', () => {
    expect(computeJobBackoffMs(2)).toBe(10 * 60 * 1000)
    expect(computeJobBackoffMs(3)).toBe(20 * 60 * 1000)
  })

  it('caps backoff at 60 minutes', () => {
    expect(computeJobBackoffMs(6)).toBe(60 * 60 * 1000)
  })
})
