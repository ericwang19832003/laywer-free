import type { GuidedStepConfig } from '../types'

export const debtAnswerPrepPaConfig: GuidedStepConfig = {
  title: 'Prepare Your Answer',
  reassurance:
    'Filing an answer is the single most important step. It prevents automatic judgment against you.',

  questions: [
    {
      id: 'what_is_answer',
      type: 'info',
      prompt:
        'AN ANSWER IS YOUR RESPONSE TO THE LAWSUIT.\n\nThe plaintiff filed a complaint saying you owe money. Your Answer is your official response. If you don\'t file one within 20 days, the plaintiff sends a 10-Day Notice (Pa.R.C.P. 237.1), and if you still don\'t respond, default judgment is entered.\n\nFiling an Answer forces the plaintiff to PROVE their case. Even better — Pennsylvania is one of the most debtor-friendly states: NO wage garnishment for consumer debts.',
    },
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'Which court is the case in?',
      options: [
        { value: 'magisterial', label: 'Magisterial District Court (under $12,000)' },
        { value: 'common_pleas', label: 'Court of Common Pleas (over $12,000)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'magisterial_info',
      type: 'info',
      prompt:
        'Magisterial District Court — Simpler Process\n\nFile a "Notice of Intention to Defend" at least 5 days before the hearing date. The hearing is informal — no formal pleading rules.\n\nKey advantage: Either party can APPEAL to the Court of Common Pleas for a de novo (brand new) trial within 30 days of judgment. This is essentially a free second chance.',
      showIf: (answers) => answers.court_type === 'magisterial',
    },

    // === Written Instrument Check (Pa.R.C.P. 1019(i)) ===
    {
      id: 'written_instrument_header',
      type: 'info',
      prompt:
        'POWERFUL PA DEFENSE: Pa.R.C.P. 1019(i)\n\nPennsylvania requires that when a claim is based on a writing, the plaintiff MUST attach a copy of the writing to the complaint.\n\nIf the creditor\'s complaint is based on a credit card agreement, loan contract, or other written document and they FAILED to attach it — you can file Preliminary Objections to have the complaint dismissed or require amendment.\n\nMany debt buyers do NOT have the original signed contract. This is a powerful procedural weapon.',
      showIf: (answers) => answers.court_type === 'common_pleas',
    },
    {
      id: 'contract_attached',
      type: 'yes_no',
      prompt: 'Did the plaintiff attach the original contract or credit agreement to their complaint?',
      helpText:
        'Check the complaint carefully. Look for a copy of the credit card agreement, loan agreement, or promissory note attached as an exhibit.',
      showIf: (answers) => answers.court_type === 'common_pleas',
    },
    {
      id: 'preliminary_objection_info',
      type: 'info',
      prompt:
        'File Preliminary Objections — Pa.R.C.P. 1028\n\nSince the plaintiff failed to attach the written instrument, you should file Preliminary Objections within 20 days of service. Include:\n\n• Objection under Pa.R.C.P. 1028(a)(2) — insufficient specificity of pleading\n• Cite Pa.R.C.P. 1019(i) — "When any claim or defense is based upon a writing, the pleader shall attach a copy of the writing"\n\nThis pauses your Answer deadline. If the objections are overruled, you get 20 more days to file an Answer. If sustained, the plaintiff must amend their complaint — and they may not be able to if they lack the document.',
      showIf: (answers) =>
        answers.court_type === 'common_pleas' && answers.contract_attached === 'no',
    },

    {
      id: 'have_complaint',
      type: 'yes_no',
      prompt: "Have you received the plaintiff's complaint?",
    },
    {
      id: 'get_complaint_info',
      type: 'info',
      prompt:
        'Contact the court clerk at the courthouse listed on your service papers. You can get a copy in person or by mail.',
      showIf: (answers) => answers.have_complaint === 'no',
    },
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your deadline to respond?',
      helpText:
        'Court of Common Pleas: 20 days from service. Magisterial District Court: 5 days before the hearing date.',
    },

    // === Answer Structure ===
    {
      id: 'answer_structure_info',
      type: 'info',
      prompt:
        'PA Answer Structure — Two Parts\n\nPART 1: Respond to Each Allegation (Pa.R.C.P. 1029(a))\nFor each numbered paragraph in the complaint:\n• Admit — only if absolutely true\n• Deny — if false or you have any doubt\n• Deny for lack of knowledge — if insufficient info to admit or deny\n\nDeny as much as possible — every denial forces the plaintiff to produce evidence.\n\nPART 2: New Matter / Affirmative Defenses (Pa.R.C.P. 1030(b))\nUnder the heading "NEW MATTER," list all applicable defenses.',
      showIf: (answers) => answers.court_type === 'common_pleas',
    },

    // === Defenses ===
    {
      id: 'defenses_info',
      type: 'info',
      prompt:
        'AFFIRMATIVE DEFENSES — List ALL That Apply\n\n1. Statute of limitations expired (42 Pa.C.S. §5525)\n2. Lack of standing — debt buyer has no valid chain of title\n3. Failure to attach written instrument (Pa.R.C.P. 1019(i))\n4. Wrong defendant / identity theft\n5. Debt already paid or settled\n6. Improper service (Pa.R.C.P. 400 et seq.)\n7. FDCPA violations (15 U.S.C. §1692)\n8. FCEUA violations (73 P.S. §2270.1)\n9. Failure to validate debt (§1692g)\n10. Accord and satisfaction',
    },
    {
      id: 'which_defense',
      type: 'single_choice',
      prompt: 'Which primary defense applies to your situation?',
      options: [
        { value: 'sol_expired', label: 'Statute of limitations has expired' },
        { value: 'lack_standing', label: 'Plaintiff lacks standing (debt buyer, no chain of title)' },
        { value: 'no_contract', label: 'Plaintiff failed to attach the contract (Pa.R.C.P. 1019(i))' },
        { value: 'wrong_party', label: 'Wrong party / identity theft' },
        { value: 'amount_disputed', label: 'The amount claimed is incorrect' },
        { value: 'already_paid', label: 'Debt already paid or settled' },
        { value: 'fdcpa_fceua', label: 'Collector violated FDCPA / FCEUA' },
        { value: 'deny_all', label: 'Deny everything (force them to prove it)' },
        { value: 'not_sure', label: "I'm not sure which defense to use" },
      ],
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'SOL defense: Include in your New Matter:\n"Plaintiff\'s claims are barred by the applicable statute of limitations, 42 Pa.C.S. §5525, as more than four years have elapsed since the date of default."\n\nThe court will NOT raise this defense for you.',
      showIf: (answers) => answers.which_defense === 'sol_expired',
    },
    {
      id: 'lack_standing_info',
      type: 'info',
      prompt:
        'Lack of standing: If a debt buyer (LVNV Funding, Portfolio Recovery, Midland Credit, etc.):\n"Plaintiff lacks standing as Plaintiff has failed to demonstrate ownership of the alleged debt through a complete and documented chain of assignment from the original creditor."\n\nDemand they produce every bill of sale and assignment in the chain — debt buyers frequently cannot.',
      showIf: (answers) => answers.which_defense === 'lack_standing',
    },
    {
      id: 'no_contract_info',
      type: 'info',
      prompt:
        'Missing contract defense (Pa.R.C.P. 1019(i)):\n\nFile Preliminary Objections citing Pa.R.C.P. 1019(i) — "When any claim or defense is based upon a writing, the pleader shall attach a copy of the writing."\n\nThis is devastatingly effective against debt buyers who purchased portfolios without individual account documents.',
      showIf: (answers) => answers.which_defense === 'no_contract',
    },
    {
      id: 'fdcpa_fceua_info',
      type: 'info',
      prompt:
        'FDCPA / FCEUA violations: Raise as affirmative defense AND file a counterclaim.\n\n• FDCPA (15 U.S.C. §1692k): $1,000 statutory damages + actual damages + attorney fees\n• FCEUA violations are enforced through the UTPCPL (73 P.S. §201-9.2): Up to TREBLE (3x) actual damages, minimum $100, plus attorney fees\n\nThe UTPCPL counterclaim is extremely powerful — treble damages make it a real weapon.',
      showIf: (answers) => answers.which_defense === 'fdcpa_fceua',
    },
    {
      id: 'deny_all_info',
      type: 'info',
      prompt:
        'Deny everything: For each paragraph in the complaint, respond "Denied" or "Denied for lack of knowledge." Then list ALL affirmative defenses in your New Matter section.\n\nThis forces the plaintiff to prove every element — that the debt exists, that you owe it, that the amount is correct, and that they have standing to sue.',
      showIf: (answers) => answers.which_defense === 'deny_all' || answers.which_defense === 'not_sure',
    },

    // === Filing Info ===
    {
      id: 'filing_info',
      type: 'info',
      prompt:
        'Filing Your Answer (Court of Common Pleas)\n\n1. Type your Answer following court formatting\n2. Mail the original to the court via Certified Mail\n3. Mail a copy to the plaintiff\'s attorney\n4. Keep certified mail receipts as proof of timely filing\n5. Include a Certificate of Compliance with PA\'s Public Access Policy\n\nFiling fee: Most PA courts charge NO fee for an Answer (Philadelphia exception: ~$155).\n\nDeadline: 20 days from service. If you also file Preliminary Objections, the Answer deadline is paused.',
      showIf: (answers) => answers.court_type === 'common_pleas',
    },

    // === No Wage Garnishment Reminder ===
    {
      id: 'no_garnishment_reminder',
      type: 'info',
      prompt:
        'IMPORTANT: Even If You Lose — Pennsylvania Protects Your Wages\n\nPennsylvania law (42 Pa.C.S.A. §8127) PROHIBITS wage garnishment for consumer debts. Your wages CANNOT be garnished for credit card debt, medical bills, auto loans, personal loans, or payday loans.\n\nThis means even if the plaintiff wins a judgment, they cannot take money from your paycheck. This is one of the strongest debtor protections in the country.\n\nExceptions (wages CAN be garnished for): child support, taxes, federal student loans, criminal restitution.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_complaint === 'yes') {
      items.push({ status: 'done', text: "You have the plaintiff's complaint." })
    } else {
      items.push({ status: 'needed', text: 'Obtain the complaint from the court clerk.' })
    }

    if (answers.know_deadline === 'yes') {
      items.push({ status: 'done', text: 'You know your filing deadline.' })
    } else {
      const deadline = answers.court_type === 'magisterial'
        ? '5 days before hearing date'
        : '20 days from service'
      items.push({ status: 'needed', text: `Determine your deadline: ${deadline}.` })
    }

    // Contract attached check
    if (answers.contract_attached === 'no' && answers.court_type === 'common_pleas') {
      items.push({
        status: 'info',
        text: 'Contract NOT attached — file Preliminary Objections under Pa.R.C.P. 1019(i). This is a powerful procedural weapon.',
      })
    }

    const defenseLabels: Record<string, string> = {
      sol_expired: 'Statute of limitations expired',
      lack_standing: 'Lack of standing (debt buyer)',
      no_contract: 'Missing written instrument (Pa.R.C.P. 1019(i))',
      wrong_party: 'Wrong party / identity theft',
      amount_disputed: 'Disputed amount',
      already_paid: 'Debt already paid',
      fdcpa_fceua: 'FDCPA / FCEUA violations (UTPCPL treble damages available)',
      deny_all: 'Deny everything',
      not_sure: 'Deny everything (recommended)',
    }

    if (answers.which_defense) {
      items.push({
        status: 'info',
        text: `Primary defense: ${defenseLabels[answers.which_defense] || answers.which_defense}.`,
      })
    }

    items.push({
      status: 'needed',
      text: 'File Answer + New Matter (or Preliminary Objections) within 20 days. Serve copy on plaintiff\'s attorney via certified mail.',
    })

    items.push({
      status: 'info',
      text: 'PA protects your wages: NO wage garnishment for consumer debts (42 Pa.C.S.A. §8127).',
    })

    return items
  },
}
