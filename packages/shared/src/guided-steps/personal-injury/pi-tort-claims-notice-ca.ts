import type { GuidedStepConfig } from '../types'

export const piTortClaimsNoticeCaConfig: GuidedStepConfig = {
  title: 'Send a California Government Tort Claim',
  reassurance:
    'If a government entity caused your injury, you must file a formal claim before you can sue. We will walk you through every step.',

  questions: [
    {
      id: 'tort_claims_overview',
      type: 'info',
      prompt:
        'Under California Government Code §§910–913, you must file a written claim with a government entity before filing a lawsuit. The claim must describe (1) the damage or injury claimed, (2) the time and place of the incident, and (3) the incident itself. The deadline is 6 months from the date of the incident for personal injury and property damage claims.',
      helpText:
        'This requirement applies to the State of California, counties, cities, school districts, and special districts (transit authorities, water districts, etc.).',
    },
    {
      id: 'notice_recipient_info',
      type: 'info',
      prompt:
        'Who receives the claim depends on the entity type:\n\n• State agency → Department of General Services, Office of Risk and Insurance Management, P.O. Box 989052, West Sacramento, CA 95798\n• County → County Clerk or Board of Supervisors\n• City → City Clerk\n• School district → District Secretary or governing board\n• Special district → Clerk or secretary of the governing body\n\nCheck the entity\'s website or call their main office to confirm the correct person and mailing address.',
      helpText:
        'Filing with the wrong office can invalidate your claim. When in doubt, file with both the specific official AND the entity\'s clerk.',
    },
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'What is the name and title of the person or office that should receive the claim?',
      helpText:
        'Example: "City Clerk, City of Los Angeles" or "Department of General Services, Office of Risk and Insurance Management." If unsure, call the entity\'s main number to confirm.',
      placeholder: 'e.g., City Clerk, City of Los Angeles',
    },
    {
      id: 'recipient_address',
      type: 'text',
      prompt: 'What is the full mailing address for the recipient?',
      helpText:
        'Use the official mailing address, not a physical/street address unless they are the same. Include suite or P.O. Box if applicable.',
      placeholder: 'e.g., 200 N. Spring Street, Room 395, Los Angeles, CA 90012',
    },
    {
      id: 'incident_date_confirm',
      type: 'text',
      prompt: 'What is the date of the incident? (YYYY-MM-DD)',
      helpText:
        'This must match your records exactly. You have 6 months from this date to file your claim.',
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
        'Be as specific as possible: street address, intersection, building name, floor, or landmark. The more detail, the stronger your claim.',
      placeholder: 'e.g., intersection of Wilshire Blvd and Fairfax Ave, Los Angeles, CA',
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
        'List all injuries (physical and mental), property damage, and other losses. Be thorough — you cannot add claims later that were not described in the original filing.',
      placeholder: 'e.g., broken wrist, concussion, $4,200 in vehicle damage',
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the approximate total dollar amount of your damages?',
      helpText:
        'Include medical bills (past and estimated future), lost wages, property damage, and pain and suffering. If your claim exceeds $10,000, state "damages exceed $10,000" rather than a specific amount. This protects your right to recover the full amount at trial.',
      placeholder: 'e.g., damages exceed $10,000',
    },
    {
      id: 'late_claim_relief_note',
      type: 'info',
      prompt:
        'If you missed the 6-month deadline but are within 1 year of the incident, you may apply for late claim relief under Government Code §911.4. You must file a written application with the government entity explaining why the claim was late. Common grounds include incapacity, minority (under 18), or mistake/excusable neglect. If the entity denies your late claim application, you can petition the court under Government Code §946.6.',
      helpText:
        'Late claim relief is not guaranteed, but it is worth pursuing if you are still within 1 year. After 1 year, the right to file is generally lost.',
    },
    {
      id: 'delivery_method',
      type: 'single_choice',
      prompt: 'How will you deliver the claim?',
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
        'Delivery tips:\n\n• Certified mail — Go to USPS, send via Certified Mail with Return Receipt Requested (green card). Keep the receipt AND the green card when it comes back. Cost is about $7–10.\n• Hand delivery — Bring two copies. Have the recipient sign and date your copy as proof of delivery.\n• Keep copies of everything — the claim, the envelope, the certified mail receipt, and the return receipt.\n\nThese delivery records are your proof that the entity received timely notice.',
      helpText:
        'If the entity later claims they never received the claim, your certified mail receipt is your evidence.',
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
        text: 'Choose a delivery method for the claim.',
      })
    }

    // Reminder
    items.push({
      status: 'info',
      text: 'File your claim as soon as possible — the 6-month deadline is strict. If you missed it, consider applying for late claim relief under Government Code §911.4.',
    })

    return items
  },
}
