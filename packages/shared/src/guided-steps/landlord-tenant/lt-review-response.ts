import type { GuidedStepConfig } from '../types'

export const ltReviewResponseConfig: GuidedStepConfig = {
  title: 'Review the Response',
  reassurance:
    'Understanding the other party\'s response helps you prepare for what\'s ahead. Their defenses and counterclaims shape your hearing strategy.',

  questions: [
    {
      id: 'response_received',
      type: 'yes_no',
      prompt: 'Do you have a copy of the other party\'s response?',
      helpText:
        'This may be an answer, general denial, or counterclaim. You can get it from the court docket or the clerk\'s office.',
    },
    {
      id: 'response_needed_info',
      type: 'info',
      prompt:
        'Obtain a copy of the response before proceeding. Check the court\'s online docket using your cause number, or visit the clerk\'s office.',
      showIf: (answers) => answers.response_received === 'no',
    },
    {
      id: 'counterclaim_filed',
      type: 'single_choice',
      prompt: 'Did the other party file a counterclaim?',
      helpText:
        'A counterclaim means they are also making claims against you (e.g., a tenant claiming the landlord owes the security deposit, or a landlord claiming unpaid rent).',
      showIf: (answers) => answers.response_received === 'yes',
      options: [
        { value: 'yes', label: 'Yes, they filed a counterclaim' },
        { value: 'no', label: 'No counterclaim' },
        { value: 'not_sure', label: 'I\'m not sure' },
      ],
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'A counterclaim means you will need to defend against their claims at the hearing in addition to presenting your own case. Gather evidence to respond to each of their specific allegations.',
      showIf: (answers) => answers.counterclaim_filed === 'yes',
    },
    {
      id: 'defenses_identified',
      type: 'yes_no',
      prompt: 'Have you identified the specific defenses they raised?',
      helpText:
        'Common landlord-tenant defenses include: habitability issues, improper notice, retaliation, payment disputes, and lease violations by the other party.',
      showIf: (answers) => answers.response_received === 'yes',
    },
    {
      id: 'defenses_info',
      type: 'info',
      prompt:
        'Review each paragraph of their answer. Note which claims they admit, which they deny, and which defenses they raise. Prepare evidence to counter each defense at the hearing.',
      showIf: (answers) => answers.defenses_identified === 'no',
    },
    {
      id: 'new_claims_info',
      type: 'info',
      prompt:
        'Based on their response, update your hearing preparation. Focus your evidence on countering their specific defenses and any counterclaims.',
      showIf: (answers) => answers.response_received === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.response_received === 'yes') {
      items.push({ status: 'done', text: 'Response obtained and reviewed.' })
    } else {
      items.push({ status: 'needed', text: 'Obtain the other party\'s response from the court.' })
    }

    if (answers.counterclaim_filed === 'yes') {
      items.push({ status: 'needed', text: 'Counterclaim filed. Prepare evidence to defend against their claims.' })
    } else if (answers.counterclaim_filed === 'no') {
      items.push({ status: 'done', text: 'No counterclaim filed.' })
    } else if (answers.counterclaim_filed === 'not_sure') {
      items.push({ status: 'needed', text: 'Review the response carefully to determine if a counterclaim was included.' })
    }

    if (answers.defenses_identified === 'yes') {
      items.push({ status: 'done', text: 'Defenses identified. Ready to prepare counter-evidence.' })
    } else if (answers.response_received === 'yes') {
      items.push({ status: 'needed', text: 'Identify the specific defenses raised so you can prepare for the hearing.' })
    }

    items.push({
      status: 'info',
      text: 'Update your hearing preparation based on the defenses and counterclaims raised.',
    })

    return items
  },
}
