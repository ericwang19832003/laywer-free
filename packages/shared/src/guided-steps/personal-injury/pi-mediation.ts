import type { GuidedStepConfig } from '../types'

export const piMediationConfig: GuidedStepConfig = {
  title: 'Mediation & Settlement Conference',
  reassurance:
    'Most PI cases settle before trial. Mediation is a structured negotiation with a neutral mediator to help both sides reach an agreement.',

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
        'Even without formal mediation, you can still negotiate a settlement directly with the defendant\'s attorney or insurance company at any time. Many cases settle through informal negotiations.',
      showIf: (answers) => answers.mediation_status === 'no_mediation',
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
        'Your settlement demand should include: total medical expenses (past and future), lost wages and earning capacity, pain and suffering, property damage, and any other damages. Organize these into a clear demand package with supporting documentation.',
      showIf: (answers) => answers.settlement_demand_prepared === 'no' || answers.settlement_demand_prepared === 'working_on_it',
    },
    {
      id: 'minimum_settlement',
      type: 'single_choice',
      prompt: 'Have you thought about your minimum acceptable settlement amount?',
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
        'Before mediation, know your bottom line. Consider: your total out-of-pocket expenses, future medical costs, the strength of your evidence, the risk of losing at trial, and how long trial would take. The mediator is neutral and will try to find middle ground.',
      showIf: (answers) => answers.minimum_settlement === 'no',
    },
    {
      id: 'mediation_tips',
      type: 'info',
      prompt:
        'Mediation tips: Be prepared to compromise — your first offer won\'t be accepted. The mediator will go back and forth between rooms. Stay patient, stay calm, and don\'t take it personally. Most mediations last a full day. Bring all relevant documents.',
      showIf: (answers) => answers.mediation_status !== 'no_mediation',
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

    if (answers.settlement_demand_prepared === 'yes') {
      items.push({ status: 'done', text: 'Settlement demand prepared for mediation.' })
    } else if (answers.mediation_status !== 'no_mediation') {
      items.push({ status: 'needed', text: 'Prepare your settlement demand: medical expenses, lost wages, pain and suffering.' })
    }

    if (answers.minimum_settlement === 'yes') {
      items.push({ status: 'done', text: 'Minimum acceptable settlement amount determined.' })
    } else if (answers.mediation_status !== 'no_mediation') {
      items.push({ status: 'needed', text: 'Determine your minimum acceptable settlement before mediation.' })
    }

    return items
  },
}
