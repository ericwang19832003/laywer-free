import type { GuidedStepConfig } from '../types'

export const debtPostJudgmentGuideConfig: GuidedStepConfig = {
  title: 'After the Ruling — What Happens Next',
  reassurance:
    "Whether you won or lost, there are important steps to protect yourself. We'll walk you through each one.",
  questions: [
    {
      id: 'outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your hearing?',
      options: [
        { value: 'won', label: 'I won — case dismissed or ruled in my favor' },
        { value: 'lost', label: 'I lost — judgment entered against me' },
        { value: 'settled', label: 'We reached a settlement agreement' },
        { value: 'continued', label: 'The hearing was postponed / continued' },
        { value: 'waiting', label: "Waiting for the judge's decision" },
      ],
    },
    // WON
    {
      id: 'won_info',
      type: 'info',
      showIf: (a) => a.outcome === 'won',
      prompt:
        'Congratulations! Here\'s what to do now:\n\n1. GET A COPY of the court\'s order/judgment from the clerk\n2. CHECK YOUR CREDIT REPORT in 30-60 days — the debt should be removed\n3. If the collector contacts you again, tell them: "The case was dismissed. Do not contact me again." If they continue, that\'s an FDCPA violation worth up to $1,000.\n4. KEEP ALL YOUR DOCUMENTS for at least 2 years in case the collector tries to re-file\n5. If the debt appears on your credit report after dismissal, dispute it with the credit bureaus (Equifax, Experian, TransUnion) by mail with a copy of the court order.',
    },
    // LOST
    {
      id: 'lost_info',
      type: 'info',
      showIf: (a) => a.outcome === 'lost',
      prompt:
        "Don't panic. You have options:\n\n1. APPEAL: You have 21 days (county/district court) or 5 days (JP court) to file an appeal. An appeal goes to a HIGHER court and you get a new trial.\n2. NEGOTIATE: Contact the plaintiff's attorney to set up a payment plan. Courts prefer payment plans over collections.\n3. PROTECT YOUR ASSETS: Texas law protects:\n   - Your wages (no garnishment for consumer debt in Texas)\n   - Your home (homestead exemption up to $345,000)\n   - Your car (up to $60,000 for a family)\n   - Retirement accounts (fully protected)\n   - Personal property (up to $100,000 for a family)\n4. FILE EXEMPTION CLAIMS: If the creditor tries to seize protected assets, you file a \"Claim of Exemption\" with the court. This is a short form that lists what they're trying to take and why it's protected.",
    },
    // Appeal process
    {
      id: 'want_to_appeal',
      type: 'yes_no',
      showIf: (a) => a.outcome === 'lost',
      prompt: 'Do you want to learn about the appeal process?',
    },
    {
      id: 'appeal_info',
      type: 'info',
      showIf: (a) => a.outcome === 'lost' && a.want_to_appeal === 'yes',
      prompt:
        'HOW TO APPEAL:\n\nFrom JP Court (5 days to file):\n1. File a "Notice of Appeal" at the JP court clerk\n2. Pay the appeal bond (usually the judgment amount, or file inability-to-pay affidavit)\n3. Case transfers to County Court for a brand new trial (called "trial de novo")\n4. You start completely fresh — everything is re-heard\n\nFrom County/District Court (30 days to file):\n1. File a "Notice of Appeal" at the trial court clerk\n2. The appeals court reviews the RECORD (transcript) — no new trial\n3. You must show the judge made a legal ERROR\n4. Consider consulting a legal aid attorney for this step\n\nFree legal aid in Texas:\n- Lone Star Legal Aid: 1-800-733-8394\n- Texas RioGrande Legal Aid: 1-888-988-9996\n- texaslawhelp.org — find legal aid by county',
    },
    // SETTLED
    {
      id: 'settled_info',
      type: 'info',
      showIf: (a) => a.outcome === 'settled',
      prompt:
        'Important steps after a settlement:\n\n1. GET IT IN WRITING — Never agree to anything verbal. The agreement should state:\n   - The exact amount you\'ll pay\n   - The payment schedule\n   - That the debt is "satisfied in full" upon completion\n   - That the plaintiff will file a dismissal with the court\n   - That the plaintiff will request deletion from credit reports\n2. KEEP EVERY PAYMENT RECEIPT\n3. After final payment, get a "Satisfaction of Judgment" letter from the plaintiff\n4. File the satisfaction with the court clerk\n5. Check your credit report 30-60 days later to confirm removal',
    },
    // CONTINUED
    {
      id: 'continued_info',
      type: 'info',
      showIf: (a) => a.outcome === 'continued',
      prompt:
        "Your hearing was postponed. Here's what to do:\n\n1. CONFIRM THE NEW DATE — Ask the clerk or check online for your new hearing date\n2. DON'T RELAX — Use this time to strengthen your case:\n   - Gather more evidence\n   - Review your defenses\n   - Check if new FDCPA violations occurred\n3. The continuance does NOT change your defenses or the strength of your case\n4. Show up on the new date — missing it means automatic judgment against you",
    },
    // Credit report
    {
      id: 'credit_info',
      type: 'info',
      prompt:
        'ABOUT YOUR CREDIT REPORT:\n\nA judgment stays on your credit report for up to 7 years from the filing date.\n\nTo dispute:\n1. Get your free report at annualcreditreport.com\n2. Write a dispute letter to each bureau (Equifax, Experian, TransUnion)\n3. Include a copy of any court order (dismissal, satisfaction)\n4. They have 30 days to investigate and respond\n5. If the debt is inaccurate, they must remove it',
    },
  ],
  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []
    if (answers.outcome === 'won') {
      items.push({
        status: 'done' as const,
        text: 'Case resolved in your favor.',
      })
      items.push({
        status: 'needed' as const,
        text: 'Get a copy of the court order and check your credit report in 30-60 days.',
      })
    } else if (answers.outcome === 'lost') {
      items.push({
        status: 'info' as const,
        text: 'Judgment entered against you.',
      })
      if (answers.want_to_appeal === 'yes') {
        items.push({
          status: 'needed' as const,
          text: 'File Notice of Appeal within deadline (5 days JP, 30 days county/district).',
        })
      }
      items.push({
        status: 'info' as const,
        text: 'Texas protects your wages, home, car, and retirement from collection.',
      })
    } else if (answers.outcome === 'settled') {
      items.push({
        status: 'needed' as const,
        text: 'Get settlement agreement in writing with dismissal and credit report deletion terms.',
      })
    } else if (answers.outcome === 'continued') {
      items.push({
        status: 'needed' as const,
        text: 'Confirm new hearing date and continue preparing your case.',
      })
    }
    return items
  },
}
