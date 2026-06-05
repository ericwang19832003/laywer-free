import { describe, expect, it } from 'vitest'
import type { GuidedStepConfig } from '@lawyer-free/shared/guided-steps/types'
import { piServiceGuideConfig } from '@lawyer-free/shared/guided-steps/personal-injury/pi-service-guide'

function allText(config: GuidedStepConfig): string {
  return [
    config.title,
    config.reassurance,
    ...config.questions.flatMap((question) => [
      question.prompt,
      question.helpText ?? '',
      ...(question.options?.map((option) => option.label) ?? []),
    ]),
    ...config.generateSummary({}).map((item) => item.text),
  ].join('\n')
}

describe('piServiceGuideConfig', () => {
  it('walks users through service with practical questions and method-specific instructions', () => {
    const text = allText(piServiceGuideConfig)

    expect(text).toContain("Let's build your service plan")
    expect(text).toContain('Has the court accepted your petition?')
    expect(text).toContain('Do you have the court-issued citation?')
    expect(text).toContain('I am not sure')
    expect(text).toContain('Who did you sue or plan to sue?')
    expect(text).toContain('I sued or plan to sue Penske / a rental-truck company')
    expect(text).toContain('Do you know where the defendant can be served?')
    expect(text).toContain('What will you send to the sheriff, constable, or process server?')
    expect(text).toContain('court-issued citation')
    expect(text).toContain('file a Return of Service with the court')
    expect(text).toContain('Do not serve the insurance company unless it is named as a defendant')
    expect(text).not.toContain('Before service, confirm three things')
  })

  it('summarizes missing service prerequisites before the answer deadline can start', () => {
    const summary = piServiceGuideConfig
      .generateSummary({
        citation_status: 'not_sure',
        filing_accepted: 'yes',
        service_address_known: 'no',
        service_packet_ready: 'no',
      })
      .map((item) => item.text)
      .join('\n')

    expect(summary).toContain('Get the court-issued citation from the clerk')
    expect(summary).toContain('Ask the filing clerk whether citation has been issued')
    expect(summary).toContain('Find a service address')
    expect(summary).toContain('Prepare the service packet')
    expect(summary).toContain('The answer deadline does not start until service is completed')
  })

  it('infers registered-agent service when the user only knows Penske is involved', () => {
    const summary = piServiceGuideConfig
      .generateSummary({
        filing_accepted: 'yes',
        citation_status: 'not_sure',
        known_defendant_source: 'rental_truck_company',
        defendant_name: 'Penske Truck Leasing Co.',
        service_address_known: 'no',
        service_method: 'not_sure',
      })
      .map((item) => item.text)
      .join('\n')

    expect(summary).toContain('For Penske Truck Leasing Co., service usually goes to its registered agent or another authorized business recipient')
    expect(summary).toContain('look up the registered agent and service address')
    expect(summary).toContain('Ask the filing clerk whether citation has been issued')
  })

  it('generates a cross-county service plan for a Harris filing and Travis service address', () => {
    const summary = piServiceGuideConfig
      .generateSummary({
        citation_ready: 'yes',
        filing_county: 'Harris County',
        filing_court: 'Harris County Court at Law',
        defendant_type: 'business',
        defendant_name: 'Penske Truck Leasing Co.',
        service_recipient: 'Penske registered agent',
        service_address_known: 'yes',
        service_county_location: 'different_texas_county',
        service_county: 'Travis County',
        service_address: 'Austin, Texas',
        service_method: 'sheriff_constable',
        service_packet_ready: 'yes',
        return_of_service_plan: 'yes',
      })
      .map((item) => item.text)
      .join('\n')

    expect(summary).toContain('Pick up or download the citation from Harris County Court at Law in Harris County')
    expect(summary).toContain('send the citation and petition to the sheriff or constable in Travis County')
    expect(summary).toContain('Serve Penske registered agent for Penske Truck Leasing Co. at Austin, Texas')
    expect(summary).toContain('Confirm the Return of Service is filed back in the Harris County case')
  })
})
