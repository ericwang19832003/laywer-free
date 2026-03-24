import type { GuidedStepConfig } from '../types'

export const propertyInsuranceGuideConfig: GuidedStepConfig = {
  title: 'Filing an Insurance Claim',
  reassurance:
    'Insurance is there to help \u2014 but knowing the process protects you from lowball offers.',

  questions: [
    // Insurance coverage type
    {
      id: 'insurance_type',
      type: 'single_choice',
      prompt: 'Do you have insurance that covers this damage?',
      options: [
        { value: 'homeowners', label: 'Homeowners insurance' },
        { value: 'renters', label: 'Renters insurance' },
        { value: 'auto', label: 'Auto insurance' },
        { value: 'no_insurance', label: 'No insurance' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    },

    // Conditional instructions per insurance type
    {
      id: 'homeowners_info',
      type: 'info',
      prompt:
        'Homeowners insurance typically covers property damage from storms, fire, vandalism, and sometimes water damage. Review your policy\'s declarations page to confirm coverage. Check your deductible \u2014 your claim must exceed it to be worthwhile. File the claim as soon as possible; most policies have reporting deadlines.',
      showIf: (answers) => answers.insurance_type === 'homeowners',
    },
    {
      id: 'renters_info',
      type: 'info',
      prompt:
        'Renters insurance covers your personal property (belongings), not the building itself. If the building is damaged, your landlord\'s insurance should cover structural repairs. File a claim for any damaged personal items \u2014 furniture, electronics, clothing, etc. Make a detailed inventory of everything damaged.',
      showIf: (answers) => answers.insurance_type === 'renters',
    },
    {
      id: 'auto_info',
      type: 'info',
      prompt:
        'If a vehicle caused the damage to your property, the driver\'s auto insurance (liability coverage) should pay for your property repairs. File a claim with the driver\'s insurance company. If the driver is uninsured or unknown, check whether your own homeowners policy covers it.',
      showIf: (answers) => answers.insurance_type === 'auto',
    },
    {
      id: 'no_insurance_info',
      type: 'info',
      prompt:
        'Without insurance, you will need to pursue the responsible party directly for the cost of repairs. Your repair estimates and documentation become even more important. You can still file a lawsuit to recover damages. Consider whether the other party has insurance that might cover your loss.',
      showIf: (answers) => answers.insurance_type === 'no_insurance',
    },
    {
      id: 'unsure_info',
      type: 'info',
      prompt:
        'Check the following to determine your coverage:\n1. Review your homeowners or renters insurance policy declarations page.\n2. Call your insurance agent and describe the damage \u2014 they can tell you if it\'s covered.\n3. If a vehicle caused the damage, the driver\'s auto insurance may apply.\n4. If you\'re in a condo or townhome, check both your personal policy and the HOA\'s master policy.',
      showIf: (answers) => answers.insurance_type === 'unsure',
    },

    // How to file
    {
      id: 'how_to_file',
      type: 'info',
      prompt:
        'HOW TO FILE:\n1. Call your insurance company\'s claims line (on your policy card)\n2. Report the damage \u2014 be factual, not emotional\n3. An adjuster will be assigned and will inspect the damage\n4. Get your OWN repair estimates (don\'t rely solely on the adjuster\'s)\n5. If the adjuster\'s estimate is low, send your contractor estimates and negotiate',
      showIf: (answers) =>
        answers.insurance_type !== 'no_insurance',
    },

    // Adjuster assessment
    {
      id: 'adjuster_assessed',
      type: 'yes_no',
      prompt: 'Has the adjuster already assessed the damage?',
      showIf: (answers) =>
        answers.insurance_type !== 'no_insurance' &&
        answers.insurance_type !== 'unsure',
    },
    {
      id: 'adjuster_dispute_info',
      type: 'info',
      prompt:
        'If you\'re unhappy with the adjuster\'s assessment, you have options:\n\n1. SEND YOUR OWN ESTIMATES: Provide your contractor\'s written estimates showing a higher repair cost. The insurance company must consider them.\n2. REQUEST RE-INSPECTION: Ask for a different adjuster or a re-inspection if you believe they missed damage.\n3. APPRAISAL CLAUSE: Most Texas policies include an appraisal clause. Either party can invoke it \u2014 each side hires an appraiser, and a neutral umpire breaks any tie. This is often faster and cheaper than a lawsuit.\n4. FILE A COMPLAINT: If the insurer acts in bad faith, you can file a complaint with the Texas Department of Insurance (tdi.texas.gov).',
      showIf: (answers) => answers.adjuster_assessed === 'yes',
    },

    // Subrogation info
    {
      id: 'subrogation_info',
      type: 'info',
      prompt:
        'IMPORTANT: Filing an insurance claim does NOT prevent you from suing the person who caused the damage. Your insurance may pay first, then pursue the responsible party through "subrogation."',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Insurance type
    if (answers.insurance_type) {
      const labels: Record<string, string> = {
        homeowners: 'homeowners insurance',
        renters: 'renters insurance',
        auto: 'auto insurance',
        no_insurance: 'no insurance coverage',
        unsure: 'insurance coverage unknown',
      }
      if (answers.insurance_type === 'no_insurance') {
        items.push({
          status: 'info',
          text: 'No insurance coverage. You will need to pursue the responsible party directly for repair costs.',
        })
      } else if (answers.insurance_type === 'unsure') {
        items.push({
          status: 'needed',
          text: 'Determine your insurance coverage. Review your policy or call your insurance agent.',
        })
      } else {
        items.push({
          status: 'done',
          text: `Insurance type identified: ${labels[answers.insurance_type]}.`,
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Determine whether you have insurance that covers this damage.',
      })
    }

    // Filing steps
    if (
      answers.insurance_type &&
      answers.insurance_type !== 'no_insurance' &&
      answers.insurance_type !== 'unsure'
    ) {
      items.push({
        status: 'needed',
        text: 'File your insurance claim: call the claims line, report the damage factually, and get your own repair estimates.',
      })
    }

    // Adjuster
    if (answers.adjuster_assessed === 'yes') {
      items.push({
        status: 'done',
        text: 'Adjuster has assessed the damage.',
      })
      items.push({
        status: 'info',
        text: 'If the adjuster\'s estimate is too low, send your own contractor estimates, request re-inspection, or invoke the appraisal clause in your policy.',
      })
    } else if (
      answers.insurance_type &&
      answers.insurance_type !== 'no_insurance' &&
      answers.insurance_type !== 'unsure'
    ) {
      items.push({
        status: 'needed',
        text: 'Wait for the adjuster to assess the damage. Have your own repair estimates ready to compare.',
      })
    }

    // Subrogation reminder
    items.push({
      status: 'info',
      text: 'Filing an insurance claim does not prevent you from suing the person who caused the damage. Your insurer may pursue the responsible party through subrogation.',
    })

    return items
  },
}
