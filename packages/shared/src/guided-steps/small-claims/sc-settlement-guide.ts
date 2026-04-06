import type { GuidedStepConfig } from '../types'

export const scSettlementGuideConfig: GuidedStepConfig = {
  title: 'Settling Before Trial',
  reassurance:
    'About 60% of small claims settle before the hearing. A fair settlement saves time, stress, and uncertainty.',

  questions: [
    // When to settle
    {
      id: 'when_to_settle',
      type: 'info',
      prompt:
        'WHEN TO SETTLE:\n- After sending a demand letter but before the hearing\n- Settlement can happen at any point — even the morning of the hearing\n- The best time is after you have your evidence organized but before you spend time preparing for trial',
    },

    // Current stage
    {
      id: 'settlement_stage',
      type: 'single_choice',
      prompt: 'Where are you in the settlement process?',
      options: [
        { value: 'considering', label: 'Thinking about settling' },
        { value: 'negotiating', label: 'Currently negotiating' },
        { value: 'offered', label: 'Received a settlement offer' },
        { value: 'agreed', label: 'We agreed on terms' },
      ],
    },

    // How much to accept
    {
      id: 'how_much_info',
      type: 'info',
      prompt:
        'HOW MUCH TO ACCEPT — CONSIDER:\n- Time value: How many hours will trial preparation and court take?\n- Collection risk: Even if you win, can you actually collect?\n- Certainty vs uncertainty: A guaranteed payment now vs a possible judgment later\n- A settlement of 60-80% of your claim is often a good result',
      showIf: (answers) =>
        answers.settlement_stage === 'considering' ||
        answers.settlement_stage === 'offered',
    },

    // Claim amount
    {
      id: 'claim_amount',
      type: 'text',
      prompt: 'What is the total amount of your claim?',
      helpText:
        'Enter the dollar amount you are seeking. This helps you evaluate any settlement offer.',
      placeholder: 'e.g. $5,000',
    },

    // Offer amount (if received)
    {
      id: 'offer_amount',
      type: 'text',
      prompt: 'What amount has been offered?',
      helpText:
        'Enter the settlement amount the other side proposed.',
      placeholder: 'e.g. $3,500',
      showIf: (answers) => answers.settlement_stage === 'offered',
    },

    // Settlement agreement must-haves
    {
      id: 'agreement_contents',
      type: 'info',
      prompt:
        'YOUR SETTLEMENT AGREEMENT MUST INCLUDE:\n1. Exact dollar amount to be paid\n2. Payment deadline (specific date)\n3. Release of all claims by both sides\n4. Agreement to dismiss the case\n5. What happens if they miss the payment deadline\n6. Both parties\' signatures and the date',
    },

    // Payment plan
    {
      id: 'need_payment_plan',
      type: 'yes_no',
      prompt: 'Will the settlement involve a payment plan (multiple payments over time)?',
    },
    {
      id: 'payment_plan_info',
      type: 'info',
      prompt:
        'PAYMENT PLAN TERMS TO INCLUDE:\n- Exact amount of each payment\n- Due date for each payment\n- Acceleration clause: if they miss ONE payment, the full remaining balance is due immediately\n- Keep your case open until the last payment clears — do NOT dismiss until fully paid',
      showIf: (answers) => answers.need_payment_plan === 'yes',
    },

    // Written agreement warning
    {
      id: 'writing_warning',
      type: 'info',
      prompt:
        'GET IT IN WRITING BEFORE DISMISSING YOUR CASE.\n\nNEVER dismiss your lawsuit based on a verbal promise to pay. Once you dismiss, you lose your leverage. Get the signed agreement AND the payment (or first payment) before filing a dismissal.',
    },

    // Release form
    {
      id: 'release_template',
      type: 'info',
      prompt:
        'RELEASE FORM TEMPLATE (key language):\n"In consideration of [amount], [Defendant] agrees to pay [Plaintiff] by [date]. Upon receipt of payment, [Plaintiff] releases all claims against [Defendant] arising from [description of dispute] and agrees to file a dismissal with prejudice within [X] days of receiving payment."\n\nBoth parties sign and date. Each keeps a copy.',
    },

    // Confirmed in writing
    {
      id: 'have_written_agreement',
      type: 'yes_no',
      prompt: 'Do you have a signed, written settlement agreement?',
      showIf: (answers) => answers.settlement_stage === 'agreed',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Claim amount
    if (answers.claim_amount) {
      items.push({
        status: 'done',
        text: `Claim amount: ${answers.claim_amount}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your total claim amount to set your negotiation range.',
      })
    }

    // Offer evaluation
    if (answers.offer_amount) {
      items.push({
        status: 'info',
        text: `Settlement offer received: ${answers.offer_amount}. Consider time value, collection risk, and certainty before deciding.`,
      })
    }

    // Payment plan
    if (answers.need_payment_plan === 'yes') {
      items.push({
        status: 'info',
        text: 'Include an acceleration clause in the payment plan: if one payment is missed, the full balance is due immediately.',
      })
      items.push({
        status: 'info',
        text: 'Do NOT dismiss your case until the last payment clears.',
      })
    }

    // Written agreement
    if (answers.have_written_agreement === 'yes') {
      items.push({
        status: 'done',
        text: 'Signed written settlement agreement obtained.',
      })
    } else if (answers.settlement_stage === 'agreed') {
      items.push({
        status: 'needed',
        text: 'Get the settlement agreement in writing and signed by both parties before dismissing your case.',
      })
    }

    // Always include
    items.push({
      status: 'needed',
      text: 'Settlement agreement must include: amount, payment deadline, release of claims, dismissal terms, and signatures.',
    })

    items.push({
      status: 'info',
      text: 'NEVER dismiss your case based on a verbal promise. Get signed agreement AND payment first.',
    })

    return items
  },
}
