import type { GuidedStepConfig } from '../types'

export const ltNegotiationConfig: GuidedStepConfig = {
  title: 'Settlement Negotiation',
  reassurance:
    'Settling a landlord-tenant dispute outside of court can save you time, money, and stress. Many cases resolve at this stage.',

  questions: [
    {
      id: 'demand_letter_sent',
      type: 'yes_no',
      prompt: 'Have you sent a demand letter to the other party?',
      helpText:
        'A demand letter formally notifies the other party and often prompts a response. It also shows the court you tried to resolve the matter.',
    },
    {
      id: 'demand_letter_tip',
      type: 'info',
      prompt:
        'Sending a demand letter first strengthens your position. If you skipped this step, you can still negotiate, but the other party may take you less seriously without a formal demand on record.',
      showIf: (answers) => answers.demand_letter_sent === 'no',
    },
    {
      id: 'response_received',
      type: 'single_choice',
      prompt: 'Has the other party responded?',
      options: [
        { value: 'yes_willing', label: 'Yes, they want to negotiate' },
        { value: 'yes_denied', label: 'Yes, but they denied everything' },
        { value: 'no_response', label: 'No response yet' },
      ],
    },
    {
      id: 'no_response_info',
      type: 'info',
      prompt:
        'If the other party has not responded, you can try one more contact attempt or proceed to filing your case. Their silence can help demonstrate to the court that you made a good-faith effort to resolve the dispute.',
      showIf: (answers) => answers.response_received === 'no_response',
    },
    {
      id: 'settlement_range_known',
      type: 'yes_no',
      prompt: 'Do you know your minimum acceptable settlement terms?',
      helpText:
        'Before negotiating, decide what you would accept. Consider: the amount at stake, cost of going to court, and how long litigation takes.',
      showIf: (answers) => answers.response_received === 'yes_willing',
    },
    {
      id: 'settlement_range_info',
      type: 'info',
      prompt:
        'Know your bottom line before you start. Consider: repair costs or unpaid rent, the cost and time of litigation, lease terms, and your strongest evidence. Most settlements involve some compromise from both sides.',
      showIf: (answers) => answers.settlement_range_known === 'no',
    },
    {
      id: 'settlement_reached',
      type: 'single_choice',
      prompt: 'Have you reached a settlement?',
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
        'Get your settlement in writing. Include: what each party will do, deadlines, and consequences for non-compliance. Both parties should sign. Consider having it notarized.',
      showIf: (answers) => answers.settlement_reached === 'yes',
    },
    {
      id: 'filing_info',
      type: 'info',
      prompt:
        'Since negotiations did not resolve the dispute, your next step is to prepare and file your case with the court. Your demand letter and negotiation attempts strengthen your position.',
      showIf: (answers) => answers.settlement_reached === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.demand_letter_sent === 'yes') {
      items.push({ status: 'done', text: 'Demand letter sent.' })
    } else {
      items.push({ status: 'info', text: 'No demand letter sent. You can still negotiate directly.' })
    }

    if (answers.response_received === 'yes_willing') {
      items.push({ status: 'done', text: 'Other party is willing to negotiate.' })
    } else if (answers.response_received === 'yes_denied') {
      items.push({ status: 'info', text: 'Other party denied the claim. Consider proceeding to filing.' })
    } else if (answers.response_received === 'no_response') {
      items.push({ status: 'info', text: 'No response received. Consider filing your case.' })
    }

    if (answers.settlement_range_known === 'yes') {
      items.push({ status: 'done', text: 'Settlement range determined.' })
    } else if (answers.response_received === 'yes_willing') {
      items.push({ status: 'needed', text: 'Determine your minimum acceptable settlement before negotiating.' })
    }

    if (answers.settlement_reached === 'yes') {
      items.push({ status: 'done', text: 'Settlement reached. Get the agreement in writing with both signatures.' })
    } else if (answers.settlement_reached === 'no') {
      items.push({ status: 'needed', text: 'Negotiations failed. Prepare to file your landlord-tenant case.' })
    } else if (answers.settlement_reached === 'in_progress') {
      items.push({ status: 'info', text: 'Negotiations are ongoing. Return when you have a result.' })
    }

    return items
  },
}
