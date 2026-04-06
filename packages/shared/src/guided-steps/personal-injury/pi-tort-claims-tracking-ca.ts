import type { GuidedStepConfig } from '../types'

export const piTortClaimsTrackingCaConfig: GuidedStepConfig = {
  title: 'Track Your California Government Tort Claim',
  reassurance:
    'After filing your claim, the government entity has 45 days to respond. Tracking delivery and the response protects your right to file a lawsuit.',

  questions: [
    {
      id: 'tracking_overview',
      type: 'info',
      prompt:
        'After your government tort claim is filed, the entity has 45 days to respond (Government Code §912.4). They may accept your claim, deny it, or let the deadline pass without responding. If they accept, you may receive a settlement offer. If they deny or ignore it, you gain the right to file a lawsuit in court. Keep all delivery records — they prove the entity received your claim.',
    },
    {
      id: 'date_mailed',
      type: 'text',
      prompt: 'What date was the claim mailed or delivered?',
      helpText:
        'Enter the date you mailed or hand-delivered the claim (YYYY-MM-DD). This starts the 45-day response clock.',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'tracking_number',
      type: 'text',
      prompt: 'What is the certified mail tracking number?',
      helpText:
        'Find this on your certified mail receipt. Leave blank if you hand-delivered the claim.',
      placeholder: 'Tracking number (blank if hand-delivered)',
    },
    {
      id: 'return_receipt_received',
      type: 'yes_no',
      prompt: 'Have you received the green return receipt card?',
      helpText:
        'The green card (PS Form 3811) is signed by the recipient and returned to you. It proves the entity received your claim.',
    },
    {
      id: 'return_receipt_date',
      type: 'text',
      prompt: 'What date was the claim received per the return receipt?',
      helpText:
        'This is the date shown on the green card, not the date you received it back. The 45-day response window starts from this date.',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'response_window_info',
      type: 'info',
      prompt:
        'The government entity has 45 days from receipt to respond to your claim (Government Code §912.4). During this waiting period: continue medical treatment, keep documenting your damages, and save all correspondence from the entity. Do not file a lawsuit until the response window expires or you receive a written denial.',
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'entity_response',
      type: 'single_choice',
      prompt: 'How has the government entity responded to your claim?',
      helpText:
        'If the 45-day response deadline has not passed yet, select "No response yet."',
      options: [
        { value: 'not_yet', label: 'No response yet (within 45 days)' },
        { value: 'accepted', label: 'Accepted — settlement offer received' },
        { value: 'denied', label: 'Denied — received a written rejection' },
        { value: 'deemed_rejected', label: 'Deemed rejected — 45 days passed with no response' },
      ],
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'response_accepted_info',
      type: 'info',
      prompt:
        'The entity has offered a settlement. Before accepting, make sure you have reached Maximum Medical Improvement (MMI) so you know your full medical costs. Calculate all damages — medical bills, lost wages, pain and suffering — before evaluating the offer. Consider consulting a personal injury attorney to review whether the offer is fair.',
      showIf: (answers) => answers.entity_response === 'accepted',
    },
    {
      id: 'response_denied_info',
      type: 'info',
      prompt:
        'Your claim was denied by written rejection. You have 6 months from the date of the written rejection to file a lawsuit in court (Government Code §945.6). Keep the denial letter as evidence — it proves you exhausted administrative remedies and starts your lawsuit deadline. Move forward with preparing your complaint to file with the court.',
      showIf: (answers) => answers.entity_response === 'denied',
    },
    {
      id: 'response_deemed_rejected_info',
      type: 'info',
      prompt:
        'The entity failed to respond within 45 days, so your claim is deemed rejected by operation of law. You have 2 years from the date of the injury to file a lawsuit in court (Government Code §945.6). Move forward with preparing your complaint to file with the court.',
      showIf: (answers) => answers.entity_response === 'deemed_rejected',
    },
    {
      id: 'missed_deadline',
      type: 'yes_no',
      prompt: 'Did you miss the original 6-month deadline to file your government tort claim?',
      helpText:
        'If your incident was more than 6 months ago and you have not yet filed a claim, you may still have options if you are within 1 year.',
    },
    {
      id: 'late_claim_guidance',
      type: 'info',
      prompt:
        'You may still be able to file by applying for late claim relief under Government Code §911.4. Here is the process:\n\n1. File a written application with the government entity within 1 year of the incident, explaining why your claim was late.\n2. Common grounds for relief: incapacity from the injury, being a minor (under 18), mistake, inadvertence, surprise, or excusable neglect.\n3. The entity has 45 days to grant or deny your late claim application.\n4. If the entity denies your late claim application (or fails to respond within 45 days), you may petition the court for relief under Government Code §946.6.\n5. The court petition must be filed within 6 months of the entity\'s denial of your late claim application.\n\nAct quickly — once 1 year has passed from the incident, late claim relief is generally no longer available.',
      showIf: (answers) => answers.missed_deadline === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.date_mailed) {
      items.push({
        status: 'done',
        text: `Claim filed on ${answers.date_mailed}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Record the date your claim was mailed or delivered.',
      })
    }

    if (answers.return_receipt_received === 'yes') {
      items.push({
        status: 'done',
        text: 'Delivery confirmed — return receipt received.',
      })
    } else if (answers.return_receipt_received === 'no') {
      items.push({
        status: 'needed',
        text: 'Watch for the green return receipt card to confirm delivery.',
      })
    }

    const response = answers.entity_response
    if (response === 'not_yet') {
      items.push({
        status: 'info',
        text: 'Waiting for entity response (45-day window). Continue documenting damages.',
      })
    } else if (response === 'accepted') {
      items.push({
        status: 'info',
        text: 'Settlement offer received — evaluate carefully before accepting.',
      })
    } else if (response === 'denied') {
      items.push({
        status: 'done',
        text: 'Claim denied — you have 6 months from the written rejection to file a lawsuit (Gov. Code §945.6).',
      })
    } else if (response === 'deemed_rejected') {
      items.push({
        status: 'done',
        text: 'Claim deemed rejected (45 days, no response) — you have 2 years from injury to file a lawsuit.',
      })
    }

    if (answers.missed_deadline === 'yes') {
      items.push({
        status: 'info',
        text: 'Late claim relief may be available under Government Code §911.4 if you are within 1 year of the incident.',
      })
    }

    return items
  },
}
