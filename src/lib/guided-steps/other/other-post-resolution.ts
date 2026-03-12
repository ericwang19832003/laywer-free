import type { GuidedStepConfig } from '../types'

export const otherPostResolutionConfig: GuidedStepConfig = {
  title: 'After Resolution',
  reassurance:
    'Whether your case settled or went to judgment, there are important follow-up steps to protect your rights.',

  questions: [
    {
      id: 'resolution_type',
      type: 'single_choice',
      prompt: 'How was your case resolved?',
      options: [
        { value: 'settlement', label: 'Settlement agreement' },
        { value: 'judgment_won', label: 'Judgment in my favor' },
        { value: 'judgment_lost', label: 'Judgment against me' },
        { value: 'dismissed', label: 'Case was dismissed' },
        { value: 'not_resolved', label: 'Not resolved yet' },
      ],
    },
    {
      id: 'settlement_written',
      type: 'yes_no',
      prompt: 'Is the settlement agreement in writing and signed by both parties?',
      showIf: (answers) => answers.resolution_type === 'settlement',
    },
    {
      id: 'settlement_tip',
      type: 'info',
      prompt:
        'Always get settlement agreements in writing. A verbal agreement is hard to enforce. The agreement should spell out exactly what each side will do and by when.',
      showIf: (answers) =>
        answers.resolution_type === 'settlement' && answers.settlement_written === 'no',
    },
    {
      id: 'enforcement_needed',
      type: 'yes_no',
      prompt: 'Is the other side complying with the judgment or agreement?',
      showIf: (answers) =>
        answers.resolution_type === 'settlement' || answers.resolution_type === 'judgment_won',
    },
    {
      id: 'enforcement_info',
      type: 'info',
      prompt:
        'If the other side is not complying, you may need to file a motion to enforce the judgment or settlement. For money judgments, options include wage garnishment, bank levies, or property liens. Contact the court clerk about enforcement procedures.',
      showIf: (answers) => answers.enforcement_needed === 'no',
    },
    {
      id: 'appeal_considered',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) => answers.resolution_type === 'judgment_lost',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'Appeals must be filed within a strict deadline (often 30 days from the judgment). An appeal is not a new trial — it argues that the court made a legal error. Consider consulting an attorney for appeals as they have complex procedural rules.',
      showIf: (answers) =>
        answers.resolution_type === 'judgment_lost' && answers.appeal_considered === 'yes',
    },
    {
      id: 'know_deadlines',
      type: 'yes_no',
      prompt: 'Are you aware of any remaining deadlines or follow-up actions?',
    },
    {
      id: 'deadline_reminder',
      type: 'info',
      prompt:
        'Common post-resolution deadlines include: payment deadlines in settlements, appeal deadlines, lien recording deadlines, and compliance reporting dates. Calendar all remaining deadlines immediately.',
      showIf: (answers) => answers.know_deadlines === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const typeLabels: Record<string, string> = {
      settlement: 'Settled',
      judgment_won: 'Judgment in your favor',
      judgment_lost: 'Judgment against you',
      dismissed: 'Case dismissed',
      not_resolved: 'Not yet resolved',
    }
    if (answers.resolution_type) {
      items.push({
        status: answers.resolution_type === 'not_resolved' ? 'info' : 'done',
        text: `Outcome: ${typeLabels[answers.resolution_type] ?? answers.resolution_type}.`,
      })
    }

    if (answers.resolution_type === 'settlement') {
      if (answers.settlement_written === 'yes') {
        items.push({ status: 'done', text: 'Settlement agreement is in writing.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Get the settlement agreement in writing and signed by both parties.',
        })
      }
    }

    if (
      (answers.resolution_type === 'settlement' || answers.resolution_type === 'judgment_won') &&
      answers.enforcement_needed === 'no'
    ) {
      items.push({
        status: 'needed',
        text: 'The other side is not complying. Look into enforcement options (garnishment, levies, liens).',
      })
    } else if (answers.enforcement_needed === 'yes') {
      items.push({ status: 'done', text: 'Other side is complying with the resolution.' })
    }

    if (answers.resolution_type === 'judgment_lost' && answers.appeal_considered === 'yes') {
      items.push({
        status: 'needed',
        text: 'File your appeal within the deadline (typically 30 days). Consider consulting an attorney.',
      })
    }

    if (answers.know_deadlines === 'yes') {
      items.push({ status: 'done', text: 'Remaining deadlines identified and tracked.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Calendar all remaining deadlines: payment dates, appeal windows, compliance dates.',
      })
    }

    return items
  },
}
