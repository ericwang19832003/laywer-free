import type { GuidedStepConfig } from '../types'

export const familyMediationPrepConfig: GuidedStepConfig = {
  title: 'Preparing for Mediation',
  reassurance:
    'Mediation is your best chance to control the outcome. Preparation is the difference between a good deal and a bad one.',

  questions: [
    {
      id: 'mediation_overview',
      type: 'info',
      prompt:
        'Mediation is MANDATORY in most Texas counties for contested custody cases. A neutral mediator helps you and the other party reach an agreement. If you agree, it becomes a binding court order.',
    },
    {
      id: 'issues_to_resolve',
      type: 'single_choice',
      prompt: 'What issues need to be resolved in mediation?',
      options: [
        { value: 'custody_only', label: 'Custody and visitation only' },
        { value: 'support_only', label: 'Child support or spousal support only' },
        { value: 'property_only', label: 'Property division only' },
        { value: 'everything', label: 'Everything (custody, support, and property)' },
      ],
    },
    {
      id: 'custody_strategy',
      type: 'info',
      prompt:
        'CUSTODY MEDIATION STRATEGY:\n\u2022 Know exactly what custody schedule you want (specific days, times, holidays, summers)\n\u2022 Be ready to explain WHY your proposed schedule is best for the child \u2014 not why the other parent is bad\n\u2022 Consider the child\u2019s school schedule, activities, and routines\n\u2022 Have a backup schedule ready as a compromise position\n\u2022 Decision-making rights (medical, education, religion) are negotiable \u2014 know which ones matter most to you\n\u2022 Think about geographic restrictions: where can each parent live?',
      showIf: (answers) =>
        answers.issues_to_resolve === 'custody_only' ||
        answers.issues_to_resolve === 'everything',
    },
    {
      id: 'support_strategy',
      type: 'info',
      prompt:
        'SUPPORT MEDIATION STRATEGY:\n\u2022 Know the Texas child support guidelines: 20% of net income for 1 child, 25% for 2, 30% for 3, etc.\n\u2022 Bring current pay stubs, tax returns, and proof of expenses for both parties if possible\n\u2022 Health insurance and unreimbursed medical expenses should be addressed\n\u2022 Spousal support (maintenance) is limited in Texas \u2014 know the eligibility requirements\n\u2022 Consider how support interacts with the custody schedule (more overnights = potential support adjustment)',
      showIf: (answers) =>
        answers.issues_to_resolve === 'support_only' ||
        answers.issues_to_resolve === 'everything',
    },
    {
      id: 'property_strategy',
      type: 'info',
      prompt:
        'PROPERTY MEDIATION STRATEGY:\n\u2022 Texas is a community property state \u2014 assets acquired during marriage are generally split 50/50\n\u2022 Separate property (owned before marriage, gifts, inheritance) is NOT divided\n\u2022 Make a complete list of all assets AND debts with approximate values\n\u2022 Don\u2019t forget: retirement accounts, business interests, vehicles, real estate equity, credit card debt\n\u2022 The house is often the biggest issue \u2014 decide if you want to keep it, sell it, or let the other party have it\n\u2022 Consider tax consequences: not all assets are worth the same after taxes',
      showIf: (answers) =>
        answers.issues_to_resolve === 'property_only' ||
        answers.issues_to_resolve === 'everything',
    },
    {
      id: 'preparation_checklist',
      type: 'info',
      prompt:
        'PREPARATION CHECKLIST:\n1. Know your BATNA (Best Alternative To Negotiated Agreement) \u2014 what happens if mediation fails?\n2. Prioritize: What MUST you have vs. what can you compromise on?\n3. Bring documentation: income records, property values, child\u2019s schedule\n4. Set a range: Know your ideal outcome and your walk-away point\n5. Stay calm: The mediator is not your therapist. Focus on facts.',
    },
    {
      id: 'red_flags',
      type: 'info',
      prompt:
        'RED FLAGS \u2014 Don\u2019t agree if:\n\u2022 You feel pressured to decide NOW\n\u2022 The agreement leaves out child support or health insurance\n\u2022 There\u2019s no enforcement mechanism\n\u2022 Property division doesn\u2019t account for debts\n\u2022 Custody schedule is vague ("reasonable and liberal" is unenforceable)',
    },
    {
      id: 'mediation_success_info',
      type: 'info',
      prompt:
        'IF MEDIATION SUCCEEDS:\nThe mediator drafts a Mediated Settlement Agreement (MSA). Once signed by both parties, it is BINDING and the court will incorporate it into the final decree.\n\nIMPORTANT: Read every word before signing. Once an MSA is signed, it is extremely difficult to set aside \u2014 even if you later feel it was unfair. Ask for time to review if you need it.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Mediation is mandatory in most Texas counties for contested custody cases.',
    })

    if (answers.issues_to_resolve) {
      const issueLabels: Record<string, string> = {
        custody_only: 'Custody and visitation',
        support_only: 'Child support or spousal support',
        property_only: 'Property division',
        everything: 'Custody, support, and property',
      }
      items.push({
        status: 'done',
        text: `Issues to resolve: ${issueLabels[answers.issues_to_resolve] ?? answers.issues_to_resolve}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Identify which issues need to be resolved.' })
    }

    items.push({
      status: 'info',
      text: 'Know your BATNA, prioritize must-haves vs. compromises, and bring all documentation.',
    })

    items.push({
      status: 'info',
      text: 'Red flags: pressure to decide immediately, missing child support/insurance, vague custody schedules, unaccounted debts.',
    })

    items.push({
      status: 'info',
      text: 'If you reach agreement, the MSA is BINDING once signed. Read every word before signing.',
    })

    return items
  },
}
