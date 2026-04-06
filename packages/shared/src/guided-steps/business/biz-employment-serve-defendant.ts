import type { GuidedStepConfig } from '../types'

export const bizEmploymentServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Employer',
  reassurance:
    'Your employer must be formally served with the lawsuit. Proper service ensures the case can proceed.',

  questions: [
    {
      id: 'know_registered_agent',
      type: 'yes_no',
      prompt:
        'Do you know the employer\'s registered agent for service of process?',
    },
    {
      id: 'agent_lookup',
      type: 'info',
      prompt:
        'You can look up a company\'s registered agent on the Texas Secretary of State website (sos.state.tx.us). Search by company name to find the agent and their address.',
      showIf: (answers) => answers.know_registered_agent === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the employer?',
      options: [
        { value: 'process_server', label: 'Private process server' },
        { value: 'constable', label: 'County constable or sheriff' },
        { value: 'certified_mail', label: 'Certified mail (if permitted)' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_registered_agent === 'yes') {
      items.push({
        status: 'done',
        text: 'Employer\'s registered agent identified.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Look up the employer\'s registered agent on the Texas Secretary of State website.',
      })
    }

    if (answers.service_method) {
      const labels: Record<string, string> = {
        process_server: 'Private process server',
        constable: 'County constable or sheriff',
        certified_mail: 'Certified mail',
      }
      items.push({
        status: 'done',
        text: `Service method: ${labels[answers.service_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a service method.',
      })
    }

    items.push({
      status: 'info',
      text: 'The employer has 20 days (state court) or 21 days (federal court) to file an answer after being served. Keep the proof of service for your records.',
    })

    return items
  },
}
