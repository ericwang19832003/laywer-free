import type { GuidedStepConfig } from '../types'

export const bizEmploymentWageTheftFlConfig: GuidedStepConfig = {
  title: 'Florida Wage Theft Dispute Guide',
  reassurance:
    'Florida relies heavily on the federal Fair Labor Standards Act (FLSA) for wage claims, but the state constitution guarantees a minimum wage higher than the federal rate. Multiple county ordinances also provide local remedies. We will walk you through every option.',

  questions: [
    // === Florida wage law overview ===
    {
      id: 'fl_wage_law_overview',
      type: 'info',
      prompt:
        'FLORIDA WAGE THEFT — KEY FACTS\n\nFlorida has NO comprehensive state wage payment law like many other states. Instead, workers rely on:\n\n1. FEDERAL FLSA (29 U.S.C. \u00A7201 et seq.) — covers minimum wage, overtime, and recordkeeping\n2. FL CONSTITUTION Art. X \u00A724 — guarantees a state minimum wage higher than the federal rate\n3. COUNTY WAGE THEFT ORDINANCES — Miami-Dade (\u00A722-4), Broward, Hillsborough, Pinellas, Osceola, and Alachua counties have local wage theft programs\n4. STATE COURT — breach of contract or unjust enrichment claims for unpaid wages\n\nThere is NO state Department of Labor wage claim process in Florida (unlike CA, NY, or PA). You cannot file a state administrative wage claim.',
    },

    // === Minimum wage info ===
    {
      id: 'fl_minimum_wage_info',
      type: 'info',
      prompt:
        'FLORIDA MINIMUM WAGE (FL Constitution Art. X \u00A724)\n\nAmendment 2 (2020) mandates annual $1.00 increases every September 30:\n\u2022 Sept 30, 2024: $13.00/hr\n\u2022 Sept 30, 2025: $14.00/hr\n\u2022 Sept 30, 2026: $15.00/hr (final scheduled increase)\n\u2022 2027 onward: annual CPI adjustments\n\nTipped employees: employers may take a tip credit of $3.02/hr\n\u2022 Tipped cash wage (2025): $10.98/hr\n\u2022 Tips received + cash wage must equal or exceed the full minimum wage\n\nFederal minimum wage ($7.25/hr) is lower — Florida\'s higher rate controls.\n\nFlorida preempts local minimum wage ordinances EXCEPT the constitutional amendment rate. No city or county can set a different minimum wage.',
    },

    // === Wage type ===
    {
      id: 'wage_type',
      type: 'single_choice',
      prompt: 'What type of wages are unpaid?',
      options: [
        { value: 'regular_wages', label: 'Regular wages (hourly or salary)' },
        { value: 'overtime', label: 'Overtime pay' },
        { value: 'minimum_wage', label: 'Minimum wage violation (paid below $14.00/hr)' },
        { value: 'tips', label: 'Tip theft or tip credit violation' },
        { value: 'commission', label: 'Commission' },
        { value: 'final_paycheck', label: 'Final paycheck after leaving' },
        { value: 'bonus', label: 'Bonus' },
      ],
    },
    {
      id: 'regular_wages_info',
      type: 'info',
      prompt:
        'UNPAID REGULAR WAGES IN FLORIDA:\n\u2022 No Florida statute requires payment on specific paydays (unlike TX or CA)\n\u2022 Your claim is based on breach of the employment contract (express or implied)\n\u2022 If you have a written employment agreement: 5-year SOL (Fla. Stat. \u00A795.11(2)(b))\n\u2022 If oral agreement only: 4-year SOL (Fla. Stat. \u00A795.11(3)(k))\n\u2022 You can also file an FLSA claim if the employer violated federal minimum wage or overtime rules\n\u2022 Document hours worked, pay stubs, and any written agreements about pay',
      showIf: (answers) => answers.wage_type === 'regular_wages',
    },
    {
      id: 'overtime_info',
      type: 'info',
      prompt:
        'UNPAID OVERTIME (FLSA, 29 U.S.C. \u00A7207):\n\u2022 Florida has NO state overtime law — all overtime claims are under federal FLSA\n\u2022 FLSA requires 1.5x regular rate for hours over 40/week\n\u2022 NOT all employees qualify: you must be "non-exempt"\n\u2022 Exempt employees include salaried executives, professionals, and administrators earning $35,568+/year\n\u2022 Misclassification is common — many employers wrongly classify workers as exempt or as independent contractors\n\u2022 FLSA SOL: 2 years (3 years for willful violations) (29 U.S.C. \u00A7255)\n\u2022 Liquidated damages: equal to unpaid wages (effectively double recovery) (29 U.S.C. \u00A7216(b))\n\u2022 Attorney fees are recoverable under FLSA',
      showIf: (answers) => answers.wage_type === 'overtime',
    },
    {
      id: 'minimum_wage_info',
      type: 'info',
      prompt:
        'MINIMUM WAGE VIOLATION:\n\u2022 Florida\'s minimum wage ($14.00/hr effective Sept 30, 2025) is enforceable under FL Constitution Art. X \u00A724\n\u2022 Employees can bring a private civil action to recover underpayment\n\u2022 Remedies: back pay + liquidated damages (equal to unpaid wages) + attorney fees\n\u2022 SOL under FL Constitution: up to 5 years of back wages\n\u2022 You may ALSO file under federal FLSA if paid below $7.25/hr (federal floor)\n\u2022 No administrative agency to file with — you must file in court or use a county wage theft program if available\n\u2022 Pre-suit notice may be required under the FL Minimum Wage Act before filing suit',
      showIf: (answers) => answers.wage_type === 'minimum_wage',
    },
    {
      id: 'tips_info',
      type: 'info',
      prompt:
        'TIP THEFT / TIP CREDIT VIOLATION:\n\u2022 FL tip credit: $3.02/hr — employer must pay at least $10.98/hr in direct wages (2025)\n\u2022 Employer must inform you of the tip credit BEFORE taking it\n\u2022 If employer takes tip credit without proper notice, you are owed the full minimum wage\n\u2022 Tip pooling: tips can be shared among customarily tipped employees, but managers/supervisors CANNOT participate\n\u2022 Employer cannot retain any portion of tips (FLSA \u00A7203(m))\n\u2022 If employer keeps your tips: claim under FLSA for tip theft\n\u2022 SOL: 2 years under FLSA (3 years if willful)',
      showIf: (answers) => answers.wage_type === 'tips',
    },
    {
      id: 'commission_info',
      type: 'info',
      prompt:
        'UNPAID COMMISSION IN FLORIDA:\n\u2022 Commission is typically governed by the employment contract\n\u2022 If there is a written commission agreement: breach of contract claim with 5-year SOL\n\u2022 Employer cannot retroactively change commission terms for work already performed\n\u2022 If you earned the commission before leaving, it must be paid per the agreement\n\u2022 Florida courts treat earned commissions as wages under contract law\n\u2022 Document: commission agreement, sales records, pay stubs, and communications about calculations',
      showIf: (answers) => answers.wage_type === 'commission',
    },
    {
      id: 'final_paycheck_info',
      type: 'info',
      prompt:
        'FINAL PAYCHECK IN FLORIDA:\n\u2022 Florida has NO state law requiring immediate payment of final wages (unlike CA or TX)\n\u2022 Federal law does not mandate a specific timeline either\n\u2022 Your right to final payment depends on the employment contract and company policy\n\u2022 If the employer has a policy for final paycheck timing, they must follow it\n\u2022 Remedy: breach of contract claim in state court\n\u2022 If final pay includes earned vacation/PTO: depends on employer\'s written policy\n\u2022 If employer refuses to pay at all: consider county wage theft program (if available) or court action',
      showIf: (answers) => answers.wage_type === 'final_paycheck',
    },
    {
      id: 'bonus_info',
      type: 'info',
      prompt:
        'UNPAID BONUS IN FLORIDA:\n\u2022 Bonuses are enforceable ONLY if they are part of a written or oral agreement\n\u2022 Discretionary bonuses (employer chooses whether to pay) are generally NOT enforceable\n\u2022 Performance bonuses tied to specific goals ARE enforceable if goals were met\n\u2022 Claim is breach of contract — SOL depends on whether agreement was written (5 years) or oral (4 years)\n\u2022 Key question: was the bonus promised as part of compensation, or purely discretionary?',
      showIf: (answers) => answers.wage_type === 'bonus',
    },

    // === Amount owed ===
    {
      id: 'amount_owed',
      type: 'text',
      prompt: 'How much do you believe you are owed? (approximate dollar amount)',
      placeholder: 'e.g. $5,000',
    },

    // === Statute of limitations ===
    {
      id: 'sol_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS FOR FLORIDA WAGE CLAIMS\n\nMultiple deadlines may apply depending on your claim type:\n\n\u2022 FLSA claims (overtime, minimum wage): 2 YEARS (29 U.S.C. \u00A7255)\n\u2022 FLSA willful violations: 3 YEARS (29 U.S.C. \u00A7255)\n\u2022 FL minimum wage (constitutional claim): up to 5 YEARS\n\u2022 Written contract claims (commissions, salary): 5 YEARS (Fla. Stat. \u00A795.11(2)(b))\n\u2022 Oral contract claims: 4 YEARS (Fla. Stat. \u00A795.11(3)(k))\n\u2022 County wage theft ordinances: vary by county (Miami-Dade allows claims within 1 year of last underpayment)\n\u2022 US DOL complaint: no strict filing deadline, but timeliness matters\n\nIMPORTANT: The clock starts when each wage payment was due, not when you discovered the problem. Each missed paycheck may have its own deadline.',
    },

    // === Employment classification ===
    {
      id: 'employment_type',
      type: 'single_choice',
      prompt: 'How were you classified by your employer?',
      helpText:
        'Misclassification is one of the most common wage theft tactics. Independent contractors are not covered by the FLSA.',
      options: [
        { value: 'w2_employee', label: 'W-2 employee' },
        { value: 'independent_contractor', label: 'Independent contractor (1099)' },
        { value: 'unsure', label: 'I am not sure' },
      ],
    },
    {
      id: 'misclassification_warning',
      type: 'info',
      prompt:
        'POSSIBLE MISCLASSIFICATION\n\nMany employers misclassify employees as independent contractors to avoid paying overtime, minimum wage, and benefits. Under the FLSA "economic reality" test, you may actually be an employee if:\n\n\u2022 The employer controls WHEN, WHERE, and HOW you work\n\u2022 You do not have your own business or serve other clients\n\u2022 The employer provides tools, equipment, or materials\n\u2022 The work is integral to the employer\'s business\n\u2022 You have no opportunity for profit or loss based on your own skill\n\nIf you were misclassified, you may have FLSA claims for minimum wage, overtime, and liquidated damages even though you received a 1099.',
      showIf: (answers) =>
        answers.employment_type === 'independent_contractor' ||
        answers.employment_type === 'unsure',
    },

    // === County location ===
    {
      id: 'county_location',
      type: 'single_choice',
      prompt: 'In which Florida county did you perform the work?',
      helpText:
        'Some counties have local wage theft ordinances with administrative complaint processes.',
      options: [
        { value: 'miami_dade', label: 'Miami-Dade County' },
        { value: 'broward', label: 'Broward County' },
        { value: 'hillsborough', label: 'Hillsborough County' },
        { value: 'pinellas', label: 'Pinellas County' },
        { value: 'osceola', label: 'Osceola County' },
        { value: 'alachua', label: 'Alachua County' },
        { value: 'other', label: 'Another county' },
      ],
    },
    {
      id: 'miami_dade_ordinance',
      type: 'info',
      prompt:
        'MIAMI-DADE COUNTY WAGE THEFT ORDINANCE (\u00A722-1 through \u00A722-7)\n\nMiami-Dade has the strongest local wage theft program in Florida:\n\n\u2022 Covers all private employers with employees working in the county\n\u2022 Claim must exceed $60 and be no more than $15,000\n\u2022 File a complaint with the Miami-Dade County Small Business Development division\n\u2022 The county investigates and holds a hearing\n\u2022 If violation found: employer ordered to pay up to 3x the wages owed (treble damages)\n\u2022 Administrative costs may also be assessed against the employer\n\u2022 FREE to file — no attorney needed\n\u2022 This is IN ADDITION to your federal FLSA rights — you can pursue both\n\nFile at: miamidade.gov or call 311',
      showIf: (answers) => answers.county_location === 'miami_dade',
    },
    {
      id: 'broward_ordinance',
      type: 'info',
      prompt:
        'BROWARD COUNTY WAGE THEFT ORDINANCE\n\nBroward County adopted a wage theft ordinance modeled after Miami-Dade\'s program:\n\n\u2022 Covers employees who performed work within Broward County\n\u2022 Administrative complaint process — free to file\n\u2022 The county investigates and can order payment of unpaid wages\n\u2022 Penalties for non-compliance\n\u2022 This is in addition to your federal FLSA rights\n\nContact Broward County\'s wage theft program for filing procedures.',
      showIf: (answers) => answers.county_location === 'broward',
    },
    {
      id: 'other_county_ordinance',
      type: 'info',
      prompt:
        'COUNTY WAGE THEFT PROGRAMS\n\nHillsborough, Pinellas, Osceola, and Alachua counties also have wage theft ordinances with administrative complaint processes. Contact your county government to confirm current procedures and filing requirements.\n\nThese programs are typically free, do not require an attorney, and operate alongside your federal FLSA rights.',
      showIf: (answers) =>
        answers.county_location === 'hillsborough' ||
        answers.county_location === 'pinellas' ||
        answers.county_location === 'osceola' ||
        answers.county_location === 'alachua',
    },
    {
      id: 'no_county_ordinance',
      type: 'info',
      prompt:
        'Your county does not have a local wage theft ordinance. Your options are:\n\n1. File an FLSA claim in federal court (overtime or minimum wage violations)\n2. File a breach of contract claim in state court\n3. File a complaint with the US Department of Labor, Wage and Hour Division\n4. File under the FL Minimum Wage Act (constitutional claim) in state court\n\nWe will walk through each option.',
      showIf: (answers) => answers.county_location === 'other',
    },

    // === Filing options ===
    {
      id: 'filing_path',
      type: 'single_choice',
      prompt: 'Which filing path do you want to pursue?',
      helpText:
        'You can pursue multiple paths simultaneously. Choose the one you want to start with.',
      options: [
        {
          value: 'flsa_federal',
          label: 'Federal FLSA lawsuit (overtime or minimum wage — filed in federal court)',
        },
        {
          value: 'state_contract',
          label: 'State court breach of contract (commissions, salary, bonuses)',
        },
        {
          value: 'county_ordinance',
          label: 'County wage theft ordinance complaint (Miami-Dade, Broward, etc.)',
        },
        {
          value: 'dol_complaint',
          label: 'US DOL Wage and Hour Division complaint',
        },
        { value: 'unsure_path', label: 'I am not sure which option is best' },
      ],
    },
    {
      id: 'flsa_federal_info',
      type: 'info',
      prompt:
        'FILING AN FLSA CLAIM IN FEDERAL COURT\n\n1. File in the U.S. District Court for the district where you worked (Southern, Middle, or Northern District of Florida)\n2. Your complaint must allege:\n   \u2022 You were an "employee" under the FLSA\n   \u2022 The employer is covered by the FLSA (annual revenue $500K+ or engaged in interstate commerce)\n   \u2022 The specific wage violation (unpaid overtime or minimum wage)\n   \u2022 The amount owed\n3. You may represent yourself (pro se) in federal court\n4. FLSA allows recovery of:\n   \u2022 Unpaid wages\n   \u2022 Liquidated damages (equal to unpaid wages — effectively double) (29 U.S.C. \u00A7216(b))\n   \u2022 Attorney fees and costs\n5. You may also bring a "collective action" on behalf of similarly situated employees\n6. Filing fee: approximately $405 (fee waiver available via IFP application)\n\nIMPORTANT: Under FLSA, you cannot file with a state agency first — there is no administrative exhaustion requirement. You go directly to court or to the US DOL.',
      showIf: (answers) => answers.filing_path === 'flsa_federal',
    },
    {
      id: 'state_contract_info',
      type: 'info',
      prompt:
        'FILING A BREACH OF CONTRACT CLAIM IN FLORIDA STATE COURT\n\n1. Determine the correct court based on amount:\n   \u2022 $8,000 or less: Small Claims Court (simplified procedures)\n   \u2022 $8,001\u2013$50,000: County Court\n   \u2022 Over $50,000: Circuit Court\n2. File in the county where the work was performed or the employer is located (Fla. Stat. \u00A747.011)\n3. Your complaint must allege:\n   \u2022 A valid employment agreement existed (written or oral)\n   \u2022 You performed your work obligations\n   \u2022 The employer failed to pay as agreed\n   \u2022 The amount of damages\n4. Florida is a FACT PLEADING state (Fla. R. Civ. P. 1.110(b)) — state specific facts, not legal conclusions\n5. E-filing is mandatory via www.myflcourtaccess.com\n6. Civil Cover Sheet (Form 1.997) required for county and circuit court\n7. SOL: 5 years (written contract) or 4 years (oral contract)\n8. Prejudgment interest may apply at the contractual or statutory rate',
      showIf: (answers) => answers.filing_path === 'state_contract',
    },
    {
      id: 'county_ordinance_info',
      type: 'info',
      prompt:
        'FILING A COUNTY WAGE THEFT COMPLAINT\n\nIf you work in Miami-Dade, Broward, Hillsborough, Pinellas, Osceola, or Alachua County:\n\n1. Contact the county\'s wage theft program (call 311 or visit the county website)\n2. File a written complaint describing the unpaid wages\n3. The county will investigate and notify the employer\n4. A hearing may be scheduled before a hearing officer\n5. If the employer is found to have violated the ordinance:\n   \u2022 Miami-Dade: up to 3x wages owed (treble damages)\n   \u2022 Other counties: varies — typically unpaid wages + penalties\n6. FREE to file — no attorney required\n7. This does NOT replace your federal FLSA rights — you can pursue both simultaneously\n\nNOTE: If your county does not have a wage theft ordinance, skip this option and file in federal court (FLSA) or state court (contract).',
      showIf: (answers) => answers.filing_path === 'county_ordinance',
    },
    {
      id: 'dol_complaint_info',
      type: 'info',
      prompt:
        'US DEPARTMENT OF LABOR COMPLAINT\n\n1. File online at dol.gov/agencies/whd/contact/complaints or call 1-866-487-9243\n2. The Wage and Hour Division (WHD) investigates FLSA violations\n3. WHD can:\n   \u2022 Investigate and order the employer to pay back wages\n   \u2022 Sue the employer on your behalf\n   \u2022 Assess civil penalties against the employer\n4. FREE — no cost to file\n5. You do NOT need an attorney\n6. No strict filing deadline, but file as soon as possible (SOL still applies to recovery period)\n7. If WHD declines or cannot resolve: you retain the right to file your own lawsuit\n\nCAUTION: If the US DOL files suit on your behalf, you cannot also file your own private FLSA lawsuit for the same wages (29 U.S.C. \u00A7216(b)). Choose one path.',
      showIf: (answers) => answers.filing_path === 'dol_complaint',
    },
    {
      id: 'unsure_path_info',
      type: 'info',
      prompt:
        'WHICH PATH IS BEST FOR YOU?\n\n\u2022 OVERTIME or MINIMUM WAGE violation: Start with a US DOL complaint (free, no attorney needed) OR file an FLSA lawsuit in federal court for double damages + attorney fees\n\u2022 COMMISSION, SALARY, or BONUS dispute: File a breach of contract claim in Florida state court\n\u2022 WORK IN MIAMI-DADE, BROWARD, or another county with a wage theft ordinance: File a county complaint first (free, fast, up to 3x damages in Miami-Dade) while preserving your federal rights\n\u2022 SMALL AMOUNT ($8,000 or less): Small Claims Court in the county where you worked — simplest and cheapest\n\u2022 LARGE AMOUNT or WILLFUL VIOLATION: Federal FLSA lawsuit for double damages + attorney fees, or hire an attorney on contingency\n\nYou can pursue MULTIPLE paths simultaneously (e.g., county ordinance + federal FLSA).',
      showIf: (answers) => answers.filing_path === 'unsure_path',
    },

    // === Retaliation ===
    {
      id: 'retaliation_concern',
      type: 'yes_no',
      prompt:
        'Are you concerned about your employer retaliating against you for filing a wage claim?',
    },
    {
      id: 'retaliation_info',
      type: 'info',
      prompt:
        'RETALIATION PROTECTIONS\n\nYou are protected from employer retaliation under multiple laws:\n\n1. FLSA \u00A7215(a)(3): It is unlawful to discharge or discriminate against any employee who files an FLSA complaint or participates in proceedings. Remedies include reinstatement, back pay, and liquidated damages.\n\n2. FL Whistleblower Act (Fla. Stat. \u00A7448.102): Prohibits employers from retaliating against employees who report or refuse to participate in employer violations of law. Covers reporting wage theft to authorities.\n\n3. County ordinances: Miami-Dade and Broward wage theft ordinances include anti-retaliation provisions.\n\nIf your employer fires, demotes, reduces hours, or threatens you for asserting wage rights, DOCUMENT EVERYTHING and file a separate retaliation claim. Retaliation claims can be more valuable than the underlying wage claim.',
      showIf: (answers) => answers.retaliation_concern === 'yes',
    },

    // === Evidence checklist ===
    {
      id: 'evidence_checklist',
      type: 'info',
      prompt:
        'EVIDENCE CHECKLIST — GATHER THESE DOCUMENTS\n\n\u2022 Pay stubs (or screenshots if electronic)\n\u2022 Time records, timesheets, or clock-in/clock-out records\n\u2022 Your own log of hours worked (handwritten notes, phone notes, or calendar entries count)\n\u2022 Employment contract, offer letter, or commission agreement\n\u2022 Employee handbook or company policies on pay, overtime, and PTO\n\u2022 Tax forms: W-2s or 1099s\n\u2022 Bank statements showing deposits (to verify amounts paid)\n\u2022 Text messages, emails, or voicemails about pay disputes\n\u2022 Contact information for coworkers who witnessed the same violations\n\u2022 Any written communications from employer about pay changes or denials\n\nTIP: If your employer destroyed records or refused to provide pay stubs, the burden of proof may shift to the employer under FLSA (Anderson v. Mt. Clemens Pottery Co., 328 U.S. 680).',
    },

    // === Attorney consideration ===
    {
      id: 'attorney_consideration',
      type: 'yes_no',
      prompt: 'Are you considering hiring an attorney?',
    },
    {
      id: 'attorney_info',
      type: 'info',
      prompt:
        'ATTORNEY FEES IN FLORIDA WAGE CASES\n\n\u2022 FLSA cases: If you win, the employer MUST pay your attorney fees (29 U.S.C. \u00A7216(b)). This means many employment attorneys take FLSA cases on contingency (no upfront cost).\n\u2022 FL minimum wage claims: Attorney fees are also recoverable under Art. X \u00A724.\n\u2022 Contract claims: Attorney fees are recoverable only if the contract has a fee-shifting provision or under Fla. Stat. \u00A7768.79 (offer of judgment).\n\nBecause FLSA provides fee-shifting, many attorneys will take overtime and minimum wage cases for free. Search for "employment attorney Florida FLSA" or contact the Florida Bar Lawyer Referral Service at 1-800-342-8011.\n\nFor small claims ($8,000 or less), you generally do not need an attorney.',
      showIf: (answers) => answers.attorney_consideration === 'yes',
    },
    {
      id: 'no_attorney_info',
      type: 'info',
      prompt:
        'REPRESENTING YOURSELF (PRO SE)\n\n\u2022 You can file FLSA claims pro se in federal court\n\u2022 You can file contract claims pro se in Florida state court\n\u2022 County wage theft complaints do not require an attorney\n\u2022 US DOL complaints do not require an attorney\n\u2022 Small Claims Court ($8,000 or less) is designed for self-represented parties\n\nFree legal help:\n\u2022 Florida Legal Aid: floridalegalaid.org\n\u2022 Legal Services of Greater Miami: lsgmi.org\n\u2022 Community Justice Project: communityjusticeproject.com\n\u2022 Florida Bar Lawyer Referral: 1-800-342-8011',
      showIf: (answers) => answers.attorney_consideration === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Wage type
    if (answers.wage_type) {
      const types: Record<string, string> = {
        regular_wages: 'Regular wages (hourly or salary)',
        overtime: 'Overtime pay (FLSA claim)',
        minimum_wage: 'Minimum wage violation (FL Constitution Art. X \u00A724)',
        tips: 'Tip theft or tip credit violation',
        commission: 'Commission',
        final_paycheck: 'Final paycheck',
        bonus: 'Bonus',
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
        text: `Amount owed: ${answers.amount_owed}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate the total amount of unpaid wages.',
      })
    }

    // Employment classification
    if (answers.employment_type === 'independent_contractor' || answers.employment_type === 'unsure') {
      items.push({
        status: 'needed',
        text: 'Determine if you were misclassified as an independent contractor. If misclassified, you may have FLSA claims for overtime and minimum wage.',
      })
    } else if (answers.employment_type === 'w2_employee') {
      items.push({
        status: 'done',
        text: 'Classified as W-2 employee — FLSA protections apply.',
      })
    }

    // County ordinance
    if (
      answers.county_location === 'miami_dade' ||
      answers.county_location === 'broward' ||
      answers.county_location === 'hillsborough' ||
      answers.county_location === 'pinellas' ||
      answers.county_location === 'osceola' ||
      answers.county_location === 'alachua'
    ) {
      const countyNames: Record<string, string> = {
        miami_dade: 'Miami-Dade (up to 3x damages)',
        broward: 'Broward',
        hillsborough: 'Hillsborough',
        pinellas: 'Pinellas',
        osceola: 'Osceola',
        alachua: 'Alachua',
      }
      items.push({
        status: 'info',
        text: `County wage theft ordinance available: ${countyNames[answers.county_location]}. File a free administrative complaint in addition to any court action.`,
      })
    }

    // Filing path
    if (answers.filing_path && answers.filing_path !== 'unsure_path') {
      const paths: Record<string, string> = {
        flsa_federal: 'Federal FLSA lawsuit in U.S. District Court (double damages + attorney fees)',
        state_contract: 'State court breach of contract claim',
        county_ordinance: 'County wage theft ordinance complaint',
        dol_complaint: 'US DOL Wage and Hour Division complaint (free, no attorney needed)',
      }
      items.push({
        status: 'done',
        text: `Filing path: ${paths[answers.filing_path]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing path: federal FLSA lawsuit, state court contract claim, county ordinance complaint, or US DOL complaint.',
      })
    }

    // SOL reminders based on wage type
    if (answers.wage_type === 'overtime' || answers.wage_type === 'minimum_wage' || answers.wage_type === 'tips') {
      items.push({
        status: 'info',
        text: 'FLSA SOL: 2 years (3 years for willful violations). FL minimum wage claims: up to 5 years. Act promptly.',
      })
    } else if (answers.wage_type === 'regular_wages' || answers.wage_type === 'commission' || answers.wage_type === 'bonus') {
      items.push({
        status: 'info',
        text: 'Contract claim SOL: 5 years (written) or 4 years (oral) under Fla. Stat. \u00A795.11.',
      })
    }

    // Retaliation
    if (answers.retaliation_concern === 'yes') {
      items.push({
        status: 'info',
        text: 'Retaliation protections: FLSA \u00A7215(a)(3) and FL Whistleblower Act (Fla. Stat. \u00A7448.102). Document any adverse actions by the employer.',
      })
    }

    // Attorney
    if (answers.attorney_consideration === 'yes') {
      items.push({
        status: 'info',
        text: 'FLSA provides mandatory fee-shifting — many attorneys take wage cases on contingency. Contact the Florida Bar at 1-800-342-8011.',
      })
    }

    // Evidence reminder
    items.push({
      status: 'needed',
      text: 'Gather pay stubs, time records, employment agreements, W-2s/1099s, bank statements, and any communications about unpaid wages.',
    })

    return items
  },
}
