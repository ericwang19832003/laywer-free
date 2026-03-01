export const FILING_BLOCKED_PHRASES = Object.freeze([
  'as your attorney',
  'my legal advice',
  'i advise you to',
  'you will definitely win',
  'guaranteed outcome',
  'you will win',
  'certain to prevail',
  'i am a lawyer',
  'i am an attorney',
  'legal counsel recommends',
] as const)

export function isFilingOutputSafe(text: string): boolean {
  const lower = text.toLowerCase()
  return !FILING_BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))
}
