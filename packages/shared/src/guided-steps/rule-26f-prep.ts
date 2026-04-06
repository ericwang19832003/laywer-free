import type { GuidedStepConfig } from './types'

export const rule26fPrepConfig: GuidedStepConfig = {
  title: 'Prepare for Rule 26(f) Conference',
  reassurance:
    'The discovery conference sets the roadmap for your case.',

  questions: [
    {
      id: 'received_scheduling_order',
      type: 'yes_no',
      prompt: 'Have you received a scheduling order from the court?',
    },
    {
      id: 'conference_date_set',
      type: 'yes_no',
      prompt: 'Have you set your Rule 26(f) conference date?',
    },
    {
      id: 'initial_disclosures_ready',
      type: 'yes_no',
      prompt: 'Have you gathered your initial disclosure documents?',
    },
    {
      id: 'disclosure_info',
      type: 'info',
      prompt:
        'Initial disclosures include: names of people with knowledge, copies of relevant documents, computation of damages, and insurance agreements.',
      showIf: (answers) => answers.initial_disclosures_ready === 'no',
    },
    {
      id: 'know_conference_topics',
      type: 'yes_no',
      prompt: 'Do you know what topics to discuss at the conference?',
    },
    {
      id: 'topics_info',
      type: 'info',
      prompt:
        'Key topics: discovery timeline, ESI protocols, privilege log procedures, deposition limits, and potential settlement discussions.',
      showIf: (answers) => answers.know_conference_topics === 'no',
    },
    {
      id: 'discovery_plan_drafted',
      type: 'yes_no',
      prompt: 'Have you drafted a proposed discovery plan?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_scheduling_order === 'yes') {
      items.push({ status: 'done', text: 'Scheduling order received.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Check with the court clerk for your scheduling order.',
      })
    }

    if (answers.conference_date_set === 'yes') {
      items.push({ status: 'done', text: 'Conference date is set.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Coordinate with opposing counsel to set the conference date.',
      })
    }

    if (answers.initial_disclosures_ready === 'yes') {
      items.push({
        status: 'done',
        text: 'Initial disclosure documents gathered.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Gather initial disclosures: witness names, relevant documents, damages computation, and insurance agreements.',
      })
    }

    if (answers.know_conference_topics === 'yes') {
      items.push({
        status: 'done',
        text: 'Conference topics reviewed.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Review key conference topics: discovery timeline, ESI protocols, privilege logs, deposition limits, and settlement.',
      })
    }

    if (answers.discovery_plan_drafted === 'yes') {
      items.push({
        status: 'done',
        text: 'Discovery plan drafted.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Draft a proposed discovery plan covering scope, timeline, and ESI protocols.',
      })
    }

    return items
  },
}
