import type { GuidedStepConfig } from '../types'

export const reReviewAnswerConfig: GuidedStepConfig = {
  title: 'Review the Defendant\'s Answer',
  reassurance:
    'Understanding the defendant\'s response reveals their legal position and helps you prepare your strategy.',

  questions: [
    {
      id: 'read_answer',
      type: 'yes_no',
      prompt: 'Have you read the defendant\'s answer thoroughly?',
    },
    {
      id: 'has_counterclaims',
      type: 'yes_no',
      prompt: 'Did the defendant file any counterclaims?',
    },
    {
      id: 'counterclaim_info',
      type: 'info',
      prompt:
        'A counterclaim means the defendant is suing you back. You must respond within 20 days. Common real estate counterclaims include disputes over ownership, boundary lines, or claims that you breached the contract. Review the counterclaim carefully and gather evidence to refute their claims.',
      showIf: (answers) => answers.has_counterclaims === 'yes',
    },
    {
      id: 'disputed_facts',
      type: 'single_choice',
      prompt: 'How much does the defendant dispute?',
      options: [
        { value: 'everything', label: 'Everything' },
        { value: 'some', label: 'Some facts' },
        { value: 'mostly_admitted', label: 'Mostly admitted' },
        { value: 'not_sure', label: 'Not sure' },
      ],
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'Each numbered paragraph in the answer corresponds to a paragraph in your petition. "Denied" means they dispute that fact. "Admitted" means they agree. A "general denial" means they deny everything. Look for these keywords to understand what is actually in dispute.',
      showIf: (answers) => answers.disputed_facts === 'not_sure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.read_answer === 'yes') {
      items.push({ status: 'done', text: 'Defendant\'s answer has been read.' })
    } else {
      items.push({ status: 'needed', text: 'Read the defendant\'s answer thoroughly before proceeding.' })
    }

    if (answers.has_counterclaims === 'yes') {
      items.push({ status: 'needed', text: 'Respond to the counterclaim within 20 days.' })
    } else if (answers.has_counterclaims === 'no') {
      items.push({ status: 'done', text: 'No counterclaims filed by the defendant.' })
    }

    if (answers.disputed_facts === 'everything') {
      items.push({ status: 'info', text: 'Defendant disputes everything. You must prove all elements of your real estate claim.' })
    } else if (answers.disputed_facts === 'some') {
      items.push({ status: 'info', text: 'Defendant disputes some facts. Focus discovery on the contested issues.' })
    } else if (answers.disputed_facts === 'mostly_admitted') {
      items.push({ status: 'info', text: 'Most facts admitted. The dispute is narrow — focus on the remaining contested issues.' })
    } else if (answers.disputed_facts === 'not_sure') {
      items.push({ status: 'needed', text: 'Review the answer again to identify which facts are disputed vs. admitted.' })
    }

    items.push({ status: 'done', text: 'Answer reviewed. Proceed to discovery.' })

    return items
  },
}
