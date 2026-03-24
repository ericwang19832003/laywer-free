import type { GuidedStepConfig } from '../types'

export const debtDefaultJudgmentRecoveryConfig: GuidedStepConfig = {
  title: "Missed Your Deadline? Here's What to Do",
  reassurance:
    'Missing a deadline feels terrible, but Texas law gives you a second chance. Act quickly — time matters.',

  questions: [
    {
      id: 'default_judgment_info',
      type: 'info',
      prompt:
        'A DEFAULT JUDGMENT means the court ruled against you because you didn\'t file an Answer on time. But you can fight it. Texas Rule of Civil Procedure 329 allows you to file a "Motion to Set Aside Default Judgment" if you have good cause.',
    },
    {
      id: 'time_since_judgment',
      type: 'single_choice',
      prompt: 'How long ago was the default judgment entered?',
      options: [
        { value: 'less_than_30_days', label: 'Less than 30 days' },
        { value: '30_to_90_days', label: '30 to 90 days' },
        { value: 'over_90_days', label: 'Over 90 days' },
      ],
    },
    {
      id: 'under_30_info',
      type: 'info',
      prompt:
        'You are within the strongest window. File a Motion to Set Aside Default Judgment under Texas Rule 329. The court must rule on it. You need to show good cause for missing the deadline and a meritorious defense to the lawsuit.',
      showIf: (answers) => answers.time_since_judgment === 'less_than_30_days',
    },
    {
      id: '30_to_90_info',
      type: 'info',
      prompt:
        'A Restricted Appeal may be possible under Texas Rule of Appellate Procedure 26.1(c). You must file within 30 days of judgment in JP court, or within 6 months in county/district court. The error must appear on the face of the record. Consult the court clerk about your exact deadline.',
      showIf: (answers) => answers.time_since_judgment === '30_to_90_days',
    },
    {
      id: 'over_90_info',
      type: 'info',
      prompt:
        'After 90 days, your primary option is a Bill of Review — an independent lawsuit to set aside the judgment. This is much harder. You must prove: (1) a meritorious defense, (2) that your failure to appear was not due to your own fault or negligence, and (3) that granting relief won\'t cause injury to the opposing party. Consider consulting an attorney for this route.',
      showIf: (answers) => answers.time_since_judgment === 'over_90_days',
    },
    {
      id: 'good_cause_info',
      type: 'info',
      prompt:
        'GOOD CAUSE EXAMPLES (Texas courts accept these):\n- You were never properly served (wrong address, served the wrong person)\n- You were sick, hospitalized, or incapacitated\n- You didn\'t understand the papers (language barrier, mental health)\n- The plaintiff\'s attorney gave you misleading information\n- You sent an answer but it was lost in the mail',
    },
    {
      id: 'properly_served',
      type: 'yes_no',
      prompt: 'Were you properly served with the lawsuit papers?',
      helpText:
        'Proper service means you personally received the papers, or they were left with someone at your home address.',
    },
    {
      id: 'improper_service_info',
      type: 'info',
      prompt:
        'Improper service is one of the strongest grounds for setting aside a default judgment. If you were not served at all, served at the wrong address, or someone else was served, the court may have never had proper jurisdiction. Gather any evidence: wrong address on service papers, affidavit from household members, proof you lived elsewhere, etc.',
      showIf: (answers) => answers.properly_served === 'no',
    },
    {
      id: 'motion_template_info',
      type: 'info',
      prompt:
        'MOTION TEMPLATE:\n\nMOTION TO SET ASIDE DEFAULT JUDGMENT\n\n[Case caption]\n\nDefendant [name] moves this Court to set aside the default judgment entered on [date] for the following reasons:\n1. Defendant was not properly served / had excusable neglect because [reason]\n2. Defendant has a meritorious defense: [list your defenses]\n3. Setting aside the judgment will not prejudice the Plaintiff.\n\nATTACHED: Affidavit of [your name] setting forth facts supporting good cause.\n\nWHEREFORE, Defendant requests this Court set aside the default judgment and allow Defendant to file an Answer.',
    },
    {
      id: 'filing_info',
      type: 'info',
      prompt:
        'FILE THIS IMMEDIATELY. Go to the court clerk\'s office or eFileTexas.gov. You must also serve the plaintiff\'s attorney. The court will set a hearing.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.time_since_judgment === 'less_than_30_days') {
      items.push({
        status: 'info',
        text: 'You are within the 30-day window. File a Motion to Set Aside Default Judgment under Texas Rule 329 as soon as possible.',
      })
    } else if (answers.time_since_judgment === '30_to_90_days') {
      items.push({
        status: 'info',
        text: 'You may qualify for a Restricted Appeal. Check your exact deadline with the court clerk.',
      })
    } else if (answers.time_since_judgment === 'over_90_days') {
      items.push({
        status: 'info',
        text: 'A Bill of Review is your remaining option. This is more difficult and you should consider consulting an attorney.',
      })
    }

    if (answers.properly_served === 'no') {
      items.push({
        status: 'info',
        text: 'Improper service is a strong ground for setting aside the judgment. Gather evidence of the service defect.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Prepare your Motion to Set Aside Default Judgment using the template provided.',
    })

    items.push({
      status: 'needed',
      text: 'File the motion with the court clerk or via eFileTexas.gov and serve the plaintiff\'s attorney.',
    })

    items.push({
      status: 'needed',
      text: 'Prepare an affidavit explaining why you missed the deadline and what defenses you have.',
    })

    return items
  },
}
