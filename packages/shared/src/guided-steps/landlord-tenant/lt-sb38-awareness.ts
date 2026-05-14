import type { GuidedStepConfig } from '../types'

export const ltSb38AwarenessConfig: GuidedStepConfig = {
  title: '2026 Eviction Law Changes (SB 38)',
  reassurance:
    'Texas eviction law changed significantly on January 1, 2026, and understanding these changes is critical to protecting your rights.',

  questions: [
    {
      id: 'sb38_overview',
      type: 'info',
      prompt:
        'IMPORTANT LAW CHANGE — Texas Senate Bill 38 took effect January 1, 2026, making significant changes to eviction procedures. Key changes:',
    },
    {
      id: 'possession_only',
      type: 'info',
      prompt:
        'POSSESSION-ONLY HEARINGS — Eviction suits are now limited to the issue of possession (who gets to stay in the property). Landlords CANNOT pursue unpaid rent in the same eviction suit. If your landlord wants rent money, they must file a separate lawsuit. This protects tenants from owing a judgment AND losing their home in one proceeding.',
    },
    {
      id: 'no_counterclaims',
      type: 'info',
      prompt:
        'NO COUNTERCLAIMS IN EVICTION — Tenants can no longer file counterclaims (like habitability or security deposit claims) within an eviction suit. You must file those as separate lawsuits. This means: if you have repair/habitability claims, file them as a SEPARATE case in JP court.',
    },
    {
      id: 'summary_disposition',
      type: 'info',
      prompt:
        'SUMMARY DISPOSITION FOR SQUATTERS — New Rule 510.4(d) allows landlords to get expedited eviction of someone who was never a tenant (squatter/unauthorized occupant). The occupant must respond within 4 DAYS or face eviction without a full hearing.',
    },
    {
      id: 'is_squatter_claim',
      type: 'yes_no',
      prompt:
        'Is the landlord claiming you are an unauthorized occupant or squatter?',
    },
    {
      id: 'squatter_urgency',
      type: 'info',
      prompt:
        'URGENT — 4 DAY DEADLINE: You must respond to the Motion for Summary Disposition within 4 days. File a response explaining why you have a right to be in the property (lease, permission, prior tenancy). If you miss this deadline, the court can order eviction without a hearing.',
      showIf: (answers) => answers.is_squatter_claim === 'yes',
    },
    {
      id: 'electronic_notice',
      type: 'info',
      prompt:
        'ELECTRONIC NOTICE — Landlords can now serve notice to vacate by email IF the lease expressly permits electronic notice. Check your lease for an electronic notice clause.',
    },
    {
      id: 'good_faith_oath',
      type: 'info',
      prompt:
        'STRENGTHENED GOOD FAITH OATH — Landlords must now sign a more detailed good faith affidavit when filing. If you believe the landlord filed in bad faith (retaliation, discrimination), this may be grounds for dismissal.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Reviewed key changes under Texas SB 38 (effective January 1, 2026).',
    })

    if (answers.is_squatter_claim === 'yes') {
      items.push({
        status: 'needed',
        text: 'URGENT: Landlord is claiming you are a squatter/unauthorized occupant. You must file a response to the Motion for Summary Disposition within 4 DAYS or the court can order eviction without a hearing.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'No squatter/unauthorized occupant claim identified.',
      })
    }

    items.push({
      status: 'info',
      text: 'Eviction suits are now possession-only. Landlords cannot pursue unpaid rent in the same eviction case.',
    })

    items.push({
      status: 'info',
      text: 'Counterclaims (habitability, security deposit) must be filed as separate lawsuits.',
    })

    items.push({
      status: 'needed',
      text: 'Check your lease for an electronic notice clause — landlords can now serve notice by email if the lease permits it.',
    })

    items.push({
      status: 'info',
      text: 'If you believe the eviction was filed in bad faith (retaliation or discrimination), the strengthened good faith oath requirement may support a motion to dismiss.',
    })

    return items
  },
}
