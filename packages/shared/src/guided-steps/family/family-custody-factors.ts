import type { GuidedStepConfig } from '../types'

export const familyCustodyFactorsConfig: GuidedStepConfig = {
  title: 'Understanding Custody Decisions in Texas',
  reassurance:
    'Custody decisions follow specific legal factors. Understanding what judges look for helps you build the strongest case for your children.',

  questions: [
    {
      id: 'best_interest_factors',
      type: 'info',
      prompt:
        "Texas courts decide custody based on the 'best interest of the child' (Tex. Fam. Code \u00A7153.002). The 8 factors judges consider most:\n1. Child's physical and emotional needs now and in the future\n2. Danger to the child (physical or emotional)\n3. Parenting abilities of each parent\n4. Programs available to help each parent\n5. Plans each parent has for the child\n6. Stability of the proposed home\n7. Any acts or omissions by a parent showing poor judgment\n8. Child's own wishes (if 12+ years old)",
    },
    {
      id: 'primary_caretaker',
      type: 'single_choice',
      prompt: 'Which parent has been the primary caretaker?',
      options: [
        { value: 'me', label: 'Me' },
        { value: 'other_parent', label: 'The other parent' },
        { value: 'equal', label: 'We share equally' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    },
    {
      id: 'primary_me_info',
      type: 'info',
      prompt:
        "As the primary caretaker, you have a strong position. Document your involvement: school pickups, doctor appointments, meal preparation, homework help, bedtime routines. Courts favor continuity and stability for the child. Gather records that show your consistent involvement.",
      showIf: (a) => a.primary_caretaker === 'me',
    },
    {
      id: 'primary_other_info',
      type: 'info',
      prompt:
        "Even if the other parent has been the primary caretaker, you can still pursue meaningful custody. Focus on: your bond with the child, your ability to provide a stable home, your plans for involvement going forward. Courts want both parents involved when it's safe to do so.",
      showIf: (a) => a.primary_caretaker === 'other_parent',
    },
    {
      id: 'primary_equal_info',
      type: 'info',
      prompt:
        "Equal involvement is a strong basis for Joint Managing Conservatorship. Document your shared responsibilities and propose a schedule that maintains the child's routine. Courts favor arrangements that keep both parents actively involved.",
      showIf: (a) => a.primary_caretaker === 'equal',
    },
    {
      id: 'primary_unsure_info',
      type: 'info',
      prompt:
        "Start documenting your involvement now. Keep a log of: meals prepared, school events attended, medical appointments, activities, and daily care. This evidence will be important for the court.",
      showIf: (a) => a.primary_caretaker === 'unsure',
    },
    {
      id: 'custody_types_info',
      type: 'info',
      prompt:
        "TYPES OF CUSTODY IN TEXAS:\n- Joint Managing Conservatorship (JMC): Both parents share decision-making. This is the DEFAULT. One parent has 'primary' residence.\n- Sole Managing Conservatorship (SMC): One parent has exclusive decision-making. Only granted when JMC would endanger the child.\n- Possessory Conservatorship: The non-primary parent's visitation schedule.",
    },
    {
      id: 'spo_info',
      type: 'info',
      prompt:
        "STANDARD POSSESSION ORDER (SPO):\nThis is Texas's default visitation schedule:\n- 1st, 3rd, and 5th weekends (Friday 6pm to Sunday 6pm)\n- Thursday evenings (6-8pm)\n- Alternating holidays\n- 30 days in summer\n\nYou can deviate from the SPO if both parties agree or if you show the court why a different schedule serves the child's best interests.",
    },
    {
      id: 'parent_distance',
      type: 'single_choice',
      prompt: 'How far apart do the parents live (or expect to live)?',
      options: [
        { value: 'under_50', label: 'Less than 50 miles apart' },
        { value: '50_to_100', label: '50–100 miles apart' },
        { value: 'over_100', label: 'More than 100 miles apart' },
      ],
    },
    {
      id: 'spo_under_50',
      type: 'info',
      prompt: 'EXPANDED SPO (default for parents within 50 miles):\n\u2022 Weekends: 1st, 3rd, 5th — Friday at school dismissal through Monday at school resumption\n\u2022 Thursdays: School dismissal through Friday at school resumption (overnight)\n\u2022 Spring break: Alternates yearly\n\u2022 Summer: 30 days (can split into two 7+ day periods, notify by April 1)\n\u2022 Holidays override the regular schedule and alternate by odd/even year\n\u2022 Monday holidays: Possession extends through Tuesday 8 a.m. if Monday is a school holiday',
      showIf: (a) => a.parent_distance === 'under_50',
    },
    {
      id: 'spo_50_to_100',
      type: 'info',
      prompt: 'STANDARD SPO (50–100 miles):\n\u2022 Weekends: 1st, 3rd, 5th — Friday 6 p.m. through Sunday 6 p.m.\n\u2022 Thursdays: 6 p.m. to 8 p.m. (no overnight)\n\u2022 Spring break: Alternates yearly\n\u2022 Summer: 30 days\n\u2022 You may ELECT expanded times (school pickup/dropoff instead of 6 p.m.) — notify the court',
      showIf: (a) => a.parent_distance === '50_to_100',
    },
    {
      id: 'spo_over_100',
      type: 'info',
      prompt: 'LONG-DISTANCE SPO (100+ miles):\n\u2022 Weekends: Choose either 1st/3rd/5th OR one weekend per month (14 days written notice)\n\u2022 NO Thursday midweek visits\n\u2022 Spring break: EVERY year (not alternating)\n\u2022 Summer: 42 days (not 30) — can split into two 7+ day periods\n\u2022 Holiday schedule remains the same (alternating odd/even years)',
      showIf: (a) => a.parent_distance === 'over_100',
    },
    {
      id: 'child_age',
      type: 'single_choice',
      prompt: 'How old is the youngest child?',
      options: [
        { value: 'under_3', label: 'Under 3 years old' },
        { value: '3_or_older', label: '3 years or older' },
      ],
    },
    {
      id: 'under_3_info',
      type: 'info',
      prompt: 'CHILDREN UNDER 3:\nThe Standard Possession Order presumption does NOT apply to children under 3. The judge determines the schedule based on the child\'s developmental needs, each parent\'s caregiving history, and practical logistics.\n\nCourts often start with shorter, more frequent visits for very young children and expand the schedule as the child grows.',
      showIf: (a) => a.child_age === 'under_3',
    },
    {
      id: 'holiday_schedule',
      type: 'info',
      prompt: 'HOLIDAY SCHEDULE (alternates by odd/even year):\n\u2022 Thanksgiving: School dismissal Wed through Sunday 6 p.m.\n\u2022 Christmas Part 1: School dismissal through noon Dec 28\n\u2022 Christmas Part 2: Noon Dec 28 through day before school resumes\n\u2022 Spring break: Alternates (or every year for 100+ miles)\n\u2022 Mother\'s/Father\'s Day: 6 p.m. Friday before through 6 p.m. on the day\n\u2022 Child\'s birthday: Non-possessing parent gets 6–8 p.m.\n\u2022 Monday holidays: Possession extends through Tuesday 8 a.m.',
    },
    {
      id: 'supervised_visitation_info',
      type: 'info',
      prompt: 'SUPERVISED VISITATION may be ordered when there are safety concerns (family violence, substance abuse, CPS history, unstable housing). Types of supervision:\n\u2022 Family member supervises\n\u2022 Neutral third party\n\u2022 Professional supervision agency (fees typically paid by the visiting parent)\n\nTo move from supervised to unsupervised, file a modification petition with evidence that unsupervised visits serve the child\'s best interest.',
    },
    {
      id: 'family_violence',
      type: 'yes_no',
      prompt: 'Has there been any family violence?',
    },
    {
      id: 'violence_info',
      type: 'info',
      prompt:
        "FAMILY VIOLENCE AND CUSTODY:\nUnder Tex. Fam. Code \u00A7153.004, there is a rebuttable presumption that Joint Managing Conservatorship is NOT in the child's best interest if a parent has a history of family violence. This means:\n- The violent parent must prove JMC is still appropriate\n- The court may restrict visitation (supervised visits only)\n- A protective order can be filed simultaneously\n- Document all incidents: dates, witnesses, photos, police reports, medical records",
      showIf: (a) => a.family_violence === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const caretaker = answers.primary_caretaker
    if (caretaker === 'me') {
      items.push({ status: 'done', text: 'Primary caretaker status identified. Document your involvement.' })
    } else if (caretaker === 'other_parent') {
      items.push({ status: 'info', text: 'Focus on your bond with the child and your ability to provide a stable home.' })
    } else if (caretaker === 'equal') {
      items.push({ status: 'done', text: 'Equal parenting involvement — strong basis for Joint Managing Conservatorship.' })
    } else {
      items.push({ status: 'needed', text: 'Start documenting your daily parenting involvement immediately.' })
    }

    if (answers.family_violence === 'yes') {
      items.push({ status: 'needed', text: 'Document all incidents of family violence. Consider filing a protective order.' })
      items.push({ status: 'info', text: 'Family violence creates a presumption against Joint Managing Conservatorship (\u00A7153.004).' })
    }

    items.push({ status: 'info', text: "Texas courts decide custody based on the 'best interest of the child' — focus on stability, safety, and involvement." })

    return items
  },
}
