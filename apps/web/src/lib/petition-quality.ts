export interface PetitionQualityResult {
  score: number
  grade: 'Strong' | 'Needs review' | 'Needs work'
  strengths: string[]
  improvements: string[]
}

interface Check {
  points: number
  passes: boolean
  strength: string
  improvement: string
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text))
}

export function scorePetitionDraft(draft: string): PetitionQualityResult {
  const text = draft.trim()
  const lower = text.toLowerCase()
  const checks: Check[] = [
    {
      points: 15,
      passes: hasAny(text, [/cause no\./i, /civil action no\./i]) &&
        hasAny(text, [/plaintiff/i]) &&
        hasAny(text, [/defendant/i]) &&
        hasAny(text, [/court/i]),
      strength: 'Includes a recognizable court caption.',
      improvement: 'Add a court caption with the court, parties, and cause number.',
    },
    {
      points: 12,
      passes: hasAny(text, [/parties/i]) && hasAny(text, [/served/i, /resid(?:es|ing)/i, /address/i]),
      strength: 'Identifies parties and service/residence details.',
      improvement: 'Add party and service details for the plaintiff and defendant.',
    },
    {
      points: 14,
      passes: hasAny(text, [/jurisdiction/i]) && hasAny(text, [/venue/i]),
      strength: 'Explains jurisdiction and venue.',
      improvement: 'Add jurisdiction and venue facts showing why this court can hear the case.',
    },
    {
      points: 14,
      passes: hasAny(text, [/facts/i, /factual background/i]) &&
        hasAny(text, [/on or about/i, /\b20\d{2}\b/, /\b19\d{2}\b/]) &&
        text.length > 900,
      strength: 'Provides a factual timeline with dates.',
      improvement: 'Add a chronological facts section with dates, locations, and what happened.',
    },
    {
      points: 14,
      passes: hasAny(text, [/causes? of action/i, /negligence/i, /breach/i, /liability/i]),
      strength: 'States at least one legal theory.',
      improvement: 'Add causes of action that connect duty, breach, causation, and damages.',
    },
    {
      points: 12,
      passes: hasAny(text, [/damages/i]) && hasAny(text, [/prayer for relief/i, /wherefore/i]),
      strength: 'Includes damages and a prayer for relief.',
      improvement: 'Add damages and a prayer for relief stating what the court should award.',
    },
    {
      points: 9,
      passes: hasAny(text, [/respectfully submitted/i, /pro se/i, /signature/i]),
      strength: 'Includes a signature block.',
      improvement: 'Add a signature block with the plaintiff name and pro se designation.',
    },
    {
      points: 10,
      passes: !hasAny(lower, [
        /\btodo\b/i,
        /\[(?:verify|check|placeholder|your\s+[a-z\s]+|insert\s+[a-z\s]+|add\s+[a-z\s]+)\]/i,
        /_{3,}/,
      ]),
      strength: 'Has no obvious placeholders.',
      improvement: 'Remove placeholders before filing.',
    },
  ]

  const score = Math.min(
    100,
    checks.reduce((sum, check) => sum + (check.passes ? check.points : 0), 0),
  )
  const strengths = checks.filter((check) => check.passes).map((check) => check.strength)
  const improvements = checks.filter((check) => !check.passes).map((check) => check.improvement)

  return {
    score,
    grade: score >= 80 ? 'Strong' : score >= 65 ? 'Needs review' : 'Needs work',
    strengths,
    improvements,
  }
}
