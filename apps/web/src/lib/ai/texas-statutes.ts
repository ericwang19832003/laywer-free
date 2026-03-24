/**
 * Texas Statute Lookup Table
 *
 * A curated set of commonly cited Texas statute sections used
 * for offline citation verification in generated legal documents.
 */

export interface StatuteEntry {
  code: string   // e.g. "Tex. Civ. Prac. & Rem. Code"
  section: string // e.g. "16.004"
  title: string   // e.g. "Four-Year Limitations Period"
}

// ---------------------------------------------------------------------------
// Lookup map keyed as "code_abbreviation:section"
// ---------------------------------------------------------------------------

export const TEXAS_STATUTES: Map<string, StatuteEntry> = new Map([
  // === Civil Practice & Remedies Code (CPRC) ===
  ['CPRC:15.002', { code: 'Tex. Civ. Prac. & Rem. Code', section: '15.002', title: 'Venue: General Rule' }],
  ['CPRC:15.003', { code: 'Tex. Civ. Prac. & Rem. Code', section: '15.003', title: 'Multiple Plaintiffs and Intervening Plaintiffs' }],
  ['CPRC:16.001', { code: 'Tex. Civ. Prac. & Rem. Code', section: '16.001', title: 'Effect of Limitations' }],
  ['CPRC:16.002', { code: 'Tex. Civ. Prac. & Rem. Code', section: '16.002', title: 'One-Year Limitations Period' }],
  ['CPRC:16.003', { code: 'Tex. Civ. Prac. & Rem. Code', section: '16.003', title: 'Two-Year Limitations Period' }],
  ['CPRC:16.004', { code: 'Tex. Civ. Prac. & Rem. Code', section: '16.004', title: 'Four-Year Limitations Period' }],
  ['CPRC:16.051', { code: 'Tex. Civ. Prac. & Rem. Code', section: '16.051', title: 'Residual Limitations Period' }],
  ['CPRC:17.001', { code: 'Tex. Civ. Prac. & Rem. Code', section: '17.001', title: 'Service of Citation' }],
  ['CPRC:33.001', { code: 'Tex. Civ. Prac. & Rem. Code', section: '33.001', title: 'Proportionate Responsibility — Definitions' }],
  ['CPRC:33.002', { code: 'Tex. Civ. Prac. & Rem. Code', section: '33.002', title: 'Applicability' }],
  ['CPRC:33.003', { code: 'Tex. Civ. Prac. & Rem. Code', section: '33.003', title: 'Determination of Percentage of Responsibility' }],
  ['CPRC:33.012', { code: 'Tex. Civ. Prac. & Rem. Code', section: '33.012', title: 'Amount of Recovery' }],
  ['CPRC:33.013', { code: 'Tex. Civ. Prac. & Rem. Code', section: '33.013', title: "Amount of Recovery — Threshold for Joint and Several Liability" }],
  ['CPRC:41.001', { code: 'Tex. Civ. Prac. & Rem. Code', section: '41.001', title: 'Definitions — Exemplary Damages' }],
  ['CPRC:41.003', { code: 'Tex. Civ. Prac. & Rem. Code', section: '41.003', title: 'Standards for Recovery of Exemplary Damages' }],
  ['CPRC:41.008', { code: 'Tex. Civ. Prac. & Rem. Code', section: '41.008', title: 'Limitation on Amount of Exemplary Damages' }],
  ['CPRC:71.002', { code: 'Tex. Civ. Prac. & Rem. Code', section: '71.002', title: 'Cause of Action — Wrongful Death' }],
  ['CPRC:71.003', { code: 'Tex. Civ. Prac. & Rem. Code', section: '71.003', title: 'Application of Defenses' }],
  ['CPRC:71.004', { code: 'Tex. Civ. Prac. & Rem. Code', section: '71.004', title: 'Beneficiaries — Wrongful Death' }],
  ['CPRC:74.001', { code: 'Tex. Civ. Prac. & Rem. Code', section: '74.001', title: 'Definitions — Medical Liability' }],
  ['CPRC:74.351', { code: 'Tex. Civ. Prac. & Rem. Code', section: '74.351', title: 'Expert Report Required' }],
  ['CPRC:82.001', { code: 'Tex. Civ. Prac. & Rem. Code', section: '82.001', title: 'Definitions — Products Liability' }],
  ['CPRC:82.002', { code: 'Tex. Civ. Prac. & Rem. Code', section: '82.002', title: 'Manufacturer Liability' }],
  ['CPRC:82.003', { code: 'Tex. Civ. Prac. & Rem. Code', section: '82.003', title: 'Liability of Nonmanufacturing Sellers' }],
  ['CPRC:92.001', { code: 'Tex. Civ. Prac. & Rem. Code', section: '92.001', title: 'Definitions — Landlord\'s Duty to Repair' }],

  // === Property Code (TPC) ===
  ['TPC:24.001', { code: 'Tex. Prop. Code', section: '24.001', title: 'Forcible Entry and Detainer — Definitions' }],
  ['TPC:24.002', { code: 'Tex. Prop. Code', section: '24.002', title: 'Forcible Detainer' }],
  ['TPC:24.005', { code: 'Tex. Prop. Code', section: '24.005', title: 'Notice to Vacate' }],
  ['TPC:24.0051', { code: 'Tex. Prop. Code', section: '24.0051', title: 'Notice to Vacate Prior to Filing Eviction Suit' }],
  ['TPC:24.006', { code: 'Tex. Prop. Code', section: '24.006', title: 'Judgment and Writ of Possession' }],
  ['TPC:54.021', { code: 'Tex. Prop. Code', section: '54.021', title: "Landlord's Lien" }],
  ['TPC:91.001', { code: 'Tex. Prop. Code', section: '91.001', title: 'Notice for Terminating Certain Tenancies' }],
  ['TPC:92.006', { code: 'Tex. Prop. Code', section: '92.006', title: "Landlord's Duty to Repair or Remedy" }],
  ['TPC:92.008', { code: 'Tex. Prop. Code', section: '92.008', title: "Landlord's Liability for Failure to Repair" }],
  ['TPC:92.009', { code: 'Tex. Prop. Code', section: '92.009', title: "Tenant's Remedies — Repair and Deduct" }],
  ['TPC:92.052', { code: 'Tex. Prop. Code', section: '92.052', title: 'Security Deposit — Landlord Obligation' }],
  ['TPC:92.056', { code: 'Tex. Prop. Code', section: '92.056', title: 'Security Deposit — Return and Accounting' }],
  ['TPC:92.104', { code: 'Tex. Prop. Code', section: '92.104', title: 'Landlord Lockout Prohibited' }],
  ['TPC:92.109', { code: 'Tex. Prop. Code', section: '92.109', title: 'Tenant Remedies — Lockout' }],
  ['TPC:92.151', { code: 'Tex. Prop. Code', section: '92.151', title: 'Smoke Alarms — Duty to Install' }],
  ['TPC:92.301', { code: 'Tex. Prop. Code', section: '92.301', title: 'Utility Cutoff — Landlord Prohibited' }],
  ['TPC:93.002', { code: 'Tex. Prop. Code', section: '93.002', title: 'Commercial Tenant Security Deposits' }],
  ['TPC:94.001', { code: 'Tex. Prop. Code', section: '94.001', title: 'Manufactured Home Tenancy — Definitions' }],

  // === Family Code (TFC) ===
  ['TFC:3.001', { code: 'Tex. Fam. Code', section: '3.001', title: 'Separate Property' }],
  ['TFC:3.002', { code: 'Tex. Fam. Code', section: '3.002', title: 'Community Property' }],
  ['TFC:3.003', { code: 'Tex. Fam. Code', section: '3.003', title: 'Presumption of Community Property' }],
  ['TFC:6.001', { code: 'Tex. Fam. Code', section: '6.001', title: 'Insupportability — No-Fault Divorce' }],
  ['TFC:6.002', { code: 'Tex. Fam. Code', section: '6.002', title: 'Cruelty' }],
  ['TFC:6.003', { code: 'Tex. Fam. Code', section: '6.003', title: 'Adultery' }],
  ['TFC:6.006', { code: 'Tex. Fam. Code', section: '6.006', title: 'Abandonment' }],
  ['TFC:6.702', { code: 'Tex. Fam. Code', section: '6.702', title: 'Waiting Period — Divorce' }],
  ['TFC:7.001', { code: 'Tex. Fam. Code', section: '7.001', title: 'General Order of Division of Property' }],
  ['TFC:7.002', { code: 'Tex. Fam. Code', section: '7.002', title: "Division of Property — Just and Right" }],
  ['TFC:102.003', { code: 'Tex. Fam. Code', section: '102.003', title: 'Standing to File Suit — General' }],
  ['TFC:102.004', { code: 'Tex. Fam. Code', section: '102.004', title: 'Standing to File Suit — Grandparent' }],
  ['TFC:153.002', { code: 'Tex. Fam. Code', section: '153.002', title: 'Best Interest of Child — Standard' }],
  ['TFC:153.131', { code: 'Tex. Fam. Code', section: '153.131', title: 'Presumption — Joint Managing Conservatorship' }],
  ['TFC:153.252', { code: 'Tex. Fam. Code', section: '153.252', title: 'Standard Possession Order' }],
  ['TFC:154.001', { code: 'Tex. Fam. Code', section: '154.001', title: 'Court-Ordered Child Support' }],
  ['TFC:154.062', { code: 'Tex. Fam. Code', section: '154.062', title: 'Net Resources — Defined' }],
  ['TFC:154.125', { code: 'Tex. Fam. Code', section: '154.125', title: 'Application of Child Support Guidelines' }],
  ['TFC:156.101', { code: 'Tex. Fam. Code', section: '156.101', title: 'Modification of Conservatorship' }],
  ['TFC:156.401', { code: 'Tex. Fam. Code', section: '156.401', title: 'Modification of Child Support' }],

  // === Business & Commerce Code (TBCC) ===
  ['TBCC:2.313', { code: 'Tex. Bus. & Com. Code', section: '2.313', title: 'Express Warranties by Affirmation' }],
  ['TBCC:2.314', { code: 'Tex. Bus. & Com. Code', section: '2.314', title: 'Implied Warranty — Merchantability' }],
  ['TBCC:2.315', { code: 'Tex. Bus. & Com. Code', section: '2.315', title: 'Implied Warranty — Fitness for Particular Purpose' }],
  ['TBCC:2.607', { code: 'Tex. Bus. & Com. Code', section: '2.607', title: 'Effect of Acceptance — Burden of Proof' }],
  ['TBCC:2.714', { code: 'Tex. Bus. & Com. Code', section: '2.714', title: "Buyer's Damages for Breach" }],
  ['TBCC:2.715', { code: 'Tex. Bus. & Com. Code', section: '2.715', title: "Buyer's Incidental and Consequential Damages" }],
  ['TBCC:3.104', { code: 'Tex. Bus. & Com. Code', section: '3.104', title: 'Negotiable Instrument — Requirements' }],
  ['TBCC:3.301', { code: 'Tex. Bus. & Com. Code', section: '3.301', title: 'Person Entitled to Enforce Instrument' }],
  ['TBCC:3.305', { code: 'Tex. Bus. & Com. Code', section: '3.305', title: 'Defenses and Claims in Recoupment' }],
  ['TBCC:17.41', { code: 'Tex. Bus. & Com. Code', section: '17.41', title: 'DTPA — Short Title' }],
  ['TBCC:17.46', { code: 'Tex. Bus. & Com. Code', section: '17.46', title: 'DTPA — Deceptive Trade Practices' }],
  ['TBCC:17.49', { code: 'Tex. Bus. & Com. Code', section: '17.49', title: 'DTPA — Exemptions' }],
  ['TBCC:17.50', { code: 'Tex. Bus. & Com. Code', section: '17.50', title: 'DTPA — Relief for Consumers' }],
  ['TBCC:17.505', { code: 'Tex. Bus. & Com. Code', section: '17.505', title: 'DTPA — Notice and Offer of Settlement' }],
  ['TBCC:24.002', { code: 'Tex. Bus. & Com. Code', section: '24.002', title: 'Fraudulent Transfer — Definition' }],
  ['TBCC:24.005', { code: 'Tex. Bus. & Com. Code', section: '24.005', title: 'Fraudulent Transfer — Transfers Voidable' }],
  ['TBCC:24.008', { code: 'Tex. Bus. & Com. Code', section: '24.008', title: 'Fraudulent Transfer — Remedies of Creditors' }],
])

