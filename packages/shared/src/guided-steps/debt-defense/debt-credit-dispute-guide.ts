import type { GuidedStepConfig } from '../types'

export const debtCreditDisputeGuideConfig: GuidedStepConfig = {
  title: 'Cleaning Up Your Credit Report',
  reassurance:
    "Your credit score isn't permanent. After your case ends, you have the right to correct inaccurate information.",

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was your case outcome?',
      options: [
        { value: 'won_dismissed', label: 'I won or the case was dismissed' },
        { value: 'settled_paid', label: 'I settled or paid the debt' },
        { value: 'judgment_against', label: 'A judgment was entered against me' },
        { value: 'still_pending', label: 'My case is still pending' },
      ],
    },
    {
      id: 'won_dismissed_info',
      type: 'info',
      acknowledgeLabel: 'Got it — I\'ll send the dismissal order →',
      showIf: (answers) => answers.case_outcome === 'won_dismissed',
      prompt:
        'Congratulations! If the case was dismissed or you won, the debt should NOT appear on your credit report as a valid debt.\n\nGet a copy of the court\'s dismissal order or judgment in your favor. This is your proof. Send it to the credit bureaus and demand removal of the account.\n\nIf the collector reported the debt after the case was dismissed, that may be an additional violation of the Fair Credit Reporting Act (FCRA).',
    },
    {
      id: 'settled_paid_info',
      type: 'info',
      acknowledgeLabel: 'Got it — I\'ll verify and dispute if needed →',
      showIf: (answers) => answers.case_outcome === 'settled_paid',
      prompt:
        'If you settled or paid the debt, the account should be updated to show "Paid" or "Settled" status \u2014 not "Open" or "In Collections."\n\nGet written confirmation from the collector showing the debt is resolved. If you negotiated a "pay for delete" agreement (where they agreed to remove the entry entirely), make sure you have that in writing before you paid.\n\nIf the account still shows as unpaid or in collections after settlement, dispute it with the credit bureaus using your settlement agreement as proof.',
    },
    {
      id: 'judgment_against_info',
      type: 'info',
      acknowledgeLabel: 'Got it — I\'ll file the satisfaction →',
      showIf: (answers) => answers.case_outcome === 'judgment_against',
      prompt:
        'A judgment can stay on your credit report for up to 7 years. However, once you pay the judgment, you can:\n\n1. File a "Satisfaction of Judgment" with the court (ask the clerk how)\n2. Send a copy to all three credit bureaus\n3. The entry should update to "Judgment Satisfied"\n\nIf you cannot pay the full amount, some creditors will accept a payment plan. Once fully paid, file the satisfaction.\n\nNote: Even with a judgment, check the credit report for errors \u2014 wrong amounts, wrong dates, or duplicate entries are all disputable.',
    },
    {
      id: 'still_pending_info',
      type: 'info',
      acknowledgeLabel: 'Got it — I\'ll dispute errors now →',
      showIf: (answers) => answers.case_outcome === 'still_pending',
      prompt:
        'While your case is pending, the debt may still appear on your credit report. You can still dispute inaccuracies now \u2014 you don\'t have to wait for the case to end.\n\nDisputable items while pending:\n- Wrong account balance\n- Wrong date of first delinquency\n- Account listed under the wrong name\n- Duplicate entries for the same debt\n- Debt reported by a company that doesn\'t own it\n\nDo NOT mention your pending lawsuit in the dispute letter \u2014 just stick to the factual errors.',
    },
    {
      id: 'dispute_get_reports',
      type: 'info',
      acknowledgeLabel: 'I have my reports →',
      prompt:
        'Step 1-2: Get your free reports — Go to annualcreditreport.com (official site) and request all three: Equifax, Experian, TransUnion. Look in the "Collections" or "Negative Items" section.',
    },
    {
      id: 'dispute_write_letter',
      type: 'info',
      acknowledgeLabel: 'Got the letter format →',
      prompt:
        'Step 3: Write a dispute letter to each bureau showing the debt. Include: your name, SSN last 4, DOB, the account number, creditor name, and reason for dispute (case dismissed / debt settled / not mine). Enclose a copy of your court order. State that the bureau has 30 days to investigate under the Fair Credit Reporting Act.',
    },
    {
      id: 'dispute_send_followup',
      type: 'info',
      acknowledgeLabel: 'Got it — sending via certified mail →',
      prompt:
        "Steps 4-6: Send via certified mail with return receipt. Wait 30 days — they must investigate and respond. If they don't remove it, file a complaint with the CFPB at consumerfinance.gov/complaint.",
    },
    {
      id: 'bureau_addresses_info',
      type: 'info',
      acknowledgeLabel: 'Got the addresses →',
      prompt:
        'BUREAU ADDRESSES:\n\nEquifax: P.O. Box 740256, Atlanta, GA 30374\nExperian: P.O. Box 4500, Allen, TX 75013\nTransUnion: P.O. Box 2000, Chester, PA 19016\n\nYou can also dispute online at each bureau\'s website, but mailed disputes create a paper trail.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const outcomeLabels: Record<string, string> = {
      won_dismissed: 'won or dismissed',
      settled_paid: 'settled or paid',
      judgment_against: 'judgment entered against you',
      still_pending: 'still pending',
    }

    const outcome = outcomeLabels[answers.case_outcome] || 'unknown'

    items.push({
      status: 'info',
      text: `Case outcome: ${outcome}.`,
    })

    if (answers.case_outcome === 'won_dismissed') {
      items.push({
        status: 'needed',
        text: 'Obtain the court\'s dismissal order and send it to all three credit bureaus to remove the debt entry.',
      })
    } else if (answers.case_outcome === 'settled_paid') {
      items.push({
        status: 'needed',
        text: 'Verify the account shows "Paid" or "Settled" on your credit report. Dispute if it still shows as open.',
      })
    } else if (answers.case_outcome === 'judgment_against') {
      items.push({
        status: 'needed',
        text: 'Once the judgment is paid, file a Satisfaction of Judgment with the court and send a copy to all three bureaus.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Review your credit report now for factual errors you can dispute while the case is pending.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Request your free credit reports from annualcreditreport.com.',
    })

    items.push({
      status: 'done',
      text: 'You reviewed the dispute process — getting reports, writing the letter, and sending via certified mail.',
    })

    return items
  },
}
