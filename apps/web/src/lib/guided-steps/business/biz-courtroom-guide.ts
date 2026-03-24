import type { GuidedStepConfig } from '../types'

export const bizCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your Business Trial',
  reassurance:
    'Business cases are won with documents and numbers. Organized evidence beats legal jargon every time.',

  questions: [
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'Which court is your case in?',
      options: [
        { value: 'jp', label: 'Justice of the Peace (under $20,000)' },
        { value: 'county', label: 'County Court at Law ($200.01 - $250,000)' },
        { value: 'district', label: 'District Court (over $200, no cap)' },
        { value: 'federal', label: 'Federal Court (diversity jurisdiction over $75,000)' },
      ],
    },
    {
      id: 'jp_info',
      type: 'info',
      prompt:
        'JP COURT TRIAL:\n- Informal rules of evidence\n- No jury unless you request one (and pay the fee)\n- Judge often asks questions directly\n- Typical trial takes 30-60 minutes\n- Bring organized documents — judges appreciate brevity\n- No formal opening/closing statements required',
      showIf: (answers) => answers.court_type === 'jp',
    },
    {
      id: 'county_info',
      type: 'info',
      prompt:
        'COUNTY COURT TRIAL:\n- Formal rules of evidence apply (Texas Rules of Evidence)\n- Jury of 6 unless waived\n- Opening statements, witness examination, closing arguments\n- Typical trial: 1-3 days for business cases\n- You must formally introduce each document as an exhibit\n- Objections are expected — don\'t be intimidated',
      showIf: (answers) => answers.court_type === 'county',
    },
    {
      id: 'district_info',
      type: 'info',
      prompt:
        'DISTRICT COURT TRIAL:\n- Full formal rules of evidence (Texas Rules of Evidence)\n- Jury of 12 unless waived\n- Pre-trial conference and docket call before trial\n- Typical trial: 2-5 days for business cases\n- Charge conference — you submit proposed jury questions\n- More procedural requirements but same core process: present your evidence clearly',
      showIf: (answers) => answers.court_type === 'district',
    },
    {
      id: 'federal_info',
      type: 'info',
      prompt:
        'FEDERAL COURT TRIAL:\n- Federal Rules of Evidence and Federal Rules of Civil Procedure apply\n- Jury of 6-12 (varies by judge)\n- Much stricter procedural requirements\n- Pre-trial order required — lists all exhibits, witnesses, and legal issues\n- Motions in limine to exclude evidence BEFORE trial\n- Trial briefs often required\n- Note: federal judges run tight courtrooms — be on time, follow all local rules',
      showIf: (answers) => answers.court_type === 'federal',
    },
    {
      id: 'trial_structure',
      type: 'info',
      prompt:
        'GENERAL TRIAL STRUCTURE FOR BUSINESS CASES:\n\n1. OPENING STATEMENT: Tell the judge/jury what your evidence will show. Focus on the story — who, what, when, how much.\n2. YOUR CASE: Present witnesses and documents. You go first as the plaintiff.\n3. CROSS-EXAMINATION: The other side questions your witnesses.\n4. DEFENDANT\'S CASE: They present their witnesses and documents.\n5. YOUR CROSS: You question their witnesses.\n6. CLOSING ARGUMENT: Summarize the evidence and tell the judge/jury what you want.\n7. VERDICT: Judge decides (bench trial) or jury deliberates.',
    },
    {
      id: 'case_subtype',
      type: 'single_choice',
      prompt: 'What type of business dispute is this?',
      options: [
        { value: 'partnership', label: 'Partnership dispute' },
        { value: 'employment', label: 'Employment dispute' },
        { value: 'b2b', label: 'Business-to-business (contract, debt, services)' },
      ],
    },
    {
      id: 'partnership_testimony',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY — PARTNERSHIP DISPUTE:\n"Your Honor, I am [name], a partner in [business name]. On [date], my partner and I agreed to [terms]. I have the partnership agreement here as Exhibit 1. As you can see on page [X], the agreement states [specific term]. My partner violated this agreement by [specific action]. As a result, the business lost $[amount]. I have bank statements showing the loss as Exhibit 2."',
      showIf: (answers) => answers.case_subtype === 'partnership',
    },
    {
      id: 'employment_testimony',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY — EMPLOYMENT DISPUTE:\n"Your Honor, I worked for [company] from [start date] to [end date] as a [title]. My employment terms were [describe — contract, handbook, verbal agreement]. On [date], [describe what happened — termination, wage withholding, etc.]. I have my employment records as Exhibit 1 and [pay stubs / termination letter / emails] as Exhibit 2. The amount owed to me is $[amount], calculated as [explain]."',
      showIf: (answers) => answers.case_subtype === 'employment',
    },
    {
      id: 'b2b_testimony',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY — B2B DISPUTE:\n"Your Honor, my company [name] entered a contract with [defendant] on [date] for [services/goods]. I have the signed contract as Exhibit 1. Under the contract, [defendant] was required to [obligation]. They failed to [specific breach]. As a result, my company suffered damages of $[amount]. I have invoices as Exhibit 2 and communications showing the breach as Exhibit 3."',
      showIf: (answers) => answers.case_subtype === 'b2b',
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        'WHAT NOT TO SAY IN COURT:\n- DO NOT say "I feel like they owe me..." — state facts, not feelings\n- DO NOT say "Everyone knows..." — you need actual evidence\n- DO NOT argue with the judge or opposing counsel\n- DO NOT interrupt anyone — wait your turn\n- DO NOT exaggerate damages — judges and juries can tell\n- DO NOT bring up issues not in your petition\n- DO NOT say "It\'s not fair" — focus on what the contract/law says\n- DO NOT discuss settlement negotiations — they\'re inadmissible (TRE 408)',
    },
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'WHAT TO BRING — CHECKLIST:\n- 3 copies of EVERY document (one for you, one for the judge, one for opposing party)\n- Original petition and any amended petitions\n- All contracts or agreements at issue\n- Invoices, receipts, and payment records\n- Relevant emails and text messages (printed and organized by date)\n- Bank statements showing financial impact\n- Photos if relevant (property damage, defective goods)\n- A written timeline of events\n- Calculator (for damages calculations)\n- Notepad and pen for notes during trial\n- Business cards or registration documents proving your authority to represent the business',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.court_type) {
      const courts: Record<string, string> = {
        jp: 'Justice of the Peace',
        county: 'County Court at Law',
        district: 'District Court',
        federal: 'Federal Court',
      }
      items.push({
        status: 'done',
        text: `Court: ${courts[answers.court_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify which court your case is in.',
      })
    }

    if (answers.court_type === 'federal') {
      items.push({
        status: 'info',
        text: 'Federal court has stricter procedural requirements. Review local rules for your district.',
      })
    }

    if (answers.case_subtype) {
      const types: Record<string, string> = {
        partnership: 'Partnership dispute',
        employment: 'Employment dispute',
        b2b: 'Business-to-business dispute',
      }
      items.push({
        status: 'done',
        text: `Case type: ${types[answers.case_subtype]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify your type of business dispute for tailored testimony guidance.',
      })
    }

    items.push({
      status: 'info',
      text: 'Bring 3 copies of every document: one for you, one for the judge, one for opposing party.',
    })

    items.push({
      status: 'info',
      text: 'Focus on facts and documents — not feelings or opinions.',
    })

    return items
  },
}
