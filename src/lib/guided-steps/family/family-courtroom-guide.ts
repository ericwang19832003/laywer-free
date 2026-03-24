import type { GuidedStepConfig } from '../types'

export const familyCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your Family Court Hearing',
  reassurance:
    'Knowing what to expect removes the anxiety. Preparation is your best advantage.',

  questions: [
    {
      id: 'hearing_type',
      type: 'single_choice',
      prompt: 'Which type of hearing are you attending?',
      options: [
        { value: 'temporary_orders', label: 'Temporary orders hearing' },
        { value: 'final_trial', label: 'Final trial / final hearing' },
        { value: 'modification', label: 'Modification hearing' },
        { value: 'protective_order', label: 'Protective order hearing' },
      ],
    },
    {
      id: 'temporary_orders_info',
      type: 'info',
      prompt:
        'TEMPORARY ORDERS HEARING:\n\u2022 Usually informal, lasting 30\u201360 minutes\n\u2022 The judge decides interim arrangements for custody, child support, spousal support, and who stays in the home\n\u2022 These orders stay in effect until the final trial or until modified\n\u2022 You may present brief testimony and documents, but there\u2019s less time for detailed evidence\n\u2022 Focus on the most critical issues: safety, children\u2019s immediate needs, and financial emergencies',
      showIf: (answers) => answers.hearing_type === 'temporary_orders',
    },
    {
      id: 'final_trial_info',
      type: 'info',
      prompt:
        'FINAL TRIAL:\n\u2022 Formal proceeding, typically lasting 2\u20138 hours (complex cases may take multiple days)\n\u2022 You present your full case: testimony, witnesses, documents, and exhibits\n\u2022 The other party (or their attorney) can cross-examine you\n\u2022 The judge makes final decisions on custody, property division, support, and all remaining issues\n\u2022 Prepare an organized binder with all exhibits tabbed and labeled\n\u2022 Practice your testimony \u2014 be concise and factual',
      showIf: (answers) => answers.hearing_type === 'final_trial',
    },
    {
      id: 'modification_info',
      type: 'info',
      prompt:
        'MODIFICATION HEARING:\n\u2022 You must prove a "material and substantial change in circumstances" since the last order\n\u2022 Examples: job loss, relocation, child\u2019s changing needs, safety concerns, remarriage\n\u2022 The burden of proof is on the person requesting the modification\n\u2022 Bring documentation showing what changed and why the current order no longer works\n\u2022 The judge will focus on the best interest of the child (\u00a7153.002 factors)',
      showIf: (answers) => answers.hearing_type === 'modification',
    },
    {
      id: 'protective_order_info',
      type: 'info',
      prompt:
        'PROTECTIVE ORDER HEARING:\n\u2022 The judge assesses whether family violence has occurred and is likely to occur again\n\u2022 An emergency (ex parte) order may be issued immediately without the other party present\n\u2022 A full hearing is typically set within 14 days\n\u2022 Bring any evidence of violence or threats: photos, texts, police reports, medical records, witness statements\n\u2022 The judge can order: no contact, exclusive possession of the home, temporary custody, and surrender of firearms',
      showIf: (answers) => answers.hearing_type === 'protective_order',
    },
    {
      id: 'testimony_script_info',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY FOR CUSTODY:\n"Your Honor, I believe it is in the best interest of the child to [live primarily with me / have equal time with both parents] because [list specific reasons from \u00a7153.002 factors]."\n\nKey \u00a7153.002 factors to address:\n\u2022 The child\u2019s physical and emotional needs now and in the future\n\u2022 The emotional and physical danger to the child\n\u2022 The parenting abilities of each party\n\u2022 Programs available to help each party\n\u2022 The plans for the child by each party\n\u2022 The stability of the proposed home\n\u2022 The child\u2019s wishes (if 12 or older, the court may interview them)',
      showIf: (answers) =>
        answers.hearing_type === 'temporary_orders' ||
        answers.hearing_type === 'final_trial' ||
        answers.hearing_type === 'modification',
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        'WHAT NOT TO SAY OR DO:\n\u2022 Don\u2019t bad-mouth your spouse \u2014 judges watch for this and it hurts your credibility\n\u2022 Don\u2019t exaggerate \u2014 credibility is everything in family court\n\u2022 Don\u2019t discuss your case on social media \u2014 anything you post can be used against you\n\u2022 Don\u2019t coach your children or involve them in the dispute\n\u2022 Don\u2019t argue with the judge or opposing counsel\n\u2022 Don\u2019t bring up irrelevant personal grievances \u2014 stay focused on facts and the children\u2019s best interest',
    },
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'WHAT TO BRING:\n\u2022 Photo ID\n\u2022 All filed documents and court notices\n\u2022 Evidence binder with copies (one for you, one for the judge, one for opposing party)\n\u2022 Witness list (if applicable)\n\u2022 Financial records: pay stubs, tax returns, bank statements, expense worksheets\n\u2022 Custody-related documents: school records, medical records, communication logs\n\u2022 A notepad and pen for taking notes\n\u2022 Any proposed orders you want the judge to sign',
    },
    {
      id: 'courtroom_etiquette',
      type: 'info',
      prompt:
        'COURTROOM ETIQUETTE:\n\u2022 Arrive 30 minutes early\n\u2022 Dress professionally (business attire)\n\u2022 Address the judge as "Your Honor"\n\u2022 Stand when speaking to the judge\n\u2022 Do not interrupt \u2014 wait for your turn\n\u2022 Turn off your phone\n\u2022 Stay calm, even if the other party says things that upset you',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.hearing_type) {
      const typeLabels: Record<string, string> = {
        temporary_orders: 'Temporary orders hearing (30\u201360 min, informal)',
        final_trial: 'Final trial (2\u20138 hours, formal)',
        modification: 'Modification hearing (must prove material change)',
        protective_order: 'Protective order hearing',
      }
      items.push({
        status: 'done',
        text: `Hearing type: ${typeLabels[answers.hearing_type] ?? answers.hearing_type}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Identify which type of hearing you are attending.' })
    }

    if (
      answers.hearing_type === 'temporary_orders' ||
      answers.hearing_type === 'final_trial' ||
      answers.hearing_type === 'modification'
    ) {
      items.push({
        status: 'info',
        text: 'Focus testimony on \u00a7153.002 best-interest factors: child\u2019s needs, safety, parenting abilities, stability, and the child\u2019s wishes.',
      })
    }

    if (answers.hearing_type === 'modification') {
      items.push({
        status: 'info',
        text: 'You must prove a "material and substantial change in circumstances" since the last order.',
      })
    }

    items.push({
      status: 'info',
      text: 'Do not bad-mouth the other party, exaggerate, or post about the case on social media.',
    })

    items.push({
      status: 'info',
      text: 'Bring: photo ID, filed documents, evidence binder with copies, financial records, and any proposed orders.',
    })

    items.push({
      status: 'info',
      text: 'Arrive 30 minutes early. Dress professionally. Address the judge as "Your Honor."',
    })

    return items
  },
}
