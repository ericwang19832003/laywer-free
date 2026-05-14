import type { GuidedStepConfig } from '../types'

export const existingOrderReviewConfig: GuidedStepConfig = {
  title: 'Review Existing Order',
  reassurance: 'Understanding your existing order is essential to identifying what can be modified and what legal standard applies.',
  questions: [
    {
      id: 'order_uploaded',
      type: 'yes_no',
      prompt: 'Have you uploaded your existing court order to the evidence vault?',
    },
    {
      id: 'upload_info',
      type: 'info',
      prompt: 'Upload your existing order to the Evidence Vault. If you don\'t have a copy, request one from the court clerk.',
      showIf: (a) => a.order_uploaded === 'no',
    },
    {
      id: 'provisions_identified',
      type: 'yes_no',
      prompt: 'Have you identified the specific provisions you want to change?',
    },
    {
      id: 'provisions_info',
      type: 'info',
      prompt: 'Review each section: custody/conservatorship, possession schedule, child support, and any other provisions. List exactly what you want changed.',
      showIf: (a) => a.provisions_identified === 'no',
    },
    {
      id: 'order_date',
      type: 'text',
      prompt: 'When was the existing order signed by the judge?',
      placeholder: 'e.g., March 2025',
      helpText: 'This helps determine whether you can file now or may need to wait.',
    },
    {
      id: 'one_year_rule',
      type: 'info',
      prompt: 'ONE-YEAR RULE: Texas law generally prohibits modifying custody or conservatorship within 1 year of the last order.\n\nExceptions (you CAN file within 1 year if):\n1. The person with primary custody agrees to the change\n2. The child\'s current environment endangers their physical health or significantly harms their emotional development\n3. The person with primary custody has allowed someone else to have primary care for 6+ months (military deployment excluded)\n\nIf you are only modifying child support or visitation (not custody), the 1-year rule does not apply.',
    },
    {
      id: 'one_year_status',
      type: 'single_choice',
      prompt: 'Does the 1-year restriction affect your case?',
      options: [
        { value: 'over_one_year', label: 'The order is more than 1 year old — no restriction' },
        { value: 'consent', label: 'The other parent agrees to the change' },
        { value: 'endangerment', label: 'The child\'s current environment is dangerous' },
        { value: 'custody_transfer', label: 'The custodial parent gave primary care to someone else for 6+ months' },
        { value: 'not_custody', label: 'I am only modifying support or visitation, not custody' },
      ],
    },
    {
      id: 'endangerment_info',
      type: 'info',
      prompt: 'ENDANGERMENT EXCEPTION: You must file a "Declaration in Support of Changing Primary Custody within One Year" with specific facts under penalty of perjury. The judge reviews this declaration to decide whether to schedule a hearing. Be specific and factual — vague allegations will not be sufficient.',
      showIf: (a) => a.one_year_status === 'endangerment',
    },
    {
      id: 'change_documented',
      type: 'yes_no',
      prompt: 'Have you documented the material and substantial change in circumstances?',
      helpText: 'Texas requires proof of a "material and substantial change" since the last order.',
    },
    {
      id: 'change_info',
      type: 'info',
      prompt: 'Document what changed: job loss/new job, relocation, children\'s needs changed, safety concerns, or significant time passage.\n\nFor child support: if 3+ years have passed and the guideline amount differs by 20% or $100/month from the current order, modification is presumptively appropriate.',
      showIf: (a) => a.change_documented === 'no',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.order_uploaded === 'yes') {
      items.push({ status: 'done', text: 'Existing order uploaded to evidence vault.' })
    } else {
      items.push({ status: 'needed', text: 'Upload your existing court order to the Evidence Vault.' })
    }

    if (answers.provisions_identified === 'yes') {
      items.push({ status: 'done', text: 'Provisions to modify identified.' })
    } else {
      items.push({ status: 'needed', text: 'Identify the specific provisions you want to change.' })
    }

    if (answers.change_documented === 'yes') {
      items.push({ status: 'done', text: 'Change in circumstances documented.' })
    } else {
      items.push({ status: 'needed', text: 'Document the material and substantial change in circumstances.' })
    }

    if (answers.one_year_status === 'endangerment') {
      items.push({ status: 'needed', text: 'Prepare a sworn declaration with specific facts for the 1-year exception (endangerment).' })
    } else if (answers.one_year_status === 'over_one_year' || answers.one_year_status === 'not_custody') {
      items.push({ status: 'done', text: 'No 1-year restriction applies to your modification.' })
    } else if (answers.one_year_status) {
      items.push({ status: 'done', text: '1-year exception applies to your case.' })
    }

    items.push({ status: 'info', text: 'Texas law requires a "material and substantial change" to modify a family court order.' })
    return items
  },
}
