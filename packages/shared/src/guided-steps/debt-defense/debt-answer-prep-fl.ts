import type { GuidedStepConfig } from '../types'

export const debtAnswerPrepFlConfig: GuidedStepConfig = {
  title: 'Prepare Your Answer',
  reassurance:
    'Filing an answer is the single most important step. It prevents automatic judgment against you.',

  questions: [
    {
      id: 'what_is_answer',
      type: 'info',
      prompt:
        'AN ANSWER IS YOUR RESPONSE TO THE LAWSUIT.\n\nThe plaintiff filed a complaint saying you owe money. Your Answer is your official response to the court. If you don\'t file one within 20 days of service, the court automatically rules against you (a "default judgment") — and the collector can garnish wages and levy bank accounts.\n\nFiling an Answer forces the plaintiff to PROVE their case.\n\nIMPORTANT: In Florida, defendants do NOT pay a filing fee to file an Answer (Fla. Stat. §34.041). Only the party initiating the lawsuit pays.',
    },
    {
      id: 'case_classification',
      type: 'single_choice',
      prompt: 'What type of court is your case in?',
      helpText:
        'This determines your answer format and available procedural tools. Check the top of your summons for the court name.',
      options: [
        { value: 'small_claims', label: 'Small Claims — $8,000 or less' },
        { value: 'county_court', label: 'County Court — $8,001 to $50,000' },
        { value: 'circuit_court', label: 'Circuit Court — over $50,000' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },

    // === Answer Format ===
    {
      id: 'answer_format_info',
      type: 'info',
      prompt:
        'FLORIDA ANSWER FORMAT\n\nFlorida requires specific denials — you must respond to each allegation individually (Fla. R. Civ. P. 1.110(c)):\n\n\u2022 Admit — only if you are certain it is true\n\u2022 Deny — if it is false or you have any doubt\n\u2022 Deny for lack of knowledge — if you don\'t have enough information\n\nDeny as much as possible. Every denial forces the plaintiff to produce evidence.\n\nAffirmative defenses MUST be listed in a separate section of your Answer. Each defense should contain a short and plain statement of the facts supporting it (Fla. R. Civ. P. 1.110(d)).',
    },

    // === Motion to Dismiss Option ===
    {
      id: 'motion_to_dismiss_info',
      type: 'info',
      prompt:
        'ALTERNATIVE: Motion to Dismiss (Fla. R. Civ. P. 1.140(b))\n\nBefore filing an Answer, you can file a Motion to Dismiss if the complaint is legally defective. This must be filed BEFORE or WITH your Answer.\n\nGood grounds for motion to dismiss in debt cases:\n\u2022 Failure to state a cause of action — complaint is too vague or missing key elements\n\u2022 Lack of standing — debt buyer fails to allege a valid chain of assignment\n\u2022 Insufficiency of service of process — you were not properly served\n\u2022 Lack of jurisdiction — wrong court or wrong county\n\nRisk: If denied, you typically get 20 days to file an Answer. For most pro se defendants, filing an Answer with affirmative defenses is safer and simpler.\n\nNOTE: Filing a Motion to Dismiss does NOT extend your 20-day deadline unless the court grants extra time.',
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
        'Obtain the complaint from the court clerk at the courthouse listed on your summons. You can get it in person, by mail, or through the Florida Courts e-filing portal (www.myflcourtaccess.com).',
      showIf: (answers) => answers.have_complaint === 'no',
    },
    {
      id: 'know_deadline',
      type: 'yes_no',
      prompt: 'Do you know your deadline to file an answer?',
      helpText:
        'In Florida, you have 20 calendar days from the date of service to file your Answer (Fla. R. Civ. P. 1.140(a)(1)). This is shorter than many other states. Do NOT miss this deadline.',
    },

    // === Default Judgment Info ===
    {
      id: 'missed_deadline',
      type: 'yes_no',
      prompt: 'Have you already missed your 20-day deadline to respond?',
    },
    {
      id: 'vacate_default_info',
      type: 'info',
      prompt:
        'MISSED DEADLINE — VACATING A DEFAULT JUDGMENT (Fla. R. Civ. P. 1.540(b))\n\nIf a default or default judgment has been entered against you, you can file a Motion to Vacate. You must show:\n\n1. Excusable neglect — a valid reason you failed to respond (illness, never received papers, etc.)\n2. Due diligence — you acted promptly once you learned of the default\n3. Meritorious defense — you have a real defense to the debt claim\n\nTime limit: Generally within 1 year of judgment. EXCEPTION: If service of process was defective (you were never properly served), the judgment is VOID and can be challenged at any time.\n\nFile this motion as soon as possible — the longer you wait, the harder it becomes.',
      showIf: (answers) => answers.missed_deadline === 'yes',
    },

    // === Affirmative Defenses ===
    {
      id: 'defenses_info',
      type: 'info',
      prompt:
        'AFFIRMATIVE DEFENSES — List ALL That Apply\n\nYou must raise affirmative defenses in your Answer or risk waiving them (Fla. R. Civ. P. 1.110(d)). Common defenses for FL debt cases:\n\n1. Statute of limitations expired (Fla. Stat. \u00A795.11 — 5 years for written contracts, 4 years for oral)\n2. Lack of standing — plaintiff (debt buyer) has no valid chain of assignment\n3. Failure to state a cause of action\n4. Account stated — you never agreed to the balance\n5. Payment / accord and satisfaction\n6. Wrong defendant / identity theft\n7. Improper service of process\n8. FCCPA violations (Fla. Stat. \u00A7559.72)\n9. FDCPA violations (15 U.S.C. \u00A71692)\n10. Failure of consideration\n11. Statute of frauds\n\nNOTE: For medical debt referred to a third-party collector, the SOL is now 3 years (effective Jan 1, 2025).',
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
        { value: 'fccpa_fdcpa', label: 'Collector violated FCCPA / FDCPA' },
        { value: 'improper_service', label: 'I was not properly served' },
        { value: 'deny_everything', label: 'Deny everything (force them to prove it)' },
        { value: 'not_sure', label: "I'm not sure which defense to use" },
      ],
    },
    {
      id: 'sol_expired_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS DEFENSE\n\nInclude this language in your Answer:\n"Plaintiff\'s claims are barred in whole or in part by the applicable statute of limitations, Florida Statutes \u00A795.11."\n\nFlorida SOL periods:\n\u2022 Written contracts (credit cards): 5 years (Fla. Stat. \u00A795.11(2)(b))\n\u2022 Oral contracts: 4 years (Fla. Stat. \u00A795.11(3)(k))\n\u2022 Medical debt (referred to collector): 3 years (effective Jan 1, 2025)\n\nThe clock starts from the date of last payment or last charge. WARNING: Making ANY partial payment restarts the clock.\n\nThe court will NOT raise this defense for you — you must assert it.',
      showIf: (answers) => answers.which_defense === 'sol_expired',
    },
    {
      id: 'lack_standing_info',
      type: 'info',
      prompt:
        'LACK OF STANDING DEFENSE\n\nIf the plaintiff is a debt buyer (LVNV Funding, Portfolio Recovery, Midland Credit, Cavalry SPV, etc.), they must prove a complete chain of assignment from the original creditor to themselves.\n\nInclude this language:\n"Plaintiff lacks standing to bring this action as Plaintiff has failed to establish a valid assignment of the subject debt from the original creditor to Plaintiff."\n\nDebt buyers often purchase thousands of accounts with minimal documentation. If even ONE link in the chain of title is missing or defective, the case should be dismissed.\n\nIn discovery, demand:\n\u2022 The original signed credit agreement\n\u2022 Complete chain of assignment documents\n\u2022 Bill of sale and account-level records\n\u2022 Proof that YOUR specific account was included in the sale',
      showIf: (answers) => answers.which_defense === 'lack_standing',
    },
    {
      id: 'fccpa_info',
      type: 'info',
      prompt:
        'FCCPA / FDCPA VIOLATIONS DEFENSE\n\nIf the collector violated either law, you can raise it as an affirmative defense AND file a counterclaim.\n\nFCCPA (Fla. Stat. \u00A7559.72 / \u00A7559.77): Prohibits 19 specific abusive practices including:\n\u2022 Harassing calls or excessive contact frequency\n\u2022 Threatening to enforce a debt known to be illegitimate\n\u2022 Communicating with your employer before obtaining judgment\n\u2022 Simulating legal process or government authority\n\u2022 Using profane or abusive language\nRemedies: Actual damages + up to $1,000 statutory damages + punitive damages + attorney fees + court costs.\nApplies to BOTH original creditors and third-party collectors.\n\nFDCPA (15 U.S.C. \u00A71692k): Up to $1,000 statutory damages + actual damages + attorney fees. Third-party collectors only.\n\nYou can recover under BOTH statutes if the collector is a third party.',
      showIf: (answers) => answers.which_defense === 'fccpa_fdcpa',
    },
    {
      id: 'improper_service_info',
      type: 'info',
      prompt:
        'IMPROPER SERVICE DEFENSE\n\nFlorida has strict rules for service of process (Fla. Stat. \u00A748.031). Valid service requires:\n\u2022 Personal service by a certified process server or sheriff\n\u2022 Service on a person 15 years or older residing at your address (substituted service)\n\u2022 Service by publication only if you cannot be found after diligent search\n\nIf you were not properly served, raise this defense. If service was defective, the court lacks personal jurisdiction and any resulting judgment is VOID — meaning it can be challenged at any time, even beyond the 1-year limit for other grounds.\n\nInclude: "This Court lacks jurisdiction over Defendant due to insufficiency of service of process."',
      showIf: (answers) => answers.which_defense === 'improper_service',
    },
    {
      id: 'deny_everything_info',
      type: 'info',
      prompt:
        'DENY EVERYTHING — FORCE THEM TO PROVE IT\n\nThis is a strong default strategy. Respond to each allegation with:\n"Defendant denies each and every allegation contained in Paragraph [X] of the Complaint."\n\nOR: "Defendant is without knowledge or information sufficient to form a belief as to the truth of the allegations in Paragraph [X], and therefore denies the same."\n\nDenying everything forces the plaintiff to prove EVERY element of their case with admissible evidence. Many debt buyers cannot do this.\n\nEven when denying everything, ALSO list ALL applicable affirmative defenses in a separate section.',
      showIf: (answers) => answers.which_defense === 'deny_everything' || answers.which_defense === 'not_sure',
    },

    // === Filing Info ===
    {
      id: 'filing_info',
      type: 'info',
      prompt:
        'FILING YOUR ANSWER IN FLORIDA\n\nFlorida requires e-filing through the Florida Courts E-Filing Portal (www.myflcourtaccess.com). Pro se parties may also file in person or by mail at the clerk\'s office.\n\n1. File with the Clerk of Court — e-file (preferred), in person, or by mail\n2. Serve a copy on the plaintiff\'s attorney by mail, email, or hand delivery\n3. File a Certificate of Service proving you served the other side\n4. Keep a file-stamped copy for your records\n\nFiling fee for defendants: NONE in county court (Fla. Stat. \u00A734.041). Circuit court answer fees vary by county — ask the clerk. If you cannot afford fees, file an Application for Determination of Civil Indigent Status.\n\nDeadline: 20 days from service. DO NOT MISS THIS.\n\nNOTE: No pre-suit demand letter is required in Florida for debt collection lawsuits. The first notice you receive may be the lawsuit itself.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.have_complaint === 'yes') {
      items.push({ status: 'done', text: "You have the plaintiff's complaint." })
    } else {
      items.push({ status: 'needed', text: 'Obtain the complaint from the court clerk or via myflcourtaccess.com.' })
    }

    if (answers.know_deadline === 'yes') {
      items.push({ status: 'done', text: 'You know your filing deadline.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your deadline: 20 days from service (Fla. R. Civ. P. 1.140(a)(1)).',
      })
    }

    // Missed deadline
    if (answers.missed_deadline === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a Motion to Vacate Default immediately (Fla. R. Civ. P. 1.540(b)). Show excusable neglect, due diligence, and a meritorious defense.',
      })
    }

    // Court type
    const courtLabels: Record<string, string> = {
      small_claims: 'Small Claims ($8,000 or less)',
      county_court: 'County Court ($8,001-$50,000)',
      circuit_court: 'Circuit Court (over $50,000)',
      unsure: 'Court type unknown — check your summons',
    }
    if (answers.case_classification) {
      items.push({
        status: 'info',
        text: `Court: ${courtLabels[answers.case_classification] || answers.case_classification}. Specific denials required for all FL court types.`,
      })
    }

    const defenseLabels: Record<string, string> = {
      sol_expired: 'Statute of limitations expired (Fla. Stat. \u00A795.11)',
      lack_standing: 'Lack of standing (debt buyer)',
      wrong_party: 'Wrong party / identity theft',
      amount_disputed: 'Disputed amount',
      already_paid: 'Debt already paid',
      fccpa_fdcpa: 'FCCPA / FDCPA violations',
      improper_service: 'Improper service of process',
      deny_everything: 'Deny all allegations',
      not_sure: 'Deny all allegations (recommended)',
    }

    if (answers.which_defense) {
      items.push({
        status: 'info',
        text: `Primary defense: ${defenseLabels[answers.which_defense] || answers.which_defense}.`,
      })
    }

    items.push({
      status: 'needed',
      text: 'File Answer with ALL affirmative defenses within 20 days. E-file via myflcourtaccess.com or file at the clerk\u2019s office. Serve copy on plaintiff\u2019s attorney and file a Certificate of Service.',
    })

    return items
  },
}
