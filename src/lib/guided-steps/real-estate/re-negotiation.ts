import type { GuidedStepConfig } from '../types'

export const reNegotiationConfig: GuidedStepConfig = {
  title: 'Attempt Negotiation or Mediation',
  reassurance:
    'Many real estate disputes settle through negotiation, saving both sides the cost and stress of litigation.',

  questions: [
    {
      id: 'ideal_resolution',
      type: 'single_choice',
      prompt: 'What is your ideal resolution?',
      options: [
        { value: 'monetary_compensation', label: 'Monetary compensation' },
        { value: 'complete_transaction', label: 'Complete the transaction' },
        { value: 'return_funds', label: 'Return of funds (earnest money, deposit, etc.)' },
        { value: 'repair_defects', label: 'Repair defects' },
        { value: 'clear_title', label: 'Clear the title' },
        { value: 'combination', label: 'A combination of remedies' },
      ],
    },
    {
      id: 'prior_communications',
      type: 'single_choice',
      prompt: 'How have communications with the other party gone so far?',
      options: [
        { value: 'cooperative', label: 'Cooperative — they are willing to talk' },
        { value: 'unresponsive', label: 'Unresponsive — they are not replying' },
        { value: 'hostile', label: 'Hostile — they are aggressive or threatening' },
        { value: 'no_contact', label: 'No contact yet' },
      ],
    },
    {
      id: 'hostile_info',
      type: 'info',
      prompt:
        'When the other party is hostile, communicate only in writing to create a record. Consider mediation with a neutral third party rather than direct negotiation. Do not engage with threats — document them instead.',
      showIf: (answers) => answers.prior_communications === 'hostile',
    },
    {
      id: 'open_to_mediation',
      type: 'yes_no',
      prompt: 'Would you be open to mediation?',
      helpText:
        'Mediation involves a neutral third party who helps both sides reach an agreement.',
    },
    {
      id: 'mediation_info',
      type: 'info',
      prompt:
        'Mediation uses a neutral third party to help both sides find a resolution. It is less formal, less expensive, and faster than going to trial. Many Texas courts require mediation before trial in real estate disputes. You can find mediators through the Texas Mediator Credentialing Association or your local bar association.',
      showIf: (answers) => answers.open_to_mediation === 'yes',
    },
    {
      id: 'agreement_reached',
      type: 'yes_no',
      prompt: 'Have you reached an agreement with the other party?',
    },
    {
      id: 'agreement_info',
      type: 'info',
      prompt:
        'Put the agreement in writing immediately. Include specific terms, deadlines, and consequences for non-compliance. Both parties should sign. Have the agreement notarized if possible. If the agreement involves property transfer or liens, record it with the county clerk.',
      showIf: (answers) => answers.agreement_reached === 'yes',
    },
    {
      id: 'no_agreement_info',
      type: 'info',
      prompt:
        'Since negotiation did not resolve the dispute, the next step is to file a petition with the court. Your negotiation attempts demonstrate good faith and strengthen your position.',
      showIf: (answers) => answers.agreement_reached === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.ideal_resolution) {
      const labels: Record<string, string> = {
        monetary_compensation: 'Monetary compensation',
        complete_transaction: 'Complete the transaction',
        return_funds: 'Return of funds',
        repair_defects: 'Repair defects',
        clear_title: 'Clear the title',
        combination: 'A combination of remedies',
      }
      items.push({ status: 'done', text: `Ideal resolution: ${labels[answers.ideal_resolution]}.` })
    } else {
      items.push({ status: 'needed', text: 'Determine your ideal resolution before negotiating.' })
    }

    if (answers.prior_communications === 'cooperative') {
      items.push({ status: 'done', text: 'Other party is cooperative and willing to negotiate.' })
    } else if (answers.prior_communications === 'unresponsive') {
      items.push({ status: 'info', text: 'Other party is unresponsive. Consider mediation or proceeding to file.' })
    } else if (answers.prior_communications === 'hostile') {
      items.push({ status: 'info', text: 'Other party is hostile. Communicate only in writing and consider mediation.' })
    } else if (answers.prior_communications === 'no_contact') {
      items.push({ status: 'needed', text: 'Initiate contact with the other party to begin negotiation.' })
    }

    if (answers.open_to_mediation === 'yes') {
      items.push({ status: 'done', text: 'Open to mediation. Contact a credentialed mediator or local bar association.' })
    } else if (answers.open_to_mediation === 'no') {
      items.push({ status: 'info', text: 'Not pursuing mediation. Note that some Texas courts require it before trial.' })
    }

    if (answers.agreement_reached === 'yes') {
      items.push({ status: 'done', text: 'Agreement reached. Put it in writing, get signatures, and notarize.' })
    } else if (answers.agreement_reached === 'no') {
      items.push({ status: 'needed', text: 'No agreement reached. Prepare to file a petition with the court.' })
    }

    return items
  },
}
