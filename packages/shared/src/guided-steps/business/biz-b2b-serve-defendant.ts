import type { GuidedStepConfig } from '../types'

export const bizB2bServeDefendantConfig: GuidedStepConfig = {
  title: 'Serve the Other Business',
  reassurance:
    'Proper service ensures the other business is officially notified of the lawsuit.',

  questions: [
    {
      id: 'know_registered_agent',
      type: 'yes_no',
      prompt: 'Do you know the other business\'s registered agent for service of process?',
    },
    {
      id: 'agent_lookup',
      type: 'info',
      prompt:
        'You can look up a business\'s registered agent on the Secretary of State website for the state where the business is registered.',
      showIf: (answers) => answers.know_registered_agent === 'no',
    },
    {
      id: 'is_out_of_state',
      type: 'yes_no',
      prompt: 'Is the other business located out of state?',
    },
    {
      id: 'long_arm_info',
      type: 'info',
      prompt:
        'For out-of-state businesses, you may be able to use the Texas long-arm statute to serve them if they have sufficient contacts with Texas (e.g., doing business here, committing a tort here).',
      showIf: (answers) => answers.is_out_of_state === 'yes',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: 'How will you serve the other business?',
      options: [
        { value: 'process_server', label: 'Process server' },
        { value: 'constable', label: 'Constable' },
        { value: 'certified_mail', label: 'Certified mail' },
      ],
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_registered_agent === 'yes') {
      items.push({ status: 'done', text: 'Registered agent identified.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Look up the registered agent on the Secretary of State website.',
      })
    }

    if (answers.is_out_of_state === 'yes') {
      items.push({
        status: 'info',
        text: 'Out-of-state business — may need to use long-arm statute for service.',
      })
    }

    if (answers.service_method) {
      const methods: Record<string, string> = {
        process_server: 'process server',
        constable: 'constable',
        certified_mail: 'certified mail',
      }
      items.push({ status: 'done', text: `Will serve via ${methods[answers.service_method] ?? answers.service_method}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a service method.' })
    }

    return items
  },
}
