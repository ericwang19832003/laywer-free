import type { GuidedStepConfig } from '../types'

export const debtSettlementGuideConfig: GuidedStepConfig = {
  title: 'Negotiating a Settlement',
  reassurance:
    'Most debt cases settle. Knowing what to ask for gives you leverage — even against big collection firms.',

  questions: [
    {
      id: 'why_settle_info',
      type: 'info',
      prompt:
        'WHY SETTLE? About 80% of debt cases end in settlement. Settling can save you time, stress, and money. But ONLY settle if the terms are favorable.',
    },
    {
      id: 'claimed_amount',
      type: 'text',
      prompt: "What's the claimed debt amount?",
      placeholder: '$0.00',
    },
    {
      id: 'negotiation_targets_info',
      type: 'info',
      prompt:
        'NEGOTIATION TARGETS:\n- Offer 25-40% of the claimed amount as a lump sum (collectors often accept this)\n- If you can\'t pay lump sum, propose monthly payments over 12-24 months\n- ALWAYS demand: (1) Debt marked "paid in full" or "settled", (2) Deletion from credit reports, (3) Written agreement BEFORE any payment, (4) Case dismissal with prejudice',
    },
    {
      id: 'red_flags_info',
      type: 'info',
      prompt:
        'RED FLAGS — WALK AWAY IF:\n- Collector refuses to put agreement in writing\n- Collector demands payment before sending written agreement\n- Agreement says "partial payment" instead of "settled in full"\n- No credit report deletion clause\n- Collector pressures you to decide immediately',
    },
    {
      id: 'settlement_template_info',
      type: 'info',
      prompt:
        'SETTLEMENT LETTER TEMPLATE:\n\n[Date]\n[Collector Name]\n[Address]\n\nRe: Account #[number], [Your Name]\n\nI am writing to propose a settlement of the above-referenced account.\n\nI offer to pay $[amount] as full and final settlement, subject to the following conditions:\n1. This payment constitutes settlement in full of all claims.\n2. You will file a Dismissal with Prejudice within 10 days of payment.\n3. You will request deletion of this account from all credit bureaus within 30 days.\n4. You will provide written confirmation of this agreement before payment.\n\nThis offer expires in 14 days. Please respond in writing.\n\n[Your Name]',
    },
    {
      id: 'negotiation_timing',
      type: 'single_choice',
      prompt: 'Are you negotiating before or after the hearing?',
      options: [
        { value: 'before_hearing', label: 'Before the hearing' },
        { value: 'at_hearing', label: 'At the hearing' },
        { value: 'after_judgment', label: 'After a judgment' },
      ],
    },
    {
      id: 'before_hearing_info',
      type: 'info',
      prompt:
        'Before the hearing is the BEST time to settle. The collector wants to avoid trial costs too. Send your settlement letter now. If they don\'t respond, follow up by phone 5-7 days later. Always confirm any phone agreement in writing before paying.',
      showIf: (answers) => answers.negotiation_timing === 'before_hearing',
    },
    {
      id: 'at_hearing_info',
      type: 'info',
      prompt:
        'Many cases settle in the hallway before trial. Arrive early and ask to speak with the plaintiff\'s attorney. Be calm and professional. Have your settlement terms ready in writing. If you reach an agreement, ask the judge to enter an "Agreed Judgment" or dismiss the case with prejudice.',
      showIf: (answers) => answers.negotiation_timing === 'at_hearing',
    },
    {
      id: 'after_judgment_info',
      type: 'info',
      prompt:
        'After a judgment, you have less leverage — but settlement is still possible. Collectors prefer getting paid over chasing exemptions. Offer a lump sum at a discount. In Texas, wages cannot be garnished for consumer debt, so the collector knows enforcement is limited. Use that as leverage.',
      showIf: (answers) => answers.negotiation_timing === 'after_judgment',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.claimed_amount) {
      items.push({
        status: 'done',
        text: `Claimed debt amount: ${answers.claimed_amount}.`,
      })
    }

    items.push({
      status: 'info',
      text: 'Target a settlement of 25-40% of the claimed amount as a lump sum, or propose a 12-24 month payment plan.',
    })

    if (answers.negotiation_timing === 'before_hearing') {
      items.push({
        status: 'needed',
        text: 'Send your settlement letter to the collector now. Follow up by phone in 5-7 days if no response.',
      })
    } else if (answers.negotiation_timing === 'at_hearing') {
      items.push({
        status: 'needed',
        text: 'Arrive early to court with your settlement terms written out. Ask to speak with the plaintiff\'s attorney before trial.',
      })
    } else if (answers.negotiation_timing === 'after_judgment') {
      items.push({
        status: 'needed',
        text: 'Contact the collector with a lump sum offer. Remind them that Texas wage garnishment is not available for consumer debt.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Get any settlement agreement in writing BEFORE making any payment.',
    })

    items.push({
      status: 'needed',
      text: 'Ensure the agreement includes: dismissal with prejudice, credit report deletion, and "settled in full" language.',
    })

    return items
  },
}
