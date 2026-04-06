import type { GuidedStepConfig } from '../types'

export const ltEvictionNoticeAnalysisConfig: GuidedStepConfig = {
  title: 'Understanding Your Eviction Notice',
  reassurance:
    "Many eviction notices have technical defects that can be used as a defense. Let's analyze yours.",

  questions: [
    {
      id: 'notice_type',
      type: 'single_choice',
      prompt: 'What type of notice did you receive?',
      options: [
        { value: 'three_day_pay_or_quit', label: '3-Day Pay or Quit' },
        { value: 'thirty_day_notice', label: '30-Day Notice' },
        { value: 'notice_to_vacate', label: 'Notice to Vacate' },
        { value: 'court_citation', label: 'Court Citation / Eviction Lawsuit' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    },
    {
      id: 'three_day_analysis',
      type: 'info',
      prompt:
        "ANALYSIS:\n- Was it delivered properly? (hand-delivery, posted on door, or certified mail)\n- Does it state the EXACT amount owed?\n- Does it give you 3 FULL days? (The day of delivery doesn't count)\n- Does it state the landlord's right to proceed if you don't pay?\n- If ANY of these are missing, the notice may be defective \u2014 a defense at hearing.",
      showIf: (answers) => answers.notice_type === 'three_day_pay_or_quit',
    },
    {
      id: 'thirty_day_analysis',
      type: 'info',
      prompt:
        'This is a lease termination notice. Verify:\n- Is your lease month-to-month? (30-day notice only applies to month-to-month)\n- Does it give a full 30 days from the NEXT rental period?\n- Is it in writing?',
      showIf: (answers) => answers.notice_type === 'thirty_day_notice',
    },
    {
      id: 'notice_to_vacate_analysis',
      type: 'info',
      prompt:
        "This is the required notice BEFORE the landlord can file for eviction.\n- Must give at least 3 days (unless lease says differently)\n- Must be in writing\n- Must be delivered to you (not just posted)\n- DEFECT: If notice says 'vacate immediately' with no time period, it's invalid",
      showIf: (answers) => answers.notice_type === 'notice_to_vacate',
    },
    {
      id: 'court_citation_analysis',
      type: 'info',
      prompt:
        'This means the landlord has already filed an eviction lawsuit. You have a court date.\n- Check the hearing date \u2014 you MUST appear or you lose by default\n- You have the right to file an answer\n- You have the right to request a jury trial (must request in writing before hearing)',
      showIf: (answers) => answers.notice_type === 'court_citation',
    },
    {
      id: 'unsure_analysis',
      type: 'info',
      prompt:
        'Look at the document carefully. Key clues:\n- If it mentions a dollar amount and says "pay or quit" \u2192 3-Day Pay or Quit\n- If it says you have 30 days to leave \u2192 30-Day Notice\n- If it says "notice to vacate" and gives a deadline \u2192 Notice to Vacate\n- If it has a court name, case number, and hearing date \u2192 Court Citation',
      showIf: (answers) => answers.notice_type === 'unsure',
    },
    {
      id: 'common_defects',
      type: 'info',
      prompt:
        "COMMON NOTICE DEFECTS THAT VOID THE EVICTION:\n1. Wrong address on notice\n2. No specific amount owed listed\n3. Delivered to wrong person\n4. Less than required days given\n5. Notice says 'vacate immediately' (must give time)\n6. Landlord filed in court before notice period expired\n7. Notice not in writing (verbal doesn't count)",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const noticeLabels: Record<string, string> = {
      three_day_pay_or_quit: '3-Day Pay or Quit',
      thirty_day_notice: '30-Day Notice',
      notice_to_vacate: 'Notice to Vacate',
      court_citation: 'Court Citation',
      unsure: 'Unknown type',
    }

    const noticeType = noticeLabels[answers.notice_type] || 'Unknown type'
    items.push({
      status: 'info',
      text: `Notice type: ${noticeType}.`,
    })

    if (answers.notice_type === 'three_day_pay_or_quit') {
      items.push({
        status: 'needed',
        text: 'Verify the notice includes: proper delivery, exact amount owed, full 3-day period, and landlord\'s right to proceed.',
      })
    } else if (answers.notice_type === 'thirty_day_notice') {
      items.push({
        status: 'needed',
        text: 'Verify your lease is month-to-month, the notice gives a full 30 days from the next rental period, and it is in writing.',
      })
    } else if (answers.notice_type === 'notice_to_vacate') {
      items.push({
        status: 'needed',
        text: 'Verify the notice gives at least 3 days (or the lease-specified period), is in writing, and was properly delivered to you.',
      })
    } else if (answers.notice_type === 'court_citation') {
      items.push({
        status: 'needed',
        text: 'You MUST appear at your hearing date or you will lose by default. File an answer and consider requesting a jury trial in writing.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Check the notice against the 7 common defects listed. Any defect may be a valid defense.',
    })

    items.push({
      status: 'info',
      text: 'Keep the original notice and all related documents. Take photos of everything.',
    })

    return items
  },
}
