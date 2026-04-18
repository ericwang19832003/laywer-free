import type { GuidedStepConfig } from '../types'

export const debtSolCheckPaConfig: GuidedStepConfig = {
  title: 'Check Statute of Limitations',
  reassurance:
    'In Pennsylvania, creditors only have a limited time to sue. If that time has passed, you may have a complete defense.',

  questions: [
    {
      id: 'debt_type',
      type: 'single_choice',
      prompt: 'What type of debt is this?',
      helpText:
        'In Pennsylvania, most consumer debts have the same 4-year statute of limitations.',
      options: [
        { value: 'credit_card', label: 'Credit card' },
        { value: 'medical', label: 'Medical debt' },
        { value: 'personal_loan', label: 'Personal loan (written)' },
        { value: 'auto_loan', label: 'Auto loan' },
        { value: 'oral_agreement', label: 'Oral agreement (verbal)' },
        { value: 'promissory_note', label: 'Promissory note' },
      ],
    },
    {
      id: 'sol_restart_warning',
      type: 'info',
      prompt:
        'IMPORTANT: Do NOT call the collector or make any payment before checking your statute of limitations.\n\nIn Pennsylvania, making ANY payment — even $1 — restarts the 4-year SOL clock. A verbal or written acknowledgment of the debt can also restart it. Do NOT:\n\n- Make any payment, no matter how small\n- Verbally acknowledge you owe the debt\n- Agree to any payment plan\n- Sign anything\n\nCheck your records instead of calling the collector.',
    },
    {
      id: 'last_activity_date',
      type: 'text',
      prompt:
        'When did you last make a payment, or when did the account go into default?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This is the date the SOL clock started — typically the date you failed to make a required payment.',
    },
    {
      id: 'recent_payment',
      type: 'yes_no',
      prompt: 'Have you made any payment on this debt after it went into default?',
      helpText:
        'Any payment — even $1 — restarts the statute of limitations in Pennsylvania.',
    },
    {
      id: 'sol_restart_info',
      type: 'info',
      prompt:
        'Since you made a payment after default, the 4-year SOL has restarted from that payment date. Use the date of your most recent payment as the new start date.\n\nThis is why it is critical to NEVER make a payment on an old debt without first checking the SOL.',
      showIf: (answers) => answers.recent_payment === 'yes',
    },

    // === Debt originated out of state? ===
    {
      id: 'debt_originated_out_of_state',
      type: 'yes_no',
      prompt: 'Did this debt originate in another state (e.g., the original creditor was in another state)?',
      helpText:
        'Pennsylvania has a "borrowing statute" that may apply a shorter SOL from the originating state.',
    },
    {
      id: 'borrowing_statute_info',
      type: 'info',
      prompt:
        'Pennsylvania Borrowing Statute — 42 Pa.C.S. §5521\n\nIf the debt originated in another state, Pennsylvania applies whichever SOL is SHORTER — Pennsylvania\'s or the originating state\'s. This protects PA residents from creditors who forum-shop to states with longer SOLs.\n\nCheck the SOL in the state where the original creditor was based. If that state has a shorter SOL than PA\'s 4 years, the shorter period applies.',
      showIf: (answers) => answers.debt_originated_out_of_state === 'yes',
    },

    // === SOL by debt type ===
    {
      id: 'sol_credit_card_info',
      type: 'info',
      prompt:
        'Pennsylvania SOL for credit card debt: 4 YEARS (42 Pa.C.S. §5525(a)(8))\n\nIf more than 4 years have passed since your last payment or default, the creditor is time-barred. This is a complete defense — but you MUST raise it in your Answer or New Matter. The court will NOT raise it for you.',
      showIf: (answers) => answers.debt_type === 'credit_card' && !!answers.last_activity_date,
    },
    {
      id: 'sol_medical_info',
      type: 'info',
      prompt:
        'Pennsylvania SOL for medical debt: 4 YEARS (42 Pa.C.S. §5525)\n\nIf more than 4 years have passed since your last payment or default, the creditor is time-barred.',
      showIf: (answers) => answers.debt_type === 'medical' && !!answers.last_activity_date,
    },
    {
      id: 'sol_personal_loan_info',
      type: 'info',
      prompt:
        'Pennsylvania SOL for written personal loans: 4 YEARS (42 Pa.C.S. §5525(a)(8))\n\nIf more than 4 years have passed, the creditor is time-barred.',
      showIf: (answers) => answers.debt_type === 'personal_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_auto_loan_info',
      type: 'info',
      prompt:
        'Pennsylvania SOL for auto loans: 4 YEARS (42 Pa.C.S. §5525)\n\nIf more than 4 years have passed, the creditor is time-barred.',
      showIf: (answers) => answers.debt_type === 'auto_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_oral_info',
      type: 'info',
      prompt:
        'Pennsylvania SOL for oral agreements: 4 YEARS (42 Pa.C.S. §5525(a)(3))\n\nUnlike some states (like California, which has a 2-year SOL for oral agreements), Pennsylvania gives the same 4 years for both oral and written contracts.',
      showIf: (answers) => answers.debt_type === 'oral_agreement' && !!answers.last_activity_date,
    },
    {
      id: 'sol_promissory_note_info',
      type: 'info',
      prompt:
        'Pennsylvania SOL for promissory notes: 4 YEARS (42 Pa.C.S. §5525)\n\nIf more than 4 years have passed, the creditor is time-barred.',
      showIf: (answers) => answers.debt_type === 'promissory_note' && !!answers.last_activity_date,
    },

    // === Time-barred debt ===
    {
      id: 'time_barred_lawsuit',
      type: 'yes_no',
      prompt: 'Do you believe the collector is suing you on a debt that is past the statute of limitations?',
    },
    {
      id: 'time_barred_lawsuit_info',
      type: 'info',
      prompt:
        'Suing on Time-Barred Debt — Your Options\n\nIf a collector sues on a time-barred debt:\n\n1. Raise the SOL as an affirmative defense in your New Matter — the court will NOT raise it for you\n2. The case should be dismissed\n3. Filing suit on known time-barred debt may violate the FDCPA (§1692e) and the FCEUA (73 P.S. §2270.4) — creating a counterclaim\n4. Under the UTPCPL (73 P.S. §201-9.2), you may recover up to treble (3x) actual damages\n\nThe SOL defense is your strongest weapon — do not waive it by failing to raise it.',
      showIf: (answers) => answers.time_barred_lawsuit === 'yes',
    },

    // === Judgment SOL ===
    {
      id: 'judgment_sol_info',
      type: 'info',
      prompt:
        'Judgment Duration in Pennsylvania\n\nIf a judgment has already been entered against you, it is enforceable for 20 YEARS (42 Pa.C.S. §5525(a)(5)). The judgment LIEN on real property lasts 5 years and must be revived. If the lien is not revived within 5 years, it becomes dormant (but can be revived within 10 years with loss of priority).',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const solYears = 4
    const debtLabels: Record<string, string> = {
      credit_card: 'Credit card',
      medical: 'Medical debt',
      personal_loan: 'Personal loan',
      auto_loan: 'Auto loan',
      oral_agreement: 'Oral agreement',
      promissory_note: 'Promissory note',
    }

    const debtLabel = debtLabels[answers.debt_type] || 'Unknown'

    items.push({
      status: 'done',
      text: `Debt type: ${debtLabel}. Pennsylvania SOL: ${solYears} years (42 Pa.C.S. §5525).`,
    })

    if (answers.last_activity_date) {
      const parts = answers.last_activity_date.split('/')
      const activityDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
      const now = new Date()
      const yearsDiff =
        (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

      if (yearsDiff >= solYears) {
        items.push({
          status: 'info',
          text: `Based on your date of ${answers.last_activity_date}, approximately ${Math.floor(yearsDiff)} years have passed. The 4-year SOL appears to have expired. This is a strong defense.`,
        })
      } else {
        const remaining = Math.ceil((solYears - yearsDiff) * 12)
        items.push({
          status: 'info',
          text: `Based on your date of ${answers.last_activity_date}, approximately ${Math.floor(yearsDiff * 12)} months have passed. SOL has not yet expired — approximately ${remaining} months remain.`,
        })
      }
    }

    if (answers.recent_payment === 'yes') {
      items.push({
        status: 'needed',
        text: 'Payment after default has restarted the SOL. Use most recent payment date as start date.',
      })
    }

    if (answers.debt_originated_out_of_state === 'yes') {
      items.push({
        status: 'info',
        text: 'Borrowing statute (42 Pa.C.S. §5521): Check the originating state\'s SOL — if shorter than 4 years, the shorter period applies.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Do NOT make any payment or acknowledgment. Raise SOL in your New Matter / Affirmative Defenses — the court will not raise it for you.',
    })

    return items
  },
}
