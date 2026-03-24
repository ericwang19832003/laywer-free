import type { GuidedStepConfig } from '../types'

export const piPostResolutionConfig: GuidedStepConfig = {
  title: 'After Resolution',
  reassurance:
    'Understanding your next steps ensures you handle the outcome correctly.',

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'settled', label: 'Settled' },
        { value: 'won_trial', label: 'Won at trial' },
        { value: 'lost_trial', label: 'Lost at trial' },
        { value: 'still_pending', label: 'Still pending' },
      ],
    },
    {
      id: 'settlement_reviewed',
      type: 'yes_no',
      prompt:
        'Have you reviewed the settlement agreement for medical liens?',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'lien_info',
      type: 'info',
      prompt:
        "Before spending settlement funds, check for medical liens \u2014 your health insurer or Medicare may have a right to reimbursement.",
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'defendant_paid',
      type: 'yes_no',
      prompt: 'Has the defendant paid the judgment?',
      showIf: (answers) => answers.case_outcome === 'won_trial',
    },
    {
      id: 'collection_info',
      type: 'info',
      prompt:
        "If the defendant hasn't paid, you may need to pursue collection through wage garnishment, bank levy, or property lien.",
      showIf: (answers) => answers.defendant_paid === 'no',
    },
    {
      id: 'considering_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) => answers.case_outcome === 'lost_trial',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        "Appeals must typically be filed within 30 days. You'll need to show the court made a legal error \u2014 disagreeing with the outcome alone isn't enough.",
      showIf: (answers) => answers.considering_appeal === 'yes',
    },
    {
      id: 'tax_info',
      type: 'info',
      prompt:
        'Settlement and judgment proceeds may have tax implications. Compensation for physical injuries is generally tax-free, but punitive damages and interest are taxable.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const outcome = answers.case_outcome

    if (outcome === 'settled') {
      items.push({
        status: 'done',
        text: 'Case settled.',
      })

      if (answers.settlement_reviewed === 'yes') {
        items.push({
          status: 'done',
          text: 'Settlement agreement reviewed for medical liens.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Review the settlement agreement for medical liens before spending any funds.',
        })
      }

      items.push({
        status: 'info',
        text: 'Check if your health insurer or Medicare has a right to reimbursement from the settlement.',
      })
    } else if (outcome === 'won_trial') {
      items.push({
        status: 'done',
        text: 'Won at trial.',
      })

      if (answers.defendant_paid === 'yes') {
        items.push({
          status: 'done',
          text: 'Defendant has paid the judgment.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Pursue collection: wage garnishment, bank levy, or property lien may be needed.',
        })
      }
    } else if (outcome === 'lost_trial') {
      items.push({
        status: 'info',
        text: 'Lost at trial.',
      })

      if (answers.considering_appeal === 'yes') {
        items.push({
          status: 'needed',
          text: 'File your appeal within 30 days. You must show the court made a legal error.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Not pursuing an appeal. The deadline is typically 30 days if you change your mind.',
        })
      }
    } else if (outcome === 'still_pending') {
      items.push({
        status: 'info',
        text: 'Case is still pending. Return to this step once your case reaches a resolution.',
      })
    }

    items.push({
      status: 'info',
      text: 'Compensation for physical injuries is generally tax-free, but punitive damages and interest are taxable.',
    })

    return items
  },
}
