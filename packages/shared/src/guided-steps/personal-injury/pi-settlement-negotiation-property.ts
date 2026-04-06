import type { GuidedStepConfig } from '../types'

export const piSettlementNegotiationPropertyConfig: GuidedStepConfig = {
  title: 'Negotiate Your Settlement',
  reassurance:
    'Understanding your options helps you get fair compensation for your property damage.',

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
      prompt: 'How does the offer compare to your total property damage costs?',
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
        'To write a counter-offer: state why their offer is low, itemize your repair costs (including diminished value and loss of use), propose a specific amount, and set a response deadline.',
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
        "Mediation uses a neutral third party to help reach agreement. It's faster and cheaper than going to court.",
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
        'Important: If negotiations fail, you must file suit before your statute of limitations expires. In Texas, this is generally 2 years for property damage claims.',
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
      id: 'already_filed_petition',
      type: 'yes_no',
      prompt: 'Have you already filed a petition (lawsuit) with the court?',
      helpText:
        'If you have already filed your petition independently or with help from another service, select Yes.',
      showIf: (answers) =>
        answers.settlement_reached === 'no' && answers.want_to_file_suit === 'yes',
    },
    {
      id: 'cause_number',
      type: 'text',
      prompt: 'What is your cause number (case number)?',
      helpText:
        'You can find this on your filed petition or the court receipt. Example: 2024-CI-12345.',
      placeholder: 'e.g. 2024-CI-12345',
      showIf: (answers) =>
        answers.settlement_reached === 'no' &&
        answers.want_to_file_suit === 'yes' &&
        answers.already_filed_petition === 'yes',
    },
    {
      id: 'petition_filing_date',
      type: 'text',
      prompt: 'When did you file your petition?',
      helpText: 'An approximate date is fine.',
      placeholder: 'e.g. January 2024',
      showIf: (answers) =>
        answers.settlement_reached === 'no' &&
        answers.want_to_file_suit === 'yes' &&
        answers.already_filed_petition === 'yes',
    },
    {
      id: 'already_filed_info',
      type: 'info',
      prompt:
        "Got it. Since you've already filed your petition, we'll skip the petition preparation and court filing steps and move straight to serving the defendant.",
      showIf: (answers) =>
        answers.settlement_reached === 'no' &&
        answers.want_to_file_suit === 'yes' &&
        answers.already_filed_petition === 'yes',
    },
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'Great — we will skip the litigation steps and guide you through the post-resolution process, including reviewing your settlement agreement and understanding any tax implications.',
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
          text: 'Write a counter-offer: explain why the offer is low, itemize your repair costs (including diminished value and loss of use), propose a specific amount, and set a deadline.',
        })
      } else if (answers.offer_evaluation === 'seems_fair') {
        items.push({
          status: 'info',
          text: 'The offer seems fair. Review it carefully before accepting and make sure it covers all repair costs, diminished value, and loss of use.',
        })
      } else if (answers.offer_evaluation === 'unsure') {
        items.push({
          status: 'needed',
          text: 'Compare the offer to your total costs (repair estimates, diminished value, loss of use, rental expenses) before deciding.',
        })
      }
    } else {
      items.push({
        status: 'info',
        text: 'No settlement offer received yet. Continue building your case and documenting damage costs.',
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
        text: 'Determine your statute of limitations deadline. In Texas, it is generally 2 years for property damage claims.',
      })
    }

    if (answers.settlement_reached === 'yes') {
      items.push({
        status: 'done',
        text: 'Settlement reached. Litigation steps will be skipped.',
      })
    } else if (answers.settlement_reached === 'no') {
      if (answers.want_to_file_suit === 'yes') {
        if (answers.already_filed_petition === 'yes') {
          const causeInfo = answers.cause_number ? ` (Cause No. ${answers.cause_number})` : ''
          items.push({
            status: 'done',
            text: `Petition already filed${causeInfo}. Next step: serve the defendant.`,
          })
        } else {
          items.push({
            status: 'needed',
            text: 'Filing a lawsuit. Next step: prepare your petition.',
          })
        }
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
