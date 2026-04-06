import type { GuidedStepConfig } from '../types'

export const contractPostResolutionConfig: GuidedStepConfig = {
  title: 'After Resolution',
  reassurance:
    'Understanding your next steps after the case is resolved ensures you properly enforce the outcome and handle any remaining obligations.',

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your contract case?',
      options: [
        { value: 'settled', label: 'Settled (agreed on terms)' },
        { value: 'won_trial', label: 'Won at trial' },
        { value: 'lost_trial', label: 'Lost at trial' },
        { value: 'default_judgment', label: 'Won by default judgment' },
        { value: 'still_pending', label: 'Still pending' },
      ],
    },
    {
      id: 'settlement_in_writing',
      type: 'yes_no',
      prompt: 'Is your settlement agreement in writing and signed by both parties?',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'settlement_writing_info',
      type: 'info',
      prompt:
        'Always put settlement agreements in writing. Include: the amount, payment schedule, deadlines, what happens if the other party defaults, and whether either side releases future claims. Both parties must sign.',
      showIf: (answers) => answers.settlement_in_writing === 'no',
    },
    {
      id: 'payment_received',
      type: 'single_choice',
      prompt: 'Has the other party paid the agreed amount?',
      showIf: (answers) => answers.case_outcome === 'settled' || answers.case_outcome === 'won_trial' || answers.case_outcome === 'default_judgment',
      options: [
        { value: 'full', label: 'Yes, paid in full' },
        { value: 'partial', label: 'Partial payment received' },
        { value: 'none', label: 'No payment received' },
      ],
    },
    {
      id: 'enforcement_info',
      type: 'info',
      prompt:
        'If the other party has not paid, you can enforce the judgment through: wage garnishment, bank account levy, property lien, or a writ of execution. Start by sending a post-judgment demand letter with a final deadline.',
      showIf: (answers) => answers.payment_received === 'none' || answers.payment_received === 'partial',
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
        'Appeals must typically be filed within 30 days of the judgment. You must show the court made a legal error. Simply disagreeing with the outcome is not enough for a successful appeal.',
      showIf: (answers) => answers.considering_appeal === 'yes',
    },
    {
      id: 'tax_info',
      type: 'info',
      prompt:
        'Settlement and judgment proceeds from contract disputes may have tax implications. Amounts that compensate you for lost income are generally taxable. Consult a tax professional if you received a significant recovery.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    const outcome = answers.case_outcome

    if (outcome === 'settled') {
      items.push({ status: 'done', text: 'Case settled.' })

      if (answers.settlement_in_writing === 'yes') {
        items.push({ status: 'done', text: 'Settlement agreement is in writing and signed.' })
      } else {
        items.push({ status: 'needed', text: 'Put the settlement agreement in writing and get both parties\' signatures.' })
      }
    } else if (outcome === 'won_trial') {
      items.push({ status: 'done', text: 'Won at trial.' })
    } else if (outcome === 'default_judgment') {
      items.push({ status: 'done', text: 'Won by default judgment.' })
    } else if (outcome === 'lost_trial') {
      items.push({ status: 'info', text: 'Lost at trial.' })

      if (answers.considering_appeal === 'yes') {
        items.push({ status: 'needed', text: 'File your appeal within 30 days. You must show the court made a legal error.' })
      } else {
        items.push({ status: 'info', text: 'Not pursuing an appeal. The deadline is typically 30 days if you change your mind.' })
      }
    } else if (outcome === 'still_pending') {
      items.push({ status: 'info', text: 'Case is still pending. Return to this step once your case reaches a resolution.' })
    }

    if (answers.payment_received === 'full') {
      items.push({ status: 'done', text: 'Payment received in full.' })
    } else if (answers.payment_received === 'partial') {
      items.push({ status: 'needed', text: 'Partial payment received. Pursue the remaining balance through enforcement.' })
    } else if (answers.payment_received === 'none') {
      items.push({ status: 'needed', text: 'No payment received. Consider enforcement options: garnishment, levy, or lien.' })
    }

    items.push({
      status: 'info',
      text: 'Contract settlement proceeds that replace lost income are generally taxable. Consult a tax professional.',
    })

    return items
  },
}
