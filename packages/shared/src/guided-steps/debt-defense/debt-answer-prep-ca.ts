import type { GuidedStepConfig } from '../types'

export const debtAnswerPrepCaConfig: GuidedStepConfig = {
  title: 'Prepare Your Answer',
  reassurance:
    'Filing an answer is the single most important step. It prevents automatic judgment against you.',

  questions: [
    {
      id: 'what_is_answer',
      type: 'info',
      prompt:
        'AN ANSWER IS YOUR RESPONSE TO THE LAWSUIT.\n\nThe plaintiff filed a complaint saying you owe money. Your Answer is your official response to the court. If you don\'t file one within 30 days of service, the court automatically rules against you (a "default judgment") — and the collector can garnish wages and levy bank accounts.\n\nFiling an Answer forces the plaintiff to PROVE their case.',
    },
    {
      id: 'case_classification',
      type: 'single_choice',
      prompt: 'What type of civil case is this?',
      helpText:
        'This determines your answer format and available procedural tools.',
      options: [
        { value: 'limited_civil', label: 'Limited Civil — $25,000 or less' },
        { value: 'unlimited_civil', label: 'Unlimited Civil — over $25,000' },
        { value: 'small_claims', label: 'Small Claims — $10,000 or less' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'complaint_verified',
      type: 'yes_no',
      prompt: 'Is the complaint verified (signed under oath/penalty of perjury)?',
      helpText:
        'Look for language like "I declare under penalty of perjury" or a notarized signature. This determines whether you can use a general denial.',
      showIf: (answers) => answers.case_classification === 'limited_civil',
    },

    // === General Denial vs Specific ===
    {
      id: 'general_denial_available',
      type: 'info',
      prompt:
        'GENERAL DENIAL AVAILABLE\n\nSince this is a Limited Civil case with an unverified complaint, you can use a General Denial (CCP §431.30(d)). This is ONE sentence:\n\n"Defendant generally denies each and every allegation in the Complaint."\n\nThis is the simplest and most powerful option — it forces the plaintiff to prove EVERY element of their case. Use Judicial Council Form PLD-C-010 (Answer — Contract).\n\nYou should ALSO list affirmative defenses separately.',
      showIf: (answers) =>
        answers.case_classification === 'limited_civil' &&
        answers.complaint_verified === 'no',
    },
    {
      id: 'specific_denial_required',
      type: 'info',
      prompt:
        'SPECIFIC DENIAL REQUIRED\n\nBecause the complaint is verified (or this is an Unlimited Civil case), you must respond to each allegation individually (CCP §431.30(b)):\n\n• Admit — only if you are certain it is true\n• Deny — if it is false or you have any doubt\n• Deny for lack of knowledge — if you don\'t have enough information\n\nDeny as much as possible. Every denial forces the plaintiff to produce evidence.\n\nAlso list your affirmative defenses separately. Use Judicial Council Form PLD-C-010.',
      showIf: (answers) =>
        answers.case_classification === 'unlimited_civil' ||
        (answers.case_classification === 'limited_civil' && answers.complaint_verified === 'yes'),
    },

    // === Demurrer Option ===
    {
      id: 'demurrer_info',
      type: 'info',
      prompt:
        'ALTERNATIVE: Demurrer (CCP §430.10)\n\nInstead of (or before) an Answer, you can file a Demurrer — a motion saying the complaint is legally defective even if everything alleged is true.\n\nGood grounds for demurrer in debt cases:\n• Complaint fails to attach the contract\n• Plaintiff (debt buyer) fails to allege a valid chain of assignment\n• Complaint is too vague to respond to\n\nRisk: If overruled, you get 10-15 days to file an Answer. For most pro se defendants, filing an Answer with affirmative defenses is safer and simpler.',
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
        'Obtain the complaint from the court clerk at the courthouse listed on your summons. You can get it in person, by mail, or through the court\'s online case lookup system.',
      showIf: (answers) => answers.have_complaint === 'no',
    },
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your deadline to file an answer?',
      helpText:
        'In California, you have 30 calendar days from the date of service to file your Answer (CCP §412.20(a)(3)). If served by substituted service, 30 days from the mailing date.',
    },

    // === Affirmative Defenses ===
    {
      id: 'defenses_info',
      type: 'info',
      prompt:
        'AFFIRMATIVE DEFENSES — List ALL That Apply\n\nYou must raise affirmative defenses in your Answer or risk waiving them. Common defenses for CA debt cases:\n\n1. Statute of limitations expired (CCP §337/§339)\n2. Lack of standing — plaintiff (debt buyer) has no valid assignment\n3. Failure to state a claim\n4. Account stated — you never agreed to the balance\n5. Payment / accord and satisfaction\n6. Wrong defendant / identity theft\n7. Improper service (CCP §415.10)\n8. Statute of frauds (Civ. Code §1624)\n9. Rosenthal Act violations (Civ. Code §1788)\n10. FDCPA violations (15 U.S.C. §1692)',
    },
    {
      id: 'which_defense',
      type: 'single_choice',
      prompt: 'Which primary defense applies to your situation?',
      options: [
        { value: 'sol_expired', label: 'Statute of limitations has expired' },
        { value: 'lack_standing', label: 'Plaintiff lacks standing (debt buyer, no proof of assignment)' },
        { value: 'wrong_party', label: 'Wrong party / identity theft' },
        { value: 'amount_disputed', label: 'The amount claimed is incorrect' },
        { value: 'already_paid', label: 'Debt already paid or settled' },
        { value: 'rosenthal_fdcpa', label: 'Collector violated Rosenthal Act / FDCPA' },
        { value: 'general_denial', label: 'General denial (deny everything)' },
        { value: 'not_sure', label: "I'm not sure which defense to use" },
      ],
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'SOL defense: Include this language in your Answer:\n"Plaintiff\'s claims are barred by the applicable statute of limitations, Code of Civil Procedure §337 and/or §339."\n\nThe court will NOT raise this defense for you — you must assert it.',
      showIf: (answers) => answers.which_defense === 'sol_expired',
    },
    {
      id: 'lack_standing_info',
      type: 'info',
      prompt:
        'Lack of standing defense: If the plaintiff is a debt buyer (LVNV Funding, Portfolio Recovery, Midland Credit, etc.), they must prove a complete chain of assignment from the original creditor.\n\nInclude this language: "Plaintiff lacks standing to bring this action as Plaintiff has failed to establish a valid assignment from the original creditor to Plaintiff."\n\nUnder SB 908 (Financial Code §100000), debt collectors must be licensed by the DFPI. Check the NMLS Consumer Access database — an unlicensed collector may have no legal right to collect.',
      showIf: (answers) => answers.which_defense === 'lack_standing',
    },
    {
      id: 'rosenthal_info',
      type: 'info',
      prompt:
        'Rosenthal Act / FDCPA defense: If the collector violated either law, you can raise it as an affirmative defense AND file a counterclaim.\n\nRosenthal Act (Civ. Code §1788.30): Up to $1,000 statutory damages + actual damages + attorney fees. Covers ORIGINAL CREDITORS too — not just third-party collectors.\n\nFDCPA (15 U.S.C. §1692k): Up to $1,000 statutory damages + actual damages + attorney fees. Third-party collectors only.\n\nYou can recover under BOTH statutes if the collector is a third party.',
      showIf: (answers) => answers.which_defense === 'rosenthal_fdcpa',
    },
    {
      id: 'general_denial_info',
      type: 'info',
      prompt:
        'General denial: If available (Limited Civil + unverified complaint), this is the simplest approach. One sentence: "Defendant generally denies each and every allegation in the Complaint." Forces the plaintiff to prove everything.\n\nEven with a general denial, list ALL applicable affirmative defenses separately.',
      showIf: (answers) => answers.which_defense === 'general_denial' || answers.which_defense === 'not_sure',
    },

    // === Filing Info ===
    {
      id: 'filing_info',
      type: 'info',
      prompt:
        'Filing Your Answer\n\nUse Judicial Council Form PLD-C-010 (Answer — Contract).\n\n1. File with the court clerk — in person, by mail, or e-file\n2. Serve a copy on the plaintiff\'s attorney by mail (add 5 days to response deadlines per CCP §1013)\n3. Keep a file-stamped copy for your records\n\nFiling fees: ~$225 (Limited Civil), ~$435 (Unlimited Civil). If you cannot afford it, file a Fee Waiver (Form FW-001).\n\nDeadline: 30 days from service. DO NOT MISS THIS.',
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
      items.push({
        status: 'needed',
        text: 'Determine your deadline: 30 days from service (CCP §412.20).',
      })
    }

    // Answer type
    if (
      answers.case_classification === 'limited_civil' &&
      answers.complaint_verified === 'no'
    ) {
      items.push({
        status: 'info',
        text: 'General denial available (Limited Civil + unverified). Use Form PLD-C-010.',
      })
    } else if (
      answers.case_classification === 'unlimited_civil' ||
      answers.complaint_verified === 'yes'
    ) {
      items.push({
        status: 'info',
        text: 'Specific denial required. Respond to each allegation individually.',
      })
    }

    const defenseLabels: Record<string, string> = {
      sol_expired: 'Statute of limitations expired',
      lack_standing: 'Lack of standing (debt buyer)',
      wrong_party: 'Wrong party / identity theft',
      amount_disputed: 'Disputed amount',
      already_paid: 'Debt already paid',
      rosenthal_fdcpa: 'Rosenthal Act / FDCPA violations',
      general_denial: 'General denial',
      not_sure: 'General denial (recommended)',
    }

    if (answers.which_defense) {
      items.push({
        status: 'info',
        text: `Primary defense: ${defenseLabels[answers.which_defense] || answers.which_defense}.`,
      })
    }

    items.push({
      status: 'needed',
      text: 'File Answer (Form PLD-C-010) with ALL affirmative defenses within 30 days. Serve copy on plaintiff\'s attorney.',
    })

    return items
  },
}
