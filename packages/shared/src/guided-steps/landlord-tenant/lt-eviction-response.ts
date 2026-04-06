import type { GuidedStepConfig } from '../types'

export const ltEvictionResponseConfig: GuidedStepConfig = {
  title: 'Respond to Eviction Notice',
  reassurance:
    'Receiving an eviction notice is stressful, but you have legal rights and options. Many evictions can be contested.',

  questions: [
    {
      id: 'notice_type',
      type: 'single_choice',
      prompt: 'What type of eviction notice did you receive?',
      options: [
        { value: 'three_day_pay_or_quit', label: '3-day notice to pay or quit' },
        { value: 'thirty_day_notice', label: '30-day notice to vacate' },
        { value: 'notice_to_vacate', label: 'Notice to vacate (other)' },
        { value: 'court_citation', label: 'Court citation / lawsuit filed' },
      ],
    },
    {
      id: 'info_three_day',
      type: 'info',
      prompt:
        'A 3-day notice to pay or quit means you have 3 days to pay the overdue rent or move out. If you pay in full within 3 days, the landlord cannot proceed with eviction. The notice must be delivered in writing.',
      helpText:
        'The 3-day period does not include the day the notice was delivered.',
      showIf: (answers) => answers.notice_type === 'three_day_pay_or_quit',
    },
    {
      id: 'info_thirty_day',
      type: 'info',
      prompt:
        'A 30-day notice is typically used for month-to-month tenancies. Your landlord must give at least 30 days\u2019 written notice before you are required to leave, unless your lease specifies a different period.',
      helpText:
        'Check your lease for the specific notice period required.',
      showIf: (answers) => answers.notice_type === 'thirty_day_notice',
    },
    {
      id: 'info_notice_to_vacate',
      type: 'info',
      prompt:
        'Under Texas Property Code § 24.005, a landlord must give written notice to vacate before filing an eviction suit. The default notice period is 3 days unless the lease states otherwise.',
      helpText:
        'If the notice was not properly delivered or did not allow enough time, this may be a defense.',
      showIf: (answers) => answers.notice_type === 'notice_to_vacate',
    },
    {
      id: 'info_court_citation',
      type: 'info',
      prompt:
        'A court citation means an eviction lawsuit has been filed. You must appear at the hearing or the judge may rule against you by default. You typically have 10–21 days before the hearing in Justice of the Peace court.',
      helpText:
        'Do not ignore court papers. Even if you plan to move, appearing protects your rights.',
      showIf: (answers) => answers.notice_type === 'court_citation',
    },
    {
      id: 'is_retaliatory',
      type: 'yes_no',
      prompt: 'Do you believe the eviction is retaliatory?',
      helpText:
        'Texas Property Code § 92.331 protects tenants from retaliation for requesting repairs or exercising legal rights.',
    },
    {
      id: 'info_retaliation',
      type: 'info',
      prompt:
        'If the eviction is in response to you requesting repairs, reporting code violations, or exercising other legal rights, it may be retaliatory and illegal under Texas Property Code § 92.331. Document the timeline showing your protected activity and the eviction notice.',
      helpText:
        'A retaliation defense is strongest when the eviction closely follows your protected activity.',
      showIf: (answers) => answers.is_retaliatory === 'yes',
    },
    {
      id: 'served_court_papers',
      type: 'yes_no',
      prompt: 'Have you been served with court papers?',
    },
    {
      id: 'know_hearing_date',
      type: 'yes_no',
      prompt: 'Do you know your hearing date?',
      helpText:
        'Eviction hearings in JP court are typically set within 10–21 days of filing.',
      showIf: (answers) => answers.served_court_papers === 'yes',
    },
    {
      id: 'main_defense',
      type: 'single_choice',
      prompt: 'What is your main defense?',
      options: [
        { value: 'paid_rent', label: 'I paid the rent' },
        { value: 'improper_notice', label: 'Improper notice from landlord' },
        { value: 'retaliation', label: 'Retaliation for exercising my rights' },
        { value: 'habitability', label: 'Uninhabitable conditions' },
        { value: 'discrimination', label: 'Discrimination' },
        { value: 'none_yet', label: 'I\u2019m not sure yet' },
      ],
    },
    {
      id: 'info_defense_paid_rent',
      type: 'info',
      prompt:
        'If you paid the rent, gather all proof of payment: bank statements, receipts, cancelled checks, money order stubs, or Venmo/Zelle records. Bring these to court.',
      showIf: (answers) => answers.main_defense === 'paid_rent',
    },
    {
      id: 'info_defense_improper_notice',
      type: 'info',
      prompt:
        'Texas law has strict requirements for eviction notices. The notice must be in writing, delivered properly (in person, by mail, or posted on the door), and allow the correct number of days. If any requirement was missed, the eviction may be dismissed.',
      showIf: (answers) => answers.main_defense === 'improper_notice',
    },
    {
      id: 'info_defense_retaliation',
      type: 'info',
      prompt:
        'Under Texas Property Code § 92.331, a landlord may not retaliate against a tenant for requesting repairs, filing complaints, or exercising legal rights. Document the timeline of your protected activity and the eviction notice.',
      showIf: (answers) => answers.main_defense === 'retaliation',
    },
    {
      id: 'info_defense_habitability',
      type: 'info',
      prompt:
        'If the property has serious habitability issues (no water, no heat, sewage problems, etc.), you may have a defense or counterclaim under Texas Property Code § 92.052. Document all conditions with photos and written communications.',
      showIf: (answers) => answers.main_defense === 'habitability',
    },
    {
      id: 'info_defense_discrimination',
      type: 'info',
      prompt:
        'The Fair Housing Act prohibits evictions based on race, color, national origin, religion, sex, familial status, or disability. If you believe discrimination is a factor, contact the Texas Workforce Commission Civil Rights Division or HUD.',
      showIf: (answers) => answers.main_defense === 'discrimination',
    },
    {
      id: 'info_defense_none_yet',
      type: 'info',
      prompt:
        'It\u2019s okay to not be sure yet. Review your lease, gather all documents, and consider consulting a legal aid organization. The most common defenses are: rent was paid, notice was improper, or the eviction is retaliatory.',
      showIf: (answers) => answers.main_defense === 'none_yet',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const noticeLabels: Record<string, string> = {
      three_day_pay_or_quit: '3-day notice to pay or quit',
      thirty_day_notice: '30-day notice to vacate',
      notice_to_vacate: 'Notice to vacate',
      court_citation: 'Court citation',
    }
    if (answers.notice_type) {
      items.push({
        status: 'info',
        text: `Notice type: ${noticeLabels[answers.notice_type] ?? answers.notice_type}.`,
      })
    }

    if (answers.is_retaliatory === 'yes') {
      items.push({
        status: 'info',
        text: 'You believe the eviction may be retaliatory. Document the timeline of your protected activity.',
      })
    }

    if (answers.served_court_papers === 'yes') {
      items.push({ status: 'done', text: 'Court papers received.' })
      if (answers.know_hearing_date === 'yes') {
        items.push({ status: 'done', text: 'Hearing date identified.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Find your hearing date on the court citation. Mark it on your calendar and plan to attend.',
        })
      }
    } else {
      items.push({
        status: 'info',
        text: 'No court papers yet. Monitor for a court citation, which must be served before an eviction hearing.',
      })
    }

    const defenseLabels: Record<string, string> = {
      paid_rent: 'Rent was paid — gather all proof of payment.',
      improper_notice: 'Improper notice — review notice requirements under Texas law.',
      retaliation: 'Retaliation defense — document timeline of protected activity.',
      habitability: 'Habitability defense — document conditions with photos and communications.',
      discrimination: 'Discrimination defense — contact TWC Civil Rights Division or HUD.',
      none_yet: 'Defense not yet identified — review your lease and gather all documents.',
    }
    if (answers.main_defense) {
      items.push({
        status: answers.main_defense === 'none_yet' ? 'needed' : 'info',
        text: defenseLabels[answers.main_defense] ?? 'Review your available defenses.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Do not ignore the eviction process. Appear at all hearings to protect your rights.',
    })

    return items
  },
}
