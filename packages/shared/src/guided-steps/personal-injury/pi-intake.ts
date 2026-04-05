import type { GuidedStepConfig } from '../types'

export const piIntakeConfig: GuidedStepConfig = {
  title: 'Tell Us About Your Injury',
  reassurance:
    'This information helps us understand your case and prepare your documents. Everything you share is protected by attorney-client privilege principles.',

  questions: [
    // === Government Entity Detection ===
    {
      id: 'gov_entity_info',
      type: 'info',
      prompt:
        'Government Entity Check\n\nIf a government entity (city, county, state, school district) caused your injury, Texas law requires a special pre-suit notice. Missing this deadline bars your claim entirely. Let\'s check.',
    },
    {
      id: 'gov_employee_on_duty',
      type: 'yes_no',
      prompt:
        'Was the other party a government employee acting in their official capacity? (Examples: city bus driver, police officer, public school staff, state highway worker)',
    },
    {
      id: 'gov_property',
      type: 'yes_no',
      prompt:
        'Did the incident happen on government-owned property? (Examples: public park, state highway defect, government building, public transit)',
      showIf: (answers) => answers.gov_employee_on_duty !== 'yes',
    },
    {
      id: 'gov_vehicle',
      type: 'yes_no',
      prompt:
        'Was a government-owned vehicle involved? (Examples: city bus, county truck, state vehicle)',
      showIf: (answers) =>
        answers.gov_employee_on_duty !== 'yes' && answers.gov_property !== 'yes',
    },
    {
      id: 'gov_entity_type',
      type: 'single_choice',
      prompt: 'What type of government entity is involved?',
      options: [
        { value: 'city', label: 'City (city bus, city park, city employee)' },
        { value: 'county', label: 'County (county road, county hospital, sheriff)' },
        { value: 'state_agency', label: 'State Agency (TxDOT, state trooper, state hospital)' },
        { value: 'school_district', label: 'School District (school bus, school property)' },
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
        'What is the name of the government entity? (e.g., "City of Houston", "Harris County", "Texas Department of Transportation")',
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
        'Important: Texas Tort Claims Act\n\nBecause a government entity is involved, you MUST send a written pre-suit notice before filing your lawsuit. Texas law gives you only 6 months from the date of injury \u2014 and some cities have even shorter deadlines (Austin: 45 days, Houston/Dallas: 90 days).\n\nWe\'ll add a special task to help you draft and send this notice. Missing this deadline means your claim is permanently barred.',
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
        'Statute of Limitations Check\n\nTexas gives you 2 years from the date of injury to file a lawsuit. However, some circumstances can extend this deadline.',
    },
    {
      id: 'minor_at_incident',
      type: 'yes_no',
      prompt: 'Were you under 18 years old at the time of the incident?',
      helpText: 'If yes, the 2-year clock doesn\'t start until you turn 18.',
    },
    {
      id: 'mental_incapacity',
      type: 'yes_no',
      prompt:
        'Were you mentally incapacitated at the time of the incident (e.g., coma, severe brain injury)?',
      helpText: 'If yes, the clock is paused during the period of incapacity.',
      showIf: (answers) => answers.minor_at_incident !== 'yes',
    },
    {
      id: 'discovered_later',
      type: 'yes_no',
      prompt:
        'Did you discover the injury significantly later than when it occurred? (e.g., toxic exposure, delayed medical diagnosis)',
      helpText:
        'Texas\'s "discovery rule" may start the clock from when you discovered (or should have discovered) the injury.',
      showIf: (answers) =>
        answers.minor_at_incident !== 'yes' && answers.mental_incapacity !== 'yes',
    },

    // === Proportionate Responsibility (51% Rule) ===
    {
      id: 'prop_responsibility_info',
      type: 'info',
      prompt:
        'Important: Texas\'s 51% Rule\n\nTexas uses a "proportionate responsibility" system. If a jury finds you were more than 50% at fault for your injury, you recover nothing \u2014 zero.\n\nThis is why documenting the other party\'s fault matters. In the next steps, we\'ll help you gather evidence that clearly establishes who was responsible.\n\nThe defendant\'s lawyer will try to shift blame onto you. Being prepared for this is one of the most important things you can do.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

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
        text: 'Tort Claims Act notice required \u2014 task will be added to your case',
      })
    }

    // SOL tolling
    if (answers.minor_at_incident === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Minor at time of incident \u2014 clock starts at age 18',
      })
    } else if (answers.mental_incapacity === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Mental incapacity \u2014 clock paused during incapacity',
      })
    } else if (answers.discovered_later === 'yes') {
      items.push({
        status: 'info',
        text: 'SOL tolling: Discovery rule may apply \u2014 clock starts at discovery',
      })
    }

    return items
  },
}
