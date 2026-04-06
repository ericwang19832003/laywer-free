import type { GuidedStepConfig } from '../types'

export const bizEmploymentWageTheftPaConfig: GuidedStepConfig = {
  title: 'Pennsylvania Wage Theft — Recovering Unpaid Wages',
  reassurance:
    "Pennsylvania's Wage Payment and Collection Law (WPCL) gives you strong tools to recover unpaid wages, including 25% liquidated damages and mandatory attorney fees. We'll guide you through your options step by step.",

  questions: [
    // === WPCL Overview ===
    {
      id: 'wpcl_overview',
      type: 'info',
      prompt:
        'PENNSYLVANIA WAGE PAYMENT AND COLLECTION LAW (43 P.S. \u00A7260.1\u2013260.12):\n\n\u2022 Employers MUST pay all earned wages on regular paydays\n\u2022 Final paycheck: due by the next regular payday after separation (43 P.S. \u00A7260.5)\n\u2022 Statute of limitations: 3 years from the date wages were due (42 Pa.C.S. \u00A75524)\n\u2022 Liquidated damages: 25% of wages owed (or $500, whichever is greater) if unpaid for 30+ days with no good-faith dispute (43 P.S. \u00A7260.10)\n\u2022 Attorney fees: mandatory if you win — the employer pays your lawyer (43 P.S. \u00A7260.9a)\n\u2022 Retaliation protection: employer cannot fire or discipline you for filing a wage claim (43 P.S. \u00A7260.9a)',
    },

    // === Wage Type ===
    {
      id: 'wage_type',
      type: 'single_choice',
      prompt: 'What type of wages are unpaid?',
      options: [
        { value: 'regular_wages', label: 'Regular wages (hourly or salary)' },
        { value: 'overtime', label: 'Overtime pay' },
        { value: 'commission', label: 'Commission' },
        { value: 'bonus', label: 'Bonus' },
        { value: 'final_paycheck', label: 'Final paycheck after leaving' },
        { value: 'tips', label: 'Tips or tip credit violations' },
        { value: 'vacation_pay', label: 'Vacation or PTO pay' },
      ],
    },
    {
      id: 'regular_wages_info',
      type: 'info',
      prompt:
        'UNPAID REGULAR WAGES:\n\u2022 PA minimum wage: $7.25/hr (federal minimum \u2014 PA has not raised it above federal)\n\u2022 Employer must pay on scheduled paydays, at least twice per month for most employees\n\u2022 If your employer misses a payday, document the exact dates and amounts\n\u2022 Keep your own records of hours worked (even notes on your phone count)\n\u2022 After 30 days of nonpayment with no good-faith dispute, the 25% liquidated damages penalty kicks in',
      showIf: (answers) => answers.wage_type === 'regular_wages',
    },
    {
      id: 'overtime_info',
      type: 'info',
      prompt:
        'UNPAID OVERTIME:\n\u2022 PA Minimum Wage Act (\u00A7231.41): time-and-a-half (1.5x) for hours over 40/week\n\u2022 NOT all employees qualify \u2014 you must be "non-exempt"\n\u2022 Exempt employees (salaried executives, professionals, administrators earning $35,568+/year) generally do not get overtime\n\u2022 Misclassification is common \u2014 many employers wrongly classify workers as exempt\n\u2022 Federal FLSA also applies: 2 years back pay (3 years if willful), plus liquidated damages (double back pay)\n\u2022 You can pursue both state (WPCL) and federal (FLSA) claims \u2014 they are not mutually exclusive',
      showIf: (answers) => answers.wage_type === 'overtime',
    },
    {
      id: 'commission_info',
      type: 'info',
      prompt:
        'UNPAID COMMISSION:\n\u2022 Commission is "wages" under the WPCL if there is a written or oral agreement establishing it\n\u2022 Your employer CANNOT change commission terms retroactively for work already performed\n\u2022 If you earned the commission before leaving, it must be paid by the next regular payday\n\u2022 The WPCL requires employers to notify employees in writing of wage rates including commissions\n\u2022 Document: your commission agreement, sales records, and any communications about calculations',
      showIf: (answers) => answers.wage_type === 'commission',
    },
    {
      id: 'bonus_info',
      type: 'info',
      prompt:
        'UNPAID BONUS:\n\u2022 Bonuses are "wages" under the WPCL if they are part of an agreement or compensation plan\n\u2022 Discretionary bonuses (employer freely chooses whether to pay) may not be enforceable\n\u2022 Performance bonuses tied to specific goals ARE enforceable if the goals were met\n\u2022 Key question: was the bonus promised in writing, in an offer letter, or as a condition of employment?\n\u2022 PA courts look at the totality of the employment relationship to determine if a bonus was earned',
      showIf: (answers) => answers.wage_type === 'bonus',
    },
    {
      id: 'final_paycheck_info',
      type: 'info',
      prompt:
        'FINAL PAYCHECK (43 P.S. \u00A7260.5):\n\u2022 Whether fired or quit, your final paycheck is due by the NEXT REGULAR PAYDAY\n\u2022 This includes all earned wages, commissions, and bonuses owed\n\u2022 If the employer does not pay by the next regular payday, the 25% liquidated damages penalty applies\n\u2022 There is no distinction between voluntary quit and involuntary termination \u2014 the deadline is the same\n\u2022 File a complaint with PA Department of Labor & Industry immediately if the deadline passes',
      showIf: (answers) => answers.wage_type === 'final_paycheck',
    },
    {
      id: 'tips_info',
      type: 'info',
      prompt:
        'TIPS AND TIP CREDIT VIOLATIONS:\n\u2022 PA follows federal tip credit rules: employer can pay $2.83/hr cash wage if tips bring total to $7.25/hr\n\u2022 Employee must receive at least $135/month in tips to qualify as a "tipped employee"\n\u2022 Employer CANNOT keep any portion of employee tips (tip theft)\n\u2022 Tip pooling: allowed only among customarily tipped employees (servers, bartenders, bussers)\n\u2022 80/20 rule: tipped employee cannot spend more than 20% of hours on non-tip-generating duties while employer claims tip credit\n\u2022 If employer violates tip credit rules, they owe the full $7.25/hr minimum wage for all hours worked',
      showIf: (answers) => answers.wage_type === 'tips',
    },
    {
      id: 'vacation_pay_info',
      type: 'info',
      prompt:
        'VACATION / PTO PAY:\n\u2022 PA does NOT require employers to provide vacation or PTO\n\u2022 BUT if the employer has a written policy providing it, they must follow their own policy\n\u2022 Under the WPCL, earned vacation/PTO is "wages" if the employer\'s policy says it is paid out\n\u2022 "Use it or lose it" policies are generally enforceable in PA\n\u2022 If the policy promises payout at termination, the employer must pay it by the next regular payday\n\u2022 Key document: the written PTO/vacation policy in your handbook or offer letter',
      showIf: (answers) => answers.wage_type === 'vacation_pay',
    },

    // === Amount Owed ===
    {
      id: 'amount_owed',
      type: 'text',
      prompt: 'How much do you believe you are owed? (approximate dollar amount)',
      placeholder: 'e.g. $3,500',
    },

    // === Statute of Limitations ===
    {
      id: 'sol_header',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS\n\nYou have 3 years from the date wages were due to file a claim (42 Pa.C.S. \u00A75524). Each missed paycheck starts a new 3-year clock for that paycheck. This means you can potentially recover up to 3 years of back wages even if the nonpayment started long ago.',
    },
    {
      id: 'when_owed',
      type: 'single_choice',
      prompt: 'When were you last owed wages that went unpaid?',
      options: [
        { value: 'under_1_year', label: 'Less than 1 year ago' },
        { value: '1_to_3_years', label: '1 to 3 years ago' },
        { value: 'over_3_years', label: 'More than 3 years ago' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'sol_safe',
      type: 'info',
      prompt:
        'Your claim is well within the 3-year statute of limitations. File promptly \u2014 waiting risks lost evidence and fading memories.',
      showIf: (answers) => answers.when_owed === 'under_1_year',
    },
    {
      id: 'sol_approaching',
      type: 'info',
      prompt:
        'YOUR DEADLINE MAY BE APPROACHING. Calculate the exact date wages were due and add 3 years. File as soon as possible. Once the deadline passes, that paycheck is permanently barred.',
      showIf: (answers) => answers.when_owed === '1_to_3_years',
    },
    {
      id: 'sol_expired',
      type: 'info',
      prompt:
        'WARNING: If the wages were due more than 3 years ago, those specific paychecks are likely barred by the statute of limitations. However:\n\n\u2022 Each missed paycheck has its own 3-year clock \u2014 more recent missed payments may still be actionable\n\u2022 The discovery rule may apply if the employer concealed the wage theft\n\u2022 Fraudulent concealment can toll the statute\n\nConsult an attorney to determine exactly which wages are still recoverable.',
      showIf: (answers) => answers.when_owed === 'over_3_years',
    },
    {
      id: 'sol_unsure',
      type: 'info',
      prompt:
        'Review your pay stubs, bank deposits, and employment records to determine when wages were due. Each paycheck has its own 3-year deadline. If you cannot figure out the timeline, consult an attorney before your window closes.',
      showIf: (answers) => answers.when_owed === 'unsure',
    },

    // === Employment Status ===
    {
      id: 'employment_status',
      type: 'single_choice',
      prompt: 'What is your employment status?',
      helpText:
        'Some workers are exempt from wage protections. Independent contractors are not covered by the WPCL, but many employers misclassify employees as contractors.',
      options: [
        { value: 'w2_employee', label: 'W-2 employee (full-time or part-time)' },
        { value: 'independent_contractor', label: 'Independent contractor (1099)' },
        { value: 'farm_worker', label: 'Farm or agricultural worker' },
        { value: 'domestic_worker', label: 'Domestic worker (nanny, housekeeper, caregiver)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'contractor_warning',
      type: 'info',
      prompt:
        'INDEPENDENT CONTRACTOR WARNING:\n\nThe WPCL covers "employees," not independent contractors. However, misclassification is extremely common \u2014 many employers call workers "independent contractors" to avoid wage laws.\n\nPA uses an "economic reality" test. You may actually be an employee if:\n\u2022 The employer controls how, when, and where you work\n\u2022 You use the employer\'s tools and equipment\n\u2022 You work exclusively or primarily for one company\n\u2022 You cannot hire your own helpers\n\u2022 The relationship is ongoing, not project-based\n\nIf you were misclassified, you are still entitled to WPCL protections.',
      showIf: (answers) => answers.employment_status === 'independent_contractor',
    },
    {
      id: 'farm_worker_warning',
      type: 'info',
      prompt:
        'FARM WORKER EXEMPTIONS:\n\n\u2022 Small farms (under 500 man-days in any quarter of the prior year) may be exempt from minimum wage for permanent workers\n\u2022 Seasonal farm workers MUST be paid at least minimum wage regardless of farm size\n\u2022 Farm workers are generally exempt from PA overtime requirements\n\u2022 Federal FLSA agricultural exemptions may also apply\n\u2022 However, the WPCL still requires employers to pay agreed-upon wages on time \u2014 even for exempt workers\n\nIf you were promised a wage and not paid, you likely still have a WPCL claim.',
      showIf: (answers) => answers.employment_status === 'farm_worker',
    },
    {
      id: 'domestic_worker_info',
      type: 'info',
      prompt:
        'DOMESTIC WORKER NOTE:\n\n\u2022 Domestic workers (nannies, housekeepers, caregivers) are generally covered by the WPCL\n\u2022 Live-in domestic workers may be exempt from overtime under both PA and federal law\n\u2022 You are still entitled to at least minimum wage and timely payment of all agreed wages\n\u2022 If paid off the books, you still have legal rights \u2014 being paid in cash does not waive WPCL protections',
      showIf: (answers) => answers.employment_status === 'domestic_worker',
    },

    // === Filing Options ===
    {
      id: 'filing_header',
      type: 'info',
      prompt:
        'YOUR FILING OPTIONS\n\nPennsylvania gives you three main paths to recover unpaid wages:\n\n1. PA Department of Labor & Industry wage complaint (free, no lawyer needed)\n2. Magisterial District Court lawsuit (claims under $12,000)\n3. Court of Common Pleas lawsuit (any amount, formal procedure)\n\nYou can file a Department of Labor complaint AND a lawsuit \u2014 they are not mutually exclusive. Many workers start with the Department of Labor complaint because it is free.',
    },
    {
      id: 'filing_path',
      type: 'single_choice',
      prompt: 'Which path are you considering?',
      options: [
        { value: 'dol_complaint', label: 'PA Department of Labor & Industry complaint (free)' },
        { value: 'magisterial', label: 'Magisterial District Court (under $12,000)' },
        { value: 'common_pleas', label: 'Court of Common Pleas lawsuit' },
        { value: 'unsure_path', label: 'I am not sure which path to take' },
      ],
    },
    {
      id: 'dol_instructions',
      type: 'info',
      prompt:
        'PA DEPARTMENT OF LABOR & INDUSTRY COMPLAINT:\n\n1. File online at pa.gov or download the Wage Payment Complaint Form\n2. Mail to: Bureau of Labor Law Compliance, 1301 Labor and Industry Building, 651 Boas St., Harrisburg, PA 17121\n3. Include: employer name/address, dates worked, pay rate, wages owed, pay dates missed\n4. The Department investigates and contacts the employer\n5. If the employer does not pay, the Department can file suit in court on your behalf\n6. No filing fee. No lawyer required.\n\nPhiladelphia workers: you can ALSO file a separate complaint with the City of Philadelphia Office of Worker Protections for violations within city limits.',
      showIf: (answers) => answers.filing_path === 'dol_complaint',
    },
    {
      id: 'magisterial_instructions',
      type: 'info',
      prompt:
        'MAGISTERIAL DISTRICT COURT (claims under $12,000):\n\n1. File a civil complaint at the Magisterial District Court in the district where your employer is located or where you worked\n2. Filing fee: approximately $45\u2013$125 depending on the amount\n3. Hearing is typically scheduled within 30\u201360 days\n4. No formal pleading rules \u2014 simpler than Court of Common Pleas\n5. Bring all evidence: pay stubs, time records, employment agreement, communications\n6. Either party can appeal to Court of Common Pleas for a brand-new trial (de novo) within 30 days\n\nThis is the fastest court option for smaller claims.',
      showIf: (answers) => answers.filing_path === 'magisterial',
    },
    {
      id: 'common_pleas_instructions',
      type: 'info',
      prompt:
        'COURT OF COMMON PLEAS:\n\n1. File a civil complaint with the Prothonotary in the county where your employer is located, where you worked, or where the employment agreement was made\n2. Filing fee: approximately $200\u2013$350 depending on the county\n3. Formal procedure \u2014 Pa. Rules of Civil Procedure apply\n4. If your claim is under the county\'s compulsory arbitration threshold ($25,000\u2013$50,000), the case first goes to mandatory arbitration\n5. You can include WPCL claims, FLSA claims, UTPCPL claims, and common law claims in one lawsuit\n6. Attorney fees are mandatory if you win under the WPCL\n\nThis is the best option for larger claims or when you want to pursue multiple legal theories.',
      showIf: (answers) => answers.filing_path === 'common_pleas',
    },
    {
      id: 'unsure_path_guidance',
      type: 'info',
      prompt:
        'WHICH PATH IS RIGHT FOR YOU?\n\n\u2022 Claim under $5,000, straightforward unpaid wages: Start with the Department of Labor complaint (free, no lawyer needed)\n\u2022 Claim under $12,000, want a faster court resolution: Magisterial District Court\n\u2022 Claim over $12,000, or involves overtime/misclassification: Court of Common Pleas\n\u2022 Employer also committed fraud or deception: Court of Common Pleas (to add UTPCPL treble damages claim)\n\nYou can file a Department of Labor complaint AND a court action simultaneously.',
      showIf: (answers) => answers.filing_path === 'unsure_path',
    },

    // === Fee Affordability ===
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the court filing fee?',
      showIf: (answers) =>
        answers.filing_path === 'magisterial' || answers.filing_path === 'common_pleas',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'You can petition to proceed In Forma Pauperis (IFP) under Pa.R.C.P. 240.\n\n1. File a "Petition to Proceed In Forma Pauperis" with your complaint\n2. Include a financial affidavit listing your income, expenses, assets, and debts\n3. If approved, all filing fees and service costs are waived\n4. Available in both Magisterial District Court and Court of Common Pleas\n\nAlternatively, the Department of Labor complaint is always free.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // === Deceptive Practices / UTPCPL ===
    {
      id: 'deceptive_practices',
      type: 'yes_no',
      prompt:
        'Did your employer engage in fraud or deception related to the wage theft?',
      helpText:
        'Examples: employer lied about pay rate, falsified time records, misrepresented commission structure, promised wages they never intended to pay, or used bait-and-switch compensation tactics.',
    },
    {
      id: 'utpcpl_info',
      type: 'info',
      prompt:
        'UTPCPL \u2014 TREBLE DAMAGES AVAILABLE\n\nIf the wage theft involved deceptive practices, you may also have a claim under Pennsylvania\'s Unfair Trade Practices and Consumer Protection Law (73 P.S. \u00A7201-1 et seq.).\n\nUTPCPL provides:\n\u2022 Up to TREBLE (3x) actual damages\n\u2022 Minimum $100 statutory damages\n\u2022 Attorney fees if you win\n\u2022 PA Supreme Court ruled treble damages CANNOT be reduced by other damage awards (Dwyer v. Ameriprise, 2024)\n\nThis is in ADDITION to WPCL remedies. Include a UTPCPL count in your complaint alongside the WPCL claim.',
      showIf: (answers) => answers.deceptive_practices === 'yes',
    },

    // === Retaliation ===
    {
      id: 'retaliation',
      type: 'yes_no',
      prompt: 'Has your employer retaliated against you (or threatened to) for raising wage issues?',
      helpText:
        'Examples: fired, demoted, cut hours, changed schedule, threatened deportation, gave bad reference, or disciplined you after you complained about unpaid wages.',
    },
    {
      id: 'retaliation_info',
      type: 'info',
      prompt:
        'RETALIATION PROTECTION (43 P.S. \u00A7260.9a):\n\nIt is ILLEGAL for your employer to discharge, discipline, or discriminate against you for:\n\u2022 Filing a wage complaint with the Department of Labor\n\u2022 Filing a lawsuit to recover wages\n\u2022 Testifying or planning to testify in a wage proceeding\n\nIf your employer retaliated:\n\u2022 Document everything (dates, witnesses, communications)\n\u2022 You may have an additional claim for wrongful retaliation\n\u2022 Remedies can include reinstatement, back pay, and damages\n\u2022 Retaliation strengthens your underlying wage claim \u2014 it shows the employer knew they were in the wrong',
      showIf: (answers) => answers.retaliation === 'yes',
    },

    // === Damages Breakdown ===
    {
      id: 'damages_breakdown',
      type: 'info',
      prompt:
        'WHAT YOU CAN RECOVER UNDER PA LAW:\n\n\u2022 Full unpaid wages (the base amount owed)\n\u2022 Liquidated damages: 25% of wages owed, or $500, whichever is greater (43 P.S. \u00A7260.10)\n\u2022 Attorney fees: mandatory if you win (employer pays your lawyer)\n\u2022 Court costs\n\u2022 Prejudgment interest\n\u2022 If UTPCPL applies: up to treble (3x) damages plus additional attorney fees\n\u2022 If FLSA applies (overtime): double back pay as liquidated damages\n\nThe combination of penalties, liquidated damages, and attorney fees can sometimes DOUBLE the original claim value.',
    },

    // === Wage Garnishment Protection Note ===
    {
      id: 'garnishment_info',
      type: 'info',
      prompt:
        'COLLECTING YOUR JUDGMENT \u2014 PA WAGE GARNISHMENT RULES:\n\nIronic but important: Pennsylvania law (42 Pa.C.S.A. \u00A78127) prohibits wage garnishment for most civil judgments \u2014 including wage theft judgments. This means if you win, you generally CANNOT garnish your employer\'s employees\' wages to collect.\n\nHowever, you CAN collect through:\n\u2022 Bank account execution (levy employer\'s bank accounts)\n\u2022 Property liens\n\u2022 Sheriff\'s sale of business assets\n\u2022 Voluntary payment plans\n\nFor business defendants, bank levies and property liens are usually the most effective collection tools.',
    },

    // === Evidence Checklist ===
    {
      id: 'evidence_checklist',
      type: 'info',
      prompt:
        'EVIDENCE CHECKLIST \u2014 GATHER THESE NOW:\n\n\u2022 Pay stubs (all available \u2014 employer must provide itemized statements under PA law)\n\u2022 Time records, clock-in/out logs, or personal notes of hours worked\n\u2022 Employment agreement, offer letter, or handbook\n\u2022 Commission or bonus agreements\n\u2022 Bank statements showing deposits (proves what you were actually paid)\n\u2022 Communications about pay: emails, texts, voicemails, letters\n\u2022 W-2 forms or 1099 forms\n\u2022 Contact information for coworkers who can corroborate\n\u2022 Any evidence of retaliation (if applicable)\n\u2022 Written company policies on PTO, vacation, commission, bonuses',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Wage type
    if (answers.wage_type) {
      const types: Record<string, string> = {
        regular_wages: 'Regular wages',
        overtime: 'Overtime pay',
        commission: 'Commission',
        bonus: 'Bonus',
        final_paycheck: 'Final paycheck',
        tips: 'Tips / tip credit violation',
        vacation_pay: 'Vacation/PTO pay',
      }
      items.push({
        status: 'done',
        text: `Wage type: ${types[answers.wage_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the type of unpaid wages.',
      })
    }

    // Amount owed
    if (answers.amount_owed) {
      items.push({
        status: 'done',
        text: `Amount owed: ${answers.amount_owed}. With 25% liquidated damages under WPCL, potential recovery could be higher.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate the total amount of unpaid wages.',
      })
    }

    // Statute of limitations
    if (answers.when_owed === 'under_1_year') {
      items.push({ status: 'done', text: 'Claim is within the 3-year statute of limitations.' })
    } else if (answers.when_owed === '1_to_3_years') {
      items.push({
        status: 'needed',
        text: 'SOL deadline may be approaching. Calculate exact date and file promptly.',
      })
    } else if (answers.when_owed === 'over_3_years') {
      items.push({
        status: 'needed',
        text: 'Some wages may be time-barred. Consult an attorney to determine which paychecks are still recoverable.',
      })
    } else if (answers.when_owed === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Determine when wages were due to confirm the 3-year deadline has not passed.',
      })
    }

    // Employment status warnings
    if (answers.employment_status === 'independent_contractor') {
      items.push({
        status: 'info',
        text: 'Classified as independent contractor. Evaluate whether you were misclassified — misclassified employees are still covered by the WPCL.',
      })
    } else if (answers.employment_status === 'farm_worker') {
      items.push({
        status: 'info',
        text: 'Farm workers have limited exemptions but WPCL still requires payment of agreed-upon wages.',
      })
    }

    // Filing path
    if (answers.filing_path === 'dol_complaint') {
      items.push({
        status: 'done',
        text: 'Filing path: PA Department of Labor & Industry complaint (free, no lawyer needed).',
      })
    } else if (answers.filing_path === 'magisterial') {
      items.push({
        status: 'done',
        text: 'Filing path: Magisterial District Court (under $12K, faster resolution).',
      })
    } else if (answers.filing_path === 'common_pleas') {
      items.push({
        status: 'done',
        text: 'Filing path: Court of Common Pleas (formal procedure, multiple claim types).',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing path: Department of Labor complaint (free), Magisterial District Court (under $12K), or Court of Common Pleas.',
      })
    }

    // Fee waiver
    if (
      (answers.filing_path === 'magisterial' || answers.filing_path === 'common_pleas') &&
      answers.can_afford_fee === 'no'
    ) {
      items.push({
        status: 'needed',
        text: 'File an In Forma Pauperis (IFP) petition under Pa.R.C.P. 240 to waive court fees.',
      })
    }

    // UTPCPL
    if (answers.deceptive_practices === 'yes') {
      items.push({
        status: 'info',
        text: 'Include a UTPCPL count (73 P.S. \u00A7201-1) for up to treble damages and additional attorney fees.',
      })
    }

    // Retaliation
    if (answers.retaliation === 'yes') {
      items.push({
        status: 'info',
        text: 'Document retaliation thoroughly. This strengthens your wage claim and may support an additional retaliation claim under 43 P.S. \u00A7260.9a.',
      })
    }

    // Overtime / FLSA
    if (answers.wage_type === 'overtime') {
      items.push({
        status: 'info',
        text: 'Overtime claims can also be filed under federal FLSA for up to double back pay plus attorney fees.',
      })
    }

    // Universal reminders
    items.push({
      status: 'info',
      text: 'WPCL provides 25% liquidated damages + mandatory attorney fees if you win (43 P.S. \u00A7260.10).',
    })

    items.push({
      status: 'info',
      text: 'Gather pay stubs, time records, employment agreements, bank statements, and all communications about wages owed.',
    })

    return items
  },
}
