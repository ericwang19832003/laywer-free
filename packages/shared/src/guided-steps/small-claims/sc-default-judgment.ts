import type { GuidedStepConfig } from '../types'

export const scDefaultJudgmentConfig: GuidedStepConfig = {
  title: "Default Judgment — When They Don't Show Up",
  reassurance:
    "If the other side doesn't respond or doesn't show up, you may win automatically.",

  questions: [
    // What is default judgment
    {
      id: 'what_is_default',
      type: 'info',
      prompt:
        "WHAT IS A DEFAULT JUDGMENT?\nThe court rules in your favor because the defendant failed to respond to the lawsuit or failed to appear at the hearing. It's an automatic win — but you still need to prove your damages.",
    },

    // Which side are you
    {
      id: 'your_role',
      type: 'single_choice',
      prompt: 'Which side are you on?',
      options: [
        { value: 'plaintiff', label: "I'm the plaintiff (I filed the case)" },
        { value: 'defendant', label: "I'm the defendant (I was sued)" },
      ],
    },

    // Plaintiff path: when it happens
    {
      id: 'when_it_happens',
      type: 'info',
      prompt:
        "WHEN DEFAULT JUDGMENT HAPPENS:\n- The defendant doesn't file an answer within the deadline (usually 14 days after being served)\n- The defendant doesn't show up at the hearing\n- Either situation can result in a default judgment in your favor",
      showIf: (answers) => answers.your_role === 'plaintiff',
    },

    // Plaintiff: did defendant respond
    {
      id: 'defendant_responded',
      type: 'yes_no',
      prompt: 'Has the defendant responded to your case or appeared in court?',
      showIf: (answers) => answers.your_role === 'plaintiff',
    },

    // How to request it
    {
      id: 'how_to_request',
      type: 'info',
      prompt:
        'HOW TO REQUEST DEFAULT JUDGMENT:\nWhen your case is called and the defendant is not present, tell the judge:\n\n"Your Honor, the defendant is not present. I request a default judgment."\n\nThe judge will verify that the defendant was properly served, then ask you to present your evidence.',
      showIf: (answers) =>
        answers.your_role === 'plaintiff' &&
        answers.defendant_responded === 'no',
    },

    // What you still need to prove
    {
      id: 'prove_damages',
      type: 'info',
      prompt:
        'WHAT YOU STILL NEED TO PROVE:\nEven with a default judgment, you must show the judge your damages. Bring:\n- Contracts, invoices, or receipts showing what you are owed\n- Photos or documentation of damage\n- Records of communication with the defendant\n- A clear explanation of how you calculated your damages\n\nThe judge can award up to what you asked for — but only if you prove it.',
      showIf: (answers) => answers.your_role === 'plaintiff',
    },

    // Have evidence ready
    {
      id: 'have_evidence',
      type: 'yes_no',
      prompt: 'Do you have your evidence organized and ready to present?',
      showIf: (answers) => answers.your_role === 'plaintiff',
    },

    // Defendant path: got defaulted
    {
      id: 'defendant_defaulted_info',
      type: 'info',
      prompt:
        "IF YOU RECEIVED A DEFAULT JUDGMENT AGAINST YOU:\nYou can file a Motion to Set Aside Default Judgment within 30 days if you have a valid reason. Valid reasons include:\n- You didn't receive proper notice of the lawsuit\n- You had a medical or family emergency\n- Military deployment or service\n- You filed an answer but it wasn't recorded\n\nAct quickly — after 30 days, your options become much more limited.",
      showIf: (answers) => answers.your_role === 'defendant',
    },

    // Defendant: have valid reason
    {
      id: 'have_valid_reason',
      type: 'yes_no',
      prompt: 'Do you have a valid reason for missing the deadline or hearing?',
      showIf: (answers) => answers.your_role === 'defendant',
    },

    // Defendant: how to file motion
    {
      id: 'how_to_set_aside',
      type: 'info',
      prompt:
        'HOW TO FILE A MOTION TO SET ASIDE:\n1. Go to the JP court clerk where the judgment was entered\n2. File a "Motion to Set Aside Default Judgment"\n3. Explain your reason for not appearing (attach proof if you have it)\n4. Ask for a new hearing date\n5. You may need to pay a filing fee\n6. The judge will decide whether to grant your motion\n\nIf granted, you get a new hearing where you can present your defense.',
      showIf: (answers) =>
        answers.your_role === 'defendant' &&
        answers.have_valid_reason === 'yes',
    },

    // Defendant: no valid reason
    {
      id: 'no_valid_reason_info',
      type: 'info',
      prompt:
        'Without a valid reason, setting aside a default judgment is difficult. You may still want to:\n- Consult with an attorney about your options\n- Consider negotiating a payment plan with the plaintiff\n- Check if the judgment amount is correct',
      showIf: (answers) =>
        answers.your_role === 'defendant' &&
        answers.have_valid_reason === 'no',
    },

    // Days since judgment (defendant)
    {
      id: 'days_since_judgment',
      type: 'single_choice',
      prompt: 'How long ago was the default judgment entered?',
      options: [
        { value: 'under_30', label: 'Less than 30 days ago' },
        { value: 'over_30', label: 'More than 30 days ago' },
        { value: 'not_sure', label: 'Not sure' },
      ],
      showIf: (answers) => answers.your_role === 'defendant',
    },

    {
      id: 'urgency_warning',
      type: 'info',
      prompt:
        'TIME IS CRITICAL. You must file your Motion to Set Aside within 30 days of the judgment. If you are close to or past the deadline, go to the courthouse immediately or contact an attorney.',
      showIf: (answers) =>
        answers.your_role === 'defendant' &&
        (answers.days_since_judgment === 'over_30' ||
          answers.days_since_judgment === 'not_sure'),
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.your_role === 'plaintiff') {
      if (answers.defendant_responded === 'no') {
        items.push({
          status: 'info',
          text: 'Defendant has not responded. You may be eligible for a default judgment.',
        })
        items.push({
          status: 'needed',
          text: 'At the hearing, tell the judge: "Your Honor, the defendant is not present. I request a default judgment."',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Defendant has responded — default judgment is not available. Prepare for a full hearing.',
        })
      }

      if (answers.have_evidence === 'yes') {
        items.push({
          status: 'done',
          text: 'Evidence is organized and ready to present.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Organize your evidence — you must still prove your damages even for a default judgment.',
        })
      }
    }

    if (answers.your_role === 'defendant') {
      if (answers.days_since_judgment === 'under_30') {
        items.push({
          status: 'info',
          text: 'You are within the 30-day window to file a Motion to Set Aside.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'You may be past the 30-day deadline. Act immediately — go to the courthouse or consult an attorney.',
        })
      }

      if (answers.have_valid_reason === 'yes') {
        items.push({
          status: 'needed',
          text: 'File a Motion to Set Aside Default Judgment at the JP court clerk. Attach proof of your reason for missing the hearing.',
        })
      } else if (answers.have_valid_reason === 'no') {
        items.push({
          status: 'info',
          text: 'Without a valid reason, consider negotiating a payment plan or consulting an attorney.',
        })
      }
    }

    return items
  },
}
