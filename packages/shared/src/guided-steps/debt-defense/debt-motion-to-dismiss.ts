import type { GuidedStepConfig } from '../types'

export const debtMotionToDismissConfig: GuidedStepConfig = {
  title: 'File a Motion to Dismiss Before Trial',
  reassurance:
    'If your defense is strong enough, you can ask the judge to throw out the case without a full trial.',

  questions: [
    {
      id: 'what_is_motion_to_dismiss',
      type: 'info',
      prompt:
        "A Motion to Dismiss asks the judge to end the case early because the plaintiff's case has a fatal flaw. You can file one if:\n- The statute of limitations has expired\n- The plaintiff can't prove they own the debt (lack of standing)\n- The plaintiff filed in the wrong court (improper venue)\n- The plaintiff's petition doesn't state a valid claim",
    },
    {
      id: 'which_grounds',
      type: 'single_choice',
      prompt: 'Which grounds for dismissal apply to your case?',
      helpText:
        'Select the strongest reason the case should be thrown out. If multiple grounds apply, choose "Multiple grounds" at the bottom.',
      options: [
        {
          value: 'sol_expired',
          label: 'Statute of limitations has expired',
        },
        {
          value: 'lack_standing',
          label: "Plaintiff can't prove they own the debt (lack of standing)",
        },
        {
          value: 'improper_venue',
          label: 'Plaintiff filed in the wrong court (improper venue)',
        },
        {
          value: 'failure_to_state_claim',
          label: "Plaintiff's petition doesn't state a valid claim",
        },
        {
          value: 'multiple',
          label: 'Multiple grounds from the list above',
        },
      ],
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS EXPIRED\n\nIn Texas, most consumer debts have a 4-year statute of limitations (Tex. Civ. Prac. & Rem. Code \u00a7 16.004). Promissory notes have 6 years (\u00a7 16.004(a)(3)). The clock starts from the date of last activity on the account — usually the last payment or charge.\n\nIn your motion, write: "The statute of limitations has expired. Under Tex. Civ. Prac. & Rem. Code \u00a7 16.004, the limitations period for this debt is [4/6] years. The last activity on this account was [date], which is more than [4/6] years ago. Plaintiff\'s claims are therefore time-barred and must be dismissed."\n\nKey evidence: account statements showing last payment date, original contract showing account opening date.',
      showIf: (answers) =>
        answers.which_grounds === 'sol_expired' ||
        answers.which_grounds === 'multiple',
    },
    {
      id: 'lack_standing_info',
      type: 'info',
      prompt:
        'LACK OF STANDING (PLAINTIFF CANNOT PROVE OWNERSHIP)\n\nDebt buyers must prove an unbroken chain of assignment from the original creditor to themselves. Many cannot do this. If the plaintiff is not the original creditor, they must produce: the original signed agreement, every assignment/bill of sale in the chain, and business records authenticating each transfer.\n\nIn your motion, write: "Plaintiff has failed to establish standing to bring this action. Plaintiff is not the original creditor and has not produced a complete, authenticated chain of assignment from [Original Creditor] to Plaintiff. Without proof of valid assignment, Plaintiff has no legal authority to collect this debt or maintain this lawsuit."\n\nKey evidence: demand that plaintiff produce the original agreement and all assignments.',
      showIf: (answers) =>
        answers.which_grounds === 'lack_standing' ||
        answers.which_grounds === 'multiple',
    },
    {
      id: 'improper_venue_info',
      type: 'info',
      prompt:
        'IMPROPER VENUE (WRONG COURT)\n\nIn Texas, a lawsuit must generally be filed in the county where the defendant resides or where the obligation was to be performed (Tex. Civ. Prac. & Rem. Code \u00a7 15.002). Debt collectors sometimes file in the wrong county hoping you will not challenge it.\n\nIn your motion, write: "This Court lacks proper venue over this action. Under Tex. Civ. Prac. & Rem. Code \u00a7 15.002, venue is proper in the county of Defendant\'s residence. Defendant resides in [your county], not [county where filed]. Plaintiff has not established that any exception to the general venue rule applies. This case should be dismissed or transferred to [correct county]."\n\nKey evidence: proof of your residence (utility bill, lease, driver\'s license) showing you live in a different county.',
      showIf: (answers) =>
        answers.which_grounds === 'improper_venue' ||
        answers.which_grounds === 'multiple',
    },
    {
      id: 'failure_to_state_claim_info',
      type: 'info',
      prompt:
        "FAILURE TO STATE A CLAIM\n\nThe plaintiff's petition must contain enough facts to state a valid legal claim. If the petition is vague, missing essential elements, or fails to attach the required contract, it may be subject to dismissal.\n\nIn your motion, write: \"Plaintiff's Original Petition fails to state a claim upon which relief can be granted. Plaintiff has not alleged sufficient facts to establish: (1) the existence of a valid contract between Defendant and Plaintiff or Plaintiff's predecessor, (2) a breach of that contract by Defendant, (3) the specific amount owed, or (4) Plaintiff's standing to assert the claim. Plaintiff has failed to attach the alleged contract as required.\"\n\nKey evidence: review the plaintiff's petition carefully — note any missing elements, vague allegations, or absent attachments.",
      showIf: (answers) =>
        answers.which_grounds === 'failure_to_state_claim' ||
        answers.which_grounds === 'multiple',
    },
    {
      id: 'how_to_file',
      type: 'info',
      prompt:
        "HOW TO FILE:\n1. Write the motion (use the template below)\n2. File it with the court clerk (same process as your Answer)\n3. Serve a copy on the plaintiff's attorney\n4. The court will set a hearing date for the motion\n5. At the hearing, you present your argument; plaintiff responds\n6. Judge rules — if granted, case is dismissed!",
    },
    {
      id: 'timing',
      type: 'info',
      prompt:
        "TIMING: File your motion AFTER your Answer but BEFORE the trial date. Most courts require at least 21 days' notice before the hearing. Check your court's local rules.",
    },
    {
      id: 'motion_template',
      type: 'info',
      prompt:
        "MOTION TEMPLATE:\n\nMOTION TO DISMISS\n\nTO THE HONORABLE JUDGE OF [COURT]:\n\nNOW COMES [Your Name], Defendant pro se, and respectfully moves this Court to dismiss Plaintiff's claims for the following reasons:\n\n[For SOL]: The statute of limitations has expired. Under Tex. Civ. Prac. & Rem. Code \u00a7 16.004, the limitations period for this debt is [4/6] years. The last activity on this account was [date], which is more than [4/6] years ago. Plaintiff's claims are therefore time-barred.\n\n[For Standing]: Plaintiff has failed to establish standing. Plaintiff has not produced a complete chain of assignment from the original creditor to Plaintiff. Without proof of assignment, Plaintiff has no legal authority to collect this debt.\n\n[For Venue]: This Court lacks proper venue. Defendant resides in [your county], not [county where filed]. Under Tex. Civ. Prac. & Rem. Code \u00a7 15.002, venue is proper in the county of Defendant's residence.\n\n[For Failure to State Claim]: Plaintiff's petition fails to state a claim upon which relief can be granted. Plaintiff has not alleged sufficient facts to establish the existence of a valid agreement, a breach, or the amount owed.\n\nWHEREFORE, Defendant respectfully requests that this Court dismiss Plaintiff's claims with prejudice.\n\nRespectfully submitted,\n[Your Name], Pro Se",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const groundsLabels: Record<string, string> = {
      sol_expired: 'Statute of limitations expired',
      lack_standing: 'Lack of standing (no proof of debt ownership)',
      improper_venue: 'Improper venue (wrong court)',
      failure_to_state_claim: 'Failure to state a valid claim',
      multiple: 'Multiple grounds for dismissal',
    }

    const grounds = groundsLabels[answers.which_grounds] || 'Not selected'
    items.push({
      status: 'info',
      text: `Grounds for dismissal: ${grounds}.`,
    })

    items.push({
      status: 'needed',
      text: 'Draft your Motion to Dismiss using the template provided, tailored to your specific grounds.',
    })

    items.push({
      status: 'needed',
      text: "File the motion with the court clerk and serve a copy on the plaintiff's attorney.",
    })

    items.push({
      status: 'info',
      text: "File AFTER your Answer but BEFORE trial. Most courts require at least 21 days' notice before the hearing.",
    })

    return items
  },
}
