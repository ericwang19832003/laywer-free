import type { GuidedStepConfig } from '../types'

export const bizEmploymentDiscoveryConfig: GuidedStepConfig = {
  title: 'Prepare Your Discovery',
  reassurance:
    'Discovery lets you request documents and information from your employer. Employment cases often turn on internal records the employer holds.',

  questions: [
    {
      id: 'need_personnel_file',
      type: 'yes_no',
      prompt: 'Do you need to request your complete personnel file?',
    },
    {
      id: 'need_policies',
      type: 'yes_no',
      prompt:
        'Do you need to request company policies relevant to your claim?',
    },
    {
      id: 'need_communications',
      type: 'yes_no',
      prompt:
        'Do you need internal communications about your termination or discipline?',
    },
    {
      id: 'need_depositions',
      type: 'yes_no',
      prompt:
        'Do you need to depose your supervisor, HR representative, or other witnesses?',
    },
    {
      id: 'need_comparator_evidence',
      type: 'yes_no',
      prompt:
        'Do you need evidence about how similarly situated employees were treated?',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const requests: string[] = []

    if (answers.need_personnel_file === 'yes') {
      requests.push('complete personnel file')
    }

    if (answers.need_policies === 'yes') {
      requests.push('company policies')
    }

    if (answers.need_communications === 'yes') {
      requests.push('internal communications about termination/discipline')
    }

    if (answers.need_comparator_evidence === 'yes') {
      requests.push('comparator employee treatment records')
    }

    if (requests.length > 0) {
      items.push({
        status: 'needed',
        text: `Prepare document requests for: ${requests.join(', ')}.`,
      })
    } else if (
      answers.need_personnel_file === 'no' &&
      answers.need_policies === 'no' &&
      answers.need_communications === 'no' &&
      answers.need_comparator_evidence === 'no'
    ) {
      items.push({
        status: 'done',
        text: 'No document requests needed at this time.',
      })
    }

    if (answers.need_depositions === 'yes') {
      items.push({
        status: 'needed',
        text: 'Schedule depositions for supervisor, HR representative, or other witnesses.',
      })
    } else if (answers.need_depositions === 'no') {
      items.push({
        status: 'done',
        text: 'No depositions needed at this time.',
      })
    }

    items.push({
      status: 'info',
      text: 'Discovery requests must be served within the court\'s discovery period. The opposing party typically has 30 days to respond.',
    })

    return items
  },
}
