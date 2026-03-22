import type { GuidedStepConfig } from '../types'

export const debtAnswerPrepConfig: GuidedStepConfig = {
  title: 'Prepare Your Answer',
  reassurance:
    'Filing an answer is the single most important step. It prevents automatic judgment against you.',

  questions: [
    {
      id: 'have_petition',
      type: 'yes_no',
      prompt: "Have you received the plaintiff's petition or complaint?",
      helpText:
        'The petition is the document that starts the lawsuit. It lists what the plaintiff claims you owe and why.',
    },
    {
      id: 'get_petition_info',
      type: 'info',
      prompt:
        "You need to obtain the plaintiff's petition before you can prepare your answer. Contact the court clerk at the courthouse listed on your citation. You can usually get a copy in person or request it by mail. Some courts also have online case lookup systems. The citation you received should have the court name, case number, and address.",
      showIf: (answers) => answers.have_petition === 'no',
    },
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your deadline to file an answer?',
      helpText:
        'In Texas: Justice of the Peace (JP) court — 14 days from service. County or District court — the first Monday after 20 days from service (the "answer date"). Missing this deadline can result in a default judgment against you.',
    },
    {
      id: 'which_defense',
      type: 'single_choice',
      prompt: 'Which defense do you think applies to your situation?',
      helpText:
        'Choose the defense that best matches your circumstances. If unsure, a general denial is always a safe option.',
      options: [
        { value: 'sol_expired', label: 'Statute of limitations has expired' },
        {
          value: 'wrong_party',
          label: 'Wrong party (I am not the person who owes this debt)',
        },
        {
          value: 'amount_disputed',
          label: 'The amount claimed is incorrect',
        },
        { value: 'already_paid', label: 'I already paid this debt' },
        {
          value: 'fdcpa_violations',
          label: 'The collector violated the FDCPA',
        },
        {
          value: 'general_denial',
          label: 'General denial (deny everything, force them to prove it)',
        },
        { value: 'not_sure', label: "I'm not sure which defense to use" },
      ],
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'Statute of limitations defense: In Texas, most debts have a 4-year statute of limitations (6 years for promissory notes). If the creditor waited too long to sue, the case should be dismissed. You must affirmatively raise this defense in your answer — the court will not raise it for you. Include language like: "Plaintiff\'s claims are barred by the applicable statute of limitations, Tex. Civ. Prac. & Rem. Code § 16.004."',
      showIf: (answers) => answers.which_defense === 'sol_expired',
    },
    {
      id: 'wrong_party_info',
      type: 'info',
      prompt:
        'Wrong party defense: If you are not the person who owes this debt (identity theft, same name, or the debt belongs to a family member), you should deny the allegations and state that you are not the debtor. Request that the plaintiff produce the original signed agreement bearing your signature. Include language like: "Defendant denies being a party to the alleged agreement and demands strict proof thereof."',
      showIf: (answers) => answers.which_defense === 'wrong_party',
    },
    {
      id: 'amount_disputed_info',
      type: 'info',
      prompt:
        'Amount disputed defense: If the amount claimed is wrong — inflated fees, incorrect interest, payments not credited — deny the amount and demand an itemized accounting. Include language like: "Defendant disputes the amount alleged and demands strict proof of each charge, fee, and payment credited." Gather your own payment records, bank statements, and any correspondence about the balance.',
      showIf: (answers) => answers.which_defense === 'amount_disputed',
    },
    {
      id: 'already_paid_info',
      type: 'info',
      prompt:
        'Already paid defense: If you already paid this debt in full, gather all proof of payment — cancelled checks, bank statements, receipts, confirmation emails. Include language like: "Defendant affirmatively pleads payment as a defense and states the alleged debt has been satisfied in full." Attach copies of your proof to the answer if possible.',
      showIf: (answers) => answers.which_defense === 'already_paid',
    },
    {
      id: 'fdcpa_violations_info',
      type: 'info',
      prompt:
        'FDCPA violations defense: If the debt collector violated the Fair Debt Collection Practices Act, you may have a counterclaim for up to $1,000 in statutory damages plus actual damages and attorney fees. This does not eliminate the underlying debt but can be used as leverage and may offset what you owe. You can raise FDCPA violations as an affirmative defense and file a counterclaim in the same case.',
      showIf: (answers) => answers.which_defense === 'fdcpa_violations',
    },
    {
      id: 'general_denial_info',
      type: 'info',
      prompt:
        "General denial: This is the simplest and safest approach. You deny every allegation in the plaintiff's petition, which forces the plaintiff to prove every element of their case — that the debt exists, that you are the debtor, that the amount is correct, and that they have standing to sue. In Texas, a general denial is a single sentence: \"Defendant generally denies each and every allegation contained in Plaintiff's petition.\"",
      showIf: (answers) => answers.which_defense === 'general_denial',
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'If you are not sure which defense to use, file a general denial. It is always valid, requires no proof from you, and forces the plaintiff to prove their entire case. You can always add specific defenses later through an amended answer. The most important thing is to file something before your deadline.',
      showIf: (answers) => answers.which_defense === 'not_sure',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_petition === 'yes') {
      items.push({
        status: 'done',
        text: "You have the plaintiff's petition.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Obtain the plaintiff's petition from the court clerk before preparing your answer.",
      })
    }

    if (answers.know_deadline === 'yes') {
      items.push({
        status: 'done',
        text: 'You know your filing deadline.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your filing deadline. JP court: 14 days from service. County/District court: first Monday after 20 days from service.',
      })
    }

    const defenseLabels: Record<string, string> = {
      sol_expired: 'Statute of limitations expired',
      wrong_party: 'Wrong party / mistaken identity',
      amount_disputed: 'Disputed amount',
      already_paid: 'Debt already paid',
      fdcpa_violations: 'FDCPA violations (potential counterclaim)',
      general_denial: 'General denial',
      not_sure: 'General denial (recommended as starting point)',
    }

    const defense = defenseLabels[answers.which_defense] || 'Not selected'
    items.push({
      status: 'info',
      text: `Selected defense: ${defense}.`,
    })

    items.push({
      status: 'needed',
      text: 'Draft your answer, file it with the court clerk, and serve a copy on the plaintiff or their attorney before your deadline. Keep a file-stamped copy for your records.',
    })

    return items
  },
}
