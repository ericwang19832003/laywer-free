import type { GuidedStepConfig } from '../types'

export const bizEmploymentNonCompeteConfig: GuidedStepConfig = {
  title: 'Non-Compete Agreements in Texas',
  reassurance:
    "Many non-competes are unenforceable. Texas courts can narrow or void them if they're unreasonable.",

  questions: [
    {
      id: 'non_compete_law_info',
      type: 'info',
      prompt:
        'TEXAS NON-COMPETE LAW (Bus. & Com. Code \u00a715.50-52):\nA non-compete is ONLY enforceable if:\n1. It\'s part of an otherwise enforceable agreement (employment contract with consideration)\n2. It\'s reasonable in: TIME (typically 1-2 years max), GEOGRAPHY (specific area, not nationwide), SCOPE (specific activities, not all competition)\n3. It protects a legitimate business interest (trade secrets, customer relationships)',
    },
    {
      id: 'has_written_non_compete',
      type: 'yes_no',
      prompt: 'Do you have a written non-compete agreement?',
    },
    {
      id: 'no_written_info',
      type: 'info',
      prompt:
        'GOOD NEWS: Without a written agreement, a non-compete is almost certainly unenforceable in Texas. Verbal non-compete agreements are extremely difficult to enforce because:\n- The statute of frauds generally requires agreements lasting over one year to be in writing\n- The employer would need to prove the exact terms were agreed to\n- Courts strongly disfavor restricting someone\'s ability to earn a living without clear written terms\n\nIf your former employer is threatening to enforce a verbal non-compete, they likely have no legal basis.',
      showIf: (answers) => answers.has_written_non_compete === 'no',
    },
    {
      id: 'written_analysis_info',
      type: 'info',
      prompt:
        'Having a written non-compete doesn\'t mean it\'s enforceable. Texas courts examine three key factors to determine if the restrictions are reasonable. Let\'s analyze yours.',
      showIf: (answers) => answers.has_written_non_compete === 'yes',
    },
    {
      id: 'restriction_period',
      type: 'single_choice',
      prompt: 'What is the restriction period in your non-compete?',
      options: [
        { value: 'six_months', label: '6 months or less' },
        { value: 'one_year', label: '1 year' },
        { value: 'two_years', label: '2 years' },
        { value: 'over_two_years', label: 'More than 2 years' },
      ],
      showIf: (answers) => answers.has_written_non_compete === 'yes',
    },
    {
      id: 'time_analysis_short',
      type: 'info',
      prompt:
        'TIME ANALYSIS: 6 months to 1 year is generally considered reasonable by Texas courts. This factor likely favors enforceability.',
      showIf: (answers) =>
        answers.restriction_period === 'six_months' || answers.restriction_period === 'one_year',
    },
    {
      id: 'time_analysis_two_years',
      type: 'info',
      prompt:
        'TIME ANALYSIS: 2 years is at the outer edge of what Texas courts consider reasonable. It may be enforceable depending on the industry and your role, but courts are more likely to narrow it.',
      showIf: (answers) => answers.restriction_period === 'two_years',
    },
    {
      id: 'time_analysis_long',
      type: 'info',
      prompt:
        'TIME ANALYSIS: More than 2 years is generally considered unreasonable by Texas courts. A court is likely to either void this restriction or use the "blue pencil" doctrine to reduce it to a reasonable period (typically 1-2 years).',
      showIf: (answers) => answers.restriction_period === 'over_two_years',
    },
    {
      id: 'geographic_scope',
      type: 'single_choice',
      prompt: 'What is the geographic scope of your non-compete?',
      options: [
        { value: 'city', label: 'Specific city or metro area' },
        { value: 'county', label: 'One or more counties' },
        { value: 'state', label: 'Entire state of Texas' },
        { value: 'nationwide', label: 'Nationwide' },
        { value: 'no_limit', label: 'No geographic limit specified' },
      ],
      showIf: (answers) => answers.has_written_non_compete === 'yes',
    },
    {
      id: 'geo_analysis_local',
      type: 'info',
      prompt:
        'GEOGRAPHY ANALYSIS: A city or county restriction is generally reasonable and likely enforceable, especially if it matches where you actually worked and served customers.',
      showIf: (answers) => answers.geographic_scope === 'city' || answers.geographic_scope === 'county',
    },
    {
      id: 'geo_analysis_state',
      type: 'info',
      prompt:
        'GEOGRAPHY ANALYSIS: A statewide restriction can be reasonable for employees with statewide customer relationships or access to statewide trade secrets. Otherwise, it may be overbroad.',
      showIf: (answers) => answers.geographic_scope === 'state',
    },
    {
      id: 'geo_analysis_broad',
      type: 'info',
      prompt:
        'GEOGRAPHY ANALYSIS: Nationwide or unlimited geographic restrictions are very difficult to enforce in Texas. Courts typically find these unreasonable unless the employee had truly national responsibilities. A court is likely to narrow this significantly.',
      showIf: (answers) =>
        answers.geographic_scope === 'nationwide' || answers.geographic_scope === 'no_limit',
    },
    {
      id: 'blue_pencil_info',
      type: 'info',
      prompt:
        'BLUE PENCIL DOCTRINE: Texas courts can REWRITE unreasonable non-competes to make them enforceable. They reduce the scope, geography, or duration rather than voiding the entire agreement. This means even if your non-compete seems too broad, a court might narrow it rather than throw it out.',
      showIf: (answers) => answers.has_written_non_compete === 'yes',
    },
    {
      id: 'options_info',
      type: 'info',
      prompt:
        'YOUR OPTIONS:\n1. CHALLENGE: File a declaratory judgment action asking the court to void or narrow the non-compete\n2. NEGOTIATE: Propose a reasonable modification (shorter time, smaller area)\n3. COMPLY: Follow the restrictions to avoid litigation risk\n4. SEEK INJUNCTION: If your former employer threatens to enforce, seek court order',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_written_non_compete === 'no') {
      items.push({
        status: 'info',
        text: 'No written non-compete agreement. A verbal non-compete is almost certainly unenforceable in Texas.',
      })
      return items
    }

    if (answers.has_written_non_compete === 'yes') {
      items.push({
        status: 'done',
        text: 'Written non-compete agreement exists.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine whether you have a written non-compete agreement.',
      })
    }

    if (answers.restriction_period) {
      const periods: Record<string, string> = {
        six_months: '6 months or less',
        one_year: '1 year',
        two_years: '2 years',
        over_two_years: 'More than 2 years',
      }
      items.push({
        status: 'done',
        text: `Restriction period: ${periods[answers.restriction_period]}.`,
      })
      if (answers.restriction_period === 'over_two_years') {
        items.push({
          status: 'info',
          text: 'Duration likely unreasonable. A court may reduce it under the blue pencil doctrine.',
        })
      }
    }

    if (answers.geographic_scope) {
      const scopes: Record<string, string> = {
        city: 'City/metro area',
        county: 'County',
        state: 'Statewide',
        nationwide: 'Nationwide',
        no_limit: 'No limit specified',
      }
      items.push({
        status: 'done',
        text: `Geographic scope: ${scopes[answers.geographic_scope]}.`,
      })
      if (answers.geographic_scope === 'nationwide' || answers.geographic_scope === 'no_limit') {
        items.push({
          status: 'info',
          text: 'Geographic scope likely unreasonable. A court may narrow it to where you actually worked.',
        })
      }
    }

    items.push({
      status: 'info',
      text: 'Options: challenge in court, negotiate modification, comply, or seek injunction if employer threatens enforcement.',
    })

    return items
  },
}
