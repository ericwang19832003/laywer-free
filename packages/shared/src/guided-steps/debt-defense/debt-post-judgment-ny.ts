import type { GuidedStepConfig } from '../types'

export const debtPostJudgmentNyConfig: GuidedStepConfig = {
  title: 'After the Ruling',
  reassurance:
    'Understanding your options after judgment is important. New York has meaningful protections for wages, bank accounts, and essential assets — including automatic bank account exemptions.',

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
        'New York does not have a state debt collection act, but the FDCPA covers third-party collectors and GBL §349 covers deceptive practices by any collector.',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'won_violations_info',
      type: 'info',
      prompt:
        'You may have a counterclaim or separate lawsuit under the FDCPA (up to $1,000 statutory damages + actual damages + attorney fees) for third-party collectors, and/or GBL §349 ($50 statutory + treble damages up to $1,000 + attorney fees) for any collector. Many consumer attorneys take these on contingency. Consider filing a complaint with the NY Attorney General or NYC DCWP.',
      showIf: (answers) =>
        answers.case_outcome === 'won' && answers.won_violations === 'yes',
    },
    {
      id: 'won_court_order',
      type: 'info',
      prompt:
        'Request a certified copy of the court order. If the collector continues to pursue the debt, this order is your proof. Any further collection activity may violate the FDCPA and GBL §349.',
      showIf: (answers) => answers.case_outcome === 'won',
    },

    // === LOST PATH ===
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'A judgment against you is serious, but New York has meaningful protections. Your wages, bank account, home, and public benefits may be partially or fully protected. Let\'s walk through your options.',
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
        'New York has two main paths to vacate a default judgment:\n\n' +
        '1. CPLR §5015(a)(1) — Excusable default. Must file within ONE YEAR of judgment. You must show: (a) a reasonable excuse for failing to appear, AND (b) a meritorious defense to the debt. Common excuses include improper service, medical emergency, or military deployment.\n\n' +
        '2. CPLR §5015(a)(4) — Void judgment (lack of jurisdiction). NO TIME LIMIT. If you were never properly served or the court lacked jurisdiction, the judgment is void and can be set aside at any time.\n\n' +
        'Consumer Credit Fairness Act (2021): For consumer debt default judgments, the plaintiff must now file an affidavit confirming the debt is within the statute of limitations (CPLR §3215(f)). If they did not, this may be grounds to vacate.\n\n' +
        'You must file an Order to Show Cause with a supporting affidavit explaining the facts. Include a copy of your proposed Answer with your motion.',
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
        'You have 30 days from the date of the judgment to file a Notice of Appeal. In Civil Court (small claims and consumer debt cases), the appeal goes to the Appellate Term. You must show a legal error — the appellate court does not retry the facts.\n\n' +
        'An appeal does NOT automatically stop collection. You may need to post a bond or request a stay of enforcement.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default !== 'yes' &&
        answers.lost_appeal === 'yes',
    },
    {
      id: 'lost_income_execution',
      type: 'info',
      prompt:
        'WAGE GARNISHMENT (INCOME EXECUTION) IN NEW YORK:\n\n' +
        'New York uses "income execution" — not traditional wage garnishment (CPLR §5231).\n\n' +
        'How it works:\n' +
        '1. The creditor serves YOU with an income execution first\n' +
        '2. You get 20 DAYS to make voluntary payments directly to the sheriff/marshal\n' +
        '3. Only if you fail to pay voluntarily can the creditor serve your employer\n\n' +
        'Limits — the LESSER of:\n' +
        '• 10% of your gross wages, OR\n' +
        '• 25% of your disposable earnings\n\n' +
        'If your weekly income is ≤ 30x federal minimum wage ($7.25 × 30 = $217.50/week), your wages are 100% EXEMPT — ZERO can be garnished.\n\n' +
        'New York\'s 10% gross limit is MORE protective than the federal 25% disposable limit used in most states.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_own_home',
      type: 'yes_no',
      prompt: 'Do you own a home in New York?',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_homestead_info',
      type: 'info',
      prompt:
        'NEW YORK HOMESTEAD EXEMPTION (CPLR §5206):\n\n' +
        'Your home equity is protected up to:\n' +
        '• $179,975 — most of upstate New York (Kings, Queens, New York, Bronx, Richmond, Nassau, Suffolk, Rockland, Westchester, Putnam counties have higher amounts)\n' +
        '• $399,975 — New York City boroughs (Kings, Queens, New York, Bronx, Richmond) and surrounding counties (Nassau, Suffolk, Rockland, Westchester, Putnam)\n\n' +
        'The exact amount depends on which county your home is in. The exemption applies to your primary residence only.\n\n' +
        'A judgment creditor CANNOT force the sale of your home if your equity is at or below the exemption amount. However, the judgment creates a lien on your property.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_own_home === 'yes',
    },
    {
      id: 'lost_vehicle_info',
      type: 'info',
      prompt:
        'VEHICLE EXEMPTION: New York exempts $4,550 of equity in a motor vehicle from judgment creditors (Debtor & Creditor Law §282). If your car equity is below this amount, it cannot be seized. If you need the vehicle for work, argue hardship.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_personal_property_info',
      type: 'info',
      prompt:
        'PERSONAL PROPERTY EXEMPTION: New York exempts up to $12,625 in aggregate personal property from judgment creditors (Debtor & Creditor Law §283). This includes furniture, clothing, appliances, and other household items.',
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
        'BANK ACCOUNT LEVY PROTECTIONS (CPLR §5222-a):\n\n' +
        '• $3,600 is automatically EXEMPT from any bank restraint or levy (updated 2022)\n' +
        '• The bank MUST leave at least $3,600 in your account — this protection is automatic\n' +
        '• Exempt funds are automatically protected and CANNOT be frozen:\n' +
        '  — Social Security and SSI\n' +
        '  — Veterans benefits (VA)\n' +
        '  — Unemployment insurance\n' +
        '  — Public assistance\n' +
        '  — Workers\' compensation\n' +
        '  — Child support/alimony received\n\n' +
        'If your account is restrained:\n' +
        '1. The bank must provide you with an Exemption Claim Form within 2 business days\n' +
        '2. Fill out and return the form to the bank within 20 days\n' +
        '3. If your funds are exempt, the bank must release them\n\n' +
        'New York\'s $3,600 automatic exemption is one of the strongest bank account protections in the country.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_bank_levy === 'yes',
    },
    {
      id: 'lost_retirement_info',
      type: 'info',
      prompt:
        'RETIREMENT ACCOUNTS: 401(k), IRA, pension, and other ERISA-qualified retirement accounts are FULLY EXEMPT from judgment creditors in New York. A creditor cannot touch your retirement savings.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_public_benefits_info',
      type: 'info',
      prompt:
        'PUBLIC BENEFITS: Social Security, SSI, VA benefits, unemployment insurance, workers\' compensation, public assistance, and child support/alimony received are 100% exempt from garnishment and levy. These funds cannot be taken by a judgment creditor.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_judgment_duration',
      type: 'info',
      prompt:
        'JUDGMENT DURATION AND INTEREST:\n\n' +
        '• Judgments are enforceable for 20 YEARS (CPLR §211(b)) — twice as long as many states\n' +
        '• Interest accrues at 9% per year on the judgment amount (CPLR §5004)\n' +
        '• A $5,000 judgment becomes $14,000 in 20 years from interest alone\n' +
        '• Judgments can be renewed\n\n' +
        'If you cannot pay, time may be on your side — some creditors give up or accept reduced settlements as time passes. But be aware of the long enforcement window.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_debtor_exam',
      type: 'info',
      prompt:
        'INFORMATION SUBPOENA AND RESTRAINING NOTICE:\n\n' +
        'The creditor may serve you with an Information Subpoena (CPLR §5224) requiring you to answer questions about your income, assets, and employment under oath. You MUST respond within 7 days — failure to respond can result in contempt of court.\n\n' +
        'The creditor may also serve a Restraining Notice (CPLR §5222) on you or your bank, which freezes assets. Violating a restraining notice can result in contempt.\n\n' +
        'Tip: Bring documentation of all exempt income and assets if called for a deposition.',
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
        'Once you complete payment, the creditor MUST file a Satisfaction of Judgment with the court and the county clerk where the judgment was docketed.\n\n' +
        'Under CPLR §5020, the judgment creditor must file an acknowledgment of satisfaction. If they fail to do so, you can file a motion to compel satisfaction and the court can award costs.\n\n' +
        'DO NOT rely on the creditor to do this automatically — follow up. An unsatisfied judgment continues to appear as a lien on your property.',
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
        'Some judges take cases "under advisement" and issue a ruling by mail. Check with the court clerk about the expected timeline. In New York, there is no strict statutory deadline for judges to issue decisions, but unreasonable delays can be raised with the court administration.',
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
          text: 'Consider an FDCPA or GBL §349 claim against the collector. Many consumer attorneys offer free consultations.',
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
          text: 'Evaluate whether to file a motion to vacate: CPLR §5015(a)(1) excusable default (1 year) or §5015(a)(4) void judgment for improper service (no time limit). Check if SOL affidavit was filed per Consumer Credit Fairness Act.',
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
        text: 'Income execution limited to lesser of 10% gross wages or 25% disposable earnings (CPLR §5231). You get 20 days to make voluntary payments before employer is contacted. If earning ≤ $217.50/week (30x federal min wage), ZERO can be garnished.',
      })

      if (answers.lost_own_home === 'yes') {
        items.push({
          status: 'info',
          text: 'Homestead exemption: $179,975–$399,975 depending on county (CPLR §5206). The creditor likely cannot force a sale of your home if equity is below the exemption.',
        })
      }

      if (answers.lost_bank_levy === 'yes') {
        items.push({
          status: 'needed',
          text: 'If your bank account is restrained, $3,600 is automatically exempt (CPLR §5222-a). Return the Exemption Claim Form to your bank within 20 days. SS/SSI/VA/unemployment funds are automatically protected.',
        })
      }

      items.push({
        status: 'info',
        text: 'Vehicle exempt up to $4,550 equity (D&C Law §282). Personal property exempt up to $12,625 aggregate (D&C Law §283).',
      })
      items.push({
        status: 'info',
        text: 'Retirement accounts (ERISA) and public benefits (SS, SSI, VA, unemployment, public assistance) are fully exempt.',
      })
      items.push({
        status: 'info',
        text: 'Judgment accrues 9% annual interest (CPLR §5004), is enforceable for 20 years (CPLR §211(b)), and is renewable. Respond to any Information Subpoena within 7 days — failure risks contempt of court.',
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
        text: 'After full payment, ensure the creditor files a Satisfaction of Judgment (CPLR §5020). If they don\'t, file a motion to compel satisfaction.',
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
