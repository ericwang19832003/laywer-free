import type { GuidedStepConfig } from '../types'

export const bizEmploymentWageTheftCaConfig: GuidedStepConfig = {
  title: 'California Wage Theft — Recovering Unpaid Wages',
  reassurance:
    'California has the strongest wage theft protections in the country. You have multiple paths to recover what you are owed — including a free process through the Labor Commissioner that requires no lawyer.',

  questions: [
    // === Overview of CA protections ===
    {
      id: 'ca_protections_info',
      type: 'info',
      prompt:
        'CALIFORNIA WAGE THEFT LAW OVERVIEW\n\nCalifornia Labor Code \u00A7\u00A7200\u2013244 defines wages broadly and imposes strict payment requirements on employers. Key protections:\n\n\u2022 Minimum wage: $16.90/hr statewide (2026). Many cities are higher \u2014 West Hollywood $20.25, SF $19.18, Berkeley $19.18, Mountain View $19.70, Sunnyvale $19.50.\n\u2022 Fast food workers: $20/hr minimum (Lab. Code \u00A71474).\n\u2022 Healthcare workers: $18\u2013$24/hr depending on facility type.\n\u2022 Overtime: 1.5x after 8 hrs/day or 40 hrs/week; 2x after 12 hrs/day (Lab. Code \u00A7510).\n\u2022 Meal breaks: 30 min before 5th hour, 2nd before 10th hour (Lab. Code \u00A7512) \u2014 1 hour premium pay per violation.\n\u2022 Rest breaks: 10 min paid per 4 hours worked (Lab. Code \u00A7226.7) \u2014 1 hour premium pay per violation.\n\u2022 Retaliation is illegal: Lab. Code \u00A798.6 prohibits firing or punishing you for filing a wage claim.',
    },

    // === Wage type ===
    {
      id: 'wage_type',
      type: 'single_choice',
      prompt: 'What type of wages are unpaid?',
      options: [
        { value: 'regular_wages', label: 'Regular wages (hourly or salary)' },
        { value: 'overtime', label: 'Overtime pay' },
        { value: 'minimum_wage', label: 'Minimum wage violations (paid below minimum)' },
        { value: 'meal_rest', label: 'Meal or rest break violations' },
        { value: 'commission', label: 'Commission' },
        { value: 'final_paycheck', label: 'Final paycheck after leaving' },
        { value: 'tips', label: 'Tips or gratuities' },
        { value: 'expense_reimbursement', label: 'Unreimbursed business expenses' },
        { value: 'multiple', label: 'Multiple types of unpaid wages' },
      ],
    },
    {
      id: 'regular_wages_info',
      type: 'info',
      prompt:
        'UNPAID REGULAR WAGES (Lab. Code \u00A7\u00A7200\u2013204):\n\u2022 Employers must pay at least twice per month on designated paydays\n\u2022 Wages earned between the 1st and 15th must be paid by the 26th; wages earned between the 16th and last day must be paid by the 10th of the next month\n\u2022 Document every missed payday with exact dates and amounts\n\u2022 Keep your own records of hours worked \u2014 handwritten notes, texts, photos of schedules all count\n\u2022 If the employer kept no records, the burden shifts to them to disprove your hours (Lab. Code \u00A71174)',
      showIf: (answers) => answers.wage_type === 'regular_wages',
    },
    {
      id: 'overtime_info',
      type: 'info',
      prompt:
        'UNPAID OVERTIME (Lab. Code \u00A7510):\n\u2022 California overtime is MORE generous than federal law:\n  \u2014 1.5x pay after 8 hours in a DAY (not just 40/week like federal)\n  \u2014 1.5x pay after 40 hours in a WEEK\n  \u2014 2x pay after 12 hours in a DAY\n  \u2014 7th consecutive day in a workweek: first 8 hrs at 1.5x, after 8 hrs at 2x\n\u2022 Misclassification is common \u2014 your employer may have wrongly labeled you "exempt"\n\u2022 To be truly exempt in CA, you must: (1) earn at least 2x minimum wage for full-time, (2) spend 50%+ of time on exempt duties, AND (3) exercise independent judgment\n\u2022 SOL: 3 years for unpaid overtime (CCP \u00A7338(a))',
      showIf: (answers) => answers.wage_type === 'overtime',
    },
    {
      id: 'minimum_wage_info',
      type: 'info',
      prompt:
        'MINIMUM WAGE VIOLATIONS (Lab. Code \u00A71182.12):\n\u2022 Statewide minimum: $16.90/hr (2026)\n\u2022 Many cities require more \u2014 check your city\'s local ordinance\n\u2022 Fast food workers: $20/hr minimum\n\u2022 Healthcare workers: $18\u2013$24/hr depending on facility\n\u2022 Tips do NOT count toward minimum wage in California (unlike federal law)\n\u2022 No "training wage" or "youth wage" exceptions in CA\n\u2022 Piece-rate workers must still earn at least minimum wage for all hours\n\u2022 Penalties: Lab. Code \u00A71197.1 provides liquidated damages equal to the unpaid wages PLUS interest',
      showIf: (answers) => answers.wage_type === 'minimum_wage',
    },
    {
      id: 'meal_rest_info',
      type: 'info',
      prompt:
        'MEAL & REST BREAK VIOLATIONS:\n\nMEAL BREAKS (Lab. Code \u00A7512):\n\u2022 30-minute unpaid meal break before the end of the 5th hour of work\n\u2022 Second 30-minute meal break before the end of the 10th hour\n\u2022 Must be duty-free \u2014 if you work through it or stay on-call, it does not count\n\u2022 Penalty: 1 hour of pay at your regular rate for each day a meal break was missed\n\nREST BREAKS (Lab. Code \u00A7226.7):\n\u2022 10-minute paid rest break for every 4 hours worked (or major fraction thereof)\n\u2022 Must be uninterrupted and duty-free\n\u2022 Penalty: 1 hour of pay at your regular rate for each day a rest break was missed\n\nThese premiums are considered "wages" and are subject to waiting time penalties if unpaid at separation.',
      showIf: (answers) => answers.wage_type === 'meal_rest',
    },
    {
      id: 'commission_info',
      type: 'info',
      prompt:
        'UNPAID COMMISSION (Lab. Code \u00A7\u00A7200, 2751):\n\u2022 Commission IS wages under California law\n\u2022 Employers MUST provide a written commission agreement (Lab. Code \u00A72751)\n\u2022 If no written agreement exists, any verbal promise of commission is still enforceable\n\u2022 Employer cannot retroactively change commission terms for work already performed\n\u2022 Upon termination, all earned commissions must be paid \u2014 even if the "commission period" hasn\'t ended\n\u2022 If commissions are calculable at termination, they are due immediately (fired) or at last day/72 hrs (quit)',
      showIf: (answers) => answers.wage_type === 'commission',
    },
    {
      id: 'final_paycheck_info',
      type: 'info',
      prompt:
        'FINAL PAYCHECK RULES (Lab. Code \u00A7\u00A7201\u2013203):\n\n\u2022 FIRED or laid off: Final paycheck due IMMEDIATELY at time of termination (\u00A7201)\n\u2022 QUIT with 72+ hours notice: Final paycheck due on your last day of work (\u00A7202)\n\u2022 QUIT without notice: Final paycheck due within 72 hours (\u00A7202)\n\u2022 Final paycheck must include ALL earned wages, accrued vacation/PTO, and any earned commissions\n\nWAITING TIME PENALTIES (\u00A7203):\nIf the employer is late, you are owed your DAILY RATE OF PAY for each day the paycheck is late, up to 30 days. This can add up to a full month of extra wages as a penalty.\n\nExample: If you earn $200/day and your final paycheck is 30+ days late, that is $6,000 in waiting time penalties alone.',
      showIf: (answers) => answers.wage_type === 'final_paycheck',
    },
    {
      id: 'tips_info',
      type: 'info',
      prompt:
        'TIPS & GRATUITIES (Lab. Code \u00A7\u00A7350\u2013356):\n\u2022 Tips belong to the employee \u2014 employers cannot take any portion\n\u2022 Employers cannot credit tips toward minimum wage (unlike federal law)\n\u2022 Tip pooling is allowed ONLY among employees who provide direct service\n\u2022 Managers and supervisors cannot participate in tip pools\n\u2022 Employers who steal tips face penalties AND must repay the full amount\n\u2022 Service charges are NOT tips unless the employer voluntarily distributes them as such',
      showIf: (answers) => answers.wage_type === 'tips',
    },
    {
      id: 'expense_info',
      type: 'info',
      prompt:
        'UNREIMBURSED BUSINESS EXPENSES (Lab. Code \u00A72802):\n\u2022 California requires employers to reimburse ALL necessary business expenses\n\u2022 This includes: mileage, cell phone used for work, tools, uniforms, home office costs\n\u2022 The employer cannot push business costs onto employees\n\u2022 No written policy is required \u2014 the obligation exists by statute\n\u2022 SOL: 3 years (some courts allow 4 years under Bus. & Prof. Code \u00A717200)',
      showIf: (answers) => answers.wage_type === 'expense_reimbursement',
    },
    {
      id: 'multiple_info',
      type: 'info',
      prompt:
        'MULTIPLE VIOLATIONS:\nMultiple types of wage theft often occur together. California law allows you to recover for ALL violations in a single claim. Common combinations:\n\u2022 Unpaid overtime + missed meal/rest breaks\n\u2022 Minimum wage violations + no paystubs (Lab. Code \u00A7226)\n\u2022 Final paycheck violations + waiting time penalties\n\u2022 Misclassification as exempt or independent contractor affecting multiple wage categories\n\nDocument each type separately. Each violation has its own penalty, and they stack.',
      showIf: (answers) => answers.wage_type === 'multiple',
    },

    // === Employment classification ===
    {
      id: 'employment_status',
      type: 'single_choice',
      prompt: 'How were you classified by this employer?',
      helpText:
        'Misclassification is one of the most common wage theft tactics in California. Many workers labeled as independent contractors are actually employees entitled to full protections.',
      options: [
        { value: 'w2_employee', label: 'W-2 employee' },
        { value: 'independent_contractor', label: 'Independent contractor (1099)' },
        { value: 'unsure', label: 'Not sure' },
      ],
    },
    {
      id: 'misclassification_info',
      type: 'info',
      prompt:
        'MISCLASSIFICATION (Lab. Code \u00A72775, AB 5 / ABC Test):\nCalifornia uses the strict ABC test. You are an employee UNLESS the employer proves ALL three:\n\n(A) You are free from the company\'s control and direction\n(B) You perform work outside the company\'s usual business\n(C) You have an independently established trade or business\n\nIf ANY prong fails, you are an employee entitled to minimum wage, overtime, meal/rest breaks, workers\' comp, and unemployment insurance. Misclassification itself is a Labor Code violation with penalties of $5,000\u2013$25,000 per violation.',
      showIf: (answers) =>
        answers.employment_status === 'independent_contractor' ||
        answers.employment_status === 'unsure',
    },

    // === Amount owed ===
    {
      id: 'amount_owed',
      type: 'text',
      prompt: 'How much do you believe you are owed in unpaid wages? (approximate dollar amount)',
      placeholder: 'e.g. $5,000',
      helpText:
        'Include unpaid wages only. Penalties and interest will be calculated separately and can significantly increase your total recovery.',
    },

    // === Statute of limitations ===
    {
      id: 'sol_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS FOR CALIFORNIA WAGE CLAIMS:\n\n\u2022 3 YEARS \u2014 Unpaid wages, overtime, minimum wage, meal/rest break premiums (CCP \u00A7338(a))\n\u2022 3 YEARS \u2014 Waiting time penalties (CCP \u00A7338)\n\u2022 4 YEARS \u2014 Breach of written employment contract (CCP \u00A7337)\n\u2022 4 YEARS \u2014 Claims under Unfair Competition Law (Bus. & Prof. Code \u00A717200) \u2014 this is a powerful tool that extends the recovery window by 1 year for most wage claims\n\u2022 1 YEAR \u2014 Wage statement violations, i.e. inaccurate paystubs (Lab. Code \u00A7226)\n\u2022 1 YEAR \u2014 PAGA penalties (Lab. Code \u00A72699(d))\n\nThe clock starts from the date of each violation (each missed paycheck is a separate violation).',
    },
    {
      id: 'last_violation_date',
      type: 'text',
      prompt: 'When did the most recent wage violation occur?',
      placeholder: 'MM/DD/YYYY',
      helpText:
        'This is the date of the last missed or short paycheck, the last missed meal/rest break, or your termination date for final paycheck claims.',
    },

    // === Filing path ===
    {
      id: 'filing_path',
      type: 'single_choice',
      prompt: 'How would you like to pursue your claim?',
      helpText:
        'California offers three main paths. The Labor Commissioner (DLSE) process is free and does not require an attorney.',
      options: [
        {
          value: 'dlse',
          label: 'Labor Commissioner / DLSE wage claim (free, no lawyer needed)',
        },
        { value: 'court', label: 'File a lawsuit in Superior Court' },
        {
          value: 'paga',
          label: 'PAGA action (sue as private attorney general for all affected employees)',
        },
        { value: 'unsure', label: 'Not sure which path to take' },
      ],
    },
    {
      id: 'dlse_info',
      type: 'info',
      prompt:
        'DLSE / LABOR COMMISSIONER WAGE CLAIM:\n\nThis is the most common path and it is FREE.\n\n1. FILE \u2014 Submit DLSE Form 1 (Initial Report or Claim) online, by email, by mail, or in person at any DLSE office\n2. CONFERENCE \u2014 Within 30\u201330+ days, the DLSE schedules a settlement conference between you and the employer. Many claims settle here.\n3. HEARING (Berman Hearing) \u2014 If not settled, a hearing officer reviews evidence and issues a decision. This is less formal than court \u2014 no jury, relaxed evidence rules.\n4. DECISION \u2014 The hearing officer issues an Order, Decision, or Award (ODA)\n5. APPEAL \u2014 Either side can appeal to Superior Court within 10 days for a trial de novo (new trial)\n\nBring: pay stubs, time records, employment agreement, any communications about wages, your own log of hours worked.\n\nWebsite: dir.ca.gov/dlse/howtofilewageclaim.htm',
      showIf: (answers) => answers.filing_path === 'dlse' || answers.filing_path === 'unsure',
    },
    {
      id: 'court_info',
      type: 'info',
      prompt:
        'FILING IN SUPERIOR COURT:\n\n\u2022 Small Claims Court: Claims up to $12,500 (no attorney allowed)\n\u2022 Limited Civil: $12,501\u2013$25,000\n\u2022 Unlimited Civil: Over $25,000\n\nAdvantages over DLSE:\n\u2022 Jury trial available\n\u2022 Full discovery (depositions, document requests, interrogatories)\n\u2022 Can pursue broader claims (breach of contract, fraud, UCL \u00A717200)\n\u2022 Attorney fees recoverable under Lab. Code \u00A7218.5 (prevailing employee)\n\nDisadvantages:\n\u2022 Filing fees ($75\u2013$435+)\n\u2022 More complex procedures\n\u2022 Slower timeline\n\u2022 May want an attorney for limited/unlimited civil',
      showIf: (answers) => answers.filing_path === 'court' || answers.filing_path === 'unsure',
    },
    {
      id: 'paga_info',
      type: 'info',
      prompt:
        'PAGA \u2014 PRIVATE ATTORNEYS GENERAL ACT (Lab. Code \u00A7\u00A72698\u20132699.8):\n\nPAGA allows you to sue your employer on behalf of the State of California for Labor Code violations affecting you and other employees.\n\n2024 PAGA REFORMS (AB 2288 / SB 92, effective for notices filed on/after June 19, 2024):\n\u2022 You must have PERSONALLY SUFFERED each violation you allege (stricter standing)\n\u2022 Penalty split: 35% to employees / 65% to the state (up from 25/75)\n\u2022 Employers with <100 employees can submit a confidential cure proposal to LWDA within 33 days\n\u2022 Penalties capped at 15% if employer took reasonable compliance steps BEFORE the notice; 30% if within 60 days after\n\nPROCESS:\n1. Send written notice to LWDA and employer describing the violations\n2. Wait 65 days (LWDA may investigate or decline)\n3. If LWDA does not act, you may file suit in Superior Court\n\nPAGA is powerful but complex \u2014 strongly consider consulting an employment attorney.\nPenalties: $100/employee/pay period (first violation), $200/employee/pay period (subsequent).\nSOL: 1 year from the date of violation.',
      showIf: (answers) => answers.filing_path === 'paga' || answers.filing_path === 'unsure',
    },

    // === Retaliation ===
    {
      id: 'retaliation',
      type: 'yes_no',
      prompt:
        'Has your employer retaliated against you (or threatened to) for complaining about unpaid wages?',
      helpText:
        'Retaliation includes: firing, demotion, reduced hours, threats, intimidation, or any adverse action because you complained about wages.',
    },
    {
      id: 'retaliation_info',
      type: 'info',
      prompt:
        'RETALIATION IS ILLEGAL (Lab. Code \u00A798.6):\n\n\u2022 It is a crime for an employer to retaliate against you for filing or threatening to file a wage claim\n\u2022 Rebuttable presumption of retaliation if adverse action occurs within 90 days of filing\n\u2022 Remedies: reinstatement, back pay, lost wages and benefits, and penalties up to $10,000 per violation\n\u2022 You can file a retaliation complaint with the Labor Commissioner (separate from your wage claim)\n\u2022 If you were fired for complaining about wages, you may also have a wrongful termination claim\n\nDocument everything: save texts, emails, write down verbal threats with dates and witnesses.',
      showIf: (answers) => answers.retaliation === 'yes',
    },

    // === Paystub violations ===
    {
      id: 'paystub_issues',
      type: 'yes_no',
      prompt:
        'Did your employer fail to provide accurate, itemized pay stubs?',
      helpText:
        'California law requires every paystub to show: gross wages, total hours, deductions, net pay, pay period dates, employer name/address, and your name + last 4 of SSN.',
    },
    {
      id: 'paystub_info',
      type: 'info',
      prompt:
        'WAGE STATEMENT VIOLATIONS (Lab. Code \u00A7226):\n\u2022 Employers must provide itemized wage statements each pay period\n\u2022 Penalties: $50 for the first violation, $100 for each subsequent violation, up to $4,000 total\n\u2022 If the violation was knowing and intentional, you can also recover actual damages and attorney fees\n\u2022 SOL: 1 year for the penalty claim\n\u2022 This is a standalone claim that stacks on top of your unpaid wage claim',
      showIf: (answers) => answers.paystub_issues === 'yes',
    },

    // === Damages overview ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'TOTAL DAMAGES YOU MAY RECOVER IN CALIFORNIA:\n\n1. UNPAID WAGES \u2014 The full amount owed\n2. INTEREST \u2014 10% per year on unpaid wages (Lab. Code \u00A7218.6)\n3. LIQUIDATED DAMAGES \u2014 Equal to the unpaid wages for minimum wage and overtime violations (Lab. Code \u00A71194.2) \u2014 this DOUBLES your recovery\n4. WAITING TIME PENALTIES \u2014 Up to 30 days of daily wages if final paycheck was late (\u00A7203)\n5. MEAL/REST BREAK PREMIUMS \u2014 1 hour of pay per day per violation (\u00A7\u00A7226.7, 512)\n6. PAYSTUB PENALTIES \u2014 Up to $4,000 (\u00A7226)\n7. PAGA PENALTIES \u2014 $100\u2013$200 per employee per pay period (\u00A72699)\n8. ATTORNEY FEES \u2014 Recoverable by prevailing employee (\u00A7218.5)\n9. UCL RESTITUTION \u2014 Additional recovery under Bus. & Prof. Code \u00A717200 (4-year lookback)\n\nExample: $10,000 in unpaid minimum wages could yield $10,000 wages + $10,000 liquidated damages + interest + waiting time penalties + paystub penalties = $25,000+ total.',
    },

    // === Evidence gathering ===
    {
      id: 'evidence_info',
      type: 'info',
      prompt:
        'EVIDENCE TO GATHER NOW:\n\n1. PAY STUBS \u2014 Every one you have. Request copies from employer if missing (Lab. Code \u00A7226(b) \u2014 they must provide within 21 days).\n2. TIME RECORDS \u2014 Your own notes, phone screenshots, GPS data, text messages about schedule.\n3. EMPLOYMENT DOCUMENTS \u2014 Offer letter, employment agreement, handbook, commission plan.\n4. COMMUNICATIONS \u2014 Emails, texts, voicemails about pay, hours, or complaints about wages.\n5. BANK RECORDS \u2014 Deposit history showing actual amounts received.\n6. WITNESS INFORMATION \u2014 Names and contact info of coworkers who experienced the same violations.\n7. PHOTOS \u2014 Work schedules posted at the workplace, time clock records.\n\nIf the employer failed to keep records, the burden shifts to THEM to prove they paid correctly (Lab. Code \u00A71174).',
    },

    // === Next steps ===
    {
      id: 'next_steps',
      type: 'info',
      prompt:
        'YOUR NEXT STEPS:\n\n1. Calculate total unpaid wages for each violation type\n2. Check the statute of limitations \u2014 act quickly if you are near the 3-year deadline\n3. Gather all evidence (pay stubs, time records, communications)\n4. Choose your filing path:\n   \u2014 DLSE wage claim (free, no lawyer): dir.ca.gov/dlse/howtofilewageclaim.htm\n   \u2014 Superior Court lawsuit: consult an employment attorney\n   \u2014 PAGA action: consult an employment attorney\n5. If you were retaliated against, file a separate retaliation complaint with the Labor Commissioner\n6. Do NOT sign any severance or release without understanding what claims you are giving up\n\nMany employment attorneys take wage theft cases on contingency (no upfront cost) because California law awards attorney fees to prevailing employees.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Wage type
    if (answers.wage_type) {
      const types: Record<string, string> = {
        regular_wages: 'Regular wages',
        overtime: 'Overtime pay',
        minimum_wage: 'Minimum wage violations',
        meal_rest: 'Meal/rest break violations',
        commission: 'Commission',
        final_paycheck: 'Final paycheck',
        tips: 'Tips/gratuities',
        expense_reimbursement: 'Unreimbursed business expenses',
        multiple: 'Multiple types of wage violations',
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

    // Misclassification flag
    if (
      answers.employment_status === 'independent_contractor' ||
      answers.employment_status === 'unsure'
    ) {
      items.push({
        status: 'info',
        text: 'Possible misclassification as independent contractor. Apply the ABC test (Lab. Code \u00A72775) \u2014 if any prong fails, you are an employee entitled to full wage protections.',
      })
    }

    // Amount owed
    if (answers.amount_owed) {
      items.push({
        status: 'done',
        text: `Estimated unpaid wages: ${answers.amount_owed}. Additional penalties (liquidated damages, waiting time, meal/rest premiums) may significantly increase total recovery.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate the total amount of unpaid wages.',
      })
    }

    // SOL check
    if (answers.last_violation_date) {
      const parts = answers.last_violation_date.split('/')
      if (parts.length === 3) {
        const violationDate = new Date(`${parts[2]}-${parts[0]}-${parts[1]}`)
        const now = new Date()
        const yearsDiff =
          (now.getTime() - violationDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)

        if (yearsDiff >= 4) {
          items.push({
            status: 'info',
            text: `Based on last violation date ${answers.last_violation_date}, approximately ${Math.floor(yearsDiff)} years have passed. Both the 3-year wage claim SOL (CCP \u00A7338) and 4-year UCL SOL (\u00A717200) appear to have EXPIRED. Your claim may be time-barred.`,
          })
        } else if (yearsDiff >= 3) {
          items.push({
            status: 'info',
            text: `Based on last violation date ${answers.last_violation_date}, the 3-year SOL for direct wage claims (CCP \u00A7338) may have expired \u2014 but you may still recover under the 4-year UCL window (Bus. & Prof. Code \u00A717200). Act immediately.`,
          })
        } else {
          const remainingMonths = Math.ceil((3 - yearsDiff) * 12)
          items.push({
            status: 'info',
            text: `Based on last violation date ${answers.last_violation_date}, approximately ${Math.floor(yearsDiff * 12)} months have passed. SOL has NOT expired \u2014 approximately ${remainingMonths} months remain on the 3-year deadline. File promptly.`,
          })
        }
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Enter the last violation date to calculate whether the SOL has expired.',
      })
    }

    // Filing path
    if (answers.filing_path) {
      const paths: Record<string, string> = {
        dlse: 'Filing path: DLSE / Labor Commissioner wage claim (free, no lawyer needed). File at dir.ca.gov/dlse/howtofilewageclaim.htm.',
        court: 'Filing path: Superior Court lawsuit. Consider consulting an employment attorney.',
        paga: 'Filing path: PAGA action. Must send notice to LWDA first, then wait 65 days. Consult an employment attorney.',
        unsure: 'Filing path: Not yet decided. DLSE wage claim is the simplest starting point (free, no lawyer needed).',
      }
      items.push({
        status: answers.filing_path === 'unsure' ? 'needed' : 'done',
        text: paths[answers.filing_path],
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing path: DLSE wage claim (free), Superior Court lawsuit, or PAGA action.',
      })
    }

    // Retaliation
    if (answers.retaliation === 'yes') {
      items.push({
        status: 'needed',
        text: 'Retaliation reported. File a separate retaliation complaint with the Labor Commissioner under Lab. Code \u00A798.6. Document all adverse actions with dates and witnesses.',
      })
    }

    // Paystub violations
    if (answers.paystub_issues === 'yes') {
      items.push({
        status: 'info',
        text: 'Paystub violations (\u00A7226): Additional penalties up to $4,000. Include this in your wage claim.',
      })
    }

    // Evidence reminder
    items.push({
      status: 'needed',
      text: 'Gather evidence: pay stubs, time records, employment documents, communications about wages, bank deposit records, and witness contact information.',
    })

    return items
  },
}
