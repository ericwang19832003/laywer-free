import type { GuidedStepConfig } from './types'

export const discoveryStarterPackConfig: GuidedStepConfig = {
  title: 'Discovery Starter Pack',
  reassurance:
    'Discovery helps you gather evidence to build your case.',

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
        'Discovery is the formal process where both sides exchange information. You can request documents, ask written questions (interrogatories), and take depositions.',
      showIf: (answers) => answers.first_time_discovery === 'yes',
    },
    {
      id: 'know_discovery_tools',
      type: 'single_choice',
      prompt: 'Which discovery tools are you familiar with?',
      options: [
        { value: 'all_familiar', label: 'All of them' },
        { value: 'some', label: 'Some of them' },
        { value: 'none', label: 'None of them' },
      ],
    },
    {
      id: 'tools_info',
      type: 'info',
      prompt:
        'Key tools: Requests for Production (documents), Interrogatories (written questions), Requests for Admission (facts to confirm), and Depositions (sworn testimony).',
      showIf: (answers) => answers.know_discovery_tools !== 'all_familiar',
    },
    {
      id: 'served_initial_requests',
      type: 'yes_no',
      prompt:
        'Have you served your initial discovery requests on the opposing party?',
    },
    {
      id: 'know_deadlines',
      type: 'yes_no',
      prompt: 'Do you know your discovery deadlines?',
    },
    {
      id: 'deadline_info',
      type: 'info',
      prompt:
        "Discovery deadlines are set by the court's scheduling order. Missing them can mean losing the right to present evidence.",
      showIf: (answers) => answers.know_deadlines === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.first_time_discovery === 'yes') {
      items.push({
        status: 'info',
        text: 'Discovery is the formal exchange of information between parties. Familiarize yourself with the process.',
      })
    }

    if (answers.know_discovery_tools === 'all_familiar') {
      items.push({
        status: 'done',
        text: 'You are familiar with all discovery tools.',
      })
    } else if (answers.know_discovery_tools === 'some') {
      items.push({
        status: 'needed',
        text: 'Review the discovery tools you are less familiar with: Requests for Production, Interrogatories, Requests for Admission, and Depositions.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Learn about the key discovery tools: Requests for Production, Interrogatories, Requests for Admission, and Depositions.',
      })
    }

    if (answers.served_initial_requests === 'yes') {
      items.push({
        status: 'done',
        text: 'Initial discovery requests served on the opposing party.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Serve your initial discovery requests on the opposing party.',
      })
    }

    if (answers.know_deadlines === 'yes') {
      items.push({
        status: 'done',
        text: 'You know your discovery deadlines.',
      })
    } else {
      items.push({
        status: 'needed',
        text: "Check the court's scheduling order for your discovery deadlines. Missing them can mean losing the right to present evidence.",
      })
    }

    return items
  },
}
