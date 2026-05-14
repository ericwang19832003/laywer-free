import type { GuidedStepConfig } from '../types'

export const debtPostJudgmentCaConfig: GuidedStepConfig = {
  title: 'After the Ruling',
  reassurance:
    'Understanding your options after judgment is important. California has strong protections for certain income and assets.',

  questions: [
    // === Outcome ===
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'won', label: 'I won (judgment in my favor or case dismissed)' },
        { value: 'lost', label: 'I lost (judgment for the plaintiff)' },
        { value: 'settled', label: 'We settled' },
        { value: 'continued', label: 'Case was continued to another date' },
        { value: 'waiting', label: 'Still waiting for the ruling' },
      ],
    },

    // === WON PATH ===
    {
      id: 'won_info',
      type: 'info',
      prompt:
        'Congratulations! Get a copy of the judgment or dismissal order from the court clerk. Keep it in a safe place — you may need it if the debt appears on your credit report or a collector contacts you again.',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'won_credit_report',
      type: 'yes_no',
      prompt: 'Does this debt still appear on your credit report?',
      helpText:
        'Even after winning, the tradeline may still show. You have the right to dispute it with proof of the judgment.',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'won_credit_report_info',
      type: 'info',
      prompt:
        'Dispute the tradeline with all three bureaus (Equifax, Experian, TransUnion). Include a copy of the judgment or dismissal. They must investigate within 30 days under the FCRA.',
      showIf: (answers) =>
        answers.case_outcome === 'won' && answers.won_credit_report === 'yes',
    },
    {
      id: 'won_violations',
      type: 'yes_no',
      prompt: 'Did the collector violate the law during the case (harassment, false threats, suing on a time-barred debt)?',
      helpText:
        'California\'s Rosenthal Act (Civ. Code §1788+) covers BOTH original creditors and third-party collectors — broader than the federal FDCPA.',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'won_violations_info',
      type: 'info',
      prompt:
        'You may have a counterclaim or separate lawsuit under the Rosenthal Act (up to $1,000 statutory damages per action + actual damages + attorney fees) and/or the FDCPA (up to $1,000 + actual damages + fees). Many consumer attorneys take these on contingency. Consider filing a complaint with the California DFPI (Department of Financial Protection and Innovation).',
      showIf: (answers) =>
        answers.case_outcome === 'won' && answers.won_violations === 'yes',
    },
    {
      id: 'won_court_order',
      type: 'info',
      prompt:
        'Request a certified copy of the court order. If the collector continues to pursue the debt, this order is your proof. Any further collection activity may violate the Rosenthal Act and FDCPA.',
      showIf: (answers) => answers.case_outcome === 'won',
    },

    // === LOST PATH ===
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'A judgment against you is serious, but California has strong protections. Your wages, home, retirement, and public benefits may be partially or fully protected. Let\'s walk through your options.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_default',
      type: 'yes_no',
      prompt: 'Was this a default judgment (entered because you did not respond or appear)?',
      helpText:
        'If you never received proper notice or had a valid reason for not appearing, you may be able to vacate (undo) the judgment.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_vacate_info',
      type: 'info',
      prompt:
        'California has three paths to vacate a default judgment:\n\n' +
        '1. CCP §473(b) — Mistake or excusable neglect. Must file within 6 MONTHS of judgment. Show that your failure to respond was due to mistake, inadvertence, surprise, or excusable neglect. If your attorney caused the default, the court SHALL vacate it (mandatory relief).\n\n' +
        '2. CCP §473.5 — Lack of actual notice. Must file within 2 YEARS of judgment (or 180 days after you learned of it, whichever is earlier). You must show you did not actually receive the summons in time to respond.\n\n' +
        '3. CCP §473(d) — Void judgment. NO TIME LIMIT. If the court lacked jurisdiction (improper service, wrong court, etc.), the judgment is void and can be set aside at any time.\n\n' +
        'You must file a noticed motion with a supporting declaration explaining the facts. Include a copy of your proposed Answer with your motion.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_default === 'yes',
    },
    {
      id: 'lost_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_default !== 'yes',
    },
    {
      id: 'lost_appeal_info',
      type: 'info',
      prompt:
        'You have 30 days from the date of the judgment to file a Notice of Appeal from Superior Court. In limited civil cases (under $25,000), the appeal goes to the Appellate Division of the Superior Court. You must show a legal error — the appellate court does not retry the facts.\n\n' +
        'An appeal does NOT automatically stop collection. You may need to post a bond or request a stay of enforcement.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default !== 'yes' &&
        answers.lost_appeal === 'yes',
    },
    {
      id: 'lost_wage_garnishment',
      type: 'info',
      prompt:
        'WAGE GARNISHMENT LIMITS IN CALIFORNIA:\n\n' +
        'The creditor can garnish the LESSER of:\n' +
        '• 25% of your disposable earnings, OR\n' +
        '• The amount by which your weekly disposable earnings exceed 40 times the California minimum wage\n\n' +
        'California minimum wage is $16.00+/hour (2024). At 40x = $640/week.\n\n' +
        'If your weekly disposable earnings are $640 or less, ZERO can be garnished.\n\n' +
        'You will receive a notice before garnishment begins. You have the right to file a Claim of Exemption (form WG-006) to reduce or eliminate the garnishment based on financial hardship.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_own_home',
      type: 'yes_no',
      prompt: 'Do you own a home in California?',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_homestead_info',
      type: 'info',
      prompt:
        'CALIFORNIA HOMESTEAD EXEMPTION:\n\n' +
        'Thanks to AB 1885 (effective January 1, 2021), California\'s homestead exemption is now between $300,000 and $600,000 — whichever is greater: the median sale price for a home in your county, or $300,000 (but capped at $600,000).\n\n' +
        'This is an AUTOMATIC exemption — you do not need to file a homestead declaration (though filing one provides extra protections against some creditors). A judgment creditor CANNOT force the sale of your home if you would not receive at least the exemption amount from the sale.\n\n' +
        'However, the judgment still creates a lien on your home. You should consider negotiating a lien release or settlement if you plan to sell or refinance.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_own_home === 'yes',
    },
    {
      id: 'lost_vehicle_info',
      type: 'info',
      prompt:
        'VEHICLE EXEMPTION: California exempts $3,325 of equity in a motor vehicle from judgment creditors (CCP §704.010). If your car equity is below this amount, it cannot be seized. If you need the vehicle for work, argue hardship.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_bank_levy',
      type: 'yes_no',
      prompt: 'Are you worried about your bank account being levied?',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_bank_levy_info',
      type: 'info',
      prompt:
        'BANK ACCOUNT LEVY PROTECTIONS:\n\n' +
        '• You have a 15-DAY window to file a Claim of Exemption after receiving the levy notice\n' +
        '• Social Security, SSI, and VA benefits are AUTOMATICALLY protected — the bank must review the last 2 months of deposits and protect federal benefits\n' +
        '• CalWORKs, unemployment, and other public benefits are 100% exempt\n' +
        '• You can claim additional exemptions for amounts needed for basic living expenses\n\n' +
        'File the Claim of Exemption (form EJ-160) immediately upon receiving notice. Do NOT wait.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_bank_levy === 'yes',
    },
    {
      id: 'lost_retirement_info',
      type: 'info',
      prompt:
        'RETIREMENT ACCOUNTS: 401(k), IRA, pension, and other ERISA-qualified retirement accounts are FULLY EXEMPT from judgment creditors in California. A creditor cannot touch your retirement savings.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_public_benefits_info',
      type: 'info',
      prompt:
        'PUBLIC BENEFITS: Social Security, SSI, SDI, unemployment, CalWORKs, CalFresh, VA benefits, and workers\' compensation are 100% exempt from garnishment and levy. These funds cannot be taken by a judgment creditor.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_judgment_renewal',
      type: 'info',
      prompt:
        'JUDGMENT DURATION AND RENEWAL:\n\n' +
        '• Judgments are enforceable for 10 years (CCP §683.020)\n' +
        '• Judgments can be renewed for additional 10-year periods\n' +
        '• Interest accrues at 10% per year on the judgment amount (CCP §685.010)\n' +
        '• A $5,000 judgment becomes $10,000 in 10 years from interest alone\n\n' +
        'If you cannot pay, time may be on your side — some creditors give up or accept reduced settlements as time passes.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_debtor_exam',
      type: 'info',
      prompt:
        'JUDGMENT DEBTOR EXAMINATION:\n\n' +
        'The creditor may serve you with an Order for Appearance and Examination (form AT-138/EJ-125). You MUST attend — failure to appear can result in a bench warrant and arrest.\n\n' +
        'At the exam, you will answer questions under oath about your income, assets, and employment. Be truthful. The creditor uses this information to find assets to collect against.\n\n' +
        'Tip: Bring documentation of all exempt income and assets to the examination.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },

    // === SETTLED PATH ===
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'A settlement is often the best outcome. Make sure you protect yourself by documenting everything.',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'settled_written',
      type: 'yes_no',
      prompt: 'Do you have a WRITTEN settlement agreement?',
      showIf: (answers) => answers.case_outcome === 'settled',
    },
    {
      id: 'settled_written_warning',
      type: 'info',
      prompt:
        'CRITICAL: Get the settlement in writing BEFORE making any payment. A verbal agreement is very difficult to enforce. The written agreement should include:\n' +
        '• The exact amount you will pay\n' +
        '• Payment schedule (if not lump sum)\n' +
        '• That the debt is "settled in full" or "satisfied" upon payment\n' +
        '• That the creditor will file a Satisfaction of Judgment\n' +
        '• That the creditor will not sell or assign the remaining balance\n' +
        '• What they will report to credit bureaus',
      showIf: (answers) =>
        answers.case_outcome === 'settled' && answers.settled_written === 'no',
    },
    {
      id: 'settled_satisfaction',
      type: 'info',
      prompt:
        'SATISFACTION OF JUDGMENT:\n\n' +
        'Once you complete payment, the creditor MUST file an Acknowledgment of Satisfaction of Judgment (form EJ-100) with the court.\n\n' +
        'Under CCP §724.010, if the creditor does not file it, you can send a written demand. The creditor then has 15 DAYS to file. If they fail to do so, you can file a motion and the court can award you actual damages plus a $100 penalty.\n\n' +
        'DO NOT rely on the creditor to do this automatically — follow up.',
      showIf: (answers) => answers.case_outcome === 'settled',
    },

    // === CONTINUED ===
    {
      id: 'continued_info',
      type: 'info',
      prompt:
        'Your case was continued to another date. Use this time to:\n' +
        '• Gather additional evidence\n' +
        '• Prepare or improve your defense\n' +
        '• Consider whether settlement makes sense\n' +
        '• Send discovery requests to the plaintiff if you haven\'t already\n\n' +
        'Mark the new date on your calendar and plan to arrive early.',
      showIf: (answers) => answers.case_outcome === 'continued',
    },

    // === WAITING ===
    {
      id: 'waiting_info',
      type: 'info',
      prompt:
        'Some judges take cases "under submission" and issue a ruling by mail. Check with the court clerk about the expected timeline. In California, judges must issue a ruling within 90 days of submission (Cal. Const. Art. VI, §19).',
      showIf: (answers) => answers.case_outcome === 'waiting',
    },

    // === CREDIT REPORT (all outcomes) ===
    {
      id: 'credit_dispute',
      type: 'yes_no',
      prompt: 'Would you like guidance on disputing this debt on your credit report?',
      showIf: (answers) =>
        answers.case_outcome === 'won' ||
        answers.case_outcome === 'settled' ||
        answers.case_outcome === 'lost',
    },
    {
      id: 'credit_dispute_info',
      type: 'info',
      prompt:
        'CREDIT REPORT DISPUTE PROCESS:\n\n' +
        '1. Pull your free reports at annualcreditreport.com\n' +
        '2. Identify any inaccurate reporting related to this debt\n' +
        '3. File a dispute online or by certified mail with each bureau\n' +
        '4. Include supporting documents (judgment, dismissal, satisfaction)\n' +
        '5. The bureau must investigate within 30 days (FCRA §611)\n\n' +
        'If won: dispute as "resolved" or "dismissed"\n' +
        'If settled: ensure it shows as "settled" not "charged off"\n' +
        'If lost: ensure the amount is accurate and updated after payments',
      showIf: (answers) => answers.credit_dispute === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.case_outcome === 'won') {
      items.push({ status: 'done', text: 'Case resolved in your favor.' })
      items.push({
        status: 'needed',
        text: 'Get a certified copy of the judgment or dismissal from the court clerk.',
      })
      if (answers.won_credit_report === 'yes') {
        items.push({
          status: 'needed',
          text: 'Dispute the tradeline with all three credit bureaus.',
        })
      }
      if (answers.won_violations === 'yes') {
        items.push({
          status: 'info',
          text: 'Consider a Rosenthal Act or FDCPA claim against the collector. Many consumer attorneys offer free consultations.',
        })
      }
    } else if (answers.case_outcome === 'lost') {
      items.push({
        status: 'info',
        text: 'Judgment entered against you. Review your protections below.',
      })

      if (answers.lost_default === 'yes') {
        items.push({
          status: 'needed',
          text: 'Evaluate whether to file a motion to vacate: CCP §473(b) (6 months), §473.5 (2 years), or §473(d) (void — no time limit).',
        })
      }

      if (answers.lost_appeal === 'yes') {
        items.push({
          status: 'needed',
          text: 'File Notice of Appeal within 30 days of the judgment. Consider whether a bond or stay of enforcement is needed.',
        })
      }

      items.push({
        status: 'info',
        text: 'Wage garnishment limited to lesser of 25% disposable earnings or amount exceeding 40x CA minimum wage ($640/week). If earning ≤$640/week disposable, ZERO can be garnished.',
      })

      if (answers.lost_own_home === 'yes') {
        items.push({
          status: 'info',
          text: 'Homestead exemption: $300,000–$600,000 (AB 1885). The creditor likely cannot force a sale of your home.',
        })
      }

      if (answers.lost_bank_levy === 'yes') {
        items.push({
          status: 'needed',
          text: 'If you receive a bank levy notice, file a Claim of Exemption (form EJ-160) within 15 days. SS/SSI/VA funds are automatically protected.',
        })
      }

      items.push({
        status: 'info',
        text: 'Retirement accounts (ERISA) and public benefits (SS, SSI, CalWORKs, unemployment) are fully exempt.',
      })
      items.push({
        status: 'info',
        text: 'Judgment accrues 10% annual interest (CCP §685.010), is enforceable for 10 years, and is renewable. Attend any judgment debtor examination — failure to appear risks a bench warrant.',
      })
    } else if (answers.case_outcome === 'settled') {
      items.push({ status: 'done', text: 'Case settled.' })
      if (answers.settled_written === 'no') {
        items.push({
          status: 'needed',
          text: 'Get the settlement agreement in writing BEFORE making any payment.',
        })
      } else {
        items.push({
          status: 'done',
          text: 'Written settlement agreement obtained.',
        })
      }
      items.push({
        status: 'needed',
        text: 'After full payment, ensure the creditor files a Satisfaction of Judgment (form EJ-100). If they don\'t, send a written demand — they have 15 days to comply (CCP §724.010).',
      })
    } else if (answers.case_outcome === 'continued') {
      items.push({
        status: 'needed',
        text: 'Mark the new hearing date. Use the time to strengthen your defense and consider sending discovery.',
      })
    } else if (answers.case_outcome === 'waiting') {
      items.push({
        status: 'info',
        text: 'Ruling pending. Check with the court clerk. Judges must rule within 90 days of submission.',
      })
    }

    if (answers.credit_dispute === 'yes') {
      items.push({
        status: 'needed',
        text: 'Pull credit reports from annualcreditreport.com and dispute any inaccurate reporting related to this debt.',
      })
    }

    return items
  },
}
