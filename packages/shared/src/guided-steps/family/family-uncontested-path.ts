import type { GuidedStepConfig } from '../types'

export const familyUncontestedPathConfig: GuidedStepConfig = {
  title: 'Uncontested Divorce — The Fast Track',
  reassurance:
    'An uncontested divorce is the fastest, cheapest, and least stressful path. If you and your spouse agree, you can be divorced in as little as 61 days.',

  questions: [
    {
      id: 'uncontested_overview',
      type: 'info',
      prompt:
        "An uncontested divorce means you and your spouse AGREE on everything: property division, custody, support, and debts. It's faster, cheaper, and less stressful.",
      acknowledgeLabel: 'I understand the uncontested process →',
    },
    {
      id: 'agree_on_terms',
      type: 'yes_no',
      prompt: 'Do you and your spouse agree on all terms?',
    },
    {
      id: 'contested_info',
      type: 'info',
      prompt:
        "If you disagree on any issue, your case is 'contested.' You'll need mediation and potentially a trial. Continue with the standard path.",
      acknowledgeLabel: 'Understood — I\'ll take the contested path →',
      showIf: (a) => a.agree_on_terms === 'no',
    },
    {
      id: 'uncontested_steps',
      type: 'info',
      prompt:
        "UNCONTESTED DIVORCE STEPS:\n1. File Original Petition for Divorce (you already did this)\n2. Your spouse signs a Waiver of Service (no process server needed)\n3. Wait the mandatory 60 days\n4. Prepare the Final Decree of Divorce (we'll help you draft it)\n5. Both parties sign the decree\n6. Submit to the judge for approval (often without a hearing)\n7. Judge signs — you're divorced",
      acknowledgeLabel: 'Got my steps — let\'s proceed →',
      showIf: (a) => a.agree_on_terms === 'yes',
    },
    {
      id: 'cost_info',
      type: 'info',
      prompt:
        'COST: An uncontested divorce in Texas can cost as little as $300-350 (just the filing fee). No attorney required.',
      acknowledgeLabel: 'Great — I\'m ready to move forward →',
      showIf: (a) => a.agree_on_terms === 'yes',
    },
    {
      id: 'decree_provisions_agreed',
      type: 'multi_select',
      prompt: 'Which of these provisions have you and your spouse agreed on?',
      options: [
        { value: 'property_division', label: 'Property division (who gets what)' },
        { value: 'debt_allocation', label: 'Debt allocation (who pays which debts)' },
        { value: 'custody_visitation', label: 'Child custody and visitation schedule' },
        { value: 'child_support', label: 'Child support amount' },
        { value: 'health_insurance', label: 'Health insurance for the children' },
        { value: 'tax_exemption', label: 'Tax exemption allocation' },
        { value: 'spousal_maintenance', label: 'Spousal maintenance (if any)' },
      ],
      noneLabel: "Haven't discussed all of these yet",
      showIf: (a) => a.agree_on_terms === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.agree_on_terms === 'yes') {
      items.push({ status: 'done', text: 'Both parties agree on all terms — uncontested path available.' })

      const agreedProvisions = answers.decree_provisions_agreed
        ? answers.decree_provisions_agreed.split(',').filter((v: string) => v && v !== 'none')
        : []
      const requiredProvisions = ['property_division', 'debt_allocation', 'custody_visitation', 'child_support', 'health_insurance', 'tax_exemption']
      const missing = requiredProvisions.filter(p => !agreedProvisions.includes(p))
      if (agreedProvisions.length > 0 && missing.length === 0) {
        items.push({ status: 'done', text: 'All required decree provisions agreed on.' })
      } else if (agreedProvisions.length > 0) {
        items.push({ status: 'needed', text: `${missing.length} required decree provision(s) still need agreement before filing.` })
      }

      items.push({ status: 'needed', text: 'Have your spouse sign a Waiver of Service.' })
      items.push({ status: 'needed', text: 'Prepare the Final Decree of Divorce with all agreed terms.' })
      items.push({ status: 'info', text: 'Wait the mandatory 60-day cooling-off period, then submit the decree to the judge.' })
      items.push({ status: 'info', text: 'Total cost can be as low as $300-350 (filing fee only).' })
    } else {
      items.push({ status: 'info', text: 'Your case is contested. You will need mediation and potentially a trial.' })
      items.push({ status: 'needed', text: 'Continue with the standard contested divorce path.' })
    }

    return items
  },
}
