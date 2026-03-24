import type { GuidedStepConfig } from '../types'

export const ltMediationConfig: GuidedStepConfig = {
  title: 'Mediation',
  reassurance:
    'Mediation is a chance to resolve your dispute with the help of a neutral third party. Many landlord-tenant cases settle at mediation, saving both sides the uncertainty of a hearing.',

  questions: [
    {
      id: 'mediation_type',
      type: 'single_choice',
      prompt: 'Is mediation court-ordered or voluntary?',
      helpText:
        'Some courts require mediation before a hearing, especially for non-eviction landlord-tenant disputes. Either way, mediation can be very effective.',
      options: [
        { value: 'court_ordered', label: 'Court-ordered' },
        { value: 'voluntary', label: 'Voluntary' },
        { value: 'not_sure', label: 'Not sure' },
      ],
    },
    {
      id: 'court_ordered_info',
      type: 'info',
      prompt:
        'If the court ordered mediation, you must attend in good faith. Check your court order for the deadline to complete mediation and any approved mediator requirements.',
      showIf: (answers) => answers.mediation_type === 'court_ordered',
    },
    {
      id: 'mediator_selected',
      type: 'yes_no',
      prompt: 'Has a mediator been selected?',
      helpText:
        'Many courts have a list of approved mediators, or offer free mediation services through community dispute resolution centers.',
    },
    {
      id: 'mediator_info',
      type: 'info',
      prompt:
        'Check with the court clerk for a list of approved mediators or free mediation programs. Many Texas counties offer dispute resolution centers that handle landlord-tenant cases at low or no cost.',
      showIf: (answers) => answers.mediator_selected === 'no',
    },
    {
      id: 'settlement_authority',
      type: 'yes_no',
      prompt: 'Have you determined your settlement authority?',
      helpText:
        'Settlement authority means knowing exactly what you can agree to: move-out dates, payment amounts, repair commitments, lease modifications.',
    },
    {
      id: 'settlement_authority_info',
      type: 'info',
      prompt:
        'Before mediation, decide: What is your ideal outcome? What is your bottom line? What terms would you accept? Having clear boundaries makes mediation more productive.',
      showIf: (answers) => answers.settlement_authority === 'no',
    },
    {
      id: 'mediation_result',
      type: 'single_choice',
      prompt: 'What was the mediation outcome?',
      options: [
        { value: 'settled', label: 'We reached an agreement' },
        { value: 'no_agreement', label: 'No agreement reached' },
        { value: 'not_yet', label: 'Mediation hasn\'t happened yet' },
      ],
    },
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'Make sure your mediation agreement is signed by both parties and filed with the court. A mediated settlement agreement is binding and enforceable.',
      showIf: (answers) => answers.mediation_result === 'settled',
    },
    {
      id: 'no_agreement_info',
      type: 'info',
      prompt:
        'Since mediation did not resolve the dispute, your case will proceed to a hearing. Your mediation discussions are confidential and cannot be used against you in court.',
      showIf: (answers) => answers.mediation_result === 'no_agreement',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.mediation_type === 'court_ordered') {
      items.push({ status: 'info', text: 'Court-ordered mediation — attendance is required.' })
    } else if (answers.mediation_type === 'voluntary') {
      items.push({ status: 'info', text: 'Voluntary mediation.' })
    }

    if (answers.mediator_selected === 'yes') {
      items.push({ status: 'done', text: 'Mediator selected.' })
    } else {
      items.push({ status: 'needed', text: 'Select a mediator. Check with the court for approved mediators or free programs.' })
    }

    if (answers.settlement_authority === 'yes') {
      items.push({ status: 'done', text: 'Settlement authority determined.' })
    } else {
      items.push({ status: 'needed', text: 'Determine your settlement authority before mediation.' })
    }

    if (answers.mediation_result === 'settled') {
      items.push({ status: 'done', text: 'Agreement reached at mediation. File the signed agreement with the court.' })
    } else if (answers.mediation_result === 'no_agreement') {
      items.push({ status: 'info', text: 'No agreement at mediation. The case will proceed to a hearing.' })
    } else if (answers.mediation_result === 'not_yet') {
      items.push({ status: 'info', text: 'Mediation has not occurred yet. Prepare your settlement terms.' })
    }

    return items
  },
}
