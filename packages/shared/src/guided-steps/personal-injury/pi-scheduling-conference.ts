import type { GuidedStepConfig } from '../types'

export const piSchedulingConferenceConfig: GuidedStepConfig = {
  title: 'Scheduling Conference & Court Dates',
  reassurance:
    'Courts set key deadlines through scheduling orders. This step helps you track and prepare for important court dates.',

  questions: [
    {
      id: 'scheduling_order',
      type: 'single_choice',
      prompt: 'Has the court issued a scheduling order?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'scheduling_order_info',
      type: 'info',
      prompt:
        'A scheduling order sets deadlines for discovery, expert designations, and trial. Check with the court clerk or look at your court\'s online docket to see if one has been issued.',
      showIf: (answers) => answers.scheduling_order === 'not_sure',
    },
    {
      id: 'know_discovery_cutoff',
      type: 'yes_no',
      prompt: 'Do you know the discovery cutoff date?',
      showIf: (answers) => answers.scheduling_order === 'yes',
    },
    {
      id: 'know_trial_date',
      type: 'yes_no',
      prompt: 'Has a trial date been set?',
      showIf: (answers) => answers.scheduling_order === 'yes',
    },
    {
      id: 'pretrial_conference',
      type: 'single_choice',
      prompt: 'Has a pretrial conference been scheduled?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'pretrial_conference_info',
      type: 'info',
      prompt:
        'A pretrial conference is a meeting with the judge to discuss the status of the case, resolve disputes, and prepare for trial. Be prepared to discuss: the status of discovery, any pending motions, settlement prospects, and estimated trial length.',
      showIf: (answers) => answers.pretrial_conference === 'yes' || answers.pretrial_conference === 'not_sure',
    },
    {
      id: 'expert_designations',
      type: 'single_choice',
      prompt: 'Have you exchanged expert witness designations?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_applicable', label: 'Not applicable' },
      ],
    },
    {
      id: 'expert_info',
      type: 'info',
      prompt:
        'In a personal injury case, you\'ll typically need a medical expert to testify about your injuries, treatment, and prognosis. Expert designations must be served by the deadline in the scheduling order, or the expert may be excluded from trial.',
      showIf: (answers) => answers.expert_designations === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.scheduling_order === 'yes') {
      items.push({ status: 'done', text: 'Scheduling order issued by the court.' })

      if (answers.know_discovery_cutoff === 'yes') {
        items.push({ status: 'done', text: 'Discovery cutoff date is known.' })
      } else {
        items.push({ status: 'needed', text: 'Identify the discovery cutoff date from the scheduling order.' })
      }

      if (answers.know_trial_date === 'yes') {
        items.push({ status: 'done', text: 'Trial date has been set.' })
      } else {
        items.push({ status: 'info', text: 'Trial date not yet set. The court will schedule this later.' })
      }
    } else {
      items.push({ status: 'info', text: 'Scheduling order not yet issued. The court will typically issue one after the answer is filed.' })
    }

    if (answers.expert_designations === 'yes') {
      items.push({ status: 'done', text: 'Expert witness designations exchanged.' })
    } else if (answers.expert_designations === 'no') {
      items.push({ status: 'needed', text: 'Arrange for a medical expert and prepare expert designation before the deadline.' })
    }

    return items
  },
}
