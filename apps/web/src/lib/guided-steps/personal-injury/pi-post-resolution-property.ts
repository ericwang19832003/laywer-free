import type { GuidedStepConfig } from '../types'

export const piPostResolutionPropertyConfig: GuidedStepConfig = {
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
        'Have you reviewed the settlement agreement for any liens (e.g., repair shop liens, subrogation claims)?',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'lien_info',
      type: 'info',
      prompt:
        'Before spending settlement funds, check for any outstanding liens — your insurance company may have a subrogation claim to recover what they paid on your behalf.',
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
        "Appeals must typically be filed within 30 days. You'll need to show the court made a legal error — disagreeing with the outcome alone isn't enough.",
      showIf: (answers) => answers.considering_appeal === 'yes',
    },
    {
      id: 'tax_info',
      type: 'info',
      prompt:
        'Property damage settlements are generally not taxable if they reimburse you for a loss (restoring you to your previous position). However, if you receive more than your actual loss, the excess may be taxable. Consult a tax professional if unsure.',
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
          text: 'Settlement agreement reviewed for liens and subrogation claims.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Review the settlement agreement for any liens or subrogation claims before spending funds.',
        })
      }

      items.push({
        status: 'info',
        text: 'Check if your insurance company has a subrogation claim to recover what they paid on your behalf.',
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
      text: 'Property damage settlements that reimburse your actual loss are generally not taxable. Consult a tax professional if you received more than your loss.',
    })

    return items
  },
}
