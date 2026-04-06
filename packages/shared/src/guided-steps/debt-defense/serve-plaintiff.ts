import type { GuidedStepConfig } from '../types'

export const servePlaintiffConfig: GuidedStepConfig = {
  title: 'Serve Your Answer on the Plaintiff',
  reassurance:
    'Serving your answer is a critical step — it puts the plaintiff on notice.',

  questions: [
    {
      id: 'certificate_prepared',
      type: 'yes_no',
      prompt: 'Have you prepared your certificate of service?',
    },
    {
      id: 'cert_info',
      type: 'info',
      prompt:
        'A certificate of service is a document stating when, how, and to whom you sent your answer. It\'s usually attached to the last page of your answer.',
      showIf: (answers) => answers.certificate_prepared === 'no',
    },
    {
      id: 'service_method',
      type: 'single_choice',
      prompt: "How will you serve the plaintiff's attorney?",
      options: [
        { value: 'certified_mail', label: 'Certified mail' },
        { value: 'e_service', label: 'E-service (electronic filing)' },
        { value: 'hand_delivery', label: 'Hand delivery' },
        { value: 'not_sure', label: "I'm not sure yet" },
      ],
    },
    {
      id: 'eservice_info',
      type: 'info',
      prompt:
        "E-service through the court's e-filing system is the fastest and creates an automatic record.",
      showIf: (answers) => answers.service_method === 'e_service',
    },
    {
      id: 'service_completed',
      type: 'yes_no',
      prompt: 'Have you served your answer?',
    },
    {
      id: 'after_service_info',
      type: 'info',
      prompt:
        'After service, the plaintiff has the burden to prove their case. Keep your certificate of service and any delivery receipts.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.certificate_prepared === 'yes') {
      items.push({ status: 'done', text: 'Certificate of service prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare your certificate of service before serving.',
      })
    }

    if (answers.service_method && answers.service_method !== 'not_sure') {
      const labels: Record<string, string> = {
        certified_mail: 'certified mail',
        e_service: 'e-service',
        hand_delivery: 'hand delivery',
      }
      items.push({
        status: 'done',
        text: `Service method selected: ${labels[answers.service_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Decide how you will serve the plaintiff\'s attorney (certified mail, e-service, or hand delivery).',
      })
    }

    if (answers.service_completed === 'yes') {
      items.push({ status: 'done', text: 'Answer served on the plaintiff.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Serve your answer on the plaintiff\'s attorney.',
      })
    }

    items.push({
      status: 'info',
      text: 'Keep your certificate of service and delivery receipts as proof.',
    })

    return items
  },
}
