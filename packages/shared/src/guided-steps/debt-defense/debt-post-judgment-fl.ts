import type { GuidedStepConfig } from '../types'

export const debtPostJudgmentFlConfig: GuidedStepConfig = {
  title: 'After the Ruling',
  reassurance:
    'Understanding your options after judgment is important. Florida has some of the strongest asset protections in the nation — including an unlimited homestead exemption and full head-of-household wage protection.',

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
        'Florida\'s FCCPA (Fla. Stat. §559.55–559.785) covers BOTH original creditors and third-party collectors — broader than the federal FDCPA.',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'won_violations_info',
      type: 'info',
      prompt:
        'You may have a counterclaim or separate lawsuit under the FCCPA (up to $1,000 statutory damages per violation + punitive damages + actual damages + attorney fees) and/or the FDCPA (up to $1,000 + actual damages + fees). The FCCPA has a 2-YEAR statute of limitations — double the FDCPA. Many consumer attorneys take these on contingency. Consider filing a complaint with the Florida Department of Agriculture and Consumer Services.',
      showIf: (answers) =>
        answers.case_outcome === 'won' && answers.won_violations === 'yes',
    },
    {
      id: 'won_court_order',
      type: 'info',
      prompt:
        'Request a certified copy of the court order. If the collector continues to pursue the debt, this order is your proof. Any further collection activity may violate the FCCPA and FDCPA.',
      showIf: (answers) => answers.case_outcome === 'won',
    },

    // === LOST PATH ===
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'A judgment against you is serious, but Florida has some of the strongest debtor protections in the nation. Your wages (if head of household), home, retirement, and public benefits may be partially or fully protected. Let\'s walk through your options.',
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
        'Florida Rule of Civil Procedure 1.540(b) — Relief from Judgment\n\n' +
        'You can move to vacate a default judgment on these grounds:\n\n' +
        '1. Excusable neglect — You must show your failure to respond was due to mistake, inadvertence, surprise, or excusable neglect AND that you have a meritorious defense to the debt. Must file within 1 YEAR of judgment.\n\n' +
        '2. Newly discovered evidence — Evidence that could not have been discovered in time, with due diligence. Must file within 1 YEAR.\n\n' +
        '3. Fraud, misrepresentation, or misconduct — by the opposing party. Must file within 1 YEAR.\n\n' +
        '4. Void judgment — NO TIME LIMIT. If the court lacked jurisdiction (improper service, wrong court, etc.), the judgment is void and can be set aside at any time.\n\n' +
        'You must file a noticed motion with a supporting affidavit explaining the facts. Include a proposed Answer with meritorious defenses.',
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
        'You have 30 days from the date of the judgment to file a Notice of Appeal. In county court cases (under $50,000), the appeal goes to the Circuit Court. You must show a legal error — the appellate court does not retry the facts.\n\n' +
        'An appeal does NOT automatically stop collection. You may need to post a supersedeas bond or request a stay of enforcement from the trial court.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default !== 'yes' &&
        answers.lost_appeal === 'yes',
    },
    {
      id: 'lost_head_of_household',
      type: 'yes_no',
      prompt: 'Are you the head of your household (do you provide more than 50% of a dependent\'s support)?',
      helpText:
        'Florida has one of the strongest wage protections in the country for heads of household. This is critical to determine first.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_head_of_household_info',
      type: 'info',
      prompt:
        'HEAD OF HOUSEHOLD WAGE EXEMPTION (FL Constitution Art. X, §4):\n\n' +
        'As head of household, your wages are 100% EXEMPT from garnishment — the creditor CANNOT garnish any of your wages.\n\n' +
        'To qualify, you must provide more than 50% of the financial support for a child or other dependent. You do NOT need to be married.\n\n' +
        'If you earn $750/week or less, the exemption is automatic upon claiming it. If you earn more than $750/week, you must show you are head of household AND have not agreed in writing to waive this exemption.\n\n' +
        'You must file a Claim of Exemption with the court and serve it on the creditor. Act quickly — you have limited time after receiving a garnishment notice.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_head_of_household === 'yes',
    },
    {
      id: 'lost_wage_garnishment',
      type: 'info',
      prompt:
        'WAGE GARNISHMENT LIMITS IN FLORIDA (Fla. Stat. §77.0305):\n\n' +
        'If you are NOT head of household, the creditor can garnish the LESSER of:\n' +
        '• 25% of your disposable earnings, OR\n' +
        '• The amount by which your weekly disposable earnings exceed 30 times the federal minimum wage ($7.25/hr)\n\n' +
        '30 x $7.25 = $217.50/week.\n\n' +
        'If your weekly disposable earnings are $217.50 or less, ZERO can be garnished.\n\n' +
        'You will receive a notice before garnishment begins. You have the right to file a Claim of Exemption to reduce or eliminate the garnishment based on financial hardship or head-of-household status.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_own_home',
      type: 'yes_no',
      prompt: 'Do you own a home in Florida?',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_homestead_info',
      type: 'info',
      prompt:
        'FLORIDA HOMESTEAD EXEMPTION (FL Constitution Art. X, §4):\n\n' +
        'Florida has one of the STRONGEST homestead protections in the nation:\n\n' +
        '• UNLIMITED VALUE — there is no dollar cap on the exemption\n' +
        '• Up to 1/2 acre within a municipality (urban)\n' +
        '• Up to 160 acres outside a municipality (rural)\n\n' +
        'A judgment creditor CANNOT force the sale of your homestead, regardless of how much it is worth. A $5 million home on a half-acre lot in Miami is fully protected.\n\n' +
        'However, the judgment still creates a lien — it must be recorded in each county where you own property (Fla. Stat. §55.10). The lien attaches to NON-homestead property. If you sell your homestead, you have the right to reinvest proceeds in a new homestead.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_own_home === 'yes',
    },
    {
      id: 'lost_vehicle_info',
      type: 'info',
      prompt:
        'VEHICLE EXEMPTION: Florida exempts $1,000 of equity in a motor vehicle from judgment creditors (Fla. Stat. §222.25(1)). This is a relatively low exemption. If your car equity exceeds $1,000, the creditor may attempt to levy against it. If you need the vehicle for work, argue hardship.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_personal_property_info',
      type: 'info',
      prompt:
        'PERSONAL PROPERTY EXEMPTION: Florida exempts $1,000 in personal property from judgment creditors (Fla. Stat. §222.25(4)). This covers furniture, electronics, clothing, and other personal items up to that value.',
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
        'BANK ACCOUNT LEVY PROTECTIONS (Fla. Stat. §77.041):\n\n' +
        '• When your account is frozen, you will receive a Notice of Freeze\n' +
        '• You have 20 DAYS to file a Claim of Exemption after receiving the notice\n' +
        '• $1,000 in a single bank account is AUTOMATICALLY EXEMPT from garnishment\n' +
        '• Social Security, SSI, and VA benefits are AUTOMATICALLY protected — the bank must review the last 2 months of deposits and protect federal benefits\n' +
        '• Head-of-household wages deposited into your bank account remain exempt — but you must be able to trace them\n' +
        '• Unemployment compensation and workers\' compensation are 100% exempt\n\n' +
        'File the Claim of Exemption immediately upon receiving the Notice of Freeze. Do NOT wait the full 20 days.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_bank_levy === 'yes',
    },
    {
      id: 'lost_retirement_info',
      type: 'info',
      prompt:
        'RETIREMENT ACCOUNTS: 401(k), IRA, pension, and other ERISA-qualified retirement accounts are FULLY EXEMPT from judgment creditors in Florida (Fla. Stat. §222.21). A creditor cannot touch your retirement savings.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_public_benefits_info',
      type: 'info',
      prompt:
        'PUBLIC BENEFITS: Social Security, SSI, unemployment compensation, veterans\' benefits, workers\' compensation, and public assistance are 100% exempt from garnishment and levy in Florida. These funds cannot be taken by a judgment creditor.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_judgment_renewal',
      type: 'info',
      prompt:
        'JUDGMENT DURATION AND RENEWAL:\n\n' +
        '• Judgments are enforceable for 20 YEARS (Fla. Stat. §55.081) — double California\'s 10 years\n' +
        '• Judgments can be renewed for additional periods\n' +
        '• Interest accrues at 5.52% per annum (rate varies annually — check the Florida CFO\'s website for the current rate)\n' +
        '• Judgment liens must be recorded in EACH county where you own property\n\n' +
        'If you cannot pay, time may be on your side — some creditors give up or accept reduced settlements as time passes. But the 20-year window gives creditors a long time to collect.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_debtor_exam',
      type: 'info',
      prompt:
        'FACT INFORMATION SHEET AND DEPOSITION IN AID OF EXECUTION:\n\n' +
        'After judgment, you may be required to:\n\n' +
        '1. Complete a Fact Information Sheet (Fla. R. Civ. P. Form 1.977) — listing your assets, income, and employment. This must be filed within 45 days of the judgment.\n\n' +
        '2. Attend a Deposition in Aid of Execution — where you answer questions under oath about your income, assets, and employment.\n\n' +
        'You MUST comply with both. Failure to complete the Fact Information Sheet or attend the deposition can result in contempt of court.\n\n' +
        'Tip: Bring documentation of all exempt income and assets. List all exemptions you are claiming.',
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
        'Once you complete payment, the creditor MUST file a Satisfaction of Judgment with the court.\n\n' +
        'Under Fla. Stat. §55.141, if the creditor does not file a satisfaction within 60 DAYS of full payment, you can file a motion with the court. The creditor may be liable for any damages you suffered due to the failure to satisfy the judgment.\n\n' +
        'DO NOT rely on the creditor to do this automatically — follow up and confirm the satisfaction is recorded in every county where the judgment lien was filed.',
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
        'Some judges take cases under advisement and issue a ruling by mail. Check with the court clerk about the expected timeline. Florida does not have a strict constitutional deadline like some states, but rulings are typically issued within a few weeks.',
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
          text: 'Consider a FCCPA or FDCPA claim against the collector (2-year SOL for FCCPA). Many consumer attorneys offer free consultations.',
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
          text: 'Evaluate whether to file a motion to vacate under Fla. R. Civ. P. 1.540(b): excusable neglect (1 year), fraud (1 year), or void judgment (no time limit). Must show meritorious defense.',
        })
      }

      if (answers.lost_appeal === 'yes') {
        items.push({
          status: 'needed',
          text: 'File Notice of Appeal within 30 days of the judgment. Consider whether a supersedeas bond or stay of enforcement is needed.',
        })
      }

      if (answers.lost_head_of_household === 'yes') {
        items.push({
          status: 'info',
          text: 'Head of household: wages are 100% EXEMPT from garnishment (FL Constitution Art. X, §4). File Claim of Exemption immediately if garnishment is attempted.',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Wage garnishment limited to lesser of 25% disposable earnings or amount exceeding 30x federal min wage ($217.50/week). If earning $217.50/week or less disposable, ZERO can be garnished.',
        })
      }

      if (answers.lost_own_home === 'yes') {
        items.push({
          status: 'info',
          text: 'Homestead exemption: UNLIMITED value, up to 1/2 acre urban or 160 acres rural (FL Constitution Art. X, §4). One of the strongest in the nation — creditor cannot force sale.',
        })
      }

      if (answers.lost_bank_levy === 'yes') {
        items.push({
          status: 'needed',
          text: 'If you receive a Notice of Freeze, file a Claim of Exemption within 20 days (Fla. Stat. §77.041). $1,000 in a single account is automatically exempt. SS/SSI/VA funds are automatically protected.',
        })
      }

      items.push({
        status: 'info',
        text: 'Retirement accounts (ERISA) and public benefits (SS, SSI, unemployment, VA) are fully exempt.',
      })
      items.push({
        status: 'info',
        text: 'Judgment accrues ~5.52% annual interest, is enforceable for 20 YEARS (Fla. Stat. §55.081), and is renewable. Complete the Fact Information Sheet within 45 days and attend any deposition in aid of execution — failure risks contempt.',
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
        text: 'After full payment, ensure the creditor files a Satisfaction of Judgment. If they don\'t file within 60 days, you can file a motion with the court (Fla. Stat. §55.141).',
      })
    } else if (answers.case_outcome === 'continued') {
      items.push({
        status: 'needed',
        text: 'Mark the new hearing date. Use the time to strengthen your defense and consider sending discovery.',
      })
    } else if (answers.case_outcome === 'waiting') {
      items.push({
        status: 'info',
        text: 'Ruling pending. Check with the court clerk for expected timeline.',
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
