import type { GuidedStepConfig } from '../types'

export const uccjeaAffidavitConfig: GuidedStepConfig = {
  title: 'UCCJEA Affidavit',
  reassurance:
    'This affidavit is a standard part of every custody filing — it helps the court confirm Texas is the right state to hear your case. We will walk through it together, one piece at a time.',

  questions: [
    {
      id: 'uccjea_intro',
      type: 'info',
      prompt:
        'The UCCJEA (Uniform Child Custody Jurisdiction and Enforcement Act) affidavit is required in every initial custody case in Texas (Tex. Fam. Code § 152.209). It tells the court where your child has lived, whether any other custody cases exist, and whether anyone else claims rights to your child. Every parent filing a SAPCR must complete one — this is not optional, but it is straightforward. Let\u2019s go through the information you\u2019ll need.',
    },
    {
      id: 'child_current_state',
      type: 'single_choice',
      prompt: 'Has your child lived in Texas for at least the last 6 months?',
      helpText:
        'Texas must be the child\u2019s "home state" to have jurisdiction. That generally means the child has lived here for 6 consecutive months (or since birth, for infants) before filing.',
      options: [
        { value: 'yes', label: 'Yes — my child has lived in Texas for 6 or more months' },
        { value: 'infant', label: 'My child was born in Texas and has lived here since birth' },
        { value: 'recently_moved', label: 'We moved to Texas less than 6 months ago' },
        { value: 'no', label: 'My child does not currently live in Texas' },
      ],
    },
    {
      id: 'jurisdiction_warning',
      type: 'info',
      prompt:
        'Because your child has not lived in Texas for at least 6 months, Texas may not have jurisdiction over your custody case. This does not mean you are out of options, but it is important to understand before you file. Filing in the wrong state can cause delays or dismissal. We strongly recommend consulting with a family law attorney or your local legal aid office to confirm which state has jurisdiction before proceeding.',
      showIf: (a) => a.child_current_state === 'recently_moved' || a.child_current_state === 'no',
    },
    {
      id: 'addresses_prepared',
      type: 'yes_no',
      prompt: 'Are you able to list every address where your child has lived for the past 5 years?',
      helpText:
        'The affidavit requires a complete list of every place your child has lived over the last 5 years. For each address, you\u2019ll need: the full street address, the dates your child lived there, and the names of every person the child lived with at that address.',
    },
    {
      id: 'addresses_help',
      type: 'info',
      prompt:
        'That\u2019s okay — many parents need a little time to gather this information. Before you can complete the affidavit, you\u2019ll need to put together:\n\n\u2022 The full street address of every place your child has lived in the past 5 years\n\u2022 The approximate dates your child lived at each address (month and year is fine)\n\u2022 The names of every adult and child who lived in the home during that time\n\nTip: Check old lease agreements, utility bills, school enrollment records, or your own address book to help jog your memory. Take your time — accuracy matters more than speed.',
      showIf: (a) => a.addresses_prepared === 'no',
    },
    {
      id: 'other_proceedings',
      type: 'yes_no',
      prompt: 'Are you aware of any other custody proceedings involving your child — in any state?',
      helpText:
        'This includes any current or past court cases about custody, visitation, or conservatorship, in Texas or any other state. It also includes CPS or DFPS investigations.',
    },
    {
      id: 'other_proceedings_info',
      type: 'info',
      prompt:
        'You are required to disclose every custody-related proceeding you know about. This includes:\n\n\u2022 Any pending custody, visitation, or conservatorship case in any state\n\n\u2022 Any prior court orders about custody or visitation (even if they\u2019re old)\n\n\u2022 Any CPS or DFPS investigation, past or present\n\nBe thorough — failing to disclose a proceeding can seriously hurt your credibility with the judge. If you\u2019re unsure whether something counts, include it. It is always better to over-disclose than to leave something out.',
      showIf: (a) => a.other_proceedings === 'yes',
    },
    {
      id: 'other_claims',
      type: 'yes_no',
      prompt: 'Does anyone other than you and the other parent claim custody or visitation rights to your child?',
      helpText:
        'This could include grandparents, aunts, uncles, stepparents, foster parents, or anyone else who has been involved in caring for your child.',
    },
    {
      id: 'other_claims_info',
      type: 'info',
      prompt:
        'You must disclose every person who claims a right to custody or visitation. This includes:\n\n\u2022 Grandparents who have been providing regular care\n\n\u2022 Other relatives who have had the child living with them\n\n\u2022 Non-parent caregivers (stepparents, family friends, foster parents)\n\nFor each person, you\u2019ll need their name, their relationship to your child, and the basis of their claim. The court needs this information to make sure all interested parties are properly notified.',
      showIf: (a) => a.other_claims === 'yes',
    },
    {
      id: 'continuing_duty',
      type: 'info',
      prompt:
        'One last important thing: your duty to update this affidavit does not end when you file it. Under § 152.209, you have a continuing obligation to inform the court if any of the information in your affidavit changes — for example, if you move, if a new custody case is filed in another state, or if someone new claims rights to your child. Keep the court informed, and you\u2019ll stay in good standing.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Jurisdiction status
    if (answers.child_current_state === 'yes' || answers.child_current_state === 'infant') {
      items.push({ status: 'done', text: 'Texas appears to have home-state jurisdiction.' })
    } else if (answers.child_current_state === 'recently_moved') {
      items.push({ status: 'needed', text: 'Texas may lack jurisdiction — child has lived here less than 6 months. Consult an attorney.' })
    } else if (answers.child_current_state === 'no') {
      items.push({ status: 'needed', text: 'Texas may lack jurisdiction — child does not live in Texas. Consult an attorney before filing.' })
    }

    // Address preparation
    if (answers.addresses_prepared === 'yes') {
      items.push({ status: 'done', text: 'Address history for the past 5 years is ready.' })
    } else if (answers.addresses_prepared === 'no') {
      items.push({ status: 'needed', text: 'Gather 5-year address history (addresses, dates, household members) before completing the affidavit.' })
    }

    // Other proceedings
    if (answers.other_proceedings === 'yes') {
      items.push({ status: 'needed', text: 'Disclose all other custody proceedings, prior orders, and CPS investigations in the affidavit.' })
    } else if (answers.other_proceedings === 'no') {
      items.push({ status: 'done', text: 'No other custody proceedings to disclose.' })
    }

    // Other claims
    if (answers.other_claims === 'yes') {
      items.push({ status: 'needed', text: 'List all persons claiming custody or visitation rights in the affidavit.' })
    } else if (answers.other_claims === 'no') {
      items.push({ status: 'done', text: 'No other persons claim custody or visitation rights.' })
    }

    // Always remind about continuing duty
    items.push({ status: 'info', text: 'Remember: you must update the court if any of this information changes after filing (§ 152.209).' })

    return items
  },
}
