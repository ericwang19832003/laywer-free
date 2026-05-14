import type { GuidedStepConfig } from '../types'

export const debtSolCheckCaConfig: GuidedStepConfig = {
  title: 'Check Statute of Limitations',
  reassurance:
    'In California, creditors only have a limited time to sue. If that time has passed, you may have a complete defense.',

  questions: [
    {
      id: 'debt_type',
      type: 'single_choice',
      prompt: 'What type of debt is this?',
      helpText:
        'The statute of limitations varies depending on the type of debt and whether it was a written or oral agreement.',
      options: [
        { value: 'credit_card', label: 'Credit card' },
        { value: 'medical', label: 'Medical debt' },
        { value: 'personal_loan', label: 'Personal loan (written)' },
        { value: 'auto_loan', label: 'Auto loan' },
        { value: 'oral_agreement', label: 'Oral agreement (verbal — no written contract)' },
        { value: 'open_book', label: 'Open book account / account stated' },
        { value: 'promissory_note', label: 'Promissory note' },
      ],
    },
    {
      id: 'sol_restart_warning',
      type: 'info',
      prompt:
        'IMPORTANT: Do NOT call the collector or make any payment before checking your statute of limitations.\n\nIn California, a written acknowledgment of the debt can restart the clock under CCP §360. A partial payment MAY also be construed as restarting the SOL.\n\nHowever, under AB 1526 (Civ. Code §1788.14(e)), a payment on a time-barred debt does NOT revive it for purposes of the Rosenthal Act. Still, avoid making any payment or written acknowledgment until you know your SOL status.',
    },
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
        'Any payment after default may restart the SOL in California. Be honest — this affects your defense strategy.',
    },
    {
      id: 'sol_restart_info',
      type: 'info',
      prompt:
        'Since you made a payment after default, the SOL may have restarted from that payment date under CCP §360. Use the date of your most recent payment as the start date.\n\nHowever, if the debt was already time-barred BEFORE you made the payment, the Rosenthal Act (Civ. Code §1788.14(e)) provides that a payment on time-barred debt does NOT revive it for purposes of the state consumer protection law.',
      showIf: (answers) => answers.recent_payment === 'yes',
    },
    {
      id: 'written_acknowledgment',
      type: 'yes_no',
      prompt: 'Have you signed anything or sent a written communication acknowledging you owe this debt?',
      helpText:
        'A signed writing acknowledging the debt can restart the SOL under CCP §360. An oral promise alone does NOT restart it for written contracts.',
      showIf: (answers) => answers.recent_payment !== 'yes',
    },
    {
      id: 'written_ack_warning',
      type: 'info',
      prompt:
        'A written acknowledgment can restart the SOL under CCP §360. If you signed a new payment agreement or sent a letter acknowledging the debt, the clock may have restarted from that date.\n\nImportant: An oral promise to pay does NOT restart the SOL for written contracts — the acknowledgment must be in writing.',
      showIf: (answers) => answers.written_acknowledgment === 'yes',
    },

    // === SOL by debt type ===
    {
      id: 'sol_credit_card_info',
      type: 'info',
      prompt:
        'California SOL for credit card debt: 4 YEARS (CCP §337(1))\n\nCredit card debt is treated as a written contract. If more than 4 years have passed since your last payment or default, the creditor is time-barred from suing you. This is a complete defense — but you MUST raise it in your Answer.',
      showIf: (answers) => answers.debt_type === 'credit_card' && !!answers.last_activity_date,
    },
    {
      id: 'sol_medical_info',
      type: 'info',
      prompt:
        'California SOL for medical debt: 4 YEARS if written billing agreement (CCP §337), 2 YEARS if oral (CCP §339)\n\nMost medical debt involves written billing agreements, so the 4-year SOL typically applies. Additional protection: Under SB 1061 (2022), paid/settled medical debt cannot appear on credit reports. Under AB 1020, nonprofit hospitals must screen for financial assistance before aggressive collection.',
      showIf: (answers) => answers.debt_type === 'medical' && !!answers.last_activity_date,
    },
    {
      id: 'sol_personal_loan_info',
      type: 'info',
      prompt:
        'California SOL for written personal loans: 4 YEARS (CCP §337(1))\n\nIf more than 4 years have passed since your last payment or default, the creditor is time-barred.',
      showIf: (answers) => answers.debt_type === 'personal_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_auto_loan_info',
      type: 'info',
      prompt:
        'California SOL for auto loans: 4 YEARS (CCP §337(1))\n\nIf more than 4 years have passed since your last payment or default, the creditor is time-barred.',
      showIf: (answers) => answers.debt_type === 'auto_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_oral_info',
      type: 'info',
      prompt:
        'California SOL for oral agreements: 2 YEARS (CCP §339(1))\n\nThis is SHORTER than most other states. If you had a verbal agreement with no written contract, the creditor has only 2 years from default to file suit. If they waited longer, this is a complete defense.',
      showIf: (answers) => answers.debt_type === 'oral_agreement' && !!answers.last_activity_date,
    },
    {
      id: 'sol_open_book_info',
      type: 'info',
      prompt:
        'California SOL for open book accounts / account stated: 4 YEARS (CCP §337(2))\n\nAn "account stated" is when both parties agree on a balance. If you never agreed to the balance or disputed it, challenge the "account stated" theory in your Answer.',
      showIf: (answers) => answers.debt_type === 'open_book' && !!answers.last_activity_date,
    },
    {
      id: 'sol_promissory_note_info',
      type: 'info',
      prompt:
        'California SOL for promissory notes: 4 YEARS (CCP §337)\n\nNegotiable instruments under the UCC may have a 6-year SOL in some cases. If your promissory note is negotiable, the longer period may apply.',
      showIf: (answers) => answers.debt_type === 'promissory_note' && !!answers.last_activity_date,
    },

    // === Time-barred debt disclosure ===
    {
      id: 'time_barred_disclosure',
      type: 'info',
      prompt:
        'AB 1526 Protection for Time-Barred Debt (Civ. Code §1788.14(e))\n\nEffective January 1, 2020, if the debt IS time-barred, the collector is PROHIBITED from attempting to collect without first providing written notice that:\n\n1. The SOL has expired\n2. You cannot be sued for the debt\n3. A payment does not revive the debt under the Rosenthal Act\n\nIf the collector sued you on time-barred debt WITHOUT this disclosure, they may have violated the Rosenthal Act AND the FDCPA — creating a counterclaim opportunity.',
    },

    // === Suing on time-barred debt ===
    {
      id: 'time_barred_lawsuit',
      type: 'yes_no',
      prompt: 'Do you believe the collector is suing you on a debt that is past the statute of limitations?',
    },
    {
      id: 'time_barred_lawsuit_info',
      type: 'info',
      prompt:
        'Suing on Time-Barred Debt — Your Options\n\nIf a collector sues on a time-barred debt:\n\n1. Raise the SOL as an affirmative defense in your Answer — the court will NOT raise it for you\n2. The case should be dismissed\n3. Filing suit on known time-barred debt may violate the Rosenthal Act (§1788.17) and FDCPA (§1692e) — creating a counterclaim for damages\n4. You may recover up to $1,000 statutory damages under each statute, plus actual damages and attorney fees\n\nDocument when the collector first contacted you and whether they disclosed the SOL had expired.',
      showIf: (answers) => answers.time_barred_lawsuit === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const solYears = answers.debt_type === 'oral_agreement' ? 2 : 4
    const debtLabels: Record<string, string> = {
      credit_card: 'Credit card',
      medical: 'Medical debt',
      personal_loan: 'Personal loan',
      auto_loan: 'Auto loan',
      oral_agreement: 'Oral agreement',
      open_book: 'Open book / account stated',
      promissory_note: 'Promissory note',
    }

    const debtLabel = debtLabels[answers.debt_type] || 'Unknown'
    const statute = answers.debt_type === 'oral_agreement' ? 'CCP §339(1)' : 'CCP §337'

    items.push({
      status: 'done',
      text: `Debt type: ${debtLabel}. California SOL: ${solYears} years (${statute}).`,
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
          text: `Based on your date of ${answers.last_activity_date}, approximately ${Math.floor(yearsDiff)} years have passed. The ${solYears}-year SOL appears to have expired. This is a strong defense.`,
        })
        items.push({
          status: 'info',
          text: 'AB 1526: Collector must have disclosed SOL expiration before collecting. If they did not, you may have a Rosenthal Act counterclaim.',
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
        text: 'Payment after default may have restarted the SOL (CCP §360). Use date of most recent payment as start date.',
      })
    } else if (answers.written_acknowledgment === 'yes') {
      items.push({
        status: 'needed',
        text: 'Written acknowledgment may have restarted the SOL (CCP §360). Determine the exact date.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Do NOT make any payment or written acknowledgment. Raise SOL as an affirmative defense in your Answer — the court will not raise it for you.',
    })

    return items
  },
}
