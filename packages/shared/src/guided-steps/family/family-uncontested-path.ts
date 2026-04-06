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
      showIf: (a) => a.agree_on_terms === 'no',
    },
    {
      id: 'uncontested_steps',
      type: 'info',
      prompt:
        "UNCONTESTED DIVORCE STEPS:\n1. File Original Petition for Divorce (you already did this)\n2. Your spouse signs a Waiver of Service (no process server needed)\n3. Wait the mandatory 60 days\n4. Prepare the Final Decree of Divorce (we'll help you draft it)\n5. Both parties sign the decree\n6. Submit to the judge for approval (often without a hearing)\n7. Judge signs — you're divorced",
      showIf: (a) => a.agree_on_terms === 'yes',
    },
    {
      id: 'cost_info',
      type: 'info',
      prompt:
        'COST: An uncontested divorce in Texas can cost as little as $300-350 (just the filing fee). No attorney required.',
      showIf: (a) => a.agree_on_terms === 'yes',
    },
    {
      id: 'decree_contents_info',
      type: 'info',
      prompt:
        'WHAT MUST BE IN THE AGREED DECREE:\n- Property division (who gets what)\n- Debt allocation\n- Child custody and visitation schedule\n- Child support amount\n- Health insurance for children\n- Tax exemption allocation\n- Spousal maintenance (if any)',
      showIf: (a) => a.agree_on_terms === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.agree_on_terms === 'yes') {
      items.push({ status: 'done', text: 'Both parties agree on all terms — uncontested path available.' })
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
