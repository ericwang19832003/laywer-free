import type { GuidedStepConfig } from '../types'

export const debtConfessionJudgmentPaConfig: GuidedStepConfig = {
  title: 'Challenge a Confession of Judgment',
  reassurance:
    'A confession of judgment is alarming, but Pennsylvania law gives you tools to challenge it. Many can be opened or struck.',

  questions: [
    // === What is it? ===
    {
      id: 'coj_explanation',
      type: 'info',
      prompt:
        'WHAT IS A CONFESSION OF JUDGMENT (COGNOVIT NOTE)?\n\n' +
        'A confession of judgment means you signed a contract that contained a clause allowing the creditor to obtain a court judgment against you WITHOUT:\n' +
        '• Filing a lawsuit\n' +
        '• Giving you notice\n' +
        '• Holding a hearing\n\n' +
        'The creditor simply files the note and a praecipe (request) with the court, and the Prothonotary enters judgment immediately. You typically discover it when your bank account is levied, a lien appears on your property, or you receive a letter from the creditor\'s attorney.',
    },
    {
      id: 'is_this_you',
      type: 'yes_no',
      prompt: 'Is this what happened to you — a judgment was entered without you being sued first?',
    },
    {
      id: 'not_coj_info',
      type: 'info',
      prompt:
        'If you were served with a lawsuit and a judgment was entered after you didn\'t respond, that is a DEFAULT judgment, not a confession of judgment. Use the "After the Ruling" guide instead, which covers how to open default judgments in Pennsylvania.',
      showIf: (answers) => answers.is_this_you === 'no',
    },

    // === How did you learn? ===
    {
      id: 'how_learned',
      type: 'single_choice',
      prompt: 'How did you learn about the confession of judgment?',
      options: [
        { value: 'bank_levy', label: 'My bank account was frozen or levied' },
        { value: 'lien', label: 'I discovered a lien on my property' },
        { value: 'credit_report', label: 'I saw it on my credit report' },
        { value: 'letter', label: 'I received a letter from the creditor or their attorney' },
        { value: 'other', label: 'Other' },
      ],
      showIf: (answers) => answers.is_this_you === 'yes',
    },
    {
      id: 'timing_warning',
      type: 'info',
      prompt:
        'TIMING IS CRITICAL: Your ability to challenge a confession of judgment depends on acting quickly. The sooner you file, the stronger your case. Courts evaluate "promptness" based on when you LEARNED of the judgment — the clock starts NOW.',
      showIf: (answers) => answers.is_this_you === 'yes',
    },

    // === Two challenges ===
    {
      id: 'challenges_overview',
      type: 'info',
      prompt:
        'TWO WAYS TO CHALLENGE UNDER Pa.R.C.P. 2959:\n\n' +
        '1. PETITION TO STRIKE OFF JUDGMENT\n' +
        '   The judgment is void ON ITS FACE — there is a fatal defect in the documents filed with the court. This is a matter of LAW (the court looks only at the documents, not outside evidence).\n\n' +
        '   Grounds to strike:\n' +
        '   • The confession of judgment clause is defective or ambiguous\n' +
        '   • The amount entered is wrong on its face\n' +
        '   • The note was not properly executed (missing signature, wrong party)\n' +
        '   • The warrant of attorney is too broad or vague\n' +
        '   • The confession was entered in the wrong county\n\n' +
        '2. PETITION TO OPEN JUDGMENT\n' +
        '   The judgment should be reconsidered because there are facts outside the documents that make it unfair. You must show ALL THREE:\n\n' +
        '   (a) PROMPT FILING — you acted promptly after learning of the judgment (ideally within 30 days)\n' +
        '   (b) MERITORIOUS DEFENSE — a valid reason the judgment is wrong\n' +
        '   (c) CLEAR, DIRECT, PRECISE, AND BELIEVABLE EVIDENCE — your supporting evidence must meet this standard',
      showIf: (answers) => answers.is_this_you === 'yes',
    },
    {
      id: 'single_petition_warning',
      type: 'info',
      prompt:
        'IMPORTANT: All grounds for striking AND opening must be raised in a SINGLE petition. You cannot file one petition to strike and a separate petition to open. If you have grounds for both, include both in the same filing.\n\n' +
        'Structure your petition as: "Petition to Strike Off and/or Open Confession of Judgment"',
      showIf: (answers) => answers.is_this_you === 'yes',
    },

    // === Which challenge applies? ===
    {
      id: 'defect_on_face',
      type: 'yes_no',
      prompt: 'Looking at the judgment documents, do you see any obvious defects (wrong amount, missing signature, wrong name, improper clause)?',
      helpText:
        'Request a copy of the filed documents from the Prothonotary if you haven\'t already. Look at the note, the warrant of attorney clause, and the praecipe.',
      showIf: (answers) => answers.is_this_you === 'yes',
    },
    {
      id: 'strike_info',
      type: 'info',
      prompt:
        'A petition to strike is the stronger remedy because the court looks only at the documents — no factual disputes. If the defect is clear, the court MUST strike the judgment. Get copies of all filed documents and identify the specific defect in your petition.',
      showIf: (answers) =>
        answers.is_this_you === 'yes' && answers.defect_on_face === 'yes',
    },

    // === Meritorious defenses ===
    {
      id: 'defense_type',
      type: 'single_choice',
      prompt: 'Which best describes your situation?',
      options: [
        { value: 'fraud', label: 'I was tricked or deceived into signing' },
        { value: 'duress', label: 'I was pressured or threatened into signing' },
        { value: 'already_paid', label: 'I already paid this debt (in full or substantially)' },
        { value: 'amount_wrong', label: 'The judgment amount is wrong (includes charges I don\'t owe)' },
        { value: 'payments_not_credited', label: 'Payments I made were not credited' },
        { value: 'unconscionable', label: 'The contract terms are unconscionable (extremely unfair)' },
        { value: 'multiple', label: 'More than one of the above' },
        { value: 'none', label: 'None of the above / I\'m not sure' },
      ],
      showIf: (answers) => answers.is_this_you === 'yes',
    },
    {
      id: 'defense_details',
      type: 'info',
      prompt:
        'COMMON MERITORIOUS DEFENSES:\n\n' +
        '• FRAUD IN INDUCEMENT — You were told the clause meant something different, or key terms were hidden or misrepresented.\n\n' +
        '• UNCONSCIONABILITY — The terms are so one-sided that no reasonable person would agree (common in consumer contracts with hidden confession clauses).\n\n' +
        '• AMOUNT WRONG — The creditor inflated the amount with unauthorized fees, incorrect interest, or charges after the contract ended.\n\n' +
        '• ALREADY SATISFIED — You paid the debt but the creditor entered judgment anyway.\n\n' +
        '• PAYMENTS NOT CREDITED — You made payments that were not applied to the balance.\n\n' +
        'Consumer protection note: Courts apply HEIGHTENED SCRUTINY to confession of judgment clauses in consumer contracts. The clause must be clear, specific, and the consumer must have genuinely understood what they were agreeing to.',
      showIf: (answers) =>
        answers.is_this_you === 'yes' &&
        answers.defense_type !== undefined &&
        answers.defense_type !== 'none',
    },

    // === Jury right ===
    {
      id: 'jury_right',
      type: 'info',
      prompt:
        'IMPORTANT RULE: If the evidence you present in support of opening the judgment would require a JURY to decide the facts (i.e., there is a genuine factual dispute), the court SHALL open the judgment. This is a strong standard in your favor — the court cannot weigh credibility at this stage.',
      showIf: (answers) => answers.is_this_you === 'yes',
    },

    // === Stay of execution ===
    {
      id: 'stay_needed',
      type: 'yes_no',
      prompt: 'Is the creditor currently executing on the judgment (levying your bank account, enforcing a lien)?',
      showIf: (answers) => answers.is_this_you === 'yes',
    },
    {
      id: 'stay_info',
      type: 'info',
      prompt:
        'REQUEST A STAY OF EXECUTION:\n\n' +
        'Include a request for a stay in your petition. The court has discretion to stop the creditor from enforcing the judgment while your petition is being decided. This can prevent further bank levies or lien enforcement.\n\n' +
        'If the situation is urgent (bank account frozen, funds about to be taken), you may also file an Emergency Motion for Stay.',
      showIf: (answers) =>
        answers.is_this_you === 'yes' && answers.stay_needed === 'yes',
    },

    // === Where to file ===
    {
      id: 'where_to_file',
      type: 'info',
      prompt:
        'WHERE TO FILE YOUR PETITION:\n\n' +
        'You can file in:\n' +
        '• The county where the judgment was originally entered\n' +
        '• The county where the judgment was transferred\n' +
        '• The county where execution is being sought\n\n' +
        'File at the Prothonotary\'s office. You must serve a copy on the creditor\'s attorney.',
      showIf: (answers) => answers.is_this_you === 'yes',
    },

    // === PA wage protection reminder ===
    {
      id: 'wage_protection_reminder',
      type: 'info',
      prompt:
        'REMEMBER: Even with a confession of judgment, Pennsylvania\'s wage garnishment protection still applies. Your wages CANNOT be garnished for consumer debt (42 Pa.C.S.A. §8127). The creditor\'s main enforcement tools are bank account execution and property liens.',
      showIf: (answers) => answers.is_this_you === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.is_this_you === 'no') {
      items.push({
        status: 'info',
        text: 'This does not appear to be a confession of judgment. If a judgment was entered after you failed to respond to a lawsuit, use the "After the Ruling" guide to explore options for opening a default judgment.',
      })
      return items
    }

    items.push({
      status: 'info',
      text: 'A confession of judgment was entered against you. You can challenge it under Pa.R.C.P. 2959 by filing a Petition to Strike Off and/or Open the Judgment.',
    })

    items.push({
      status: 'needed',
      text: 'ACT QUICKLY — promptness is one of the three requirements. File your petition as soon as possible, ideally within 30 days of learning about the judgment.',
    })

    items.push({
      status: 'needed',
      text: 'Get copies of all filed documents from the Prothonotary (the note, warrant of attorney, praecipe, and judgment entry).',
    })

    if (answers.defect_on_face === 'yes') {
      items.push({
        status: 'needed',
        text: 'Include a Petition to Strike in your filing — identify the specific facial defect in the documents. The court MUST strike a facially defective judgment.',
      })
    }

    if (
      answers.defense_type &&
      answers.defense_type !== 'none'
    ) {
      const defenseMap: Record<string, string> = {
        fraud: 'fraud in inducement',
        duress: 'duress',
        already_paid: 'debt already satisfied',
        amount_wrong: 'incorrect judgment amount',
        payments_not_credited: 'uncredited payments',
        unconscionable: 'unconscionability',
        multiple: 'multiple defenses',
      }
      const defense = defenseMap[answers.defense_type] || answers.defense_type
      items.push({
        status: 'needed',
        text: `Include a Petition to Open based on: ${defense}. You must show (1) prompt filing, (2) this meritorious defense, and (3) clear, direct, precise, believable evidence.`,
      })
    }

    items.push({
      status: 'info',
      text: 'All grounds (strike AND open) must be raised in a SINGLE petition. You cannot file separate petitions.',
    })

    if (answers.stay_needed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Request a stay of execution in your petition to prevent further bank levies and lien enforcement while the petition is decided.',
      })
    }

    items.push({
      status: 'info',
      text: 'Your wages CANNOT be garnished for consumer debt in Pennsylvania, even with a confession of judgment (42 Pa.C.S.A. §8127).',
    })

    items.push({
      status: 'info',
      text: 'If the evidence creates a factual dispute, the court SHALL open the judgment. Consumer contracts with confession clauses face heightened scrutiny.',
    })

    return items
  },
}
