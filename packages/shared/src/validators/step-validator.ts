import type { JurisdictionRuleConfig, GlossaryEntry } from '../jurisdiction-rules/schema'

export interface StepValidationResult {
  blocks: { field: string; message: string }[]
  warnings: { condition: string; message: string }[]
  glossaryHits: GlossaryEntry[]
}

export function validateStep(
  config: JurisdictionRuleConfig,
  wizardStep: string,
  fieldValues: Record<string, string>,
): StepValidationResult {
  const stepConfig = config.stepValidations[wizardStep]

  if (!stepConfig) {
    return { blocks: [], warnings: [], glossaryHits: [] }
  }

  const blocks: StepValidationResult['blocks'] = []
  for (const field of stepConfig.required) {
    const value = fieldValues[field]
    if (!value || value.trim() === '') {
      blocks.push({
        field,
        message: `This field is required for your ${config.disputeType.replace(/_/g, ' ')} filing.`,
      })
    }
  }

  const warnings = [...stepConfig.warnings]

  const allText = Object.values(fieldValues).join(' ').toLowerCase()
  const glossaryHits = config.glossary.filter(g =>
    allText.includes(g.term.toLowerCase()),
  )

  return { blocks, warnings, glossaryHits }
}
