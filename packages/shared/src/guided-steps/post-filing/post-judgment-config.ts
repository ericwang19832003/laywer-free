import type { GuidedStepConfig } from '../types'

export const postJudgmentConfig: GuidedStepConfig = {
  title: 'After the Judgment',
  reassurance: "Here's what to do now that you have a judgment.",

  questions: [
    {
      id: 'judgment_favorable',
      type: 'yes_no',
      prompt: 'Was the judgment in your favor?',
    },
    {
      id: 'won_info',
      type: 'info',
      prompt:
        'If you won: The losing party typically has 30 days to appeal. If they don\'t pay voluntarily, you may need to pursue collection through garnishment, liens, or asset discovery.',
      showIf: (answers) => answers.judgment_favorable === 'yes',
    },
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'If you lost: You typically have 30 days to file an appeal. Consider consulting an attorney about your options. You may also be able to file a motion for new trial.',
      showIf: (answers) => answers.judgment_favorable === 'no',
    },
    {
      id: 'has_payment_plan',
      type: 'yes_no',
      prompt: 'If money was awarded, has a payment plan been established?',
    },
    {
      id: 'collection_info',
      type: 'info',
      prompt:
        'If the other party is not paying, you can: (1) File an Abstract of Judgment to create a lien, (2) Request a Writ of Execution for wage garnishment, (3) File for a debtor\'s examination to discover assets.',
      showIf: (answers) => answers.has_payment_plan === 'no',
    },
    {
      id: 'case_documents_saved',
      type: 'yes_no',
      prompt: 'Have you saved all court documents and the judgment for your records?',
      helpText:
        'Keep copies of everything. You may need these documents for years, especially for enforcement.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.judgment_favorable === 'yes') {
      items.push({
        status: 'info',
        text: 'Judgment was in your favor. The other party has 30 days to appeal.',
      })
    } else if (answers.judgment_favorable === 'no') {
      items.push({
        status: 'info',
        text: 'You typically have 30 days to file an appeal or a motion for new trial.',
      })
    }

    if (answers.has_payment_plan === 'yes') {
      items.push({ status: 'done', text: 'Payment plan has been established.' })
    } else if (answers.has_payment_plan === 'no') {
      items.push({
        status: 'needed',
        text: 'No payment plan in place. Consider filing for enforcement: lien, garnishment, or debtor\'s exam.',
      })
    }

    if (answers.case_documents_saved === 'yes') {
      items.push({
        status: 'done',
        text: 'All court documents and judgment saved for your records.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Save all court documents and the judgment — you may need them for years.',
      })
    }

    return items
  },
}
