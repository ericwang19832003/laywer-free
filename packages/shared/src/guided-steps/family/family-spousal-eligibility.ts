import type { GuidedStepConfig } from '../types'

export const spousalEligibilityConfig: GuidedStepConfig = {
  title: 'Spousal Support Eligibility',
  reassurance:
    'Texas has two types of spousal support. Understanding the difference helps you know what to ask for — or negotiate.',
  questions: [
    // 1. Info: explain the two types
    {
      id: 'types_overview',
      type: 'info',
      prompt:
        'Texas recognizes TWO types of spousal support:\n\n' +
        '• Court-ordered maintenance (Texas Family Code § 8.051) — strict eligibility requirements, capped at $5,000/month or 20% of the paying spouse\'s gross monthly income (whichever is less). The court must find the requesting spouse lacks sufficient property and meets a qualifying circumstance.\n\n' +
        '• Contractual alimony — agreed to by the spouses (in a decree or settlement). No eligibility test, no statutory cap, but very hard to modify later. Think of it like a contract, not a court order.',
    },

    // 2. Financial need
    {
      id: 'financial_need',
      type: 'yes_no',
      prompt:
        'After the property division, will you lack sufficient property — including separate property — to meet your minimum reasonable needs?',
      helpText:
        'This is the threshold question for court-ordered maintenance. The court looks at whether the property you receive in the divorce is enough to provide for your basic needs.',
    },

    // 3. If no financial need → contractual alimony info
    {
      id: 'no_need_info',
      type: 'info',
      prompt:
        'Even without financial need, you can still negotiate contractual alimony as part of your settlement. Many spouses agree to contractual alimony to balance an uneven property division or ease a transition. Since it\'s contractual, there are no eligibility requirements — only what both parties agree to.',
      showIf: (a) => a.financial_need === 'no',
    },

    // 4. Qualifying circumstance
    {
      id: 'qualifying_circumstance',
      type: 'single_choice',
      prompt: 'Which qualifying circumstance applies to your situation?',
      helpText:
        'Court-ordered maintenance requires at least one of these circumstances in addition to financial need.',
      options: [
        {
          value: 'violence',
          label:
            'Family violence — spouse was convicted of or received deferred adjudication for a family violence offense within 2 years before filing or while the divorce is pending',
        },
        {
          value: 'ten_years',
          label: 'Married 10 years or longer and unable to earn sufficient income',
        },
        {
          value: 'disability',
          label:
            'Incapacitating physical or mental disability that prevents self-support',
        },
        {
          value: 'disabled_child',
          label:
            'Primary caretaker of a child (of the marriage) who requires substantial care due to a physical or mental disability',
        },
        { value: 'none', label: 'None of these apply' },
      ],
      showIf: (a) => a.financial_need === 'yes',
    },

    // 5. If none or no financial_need → may not qualify, but contractual alimony available
    {
      id: 'not_eligible_info',
      type: 'info',
      prompt:
        'Based on your answers, you likely do not qualify for court-ordered maintenance under Texas Family Code § 8.051. However, contractual alimony remains available — it can be negotiated as part of your divorce settlement with no eligibility test or statutory caps. Many divorces include contractual alimony even when court-ordered maintenance is unavailable.',
      showIf: (a) =>
        a.financial_need === 'yes' && a.qualifying_circumstance === 'none',
    },

    // 6. If eligible → duration limits
    {
      id: 'duration_info',
      type: 'info',
      prompt:
        'Court-ordered maintenance has duration limits based on your circumstance:\n\n' +
        '• Family violence conviction — maximum 5 years\n' +
        '• Married 10–20 years — maximum 5 years\n' +
        '• Married 20–30 years — maximum 7 years\n' +
        '• Married 30+ years — maximum 10 years\n' +
        '• Disability (spouse or child) — no statutory maximum; continues as long as the disability exists\n\n' +
        'The court may order a shorter duration if it finds the requesting spouse can become self-supporting sooner.',
      showIf: (a) =>
        a.financial_need === 'yes' &&
        !!a.qualifying_circumstance &&
        a.qualifying_circumstance !== 'none',
    },

    // 7. If eligible → amount cap and termination triggers
    {
      id: 'amount_cap_info',
      type: 'info',
      prompt:
        'Court-ordered maintenance is capped at the lesser of:\n' +
        '• $5,000 per month, OR\n' +
        '• 20% of the paying spouse\'s average monthly gross income\n\n' +
        'Maintenance automatically terminates upon:\n' +
        '• Death of either spouse\n' +
        '• Remarriage of the receiving spouse\n' +
        '• Cohabitation — the receiving spouse lives with a romantic partner in a permanent place of abode on a continuing, conjugal basis',
      showIf: (a) =>
        a.financial_need === 'yes' &&
        !!a.qualifying_circumstance &&
        a.qualifying_circumstance !== 'none',
    },

    // 8. If ten_years → diligent efforts requirement
    {
      id: 'self_sufficiency_info',
      type: 'info',
      prompt:
        'Because your eligibility is based on a 10+ year marriage, the court will expect you to make diligent efforts toward becoming self-supporting during the maintenance period. This includes pursuing employment, education, or job training. The court can reduce or terminate maintenance if you are not making a good-faith effort toward self-sufficiency.',
      showIf: (a) =>
        a.financial_need === 'yes' &&
        a.qualifying_circumstance === 'ten_years',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const hasNeed = answers.financial_need === 'yes'
    const circumstance = answers.qualifying_circumstance
    const eligible =
      hasNeed && !!circumstance && circumstance !== 'none'

    if (!hasNeed) {
      items.push({
        status: 'info',
        text: 'Court-ordered maintenance unlikely — no showing of financial need after property division.',
      })
      items.push({
        status: 'info',
        text: 'Contractual alimony is still available through negotiation with no eligibility requirements.',
      })
      return items
    }

    if (!eligible) {
      items.push({
        status: 'info',
        text: 'Financial need exists, but no qualifying circumstance for court-ordered maintenance under § 8.051.',
      })
      items.push({
        status: 'info',
        text: 'Contractual alimony remains available — negotiate as part of your settlement.',
      })
      return items
    }

    // Eligible for court-ordered maintenance
    items.push({
      status: 'done',
      text: 'You likely qualify for court-ordered spousal maintenance under Texas Family Code § 8.051.',
    })

    // Duration
    const durationMap: Record<string, string> = {
      violence: 'up to 5 years',
      ten_years: 'up to 5 years (10–20 yr marriage), 7 years (20–30 yr), or 10 years (30+ yr)',
      disability: 'indefinite — as long as the disability continues',
      disabled_child: 'indefinite — as long as the child requires substantial care',
    }
    if (circumstance && durationMap[circumstance]) {
      items.push({
        status: 'info',
        text: `Duration limit: ${durationMap[circumstance]}.`,
      })
    }

    // Amount cap
    items.push({
      status: 'info',
      text: 'Amount cap: lesser of $5,000/month or 20% of paying spouse\'s gross monthly income.',
    })

    // Self-sufficiency note for ten_years
    if (circumstance === 'ten_years') {
      items.push({
        status: 'needed',
        text: 'You must demonstrate diligent efforts toward self-sufficiency during the maintenance period.',
      })
    }

    // Termination triggers
    items.push({
      status: 'info',
      text: 'Terminates automatically on remarriage, cohabitation with a romantic partner, or death of either spouse.',
    })

    return items
  },
}
