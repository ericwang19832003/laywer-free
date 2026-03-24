import type { GuidedStepConfig } from './types'

export const mediationPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Mediation',
  reassurance:
    'Mediation can resolve your case faster and cheaper than trial.',

  questions: [
    {
      id: 'mediator_selected',
      type: 'yes_no',
      prompt: 'Have you selected a mediator?',
    },
    {
      id: 'mediator_info',
      type: 'info',
      prompt: 'You can use a court-appointed mediator, agreed-upon private mediator, or a mediation service. Consider cost, availability, and expertise.',
      showIf: (answers) => answers.mediator_selected === 'no',
    },
    {
      id: 'mediation_date_set',
      type: 'yes_no',
      prompt: 'Have you scheduled the mediation date?',
    },
    {
      id: 'settlement_authority',
      type: 'yes_no',
      prompt: 'Do you have settlement authority (ability to settle within a range)?',
    },
    {
      id: 'authority_info',
      type: 'info',
      prompt: 'You may need someone with settlement authority to be available by phone during mediation. This could be you, an insurance representative, or someone with power of attorney.',
      showIf: (answers) => answers.settlement_authority === 'no',
    },
    {
      id: 'demand_ready',
      type: 'yes_no',
      prompt: 'Have you prepared your mediation statement/demand?',
    },
    {
      id: 'evidence_organized',
      type: 'yes_no',
      prompt: 'Is your evidence organized and ready to present?',
    },
    {
      id: 'settlement_range',
      type: 'yes_no',
      prompt: 'Do you know your settlement range (minimum/maximum)?',
    },
    {
      id: 'BATNA_prepared',
      type: 'yes_no',
      prompt: 'Have you considered your BATNA (Best Alternative to Negotiated Agreement)?',
    },
    {
      id: 'BATNA_info',
      type: 'info',
      prompt: 'Your BATNA is what happens if mediation fails. This might be going to trial, accepting a judgment, or walking away.',
      showIf: (answers) => answers.BATNA_prepared === 'no',
    },
    {
      id: 'opposing_position',
      type: 'yes_no',
      prompt: 'Have you considered what the opposing party\'s position might be?',
    },
    {
      id: 'key_issues',
      type: 'yes_no',
      prompt: 'Have you identified the key issues that need to be resolved?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.mediator_selected === 'yes') {
      items.push({ status: 'done', text: 'Mediator selected.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Select a mediator - consider court programs, private mediators, or mediation services.',
      })
    }

    if (answers.mediation_date_set === 'yes') {
      items.push({ status: 'done', text: 'Mediation date scheduled.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Schedule your mediation date with the mediator and opposing party.',
      })
    }

    if (answers.settlement_authority === 'yes') {
      items.push({ status: 'done', text: 'Settlement authority arranged.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Arrange for someone with settlement authority to be available during mediation.',
      })
    }

    if (answers.demand_ready === 'yes') {
      items.push({ status: 'done', text: 'Mediation statement prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your mediation statement or demand summarizing your case and settlement position.',
      })
    }

    if (answers.evidence_organized === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize documents, photos, and evidence to support your position.',
      })
    }

    if (answers.settlement_range === 'yes') {
      items.push({ status: 'done', text: 'Settlement range determined.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Know your settlement range - your walkaway point and ideal settlement.',
      })
    }

    if (answers.BATNA_prepared === 'yes') {
      items.push({ status: 'done', text: 'BATNA considered.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Consider your BATNA - what happens if mediation doesn\'t result in a settlement.',
      })
    }

    if (answers.key_issues === 'yes') {
      items.push({ status: 'done', text: 'Key issues identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the 3-5 key issues that must be resolved for a settlement.',
      })
    }

    return items
  },
}
