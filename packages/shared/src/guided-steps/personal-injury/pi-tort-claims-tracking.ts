import type { GuidedStepConfig } from '../types'

export const piTortClaimsTrackingConfig: GuidedStepConfig = {
  title: 'Track Your Tort Claims Notice',
  reassurance:
    'After sending your notice, the government entity has a limited window to respond. Tracking delivery and the response protects your right to file a lawsuit.',

  questions: [
    {
      id: 'tracking_overview',
      type: 'info',
      prompt:
        'After your Tort Claims notice is sent, the government entity may accept your claim, deny it, or let the deadline pass without responding. If they accept, you may receive a settlement offer. If they deny or ignore it, you gain the right to file a lawsuit in court. Keep all delivery records — they prove the entity received proper notice.',
    },
    {
      id: 'date_mailed',
      type: 'text',
      prompt: 'What date was the notice mailed or delivered?',
      helpText:
        'Enter the date you mailed or hand-delivered the notice (YYYY-MM-DD). This starts the response clock.',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'tracking_number',
      type: 'text',
      prompt: 'What is the certified mail tracking number?',
      helpText:
        'Find this on your certified mail receipt. Leave blank if you hand-delivered the notice.',
      placeholder: 'Tracking number (blank if hand-delivered)',
    },
    {
      id: 'return_receipt_received',
      type: 'yes_no',
      prompt: 'Have you received the green return receipt card?',
      helpText:
        'The green card (PS Form 3811) is signed by the recipient and returned to you. It proves the entity received your notice.',
    },
    {
      id: 'return_receipt_date',
      type: 'text',
      prompt: 'What date was the notice received per the return receipt?',
      helpText:
        'This is the date shown on the green card, not the date you received it back. The response window starts from this date.',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'response_window_info',
      type: 'info',
      prompt:
        'Most government entities have 90 days from receipt to respond to your claim. During this waiting period: continue medical treatment, keep documenting your damages, and save all correspondence from the entity. Do not file a lawsuit until the response window expires or you receive a written denial.',
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'entity_response',
      type: 'single_choice',
      prompt: 'How has the government entity responded to your notice?',
      helpText:
        'If the response deadline has not passed yet, select "No response yet."',
      options: [
        { value: 'not_yet', label: 'No response yet' },
        { value: 'accepted', label: 'Accepted — settlement offer received' },
        { value: 'denied', label: 'Denied — received a denial letter' },
        { value: 'ignored', label: 'Ignored — deadline passed with no response' },
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
        'Your claim was denied or the entity failed to respond within the deadline. You now have the right to file a lawsuit in court. Keep the denial letter (if any) as evidence — it proves you exhausted administrative remedies. Move forward with preparing your petition to file with the court.',
      showIf: (answers) =>
        answers.entity_response === 'denied' ||
        answers.entity_response === 'ignored',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.date_mailed) {
      items.push({
        status: 'done',
        text: `Notice sent on ${answers.date_mailed}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Record the date your notice was mailed or delivered.',
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
        text: 'Waiting for entity response. Continue documenting damages.',
      })
    } else if (response === 'accepted') {
      items.push({
        status: 'info',
        text: 'Settlement offer received — evaluate carefully before accepting.',
      })
    } else if (response === 'denied') {
      items.push({
        status: 'done',
        text: 'Claim denied — you may now file a lawsuit. Keep the denial letter.',
      })
    } else if (response === 'ignored') {
      items.push({
        status: 'done',
        text: 'Response deadline passed — you may now file a lawsuit.',
      })
    }

    return items
  },
}
