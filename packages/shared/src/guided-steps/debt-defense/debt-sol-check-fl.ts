import type { GuidedStepConfig } from '../types'

export const debtSolCheckFlConfig: GuidedStepConfig = {
  title: 'Check Statute of Limitations',
  reassurance:
    'In Florida, creditors only have a limited time to sue. If that time has passed, you may have a complete defense.',

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
        { value: 'open_account', label: 'Open account / store account' },
        { value: 'promissory_note', label: 'Promissory note' },
      ],
    },
    {
      id: 'sol_restart_warning',
      type: 'info',
      prompt:
        'IMPORTANT: Do NOT call the collector or make any payment before checking your statute of limitations.\n\nIn Florida, a partial payment restarts the SOL clock under Fla. Stat. §95.051. A written acknowledgment signed by you can also restart or even revive an expired SOL under Fla. Stat. §95.04.\n\nOnce the SOL has fully expired, only a new written and signed acknowledgment or promise to pay can revive it — an oral admission alone is NOT enough (Fla. Stat. §95.04). However, while the SOL is still running, ANY partial payment resets the clock.',
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
        'Any partial payment while the SOL is still running restarts the clock in Florida under Fla. Stat. §95.051. Be honest — this affects your defense strategy.',
    },
    {
      id: 'sol_restart_info',
      type: 'info',
      prompt:
        'Since you made a payment after default, the SOL has likely restarted from that payment date under Fla. Stat. §95.051. Use the date of your most recent payment as the start date.\n\nImportant distinction: If the SOL had already fully expired BEFORE you made the payment, Fla. Stat. §95.04 requires a written and signed acknowledgment to revive it — a payment alone on a fully time-barred debt should NOT revive the SOL. However, courts have interpreted this differently, so consult an attorney if this applies to you.',
      showIf: (answers) => answers.recent_payment === 'yes',
    },
    {
      id: 'written_acknowledgment',
      type: 'yes_no',
      prompt: 'Have you signed anything or sent a written communication acknowledging you owe this debt?',
      helpText:
        'Under Fla. Stat. §95.04, a written acknowledgment or promise to pay signed by you can restart or revive the SOL — even after it has expired. An oral acknowledgment alone does NOT revive an expired SOL.',
      showIf: (answers) => answers.recent_payment !== 'yes',
    },
    {
      id: 'written_ack_warning',
      type: 'info',
      prompt:
        'A written acknowledgment signed by you can restart or revive the SOL under Fla. Stat. §95.04. If you signed a new payment agreement, promissory note, or sent a letter acknowledging the debt, the clock may have restarted or been revived from that date.\n\nImportant: An oral acknowledgment does NOT revive an expired SOL — the acknowledgment must be in writing AND signed by you.',
      showIf: (answers) => answers.written_acknowledgment === 'yes',
    },

    // === SOL by debt type ===
    {
      id: 'sol_credit_card_info',
      type: 'info',
      prompt:
        'Florida SOL for credit card debt: 5 YEARS if written agreement (Fla. Stat. §95.11(2)(b)), or 4 YEARS if treated as open account (§95.11(3)(k))\n\nThere is a legal dispute over classification. If the creditor can produce a signed cardholder agreement, the 5-year written contract SOL applies. If they cannot, you can argue the debt is an open account subject to the shorter 4-year SOL. This classification can be decisive for debts between 4 and 5 years old.\n\nIf more than 5 years have passed since your last payment or default, the creditor is time-barred regardless of classification. You MUST raise this as an affirmative defense in your Answer.',
      showIf: (answers) => answers.debt_type === 'credit_card' && !!answers.last_activity_date,
    },
    {
      id: 'sol_medical_info',
      type: 'info',
      prompt:
        'Florida SOL for medical debt: 3 YEARS from referral to third-party collector (HB 7089, effective July 1, 2024)\n\nAs of July 1, 2024, Florida law provides a special 3-year SOL for medical debt, running from the date the facility refers the debt to a third-party collector. This is shorter than the general 5-year written contract SOL.\n\nAdditional protections under HB 7089: Hospitals and ambulatory surgical centers must make reasonable efforts to determine if you qualify for financial assistance before pursuing extraordinary collection actions (lawsuits, wage garnishment, or property liens). Licensed facilities must also post standard charges online and provide cost estimates.',
      showIf: (answers) => answers.debt_type === 'medical' && !!answers.last_activity_date,
    },
    {
      id: 'sol_personal_loan_info',
      type: 'info',
      prompt:
        'Florida SOL for written personal loans: 5 YEARS (Fla. Stat. §95.11(2)(b))\n\nIf more than 5 years have passed since your last payment or default, the creditor is time-barred from suing you.',
      showIf: (answers) => answers.debt_type === 'personal_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_auto_loan_info',
      type: 'info',
      prompt:
        'Florida SOL for auto loans: 5 YEARS (Fla. Stat. §95.11(2)(b))\n\nAuto loans are written contracts. If more than 5 years have passed since your last payment or default, the creditor is time-barred from suing you.',
      showIf: (answers) => answers.debt_type === 'auto_loan' && !!answers.last_activity_date,
    },
    {
      id: 'sol_oral_info',
      type: 'info',
      prompt:
        'Florida SOL for oral agreements: 4 YEARS (Fla. Stat. §95.11(3)(k))\n\nIf you had a verbal agreement with no written contract, the creditor has only 4 years from default to file suit. If they waited longer, this is a complete defense — but you MUST raise it in your Answer.',
      showIf: (answers) => answers.debt_type === 'oral_agreement' && !!answers.last_activity_date,
    },
    {
      id: 'sol_open_account_info',
      type: 'info',
      prompt:
        'Florida SOL for open accounts / store accounts: 4 YEARS (Fla. Stat. §95.11(3)(k))\n\nAn open account is one where items are sold on credit without a formal written agreement. Store accounts and similar running balances without signed contracts fall into this category.',
      showIf: (answers) => answers.debt_type === 'open_account' && !!answers.last_activity_date,
    },
    {
      id: 'sol_promissory_note_info',
      type: 'info',
      prompt:
        'Florida SOL for promissory notes: 5 YEARS (Fla. Stat. §95.11(2)(b))\n\nPromissory notes are written instruments. If more than 5 years have passed since your default, the creditor is time-barred. Note: Mortgage-related promissory notes may have different rules — Florida has a separate 5-year foreclosure SOL with additional complexity.',
      showIf: (answers) => answers.debt_type === 'promissory_note' && !!answers.last_activity_date,
    },

    // === FCCPA protections ===
    {
      id: 'fccpa_disclosure',
      type: 'info',
      prompt:
        'Florida Consumer Collection Practices Act (FCCPA — Fla. Stat. §559.55–559.785)\n\nFlorida has its own state debt collection law in addition to the federal FDCPA. Under §559.72, collectors are prohibited from:\n\n1. Claiming or threatening to enforce a debt they know is illegitimate\n2. Asserting legal rights they know do not exist\n3. Using threats, harassment, or abuse in collecting debts\n4. Communicating with your employer about debts without a court judgment\n5. Disclosing information affecting your reputation to third parties without legitimate business need\n\nIf a collector sues on a time-barred debt or threatens to do so knowing the SOL has expired, they may be violating §559.72.\n\nRemedies: actual damages + up to $1,000 statutory damages + punitive damages + attorney fees + court costs. You have 2 YEARS to file an FCCPA claim — double the 1-year federal FDCPA window.',
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
        'Suing on Time-Barred Debt — Your Options\n\nIf a collector sues on a time-barred debt in Florida:\n\n1. Raise the SOL as an affirmative defense in your Answer — the court will NOT raise it for you\n2. The case should be dismissed\n3. Filing suit on known time-barred debt may violate the FCCPA (§559.72) and federal FDCPA (§1692e) — creating a counterclaim for damages\n4. Under the FCCPA, you may recover actual damages + up to $1,000 statutory damages + punitive damages + attorney fees\n5. Under the FDCPA, you may recover actual damages + up to $1,000 statutory damages + attorney fees\n\nDocument when the collector first contacted you and whether they disclosed the SOL had expired. Also note: HB 837 (2023) reduced the negligence SOL to 2 years but did NOT change the debt collection SOL.',
      showIf: (answers) => answers.time_barred_lawsuit === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const solYearsMap: Record<string, number> = {
      credit_card: 5,
      medical: 3,
      personal_loan: 5,
      auto_loan: 5,
      oral_agreement: 4,
      open_account: 4,
      promissory_note: 5,
    }

    const debtLabels: Record<string, string> = {
      credit_card: 'Credit card',
      medical: 'Medical debt',
      personal_loan: 'Personal loan',
      auto_loan: 'Auto loan',
      oral_agreement: 'Oral agreement',
      open_account: 'Open account / store account',
      promissory_note: 'Promissory note',
    }

    const statuteMap: Record<string, string> = {
      credit_card: '§95.11(2)(b) / §95.11(3)(k)',
      medical: 'HB 7089 (eff. July 1, 2024)',
      personal_loan: '§95.11(2)(b)',
      auto_loan: '§95.11(2)(b)',
      oral_agreement: '§95.11(3)(k)',
      open_account: '§95.11(3)(k)',
      promissory_note: '§95.11(2)(b)',
    }

    const solYears = solYearsMap[answers.debt_type] || 5
    const debtLabel = debtLabels[answers.debt_type] || 'Unknown'
    const statute = statuteMap[answers.debt_type] || '§95.11'

    const creditCardNote =
      answers.debt_type === 'credit_card'
        ? ' (5 years if written agreement; 4 years if open account)'
        : ''

    items.push({
      status: 'done',
      text: `Debt type: ${debtLabel}. Florida SOL: ${solYears} years${creditCardNote} (${statute}).`,
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
          text: 'FCCPA (§559.72): If the collector sued or threatened to sue knowing the SOL expired, you may have a counterclaim for actual damages, up to $1,000 statutory damages, punitive damages, and attorney fees.',
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
        text: 'Payment after default may have restarted the SOL (Fla. Stat. §95.051). Use date of most recent payment as start date.',
      })
    } else if (answers.written_acknowledgment === 'yes') {
      items.push({
        status: 'needed',
        text: 'Written acknowledgment signed by you may have restarted or revived the SOL (Fla. Stat. §95.04). Determine the exact date.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Do NOT make any payment or sign any written acknowledgment. Raise SOL as an affirmative defense in your Answer — the court will not raise it for you.',
    })

    return items
  },
}
