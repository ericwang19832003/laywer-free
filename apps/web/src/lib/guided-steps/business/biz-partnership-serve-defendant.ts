import type { GuidedStepConfig } from '../types'

export const bizPartnershipServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Other Party',
  reassurance:
    'Proper service ensures the other party is legally notified of the lawsuit.',

  questions: [
    {
      id: 'know_registered_agent',
      type: 'yes_no',
      prompt:
        'Do you know the registered agent for the business entity?',
    },
    {
      id: 'agent_lookup_info',
      type: 'info',
      prompt:
        'Look up the registered agent on the Texas Secretary of State website (sos.state.tx.us).',
      showIf: (answers) => answers.know_registered_agent === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the defendant?',
      options: [
        { value: 'process_server', label: 'Licensed process server' },
        { value: 'constable', label: 'County constable' },
        {
          value: 'certified_mail',
          label: 'Certified mail (if allowed)',
        },
      ],
    },
    {
      id: 'multiple_defendants',
      type: 'yes_no',
      prompt: 'Are you serving more than one defendant?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_registered_agent === 'yes') {
      items.push({
        status: 'done',
        text: 'Registered agent identified.',
      })
    } else if (answers.know_registered_agent === 'no') {
      items.push({
        status: 'needed',
        text: 'Look up the registered agent on the Texas Secretary of State website.',
      })
    }

    if (answers.service_method) {
      const labels: Record<string, string> = {
        process_server: 'Licensed process server',
        constable: 'County constable',
        certified_mail: 'Certified mail',
      }
      items.push({
        status: 'done',
        text: `Service method: ${labels[answers.service_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a method for serving the defendant.',
      })
    }

    if (answers.multiple_defendants === 'yes') {
      items.push({
        status: 'info',
        text: 'Multiple defendants must each be served separately. Track service for each.',
      })
    } else if (answers.multiple_defendants === 'no') {
      items.push({
        status: 'done',
        text: 'Single defendant to serve.',
      })
    }

    return items
  },
}
