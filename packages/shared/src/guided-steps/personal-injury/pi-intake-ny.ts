import type { GuidedStepConfig } from '../types'

export const piIntakeNyConfig: GuidedStepConfig = {
  title: 'Tell Us About Your Injury',
  reassurance:
    'This information helps us understand your case and prepare your documents. Everything you share is protected by attorney-client privilege principles.',

  questions: [
    // === No-Fault / Serious Injury Threshold ===
    {
      id: 'no_fault_header',
      type: 'info',
      prompt:
        "New York's No-Fault Insurance System\n\nNew York is a mandatory no-fault state under Insurance Law Article 51 (§§5101-5109). For motor vehicle accidents, your OWN insurer pays up to $50,000 in \"basic economic loss\" (medical bills + lost wages) regardless of fault.\n\nHowever, to sue the at-fault driver for pain and suffering, you must prove a \"serious injury\" under Insurance Law §5102(d). This threshold applies ONLY to motor vehicle accidents — not to slip-and-falls, premises liability, or other PI claims.",
    },
    {
      id: 'is_motor_vehicle',
      type: 'yes_no',
      prompt: 'Is this a motor vehicle accident case?',
      helpText:
        'Motor vehicle cases have special rules under New York\'s no-fault system.',
    },
    {
      id: 'serious_injury_check',
      type: 'single_choice',
      prompt:
        'Does your injury fall into any of these "serious injury" categories? (Insurance Law §5102(d))',
      helpText:
        'You must meet at least one category to sue for non-economic damages (pain and suffering) in a motor vehicle case.',
      options: [
        { value: 'death', label: 'Death' },
        { value: 'dismemberment', label: 'Dismemberment' },
        { value: 'significant_disfigurement', label: 'Significant disfigurement' },
        { value: 'fracture', label: 'Fracture (bone break)' },
        { value: 'loss_of_fetus', label: 'Loss of a fetus' },
        {
          value: 'permanent_loss_of_use',
          label: 'Permanent loss of use of a body organ, member, function, or system',
        },
        {
          value: 'permanent_consequential_limitation',
          label: 'Permanent consequential limitation of use of a body organ or member',
        },
        {
          value: 'significant_limitation',
          label: 'Significant limitation of use of a body function or system',
        },
        {
          value: '90_180',
          label: 'Non-permanent injury preventing substantially all daily activities for 90 of 180 days following the accident',
        },
        { value: 'unsure', label: 'I am not sure' },
        { value: 'none', label: 'None of these apply' },
      ],
      showIf: (answers) => answers.is_motor_vehicle === 'yes',
    },
    {
      id: 'serious_injury_met',
      type: 'info',
      prompt:
        'Good News: Serious Injury Threshold Likely Met\n\nBased on your answer, your injury likely qualifies as a "serious injury" under Insurance Law §5102(d). You may sue the at-fault driver for both economic and non-economic damages (pain and suffering).\n\nYou will need objective medical evidence — MRIs, range-of-motion testing, EMG/NCV studies. Subjective complaints alone are insufficient (Toure v. Avis Rent A Car Sys., 98 N.Y.2d 345).',
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' &&
        answers.serious_injury_check !== undefined &&
        answers.serious_injury_check !== 'none' &&
        answers.serious_injury_check !== 'unsure',
    },
    {
      id: 'serious_injury_not_met',
      type: 'info',
      prompt:
        'Important: Serious Injury Threshold May Not Be Met\n\nWithout meeting the serious injury threshold, you cannot sue the at-fault driver for pain and suffering in a motor vehicle case. You can still recover economic damages exceeding your no-fault benefits ($50,000).\n\nConsider whether your injuries may worsen or whether the 90/180 category applies — if your injuries prevented substantially all daily activities for 90 of the 180 days after the accident, you may qualify. Contemporaneous medical documentation during that window is essential.',
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' &&
        answers.serious_injury_check === 'none',
    },
    {
      id: 'serious_injury_unsure_guidance',
      type: 'info',
      prompt:
        'How to Determine If You Have a Serious Injury\n\nAsk your doctor about:\n• Range-of-motion testing with a goniometer (quantified loss is key)\n• MRI or other imaging showing structural damage\n• Whether your injury is permanent or will cause permanent limitation\n• Whether you were unable to perform substantially all daily activities for 90+ days in the 180 days after the accident\n\nObjective medical evidence is critical — defendants routinely move for summary judgment on this issue.',
      showIf: (answers) =>
        answers.is_motor_vehicle === 'yes' &&
        answers.serious_injury_check === 'unsure',
    },

    // === Government Entity Detection ===
    {
      id: 'gov_entity_info',
      type: 'info',
      prompt:
        'Government Entity Check\n\nIf a government entity (NYC, county, town, village, school district, public authority) caused your injury, New York law requires a Notice of Claim within 90 DAYS of the incident — one of the shortest deadlines in the country. Missing this deadline almost always bars your claim.',
    },
    {
      id: 'gov_employee_on_duty',
      type: 'yes_no',
      prompt:
        'Was the other party a government employee acting in their official capacity? (Examples: NYPD officer, MTA bus driver, city sanitation worker, public school staff)',
    },
    {
      id: 'gov_property',
      type: 'yes_no',
      prompt:
        'Did the incident happen on government-owned property? (Examples: city sidewalk defect, state highway, public park, government building, public transit)',
      showIf: (answers) => answers.gov_employee_on_duty !== 'yes',
    },
    {
      id: 'gov_vehicle',
      type: 'yes_no',
      prompt:
        'Was a government-owned vehicle involved? (Examples: city bus, police car, sanitation truck, school bus)',
      showIf: (answers) =>
        answers.gov_employee_on_duty !== 'yes' &&
        answers.gov_property !== 'yes',
    },
    {
      id: 'gov_entity_type',
      type: 'single_choice',
      prompt: 'What type of government entity is involved?',
      options: [
        { value: 'nyc', label: 'New York City (any city agency — NYPD, FDNY, DOT, MTA, HHC)' },
        { value: 'county', label: 'County government' },
        { value: 'town_village', label: 'Town or Village' },
        { value: 'school_district', label: 'School district' },
        { value: 'public_authority', label: 'Public authority (MTA, Port Authority, Thruway Authority)' },
        { value: 'state_agency', label: 'State agency (NYSDOT, State Police, SUNY)' },
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
        'What is the name of the government entity? (e.g., "City of New York", "Nassau County", "MTA")',
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
        'CRITICAL: 90-Day Notice of Claim Required — GML §50-e\n\nYou MUST file a Notice of Claim within 90 DAYS of the incident. This is one of the strictest deadlines in any state.\n\nFor NYC claims: Serve on the NYC Comptroller (1 Centre Street, NYC) AND the Corporation Counsel. NYC also allows online filing via the Comptroller\'s website.\n\nFor other municipalities: Serve on the clerk or attorney of the specific municipality.\n\nAfter the Notice of Claim, the municipality may demand a 50-h hearing (oral examination under oath). You MUST attend — failure to appear can result in dismissal.\n\nThe SOL for suing a municipality is 1 year and 90 days from the incident (GML §50-i).\n\nWe\'ll add a task to help you draft and file this notice. Act IMMEDIATELY — 90 days is very short.',
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
        'Statute of Limitations Check\n\nNew York gives you 3 years from the date of injury to file a personal injury lawsuit (CPLR §214(5)). Medical malpractice is shorter — 2 years and 6 months (CPLR §214-a). Government claims have a 1 year and 90 day SOL (GML §50-i).',
    },
    {
      id: 'minor_at_incident',
      type: 'yes_no',
      prompt: 'Were you under 18 years old at the time of the incident?',
      helpText:
        'If yes, the SOL is tolled until you turn 18, but the toll cannot exceed 3 years beyond the normal SOL expiration (CPLR §208). IMPORTANT: The 90-day Notice of Claim for government claims is NOT tolled by infancy.',
    },
    {
      id: 'minor_gov_warning',
      type: 'info',
      prompt:
        'WARNING: Notice of Claim NOT Tolled for Minors\n\nUnlike the general SOL, the 90-day Notice of Claim requirement for government claims is NOT tolled because the claimant is a minor. A parent or guardian must file the Notice of Claim within 90 days. If missed, a late notice petition may be filed, but approval is not guaranteed.',
      showIf: (answers) =>
        answers.minor_at_incident === 'yes' &&
        (answers.gov_employee_on_duty === 'yes' ||
          answers.gov_property === 'yes' ||
          answers.gov_vehicle === 'yes'),
    },
    {
      id: 'mental_incapacity',
      type: 'yes_no',
      prompt:
        'Were you mentally incapacitated at the time of the incident (e.g., coma, severe brain injury)?',
      helpText:
        'If yes, the SOL is tolled during incapacity, but the toll cannot exceed 10 years (CPLR §208).',
      showIf: (answers) => answers.minor_at_incident !== 'yes',
    },
    {
      id: 'discovered_later',
      type: 'yes_no',
      prompt:
        'Did you discover the injury significantly later than when it occurred? (e.g., toxic exposure, foreign object left after surgery)',
      helpText:
        'New York generally does NOT apply a discovery rule for most PI cases. The exception is foreign objects left during surgery (CPLR §214-a).',
      showIf: (answers) =>
        answers.minor_at_incident !== 'yes' &&
        answers.mental_incapacity !== 'yes',
    },

    // === Pure Comparative Fault ===
    {
      id: 'comparative_fault_info',
      type: 'info',
      prompt:
        "New York's Pure Comparative Fault Rule — CPLR §1411\n\nNew York follows pure comparative negligence. You can recover damages even if you were 99% at fault — your recovery is simply reduced by your percentage of fault.\n\nExample: Your damages are $100,000 and the jury finds you 30% at fault. You recover $70,000.\n\nImportant: Article 16 (CPLR §1600-1603) limits joint liability for non-economic damages. A defendant 50% or less at fault is liable only for their proportionate share of non-economic damages.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // No-fault / serious injury status
    if (answers.is_motor_vehicle === 'yes') {
      const check = answers.serious_injury_check
      if (check && check !== 'none' && check !== 'unsure') {
        items.push({
          status: 'done',
          text: `Serious injury threshold: Likely met — ${check.replace(/_/g, ' ')} (Insurance Law §5102(d))`,
        })
      } else if (check === 'none') {
        items.push({
          status: 'info',
          text: 'Serious injury threshold: May not be met — limited to economic damages exceeding $50K no-fault benefits',
        })
      } else if (check === 'unsure') {
        items.push({
          status: 'needed',
          text: 'Serious injury threshold: Consult your doctor about objective medical evidence (MRI, ROM testing)',
        })
      }
    } else if (answers.is_motor_vehicle === 'no') {
      items.push({
        status: 'done',
        text: 'Not a motor vehicle case — no serious injury threshold applies',
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
        text: '90-day Notice of Claim required (GML §50-e) — task will be added. SOL is 1 year + 90 days (GML §50-i).',
      })
    }

    // SOL tolling
    if (answers.minor_at_incident === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Minor at time of incident — tolled until age 18, max 3 additional years (CPLR §208). NOTE: 90-day Notice of Claim NOT tolled.',
      })
    } else if (answers.mental_incapacity === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Mental incapacity — tolled during incapacity, max 10 years (CPLR §208)',
      })
    } else if (answers.discovered_later === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Discovery rule is limited in NY — applies mainly to foreign objects left during surgery (CPLR §214-a)',
      })
    }

    // Comparative fault
    items.push({
      status: 'info',
      text: 'Comparative fault: Pure comparative negligence — can recover even if 99% at fault (CPLR §1411). Article 16 limits joint liability for non-economic damages.',
    })

    return items
  },
}
