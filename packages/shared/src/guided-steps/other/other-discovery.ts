import type { GuidedStepConfig } from '../types'

export const otherDiscoveryConfig: GuidedStepConfig = {
  title: 'Discovery',
  reassurance:
    'Discovery is the formal process for gathering evidence. Both sides exchange documents and information to prepare for trial or settlement.',

  questions: [
    {
      id: 'first_time_discovery',
      type: 'yes_no',
      prompt: 'Is this your first time going through the discovery process?',
    },
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'Discovery lets you request documents, ask written questions (interrogatories), request admissions of fact, and take depositions. The other side can do the same to you. There are deadlines for each step.',
      showIf: (answers) => answers.first_time_discovery === 'yes',
    },
    {
      id: 'documents_to_request',
      type: 'yes_no',
      prompt: 'Do you know what documents you need from the other side?',
    },
    {
      id: 'documents_tip',
      type: 'info',
      prompt:
        'Think about what documents would help prove your case: contracts, emails, text messages, financial records, photos, internal policies, or incident reports. Be specific in your requests.',
      showIf: (answers) => answers.documents_to_request === 'no',
    },
    {
      id: 'questions_to_ask',
      type: 'yes_no',
      prompt: 'Do you have written questions (interrogatories) you want the other side to answer under oath?',
    },
    {
      id: 'interrogatory_tip',
      type: 'info',
      prompt:
        'Interrogatories are written questions the other side must answer under oath. Use them to establish basic facts, identify witnesses, and understand the other side\'s position. Most courts limit the number you can ask (often 25).',
      showIf: (answers) => answers.questions_to_ask === 'no',
    },
    {
      id: 'know_discovery_deadlines',
      type: 'yes_no',
      prompt: 'Do you know the discovery deadlines for your case?',
    },
    {
      id: 'deadline_warning',
      type: 'info',
      prompt:
        'Discovery deadlines are strict. Check the court\'s scheduling order for your discovery cutoff date. Missing it can mean losing the right to present evidence at trial.',
      showIf: (answers) => answers.know_discovery_deadlines === 'no',
    },
    {
      id: 'received_requests',
      type: 'yes_no',
      prompt: 'Have you received any discovery requests from the other side?',
    },
    {
      id: 'response_tip',
      type: 'info',
      prompt:
        'You must respond to discovery requests within the deadline (usually 30 days). Gather the requested documents and answer truthfully. If a request is overly broad or irrelevant, you can object, but you should still provide what you can.',
      showIf: (answers) => answers.received_requests === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.first_time_discovery === 'yes') {
      items.push({
        status: 'info',
        text: 'First-time discovery: review the types of discovery tools available (document requests, interrogatories, admissions, depositions).',
      })
    }

    if (answers.documents_to_request === 'yes') {
      items.push({ status: 'done', text: 'Document requests identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify what documents you need from the other side (contracts, emails, records, etc.).',
      })
    }

    if (answers.questions_to_ask === 'yes') {
      items.push({ status: 'done', text: 'Interrogatories prepared or planned.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Draft interrogatories to establish facts and identify witnesses.',
      })
    }

    if (answers.know_discovery_deadlines === 'yes') {
      items.push({ status: 'done', text: 'Discovery deadlines identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Check the court\'s scheduling order for your discovery cutoff date.',
      })
    }

    if (answers.received_requests === 'yes') {
      items.push({
        status: 'needed',
        text: 'Respond to the other side\'s discovery requests within the deadline (usually 30 days).',
      })
    }

    return items
  },
}
