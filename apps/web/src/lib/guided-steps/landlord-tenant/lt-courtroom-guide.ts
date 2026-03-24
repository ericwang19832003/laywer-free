import type { GuidedStepConfig } from '../types'

export const ltCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your LT Hearing',
  reassurance:
    'JP Court hearings are short and informal. Knowing the process gives you a major advantage.',

  questions: [
    {
      id: 'hearing_type',
      type: 'single_choice',
      prompt: 'What type of hearing do you have?',
      helpText:
        'Select the type that best matches your case so we can provide the most relevant guidance.',
      options: [
        { value: 'eviction', label: 'Eviction' },
        { value: 'security_deposit', label: 'Security deposit dispute' },
        { value: 'repair_habitability', label: 'Repair / habitability issue' },
        { value: 'lease_dispute', label: 'Lease dispute' },
      ],
    },
    {
      id: 'eviction_info',
      type: 'info',
      prompt:
        'EVICTION HEARING FOCUS:\nThe landlord must prove: (1) proper notice was given, (2) you failed to comply, and (3) they followed all legal procedures. Your defense should attack any weak link in that chain — defective notice, payment proof, or retaliation.',
      showIf: (answers) => answers.hearing_type === 'eviction',
    },
    {
      id: 'security_deposit_info',
      type: 'info',
      prompt:
        'SECURITY DEPOSIT HEARING FOCUS:\nUnder Tex. Property Code §92.103, the landlord must return your deposit within 30 days of move-out or send an itemized list of deductions. If they failed to do either, you may recover 3x the wrongfully withheld amount plus $100 and attorney fees.',
      showIf: (answers) => answers.hearing_type === 'security_deposit',
    },
    {
      id: 'repair_info',
      type: 'info',
      prompt:
        'REPAIR/HABITABILITY HEARING FOCUS:\nUnder Tex. Property Code §92.052, landlords must make diligent efforts to repair conditions that materially affect health or safety. You must have given WRITTEN notice and allowed reasonable time. Bring your written repair requests and photos of the conditions.',
      showIf: (answers) => answers.hearing_type === 'repair_habitability',
    },
    {
      id: 'lease_dispute_info',
      type: 'info',
      prompt:
        'LEASE DISPUTE HEARING FOCUS:\nBring your lease and highlight the specific provisions at issue. If the landlord violated a lease term, show the clause and your evidence of the violation. If interpreting ambiguous language, courts generally construe ambiguity against the drafter (usually the landlord).',
      showIf: (answers) => answers.hearing_type === 'lease_dispute',
    },
    {
      id: 'hearing_structure_info',
      type: 'info',
      prompt:
        'EVICTION HEARING STRUCTURE:\n1. Both parties check in with the clerk\n2. Judge calls your case\n3. Landlord presents first (burden is on them to prove eviction)\n4. You get to respond — present your defense\n5. Judge may ask questions\n6. Judge rules (often immediately)',
    },
    {
      id: 'sample_testimony',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY FOR TENANT:\n"Your Honor, I dispute the landlord\'s claim. [Choose applicable]:"\n- "I paid the rent on [date]. Here is my receipt/bank statement."\n- "The eviction notice was defective because [reason]."\n- "This eviction is retaliatory. I reported repair issues on [date], and the eviction was filed within 6 months, which creates a presumption of retaliation under Texas Property Code §92.331."\n- "The property has habitability issues that the landlord has not addressed despite written notice on [date]."',
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        'WHAT NOT TO SAY:\n- Don\'t say "I know I owe rent but..." (this is an admission)\n- Don\'t argue about fairness — argue about facts and law\n- Don\'t interrupt the landlord\'s testimony\n- Don\'t bring up unrelated disputes',
      helpText:
        'Stay focused on the legal issues. The judge wants facts and evidence, not emotions.',
    },
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'WHAT TO BRING CHECKLIST:\n- Your lease agreement (or written summary of oral lease terms)\n- All rent payment records (bank statements, receipts, money order stubs)\n- Written repair requests and landlord responses\n- Photos/videos of property condition\n- Any notices from the landlord\n- Names and contact info for witnesses\n- 3 copies of everything (you, judge, landlord)\n- Photo ID\n- A pen and notepad',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.hearing_type === 'eviction') {
      items.push({
        status: 'info',
        text: 'Eviction hearing: The landlord must prove proper notice, non-compliance, and correct procedure.',
      })
    } else if (answers.hearing_type === 'security_deposit') {
      items.push({
        status: 'info',
        text: 'Security deposit hearing: Landlord had 30 days to return deposit or send itemized deductions.',
      })
    } else if (answers.hearing_type === 'repair_habitability') {
      items.push({
        status: 'info',
        text: 'Repair hearing: Bring written repair requests and photos of conditions affecting health or safety.',
      })
    } else if (answers.hearing_type === 'lease_dispute') {
      items.push({
        status: 'info',
        text: 'Lease dispute: Highlight the specific lease provisions at issue and bring supporting evidence.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Prepare 3 copies of all documents (you, judge, landlord).',
    })
    items.push({
      status: 'info',
      text: 'The landlord presents first. Listen carefully and take notes — you will get your turn to respond.',
    })
    items.push({
      status: 'info',
      text: 'Do NOT admit fault ("I know I owe rent but..."). Argue facts and law, not fairness.',
    })

    return items
  },
}
