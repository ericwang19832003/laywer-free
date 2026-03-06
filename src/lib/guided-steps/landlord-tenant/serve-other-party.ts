import type { GuidedStepConfig } from '../types'

export const serveOtherPartyConfig: GuidedStepConfig = {
  title: 'Serve the Other Party',
  reassurance:
    'Proper service ensures the court can proceed with your case.',

  questions: [
    {
      id: 'know_other_party_address',
      type: 'yes_no',
      prompt: "Do you know the other party's current address?",
      helpText:
        'You will need a valid address to serve the citation and petition.',
    },
    {
      id: 'is_eviction',
      type: 'yes_no',
      prompt: 'Is this an eviction case?',
      helpText:
        'Eviction cases follow special service rules under Texas law.',
    },
    {
      id: 'eviction_service_info',
      type: 'info',
      prompt:
        'Eviction cases have special service rules. In Texas, you can post the citation on the door if personal service fails.',
      helpText:
        'Under TRCP 510.4, door posting plus certified mail is allowed for eviction cases when other methods fail.',
      showIf: (answers) => answers.is_eviction === 'yes',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'Which service method will you use?',
      helpText:
        'Each method has different costs and reliability. Constable service is generally the most reliable.',
      options: [
        { value: 'constable', label: 'Constable or sheriff ($75\u2013100)' },
        { value: 'process_server', label: 'Private process server ($50\u2013150)' },
        { value: 'certified_mail', label: 'Certified mail, return receipt requested ($7\u201310)' },
        { value: 'not_sure', label: "I'm not sure yet" },
      ],
    },
    {
      id: 'service_completed',
      type: 'yes_no',
      prompt: 'Have you completed service?',
      helpText:
        'Service must be completed before the hearing date.',
    },
    {
      id: 'proof_filed',
      type: 'yes_no',
      prompt: 'Have you filed proof of service with the court?',
      helpText:
        'The court needs proof that the other party was properly served before proceeding.',
      showIf: (answers) => answers.service_completed === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_other_party_address === 'yes') {
      items.push({ status: 'done', text: "You have the other party's address." })
    } else {
      items.push({
        status: 'needed',
        text: "Find the other party's current address before attempting service.",
      })
    }

    if (answers.is_eviction === 'yes') {
      items.push({
        status: 'info',
        text: 'Eviction cases allow door posting under TRCP 510.4 if personal service fails.',
      })
    }

    if (answers.service_method === 'constable') {
      items.push({ status: 'done', text: 'Service method chosen: constable or sheriff.' })
    } else if (answers.service_method === 'process_server') {
      items.push({ status: 'done', text: 'Service method chosen: private process server.' })
    } else if (answers.service_method === 'certified_mail') {
      items.push({ status: 'done', text: 'Service method chosen: certified mail.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method. Constable service is the most reliable option.',
      })
    }

    if (answers.service_completed === 'yes') {
      items.push({ status: 'done', text: 'Service has been completed.' })

      if (answers.proof_filed === 'yes') {
        items.push({ status: 'done', text: 'Proof of service filed with the court.' })
      } else {
        items.push({
          status: 'needed',
          text: 'File your proof of service (return receipt or officer\'s return) with the court.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Complete service on the other party before the hearing date.',
      })
    }

    return items
  },
}
