import type { GuidedStepConfig } from '../types'

export const piTortClaimsNoticeFlConfig: GuidedStepConfig = {
  title: 'Send a Florida Government Tort Claim Notice',
  reassurance:
    'If a government entity caused your injury, you must send pre-suit notice and wait 180 days before filing a lawsuit. We will walk you through every step.',

  questions: [
    {
      id: 'tort_claims_overview',
      type: 'info',
      prompt:
        'Under §768.28(6), you MUST send written notice via certified mail to:\n\n1. The specific government agency involved\n2. The Department of Financial Services (DFS), Division of Risk Management\n\nYou CANNOT file suit until 180 days after the notice is received (or the agency denies the claim in writing, whichever is sooner).\n\nDamages are capped at $200,000 per claimant and $300,000 per incident. To recover above these caps, you must seek a claims bill from the Florida Legislature.\n\nSOL: 4 years for government claims (§768.28(14)), but notice must be filed within 3 years.',
    },
    {
      id: 'entity_type',
      type: 'single_choice',
      prompt: 'What type of government entity is involved?',
      options: [
        { value: 'state_agency', label: 'State agency (FDOT, FHP, state hospital, state university)' },
        { value: 'county', label: 'County government' },
        { value: 'municipality', label: 'Municipality (city or town)' },
        { value: 'school_district', label: 'School district' },
        { value: 'special_district', label: 'Special district (water, fire, transit authority)' },
      ],
    },
    {
      id: 'agency_recipient_name',
      type: 'text',
      prompt: 'What is the name of the specific government agency?',
      placeholder: 'e.g., City of Miami, Orange County, Florida Department of Transportation',
    },
    {
      id: 'agency_address',
      type: 'text',
      prompt: 'What is the mailing address for the government agency?',
      helpText: 'Check the agency\'s website for the correct address for legal notices or the risk management department.',
      placeholder: 'Full mailing address',
    },
    {
      id: 'dfs_info',
      type: 'info',
      prompt:
        'DFS Notice — Required for ALL Government Claims\n\nIn addition to notifying the specific agency, you MUST also send notice to:\n\nDepartment of Financial Services\nDivision of Risk Management\n200 East Gaines Street\nTallahassee, FL 32399-0323\n\nBoth notices must be sent via certified mail.',
    },
    {
      id: 'incident_date_confirm',
      type: 'text',
      prompt: 'What is the date of the incident? (YYYY-MM-DD)',
      helpText: 'Notice must be filed within 3 years of this date. SOL is 4 years.',
      placeholder: 'e.g., 2026-01-15',
    },
    {
      id: 'incident_location',
      type: 'text',
      prompt: 'Where exactly did the incident occur?',
      placeholder: 'e.g., intersection of US-1 and SW 8th Street, Miami, FL',
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
      placeholder: 'e.g., broken wrist, concussion, $15,000 in medical bills',
    },
    {
      id: 'responsible_employees',
      type: 'text',
      prompt: 'Names of responsible government employees (if known)',
      helpText: 'Include names and titles if you know them. If unknown, state "unknown at this time."',
      placeholder: 'e.g., Officer John Smith, Badge #1234',
    },
    {
      id: 'damages_amount',
      type: 'text',
      prompt: 'What is the approximate total dollar amount of your damages?',
      helpText: 'Remember: recovery is capped at $200,000 per claimant / $300,000 per incident unless you seek a claims bill from the Legislature.',
      placeholder: 'e.g., $75,000',
    },

    // === Damages Cap & Claims Bill ===
    {
      id: 'damages_cap_info',
      type: 'info',
      prompt:
        'Damages Caps — §768.28(5)\n\nFlorida caps government tort claim damages at:\n• $200,000 per claimant\n• $300,000 per incident (total for all claimants)\n\nIf your damages exceed these caps, your only option is a claims bill — a special act of the Florida Legislature authorizing additional payment. Claims bills are rare and politically difficult to obtain.\n\nKeep this cap in mind when evaluating settlement offers.',
    },
    {
      id: 'exceeds_cap',
      type: 'yes_no',
      prompt: 'Do your damages exceed the $200,000 per claimant cap?',
    },
    {
      id: 'claims_bill_info',
      type: 'info',
      prompt:
        'Claims Bill Process\n\nIf your damages exceed the cap, you may pursue a claims bill after obtaining a judgment or settlement:\n\n1. Obtain a judgment or settlement agreeing to amounts above the cap\n2. Hire a lobbyist or find a legislative sponsor\n3. File a claims bill with the Florida Legislature\n4. The bill must pass both chambers and be signed by the Governor\n\nThis is a political process, not a legal one. Success rates are low. Consider consulting an attorney who specializes in claims bills.',
      showIf: (answers) => answers.exceeds_cap === 'yes',
    },

    // === Delivery ===
    {
      id: 'delivery_info',
      type: 'info',
      prompt:
        'Delivery Requirements\n\nBoth notices (to the agency AND to DFS) must be sent via certified mail.\n\n• Send to BOTH recipients on the same day\n• Keep certified mail receipts and return receipt cards\n• Keep copies of every document sent\n\nThe 180-day waiting period begins when the notice is received, not when it is mailed.',
    },
    {
      id: 'notices_sent',
      type: 'single_choice',
      prompt: 'Have you sent the notices?',
      options: [
        { value: 'both_sent', label: 'Yes — sent to both the agency and DFS' },
        { value: 'agency_only', label: 'Sent to agency only — need to send to DFS' },
        { value: 'not_sent', label: 'Not yet sent' },
      ],
    },
    {
      id: 'send_dfs_warning',
      type: 'info',
      prompt:
        'You MUST also send notice to the Department of Financial Services. Failure to notify DFS can result in dismissal of your case. Send immediately to:\n\nDFS, Division of Risk Management\n200 East Gaines Street\nTallahassee, FL 32399-0323',
      showIf: (answers) => answers.notices_sent === 'agency_only',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Recipient
    if (answers.agency_recipient_name) {
      items.push({ status: 'done', text: `Agency: ${answers.agency_recipient_name}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify the government agency.' })
    }

    // Incident description
    if (answers.how_injury_occurred) {
      items.push({ status: 'done', text: 'Incident description provided.' })
    } else {
      items.push({ status: 'needed', text: 'Describe how the injury occurred.' })
    }

    // Injuries
    if (answers.injuries_sustained) {
      items.push({ status: 'done', text: 'Injuries documented.' })
    } else {
      items.push({ status: 'needed', text: 'List all injuries and damages.' })
    }

    // Notices sent
    if (answers.notices_sent === 'both_sent') {
      items.push({ status: 'done', text: 'Notices sent to both agency and DFS.' })
    } else if (answers.notices_sent === 'agency_only') {
      items.push({ status: 'needed', text: 'Send notice to DFS (Division of Risk Management, Tallahassee).' })
    } else {
      items.push({ status: 'needed', text: 'Send certified mail notices to BOTH the agency AND DFS.' })
    }

    // Damages cap
    if (answers.exceeds_cap === 'yes') {
      items.push({
        status: 'info',
        text: 'Damages exceed $200K cap — claims bill from Legislature required for excess recovery.',
      })
    }

    // Reminders
    items.push({
      status: 'info',
      text: '180-day waiting period after notice received before filing suit. SOL: 4 years (§768.28(14)).',
    })
    items.push({
      status: 'info',
      text: 'Caps: $200,000/claimant, $300,000/incident (§768.28(5)).',
    })

    return items
  },
}
