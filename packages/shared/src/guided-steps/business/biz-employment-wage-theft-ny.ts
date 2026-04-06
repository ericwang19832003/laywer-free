import type { GuidedStepConfig } from '../types'

export const bizEmploymentWageTheftNyConfig: GuidedStepConfig = {
  title: 'New York Wage Theft Dispute Guide',
  reassurance:
    'New York has some of the strongest wage theft protections in the country. You can recover up to double your unpaid wages plus attorney fees. We will walk you through every step.',

  questions: [
    // === Overview of NY Wage Theft Law ===
    {
      id: 'ny_wage_law_overview',
      type: 'info',
      prompt:
        'NEW YORK WAGE THEFT LAW OVERVIEW\n\nNew York Labor Law Article 6 (sections 190-198) governs the payment of wages. Key protections:\n\n- Employers must pay all wages earned on regular paydays\n- The Wage Theft Prevention Act (WTPA) requires written wage notices at hire and pay stubs every pay period\n- Liquidated damages: 100% of wages owed (effectively double damages) under Lab. Law section 198(1-a)\n- Attorney fees: recoverable by the employee if they prevail\n- Statute of limitations: 6 years for unpaid wage claims\n- Criminal penalties: wage theft is treated as larceny under NY Penal Law\n- Retaliation is prohibited under Lab. Law section 215',
    },

    // === Worker Classification ===
    {
      id: 'worker_type',
      type: 'single_choice',
      prompt: 'What is your employment status?',
      helpText:
        'Your classification determines which protections apply. Misclassification as an independent contractor is a common tactic employers use to avoid paying proper wages, overtime, and providing required notices.',
      options: [
        { value: 'w2_employee', label: 'W-2 employee (full-time or part-time)' },
        { value: 'independent_contractor', label: 'Independent contractor (1099)' },
        { value: 'freelancer', label: 'Freelancer' },
        { value: 'misclassified', label: 'I believe I am misclassified as a contractor' },
        { value: 'unsure_classification', label: 'I am not sure' },
      ],
    },
    {
      id: 'misclassification_info',
      type: 'info',
      prompt:
        'WORKER MISCLASSIFICATION\n\nIf you are treated like an employee but classified as an independent contractor, you may be misclassified. New York uses an "economic reality" test. Signs of misclassification:\n\n- The company controls when, where, and how you work\n- You use the company\'s tools and equipment\n- You work exclusively or primarily for one company\n- You cannot hire your own helpers\n- The company sets your pay rate\n\nMisclassified workers can recover ALL employee protections: minimum wage, overtime, wage notices, and pay stubs. File a complaint with the NY DOL or include misclassification in your wage claim.',
      showIf: (answers) =>
        answers.worker_type === 'misclassified' || answers.worker_type === 'unsure_classification',
    },
    {
      id: 'freelancer_info',
      type: 'info',
      prompt:
        'FREELANCER PROTECTIONS\n\nNew York has specific protections for freelance workers:\n\nNYC Freelance Isn\'t Free Act (Local Law 140 of 2016):\n- Applies to contracts worth $800 or more\n- Hiring party MUST provide a written contract\n- Payment must be made by the date in the contract, or within 30 days of completion if no date specified\n- Double damages for failure to pay or late payment\n- Attorney fees recoverable\n- Retaliation prohibited\n- File a complaint with NYC DCWP or sue in court\n\nNY State Freelance Isn\'t Free Act (effective 2024):\n- Extends similar protections statewide for contracts worth $800 or more\n- Written contract required\n- Payment within 30 days of completion\n- Double damages, attorney fees, and injunctive relief available\n- Enforced by the NY DOL',
      showIf: (answers) => answers.worker_type === 'freelancer',
    },

    // === Type of Wage Theft ===
    {
      id: 'wage_type',
      type: 'single_choice',
      prompt: 'What type of wages are unpaid or underpaid?',
      helpText:
        'New York law covers many forms of wage theft. Select the primary issue.',
      options: [
        { value: 'regular_wages', label: 'Regular wages (hourly or salary)' },
        { value: 'minimum_wage', label: 'Minimum wage violation (paid below minimum)' },
        { value: 'overtime', label: 'Overtime pay (worked over 40 hours/week)' },
        { value: 'spread_of_hours', label: 'Spread of hours pay (workday over 10 hours)' },
        { value: 'tips', label: 'Tip theft or illegal tip deductions' },
        { value: 'final_paycheck', label: 'Final paycheck not received' },
        { value: 'illegal_deductions', label: 'Illegal deductions from pay' },
        { value: 'wage_notice', label: 'Missing wage notice or pay stubs (WTPA violations)' },
        { value: 'multiple', label: 'Multiple types of wage theft' },
      ],
    },

    // === Minimum Wage Info ===
    {
      id: 'minimum_wage_info',
      type: 'info',
      prompt:
        'NEW YORK MINIMUM WAGE RATES\n\nAs of January 1, 2026:\n- NYC, Long Island, and Westchester County: $17.00/hour\n- Rest of New York State: $16.00/hour\n\n2025 rates (for calculating prior underpayment):\n- NYC, Long Island, and Westchester County: $16.50/hour\n- Rest of New York State: $15.50/hour\n\nTipped workers have lower cash minimums but must receive at least the full minimum wage when tips are included. If tips do not bring you to the full minimum wage, the employer must make up the difference.\n\nFuture increases will be indexed to inflation (CPI-W for the Northeast Region).\n\nNote: Some cities may enact higher local minimums. Always check the current rate for your location.',
      showIf: (answers) => answers.wage_type === 'minimum_wage' || answers.wage_type === 'multiple',
    },

    // === Overtime Info ===
    {
      id: 'overtime_info',
      type: 'info',
      prompt:
        'NEW YORK OVERTIME LAW\n\nNY Labor Law requires overtime pay at 1.5 times your regular rate for all hours worked over 40 in a workweek.\n\nKey rules:\n- The overtime rate applies to EACH hour over 40, not just the average\n- Employers cannot average hours across two or more weeks\n- Overtime must be paid regardless of whether the employer "authorized" it\n- Salaried employees may still be entitled to overtime unless they meet a specific exemption (executive, administrative, professional, or outside sales)\n\nExemption salary threshold (2026): employees must earn above the applicable salary threshold to be exempt from overtime. Misclassification as "exempt" is one of the most common forms of wage theft.\n\nThe FLSA (federal law) also requires overtime — you can file under both state and federal law.',
      showIf: (answers) => answers.wage_type === 'overtime' || answers.wage_type === 'multiple',
    },

    // === Spread of Hours Info ===
    {
      id: 'spread_of_hours_info',
      type: 'info',
      prompt:
        'SPREAD OF HOURS PAY (12 NYCRR 142-2.4)\n\nIf your workday (from start to finish, including breaks) exceeds 10 hours, your employer must pay you an extra hour at the basic minimum wage rate. This is called "spread of hours" pay.\n\nExample: If you work from 8 AM to 7 PM (11-hour spread, even with a 1-hour break), you are owed 1 extra hour at the minimum wage rate in addition to your regular pay.\n\nThis applies to ALL employees in covered industries (hospitality, retail, building service), regardless of how many hours you actually worked during that spread. Many employers fail to pay this.',
      showIf: (answers) => answers.wage_type === 'spread_of_hours' || answers.wage_type === 'multiple',
    },

    // === Final Paycheck Info ===
    {
      id: 'final_paycheck_info',
      type: 'info',
      prompt:
        'FINAL PAYCHECK (Lab. Law section 191)\n\nRegardless of the reason for separation (fired, quit, laid off), your final paycheck is due on the NEXT REGULAR PAYDAY.\n\nUnlike some states that require immediate payment upon termination, New York allows the employer until the next scheduled payday. However:\n\n- ALL earned wages must be included (regular pay, overtime, commissions, accrued vacation if the employer\'s policy provides for payout)\n- The employer CANNOT withhold your final paycheck for any reason (not for returning equipment, not for alleged debts)\n- If the employer fails to pay, you can file a DOL complaint or sue for the wages plus liquidated damages\n\nManual workers (those performing physical labor) must be paid weekly, and no later than 7 days after the end of the pay period.',
      showIf: (answers) => answers.wage_type === 'final_paycheck',
    },

    // === Illegal Deductions Info ===
    {
      id: 'illegal_deductions_info',
      type: 'info',
      prompt:
        'ILLEGAL DEDUCTIONS (Lab. Law section 193)\n\nNew York law strictly limits what an employer can deduct from your pay. Permitted deductions include:\n- Taxes and FICA\n- Insurance premiums you authorized in writing\n- Union dues\n- 401(k) or retirement contributions you authorized\n\nILLEGAL deductions include:\n- Cash register shortages\n- Breakage or damage to equipment\n- Customer walkouts (dine and dash)\n- Cost of uniforms or tools\n- Any deduction that brings you below minimum wage\n- Deductions for alleged poor performance\n\nAny unauthorized or illegal deduction is wage theft. You can recover the deducted amount plus liquidated damages.',
      showIf: (answers) => answers.wage_type === 'illegal_deductions',
    },

    // === WTPA Notice and Pay Stub Violations ===
    {
      id: 'wtpa_violations_info',
      type: 'info',
      prompt:
        'WAGE THEFT PREVENTION ACT (WTPA) VIOLATIONS\n\nThe WTPA (Lab. Law section 195) requires two things from employers:\n\n1. WAGE NOTICE AT HIRE (section 195(1)):\n- Written notice of: pay rate, overtime rate, pay frequency, employer name/address/phone, allowances claimed (tips, meals, lodging)\n- Must be in English AND the employee\'s primary language\n- Employee must sign acknowledgment\n- Penalty for failure: $50 per workday, up to $5,000 per employee\n\n2. PAY STUBS EVERY PAY PERIOD (section 195(3)):\n- Must show: dates of work, hours worked, gross and net wages, rate of pay, deductions, allowances claimed\n- Penalty for failure: $250 per workday, up to $5,000 per employee\n\nThese penalties are recoverable even if you were paid the correct wages. They are separate from any unpaid wage claim.',
      showIf: (answers) => answers.wage_type === 'wage_notice' || answers.wage_type === 'multiple',
    },

    // === Statute of Limitations ===
    {
      id: 'sol_info',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS: 6 YEARS (CPLR section 213; Lab. Law section 198(3))\n\nYou can recover unpaid wages going back 6 years from the date you file your claim. This is one of the longest wage theft statutes of limitations in the country.\n\nThe 6-year period applies to:\n- Unpaid wages\n- Overtime violations\n- Minimum wage violations\n- Spread of hours violations\n- Illegal deductions\n- WTPA notice and pay stub violations\n\nThe clock is tolled (paused) from the date you file a complaint with the DOL Commissioner or the Commissioner begins an investigation, whichever is earlier, until a final order is issued.\n\nDo not wait — the longer you delay, the more past wages fall outside the 6-year window.',
    },

    // === Amount Owed ===
    {
      id: 'amount_owed',
      type: 'text',
      prompt: 'How much do you believe you are owed in unpaid wages? (approximate dollar amount)',
      helpText:
        'Include all unpaid wages, overtime, spread of hours pay, and any illegal deductions. Do not include liquidated damages — those will be calculated automatically (up to 100% additional).',
      placeholder: 'e.g. $5,000',
    },

    // === Damages Calculation ===
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'WHAT YOU CAN RECOVER\n\nNew York wage theft claims allow you to recover:\n\n1. UNPAID WAGES: The full amount owed (up to 6 years back)\n\n2. LIQUIDATED DAMAGES: 100% of the unpaid wages (Lab. Law section 198(1-a)). This effectively doubles your recovery. The employer can only avoid liquidated damages by proving a good-faith basis for believing they complied with the law.\n\n3. WTPA PENALTIES (if applicable):\n   - Wage notice violation: $50/day, up to $5,000\n   - Pay stub violation: $250/day, up to $5,000\n\n4. PREJUDGMENT INTEREST: 9% per year (CPLR section 5004), running from the date each wage payment was due\n\n5. ATTORNEY FEES AND COSTS: Fully recoverable if you prevail\n\nExample: $10,000 in unpaid wages could yield $10,000 (wages) + $10,000 (liquidated damages) + up to $10,000 (WTPA penalties) + interest + attorney fees = $30,000+ total recovery.',
    },

    // === Filing Options ===
    {
      id: 'filing_path',
      type: 'single_choice',
      prompt: 'How do you want to pursue your claim?',
      helpText:
        'You have three main options. You can pursue a DOL complaint and a lawsuit simultaneously — they are not mutually exclusive.',
      options: [
        { value: 'dol_claim', label: 'File a wage claim with the NY Department of Labor (free)' },
        { value: 'court_lawsuit', label: 'File a lawsuit in court' },
        { value: 'small_claims', label: 'Small Claims Court (claims up to $10,000)' },
        { value: 'unsure_path', label: 'I am not sure which option is best' },
      ],
    },

    // === DOL Claim Process ===
    {
      id: 'dol_process_info',
      type: 'info',
      prompt:
        'NY DEPARTMENT OF LABOR WAGE CLAIM\n\nThis is the simplest and most common option. It is free and does not require an attorney.\n\nHow to file:\n1. Complete form LS-223 (Labor Standards Complaint Form) at dol.ny.gov\n2. Submit online, by mail, or in person at a DOL office\n3. Include supporting documents: pay stubs, time records, employment agreement, communications about pay\n4. DOL will conduct a pre-investigation review\n5. If accepted, you receive a case number and an investigator is assigned\n6. DOL investigates and can order the employer to pay wages owed plus interest and penalties\n\nEnforcement powers (expanded 2025-2026 budget):\n- DOL can place liens on employer property\n- DOL can issue warrants and seize financial assets\n- DOL can issue stop-work orders after a judgment\n\nTimeline: investigations can take several months. The DOL covers up to 6 years of back wages.\n\nNote: You can still file a court lawsuit even after filing with the DOL.',
      showIf: (answers) => answers.filing_path === 'dol_claim' || answers.filing_path === 'unsure_path',
    },

    // === Court Lawsuit ===
    {
      id: 'court_lawsuit_info',
      type: 'info',
      prompt:
        'COURT LAWSUIT FOR UNPAID WAGES\n\nYou can sue your employer in New York Supreme Court (the general trial court) for unpaid wages. This option is best for larger claims or when you want to recover liquidated damages, WTPA penalties, and attorney fees.\n\nWhere to file:\n- New York Supreme Court has unlimited jurisdiction\n- NYC Civil Court handles claims up to $50,000\n- County Court or City Court outside NYC\n\nWhat you need:\n- Summons and Complaint stating the facts (NY requires fact pleading under CPLR section 3013)\n- Causes of action: Lab. Law sections 190-198 (state), FLSA (federal, if applicable)\n- Filing fee: $210 (Supreme Court index number) + $95 (RJI)\n\nAdvantages of court over DOL:\n- You control the litigation timeline\n- You can conduct discovery (depositions, document demands)\n- Liquidated damages and WTPA penalties are more reliably awarded\n- Attorney fees make it possible to find a lawyer on contingency\n\nMany wage theft attorneys offer free consultations and work on contingency.',
      showIf: (answers) => answers.filing_path === 'court_lawsuit' || answers.filing_path === 'unsure_path',
    },

    // === Small Claims ===
    {
      id: 'small_claims_info',
      type: 'info',
      prompt:
        'SMALL CLAIMS COURT\n\nFor wage claims up to $10,000 (in NYC) or $5,000 (outside NYC), Small Claims Court is fast and informal.\n\n- Filing fee: $15-$20\n- No attorney required (and no attorney can represent you at trial)\n- Hearing typically within 30-60 days\n- Informal rules of evidence — bring your documents and tell the judge what happened\n- You can still claim liquidated damages (double damages) in Small Claims\n\nLimitations:\n- You are capped at $10,000 (NYC) or $5,000 (rest of state)\n- No discovery process\n- No jury trial\n- You waive amounts above the limit\n\nThis is a good option if your claim is straightforward and you want a quick resolution.',
      showIf: (answers) => answers.filing_path === 'small_claims' || answers.filing_path === 'unsure_path',
    },

    // === Retaliation Protection ===
    {
      id: 'retaliation_concern',
      type: 'yes_no',
      prompt: 'Are you concerned about retaliation from your employer for filing a claim?',
      helpText:
        'New York law prohibits employer retaliation against workers who complain about wage theft.',
    },
    {
      id: 'retaliation_info',
      type: 'info',
      prompt:
        'RETALIATION PROTECTION (Lab. Law section 215)\n\nIt is illegal for your employer to retaliate against you for:\n- Filing a wage claim or complaint\n- Testifying in a wage investigation\n- Complaining to your employer about unpaid wages\n- Discussing wages with coworkers\n\nRetaliation includes: firing, demotion, schedule reduction, threats, harassment, or any adverse employment action.\n\nIf your employer retaliates:\n- You can file a retaliation complaint with the NY DOL\n- You can sue in court for reinstatement, back pay, front pay, and liquidated damages up to $20,000\n- The employer faces a civil penalty of up to $10,000 per violation\n- Attorney fees are recoverable\n\nDocument everything: save emails, texts, and notes about any changes to your employment after you raise a wage complaint. Retaliation claims are often stronger than the underlying wage claim.',
      showIf: (answers) => answers.retaliation_concern === 'yes',
    },

    // === Criminal Penalties ===
    {
      id: 'criminal_info',
      type: 'info',
      prompt:
        'CRIMINAL PENALTIES FOR WAGE THEFT\n\nUnder the Wage Theft Prevention Act, wage theft is a criminal offense in New York. It is prosecuted as larceny under the Penal Law:\n\n- Petit larceny (under $1,000): Class A misdemeanor, up to 1 year in jail\n- Grand larceny 4th degree ($1,000-$3,000): Class E felony, up to 4 years in prison\n- Grand larceny 3rd degree ($3,000-$50,000): Class D felony, up to 7 years in prison\n- Grand larceny 2nd degree ($50,000-$1M): Class C felony, up to 15 years in prison\n\nTo report wage theft as a crime:\n- Contact the NY Attorney General\'s Labor Bureau\n- Contact your local District Attorney\'s office\n- The NY DOL can refer cases for criminal prosecution\n\nCriminal prosecution does not replace your civil claim — you can pursue both simultaneously.',
    },

    // === Evidence Gathering ===
    {
      id: 'evidence_checklist',
      type: 'info',
      prompt:
        'EVIDENCE CHECKLIST\n\nGather as much of the following as possible:\n\n- Pay stubs (or note their absence — that is itself a WTPA violation)\n- Time records, timesheets, clock-in/clock-out records\n- Your own log of hours worked (handwritten notes, phone calendar, texts, etc.)\n- Employment agreement, offer letter, or handbook\n- Wage notice received at hire (or note if none was given — another WTPA violation)\n- Bank statements showing deposits from the employer\n- Emails, texts, or messages about pay, hours, or schedule\n- Contact information for coworkers who can corroborate your hours or pay\n- Any written communications where the employer acknowledged the debt\n- W-2 or 1099 forms\n\nNew York law places the burden on the EMPLOYER to maintain accurate records of hours and wages. If they fail to keep records, the court may accept your reasonable estimates.',
    },

    // === Next Steps ===
    {
      id: 'has_attorney',
      type: 'yes_no',
      prompt: 'Do you have an attorney or plan to consult one?',
      helpText:
        'Because New York awards attorney fees to prevailing employees in wage theft cases, many employment attorneys take these cases on contingency (no upfront cost to you).',
    },
    {
      id: 'attorney_info',
      type: 'info',
      prompt:
        'FINDING A WAGE THEFT ATTORNEY\n\nBecause Lab. Law section 198 awards attorney fees to prevailing employees, many attorneys take wage theft cases on contingency — meaning you pay nothing unless you win.\n\nResources:\n- New York State Bar Association Lawyer Referral Service: nysba.org\n- NYC Bar Legal Referral Service: nycbar.org\n- Legal Aid Society (free legal help for low-income workers): legal-aid.org\n- Make the Road New York (immigrant worker rights): maketheroadny.org\n- National Employment Law Project: nelp.org\n\nWhen consulting an attorney, bring all your evidence and be prepared to discuss:\n- Your work schedule and hours\n- Your pay rate and how you were paid\n- When the underpayment started\n- Whether you received a wage notice at hire\n- Whether you receive proper pay stubs',
      showIf: (answers) => answers.has_attorney === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Worker classification
    if (answers.worker_type) {
      const typeLabels: Record<string, string> = {
        w2_employee: 'W-2 employee',
        independent_contractor: 'Independent contractor',
        freelancer: 'Freelancer',
        misclassified: 'Potentially misclassified worker',
        unsure_classification: 'Classification undetermined',
      }
      items.push({
        status: answers.worker_type === 'unsure_classification' ? 'needed' : 'done',
        text: `Worker status: ${typeLabels[answers.worker_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your employment classification (W-2 employee, contractor, or freelancer).',
      })
    }

    // Wage type
    if (answers.wage_type) {
      const wageLabels: Record<string, string> = {
        regular_wages: 'Unpaid regular wages',
        minimum_wage: 'Minimum wage violation',
        overtime: 'Unpaid overtime',
        spread_of_hours: 'Spread of hours violation',
        tips: 'Tip theft or illegal tip deductions',
        final_paycheck: 'Unpaid final paycheck',
        illegal_deductions: 'Illegal pay deductions',
        wage_notice: 'WTPA notice/pay stub violations',
        multiple: 'Multiple types of wage theft',
      }
      items.push({
        status: 'done',
        text: `Claim type: ${wageLabels[answers.wage_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the type of wage theft.',
      })
    }

    // Amount owed
    if (answers.amount_owed) {
      items.push({
        status: 'done',
        text: `Estimated unpaid wages: ${answers.amount_owed}. With liquidated damages (100%), potential recovery doubles to approximately ${answers.amount_owed} x 2 plus WTPA penalties and interest.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Calculate the total amount of unpaid wages.',
      })
    }

    // Filing path
    if (answers.filing_path) {
      const pathLabels: Record<string, string> = {
        dol_claim: 'NY DOL wage claim (free, no attorney needed)',
        court_lawsuit: 'Court lawsuit (Supreme Court or Civil Court)',
        small_claims: 'Small Claims Court (up to $10K in NYC, $5K outside)',
        unsure_path: 'Filing path not yet decided',
      }
      items.push({
        status: answers.filing_path === 'unsure_path' ? 'needed' : 'done',
        text: `Filing path: ${pathLabels[answers.filing_path]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing path: NY DOL claim, court lawsuit, or Small Claims Court.',
      })
    }

    // SOL reminder
    items.push({
      status: 'info',
      text: 'Statute of limitations: 6 years (CPLR section 213; Lab. Law section 198(3)). You can recover unpaid wages going back 6 years from the date you file.',
    })

    // Liquidated damages reminder
    items.push({
      status: 'info',
      text: 'Liquidated damages: 100% of unpaid wages (Lab. Law section 198(1-a)). Effectively doubles your recovery.',
    })

    // WTPA penalties
    if (answers.wage_type === 'wage_notice' || answers.wage_type === 'multiple') {
      items.push({
        status: 'info',
        text: 'WTPA penalties: $50/day (wage notice) and $250/day (pay stub), each up to $5,000. These are in addition to unpaid wages.',
      })
    }

    // Retaliation
    if (answers.retaliation_concern === 'yes') {
      items.push({
        status: 'info',
        text: 'Retaliation protection: Lab. Law section 215 prohibits employer retaliation. Document any adverse actions after raising a wage complaint.',
      })
    }

    // Attorney
    if (answers.has_attorney === 'yes') {
      items.push({
        status: 'done',
        text: 'Attorney retained or consultation planned.',
      })
    } else if (answers.has_attorney === 'no') {
      items.push({
        status: 'needed',
        text: 'Consult a wage theft attorney. Many work on contingency because Lab. Law section 198 awards attorney fees to prevailing employees.',
      })
    }

    // Evidence reminder
    items.push({
      status: 'needed',
      text: 'Gather evidence: pay stubs, time records, wage notices, employment agreements, bank statements, and communications about pay.',
    })

    return items
  },
}