// ---------------------------------------------------------------------------
// Abbreviation → full code name mapping
// ---------------------------------------------------------------------------

const CODE_ABBREVIATIONS: Record<string, string> = {
  'CPRC': 'Tex. Civ. Prac. & Rem. Code',
  'TPC': 'Tex. Prop. Code',
  'TFC': 'Tex. Fam. Code',
  'TBCC': 'Tex. Bus. & Com. Code',
}

const FULL_NAME_TO_ABBREVIATION: Record<string, string> = {
  'Tex. Civ. Prac. & Rem. Code': 'CPRC',
  'Tex. Prop. Code': 'TPC',
  'Tex. Fam. Code': 'TFC',
  'Tex. Bus. & Com. Code': 'TBCC',
  // Common variations
  'Tex. Civ. Prac. and Rem. Code': 'CPRC',
  'Tex. Property Code': 'TPC',
  'Tex. Family Code': 'TFC',
  'Tex. Bus. and Com. Code': 'TBCC',
  'Tex. Bus. & Commerce Code': 'TBCC',
}

/**
 * Parse a citation string and check it against the Texas statute lookup table.
 *
 * Accepts formats like:
 *   "Tex. Civ. Prac. & Rem. Code § 16.004"
 *   "CPRC § 16.004"
 *   "Tex. Prop. Code § 92.052"
 */
