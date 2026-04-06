import type { GuidedStepConfig } from '../types'

export const contractNegotiationConfig: GuidedStepConfig = {
  title: 'Negotiate a Settlement',
  reassurance:
    'Many contract disputes settle before trial. Negotiation can save you the time and expense of litigation while still getting you a fair result.',

  questions: [
    {
      id: 'response_received',
      type: 'single_choice',
      prompt: 'Did the other party respond to your demand letter?',
      options: [
        { value: 'yes_willing', label: 'Yes, they want to negotiate' },
        { value: 'yes_denied', label: 'Yes, but they denied everything' },
        { value: 'no_response', label: 'No response' },
        { value: 'no_demand_sent', label: 'I didn\'t send a demand letter' },
      ],
    },
    {
      id: 'no_response_info',
      type: 'info',
      prompt:
        'If the other party did not respond to your demand letter, you can try one more contact attempt or proceed to filing your lawsuit. Their silence can actually help your case by showing the court you tried to resolve the matter.',
      showIf: (answers) => answers.response_received === 'no_response',
    },
    {
      id: 'settlement_range_known',
      type: 'yes_no',
      prompt: 'Do you have a minimum settlement amount in mind?',
      showIf: (answers) => answers.response_received === 'yes_willing',
    },
    {
      id: 'settlement_range_info',
      type: 'info',
      prompt:
        'Before negotiating, know your bottom line. Consider: the amount the contract is worth, your out-of-pocket costs, the cost and time of litigation, and the likelihood of winning at trial. Most settlements involve some compromise.',
      showIf: (answers) => answers.settlement_range_known === 'no',
    },
    {
      id: 'counter_offer_strategy',
      type: 'single_choice',
      prompt: 'What is your negotiation strategy?',
      showIf: (answers) => answers.response_received === 'yes_willing',
      options: [
        { value: 'full_amount', label: 'Demand the full amount owed' },
        { value: 'discount_quick', label: 'Accept a discount for quick payment' },
        { value: 'payment_plan', label: 'Offer a payment plan' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    },
    {
      id: 'strategy_info',
      type: 'info',
      prompt:
        'Consider what matters most to you: getting the full amount (which may take longer through litigation) or getting a partial amount quickly. A small discount for immediate payment can be worth it to avoid months of court proceedings.',
      showIf: (answers) => answers.counter_offer_strategy === 'not_sure',
    },
    {
      id: 'settlement_reached',
      type: 'single_choice',
      prompt: 'Have you reached a settlement agreement?',
      options: [
        { value: 'yes', label: 'Yes, we agreed on terms' },
        { value: 'no', label: 'No, negotiations failed' },
        { value: 'in_progress', label: 'Still negotiating' },
      ],
    },
    {
      id: 'settlement_writing_info',
      type: 'info',
      prompt:
        'Always get your settlement agreement in writing. Include: the amount, payment schedule, deadline, and what happens if the other party fails to pay. Both parties should sign.',
      showIf: (answers) => answers.settlement_reached === 'yes',
    },
    {
      id: 'filing_info',
      type: 'info',
      prompt:
        'Since negotiations did not result in a settlement, your next step is to file your contract lawsuit with the court. Make sure you file before the statute of limitations expires (typically 4 years for written contracts in Texas).',
      showIf: (answers) => answers.settlement_reached === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.response_received === 'yes_willing') {
      items.push({ status: 'done', text: 'Other party is willing to negotiate.' })
    } else if (answers.response_received === 'yes_denied') {
      items.push({ status: 'info', text: 'Other party denied the claim. Consider proceeding to filing.' })
    } else if (answers.response_received === 'no_response') {
      items.push({ status: 'info', text: 'No response received. Consider filing your lawsuit.' })
    } else if (answers.response_received === 'no_demand_sent') {
      items.push({ status: 'info', text: 'No demand letter sent. You can still negotiate or proceed directly to filing.' })
    }

    if (answers.settlement_range_known === 'yes') {
      items.push({ status: 'done', text: 'Minimum settlement amount determined.' })
    } else if (answers.response_received === 'yes_willing') {
      items.push({ status: 'needed', text: 'Determine your minimum acceptable settlement before negotiating.' })
    }

    if (answers.counter_offer_strategy && answers.counter_offer_strategy !== 'not_sure') {
      const labels: Record<string, string> = {
        full_amount: 'demanding the full amount',
        discount_quick: 'offering a discount for quick payment',
        payment_plan: 'offering a payment plan',
      }
      items.push({ status: 'done', text: `Strategy: ${labels[answers.counter_offer_strategy]}.` })
    }

    if (answers.settlement_reached === 'yes') {
      items.push({ status: 'done', text: 'Settlement reached. Get the agreement in writing with both parties\' signatures.' })
    } else if (answers.settlement_reached === 'no') {
      items.push({ status: 'needed', text: 'Negotiations failed. Prepare to file your contract lawsuit.' })
    } else if (answers.settlement_reached === 'in_progress') {
      items.push({ status: 'info', text: 'Negotiations are ongoing. Return when you have a result.' })
    }

    items.push({
      status: 'info',
      text: 'The statute of limitations for written contracts in Texas is 4 years. Don\'t let negotiations delay filing past the deadline.',
    })

    return items
  },
}
