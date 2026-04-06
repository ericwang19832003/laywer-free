import type { GuidedStepConfig } from '../types'

export const piTortClaimsNoticePaConfig: GuidedStepConfig = {
  title: 'Send a Pennsylvania Political Subdivision Tort Claim Notice',
  reassurance:
    'If a political subdivision caused your injury, you must send formal notice before you can sue. We will walk you through every step.',

  questions: [
    {
      id: 'tort_claims_overview',
      type: 'info',
      prompt:
        'Under 42 Pa.C.S. \u00A78528, political subdivisions (cities, counties, boroughs, townships, school districts, and authorities) have limited immunity from lawsuits. Before you can sue, you must send written notice within 6 months of the incident. The notice must include your name and address, the date and place of the incident, the circumstances of the injury, and the nature of the injury sustained.',
      helpText:
        'This notice requirement applies only to political subdivisions — NOT to the Commonwealth of Pennsylvania or state agencies. Commonwealth claims do not require pre-suit notice, but are subject to a $250,000 damages cap per claimant under sovereign immunity (42 Pa.C.S. \u00A78528(b)).',
    },
    {
      id: 'commonwealth_distinction',
      type: 'info',
      prompt:
        'Important distinction: Pennsylvania law treats political subdivisions (cities, counties, school districts, authorities) differently from the Commonwealth (state agencies like PennDOT). If your claim is against a Commonwealth agency, you do NOT need to send this notice — but you are limited to a $250,000 damages cap per person. This guide covers political subdivision claims only.',
    },
    {
      id: 'notice_recipient_info',
      type: 'info',
      prompt:
        'Who receives the notice depends on the entity type:\n\n\u2022 Municipality (city, borough, township) \u2192 Clerk or Secretary of the municipality\n\u2022 County \u2192 County Commissioners or County Solicitor\n\u2022 School district \u2192 Secretary of the school board\n\u2022 Authority (transit, water, parking, etc.) \u2192 Secretary or Executive Director of the authority\n\nCheck the entity\u2019s website or call their main office to confirm the correct person and mailing address.',
      helpText:
        'Sending to the wrong office can jeopardize your claim. When in doubt, send to both the specific official AND the governing body\u2019s clerk or secretary.',
    },
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'What is the name and title of the person or office that should receive the notice?',
      helpText:
        'Example: "Township Secretary, Lower Merion Township" or "Secretary, School District of Philadelphia Board of Education." If unsure, call the entity\u2019s main number to confirm.',
      placeholder: 'e.g., Township Secretary, Lower Merion Township',
    },
    {
      id: 'recipient_address',
      type: 'text',
      prompt: 'What is the full mailing address for the recipient?',
      helpText:
        'Use the official mailing address, not a physical/street address unless they are the same. Include suite or P.O. Box if applicable.',
      placeholder: 'e.g., 75 E. Lancaster Avenue, Ardmore, PA 19003',
    },
    {
      id: 'incident_date_confirm',
      type: 'text',
      prompt: 'What is the date of the incident? (YYYY-MM-DD)',
      helpText:
        'This must match your records exactly. You have 6 months from this date to send your notice.',
      placeholder: 'e.g., 2025-03-15',
    },
    {
      id: 'incident_time',
      type: 'text',
      prompt: 'What was the approximate time of the incident?',
      helpText:
        'An approximation is fine \u2014 "around 3:00 PM" or "morning rush hour" is acceptable.',
      placeholder: 'e.g., approximately 3:00 PM',
    },
    {
      id: 'incident_location',
      type: 'text',
      prompt: 'Where exactly did the incident occur?',
      helpText:
        'Be as specific as possible: street address, intersection, building name, floor, or landmark. The more detail, the stronger your notice.',
      placeholder: 'e.g., intersection of Broad Street and Walnut Street, Philadelphia, PA',
    },
    {
      id: 'how_injury_occurred',
      type: 'text',
      prompt: 'How did the injury happen? What did the political subdivision do or fail to do?',
      helpText:
        'Describe the government\u2019s action or inaction. Examples: "failed to repair a known pothole on a township road," "dangerous condition on school property with no warning signs," "defective traffic signal at a county-maintained intersection."',
      placeholder: 'Describe what the political subdivision did or failed to do',
    },
    {
      id: 'injuries_sustained',
      type: 'text',
      prompt: 'What injuries or damages did you suffer?',
      helpText:
        'List all injuries (physical and mental), property damage, and other losses. Be thorough \u2014 the notice should describe the full nature of your injuries.',
      placeholder: 'e.g., broken wrist, concussion, $4,200 in vehicle damage',
    },
    {
      id: 'damages_cap_info',
      type: 'info',
      prompt:
        'Pennsylvania caps damages against political subdivisions at $500,000 per occurrence (42 Pa.C.S. \u00A78553). This means the total recovery for all claimants from one incident is capped at $500,000, regardless of the number of injured parties. Keep this in mind when estimating your damages.',
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the approximate total dollar amount of your damages?',
      helpText:
        'Include medical bills (past and estimated future), lost wages, property damage, and pain and suffering. Remember: recovery against political subdivisions is capped at $500,000 per occurrence.',
      placeholder: 'e.g., $75,000',
    },
    {
      id: 'delivery_method',
      type: 'single_choice',
      prompt: 'How will you deliver the notice?',
      helpText:
        'Pennsylvania law allows certified mail or personal delivery. Certified mail with return receipt requested is strongly recommended because it creates proof of delivery.',
      options: [
        { value: 'certified_mail', label: 'Certified mail, return receipt requested (recommended)' },
        { value: 'personal_delivery', label: 'Personal delivery with signed acknowledgment' },
        { value: 'both', label: 'Both certified mail and personal delivery' },
      ],
    },
    {
      id: 'delivery_instructions',
      type: 'info',
      prompt:
        'Delivery tips:\n\n\u2022 Certified mail \u2014 Go to USPS, send via Certified Mail with Return Receipt Requested (green card). Keep the receipt AND the green card when it comes back. Cost is about $7\u201310.\n\u2022 Personal delivery \u2014 Bring two copies. Have the recipient sign and date your copy as proof of delivery.\n\u2022 Keep copies of everything \u2014 the notice, the envelope, the certified mail receipt, and the return receipt.\n\nThese delivery records are your proof that the entity received timely notice.',
      helpText:
        'If the entity later claims they never received the notice, your certified mail receipt is your evidence.',
    },
    {
      id: 'no_late_relief_warning',
      type: 'info',
      prompt:
        'Unlike some other states, Pennsylvania does NOT have a late claim relief provision for political subdivision tort claims. If you miss the 6-month notice deadline, your claim is likely barred. There is no equivalent to California\u2019s late claim application process. Act promptly \u2014 send your notice as soon as possible.',
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
        text: 'Describe how the injury occurred and what the political subdivision did or failed to do.',
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
        personal_delivery: 'personal delivery',
        both: 'certified mail and personal delivery',
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

    // Reminders
    items.push({
      status: 'info',
      text: 'Send your notice as soon as possible \u2014 the 6-month deadline is strict and Pennsylvania has no late claim relief provision.',
    })

    items.push({
      status: 'info',
      text: 'Damages cap reminder: recovery against political subdivisions is capped at $500,000 per occurrence (42 Pa.C.S. \u00A78553).',
    })

    return items
  },
}
