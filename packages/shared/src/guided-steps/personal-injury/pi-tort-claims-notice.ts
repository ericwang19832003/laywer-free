import type { GuidedStepConfig } from '../types'

export const piTortClaimsNoticeConfig: GuidedStepConfig = {
  title: 'Send a Texas Tort Claims Act Notice',
  reassurance:
    'If a government entity caused your injury, you must send formal notice before you can sue. We will walk you through every step.',

  questions: [
    {
      id: 'tort_claims_overview',
      type: 'info',
      prompt:
        'Under the Texas Tort Claims Act (CPRC Chapter 101), you must send written notice to a government entity before filing a lawsuit. The notice must describe (1) the damage or injury claimed, (2) the time and place of the incident, and (3) the incident itself. Deadlines are strict — generally 6 months for cities and counties, 6 months for the state — so send your notice as soon as possible.',
      helpText:
        'This requirement applies to cities, counties, the State of Texas, school districts, hospital districts, and other governmental units.',
    },
    {
      id: 'notice_recipient_info',
      type: 'info',
      prompt:
        'Who receives the notice depends on the entity type:\n\n• City → City Secretary (or City Clerk)\n• County → County Judge\n• State of Texas → Attorney General\n• School District → Superintendent\n• Hospital District → Board President or Administrator\n\nCheck the entity\'s website or call their main office to confirm the correct person and mailing address.',
      helpText:
        'Sending to the wrong person can invalidate your notice. When in doubt, send to both the specific official AND the entity\'s registered agent.',
    },
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'What is the name and title of the person who should receive the notice?',
      helpText:
        'Example: "Jane Smith, City Secretary" or "Office of the Attorney General." If unsure, call the entity\'s main number to confirm.',
      placeholder: 'e.g., Jane Smith, City Secretary',
    },
    {
      id: 'recipient_address',
      type: 'text',
      prompt: 'What is the full mailing address for the recipient?',
      helpText:
        'Use the official mailing address, not a physical/street address unless they are the same. Include suite or P.O. Box if applicable.',
      placeholder: 'e.g., 301 W. 2nd Street, Austin, TX 78701',
    },
    {
      id: 'incident_date_confirm',
      type: 'text',
      prompt: 'What is the date of the incident? (YYYY-MM-DD)',
      helpText:
        'This must match your records exactly. The deadline to send notice is calculated from this date.',
      placeholder: 'e.g., 2025-03-15',
    },
    {
      id: 'incident_time',
      type: 'text',
      prompt: 'What was the approximate time of the incident?',
      helpText:
        'An approximation is fine — "around 3:00 PM" or "morning rush hour" is acceptable.',
      placeholder: 'e.g., approximately 3:00 PM',
    },
    {
      id: 'incident_location',
      type: 'text',
      prompt: 'Where exactly did the incident occur?',
      helpText:
        'Be as specific as possible: street address, intersection, building name, floor, or landmark. The more detail, the stronger your notice.',
      placeholder: 'e.g., intersection of Congress Ave and 6th Street, Austin, TX',
    },
    {
      id: 'how_injury_occurred',
      type: 'text',
      prompt: 'How did the injury happen? What did the government entity do or fail to do?',
      helpText:
        'Describe the government\'s action or inaction. Examples: "failed to repair a known pothole," "employee ran a red light in a city vehicle," "dangerous condition on school property with no warning signs."',
      placeholder: 'Describe what the government entity did or failed to do',
    },
    {
      id: 'injuries_sustained',
      type: 'text',
      prompt: 'What injuries or damages did you suffer?',
      helpText:
        'List all injuries (physical and mental), property damage, and other losses. Be thorough — you cannot add claims later that were not described in the notice.',
      placeholder: 'e.g., broken wrist, concussion, $4,200 in vehicle damage',
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the approximate total dollar amount of your damages?',
      helpText:
        'Include medical bills (past and estimated future), lost wages, property damage, and pain and suffering. It is better to estimate high than low — the notice caps what you can recover.',
      placeholder: 'e.g., $75,000',
    },
    {
      id: 'local_deadline_warning',
      type: 'info',
      prompt:
        'Some cities impose shorter notice deadlines by charter:\n\n• Austin — 45 days from the incident\n• Houston — 90 days from the incident\n• Dallas — 90 days from the incident\n\nIf your claim involves one of these cities (or any city with a home-rule charter), check the city charter for a shorter deadline. When in doubt, send the notice immediately.',
      helpText:
        'Missing the local deadline can bar your entire claim, even if you meet the state 6-month deadline.',
    },
    {
      id: 'delivery_method',
      type: 'single_choice',
      prompt: 'How will you deliver the notice?',
      helpText:
        'Certified mail with return receipt requested is strongly recommended because it creates proof of delivery.',
      options: [
        { value: 'certified_mail', label: 'Certified mail, return receipt requested (recommended)' },
        { value: 'hand_delivery', label: 'Hand delivery with signed acknowledgment' },
        { value: 'both', label: 'Both certified mail and hand delivery' },
      ],
    },
    {
      id: 'delivery_instructions',
      type: 'info',
      prompt:
        'Delivery tips:\n\n• Certified mail — Go to USPS, send via Certified Mail with Return Receipt Requested (green card). Keep the receipt AND the green card when it comes back. Cost is about $7–10.\n• Hand delivery — Bring two copies. Have the recipient sign and date your copy as proof of delivery.\n• Keep copies of everything — the notice, the envelope, the certified mail receipt, and the return receipt.\n\nThese delivery records are your proof that the entity received timely notice.',
      helpText:
        'If the entity later claims they never received the notice, your certified mail receipt is your evidence.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Recipient info
    if (answers.recipient_name && answers.recipient_address) {
      items.push({
        status: 'done',
        text: `Recipient identified: ${answers.recipient_name}.`,
      })
    } else if (answers.recipient_name || answers.recipient_address) {
      items.push({
        status: 'needed',
        text: 'Complete the recipient name and mailing address.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the correct recipient and their mailing address.',
      })
    }

    // Incident description
    if (answers.how_injury_occurred) {
      items.push({
        status: 'done',
        text: 'Incident description provided.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Describe how the injury occurred and what the government entity did or failed to do.',
      })
    }

    // Injuries
    if (answers.injuries_sustained) {
      items.push({
        status: 'done',
        text: 'Injuries and damages documented.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'List all injuries and damages suffered.',
      })
    }

    // Damages amount
    if (answers.damages_amount) {
      items.push({
        status: 'done',
        text: `Estimated damages: ${answers.damages_amount}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Estimate the total dollar amount of your damages.',
      })
    }

    // Delivery method
    if (answers.delivery_method) {
      const methodLabels: Record<string, string> = {
        certified_mail: 'certified mail',
        hand_delivery: 'hand delivery',
        both: 'certified mail and hand delivery',
      }
      items.push({
        status: 'done',
        text: `Delivery method: ${methodLabels[answers.delivery_method] ?? answers.delivery_method}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a delivery method for the notice.',
      })
    }

    // Reminder
    items.push({
      status: 'info',
      text: 'Send your notice as soon as possible — deadlines are strict and missing them can bar your claim entirely.',
    })

    return items
  },
}