export function verifyTexasStatute(citation: string): {
  found: boolean
  entry?: StatuteEntry
} {
  const cleaned = citation.trim()

  // Pattern 1: Abbreviation format — "CPRC § 16.004"
  const abbrMatch = cleaned.match(
    /^(CPRC|TPC|TFC|TBCC)\s*(?:§|sec\.?|section)\s*([\d.]+)/i
  )
  if (abbrMatch) {
    const abbr = abbrMatch[1].toUpperCase()
    const section = abbrMatch[2]
    const key = `${abbr}:${section}`
    const entry = TEXAS_STATUTES.get(key)
    return entry ? { found: true, entry } : { found: false }
  }

  // Pattern 2: Full name format — "Tex. Civ. Prac. & Rem. Code § 16.004"
  const fullMatch = cleaned.match(
    /^(Tex\.?\s+[\w\s&.]+Code)\s*(?:§|sec\.?|section)\s*([\d.]+)/i
  )
  if (fullMatch) {
    const codeName = fullMatch[1].replace(/\s+/g, ' ').trim()
    const section = fullMatch[2]

    // Try to find abbreviation for the full code name
    const abbr = FULL_NAME_TO_ABBREVIATION[codeName]
    if (abbr) {
      const key = `${abbr}:${section}`
      const entry = TEXAS_STATUTES.get(key)
      return entry ? { found: true, entry } : { found: false }
    }

    // Fuzzy match: normalize and try all known full names
    const normalized = codeName.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ')
    for (const [fullName, abbrCode] of Object.entries(FULL_NAME_TO_ABBREVIATION)) {
      const normalizedFull = fullName.toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ')
      if (normalized === normalizedFull || normalized.includes(normalizedFull) || normalizedFull.includes(normalized)) {
        const key = `${abbrCode}:${section}`
        const entry = TEXAS_STATUTES.get(key)
        return entry ? { found: true, entry } : { found: false }
      }
    }
  }

  return { found: false }
}
