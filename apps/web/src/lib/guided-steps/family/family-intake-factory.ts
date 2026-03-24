import type { GuidedStepConfig, QuestionDef } from '../types'

type FamilySubType = 'divorce' | 'custody' | 'child_support' | 'visitation' | 'spousal_support' | 'protective_order' | 'modification'

const CASE_STAGE_OPTIONS: Record<FamilySubType, { value: string; label: string }[]> = {
  divorce: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'waiting_period', label: 'In the 60-day waiting period' },
    { value: 'temporary_orders', label: 'Dealing with temporary orders' },
    { value: 'mediation', label: 'In mediation' },
  ],
  custody: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'temporary_orders', label: 'Dealing with temporary orders' },
    { value: 'mediation', label: 'In mediation' },
  ],
  child_support: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
  ],
  visitation: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'mediation', label: 'In mediation' },
  ],
  spousal_support: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
  ],
  protective_order: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
  ],
  modification: [
    { value: 'start', label: 'Just getting started' },
    { value: 'filed', label: 'Already filed' },
    { value: 'served', label: 'Already served' },
    { value: 'mediation', label: 'In mediation' },
  ],
}

const SUB_TYPE_QUESTIONS: Record<FamilySubType, QuestionDef[]> = {
  divorce: [
    { id: 'marriage_date', type: 'text', prompt: 'When did you get married?', placeholder: 'e.g., June 2015' },
    { id: 'separation_date', type: 'text', prompt: 'When did you separate?', placeholder: 'e.g., January 2026' },
    { id: 'has_children', type: 'yes_no', prompt: 'Do you have children together?' },
    { id: 'has_community_property', type: 'yes_no', prompt: 'Do you own property or have significant debts together?' },
  ],
  custody: [
    { id: 'num_children', type: 'text', prompt: 'How many children are involved?', placeholder: 'e.g., 2' },
    { id: 'current_arrangement', type: 'single_choice', prompt: 'What is the current living arrangement?', options: [
      { value: 'with_me', label: 'Children live with me' },
      { value: 'with_other', label: 'Children live with the other parent' },
      { value: 'shared', label: 'Shared between both parents' },
      { value: 'other', label: 'Other arrangement' },
    ]},
    { id: 'existing_orders', type: 'yes_no', prompt: 'Are there existing court orders affecting custody?' },
  ],
  child_support: [
    { id: 'num_children', type: 'text', prompt: 'How many children need support?', placeholder: 'e.g., 2' },
    { id: 'employment_status', type: 'single_choice', prompt: 'What is your employment status?', options: [
      { value: 'employed_full', label: 'Employed full-time' },
      { value: 'employed_part', label: 'Employed part-time' },
      { value: 'self_employed', label: 'Self-employed' },
      { value: 'unemployed', label: 'Unemployed' },
    ]},
    { id: 'existing_support_order', type: 'yes_no', prompt: 'Is there an existing child support order?' },
  ],
  visitation: [
    { id: 'num_children', type: 'text', prompt: 'How many children are involved?', placeholder: 'e.g., 2' },
    { id: 'current_custody', type: 'single_choice', prompt: 'What is the current custody arrangement?', options: [
      { value: 'other_parent', label: 'Other parent has primary custody' },
      { value: 'shared', label: 'Shared custody' },
      { value: 'no_order', label: 'No formal custody order' },
    ]},
    { id: 'relationship', type: 'single_choice', prompt: 'What is your relationship to the children?', options: [
      { value: 'parent', label: 'Parent' },
      { value: 'grandparent', label: 'Grandparent' },
      { value: 'other_relative', label: 'Other relative' },
    ]},
  ],
  spousal_support: [
    { id: 'marriage_date', type: 'text', prompt: 'When did you get married?', placeholder: 'e.g., June 2010' },
    { id: 'marriage_duration', type: 'single_choice', prompt: 'How long have you been married?', options: [
      { value: 'under_10', label: 'Less than 10 years' },
      { value: '10_to_20', label: '10 to 20 years' },
      { value: '20_to_30', label: '20 to 30 years' },
      { value: 'over_30', label: 'More than 30 years' },
    ]},
    { id: 'employment_status', type: 'single_choice', prompt: 'What is your employment status?', options: [
      { value: 'employed_full', label: 'Employed full-time' },
      { value: 'employed_part', label: 'Employed part-time' },
      { value: 'unemployed', label: 'Unemployed' },
      { value: 'disabled', label: 'Unable to work due to disability' },
    ]},
  ],
  protective_order: [
    { id: 'relationship_to_respondent', type: 'single_choice', prompt: 'What is your relationship to the person you need protection from?', options: [
      { value: 'spouse', label: 'Spouse or ex-spouse' },
      { value: 'partner', label: 'Dating partner or ex-partner' },
      { value: 'family_member', label: 'Family member' },
      { value: 'household_member', label: 'Household member' },
    ]},
    { id: 'type_of_abuse', type: 'single_choice', prompt: 'What type of abuse have you experienced?', options: [
      { value: 'physical', label: 'Physical violence' },
      { value: 'threat', label: 'Threats of violence' },
      { value: 'sexual', label: 'Sexual assault' },
      { value: 'stalking', label: 'Stalking' },
      { value: 'multiple', label: 'Multiple types' },
    ]},
    { id: 'immediate_danger', type: 'yes_no', prompt: 'Are you in immediate danger right now?' },
    { id: 'immediate_danger_info', type: 'info', prompt: 'If you are in immediate danger, call 911 now. You can also contact the National Domestic Violence Hotline at 1-800-799-7233.', showIf: (a) => a.immediate_danger === 'yes' },
  ],
  modification: [
    { id: 'existing_court', type: 'text', prompt: 'Which court issued the existing order?', placeholder: 'e.g., 256th District Court, Dallas County' },
    { id: 'cause_number', type: 'text', prompt: 'What is the cause number of the existing order?', placeholder: 'e.g., DF-2024-12345' },
    { id: 'what_to_modify', type: 'single_choice', prompt: 'What do you want to modify?', options: [
      { value: 'custody', label: 'Custody / conservatorship' },
      { value: 'visitation', label: 'Visitation / possession schedule' },
      { value: 'child_support', label: 'Child support amount' },
      { value: 'multiple', label: 'Multiple provisions' },
    ]},
    { id: 'change_circumstances', type: 'text', prompt: 'Briefly describe the change in circumstances.', placeholder: 'e.g., I got a new job and relocated...' },
  ],
}

