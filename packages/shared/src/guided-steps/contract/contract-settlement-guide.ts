import type { GuidedStepConfig } from '../types'

export const contractSettlementGuideConfig: GuidedStepConfig = {
  title: 'Negotiating a Settlement',
  reassurance:
    'Most contract cases settle before trial. A written settlement agreement protects you better than a judgment.',

  questions: [
    // Why settle
    {
      id: 'why_settle',
      type: 'info',
      prompt:
        'WHY SETTLE?\n- Faster resolution (months vs years)\n- Guaranteed payment (judgments can be hard to collect)\n- You control the terms (judge might award less)\n- Confidentiality possible\n- Lower costs (no trial expenses)',
      acknowledgeLabel: 'I understand the benefits of settling',
    },

    // Total damages
    {
      id: 'total_damages',
      type: 'text',
      prompt: 'What are your total damages?',
      helpText:
        'Enter the total dollar amount you believe you are owed. Include all losses caused by the breach — the amount owed under the contract, costs to fix or complete the work, and any consequential damages.',
      placeholder: 'e.g. $15,000',
    },

    // Negotiation strategy
    {
      id: 'negotiation_strategy',
      type: 'info',
      prompt:
        'NEGOTIATION STRATEGY:\n- Start at 75-100% of your documented damages\n- Be prepared to come down to 50-60% for a quick settlement\n- Demand CASH or CERTIFIED FUNDS (personal checks can bounce)\n- Require payment within 14-30 days\n- ALWAYS get the agreement in writing before accepting payment',
      acknowledgeLabel: 'I understand these negotiation principles',
    },

    // Settlement agreement contents
    {
      id: 'settlement_agreement_contents',
      type: 'multi_select',
      prompt: 'Does your draft settlement agreement include these terms?',
      options: [
        { value: 'amount', label: 'Amount to be paid' },
        { value: 'payment_schedule', label: 'Payment schedule (lump sum or installments)' },
        { value: 'payment_deadline', label: 'Deadline for payment' },
        { value: 'nonpayment_consequence', label: 'Consequence of non-payment (enforceable as judgment)' },
        { value: 'mutual_release', label: 'Mutual release of all claims' },
        { value: 'dismissal', label: 'Dismissal of lawsuit with prejudice' },
        { value: 'confidentiality', label: 'Confidentiality clause (optional but recommended)' },
        { value: 'both_signatures', label: "Both parties' signatures" },
      ],
      noneLabel: "Haven't drafted the agreement yet",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Damages amount
    if (answers.total_damages) {
      items.push({
        status: 'done',
        text: `Total damages claimed: ${answers.total_damages}.`,
      })
      items.push({
        status: 'info',
        text: 'Start negotiations at 75-100% of your documented damages. Be prepared to settle for 50-60% for a quick resolution.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate your total damages to set your negotiation range.',
      })
    }

    // Settlement checklist
    const agreedTerms = answers.settlement_agreement_contents
      ? answers.settlement_agreement_contents.split(',').filter((v: string) => v && v !== 'none')
      : []
    const requiredTerms = ['amount', 'payment_schedule', 'payment_deadline', 'nonpayment_consequence', 'mutual_release', 'dismissal', 'both_signatures']
    const missingTerms = requiredTerms.filter(t => !agreedTerms.includes(t))
    if (agreedTerms.length > 0 && missingTerms.length === 0) {
      items.push({ status: 'done', text: 'Settlement agreement includes all required terms.' })
    } else if (agreedTerms.length > 0) {
      items.push({ status: 'needed', text: `Settlement agreement is missing ${missingTerms.length} required term(s). Review and complete before signing.` })
    } else {
      items.push({
        status: 'needed',
        text: 'Draft a settlement agreement that includes: amount, payment schedule, deadline, consequence of non-payment, mutual release, and dismissal with prejudice.',
      })
    }

    items.push({
      status: 'info',
      text: 'Demand cash or certified funds — personal checks can bounce.',
    })

    items.push({
      status: 'info',
      text: 'ALWAYS get the agreement in writing and signed by both parties before accepting payment.',
    })

    return items
  },
}
