import type { GuidedStepConfig } from '../types'

export const piTortClaimsNoticeNyConfig: GuidedStepConfig = {
  title: 'File a New York Notice of Claim',
  reassurance:
    'If a government entity caused your injury, you must file a Notice of Claim within 90 days. We will walk you through every step of this critical process.',

  questions: [
    {
      id: 'tort_claims_overview',
      type: 'info',
      prompt:
        'Under General Municipal Law (GML) §50-e, you MUST serve a Notice of Claim on the municipality within 90 DAYS of the incident. This is one of the strictest deadlines in the country. Missing it almost always bars your claim.\n\nAfter the Notice of Claim, the municipality may demand a 50-h hearing (oral examination under oath). You MUST attend.\n\nThe statute of limitations for suing a municipality is 1 year and 90 days from the incident (GML §50-i).',
    },
    {
      id: 'nyc_distinction',
      type: 'info',
      prompt:
        'NYC vs. Other Municipalities\n\nFor NYC claims:\n• Serve the NYC Comptroller (1 Centre Street, Room 1225, New York, NY 10007)\n• Also serve the Corporation Counsel (NYC Law Department, 100 Church Street, New York, NY 10007)\n• NYC allows online filing via the Comptroller\'s website\n\nFor other municipalities:\n• Serve the clerk or attorney of the specific municipality\n• For counties: serve the County Clerk or County Attorney\n• For school districts: serve the District Clerk\n• For public authorities: serve the Secretary or General Counsel',
    },
    {
      id: 'entity_type',
      type: 'single_choice',
      prompt: 'What type of government entity is involved?',
      options: [
        { value: 'nyc', label: 'New York City (any city agency)' },
        { value: 'county', label: 'County' },
        { value: 'town_village', label: 'Town or Village' },
        { value: 'school_district', label: 'School District' },
        { value: 'public_authority', label: 'Public Authority (MTA, Port Authority)' },
        { value: 'state_agency', label: 'State Agency (NYSDOT, State Police)' },
      ],
    },
    {
      id: 'state_agency_note',
      type: 'info',
      prompt:
        'State Agency Claims — Court of Claims\n\nClaims against New York State agencies (NOT municipalities) are filed in the Court of Claims under Court of Claims Act §10. The deadline is different:\n\n• File a Claim (not a Notice of Claim) within 90 days of accrual for intentional torts\n• File within the general SOL for negligence (3 years) BUT you must first serve a Notice of Intention to File a Claim at least 90 days before filing, OR file the Claim itself within 90 days\n\nThis is a different process from the municipal Notice of Claim.',
      showIf: (answers) => answers.entity_type === 'state_agency',
    },
    {
      id: 'recipient_name',
      type: 'text',
      prompt: 'Who should receive the Notice of Claim?',
      helpText:
        'For NYC: "Comptroller of the City of New York." For others: the clerk or attorney of the municipality.',
      placeholder: 'e.g., Comptroller of the City of New York',
    },
    {
      id: 'recipient_address',
      type: 'text',
      prompt: 'What is the full mailing address for the recipient?',
      placeholder: 'e.g., 1 Centre Street, Room 1225, New York, NY 10007',
    },
    {
      id: 'incident_date_confirm',
      type: 'text',
      prompt: 'What is the date of the incident? (YYYY-MM-DD)',
      helpText: 'You have 90 days from this date. This deadline is almost never extended.',
      placeholder: 'e.g., 2026-01-15',
    },
    {
      id: 'incident_time',
      type: 'text',
      prompt: 'What was the approximate time of the incident?',
      placeholder: 'e.g., approximately 3:00 PM',
    },
    {
      id: 'incident_location',
      type: 'text',
      prompt: 'Where exactly did the incident occur?',
      helpText: 'Be as specific as possible — exact address, intersection, or landmark.',
      placeholder: 'e.g., northwest corner of Broadway and 42nd Street, Manhattan',
    },
    {
      id: 'how_injury_occurred',
      type: 'text',
      prompt: 'How did the injury happen? What did the government entity do or fail to do?',
      placeholder: 'Describe the circumstances',
    },
    {
      id: 'injuries_sustained',
      type: 'text',
      prompt: 'What injuries or damages did you suffer?',
      helpText: 'List all injuries — the Notice of Claim must describe "the nature of the claim" and "items of damage or injuries claimed" (GML §50-e(2)).',
      placeholder: 'e.g., fractured ankle, torn ACL, $25,000 in medical bills',
    },

    // === Notice Contents (GML §50-e(2)) ===
    {
      id: 'contents_info',
      type: 'info',
      prompt:
        'Required Contents — GML §50-e(2)\n\nYour Notice of Claim must include:\n\n1. Name and address of the claimant\n2. Name and address of your attorney (or state "pro se")\n3. The nature of the claim\n4. The time when, the place where, and the manner in which the claim arose\n5. The items of damage or injuries claimed (as far as practicable at the time)',
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the approximate total dollar amount of your damages?',
      placeholder: 'e.g., $100,000',
    },

    // === Delivery Method ===
    {
      id: 'delivery_method',
      type: 'single_choice',
      prompt: 'How will you deliver the Notice of Claim?',
      options: [
        { value: 'personal_delivery', label: 'Personal delivery (recommended)' },
        { value: 'certified_mail', label: 'Certified mail, return receipt requested' },
        { value: 'online', label: 'Online filing (NYC Comptroller\'s website — NYC only)' },
      ],
    },
    {
      id: 'delivery_instructions',
      type: 'info',
      prompt:
        'Delivery Tips\n\n• Personal delivery is strongest — get a stamped receipt copy\n• Certified mail works but adds mailing time to your deadline calculation\n• For NYC: online filing via Comptroller\'s website is convenient and creates an electronic record\n• Keep copies of EVERYTHING — the Notice, delivery proof, any correspondence\n\nThe 90-day deadline runs from the incident date, not the discovery date. Calculate carefully.',
    },

    // === 50-h Hearing Warning ===
    {
      id: 'fifty_h_hearing_info',
      type: 'info',
      prompt:
        'IMPORTANT: 50-h Hearing — GML §50-h\n\nAfter receiving your Notice of Claim, the municipality may demand an oral examination (50-h hearing). This is essentially a deposition under oath.\n\nKey rules:\n• You MUST attend — failure to appear can result in dismissal of your case\n• Testimony is under oath and can be used against you at trial\n• The hearing must be held within 90 days of the demand\n• You cannot file your lawsuit until 30 days after the hearing (or 30 days after the demand if no hearing is scheduled)\n\nPrepare for this hearing carefully. Stick to facts you know. Do not speculate.',
    },

    // === Late Notice Petition ===
    {
      id: 'late_notice_info',
      type: 'info',
      prompt:
        'Late Notice Petition — GML §50-e(5)\n\nIf you miss the 90-day deadline, you can petition the court for leave to serve a late notice. This must be brought within 1 year and 90 days of the incident.\n\nThe court considers:\n• Whether the municipality acquired actual knowledge of the facts within 90 days (e.g., police report, 911 call, EMS response)\n• Whether the delay was excusable\n• Whether the municipality is substantially prejudiced\n\nCourts are strict but not absolute. Actual knowledge helps significantly. However, do NOT rely on this — file on time.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Recipient
    if (answers.recipient_name && answers.recipient_address) {
      items.push({ status: 'done', text: `Recipient: ${answers.recipient_name}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify the correct recipient and mailing address.' })
    }

    // Incident description
    if (answers.how_injury_occurred) {
      items.push({ status: 'done', text: 'Incident description provided.' })
    } else {
      items.push({ status: 'needed', text: 'Describe how the injury occurred.' })
    }

    // Injuries
    if (answers.injuries_sustained) {
      items.push({ status: 'done', text: 'Injuries and damages documented.' })
    } else {
      items.push({ status: 'needed', text: 'List all injuries and damages.' })
    }

    // Damages amount
    if (answers.damages_amount) {
      items.push({ status: 'done', text: `Estimated damages: ${answers.damages_amount}.` })
    } else {
      items.push({ status: 'needed', text: 'Estimate total damages.' })
    }

    // Delivery method
    if (answers.delivery_method) {
      const labels: Record<string, string> = {
        personal_delivery: 'personal delivery',
        certified_mail: 'certified mail',
        online: 'online (NYC Comptroller)',
      }
      items.push({ status: 'done', text: `Delivery: ${labels[answers.delivery_method] ?? answers.delivery_method}.` })
    } else {
      items.push({ status: 'needed', text: 'Choose a delivery method.' })
    }

    // Reminders
    items.push({
      status: 'info',
      text: 'DEADLINE: 90 days from incident. This is almost never extended. File immediately.',
    })
    items.push({
      status: 'info',
      text: '50-h hearing: The municipality may demand an oral exam under oath. You MUST attend.',
    })
    items.push({
      status: 'info',
      text: 'SOL: 1 year + 90 days from incident to file lawsuit (GML §50-i). Cannot file until 30 days after 50-h hearing.',
    })

    return items
  },
}