const TITLES: Record<FamilySubType, string> = {
  divorce: 'Divorce Intake',
  custody: 'Custody Intake',
  child_support: 'Child Support Intake',
  visitation: 'Visitation Intake',
  spousal_support: 'Spousal Support Intake',
  protective_order: 'Protective Order Intake',
  modification: 'Modification Intake',
}

const REASSURANCES: Record<FamilySubType, string> = {
  divorce: 'These details help us tailor your divorce case. Take your time — accuracy matters more than speed.',
  custody: 'Understanding your family situation helps us guide you to the right custody arrangement.',
  child_support: 'These details help us calculate appropriate support and guide you through the process.',
  visitation: 'Understanding your situation helps us craft a visitation schedule that serves the children\'s best interests.',
  spousal_support: 'These details help us assess spousal support eligibility and guide your case.',
  protective_order: 'Your safety is our top priority. These details help us prepare the strongest possible application.',
  modification: 'Understanding the existing order and what changed helps us build a strong modification case.',
}

export function createFamilyIntakeConfig(subType: FamilySubType): GuidedStepConfig {
  const questions: QuestionDef[] = [
    {
      id: 'county',
      type: 'text',
      prompt: 'Which Texas county will you file in?',
      helpText: 'Family cases are usually filed where you or the other party has lived for at least 90 days.',
      placeholder: 'e.g., Harris County',
    },
    {
      id: 'case_stage',
      type: 'single_choice',
      prompt: 'Where are you in the process?',
      helpText: 'If you\'ve already started your case, we can skip ahead to where you are.',
      options: CASE_STAGE_OPTIONS[subType],
    },
    ...(subType !== 'protective_order' ? [{
      id: 'contested',
      type: 'single_choice' as const,
      prompt: 'Is this contested or uncontested?',
      helpText: 'Uncontested means both parties agree on the terms. Contested means there are disagreements that the court will need to resolve.',
      options: [
        { value: 'contested', label: 'Contested — we disagree on terms' },
        { value: 'uncontested', label: 'Uncontested — we agree on terms' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
    }] : []),
    ...SUB_TYPE_QUESTIONS[subType],
  ]

  return {
    title: TITLES[subType],
    reassurance: REASSURANCES[subType],
    questions,
    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      if (answers.county) {
        items.push({ status: 'done', text: `Filing county: ${answers.county}` })
      } else {
        items.push({ status: 'needed', text: 'Determine which county to file in.' })
      }

      if (answers.case_stage && answers.case_stage !== 'start') {
        items.push({ status: 'info', text: `Case stage: ${answers.case_stage}. We'll skip ahead to where you are.` })
      }

      if (answers.contested === 'uncontested') {
        items.push({ status: 'info', text: 'Uncontested case — this typically moves faster.' })
      } else if (answers.contested === 'contested') {
        items.push({ status: 'info', text: 'Contested case — prepare for a more involved process.' })
      }

      if (subType === 'protective_order' && answers.immediate_danger === 'yes') {
        items.push({ status: 'needed', text: 'URGENT: You indicated immediate danger. Call 911 or the DV Hotline: 1-800-799-7233.' })
      }

      if (subType === 'modification' && answers.cause_number) {
        items.push({ status: 'done', text: `Existing order cause number: ${answers.cause_number}` })
      }

      items.push({ status: 'info', text: 'Your intake is complete. The next steps are tailored to your specific situation.' })

      return items
    },
  }
}
