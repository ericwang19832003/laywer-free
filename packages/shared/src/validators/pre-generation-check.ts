import type { JurisdictionRuleConfig } from '../jurisdiction-rules/schema'

export interface PreGenerationGap {
  sectionId: string
  sectionLabel: string
  wizardStep: string
  message: string
}

export interface PreGenerationResult {
  ready: boolean
  gaps: PreGenerationGap[]
}

const SECTION_TO_WIZARD_STEP: Record<string, string> = {
  caption: 'parties',
  parties: 'parties',
  jurisdiction: 'venue',
  venue: 'venue',
  facts: 'facts',
  general_denial: 'claims',
  affirmative_defenses: 'claims',
  claims: 'claims',
  relief: 'relief',
  prayer: 'relief',
  verification: 'review',
  certificate_of_service: 'review',
}

const SECTION_TO_DATA_CHECK: Record<string, (data: Record<string, any>) => boolean> = {
  caption: (d) => Boolean(d.yourInfo?.full_name && d.opposingParties?.[0]?.full_name),
  parties: (d) => Boolean(d.yourInfo?.full_name && d.opposingParties?.[0]?.full_name),
  jurisdiction: (d) => Boolean(d.venue?.county),
  venue: (d) => Boolean(d.venue?.county),
  facts: (d) => Boolean(d.description && d.description.length > 20),
  general_denial: (d) => Boolean(d.claimDetails),
  affirmative_defenses: (d) => Boolean(d.claimDetails),
  claims: (d) => Boolean(d.claimDetails),
  relief: (d) => Boolean(d.reliefRequested),
  prayer: (d) => Boolean(d.reliefRequested),
  verification: () => true,
  certificate_of_service: () => true,
}

export function checkPreGeneration(
  config: JurisdictionRuleConfig,
  wizardData: Record<string, any>,
): PreGenerationResult {
  const gaps: PreGenerationGap[] = []

  for (const section of config.requiredSections) {
    const checker = SECTION_TO_DATA_CHECK[section.id]
    if (checker && !checker(wizardData)) {
      gaps.push({
        sectionId: section.id,
        sectionLabel: section.label,
        wizardStep: SECTION_TO_WIZARD_STEP[section.id] ?? 'review',
        message: `Your ${section.label.toLowerCase()} section needs more information. ${section.description}`,
      })
    }
  }

  return { ready: gaps.length === 0, gaps }
}
