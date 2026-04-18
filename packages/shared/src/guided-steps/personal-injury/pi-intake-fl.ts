import type { GuidedStepConfig } from '../types'

export const piIntakeFlConfig: GuidedStepConfig = {
  title: 'Tell Us About Your Injury',
  reassurance:
    'This information helps us understand your case and prepare your documents. Everything you share is protected by attorney-client privilege principles.',

  questions: [
    // === PIP / Permanent Injury Threshold ===
    {
      id: 'pip_header',
      type: 'info',
      prompt:
        "Florida's No-Fault PIP System — §627.730-627.7405\n\nFlorida is a no-fault auto insurance state. Every vehicle owner must carry $10,000 in Personal Injury Protection (PIP). PIP covers 80% of reasonable medical expenses and 60% of lost wages, regardless of fault.\n\nCRITICAL: You must seek initial medical treatment within 14 DAYS of the accident or you lose PIP benefits entirely (§627.736(1)(a)).\n\nTo sue the at-fault driver for pain and suffering, you must prove a \"permanent injury\" under §627.737(2).",
    },
    {
      id: 'is_motor_vehicle',
      type: 'yes_no',
      prompt: 'Is this a motor vehicle accident case?',
      helpText:
        'Motor vehicle cases have special PIP and permanent injury threshold rules.',
    },
    {
      id: 'sought_treatment_14_days',
      type: 'yes_no',
      prompt: 'Did you seek medical treatment within 14 days of the accident?',
      helpText:
        'Under §627.736(1)(a), you must receive initial medical treatment within 14 days or lose PIP benefits entirely.',
      showIf: (answers) => answers.is_motor_vehicle === 'yes',
    },
    {
      id: 'missed_14_day_warning',
      type: 'info',
      prompt:
        'WARNING: 14-Day Rule May Bar PIP Benefits\n\nIf you did not seek medical treatment within 14 days of the accident, you may have lost your PIP benefits entirely. This is a strict deadline under §627.736(1)(a). You can still pursue a claim against the at-fault driver, but you will not have PIP coverage for your medical expenses.',
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' &&
        answers.sought_treatment_14_days === 'no',
    },
    {
      id: 'emc_determination',
      type: 'single_choice',
      prompt: 'Was your condition determined to be an Emergency Medical Condition (EMC)?',
      helpText:
        'An EMC is a condition where absence of immediate medical attention could result in serious jeopardy to health. This determines your PIP coverage cap.',
      options: [
        { value: 'yes', label: 'Yes — EMC determined (full $10,000 PIP coverage)' },
        { value: 'no', label: 'No — not an EMC (PIP capped at $2,500)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' &&
        answers.sought_treatment_14_days !== 'no',
    },
    {
      id: 'emc_no_warning',
      type: 'info',
      prompt:
        'PIP Cap: $2,500\n\nWithout an Emergency Medical Condition determination, your PIP medical benefits are capped at $2,500 instead of $10,000. Make sure your treating physician documents whether your condition constitutes an EMC — this determination must be made by a licensed physician, dentist, PA, or ARNP.',
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' && answers.emc_determination === 'no',
    },
    {
      id: 'permanent_injury_check',
      type: 'single_choice',
      prompt:
        'Does your injury meet the permanent injury threshold to sue for pain and suffering? (§627.737(2))',
      helpText:
        'You must meet at least one category to recover non-economic damages in a motor vehicle case.',
      options: [
        {
          value: 'permanent_loss_bodily_function',
          label: 'Significant and permanent loss of an important bodily function',
        },
        {
          value: 'permanent_injury',
          label: 'Permanent injury within a reasonable degree of medical probability',
        },
        {
          value: 'permanent_scarring',
          label: 'Significant and permanent scarring or disfigurement',
        },
        { value: 'death', label: 'Death' },
        { value: 'unsure', label: 'I am not sure' },
        { value: 'none', label: 'None of these apply' },
      ],
      showIf: (answers) => answers.is_motor_vehicle === 'yes',
    },
    {
      id: 'permanent_injury_met',
      type: 'info',
      prompt:
        'Good News: Permanent Injury Threshold Likely Met\n\nBased on your answer, you likely meet the permanent injury threshold under §627.737(2) and can sue the at-fault driver for pain and suffering.\n\nYou will need medical evidence establishing the permanence of your injury within a reasonable degree of medical probability.',
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' &&
        answers.permanent_injury_check !== undefined &&
        answers.permanent_injury_check !== 'none' &&
        answers.permanent_injury_check !== 'unsure',
    },
    {
      id: 'permanent_injury_not_met',
      type: 'info',
      prompt:
        'Important: Permanent Injury Threshold May Not Be Met\n\nWithout meeting the permanent injury threshold, you cannot sue the at-fault driver for pain and suffering. You can still recover economic damages exceeding your PIP coverage.\n\nConsider asking your doctor whether your injuries may result in permanent limitation or disfigurement.',
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' &&
        answers.permanent_injury_check === 'none',
    },

    // === Government Entity Detection ===
    {
      id: 'gov_entity_info',
      type: 'info',
      prompt:
        'Government Entity Check\n\nFlorida has waived sovereign immunity for tort claims under §768.28, but with strict conditions. You must send written notice to the agency AND the Department of Financial Services at least 180 DAYS before filing suit. Damages are capped at $200,000 per claimant / $300,000 per incident.',
    },
    {
      id: 'gov_employee_on_duty',
      type: 'yes_no',
      prompt:
        'Was the other party a government employee acting in their official capacity? (Examples: state trooper, county employee, city bus driver, public school staff)',
    },
    {
      id: 'gov_property',
      type: 'yes_no',
      prompt:
        'Did the incident happen on government-owned property? (Examples: state road defect, public park, government building, public transit)',
      showIf: (answers) => answers.gov_employee_on_duty !== 'yes',
    },
    {
      id: 'gov_vehicle',
      type: 'yes_no',
      prompt:
        'Was a government-owned vehicle involved? (Examples: city bus, sheriff patrol car, school bus)',
      showIf: (answers) =>
        answers.gov_employee_on_duty !== 'yes' &&
        answers.gov_property !== 'yes',
    },
    {
      id: 'gov_entity_type',
      type: 'single_choice',
      prompt: 'What type of government entity is involved?',
      options: [
        { value: 'state_agency', label: 'State agency (FDOT, FHP, state hospital, state university)' },
        { value: 'county', label: 'County government' },
        { value: 'municipality', label: 'Municipality (city or town)' },
        { value: 'school_district', label: 'School district' },
        { value: 'special_district', label: 'Special district (water, fire, transit)' },
      ],
      showIf: (answers) =>
        answers.gov_employee_on_duty === 'yes' ||
        answers.gov_property === 'yes' ||
        answers.gov_vehicle === 'yes',
    },
    {
      id: 'gov_entity_name',
      type: 'text',
      prompt:
        'What is the name of the government entity? (e.g., "City of Miami", "Orange County", "FDOT")',
      placeholder: 'Enter the government entity name',
      showIf: (answers) =>
        answers.gov_employee_on_duty === 'yes' ||
        answers.gov_property === 'yes' ||
        answers.gov_vehicle === 'yes',
    },
    {
      id: 'gov_entity_warning',
      type: 'info',
      prompt:
        'IMPORTANT: Pre-Suit Notice Required — §768.28(6)\n\nYou MUST send written notice via certified mail to:\n1. The specific government agency involved\n2. The Department of Financial Services, Division of Risk Management, 200 East Gaines Street, Tallahassee, FL 32399-0323\n\nYou CANNOT file suit until 180 days after the notice is received (or the agency denies the claim in writing, whichever is sooner).\n\nDamages caps: $200,000 per claimant / $300,000 per incident. To recover above these caps, you must seek a claims bill from the Florida Legislature.\n\nSOL for government claims: 4 years (§768.28(14)), but notice must be filed within 3 years.\n\nWe\'ll add a task to help you draft and file this notice.',
      showIf: (answers) =>
        answers.gov_employee_on_duty === 'yes' ||
        answers.gov_property === 'yes' ||
        answers.gov_vehicle === 'yes',
    },

    // === SOL Tolling ===
    {
      id: 'sol_tolling_info',
      type: 'info',
      prompt:
        'Statute of Limitations Check\n\nFlorida gives you 2 YEARS from the date of injury to file a personal injury lawsuit (§95.11(3)(a)). This was reduced from 4 years by HB 837 (effective March 24, 2023). Medical malpractice: 2 years from discovery, 4-year repose (§95.11(4)(b)). Government claims: 4 years (§768.28(14)).',
    },
    {
      id: 'incident_before_hb837',
      type: 'yes_no',
      prompt: 'Did the incident occur before March 24, 2023?',
      helpText:
        'HB 837 changed the SOL from 4 years to 2 years. Incidents before this date retain the 4-year SOL.',
    },
    {
      id: 'hb837_transition_info',
      type: 'info',
      prompt:
        'Good News: 4-Year SOL Applies\n\nSince your incident occurred before March 24, 2023, you have the original 4-year statute of limitations — not the reduced 2-year period under HB 837.',
      showIf: (answers) => answers.incident_before_hb837 === 'yes',
    },
    {
      id: 'minor_at_incident',
      type: 'yes_no',
      prompt: 'Were you under 18 years old at the time of the incident?',
      helpText:
        'If yes, the SOL is tolled until age 18, but subject to a maximum 7-year cap from accrual (§95.051(1)(e), §95.051(2)).',
    },
    {
      id: 'mental_incapacity',
      type: 'yes_no',
      prompt:
        'Were you mentally incapacitated at the time of the incident (e.g., coma, severe brain injury)?',
      helpText:
        'If yes, the SOL is tolled during incapacity, subject to a 7-year cap (§95.051(1)(f), §95.051(2)).',
      showIf: (answers) => answers.minor_at_incident !== 'yes',
    },
    {
      id: 'discovered_later',
      type: 'yes_no',
      prompt:
        'Did you discover the injury significantly later than when it occurred? (e.g., delayed medical diagnosis, latent condition)',
      helpText:
        'Florida\'s discovery rule may start the clock from when you knew or should have known about the injury (§95.031(2)).',
      showIf: (answers) =>
        answers.minor_at_incident !== 'yes' &&
        answers.mental_incapacity !== 'yes',
    },

    // === Modified Comparative Fault (51% Bar — HB 837) ===
    {
      id: 'comparative_fault_info',
      type: 'info',
      prompt:
        "CRITICAL: Florida's Modified Comparative Fault — 51% Bar (HB 837)\n\nEffective March 24, 2023, Florida changed from pure comparative fault to a MODIFIED system with a 51% bar (§768.81):\n\n• If you are 50% or less at fault — recovery reduced by your percentage of fault\n• If you are 51% or MORE at fault — NO RECOVERY AT ALL\n\nThis is a major change. The defense will aggressively try to attribute 51%+ fault to you.\n\nException: Medical malpractice cases RETAIN pure comparative fault — no 51% bar applies (§768.81(6)).\n\nFor incidents before March 24, 2023, pure comparative fault still applies.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // PIP / permanent injury status
    if (answers.is_motor_vehicle === 'yes') {
      // 14-day rule
      if (answers.sought_treatment_14_days === 'no') {
        items.push({
          status: 'info',
          text: 'PIP: 14-day treatment rule may not be met — PIP benefits may be lost',
        })
      } else if (answers.emc_determination === 'yes') {
        items.push({ status: 'done', text: 'PIP: EMC confirmed — full $10,000 coverage' })
      } else if (answers.emc_determination === 'no') {
        items.push({ status: 'info', text: 'PIP: No EMC — coverage capped at $2,500' })
      }

      // Permanent injury threshold
      const check = answers.permanent_injury_check
      if (check && check !== 'none' && check !== 'unsure') {
        items.push({
          status: 'done',
          text: `Permanent injury threshold: Likely met — ${check.replace(/_/g, ' ')} (§627.737(2))`,
        })
      } else if (check === 'none') {
        items.push({
          status: 'info',
          text: 'Permanent injury threshold: May not be met — limited to economic damages exceeding PIP',
        })
      } else if (check === 'unsure') {
        items.push({
          status: 'needed',
          text: 'Permanent injury threshold: Ask your doctor about permanence of injuries',
        })
      }
    } else if (answers.is_motor_vehicle === 'no') {
      items.push({
        status: 'done',
        text: 'Not a motor vehicle case — no PIP/permanent injury threshold applies',
      })
    }

    // Government entity detection
    const isGovEntity =
      answers.gov_employee_on_duty === 'yes' ||
      answers.gov_property === 'yes' ||
      answers.gov_vehicle === 'yes'

    if (isGovEntity) {
      items.push({
        status: answers.gov_entity_name ? 'done' : 'needed',
        text: `Government entity identified: ${answers.gov_entity_name || 'Name needed'}`,
      })
      items.push({
        status: 'info',
        text: '180-day pre-suit notice required (§768.28(6)). Caps: $200K/claimant, $300K/incident. Task will be added.',
      })
    }

    // SOL
    if (answers.incident_before_hb837 === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL: Pre-HB 837 incident — 4-year SOL applies',
      })
    }

    // SOL tolling
    if (answers.minor_at_incident === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Minor at time of incident — tolled until age 18, max 7-year cap (§95.051)',
      })
    } else if (answers.mental_incapacity === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Mental incapacity — tolled during incapacity, max 7-year cap (§95.051)',
      })
    } else if (answers.discovered_later === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Discovery rule may apply — clock starts at knowledge of injury (§95.031(2))',
      })
    }

    // Comparative fault
    items.push({
      status: 'info',
      text: 'Comparative fault: 51% bar applies post-HB 837 (§768.81). If 51%+ at fault, NO recovery. Med mal exception: pure comparative fault retained.',
    })

    return items
  },
}
