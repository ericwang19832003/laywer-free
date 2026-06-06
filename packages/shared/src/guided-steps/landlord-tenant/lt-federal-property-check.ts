import type { GuidedStepConfig } from '../types'

const FEDERALLY_BACKED_VALUES = [
  'section_8',
  'lihtc',
  'public_housing',
  'fha_mortgage',
  'gse_mortgage',
  'usda_rural',
]

function isFederallyBacked(answers: Record<string, string>): boolean {
  return FEDERALLY_BACKED_VALUES.includes(answers.property_funding)
}

export const ltFederalPropertyCheckConfig: GuidedStepConfig = {
  title: 'Is Your Property Federally Backed?',
  reassurance:
    'If your property receives federal funding, you may have stronger protections.',

  questions: [
    {
      id: 'federal_backing_intro',
      type: 'info',
      prompt:
        'Certain properties that receive federal backing have ADDITIONAL tenant protections, including a required 30-day notice to vacate (instead of the standard 3 days). Many tenants don\'t know their property qualifies.',
      acknowledgeLabel: "I understand — federal backing can mean stronger eviction notice protections",
    },
    {
      id: 'property_funding',
      type: 'single_choice',
      prompt: 'Does your property have any of these?',
      options: [
        { value: 'section_8', label: 'Section 8 / Housing Choice Voucher' },
        { value: 'lihtc', label: 'Low-Income Housing Tax Credit property' },
        { value: 'public_housing', label: 'Public housing authority' },
        { value: 'fha_mortgage', label: 'FHA-insured mortgage' },
        { value: 'gse_mortgage', label: 'Fannie Mae / Freddie Mac backed mortgage' },
        { value: 'usda_rural', label: 'USDA Rural Housing' },
        { value: 'not_sure', label: 'Not sure' },
        { value: 'none', label: 'None of these' },
      ],
    },
    {
      id: 'federal_protections_info',
      type: 'info',
      prompt:
        'FEDERAL PROTECTIONS APPLY — Your property appears to be federally backed. Key protections:\n\n• 30-DAY NOTICE required before eviction (not 3 days)\n• If your landlord only gave you 3 days\' notice, the notice may be DEFECTIVE and the eviction should be dismissed\n• Additional due process protections may apply depending on the program\n• Check the specific program rules for additional protections',
      acknowledgeLabel: "I understand my federal protections — I have a right to 30-day notice before eviction",
      showIf: (answers) => isFederallyBacked(answers),
    },
    {
      id: 'how_to_check_info',
      type: 'multi_select',
      prompt:
        'HOW TO CHECK — Complete these steps to determine if your property is federally backed (check each one as you do it):',
      options: [
        { value: 'ask_landlord', label: 'Asked landlord or property manager directly' },
        { value: 'check_lease', label: 'Checked lease for HUD, FHA, Section 8, LIHTC, or federal program mentions' },
        { value: 'search_nhpd', label: 'Searched National Housing Preservation Database (preservationdatabase.org)' },
        { value: 'check_fannie_freddie', label: 'Checked Fannie Mae / Freddie Mac loan lookup tools' },
        { value: 'contact_hud', label: 'Contacted local HUD office (1-800-569-4287)' },
      ],
      showIf: (answers) => answers.property_funding === 'not_sure',
    },
    {
      id: 'standard_notice_info',
      type: 'info',
      prompt:
        'Standard Texas notice periods apply (typically 3 days for nonpayment, or as specified in your lease).',
      acknowledgeLabel: "I understand — standard Texas notice periods apply to my property",
      showIf: (answers) => answers.property_funding === 'none',
    },
    {
      id: 'received_only_3_day',
      type: 'yes_no',
      prompt: 'Did you receive only a 3-day notice to vacate?',
      showIf: (answers) => isFederallyBacked(answers),
    },
    {
      id: 'notice_defect_defense',
      type: 'info',
      prompt:
        'POTENTIAL DEFENSE — If your property is federally backed and you only received 3 days\' notice, the notice is likely DEFECTIVE. Raise this in your answer: "The notice to vacate is defective because the property is [federally backed/Section 8/etc.] and federal law requires a minimum 30-day notice." This should result in dismissal.',
      acknowledgeLabel: "I understand — I'll raise the defective notice defense in my answer",
      showIf: (answers) =>
        isFederallyBacked(answers) && answers.received_only_3_day === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const fundingLabels: Record<string, string> = {
      section_8: 'Section 8 / Housing Choice Voucher',
      lihtc: 'Low-Income Housing Tax Credit',
      public_housing: 'Public housing authority',
      fha_mortgage: 'FHA-insured mortgage',
      gse_mortgage: 'Fannie Mae / Freddie Mac backed mortgage',
      usda_rural: 'USDA Rural Housing',
      not_sure: 'Unknown — needs further research',
      none: 'No federal backing identified',
    }

    const fundingType = fundingLabels[answers.property_funding] || 'Not determined'

    if (isFederallyBacked(answers)) {
      items.push({
        status: 'done',
        text: `Property is federally backed: ${fundingType}. Federal tenant protections apply, including a required 30-day notice to vacate.`,
      })

      if (answers.received_only_3_day === 'yes') {
        items.push({
          status: 'needed',
          text: 'POTENTIAL NOTICE DEFECT: Only a 3-day notice was received on a federally backed property. The notice may be defective — federal law requires a minimum 30-day notice. Raise this defense in your answer.',
        })
      } else if (answers.received_only_3_day === 'no') {
        items.push({
          status: 'info',
          text: 'Notice period appears to meet federal requirements. Verify the exact number of days given matches program-specific rules.',
        })
      }
    } else if (answers.property_funding === 'not_sure') {
      const checkedSteps = answers.how_to_check_info
        ? new Set(answers.how_to_check_info.split(','))
        : new Set<string>()
      const totalSteps = 5
      const completedCount = checkedSteps.size
      if (completedCount === totalSteps) {
        items.push({
          status: 'done',
          text: 'All verification steps completed. Update your property funding selection based on what you found.',
        })
      } else if (completedCount > 0) {
        items.push({
          status: 'needed',
          text: `Federal backing status unknown. You have completed ${completedCount} of ${totalSteps} verification steps — complete the remaining steps to determine if federal protections apply.`,
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Federal backing status unknown. Complete the verification steps to determine if stronger protections (including 30-day notice) apply.',
        })
      }
    } else if (answers.property_funding === 'none') {
      items.push({
        status: 'info',
        text: 'No federal backing identified. Standard Texas notice periods apply.',
      })
    }

    return items
  },
}
