import type { GuidedStepConfig } from '../types'

export const debtSolCheckConfig: GuidedStepConfig = {
  title: 'Check Statute of Limitations',
  reassurance:
    'In Texas, creditors only have a limited time to sue. If that time has passed, you may have a complete defense.',

  questions: [
    {
      id: 'debt_type',
      type: 'single_choice',
      prompt: 'What type of debt is this?',
      helpText:
        'The statute of limitations varies depending on the type of debt. Select the option that best describes your situation.',
      options: [
        { value: 'credit_card', label: 'Credit card' },
        { value: 'medical', label: 'Medical debt' },
        { value: 'personal_loan', label: 'Personal loan' },
        { value: 'auto_loan', label: 'Auto loan' },
        { value: 'promissory_note', label: 'Promissory note (written)' },
        { value: 'oral_agreement', label: 'Oral agreement (verbal)' },
      ],
    },
    {
      id: 'sol_restart_warning',
      type: 'info',
      prompt:
        'IMPORTANT: Do NOT call the collector or make any payment before checking your statute of limitations. In Texas, making a payment or written acknowledgment of the debt restarts the clock — giving the collector 4 more years to sue you. Check your records instead of calling.',
    },
    {
      id: 'last_activity_date',
      type: 'text',
      prompt:
        'When did you last make a payment, or when did the account go into default?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This is the date the statute of limitations clock started. If you made a partial payment after default, the clock may have restarted from that date.',
    },
    {
      id: 'recent_payment',
      type: 'yes_no',
      prompt: 'Have you made any payment on this debt in the last 4 years, even a small one?',
      helpText: 'Any payment — even $1 — restarts the statute of limitations in Texas.',
    },
    {
      id: 'sol_restart_info',
      type: 'info',
      prompt:
        'Since you made a payment, the statute of limitations may have restarted from that payment date. Use the date of your most recent payment as the start date instead of the original default date.',
      showIf: (answers) => answers.recent_payment === 'yes',
    },
    {
      id: 'sol_credit_card_info',
      type: 'info',
      prompt:
        'In Texas, the statute of limitations for credit card debt is 4 years (Tex. Civ. Prac. & Rem. Code § 16.004). If more than 4 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense — the case should be dismissed.',
      showIf: (answers) => answers.debt_type === 'credit_card' && !!answers.last_activity_date,
    },
    {
      id: 'sol_medical_info',
      type: 'info',
      prompt:
        'In Texas, the statute of limitations for medical debt is 4 years (Tex. Civ. Prac. & Rem. Code § 16.004). If more than 4 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense.',
      showIf: (answers) => answers.debt_type === 'medical' && !!answers.last_activity_date,
    },
    {
      id: 'sol_personal_loan_info',
      type: 'info',
      prompt:
        'In Texas, the statute of limitations for personal loans is 4 years (Tex. Civ. Prac. & Rem. Code § 16.004). If more than 4 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense.',
      showIf: (answers) => answers.debt_type === 'personal_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_auto_loan_info',
      type: 'info',
      prompt:
        'In Texas, the statute of limitations for auto loans is 4 years (Tex. Civ. Prac. & Rem. Code § 16.004). If more than 4 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense.',
      showIf: (answers) => answers.debt_type === 'auto_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_promissory_note_info',
      type: 'info',
      prompt:
        'In Texas, the statute of limitations for a written promissory note is 6 years (Tex. Civ. Prac. & Rem. Code § 16.004(c)). If more than 6 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense.',
      showIf: (answers) => answers.debt_type === 'promissory_note' && !!answers.last_activity_date,
    },
    {
      id: 'sol_oral_agreement_info',
      type: 'info',
      prompt:
        'In Texas, the statute of limitations for an oral agreement is 4 years (Tex. Civ. Prac. & Rem. Code § 16.004). If more than 4 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense.',
      showIf: (answers) => answers.debt_type === 'oral_agreement' && !!answers.last_activity_date,
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const solYears = answers.debt_type === 'promissory_note' ? 6 : 4
    const debtLabels: Record<string, string> = {
      credit_card: 'Credit card',
      medical: 'Medical debt',
      personal_loan: 'Personal loan',
      auto_loan: 'Auto loan',
      promissory_note: 'Promissory note',
      oral_agreement: 'Oral agreement',
    }

    const debtLabel = debtLabels[answers.debt_type] || 'Unknown'

    items.push({
      status: 'done',
      text: `Debt type: ${debtLabel}. Texas statute of limitations: ${solYears} years (Tex. Civ. Prac. & Rem. Code § 16.004).`,
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
          text: `Based on your date of ${answers.last_activity_date}, approximately ${Math.floor(yearsDiff)} years have passed. The ${solYears}-year statute of limitations appears to have expired. This is a strong defense — the case should be dismissed.`,
        })
      } else {
        const remaining = Math.ceil((solYears - yearsDiff) * 12)
        items.push({
          status: 'info',
          text: `Based on your date of ${answers.last_activity_date}, approximately ${Math.floor(yearsDiff * 12)} months have passed. The statute of limitations has not yet expired — approximately ${remaining} months remain.`,
        })
      }

      items.push({
        status: 'needed',
        text: 'Warning: making a new payment or acknowledging the debt in writing can restart the statute of limitations clock. Do not make any payments or written promises to pay without legal advice.',
      })
    }

    return items
  },
}
