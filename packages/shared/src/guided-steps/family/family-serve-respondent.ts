import type { GuidedStepConfig } from '../types'

export function createServeRespondentConfig(subType: 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'modification'): GuidedStepConfig {
  return {
    title: 'Serve the Respondent',
    reassurance: 'The other party must receive formal notice before the case can proceed.',
    questions: [
      {
        id: 'service_method',
        type: 'single_choice',
        prompt: 'How will the other party be served?',
        options: [
          { value: 'process_server', label: 'Process server or constable' },
          { value: 'certified_mail', label: 'Certified mail, return receipt requested' },
          { value: 'waiver', label: 'Waiver of service (they agree to sign)' },
          { value: 'not_sure', label: 'Not sure yet' },
        ],
      },
      {
        id: 'waiver_info',
        type: 'info',
        prompt: 'A waiver of service is the fastest and cheapest option. The other party signs a document acknowledging they received the papers.',
        showIf: (a) => a.service_method === 'waiver',
      },
      {
        id: 'address_known',
        type: 'yes_no',
        prompt: 'Do you know the other party\'s current address?',
      },
      {
        id: 'address_info',
        type: 'info',
        prompt: 'If you cannot locate the other party, you may be able to serve by publication. This requires court approval.',
        showIf: (a) => a.address_known === 'no',
      },
      {
        id: 'service_timeline',
        type: 'info',
        prompt: subType === 'divorce'
          ? 'After service, the respondent has 20 days (plus Monday) to file an answer. The 60-day waiting period runs from the filing date, not the service date.'
          : 'After service, the respondent typically has 20 days (plus Monday) to file an answer.',
      },
    ],
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.service_method && answers.service_method !== 'not_sure') {
        items.push({ status: 'done', text: `Service method: ${answers.service_method.replace(/_/g, ' ')}` })
      } else {
        items.push({ status: 'needed', text: 'Choose a service method.' })
      }

      if (answers.address_known === 'yes') {
        items.push({ status: 'done', text: 'Other party\'s address is known.' })
      } else if (answers.address_known === 'no') {
        items.push({ status: 'needed', text: 'Locate the other party\'s address, or seek court approval for service by publication.' })
      }

      items.push({ status: 'info', text: 'After service, the respondent has approximately 20 days to respond.' })
      return items
    },
  }
}
