import type { GuidedStepConfig } from '../types'

export const contractMediationConfig: GuidedStepConfig = {
  title: 'Mediation',
  reassurance:
    'Mediation is a structured negotiation with a neutral mediator. Many contract disputes settle at mediation, saving both sides the time and expense of trial.',

  questions: [
    {
      id: 'mediation_status',
      type: 'single_choice',
      prompt: 'Is mediation ordered by the court or voluntary?',
      options: [
        { value: 'ordered', label: 'Court-ordered' },
        { value: 'voluntary', label: 'Voluntary' },
        { value: 'no_mediation', label: 'No mediation planned' },
      ],
    },
    {
      id: 'no_mediation_info',
      type: 'info',
      prompt:
        'Even without formal mediation, you can still negotiate a settlement directly with the defendant or their attorney at any time. Many contract cases settle through informal discussions.',
      showIf: (answers) => answers.mediation_status === 'no_mediation',
    },
    {
      id: 'mediator_selected',
      type: 'yes_no',
      prompt: 'Have you and the other side agreed on a mediator?',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
    },
    {
      id: 'mediator_info',
      type: 'info',
      prompt:
        'Choose a mediator experienced in contract or commercial disputes. Many counties have mediation centers with affordable rates. Both sides must agree on the mediator. The court may also appoint one if you cannot agree.',
      showIf: (answers) => answers.mediator_selected === 'no',
    },
    {
      id: 'settlement_demand_prepared',
      type: 'single_choice',
      prompt: 'Have you prepared your settlement demand for mediation?',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'working_on_it', label: 'Working on it' },
      ],
    },
    {
      id: 'demand_prep_info',
      type: 'info',
      prompt:
        'Your mediation demand should include: the contract amount, payments made, cost to hire a replacement to finish the work, lost profits, incidental damages, and attorney fees if the contract allows them. Organize everything into a clear package with supporting documents.',
      showIf: (answers) => answers.settlement_demand_prepared === 'no' || answers.settlement_demand_prepared === 'working_on_it',
    },
    {
      id: 'minimum_settlement',
      type: 'single_choice',
      prompt: 'Have you determined your minimum acceptable settlement amount?',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
      options: [
        { value: 'yes', label: 'Yes, I have a number in mind' },
        { value: 'no', label: 'No, I need to think about this' },
      ],
    },
    {
      id: 'minimum_info',
      type: 'info',
      prompt:
        'Before mediation, know your bottom line. Consider: your total damages, the strength of your evidence, the cost of going to trial, how long trial would take, and whether the defendant has the ability to pay a judgment.',
      showIf: (answers) => answers.minimum_settlement === 'no',
    },
    {
      id: 'mediation_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of mediation?',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
      options: [
        { value: 'settled', label: 'Settled at mediation' },
        { value: 'impasse', label: 'Reached an impasse (no agreement)' },
        { value: 'not_yet', label: 'Mediation hasn\'t happened yet' },
      ],
    },
    {
      id: 'impasse_info',
      type: 'info',
      prompt:
        'Even after an impasse, settlements sometimes happen in the days following mediation. The mediator may follow up with both sides. If no settlement is reached, prepare for trial.',
      showIf: (answers) => answers.mediation_outcome === 'impasse',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.mediation_status === 'ordered') {
      items.push({ status: 'info', text: 'Court-ordered mediation. Attendance is required.' })
    } else if (answers.mediation_status === 'voluntary') {
      items.push({ status: 'info', text: 'Voluntary mediation planned.' })
    } else {
      items.push({ status: 'info', text: 'No formal mediation. You can still negotiate a settlement at any time.' })
    }

    if (answers.mediator_selected === 'yes') {
      items.push({ status: 'done', text: 'Mediator selected and agreed upon.' })
    } else if (answers.mediation_status !== 'no_mediation') {
      items.push({ status: 'needed', text: 'Select and agree on a mediator with the other side.' })
    }

    if (answers.settlement_demand_prepared === 'yes') {
      items.push({ status: 'done', text: 'Settlement demand prepared for mediation.' })
    } else if (answers.mediation_status !== 'no_mediation') {
      items.push({ status: 'needed', text: 'Prepare your settlement demand: contract amount, payments made, cost to cure, lost profits.' })
    }

    if (answers.minimum_settlement === 'yes') {
      items.push({ status: 'done', text: 'Minimum acceptable settlement amount determined.' })
    } else if (answers.mediation_status !== 'no_mediation') {
      items.push({ status: 'needed', text: 'Determine your minimum acceptable settlement before mediation.' })
    }

    if (answers.mediation_outcome === 'settled') {
      items.push({ status: 'done', text: 'Case settled at mediation.' })
    } else if (answers.mediation_outcome === 'impasse') {
      items.push({ status: 'info', text: 'Mediation reached an impasse. Prepare for trial or continue informal negotiations.' })
    }

    return items
  },
}
