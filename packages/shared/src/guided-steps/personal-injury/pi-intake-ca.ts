import type { GuidedStepConfig } from '../types'

export const piIntakeCaConfig: GuidedStepConfig = {
  title: 'Tell Us About Your Injury',
  reassurance:
    'This information helps us understand your case and prepare your documents. Everything you share is protected by attorney-client privilege principles.',

  questions: [
    // === Proposition 213 Insurance Check ===
    {
      id: 'prop_213_header',
      type: 'info',
      prompt:
        'California Insurance Check — Proposition 213\n\nCalifornia law (Proposition 213, codified as Civil Code §3333.4) limits the damages you can recover if you were uninsured at the time of your accident. Let\'s check your insurance status.',
    },
    {
      id: 'had_valid_insurance',
      type: 'yes_no',
      prompt:
        'Did you have valid auto insurance at the time of the incident?',
    },
    {
      id: 'prop_213_warning',
      type: 'info',
      prompt:
        'Important: Proposition 213 Applies\n\nBecause you did not have valid insurance, California Civil Code §3333.4 limits your recovery. You cannot recover non-economic damages (pain and suffering, emotional distress) from an uninsured motorist claim. However, you CAN still recover economic damages — medical bills, lost wages, and property damage.\n\nThis does not apply if an exception below covers your situation.',
      showIf: (answers) => answers.had_valid_insurance === 'no',
    },
    {
      id: 'prop_213_exception_check',
      type: 'single_choice',
      prompt:
        'Do any of these exceptions apply to your situation?',
      options: [
        { value: 'dui', label: 'The other driver was convicted of DUI' },
        { value: 'passenger', label: 'I was a passenger (not the driver)' },
        { value: 'pedestrian_cyclist', label: 'I was a pedestrian or cyclist' },
        { value: 'none', label: 'None of these apply' },
      ],
      showIf: (answers) => answers.had_valid_insurance === 'no',
    },
    {
      id: 'prop_213_exception_good_news',
      type: 'info',
      prompt:
        'Good News: Proposition 213 Does Not Apply\n\nBased on your answer, the Proposition 213 limitation does not apply to your case. You may recover both economic and non-economic damages.',
      showIf: (answers) =>
        answers.prop_213_exception_check !== undefined &&
        answers.prop_213_exception_check !== 'none',
    },

    // === Government Entity Detection ===
    {
      id: 'gov_entity_info',
      type: 'info',
      prompt:
        'Government Entity Check\n\nIf a government entity (city, county, state, school district, special district) caused your injury, California law requires a formal government claim before you can file a lawsuit. Missing this deadline bars your claim entirely. Let\'s check.',
    },
    {
      id: 'gov_employee_on_duty',
      type: 'yes_no',
      prompt:
        'Was the other party a government employee acting in their official capacity? (Examples: Caltrans worker, CHP officer, public school staff, city bus driver)',
    },
    {
      id: 'gov_property',
      type: 'yes_no',
      prompt:
        'Did the incident happen on government-owned property? (Examples: state highway defect, public park, government building, public transit)',
      showIf: (answers) => answers.gov_employee_on_duty !== 'yes',
    },
    {
      id: 'gov_vehicle',
      type: 'yes_no',
      prompt:
        'Was a government-owned vehicle involved? (Examples: city bus, county vehicle, CHP patrol car)',
      showIf: (answers) =>
        answers.gov_employee_on_duty !== 'yes' && answers.gov_property !== 'yes',
    },
    {
      id: 'gov_entity_type',
      type: 'single_choice',
      prompt: 'What type of government entity is involved?',
      options: [
        { value: 'state_agency', label: 'State Agency (Caltrans, CHP, state hospital)' },
        { value: 'county', label: 'County (county road, county hospital, sheriff)' },
        { value: 'city', label: 'City (city bus, city park, city employee)' },
        { value: 'school_district', label: 'School District (school bus, school property)' },
        { value: 'special_district', label: 'Special District (water district, transit authority, fire district)' },
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
        'What is the name of the government entity? (e.g., "City of Los Angeles", "Los Angeles County", "Caltrans")',
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
        'Important: California Government Claims Act\n\nBecause a government entity is involved, you MUST file a formal government claim under California Government Code §§910-913 before filing a lawsuit. You have 6 months from the date of injury to file this claim with the appropriate agency.\n\nIf you miss the 6-month deadline, you may apply for late claim relief within 1 year of the incident under Government Code §911.4 — but approval is not guaranteed.\n\nWe\'ll add a special task to help you draft and file this claim. Missing both deadlines means your claim is permanently barred.',
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
        'Statute of Limitations Check\n\nCalifornia gives you 2 years from the date of injury to file a personal injury lawsuit. However, some circumstances can extend this deadline.',
    },
    {
      id: 'minor_at_incident',
      type: 'yes_no',
      prompt: 'Were you under 18 years old at the time of the incident?',
      helpText: 'If yes, the 2-year clock doesn\'t start until you turn 18 (CCP §352).',
    },
    {
      id: 'mental_incapacity',
      type: 'yes_no',
      prompt:
        'Were you mentally incapacitated at the time of the incident (e.g., coma, severe brain injury)?',
      helpText: 'If yes, the clock is paused during the period of incapacity (CCP §352).',
      showIf: (answers) => answers.minor_at_incident !== 'yes',
    },
    {
      id: 'discovered_later',
      type: 'yes_no',
      prompt:
        'Did you discover the injury significantly later than when it occurred? (e.g., toxic exposure, delayed medical diagnosis)',
      helpText:
        'California\'s delayed discovery rule may start the clock from when you discovered (or should have discovered) the injury.',
      showIf: (answers) =>
        answers.minor_at_incident !== 'yes' && answers.mental_incapacity !== 'yes',
    },
    {
      id: 'defendant_absent',
      type: 'yes_no',
      prompt:
        'Has the defendant been absent from California for a significant period since the incident?',
      helpText:
        'Under CCP §351, time the defendant spends outside California does not count toward the statute of limitations.',
      showIf: (answers) =>
        answers.minor_at_incident !== 'yes' &&
        answers.mental_incapacity !== 'yes' &&
        answers.discovered_later !== 'yes',
    },

    // === Pure Comparative Fault ===
    {
      id: 'comparative_fault_info',
      type: 'info',
      prompt:
        'California\'s Pure Comparative Fault Rule\n\nCalifornia follows the "pure comparative fault" rule established in Li v. Yellow Cab Co. (1975). Unlike some states that bar recovery if you\'re more than 50% at fault, California has no threshold — you can recover damages even if you were 99% at fault.\n\nYour recovery is simply reduced by your percentage of fault. For example, if your damages are $100,000 and you were 30% at fault, you recover $70,000.\n\nThe defendant\'s lawyer will still try to shift blame onto you to reduce your recovery. Documenting the other party\'s fault remains critical.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Prop 213 status
    if (answers.had_valid_insurance === 'yes') {
      items.push({
        status: 'done',
        text: 'Prop 213: Valid insurance confirmed — no limitations on damages',
      })
    } else if (answers.had_valid_insurance === 'no') {
      const exception = answers.prop_213_exception_check
      if (exception && exception !== 'none') {
        items.push({
          status: 'done',
          text: `Prop 213: Exception applies (${exception}) — no limitations on damages`,
        })
      } else {
        items.push({
          status: 'info',
          text: 'Prop 213: No valid insurance — non-economic damages limited under CC §3333.4',
        })
      }
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
        text: 'Government Claims Act filing required (Gov. Code §§910-913) — task will be added to your case',
      })
    }

    // SOL tolling
    if (answers.minor_at_incident === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Minor at time of incident — clock starts at age 18 (CCP §352)',
      })
    } else if (answers.mental_incapacity === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Mental incapacity — clock paused during incapacity (CCP §352)',
      })
    } else if (answers.discovered_later === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Delayed discovery rule may apply — clock starts at discovery',
      })
    } else if (answers.defendant_absent === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Defendant absent from California — time outside state excluded (CCP §351)',
      })
    }

    return items
  },
}
