import type { GuidedStepConfig } from '../types'

export const ltRepairAndDeductConfig: GuidedStepConfig = {
  title: 'Repair-and-Deduct: Fix It Yourself, Deduct from Rent',
  reassurance:
    'Texas law gives you the right to make repairs and deduct the cost from rent \u2014 IF you follow the correct steps.',

  questions: [
    {
      id: 'repair_deduct_overview',
      type: 'info',
      prompt:
        "REPAIR-AND-DEDUCT (\u00a792.0561):\nIf your landlord won't fix a condition that materially affects health/safety, you can:\n1. Give written notice describing the problem\n2. Wait a 'reasonable time' (7 days for most issues, longer for complex repairs)\n3. If landlord still hasn't fixed it: hire a contractor yourself\n4. Deduct the REASONABLE cost from your next rent payment\n5. Provide the landlord with receipts",
    },
    {
      id: 'written_notice',
      type: 'yes_no',
      prompt: 'Have you given written notice to your landlord?',
    },
    {
      id: 'written_notice_required',
      type: 'info',
      prompt:
        'You MUST give written notice first. Send via certified mail or hand-deliver with a witness. Keep a copy. Include: description of the problem, how long it\'s existed, and a request to repair within [7] days.',
      showIf: (answers) => answers.written_notice === 'no',
    },
    {
      id: 'time_since_notice',
      type: 'single_choice',
      prompt: 'How long has the issue existed since your written notice?',
      options: [
        { value: 'less_than_7_days', label: 'Less than 7 days' },
        { value: '7_to_14_days', label: '7 to 14 days' },
        { value: 'over_14_days', label: 'Over 14 days' },
      ],
      showIf: (answers) => answers.written_notice === 'yes',
    },
    {
      id: 'timing_less_than_7',
      type: 'info',
      prompt:
        'You need to wait a "reasonable time" before proceeding. For most repairs, 7 days is considered reasonable. Continue to document the issue with photos and keep a record of any communication.',
      showIf: (answers) => answers.time_since_notice === 'less_than_7_days',
    },
    {
      id: 'timing_7_to_14',
      type: 'info',
      prompt:
        'A reasonable time has likely passed for most standard repairs. You may now proceed with hiring a contractor. Make sure the repair addresses a condition that materially affects health or safety.',
      showIf: (answers) => answers.time_since_notice === '7_to_14_days',
    },
    {
      id: 'timing_over_14',
      type: 'info',
      prompt:
        'More than enough time has passed. You have a strong basis to proceed with repair-and-deduct. Document everything and get at least two repair estimates for reasonableness.',
      showIf: (answers) => answers.time_since_notice === 'over_14_days',
    },
    {
      id: 'limits_info',
      type: 'info',
      prompt:
        "LIMITS ON REPAIR-AND-DEDUCT:\n- Cost cannot exceed one month's rent (unless you get court approval)\n- The repair must address a condition that materially affects health or safety\n- You cannot deduct for cosmetic issues\n- You must use a licensed contractor for plumbing, electrical, and HVAC\n- Keep ALL receipts \u2014 you'll need them if the landlord disputes",
    },
    {
      id: 'retaliation_warning',
      type: 'info',
      prompt:
        "RISK WARNING: Some landlords may try to evict you for 'nonpayment' after you deduct. This is RETALIATION under \u00a792.331 and is illegal. Keep all documentation to prove you followed the legal process.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.written_notice === 'yes') {
      items.push({
        status: 'done',
        text: 'Written notice given to landlord.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Send written notice to your landlord via certified mail or hand-deliver with a witness.',
      })
    }

    if (answers.time_since_notice === 'less_than_7_days') {
      items.push({
        status: 'needed',
        text: 'Wait at least 7 days from your written notice before proceeding with repair-and-deduct.',
      })
    } else if (
      answers.time_since_notice === '7_to_14_days' ||
      answers.time_since_notice === 'over_14_days'
    ) {
      items.push({
        status: 'info',
        text: 'Reasonable time has passed. You may proceed with hiring a contractor.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Get repair estimates, use a licensed contractor, keep all receipts, and deduct no more than one month\'s rent.',
    })

    items.push({
      status: 'info',
      text: 'Keep all documentation. If your landlord retaliates, it is illegal under \u00a792.331.',
    })

    return items
  },
}
