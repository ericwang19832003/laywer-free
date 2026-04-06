import type { GuidedStepConfig } from './types'

export const schedulingConferencePrepConfig: GuidedStepConfig = {
  title: 'Prepare for Scheduling Conference',
  reassurance:
    'The scheduling conference sets important deadlines for your case.',

  questions: [
    {
      id: 'received_order',
      type: 'yes_no',
      prompt: 'Have you received the court\'s scheduling order or notice of conference?',
    },
    {
      id: 'deadline_knowledge',
      type: 'yes_no',
      prompt: 'Do you know the proposed deadlines to suggest?',
    },
    {
      id: 'discovery_scope',
      type: 'yes_no',
      prompt: 'Have you determined what discovery will be needed?',
    },
    {
      id: 'discovery_info',
      type: 'info',
      prompt: 'Consider: document requests, interrogatories, depositions, expert witnesses, and any ESI (electronic data) needs.',
      showIf: (answers) => answers.discovery_scope === 'no',
    },
    {
      id: 'expert_witnesses',
      type: 'yes_no',
      prompt: 'Will you need expert witnesses?',
    },
    {
      id: 'expert_info',
      type: 'info',
      prompt: 'Expert disclosures typically require: expert name, qualifications, opinions, and summary of bases. Plan extra time for expert-related discovery.',
      showIf: (answers) => answers.expert_witnesses === 'yes',
    },
    {
      id: 'trial_ready',
      type: 'yes_no',
      prompt: 'Are you prepared to suggest a trial date?',
    },
    {
      id: 'trial_info',
      type: 'info',
      prompt: 'Consider your evidence gathering timeline, expert schedules, and any conflicts when proposing a trial date.',
      showIf: (answers) => answers.trial_ready === 'no',
    },
    {
      id: 'settlement_interest',
      type: 'yes_no',
      prompt: 'Are you interested in settlement discussions?',
    },
    {
      id: 'mediation_info',
      type: 'info',
      prompt: 'You may propose mediation or early settlement conference as part of the scheduling order.',
      showIf: (answers) => answers.settlement_interest === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_order === 'yes') {
      items.push({ status: 'done', text: 'Scheduling order received.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Contact the court clerk for your scheduling order or conference notice.',
      })
    }

    if (answers.deadline_knowledge === 'yes') {
      items.push({ status: 'done', text: 'Proposed deadlines prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Research typical deadlines for your case type and prepare proposed dates.',
      })
    }

    if (answers.discovery_scope === 'yes') {
      items.push({ status: 'done', text: 'Discovery scope determined.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify document requests, interrogatories, and depositions needed.',
      })
    }

    if (answers.expert_witnesses === 'yes') {
      items.push({
        status: 'done',
        text: 'Expert witnesses identified.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'No expert witnesses planned. If circumstances change, you can modify the schedule later.',
      })
    }

    if (answers.trial_ready === 'yes') {
      items.push({ status: 'done', text: 'Proposed trial date prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Consider your evidence gathering timeline and propose a realistic trial date.',
      })
    }

    if (answers.settlement_interest === 'yes') {
      items.push({
        status: 'info',
        text: 'Be prepared to discuss mediation or settlement options at the conference.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Focus on litigation timeline if settlement is not a priority.',
      })
    }

    return items
  },
}
