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
