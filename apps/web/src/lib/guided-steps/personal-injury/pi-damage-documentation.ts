import type { GuidedStepConfig } from '../types'

export const piDamageDocumentationConfig: GuidedStepConfig = {
  title: 'Document Your Property Damage',
  reassurance:
    'Thorough damage documentation strengthens your case and helps calculate your full losses.',

  questions: [
    {
      id: 'has_photos',
      type: 'yes_no',
      prompt: 'Do you have photos of the damage (before and after, if possible)?',
      helpText:
        'Photos taken immediately after the incident are the strongest evidence. Include wide shots and close-ups.',
    },
    {
      id: 'has_repair_estimate',
      type: 'single_choice',
      prompt: 'Do you have a professional repair estimate or appraisal?',
      helpText:
        'Get at least two written estimates from licensed contractors or repair shops.',
      options: [
        { value: 'multiple', label: 'Yes, two or more estimates' },
        { value: 'one', label: 'Yes, one estimate' },
        { value: 'none', label: 'Not yet' },
      ],
    },
    {
      id: 'estimate_tip',
      type: 'info',
      prompt:
        'Get at least two written estimates from licensed, reputable professionals. Written estimates carry more weight than verbal ones. Keep all receipts.',
      showIf: (answers) => answers.has_repair_estimate === 'none' || answers.has_repair_estimate === 'one',
    },
    {
      id: 'damage_type',
      type: 'single_choice',
      prompt: 'What type of property was damaged?',
      options: [
        { value: 'vehicle', label: 'Vehicle' },
        { value: 'home', label: 'Home or building' },
        { value: 'personal_property', label: 'Personal property (electronics, furniture, etc.)' },
        { value: 'multiple', label: 'Multiple types of property' },
      ],
    },
    {
      id: 'has_pre_damage_value',
      type: 'yes_no',
      prompt: 'Can you document the value of the property before the damage?',
      helpText:
        'This could be a recent appraisal, purchase receipt, Kelly Blue Book value (for vehicles), or comparable market listings.',
    },
    {
      id: 'insurance_claim_filed',
      type: 'yes_no',
      prompt: 'Have you filed a claim with your own insurance company?',
      helpText:
        'Even if you plan to recover from the at-fault party, filing with your own insurer can speed up repairs.',
    },
    {
      id: 'repairs_started',
      type: 'single_choice',
      prompt: 'What is the current status of repairs?',
      options: [
        { value: 'not_started', label: 'Not started yet' },
        { value: 'in_progress', label: 'In progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'total_loss', label: 'Total loss / not repairable' },
      ],
    },
    {
      id: 'keep_receipts_info',
      type: 'info',
      prompt:
        'Keep every receipt related to the damage: repair invoices, rental car costs, temporary housing, storage fees, and any other out-of-pocket expenses. These are all recoverable damages.',
      showIf: (answers) => answers.repairs_started === 'in_progress' || answers.repairs_started === 'completed',
    },
    {
      id: 'has_loss_of_use',
      type: 'yes_no',
      prompt: 'Have you experienced loss of use (e.g., rental car, temporary housing, inability to use property)?',
      helpText:
        'Loss of use costs are compensable damages. Document dates and amounts for any substitute arrangements.',
    },
    {
      id: 'has_diminished_value',
      type: 'yes_no',
      prompt: 'Do you believe the property has lost value even after repairs (diminished value)?',
      helpText:
        'For vehicles, a diminished value claim compensates for the reduced resale value after an accident. You may need a professional appraisal.',
      showIf: (answers) => answers.damage_type === 'vehicle',
    },
    {
      id: 'timeline_created',
      type: 'yes_no',
      prompt: 'Have you created a timeline of events (incident, damage discovery, estimates, repairs)?',
      helpText:
        'A clear timeline helps present your claim. Include dates, what happened, and any costs incurred.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_photos === 'yes') {
      items.push({ status: 'done', text: 'Damage photos collected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Take photos of all damage — wide shots and close-ups. Include before photos if available.',
      })
    }

    if (answers.has_repair_estimate === 'multiple') {
      items.push({ status: 'done', text: 'Multiple repair estimates obtained.' })
    } else if (answers.has_repair_estimate === 'one') {
      items.push({
        status: 'needed',
        text: 'Get at least one more written repair estimate for comparison.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Get at least two written repair estimates from licensed professionals.',
      })
    }

    if (answers.has_pre_damage_value === 'yes') {
      items.push({ status: 'done', text: 'Pre-damage property value documented.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Document the pre-damage value: purchase receipts, appraisals, or market comparables.',
      })
    }

    if (answers.insurance_claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Consider filing a claim with your own insurance to speed up repairs.',
      })
    }

    if (answers.repairs_started === 'completed') {
      items.push({ status: 'done', text: 'Repairs completed.' })
    } else if (answers.repairs_started === 'total_loss') {
      items.push({
        status: 'info',
        text: 'Property is a total loss. Document the fair market value for your claim.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Keep all repair receipts, invoices, and records of out-of-pocket expenses.',
      })
    }

    if (answers.has_loss_of_use === 'yes') {
      items.push({
        status: 'info',
        text: 'Document all loss-of-use costs (rental car, temporary housing, etc.) with receipts and dates.',
      })
    }

    if (answers.has_diminished_value === 'yes') {
      items.push({
        status: 'needed',
        text: 'Consider getting a diminished value appraisal to document reduced resale value.',
      })
    }

    if (answers.timeline_created === 'yes') {
      items.push({ status: 'done', text: 'Damage timeline created.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Create a timeline: incident date, damage discovery, estimates obtained, repairs started/completed, costs incurred.',
      })
    }

    return items
  },
}
