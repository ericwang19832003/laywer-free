import type { GuidedStepConfig } from '../types'

export const piIntakePaConfig: GuidedStepConfig = {
  title: 'Tell Us About Your Injury',
  reassurance:
    'This information helps us understand your case and prepare your documents. Everything you share is protected by attorney-client privilege principles.',

  questions: [
    // === Limited Tort Detection ===
    {
      id: 'tort_election_header',
      type: 'info',
      prompt:
        "Pennsylvania's Choice No-Fault System\n\nPennsylvania is one of the few states that lets drivers choose between two levels of auto insurance protection:\n\n• Full Tort — You keep the unrestricted right to sue for all damages, including pain and suffering.\n• Limited Tort — You pay a lower premium but give up the right to sue for pain and suffering unless your injury meets a serious injury threshold.\n\nYour tort election affects what damages you can recover. Let's check your status.",
    },
    {
      id: 'tort_election',
      type: 'single_choice',
      prompt: 'What auto insurance coverage did you select?',
      options: [
        { value: 'full_tort', label: 'Full Tort — I kept full rights to sue' },
        {
          value: 'limited_tort',
          label: 'Limited Tort — I chose the lower premium option',
        },
        { value: 'dont_know', label: "I don't know" },
      ],
    },
    {
      id: 'limited_tort_warning',
      type: 'info',
      prompt:
        'Important: Limited Tort Restriction Applies\n\nUnder 75 Pa.C.S. §1705, limited tort policyholders can only recover economic damages (medical bills, lost wages) unless the injury meets the "serious injury" threshold. You must prove one of the following:\n\n• Death\n• Serious impairment of body function\n• Permanent serious disfigurement\n\nIf your injury does not meet this threshold, you are limited to economic damages only — no pain and suffering, no emotional distress.\n\nHowever, there are exceptions that can restore your full tort rights. Let\'s check if any apply.',
      showIf: (answers) => answers.tort_election === 'limited_tort',
    },
    {
      id: 'limited_tort_exception',
      type: 'single_choice',
      prompt:
        'Do any of these exceptions apply to your situation? (These override the limited tort restriction.)',
      options: [
        {
          value: 'dui_driver',
          label:
            'The at-fault driver was convicted of or pleaded guilty to DUI',
        },
        {
          value: 'uninsured_driver',
          label: 'The at-fault driver was uninsured',
        },
        {
          value: 'out_of_state_vehicle',
          label:
            'The at-fault vehicle was registered outside Pennsylvania',
        },
        {
          value: 'intentional_injury',
          label: 'The at-fault driver intentionally caused the injury',
        },
        {
          value: 'pedestrian_cyclist',
          label: 'I was a pedestrian or cyclist (not in a vehicle)',
        },
        { value: 'none', label: 'None of these apply' },
      ],
      showIf: (answers) => answers.tort_election === 'limited_tort',
    },
    {
      id: 'limited_tort_exception_good_news',
      type: 'info',
      prompt:
        'Good News — Limited Tort Restriction Does Not Apply\n\nBased on your answer, the limited tort restriction does not apply to your case. You may recover both economic and non-economic damages (including pain and suffering) despite your limited tort election.',
      showIf: (answers) =>
        answers.tort_election === 'limited_tort' &&
        answers.limited_tort_exception !== undefined &&
        answers.limited_tort_exception !== 'none',
    },
    {
      id: 'dont_know_guidance',
      type: 'info',
      prompt:
        "How to Find Your Tort Election\n\nCheck your auto insurance policy declarations page — look for \"tort option\" or \"tort election.\" It will say either \"full tort\" or \"limited tort.\"\n\nIf you can't find your declarations page:\n• Call your insurance company and ask\n• Check your online insurance portal\n• Look at your most recent renewal letter\n\nThis is important because it directly affects what damages you can recover. We'll proceed assuming you may be limited tort — if you later confirm full tort, all restrictions are removed.",
      showIf: (answers) => answers.tort_election === 'dont_know',
    },

    // === Government Entity Detection ===
    {
      id: 'gov_entity_info',
      type: 'info',
      prompt:
        "Government Entity Check\n\nPennsylvania has two separate sovereign immunity schemes depending on whether the government entity is the Commonwealth (state level) or a political subdivision (local level). The rules, notice requirements, and damage caps differ significantly between the two. Let's check if a government entity is involved.",
    },
    {
      id: 'gov_employee_on_duty',
      type: 'yes_no',
      prompt:
        'Was the other party a government employee acting in their official capacity? (Examples: PennDOT worker, State Police officer, municipal employee, school district staff)',
    },
    {
      id: 'gov_property',
      type: 'yes_no',
      prompt:
        'Did the incident happen on government-owned property? (Examples: state highway defect, public park, government building, public transit facility)',
      showIf: (answers) => answers.gov_employee_on_duty !== 'yes',
    },
    {
      id: 'gov_vehicle',
      type: 'yes_no',
      prompt:
        'Was a government-owned vehicle involved? (Examples: city bus, county vehicle, state police cruiser)',
      showIf: (answers) =>
        answers.gov_employee_on_duty !== 'yes' &&
        answers.gov_property !== 'yes',
    },
    {
      id: 'govt_scheme',
      type: 'single_choice',
      prompt: 'What type of government entity is involved?',
      options: [
        {
          value: 'state_agency',
          label:
            'State agency — PennDOT, State Police, state hospital',
        },
        {
          value: 'state_employee',
          label: 'State employee acting on duty',
        },
        {
          value: 'municipality',
          label: 'Municipality (city, borough, township)',
        },
        { value: 'county', label: 'County government' },
        { value: 'school_district', label: 'School district' },
        {
          value: 'authority',
          label: 'Authority (transit authority, parking authority, water authority)',
        },
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
        'What is the name of the government entity? (e.g., "City of Philadelphia", "PennDOT", "SEPTA")',
      placeholder: 'Enter the government entity name',
      showIf: (answers) =>
        answers.gov_employee_on_duty === 'yes' ||
        answers.gov_property === 'yes' ||
        answers.gov_vehicle === 'yes',
    },
    {
      id: 'political_subdivision_warning',
      type: 'info',
      prompt:
        'Important: Political Subdivision Tort Claims Act (42 Pa.C.S. §8528)\n\nBecause a political subdivision (local government) is involved, you MUST file a written notice of your claim within 6 months of the incident under 42 Pa.C.S. §8528. This notice must be sent to the political subdivision\'s governing body.\n\nThe Political Subdivision Tort Claims Act limits liability to 8 specific categories:\n1. Vehicle liability\n2. Care, custody, or control of personal property\n3. Real property (dangerous conditions of streets, sidewalks, buildings)\n4. Trees, traffic controls, and street lighting\n5. Utility service facilities\n6. Streets (dangerous conditions of streets and sidewalks)\n7. Sidewalks (dangerous conditions)\n8. Care, custody, or control of animals\n\nDamage cap: $500,000 per person. If your injury does not fall within one of these 8 categories, the political subdivision retains sovereign immunity.\n\nWe\'ll add a task to help you draft and file this notice. Missing the 6-month deadline bars your claim.',
      showIf: (answers) =>
        (answers.gov_employee_on_duty === 'yes' ||
          answers.gov_property === 'yes' ||
          answers.gov_vehicle === 'yes') &&
        (answers.govt_scheme === 'municipality' ||
          answers.govt_scheme === 'county' ||
          answers.govt_scheme === 'school_district' ||
          answers.govt_scheme === 'authority'),
    },
    {
      id: 'commonwealth_warning',
      type: 'info',
      prompt:
        'Important: Commonwealth Sovereign Immunity (1 Pa.C.S. §2310)\n\nBecause a Commonwealth (state-level) entity is involved, different rules apply. There is NO pre-suit notice requirement for Commonwealth claims — but there is a damage cap of $250,000 per person.\n\nThe Commonwealth waives sovereign immunity only for these 9 enumerated exceptions:\n1. Vehicle liability\n2. Medical-professional liability\n3. Care, custody, or control of personal property\n4. Commonwealth real estate, highways, and sidewalks\n5. Potholes and other dangerous conditions\n6. Care, custody, or control of animals\n7. Liquor store sales (Dram Shop)\n8. National Guard activities\n9. Toxics and other hazardous substances\n\nIf your injury falls outside these 9 categories, the Commonwealth retains full sovereign immunity and cannot be sued.',
      showIf: (answers) =>
        (answers.gov_employee_on_duty === 'yes' ||
          answers.gov_property === 'yes' ||
          answers.gov_vehicle === 'yes') &&
        (answers.govt_scheme === 'state_agency' ||
          answers.govt_scheme === 'state_employee'),
    },
    {
      id: 'enumerated_exception_check',
      type: 'info',
      prompt:
        'Enumerated Exception Review\n\nBased on the government entity type you selected, your claim must fall within the applicable exceptions listed above. Review the list carefully:\n\n• If your injury fits one of the enumerated exceptions — your claim can proceed against the government entity.\n• If your injury does NOT fit any exception — the government entity retains sovereign immunity and cannot be sued. You may still have a claim against individual employees in their personal capacity in some circumstances.\n\nIf you are unsure whether your situation fits an exception, describe the facts of your incident as precisely as possible when completing your case details. This will help determine which exception applies.',
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
        "Statute of Limitations Check\n\nPennsylvania gives you 2 years from the date of injury to file a personal injury lawsuit (42 Pa.C.S. §5524). However, some circumstances can extend (toll) this deadline.",
    },
    {
      id: 'minor_at_incident',
      type: 'yes_no',
      prompt: 'Were you under 18 years old at the time of the incident?',
      helpText:
        "If yes, the 2-year clock doesn't start until you turn 18 (42 Pa.C.S. §5533).",
    },
    {
      id: 'mental_incapacity',
      type: 'yes_no',
      prompt:
        'Were you mentally incapacitated at the time of the incident (e.g., coma, severe brain injury)?',
      helpText:
        'If yes, the clock is paused during the period of incapacity (42 Pa.C.S. §5533).',
      showIf: (answers) => answers.minor_at_incident !== 'yes',
    },
    {
      id: 'discovered_later',
      type: 'yes_no',
      prompt:
        'Did you discover the injury significantly later than when it occurred? (e.g., toxic exposure, delayed medical diagnosis)',
      helpText:
        "Pennsylvania's discovery rule may start the clock from when you knew or should have known about the injury.",
      showIf: (answers) =>
        answers.minor_at_incident !== 'yes' &&
        answers.mental_incapacity !== 'yes',
    },

    // === 51% Bar — Modified Comparative Fault ===
    {
      id: 'comparative_fault_info',
      type: 'info',
      prompt:
        "Pennsylvania's Modified Comparative Fault (42 Pa.C.S. §7102)\n\nPennsylvania uses a \"modified comparative fault\" system with a 51% bar:\n\n• If you are 50% or less at fault, you CAN recover damages — but your award is reduced by your percentage of fault.\n• If you are 51% or more at fault, you recover NOTHING.\n\nExample: Your damages are $100,000 and the jury finds you 30% at fault. You recover $70,000.\nExample: Your damages are $100,000 but the jury finds you 51% at fault. You recover $0.\n\nFair Share Act (42 Pa.C.S. §7102(a.2)):\nIf there are multiple defendants, any defendant found less than 60% at fault is liable only for their proportionate share of damages (several liability only). A defendant found 60% or more at fault can be held jointly and severally liable for the entire amount.\n\nThis means if a defendant is only 20% at fault, they pay only 20% of your damages — you cannot collect the full amount from them alone.",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Limited tort status
    if (answers.tort_election === 'full_tort') {
      items.push({
        status: 'done',
        text: 'Tort election: Full tort — no limitations on damages',
      })
    } else if (answers.tort_election === 'limited_tort') {
      const exception = answers.limited_tort_exception
      if (exception && exception !== 'none') {
        items.push({
          status: 'done',
          text: `Tort election: Limited tort, but exception applies (${exception.replace(/_/g, ' ')}) — full damages available`,
        })
      } else {
        items.push({
          status: 'info',
          text: 'Tort election: Limited tort — non-economic damages restricted unless serious injury threshold met (75 Pa.C.S. §1705)',
        })
      }
    } else if (answers.tort_election === 'dont_know') {
      items.push({
        status: 'needed',
        text: 'Tort election: Unknown — check insurance declarations page for tort option',
      })
    }

    // Government entity detection
    const isGovEntity =
      answers.gov_employee_on_duty === 'yes' ||
      answers.gov_property === 'yes' ||
      answers.gov_vehicle === 'yes'

    if (isGovEntity) {
      const scheme = answers.govt_scheme
      const isCommonwealth =
        scheme === 'state_agency' || scheme === 'state_employee'
      const entityName = answers.gov_entity_name || 'Name needed'

      items.push({
        status: answers.gov_entity_name ? 'done' : 'needed',
        text: `Government entity identified: ${entityName}`,
      })

      if (isCommonwealth) {
        items.push({
          status: 'info',
          text: 'Commonwealth entity — no pre-suit notice required, $250K cap per person (1 Pa.C.S. §2310)',
        })
      } else {
        items.push({
          status: 'info',
          text: 'Political subdivision — 6-month notice required (42 Pa.C.S. §8528), $500K cap per person. Notice task will be added.',
        })
      }
    }

    // SOL tolling
    if (answers.minor_at_incident === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Minor at time of incident — clock starts at age 18 (42 Pa.C.S. §5533)',
      })
    } else if (answers.mental_incapacity === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Mental incapacity — clock paused during incapacity (42 Pa.C.S. §5533)',
      })
    } else if (answers.discovered_later === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Discovery rule may apply — clock starts at discovery of injury',
      })
    }

    // Comparative fault
    items.push({
      status: 'info',
      text: 'Comparative fault: 51% bar applies (42 Pa.C.S. §7102). Fair Share Act: defendants <60% at fault = several liability only.',
    })

    return items
  },
}
