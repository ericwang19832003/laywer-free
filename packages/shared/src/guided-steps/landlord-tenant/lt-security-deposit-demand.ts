import type { GuidedStepConfig } from '../types'

export const ltSecurityDepositDemandConfig: GuidedStepConfig = {
  title: 'Getting Your Security Deposit Back',
  reassurance:
    'Texas law is strongly on your side. Landlords must return your deposit within 30 days or face triple damages.',

  questions: [
    {
      id: 'texas_deposit_law',
      type: 'info',
      prompt:
        'TEXAS SECURITY DEPOSIT LAW (\u00a792.103-109):\n- Landlord has 30 days after move-out to return deposit OR send itemized list of deductions\n- If they don\'t: you can recover 3x the wrongfully withheld amount + $100 + attorney fees\n- Deductions must be for ACTUAL damage beyond \'normal wear and tear\'\n- Landlord CANNOT deduct for: paint touch-ups, carpet cleaning (unless lease requires), nail holes, minor scuffs',
    },
    {
      id: 'moved_out',
      type: 'yes_no',
      prompt: 'Have you moved out?',
    },
    {
      id: 'forwarding_address',
      type: 'yes_no',
      prompt: 'Did you provide a forwarding address in writing?',
      showIf: (answers) => answers.moved_out === 'yes',
    },
    {
      id: 'forwarding_address_warning',
      type: 'info',
      prompt:
        "You MUST provide a written forwarding address. Without it, the 30-day clock doesn't start. Send it now via certified mail.",
      showIf: (answers) =>
        answers.moved_out === 'yes' && answers.forwarding_address === 'no',
    },
    {
      id: 'over_30_days',
      type: 'yes_no',
      prompt: 'Has it been more than 30 days since move-out?',
      showIf: (answers) => answers.moved_out === 'yes',
    },
    {
      id: 'violation_info',
      type: 'info',
      prompt:
        'Your landlord has violated \u00a792.109. You are entitled to: the full deposit, plus up to 3x the amount wrongfully withheld, plus $100, plus reasonable attorney fees. Send a demand letter immediately.',
      showIf: (answers) =>
        answers.over_30_days === 'yes' &&
        answers.forwarding_address === 'yes',
    },
    {
      id: 'itemized_deductions',
      type: 'yes_no',
      prompt: 'Did the landlord send an itemized deduction list?',
      showIf: (answers) => answers.moved_out === 'yes',
    },
    {
      id: 'deduction_review',
      type: 'info',
      prompt:
        "Review each deduction carefully. Challenge anything that is:\n- Normal wear and tear (faded paint, worn carpet)\n- Pre-existing damage (was there when you moved in)\n- Cleaning you already did\n- Repairs that were the landlord's responsibility",
      showIf: (answers) => answers.itemized_deductions === 'yes',
    },
    {
      id: 'demand_letter_template',
      type: 'info',
      prompt:
        'DEMAND LETTER TEMPLATE:\n\n[Date]\n[Landlord Name]\n[Address]\n\nRe: Security Deposit Return \u2014 [Property Address]\n\nI vacated the property on [date] and provided my forwarding address on [date]. More than 30 days have passed and I have not received my security deposit of $[amount].\n\nUnder Texas Property Code \u00a792.109, I am entitled to the return of my deposit plus up to three times the amount wrongfully withheld, $100, and reasonable attorney fees.\n\nI demand return of $[amount] within 14 days. If I do not receive payment, I will file suit in Justice of the Peace Court.\n\n[Your Name]',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.moved_out === 'yes') {
      items.push({ status: 'done', text: 'You have moved out of the property.' })
    } else {
      items.push({
        status: 'needed',
        text: 'You must move out before the 30-day clock starts.',
      })
    }

    if (answers.forwarding_address === 'yes') {
      items.push({
        status: 'done',
        text: 'Forwarding address provided in writing.',
      })
    } else if (answers.forwarding_address === 'no') {
      items.push({
        status: 'needed',
        text: 'Send your forwarding address to your landlord via certified mail immediately.',
      })
    }

    if (answers.over_30_days === 'yes' && answers.forwarding_address === 'yes') {
      items.push({
        status: 'info',
        text: 'Your landlord has violated \u00a792.109. You may be entitled to 3x the withheld amount + $100 + attorney fees.',
      })
    }

    if (answers.itemized_deductions === 'yes') {
      items.push({
        status: 'needed',
        text: 'Review each deduction and challenge anything that is normal wear and tear or pre-existing damage.',
      })
    } else if (answers.itemized_deductions === 'no' && answers.over_30_days === 'yes') {
      items.push({
        status: 'info',
        text: 'No itemized list received. This strengthens your case \u2014 the landlord failed to account for deductions.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Send a demand letter using the template provided. Keep a copy and send via certified mail.',
    })

    return items
  },
}
