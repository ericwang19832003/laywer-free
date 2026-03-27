/**
 * Citation Verification Engine
 *
 * Extracts and verifies legal citations from generated document text.
 * Statutes are checked against the Texas statute lookup table.
 * Case citations are validated for format correctness only.
 * No external API calls — CourtListener integration will be added later.
 */

import { verifyTexasStatute } from './texas-statutes'

export interface CitationResult {
  citation: string
  status: 'verified' | 'format_valid' | 'unverifiable'
  type: 'statute' | 'case' | 'regulation' | 'unknown'
  details?: string
}

// ---------------------------------------------------------------------------
// Regex patterns for extracting citations from text
// ---------------------------------------------------------------------------

// Texas statutes: "Tex. Civ. Prac. & Rem. Code § 16.004"
const TX_STATUTE_FULL_RE =
  /Tex\.?\s+[\w\s&.]+Code\s*§\s*[\d.]+(?:\([a-zA-Z0-9]+\))?/g

// Texas statute abbreviations: "CPRC § 16.004"
const TX_STATUTE_ABBR_RE =
  /(?:CPRC|TPC|TFC|TBCC)\s*§\s*[\d.]+(?:\([a-zA-Z0-9]+\))?/g

// Federal statutes: "42 U.S.C. § 1983"
const FEDERAL_STATUTE_RE = /\d+\s+U\.S\.C\.\s*§\s*\d+(?:\([a-zA-Z0-9]+\))?/g

// Texas case citations: "Smith v. Jones, 123 S.W.3d 456 (Tex. App. 2020)"
const TX_CASE_RE =
  /[A-Z][\w'-]+\s+v\.\s+[A-Z][\w'-]+(?:\s+[\w'-]+)*,\s+\d+\s+S\.W\.(?:2d|3d)?\s+\d+\s*\([^)]+\d{4}\)/g

// Federal case citations: "Smith v. Jones, 123 F.3d 456 (5th Cir. 2020)"
const FEDERAL_CASE_RE =
  /[A-Z][\w'-]+\s+v\.\s+[A-Z][\w'-]+(?:\s+[\w'-]+)*,\s+\d+\s+F\.(?:2d|3d|Supp\.(?:\s*2d|3d)?)\s+\d+\s*\([^)]+\d{4}\)/g

// Texas Rules of Civil Procedure: "Tex. R. Civ. P. 21"
const TX_RULE_RE = /Tex\.?\s+R\.\s+(?:Civ|App|Evid)\.?\s+P\.\s+[\d.]+(?:\([a-zA-Z0-9]+\))?/g

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

interface RawCitation {
  text: string
  type: CitationResult['type']
}

function extractCitations(documentText: string): RawCitation[] {
  const results: RawCitation[] = []
  const seen = new Set<string>()

  function collect(re: RegExp, type: CitationResult['type']) {
    let match: RegExpExecArray | null
    // Reset lastIndex since we reuse the global regex
    re.lastIndex = 0
    while ((match = re.exec(documentText)) !== null) {
      const text = match[0].trim()
      if (!seen.has(text)) {
        seen.add(text)
        results.push({ text, type })
      }
    }
  }

  collect(TX_STATUTE_FULL_RE, 'statute')
  collect(TX_STATUTE_ABBR_RE, 'statute')
  collect(FEDERAL_STATUTE_RE, 'regulation')
  collect(TX_CASE_RE, 'case')
  collect(FEDERAL_CASE_RE, 'case')
  collect(TX_RULE_RE, 'regulation')

  return results
}

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

function verifySingle(raw: RawCitation): CitationResult {
  // Texas statutes — verify against the lookup table
  if (raw.type === 'statute') {
    const result = verifyTexasStatute(raw.text)
    if (result.found && result.entry) {
      return {
        citation: raw.text,
        status: 'verified',
        type: 'statute',
        details: result.entry.title,
      }
    }
    // The format matched a statute regex but we couldn't verify the section
    return {
      citation: raw.text,
      status: 'format_valid',
      type: 'statute',
      details: 'Section not found in lookup table — please verify independently',
    }
  }

  // Case citations — format validation only (no external API)
  if (raw.type === 'case') {
    // Check if it looks like a Texas reporter
    const isTx = /S\.W\./.test(raw.text)
    const isFed = /F\.(?:2d|3d|Supp)/.test(raw.text)
    const reporter = isTx
      ? 'Texas reporter (S.W.)'
      : isFed
        ? 'Federal reporter'
        : 'Unknown reporter'

    return {
      citation: raw.text,
      status: 'format_valid',
      type: 'case',
      details: `Format matches ${reporter} — verify before filing`,
    }
  }

  // Federal statutes and rules — format valid but not independently verified
  if (raw.type === 'regulation') {
    return {
      citation: raw.text,
      status: 'format_valid',
      type: 'regulation',
      details: 'Format recognized — verify before filing',
    }
  }

  return {
    citation: raw.text,
    status: 'unverifiable',
    type: 'unknown',
    details: 'Could not classify this citation',
  }
}

/**
 * Extract and verify all legal citations found in the given document text.
 */
export async function verifyCitations(
  documentText: string
): Promise<CitationResult[]> {
  const raw = extractCitations(documentText)
  return raw.map(verifySingle)
}
