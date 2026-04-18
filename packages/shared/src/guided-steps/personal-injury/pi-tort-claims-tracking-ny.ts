import type { GuidedStepConfig } from '../types'

export const piTortClaimsTrackingNyConfig: GuidedStepConfig = {
  title: 'Track Your New York Notice of Claim',
  reassurance:
    'After filing your Notice of Claim, track delivery, the 50-h hearing, and your lawsuit filing deadline.',

  questions: [
    {
      id: 'tracking_overview',
      type: 'info',
      prompt:
        'After your Notice of Claim is served, two key things happen:\n\n1. The municipality may demand a 50-h hearing (oral examination under oath) — you MUST attend\n2. You cannot file your lawsuit until 30 days after the hearing or demand\n\nYour SOL to file the lawsuit is 1 year and 90 days from the incident (GML §50-i).',
    },
    {
      id: 'date_served',
      type: 'text',
      prompt: 'What date was the Notice of Claim served?',
      placeholder: 'YYYY-MM-DD',
    },
    {
      id: 'delivery_confirmation',
      type: 'single_choice',
      prompt: 'How was delivery confirmed?',
      options: [
        { value: 'stamped_copy', label: 'Stamped receipt copy from personal delivery' },
        { value: 'return_receipt', label: 'Certified mail return receipt (green card)' },
        { value: 'online_confirmation', label: 'Online filing confirmation (NYC)' },
        { value: 'not_confirmed', label: 'Not yet confirmed' },
      ],
    },

    // === 50-h Hearing Tracking ===
    {
      id: 'fifty_h_demanded',
      type: 'single_choice',
      prompt: 'Has the municipality demanded a 50-h hearing?',
      options: [
        { value: 'yes', label: 'Yes — hearing demanded' },
        { value: 'no', label: 'No demand yet' },
        { value: 'completed', label: 'Hearing already completed' },
      ],
    },
    {
      id: 'fifty_h_date',
      type: 'text',
      prompt: 'What is the scheduled date of the 50-h hearing?',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers) => answers.fifty_h_demanded === 'yes',
    },
    {
      id: 'fifty_h_preparation',
      type: 'info',
      prompt:
        'Preparing for the 50-h Hearing\n\nThe 50-h hearing is like a deposition under oath. Key preparation tips:\n\n• Review your Notice of Claim before the hearing — know exactly what you stated\n• Stick to facts. Do not speculate or guess.\n• If you don\'t remember, say "I don\'t recall"\n• Do not volunteer extra information\n• Bring copies of your medical records and any photos/evidence\n• You may bring a support person but they cannot speak\n• The municipality\'s attorney will ask questions — answer honestly and concisely\n\nYour testimony CAN and WILL be used against you at trial. Prepare seriously.',
      showIf: (answers) => answers.fifty_h_demanded === 'yes',
    },
    {
      id: 'fifty_h_completed_date',
      type: 'text',
      prompt: 'What date was the 50-h hearing completed?',
      placeholder: 'YYYY-MM-DD',
      showIf: (answers) => answers.fifty_h_demanded === 'completed',
    },
    {
      id: 'fifty_h_completed_info',
      type: 'info',
      prompt:
        'Hearing Completed — Next Steps\n\nYou must wait 30 days from the hearing before filing your lawsuit. After that waiting period, you can file in Supreme Court.\n\nRemember: your overall SOL is 1 year and 90 days from the incident (GML §50-i). Plan your filing accordingly.',
      showIf: (answers) => answers.fifty_h_demanded === 'completed',
    },

    // === Municipality Response ===
    {
      id: 'entity_response',
      type: 'single_choice',
      prompt: 'Has the municipality responded to your claim?',
      options: [
        { value: 'not_yet', label: 'No response yet' },
        { value: 'settlement_offer', label: 'Settlement offer received' },
        { value: 'denied', label: 'Claim denied' },
        { value: 'no_response', label: 'No response and 30+ days since hearing/demand' },
      ],
    },
    {
      id: 'settlement_offer_info',
      type: 'info',
      prompt:
        'Settlement Offer Received\n\nBefore accepting, make sure you:\n• Have reached MMI and know your full medical costs\n• Have calculated all damages including future medical expenses and lost earnings\n• Understand that NY has NO damages cap for municipal tort claims (unlike PA\'s $500K cap)\n• Consider the 9% pre-judgment interest exposure if you proceed to trial\n\nDo not accept under pressure. You have until the SOL expires to file a lawsuit.',
      showIf: (answers) => answers.entity_response === 'settlement_offer',
    },
    {
      id: 'denied_or_no_response_info',
      type: 'info',
      prompt:
        'Filing Your Lawsuit\n\nYou may now proceed to file your lawsuit. Key requirements:\n\n• Court: Supreme Court (unlimited jurisdiction)\n• SOL: 1 year and 90 days from the incident (GML §50-i)\n• Waiting period: Must wait at least 30 days after 50-h hearing or demand\n• Your complaint must allege compliance with the Notice of Claim requirement\n• File in the county where the incident occurred or where the municipality is located\n\nRemember to purchase an index number (~$210) and file the summons and complaint.',
      showIf: (answers) =>
        answers.entity_response === 'denied' ||
        answers.entity_response === 'no_response',
    },

    // === Late Notice Info ===
    {
      id: 'late_notice_reminder',
      type: 'info',
      prompt:
        'Late Notice Petition — If You Missed the 90-Day Deadline\n\nIf you missed the 90-day Notice of Claim deadline, you may petition the court for leave to serve a late notice under GML §50-e(5). This petition must be brought within 1 year and 90 days of the incident.\n\nFactors the court considers:\n• Did the municipality have actual knowledge of the facts within 90 days? (police report, 911 call, EMS response)\n• Was the delay excusable?\n• Would the municipality be substantially prejudiced?\n\nActual knowledge is the strongest factor. If police responded to the scene, that often supports late notice relief.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Service status
    if (answers.date_served) {
      items.push({ status: 'done', text: `Notice served on ${answers.date_served}.` })
    } else {
      items.push({ status: 'needed', text: 'Record the date Notice of Claim was served.' })
    }

    // Delivery confirmation
    if (answers.delivery_confirmation && answers.delivery_confirmation !== 'not_confirmed') {
      items.push({ status: 'done', text: 'Delivery confirmed.' })
    } else if (answers.delivery_confirmation === 'not_confirmed') {
      items.push({ status: 'needed', text: 'Get confirmation of delivery (return receipt or stamped copy).' })
    }

    // 50-h hearing
    if (answers.fifty_h_demanded === 'yes') {
      items.push({
        status: 'info',
        text: `50-h hearing scheduled${answers.fifty_h_date ? ` for ${answers.fifty_h_date}` : ''}. Prepare thoroughly — testimony is under oath.`,
      })
    } else if (answers.fifty_h_demanded === 'completed') {
      items.push({
        status: 'done',
        text: `50-h hearing completed${answers.fifty_h_completed_date ? ` on ${answers.fifty_h_completed_date}` : ''}. Wait 30 days before filing lawsuit.`,
      })
    } else if (answers.fifty_h_demanded === 'no') {
      items.push({ status: 'info', text: 'No 50-h hearing demanded yet. May still be requested.' })
    }

    // Response status
    const response = answers.entity_response
    if (response === 'not_yet') {
      items.push({ status: 'info', text: 'Waiting for municipality response. Continue documenting damages.' })
    } else if (response === 'settlement_offer') {
      items.push({ status: 'info', text: 'Settlement offer received — evaluate carefully against full damages.' })
    } else if (response === 'denied' || response === 'no_response') {
      items.push({
        status: 'done',
        text: 'May proceed to file lawsuit in Supreme Court. SOL: 1 year + 90 days from incident.',
      })
    }

    items.push({
      status: 'info',
      text: 'NY has NO damages cap for municipal tort claims. Pre-judgment interest: 9% per annum (CPLR §5004).',
    })

    return items
  },
}
