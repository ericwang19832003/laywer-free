import type { GuidedStepConfig } from '../types'

export const piDiscoveryPrepConfig: GuidedStepConfig = {
  title: 'Prepare Your Discovery Requests',
  reassurance:
    'Discovery is how both sides gather evidence before trial. We\'ll help you understand the tools available and plan what to request.',

  questions: [
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'Discovery is the formal process for gathering evidence. In Texas, you can use: interrogatories (written questions), requests for production (documents), requests for admission (confirm/deny facts), and depositions (sworn testimony).',
    },
    {
      id: 'sent_interrogatories',
      type: 'single_choice',
      prompt: 'Have you sent interrogatories (written questions) to the defendant?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'interrogatories_info',
      type: 'info',
      prompt:
        'Interrogatories are written questions the defendant must answer under oath. In a PI case, you\'d typically ask about: the defendant\'s version of events, their insurance coverage, witnesses they know of, and any prior incidents. Texas limits you to 25 interrogatories (including subparts).',
      showIf: (answers) => answers.sent_interrogatories === 'not_familiar',
    },
    {
      id: 'sent_rfps',
      type: 'single_choice',
      prompt: 'Have you sent requests for production (document requests)?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_familiar', label: 'I\'m not familiar with these' },
      ],
    },
    {
      id: 'rfps_info',
      type: 'info',
      prompt:
        'Requests for production ask the other side to provide documents. In a PI case, you\'d request: the defendant\'s insurance policy, incident reports, photos, surveillance footage, maintenance records, cell phone records from the time of the incident, and any internal communications about the incident.',
      showIf: (answers) => answers.sent_rfps === 'not_familiar',
    },
    {
      id: 'planning_depositions',
      type: 'single_choice',
      prompt: 'Are you planning to take any depositions?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'depositions_info',
      type: 'info',
      prompt:
        'Depositions are live, sworn testimony recorded by a court reporter. In PI cases, you might depose: the defendant, the defendant\'s insurance adjuster, eyewitnesses, and the defendant\'s medical expert (if they have one). Depositions can be expensive due to court reporter fees.',
      showIf: (answers) => answers.planning_depositions !== 'yes',
    },
    {
      id: 'subpoena_medical',
      type: 'single_choice',
      prompt: 'Have you subpoenaed medical records from the defendant\'s insurance company?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
        { value: 'not_applicable', label: 'Not applicable to my case' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.sent_interrogatories === 'yes') {
      items.push({ status: 'done', text: 'Interrogatories sent to defendant.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending interrogatories to the defendant (limit: 25 in Texas).' })
    }

    if (answers.sent_rfps === 'yes') {
      items.push({ status: 'done', text: 'Requests for production sent.' })
    } else {
      items.push({ status: 'needed', text: 'Consider sending requests for production (insurance policy, incident reports, photos, etc.).' })
    }

    if (answers.planning_depositions === 'yes') {
      items.push({ status: 'done', text: 'Depositions are being planned.' })
    } else if (answers.planning_depositions === 'not_sure') {
      items.push({ status: 'info', text: 'Consider whether depositions would strengthen your case. They\'re especially useful for locking in witness testimony.' })
    }

    if (answers.subpoena_medical === 'yes') {
      items.push({ status: 'done', text: 'Medical records subpoenaed from defendant\'s insurance.' })
    } else if (answers.subpoena_medical === 'no') {
      items.push({ status: 'needed', text: 'Consider subpoenaing medical records from the defendant\'s insurance company.' })
    }

    return items
  },
}
