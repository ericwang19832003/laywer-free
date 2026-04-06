import type { GuidedStepConfig } from '../types'

export const piTortClaimsTrackingPaConfig: GuidedStepConfig = {
  title: 'Track Your Pennsylvania Political Subdivision Tort Claim Notice',
  reassurance:
    'After sending your notice, track delivery and any response to protect your right to file a lawsuit in the Court of Common Pleas.',

  questions: [
    {
      id: 'tracking_overview',
      type: 'info',
      prompt:
        'After your tort claim notice is sent to the political subdivision, there is no specific statutory response window like in Texas (90 days) or California (45 days). The entity may respond at any time \u2014 or not at all. A reasonable waiting period is 30 to 60 days before taking further action. Keep all delivery records \u2014 they prove the entity received your notice.',
    },
    {
      id: 'date_mailed',
      type: 'text',
      prompt: 'What date was the notice mailed or delivered?',
      helpText:
        'Enter the date you mailed or personally delivered the notice (YYYY-MM-DD).',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'tracking_number',
      type: 'text',
      prompt: 'What is the certified mail tracking number?',
      helpText:
        'Find this on your certified mail receipt. Leave blank if you personally delivered the notice.',
      placeholder: 'Tracking number (blank if personally delivered)',
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
        'This is the date shown on the green card, not the date you received it back.',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'response_window_info',
      type: 'info',
      prompt:
        'Pennsylvania does not set a specific statutory deadline for the political subdivision to respond to your notice. A reasonable waiting period is 30 to 60 days. During this time: continue medical treatment, keep documenting your damages, and save all correspondence from the entity. If you have not heard back after 60 days, you may proceed with filing your lawsuit.',
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'entity_response',
      type: 'single_choice',
      prompt: 'How has the political subdivision responded to your notice?',
      helpText:
        'If you have not waited at least 30 days, select "No response yet."',
      options: [
        { value: 'not_yet', label: 'No response yet (waiting 30\u201360 days)' },
        { value: 'accepted', label: 'Accepted \u2014 settlement offer received' },
        { value: 'denied', label: 'Denied \u2014 received a written rejection' },
        { value: 'no_response', label: 'No response after 60+ days' },
      ],
      showIf: (answers) => answers.return_receipt_received === 'yes',
    },
    {
      id: 'response_accepted_info',
      type: 'info',
      prompt:
        'The entity has offered a settlement. Before accepting, make sure you have reached Maximum Medical Improvement (MMI) so you know your full medical costs. Calculate all damages \u2014 medical bills, lost wages, pain and suffering \u2014 before evaluating the offer. Remember: damages against political subdivisions are capped at $500,000 per occurrence (42 Pa.C.S. \u00A78553). Consider consulting a personal injury attorney to review whether the offer is fair.',
      showIf: (answers) => answers.entity_response === 'accepted',
    },
    {
      id: 'response_denied_info',
      type: 'info',
      prompt:
        'Your notice was denied by written rejection. You may now proceed with filing a lawsuit in the Court of Common Pleas in the county where the incident occurred. Keep the denial letter as evidence. Remember: political subdivision tort claims must be filed in state court (Court of Common Pleas) \u2014 NOT federal court. The general statute of limitations for personal injury in Pennsylvania is 2 years from the date of the incident.',
      showIf: (answers) => answers.entity_response === 'denied',
    },
    {
      id: 'response_no_response_info',
      type: 'info',
      prompt:
        'The political subdivision has not responded after a reasonable waiting period. You may now proceed with filing a lawsuit in the Court of Common Pleas in the county where the incident occurred. The lack of response does not bar your claim \u2014 what matters is that you sent timely notice. File in state court (Court of Common Pleas), NOT federal court. The general statute of limitations for personal injury in Pennsylvania is 2 years from the date of the incident.',
      showIf: (answers) => answers.entity_response === 'no_response',
    },
    {
      id: 'filing_venue_info',
      type: 'info',
      prompt:
        'Where to file your lawsuit:\n\n\u2022 Court: Court of Common Pleas in the county where the incident occurred\n\u2022 NOT federal court \u2014 political subdivision tort claims under 42 Pa.C.S. \u00A78541\u20138564 must be brought in state court\n\u2022 Statute of limitations: 2 years from the date of the incident for personal injury\n\u2022 Damages cap: $500,000 per occurrence for all claimants combined (42 Pa.C.S. \u00A78553)\n\nMake sure your complaint specifically identifies the exception to governmental immunity that applies to your case (42 Pa.C.S. \u00A78542 lists eight exceptions, including vehicle liability, dangerous conditions of streets, and care of property).',
      showIf: (answers) =>
        answers.entity_response === 'denied' ||
        answers.entity_response === 'no_response',
    },
    {
      id: 'no_late_relief_note',
      type: 'info',
      prompt:
        'Unlike California, Pennsylvania does NOT have a late claim relief provision for political subdivision tort claims. If you missed the 6-month notice deadline, your claim may be barred. Consult a personal injury attorney immediately to evaluate whether any exception or equitable argument may apply to your situation.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Notice status
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

    // Delivery confirmation
    if (answers.return_receipt_received === 'yes') {
      items.push({
        status: 'done',
        text: 'Delivery confirmed \u2014 return receipt received.',
      })
    } else if (answers.return_receipt_received === 'no') {
      items.push({
        status: 'needed',
        text: 'Watch for the green return receipt card to confirm delivery.',
      })
    }

    // Response status
    const response = answers.entity_response
    if (response === 'not_yet') {
      items.push({
        status: 'info',
        text: 'Waiting for entity response (allow 30\u201360 days). Continue documenting damages.',
      })
    } else if (response === 'accepted') {
      items.push({
        status: 'info',
        text: 'Settlement offer received \u2014 evaluate carefully before accepting.',
      })
    } else if (response === 'denied') {
      items.push({
        status: 'done',
        text: 'Notice denied \u2014 you may file a lawsuit in the Court of Common Pleas (2-year statute of limitations).',
      })
    } else if (response === 'no_response') {
      items.push({
        status: 'done',
        text: 'No response after 60+ days \u2014 you may file a lawsuit in the Court of Common Pleas.',
      })
    }

    // Damages cap reminder
    items.push({
      status: 'info',
      text: 'Damages cap reminder: recovery against political subdivisions is capped at $500,000 per occurrence (42 Pa.C.S. \u00A78553). File in state court (Court of Common Pleas), not federal court.',
    })

    return items
  },
}
