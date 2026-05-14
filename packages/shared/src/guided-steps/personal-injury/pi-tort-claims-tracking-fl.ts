import type { GuidedStepConfig } from '../types'

export const piTortClaimsTrackingFlConfig: GuidedStepConfig = {
  title: 'Track Your Florida Government Tort Claim Notice',
  reassurance:
    'After sending your notice, track delivery and the 180-day waiting period before you can file a lawsuit.',

  questions: [
    {
      id: 'tracking_overview',
      type: 'info',
      prompt:
        'After your pre-suit notice is sent to both the agency and the Department of Financial Services (DFS), you must wait 180 days before filing a lawsuit — unless the agency denies the claim in writing sooner.\n\nDuring this period, the agency may investigate, request additional information, or offer a settlement.',
    },
    {
      id: 'date_agency_notice_mailed',
      type: 'text',
      prompt: 'What date was the notice mailed to the government agency?',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'date_dfs_notice_mailed',
      type: 'text',
      prompt: 'What date was the notice mailed to DFS?',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'agency_tracking_number',
      type: 'text',
      prompt: 'Certified mail tracking number for the agency notice',
      placeholder: 'Tracking number',
    },
    {
      id: 'dfs_tracking_number',
      type: 'text',
      prompt: 'Certified mail tracking number for the DFS notice',
      placeholder: 'Tracking number',
    },
    {
      id: 'agency_receipt_received',
      type: 'yes_no',
      prompt: 'Have you received the return receipt card from the agency?',
    },
    {
      id: 'agency_receipt_date',
      type: 'text',
      prompt: 'What date was the agency notice received (per return receipt)?',
      helpText: 'The 180-day waiting period starts from the later of the two receipt dates.',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers) => answers.agency_receipt_received === 'yes',
    },
    {
      id: 'dfs_receipt_received',
      type: 'yes_no',
      prompt: 'Have you received the return receipt card from DFS?',
    },
    {
      id: 'dfs_receipt_date',
      type: 'text',
      prompt: 'What date was the DFS notice received (per return receipt)?',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers) => answers.dfs_receipt_received === 'yes',
    },

    // === Waiting Period ===
    {
      id: 'waiting_period_info',
      type: 'info',
      prompt:
        '180-Day Waiting Period\n\nYou cannot file your lawsuit until 180 days after BOTH notices are received — OR until the agency issues a written denial, whichever comes first.\n\nDuring this time:\n• Continue medical treatment\n• Keep documenting damages\n• Respond to any agency requests for information\n• Save all correspondence',
    },

    // === Agency Response ===
    {
      id: 'entity_response',
      type: 'single_choice',
      prompt: 'How has the government agency responded?',
      options: [
        { value: 'not_yet', label: 'No response yet (within 180 days)' },
        { value: 'investigating', label: 'Investigating — requested additional information' },
        { value: 'settlement_offer', label: 'Settlement offer received' },
        { value: 'denied', label: 'Claim denied in writing' },
        { value: 'no_response_180', label: 'No response after 180+ days' },
      ],
    },
    {
      id: 'settlement_offer_info',
      type: 'info',
      prompt:
        'Settlement Offer Received\n\nBefore accepting:\n• Have you reached MMI and know your full damages?\n• Remember the $200,000 per claimant cap — the offer cannot exceed this unless via claims bill\n• Consider whether the offer fairly compensates you within the cap\n• If your damages truly exceed $200K, you may want to obtain a judgment first and then pursue a claims bill\n\nYou are not required to accept. You can file a lawsuit after the 180-day waiting period expires.',
      showIf: (answers) => answers.entity_response === 'settlement_offer',
    },
    {
      id: 'denied_info',
      type: 'info',
      prompt:
        'Claim Denied — You May File Immediately\n\nSince the agency denied your claim in writing, you do not need to wait the full 180 days. You may file your lawsuit now.\n\nFiling details:\n• Court: Circuit Court in the county where the incident occurred\n• SOL: 4 years from the incident (§768.28(14))\n• Damages cap: $200,000/claimant, $300,000/incident\n• Your complaint must allege compliance with the pre-suit notice requirement\n• Include the denial letter as an exhibit',
      showIf: (answers) => answers.entity_response === 'denied',
    },
    {
      id: 'no_response_180_info',
      type: 'info',
      prompt:
        'No Response After 180 Days — You May File\n\nThe 180-day waiting period has expired. You may now file your lawsuit.\n\nFiling details:\n• Court: Circuit Court in the county where the incident occurred\n• SOL: 4 years from the incident (§768.28(14))\n• Damages cap: $200,000/claimant, $300,000/incident\n• Your complaint must allege compliance with the pre-suit notice requirement and that 180 days have elapsed\n• Attach copies of both notices and return receipts as exhibits',
      showIf: (answers) => answers.entity_response === 'no_response_180',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Notice status
    if (answers.date_agency_notice_mailed && answers.date_dfs_notice_mailed) {
      items.push({
        status: 'done',
        text: `Notices mailed: Agency on ${answers.date_agency_notice_mailed}, DFS on ${answers.date_dfs_notice_mailed}.`,
      })
    } else if (answers.date_agency_notice_mailed) {
      items.push({ status: 'needed', text: 'DFS notice date not recorded. Ensure it was sent.' })
    } else {
      items.push({ status: 'needed', text: 'Record mailing dates for both notices.' })
    }

    // Delivery confirmation
    if (answers.agency_receipt_received === 'yes' && answers.dfs_receipt_received === 'yes') {
      items.push({ status: 'done', text: 'Both return receipts received — delivery confirmed.' })
    } else {
      items.push({ status: 'needed', text: 'Watch for return receipt cards to confirm delivery.' })
    }

    // Response status
    const response = answers.entity_response
    if (response === 'not_yet' || response === 'investigating') {
      items.push({
        status: 'info',
        text: 'Waiting period active. Continue documenting damages.',
      })
    } else if (response === 'settlement_offer') {
      items.push({ status: 'info', text: 'Settlement offer received — evaluate against $200K cap.' })
    } else if (response === 'denied') {
      items.push({ status: 'done', text: 'Claim denied in writing — may file lawsuit immediately.' })
    } else if (response === 'no_response_180') {
      items.push({ status: 'done', text: '180 days elapsed — may file lawsuit in Circuit Court.' })
    }

    // Reminders
    items.push({
      status: 'info',
      text: 'SOL: 4 years from incident (§768.28(14)). Caps: $200K/claimant, $300K/incident.',
    })

    return items
  },
}
