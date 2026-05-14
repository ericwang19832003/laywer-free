import type { GuidedStepConfig } from '../types'

export const debtSolCheckNyConfig: GuidedStepConfig = {
  title: 'Check Statute of Limitations',
  reassurance:
    'In New York, creditors only have a limited time to sue. If that time has passed, you may have a complete defense. The SOL must be raised as an affirmative defense in your Answer — the court will not raise it for you (CPLR §3211(a)(5)).',

  questions: [
    {
      id: 'debt_type',
      type: 'single_choice',
      prompt: 'What type of debt is this?',
      helpText:
        'The statute of limitations varies depending on the type of debt. In New York, most written and oral contracts share the same 6-year SOL — but consumer credit debt bought by debt buyers may have a shorter 3-year SOL.',
      options: [
        { value: 'credit_card', label: 'Credit card' },
        { value: 'medical', label: 'Medical debt' },
        { value: 'personal_loan', label: 'Personal loan (written)' },
        { value: 'oral_agreement', label: 'Oral agreement (verbal — no written contract)' },
        { value: 'promissory_note', label: 'Promissory note' },
      ],
    },

    // === Consumer Credit Fairness Act questions (credit card) ===
    {
      id: 'is_debt_buyer',
      type: 'yes_no',
      prompt:
        'Is the plaintiff (the party suing you) a debt buyer — meaning they purchased the debt from the original creditor?',
      helpText:
        'A debt buyer is a company that purchases delinquent debts from original creditors (like banks or credit card companies) for pennies on the dollar, then tries to collect the full amount. Common debt buyers include Midland Credit, Portfolio Recovery, LVNV Funding, and Cavalry SPV.',
      showIf: (answers) => answers.debt_type === 'credit_card',
    },
    {
      id: 'default_after_april_2022',
      type: 'yes_no',
      prompt: 'Did you default on this debt on or after April 7, 2022?',
      helpText:
        'The Consumer Credit Fairness Act (CPLR §214-i) took effect April 7, 2022 and reduced the SOL for consumer credit transactions bought by debt buyers to 3 years. The date of default determines which SOL applies.',
      showIf: (answers) =>
        answers.debt_type === 'credit_card' && answers.is_debt_buyer === 'yes',
    },
    {
      id: 'ccfa_short_sol_info',
      type: 'info',
      prompt:
        'Consumer Credit Fairness Act (CPLR §214-i)\n\nBecause the plaintiff is a debt buyer and the default occurred after April 2022, the SOL is 3 YEARS (not 6). This is a significant protection.\n\nAdditionally, the CCFA requires the complaint to include:\n1. Name of the original creditor\n2. Last 4 digits of the account number\n3. Date of default or last payment\n4. Last payment date and amount\n5. Amount of the debt at the time of default\n\nIf ANY of these are missing from the complaint, you can move to dismiss.',
      showIf: (answers) =>
        answers.debt_type === 'credit_card' &&
        answers.is_debt_buyer === 'yes' &&
        answers.default_after_april_2022 === 'yes',
    },
    {
      id: 'ccfa_long_sol_info',
      type: 'info',
      prompt:
        'Since the default occurred before April 2022, the standard 6-year SOL applies to this credit card debt (CPLR §213(2)), even though the plaintiff is a debt buyer.\n\nHowever, the CCFA pleading requirements (original creditor name, last 4 digits, default date, last payment date, amount at default) still apply if the suit was filed after April 7, 2022. If the complaint is missing these details, you can move to dismiss.',
      showIf: (answers) =>
        answers.debt_type === 'credit_card' &&
        answers.is_debt_buyer === 'yes' &&
        answers.default_after_april_2022 === 'no',
    },

    // === SOL restart warning ===
    {
      id: 'sol_restart_warning',
      type: 'info',
      prompt:
        'IMPORTANT: Do NOT make any payment or sign any document before checking your statute of limitations.\n\nIn New York:\n• A partial payment RESTARTS the SOL clock (GOL §17-107)\n• A signed written acknowledgment can REVIVE a dead debt (GOL §17-101)\n• A verbal acknowledgment does NOT restart the SOL\n\nBe very careful — even a small payment can give the creditor a fresh 6-year window to sue.',
    },

    // === Date questions ===
    {
      id: 'last_activity_date',
      type: 'text',
      prompt:
        'When did you last make a payment, or when did the account go into default?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This is the date the SOL clock started. The clock runs from the date of breach — typically when you missed a required payment.',
    },
    {
      id: 'recent_payment',
      type: 'yes_no',
      prompt: 'Have you made any payment on this debt after it went into default?',
      helpText:
        'In New York, ANY partial payment restarts the SOL under GOL §17-107. This is true even for very small payments.',
    },
    {
      id: 'sol_restart_payment_info',
      type: 'info',
      prompt:
        'A partial payment restarts the SOL in New York (GOL §17-107). The SOL clock restarted from the date of your most recent payment. Use that date — not the original default date — when calculating whether the SOL has expired.\n\nThis applies even if the debt was already time-barred before the payment was made.',
      showIf: (answers) => answers.recent_payment === 'yes',
    },
    {
      id: 'written_acknowledgment',
      type: 'yes_no',
      prompt:
        'Have you signed any document acknowledging you owe this debt (e.g., a new payment agreement, settlement letter, or written promise to pay)?',
      helpText:
        'Under GOL §17-101, a signed written acknowledgment can revive a debt even after the SOL has expired. The acknowledgment must be signed by the debtor — an oral or unsigned statement is not enough.',
      showIf: (answers) => answers.recent_payment !== 'yes',
    },
    {
      id: 'written_ack_warning',
      type: 'info',
      prompt:
        'A signed written acknowledgment can revive a time-barred debt in New York (GOL §17-101). The SOL restarts from the date of the written acknowledgment.\n\nKey details:\n• The acknowledgment MUST be signed — unsigned or oral statements do not count\n• It must clearly acknowledge the specific debt\n• A verbal promise to pay does NOT restart the SOL in New York\n• Even a letter saying "I know I owe this" can be enough if signed',
      showIf: (answers) => answers.written_acknowledgment === 'yes',
    },

    // === SOL by debt type ===
    {
      id: 'sol_credit_card_buyer_post2022_info',
      type: 'info',
      prompt:
        'New York SOL for credit card debt (debt buyer, post-April 2022 default): 3 YEARS (CPLR §214-i)\n\nThe Consumer Credit Fairness Act reduced the SOL to 3 years for consumer credit transactions where the plaintiff is a debt buyer and the default occurred after April 7, 2022. If more than 3 years have passed since your last payment or default, the debt buyer is time-barred from suing you.',
      showIf: (answers) =>
        answers.debt_type === 'credit_card' &&
        answers.is_debt_buyer === 'yes' &&
        answers.default_after_april_2022 === 'yes' &&
        !!answers.last_activity_date,
    },
    {
      id: 'sol_credit_card_standard_info',
      type: 'info',
      prompt:
        'New York SOL for credit card debt: 6 YEARS (CPLR §213(2))\n\nCredit card debt is treated as a written contract. If more than 6 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense — but you MUST raise it in your Answer.',
      showIf: (answers) =>
        answers.debt_type === 'credit_card' &&
        !(answers.is_debt_buyer === 'yes' && answers.default_after_april_2022 === 'yes') &&
        !!answers.last_activity_date,
    },
    {
      id: 'sol_medical_info',
      type: 'info',
      prompt:
        'New York SOL for medical debt: 6 YEARS (CPLR §213(2))\n\nMedical debt is treated as a contract obligation. If more than 6 years have passed since your last payment or default, the creditor is time-barred from suing you.',
      showIf: (answers) => answers.debt_type === 'medical' && !!answers.last_activity_date,
    },
    {
      id: 'sol_personal_loan_info',
      type: 'info',
      prompt:
        'New York SOL for written personal loans: 6 YEARS (CPLR §213(2))\n\nIf more than 6 years have passed since your last payment or default, the creditor is time-barred.',
      showIf: (answers) =>
        answers.debt_type === 'personal_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_oral_info',
      type: 'info',
      prompt:
        'New York SOL for oral agreements: 6 YEARS (CPLR §213(2))\n\nUnusually, New York treats oral contracts the same as written contracts — both have a 6-year SOL. This is longer than many other states.',
      showIf: (answers) =>
        answers.debt_type === 'oral_agreement' && !!answers.last_activity_date,
    },
    {
      id: 'sol_promissory_note_info',
      type: 'info',
      prompt:
        'New York SOL for promissory notes: 6 YEARS (CPLR §213(2))\n\nIf more than 6 years have passed since your last payment or default, the creditor is time-barred from suing you.',
      showIf: (answers) =>
        answers.debt_type === 'promissory_note' && !!answers.last_activity_date,
    },

    // === Affirmative defense reminder ===
    {
      id: 'affirmative_defense_reminder',
      type: 'info',
      prompt:
        'SOL Is an Affirmative Defense (CPLR §3211(a)(5))\n\nThe statute of limitations is an AFFIRMATIVE DEFENSE in New York. This means:\n\n1. The court will NOT raise it for you — even if the SOL clearly expired\n2. You MUST include it in your Answer or you WAIVE it permanently\n3. You can also file a pre-answer motion to dismiss under CPLR §3211(a)(5)\n\nIf you fail to raise the SOL defense in your Answer, the creditor can get a judgment against you even on time-barred debt.',
    },

    // === Time-barred lawsuit ===
    {
      id: 'time_barred_lawsuit',
      type: 'yes_no',
      prompt:
        'Do you believe the collector is suing you on a debt that is past the statute of limitations?',
    },
    {
      id: 'time_barred_lawsuit_info',
      type: 'info',
      prompt:
        'Suing on Time-Barred Debt — Your Options\n\nIf a collector sues on a time-barred debt in New York:\n\n1. Raise the SOL as an affirmative defense in your Answer (CPLR §3211(a)(5)) — the court will NOT raise it for you\n2. File a pre-answer motion to dismiss under CPLR §3211(a)(5)\n3. The case should be dismissed\n4. Filing suit on known time-barred debt may violate the FDCPA (§1692e) — creating a counterclaim for damages\n5. Under the Consumer Credit Fairness Act, debt buyers who file on time-barred consumer debt face additional penalties\n\nDocument when the collector first contacted you and all communications.',
      showIf: (answers) => answers.time_barred_lawsuit === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Determine applicable SOL
    const isCcfaShortSol =
      answers.debt_type === 'credit_card' &&
      answers.is_debt_buyer === 'yes' &&
      answers.default_after_april_2022 === 'yes'

    const solYears = isCcfaShortSol ? 3 : 6

    const debtLabels: Record<string, string> = {
      credit_card: 'Credit card',
      medical: 'Medical debt',
      personal_loan: 'Personal loan',
      oral_agreement: 'Oral agreement',
      promissory_note: 'Promissory note',
    }

    const debtLabel = debtLabels[answers.debt_type] || 'Unknown'
    const statute = isCcfaShortSol ? 'CPLR §214-i (CCFA)' : 'CPLR §213(2)'

    items.push({
      status: 'done',
      text: `Debt type: ${debtLabel}. New York SOL: ${solYears} years (${statute}).`,
    })

    if (isCcfaShortSol) {
      items.push({
        status: 'info',
        text: 'Consumer Credit Fairness Act applies — complaint must include original creditor name, last 4 digits, default date, last payment date, and amount at default. Check if the complaint is missing any of these.',
      })
    }

    if (answers.last_activity_date) {
      const parts = answers.last_activity_date.split('/')
      const activityDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
      const now = new Date()
      const yearsDiff =
        (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

      if (yearsDiff >= solYears) {
        const expiryDate = new Date(activityDate)
        expiryDate.setFullYear(expiryDate.getFullYear() + solYears)
        const expiryStr = `${expiryDate.getMonth() + 1}/${expiryDate.getDate()}/${expiryDate.getFullYear()}`

        items.push({
          status: 'info',
          text: `Based on your date of ${answers.last_activity_date}, approximately ${Math.floor(yearsDiff)} years have passed. The ${solYears}-year SOL expired around ${expiryStr}. This is a strong defense — raise it in your Answer.`,
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
        text: 'Payment after default RESTARTED the SOL (GOL §17-107). Use the date of your most recent payment as the SOL start date.',
      })
    } else if (answers.written_acknowledgment === 'yes') {
      items.push({
        status: 'needed',
        text: 'Signed written acknowledgment may have revived the debt (GOL §17-101). Determine the exact date of the signed document — the SOL restarts from that date.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Do NOT make any payment or sign any acknowledgment. Raise SOL as an affirmative defense in your Answer (CPLR §3211(a)(5)) — failure to raise it means you waive it permanently.',
    })

    return items
  },
}
