import type { GuidedStepConfig } from '../types'

export const debtPostJudgmentPaConfig: GuidedStepConfig = {
  title: 'After the Ruling',
  reassurance:
    'Pennsylvania is one of the most debtor-friendly states. Even after a judgment, your wages cannot be garnished for consumer debt.',

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
        {
          value: 'confession_of_judgment',
          label: 'A confession of judgment was entered against me',
        },
      ],
    },

    // === WON PATH ===
    {
      id: 'won_info',
      type: 'info',
      prompt:
        'Congratulations! Get a copy of the judgment or dismissal order from the court clerk. Keep it for your records — you may need it if the debt reappears on your credit report or a collector contacts you again.',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'won_credit_report',
      type: 'yes_no',
      prompt: 'Does this debt still appear on your credit report?',
      helpText:
        'Even after winning, the tradeline may still show. You have the right to dispute it.',
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
      prompt: 'Did the collector violate the law during the case (harassment, false threats, deceptive practices)?',
      helpText:
        'Pennsylvania\'s Unfair Trade Practices and Consumer Protection Law (UTPCPL, 73 P.S. §201-1 et seq.) and the federal FDCPA both provide remedies for collector misconduct.',
      showIf: (answers) => answers.case_outcome === 'won',
    },
    {
      id: 'won_violations_info',
      type: 'info',
      prompt:
        'You may have a claim under:\n' +
        '• FDCPA — up to $1,000 statutory damages + actual damages + attorney fees\n' +
        '• UTPCPL — treble damages (3x) for unfair or deceptive acts, plus attorney fees\n\n' +
        'Many consumer attorneys take these on contingency. File a complaint with the PA Attorney General\'s Bureau of Consumer Protection.',
      showIf: (answers) =>
        answers.case_outcome === 'won' && answers.won_violations === 'yes',
    },

    // === LOST PATH ===
    {
      id: 'lost_key_protection',
      type: 'info',
      prompt:
        'THE MOST IMPORTANT THING TO KNOW:\n\n' +
        'Pennsylvania DOES NOT allow wage garnishment for consumer debts (42 Pa.C.S.A. §8127).\n\n' +
        'Your wages can ONLY be garnished for:\n' +
        '• Child support / alimony\n' +
        '• Federal and state taxes\n' +
        '• Federal student loans\n' +
        '• Criminal restitution\n\n' +
        'Even in those cases, garnishment is limited to 10% of net wages.\n\n' +
        'A consumer debt collector CANNOT take money from your paycheck. Period.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_default',
      type: 'yes_no',
      prompt: 'Was this a default judgment (entered because you did not respond or appear)?',
      helpText:
        'Pennsylvania has specific rules for opening default judgments, especially if you weren\'t properly notified.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_default_10day_notice',
      type: 'yes_no',
      prompt: 'Did you receive a "10-Day Notice" letter (Pa.R.C.P. 237.1) before the default was entered?',
      helpText:
        'Pennsylvania requires the plaintiff to send a 10-Day Notice before taking a default judgment. If they didn\'t, the judgment may be VOID.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_default === 'yes',
    },
    {
      id: 'lost_default_no_notice',
      type: 'info',
      prompt:
        'CRITICAL: If the plaintiff did NOT properly serve a 10-Day Notice (Pa.R.C.P. 237.1) before entering the default judgment, the judgment is VOID and must be stricken. File a Petition to Strike the Judgment immediately. This is a matter of law — the court has no discretion.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default === 'yes' &&
        answers.lost_default_10day_notice === 'no',
    },
    {
      id: 'lost_default_timing',
      type: 'single_choice',
      prompt: 'When did you learn about the default judgment?',
      options: [
        { value: 'within_10', label: 'Within the last 10 days' },
        { value: 'after_10', label: 'More than 10 days ago' },
      ],
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default === 'yes' &&
        answers.lost_default_10day_notice !== 'no',
    },
    {
      id: 'lost_default_within_10',
      type: 'info',
      prompt:
        'GOOD NEWS: Under Pa.R.C.P. 237.3, if you file a petition to open within 10 days of the default judgment, the court SHALL open it if you can show a meritorious defense (a valid reason you should win). This is nearly automatic — file immediately.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default === 'yes' &&
        answers.lost_default_timing === 'within_10',
    },
    {
      id: 'lost_default_after_10',
      type: 'info',
      prompt:
        'After 10 days, you can still petition to open the default judgment, but you must show ALL THREE:\n\n' +
        '1. PROMPT FILING — you acted quickly after learning of the judgment\n' +
        '2. MERITORIOUS DEFENSE — a valid reason you should win (e.g., debt is not yours, amount is wrong, statute of limitations expired)\n' +
        '3. REASONABLE EXPLANATION — why you did not respond originally\n\n' +
        'File as soon as possible — delay hurts your case.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default === 'yes' &&
        answers.lost_default_timing === 'after_10',
    },
    {
      id: 'lost_appeal_court_type',
      type: 'single_choice',
      prompt: 'Which court entered the judgment?',
      options: [
        { value: 'magisterial', label: 'Magisterial District Court (small claims / minor court)' },
        { value: 'common_pleas', label: 'Court of Common Pleas' },
      ],
      showIf: (answers) =>
        answers.case_outcome === 'lost' && answers.lost_default !== 'yes',
    },
    {
      id: 'lost_appeal_magisterial',
      type: 'info',
      prompt:
        'APPEAL FROM MAGISTERIAL DISTRICT COURT:\n\n' +
        'You have 30 DAYS from the judgment to file an appeal to the Court of Common Pleas. This is a DE NOVO trial — the case starts completely over. The magisterial court judgment is wiped clean.\n\n' +
        'This is a powerful right. File the appeal at the Court of Common Pleas Prothonotary\'s office and pay the filing fee. You do NOT need to post a bond for a de novo appeal in most consumer debt cases.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default !== 'yes' &&
        answers.lost_appeal_court_type === 'magisterial',
    },
    {
      id: 'lost_appeal_common_pleas',
      type: 'info',
      prompt:
        'APPEAL FROM COURT OF COMMON PLEAS:\n\n' +
        'You have 30 DAYS from the judgment to file an appeal to the Superior Court of Pennsylvania. Unlike a magisterial court appeal, this is NOT a new trial — you must show the trial court made a legal error. You cannot introduce new evidence.\n\n' +
        'An appeal bond may be required to stay execution during the appeal.',
      showIf: (answers) =>
        answers.case_outcome === 'lost' &&
        answers.lost_default !== 'yes' &&
        answers.lost_appeal_court_type === 'common_pleas',
    },
    {
      id: 'lost_property_exemption',
      type: 'info',
      prompt:
        'PENNSYLVANIA PROPERTY EXEMPTIONS:\n\n' +
        '• WILDCARD EXEMPTION: $300 of any property (42 Pa.C.S. §8123) — yes, only $300. PA has one of the lowest exemptions in the country.\n' +
        '• NO HOMESTEAD EXEMPTION — but a sheriff\'s sale of a home for consumer debt is extremely rare in practice. The costs and procedures make it impractical for most debt collectors.\n' +
        '• BANK ACCOUNTS: $300 exempt. However, wages deposited in a bank account remain exempt if they are traceable to wages. Social Security and other federal benefits are also protected.\n' +
        '• RETIREMENT ACCOUNTS: Fully exempt under ERISA. 401(k), IRA, pension — creditors cannot touch these.\n' +
        '• PUBLIC BENEFITS: Social Security, SSI, unemployment, workers\' comp, veterans\' benefits — 100% exempt.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },
    {
      id: 'lost_judgment_lien',
      type: 'info',
      prompt:
        'JUDGMENT LIENS AND DURATION:\n\n' +
        '• A judgment creates a lien on real property in the county where entered (and any county where the judgment is transferred)\n' +
        '• The lien lasts 5 YEARS and must be REVIVED by filing a praecipe to continue the lien\n' +
        '• The judgment itself remains enforceable for 20 YEARS\n' +
        '• If the creditor does not revive the lien within 5 years, the lien expires (but the judgment remains)\n\n' +
        'A lien does not force a sale — it means the creditor gets paid if you sell the property.',
      showIf: (answers) => answers.case_outcome === 'lost',
    },

    // === CONFESSION OF JUDGMENT PATH ===
    {
      id: 'coj_info',
      type: 'info',
      prompt:
        'A confession of judgment (cognovit note) means a judgment was entered against you without a lawsuit — the creditor used a clause in your contract that let them skip the court process. This is alarming but you have rights.\n\n' +
        'You can challenge this under Pa.R.C.P. 2959. Use the "Challenge a Confession of Judgment" guide for detailed steps.',
      showIf: (answers) => answers.case_outcome === 'confession_of_judgment',
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
        'CRITICAL: Get the settlement in writing BEFORE making any payment. The written agreement should include:\n' +
        '• The exact amount you will pay\n' +
        '• Payment schedule (if not lump sum)\n' +
        '• That the debt is "settled in full" or "satisfied" upon payment\n' +
        '• That the creditor will file a satisfaction of judgment\n' +
        '• That the creditor will not sell or assign the remaining balance\n' +
        '• What they will report to credit bureaus',
      showIf: (answers) =>
        answers.case_outcome === 'settled' && answers.settled_written === 'no',
    },
    {
      id: 'settled_satisfaction',
      type: 'info',
      prompt:
        'SATISFACTION OF JUDGMENT (Pa.R.C.P. 3021-3023):\n\n' +
        'After you complete payment, the creditor must file a satisfaction of judgment with the Prothonotary. If they fail to do so, you can:\n\n' +
        '1. Send a written demand to the creditor to satisfy the judgment\n' +
        '2. If they don\'t comply, file a motion with the court under Pa.R.C.P. 3023\n' +
        '3. The court can enter the satisfaction and award you costs\n\n' +
        'DO NOT rely on the creditor to do this automatically — follow up to protect your credit and clear the lien on any property.',
      showIf: (answers) => answers.case_outcome === 'settled',
    },

    // === CONTINUED ===
    {
      id: 'continued_info',
      type: 'info',
      prompt:
        'Your case was continued to another date. Use this time to:\n' +
        '• Gather additional evidence\n' +
        '• Prepare or strengthen your defense\n' +
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
        'Some judges take cases under advisement and issue a ruling later. Check with the court clerk about the expected timeline. In magisterial district court, the judge usually rules immediately. In Court of Common Pleas, it may take weeks or months.',
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
          text: 'Consider a UTPCPL or FDCPA claim against the collector. Many consumer attorneys offer free consultations.',
        })
      }
    } else if (answers.case_outcome === 'lost') {
      items.push({
        status: 'info',
        text: 'Judgment entered against you — but your wages CANNOT be garnished for consumer debt in Pennsylvania (42 Pa.C.S.A. §8127).',
      })

      if (answers.lost_default === 'yes') {
        if (answers.lost_default_10day_notice === 'no') {
          items.push({
            status: 'needed',
            text: 'File a Petition to Strike the judgment — the 10-Day Notice (Pa.R.C.P. 237.1) was not served, making the judgment VOID.',
          })
        } else if (answers.lost_default_timing === 'within_10') {
          items.push({
            status: 'needed',
            text: 'File a petition to open the default judgment within 10 days — the court SHALL open it if you show a meritorious defense (Pa.R.C.P. 237.3).',
          })
        } else {
          items.push({
            status: 'needed',
            text: 'File a petition to open the default judgment showing: (1) prompt filing, (2) meritorious defense, and (3) reasonable explanation for the default.',
          })
        }
      }

      if (answers.lost_appeal_court_type === 'magisterial') {
        items.push({
          status: 'needed',
          text: 'Consider appealing to the Court of Common Pleas within 30 days for a de novo trial (case starts over).',
        })
      } else if (answers.lost_appeal_court_type === 'common_pleas') {
        items.push({
          status: 'info',
          text: 'You have 30 days to appeal to the Superior Court, but you must show a legal error by the trial court.',
        })
      }

      items.push({
        status: 'info',
        text: 'Property exemptions are minimal ($300 wildcard). Retirement accounts and public benefits are fully exempt. Bank accounts: $300 exempt, plus traceable wages and federal benefits.',
      })
      items.push({
        status: 'info',
        text: 'Judgment lien on real property lasts 5 years (must be revived). Judgment enforceable for 20 years.',
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
        text: 'After full payment, ensure the creditor files a satisfaction of judgment (Pa.R.C.P. 3021-3023). Follow up — do not rely on them to do it.',
      })
    } else if (answers.case_outcome === 'continued') {
      items.push({
        status: 'needed',
        text: 'Mark the new hearing date. Use the time to strengthen your defense and consider discovery.',
      })
    } else if (answers.case_outcome === 'waiting') {
      items.push({
        status: 'info',
        text: 'Ruling pending. Check with the court clerk about expected timeline.',
      })
    } else if (answers.case_outcome === 'confession_of_judgment') {
      items.push({
        status: 'needed',
        text: 'Review the "Challenge a Confession of Judgment" guide to understand your options under Pa.R.C.P. 2959.',
      })
      items.push({
        status: 'info',
        text: 'Your wages still cannot be garnished for consumer debt. The key protections apply even with a confession of judgment.',
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
