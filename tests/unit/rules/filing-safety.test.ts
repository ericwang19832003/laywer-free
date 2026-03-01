import { describe, it, expect } from 'vitest'
import { isFilingOutputSafe, FILING_BLOCKED_PHRASES } from '@/lib/rules/filing-safety'

describe('isFilingOutputSafe', () => {
  it('accepts normal petition text', () => {
    expect(isFilingOutputSafe('Plaintiff respectfully requests judgment in the amount of $5,000.')).toBe(true)
  })

  it('rejects text claiming to be an attorney', () => {
    expect(isFilingOutputSafe('As your attorney, I recommend filing immediately.')).toBe(false)
  })

  it('rejects text predicting outcomes', () => {
    expect(isFilingOutputSafe('You will definitely win this case.')).toBe(false)
  })

  it('rejects text with guaranteed outcome language', () => {
    expect(isFilingOutputSafe('This is a guaranteed outcome in your favor.')).toBe(false)
  })

  it('rejects legal advice phrasing', () => {
    expect(isFilingOutputSafe('My legal advice is to settle.')).toBe(false)
  })

  it('is case insensitive', () => {
    expect(isFilingOutputSafe('AS YOUR ATTORNEY I advise you')).toBe(false)
  })

  it('accepts text mentioning attorney fees as relief', () => {
    expect(isFilingOutputSafe('Plaintiff requests reasonable attorney fees.')).toBe(true)
  })

  it.each(FILING_BLOCKED_PHRASES)('rejects phrase: "%s"', (phrase) => {
    expect(isFilingOutputSafe(`Some text ${phrase} more text`)).toBe(false)
  })
})
