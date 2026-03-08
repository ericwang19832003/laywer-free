import type { GuidedStepConfig } from '../types'

export const piSettlementNegotiationConfig: GuidedStepConfig = {
  title: 'Negotiate Your Settlement',
  reassurance:
    'Understanding your options helps you get fair compensation.',

  questions: [
    {
      id: 'received_offer',
      type: 'yes_no',
      prompt:
        'Have you received a settlement offer from the insurance company?',
    },
    {
      id: 'offer_evaluation',
      type: 'single_choice',
      prompt: 'How does the offer compare to your total damages?',
      options: [
        { value: 'too_low', label: 'Too low' },
        { value: 'seems_fair', label: 'Seems fair' },
        { value: 'unsure', label: "I'm not sure" },
      ],
      showIf: (answers) => answers.received_offer === 'yes',
    },
    {
      id: 'counter_offer_info',
      type: 'info',
      prompt:
        'To write a counter-offer: state why their offer is low, itemize your damages, propose a specific amount, and set a response deadline.',
      showIf: (answers) => answers.offer_evaluation === 'too_low',
    },
    {
      id: 'open_to_mediation',
      type: 'yes_no',
      prompt: 'Would you be open to mediation if negotiations stall?',
    },
    {
      id: 'mediation_info',
      type: 'info',
      prompt:
        "Mediation uses a neutral third party to help reach agreement. It's faster and cheaper than trial.",
      showIf: (answers) => answers.open_to_mediation === 'yes',
    },
    {
      id: 'know_statute_of_limitations',
      type: 'yes_no',
      prompt:
        'Do you know your statute of limitations deadline for filing suit?',
    },
    {
      id: 'sol_warning',
      type: 'info',
      prompt:
        'Important: If negotiations fail, you must file suit before your statute of limitations expires. In Texas, this is generally 2 years from the date of injury.',
    },
    {
      id: 'settlement_reached',
      type: 'yes_no',
      prompt:
        'Have you reached a settlement agreement that you are satisfied with?',
      helpText:
        'If you accepted a settlement offer, select Yes. If negotiations are still ongoing or failed, select No.',
    },
    {
      id: 'want_to_file_suit',
      type: 'yes_no',
      prompt: 'Do you want to file a lawsuit (petition) against the other party?',
      helpText:
        'If settlement negotiations have failed and you want to pursue your claim in court, select Yes.',
      showIf: (answers) => answers.settlement_reached === 'no',
    },
    {
      id: 'filing_suit_info',
      type: 'info',
      prompt:
        'We will guide you through preparing and filing your petition. Make sure you file before your statute of limitations expires.',
      showIf: (answers) =>
        answers.settlement_reached === 'no' && answers.want_to_file_suit === 'yes',
    },
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'Great — we will skip the litigation steps and guide you through the post-resolution process, including reviewing your settlement agreement and understanding any liens or tax implications.',
      showIf: (answers) => answers.settlement_reached === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_offer === 'yes') {
      items.push({
        status: 'done',
        text: 'Settlement offer received from the insurance company.',
      })

      if (answers.offer_evaluation === 'too_low') {
        items.push({
          status: 'needed',
          text: 'Write a counter-offer: explain why the offer is low, itemize your damages, propose a specific amount, and set a deadline.',
        })
      } else if (answers.offer_evaluation === 'seems_fair') {
        items.push({
          status: 'info',
          text: 'The offer seems fair. Review it carefully before accepting and make sure it covers all your damages.',
        })
      } else if (answers.offer_evaluation === 'unsure') {
        items.push({
          status: 'needed',
          text: 'Compare the offer to your total damages (medical bills, lost wages, pain and suffering) before deciding.',
        })
      }
    } else {
      items.push({
        status: 'info',
        text: 'No settlement offer received yet. Continue building your case and documenting damages.',
      })
    }

    if (answers.open_to_mediation === 'yes') {
      items.push({
        status: 'info',
        text: 'Open to mediation. This is a cost-effective way to resolve disputes if direct negotiation stalls.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Not currently open to mediation. You can reconsider later if negotiations stall.',
      })
    }

    if (answers.know_statute_of_limitations === 'yes') {
      items.push({
        status: 'done',
        text: 'Statute of limitations deadline is known.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your statute of limitations deadline. In Texas, it is generally 2 years from the date of injury.',
      })
    }

    items.push({
      status: 'info',
      text: 'If negotiations fail, you must file suit before your statute of limitations expires.',
    })

    if (answers.settlement_reached === 'yes') {
      items.push({
        status: 'done',
        text: 'Settlement reached. Litigation steps will be skipped.',
      })
    } else if (answers.settlement_reached === 'no') {
      if (answers.want_to_file_suit === 'yes') {
        items.push({
          status: 'needed',
          text: 'Filing a lawsuit. Next step: prepare your petition.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Not filing suit at this time. You can revisit this decision later.',
        })
      }
    }

    return items
  },
}
