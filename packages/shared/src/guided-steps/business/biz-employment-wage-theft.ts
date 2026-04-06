import type { GuidedStepConfig } from '../types'

export const bizEmploymentWageTheftConfig: GuidedStepConfig = {
  title: 'Recovering Unpaid Wages',
  reassurance:
    'Texas law requires employers to pay what they owe. If they don\'t, you may recover up to triple damages.',

  questions: [
    {
      id: 'payday_law_info',
      type: 'info',
      prompt:
        'TEXAS PAYDAY LAW (Labor Code Ch. 61):\n- Employers MUST pay wages on regular paydays\n- If terminated: wages due within 6 days (fired) or next regular payday (quit)\n- Failure to pay: file a claim with Texas Workforce Commission (TWC)\n- TWC can order payment + penalties\n- You can also sue in court for unpaid wages',
    },
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
        { value: 'vacation_pay', label: 'Vacation or PTO pay' },
      ],
    },
    {
      id: 'regular_wages_info',
      type: 'info',
      prompt:
        'UNPAID REGULAR WAGES:\n- Texas Payday Law requires payment on scheduled paydays\n- If your employer misses a payday, document the exact dates and amounts\n- Keep your own records of hours worked (even notes on your phone count)\n- TWC can order the employer to pay wages owed plus penalties\n- In court, you may also recover attorney fees',
      showIf: (answers) => answers.wage_type === 'regular_wages',
    },
    {
      id: 'overtime_info',
      type: 'info',
      prompt:
        'UNPAID OVERTIME:\n- Federal law (FLSA) requires time-and-a-half for hours over 40/week\n- Texas has NO state overtime law — claims are under federal FLSA\n- NOT all employees qualify: you must be "non-exempt"\n- Exempt employees (salaried managers, professionals earning $35,568+/year) generally don\'t get overtime\n- Misclassification is common — many employers wrongly classify workers as exempt\n- FLSA allows 2 years of back pay (3 years if willful violation)\n- You can also recover "liquidated damages" (double the back pay)',
      showIf: (answers) => answers.wage_type === 'overtime',
    },
    {
      id: 'commission_info',
      type: 'info',
      prompt:
        'UNPAID COMMISSION:\n- Commission is considered "wages" under the Texas Payday Law IF:\n  - There is a written agreement specifying commission terms, OR\n  - There is an established pattern of commission payments\n- Your employer CANNOT change commission terms retroactively for work already performed\n- If you earned the commission before leaving, it must be paid\n- Document: your commission agreement, sales records, and any communications about commission calculations',
      showIf: (answers) => answers.wage_type === 'commission',
    },
    {
      id: 'bonus_info',
      type: 'info',
      prompt:
        'UNPAID BONUS:\n- Bonuses are "wages" under Texas law ONLY IF they are:\n  - Part of a written agreement or employment contract, OR\n  - Promised as part of compensation (not purely discretionary)\n- Discretionary bonuses (employer chooses whether to pay) are generally NOT enforceable\n- Performance bonuses tied to specific goals ARE enforceable if the goals were met\n- Key question: was the bonus promised in writing or as a condition of employment?',
      showIf: (answers) => answers.wage_type === 'bonus',
    },
    {
      id: 'final_paycheck_info',
      type: 'info',
      prompt:
        'FINAL PAYCHECK:\n- FIRED: Employer must pay within 6 calendar days\n- QUIT: Employer must pay by the next regular payday\n- This includes all earned wages, not just the final period\n- If employer doesn\'t pay: file a TWC wage claim immediately\n- Texas Payday Law penalties apply for late final paychecks',
      showIf: (answers) => answers.wage_type === 'final_paycheck',
    },
    {
      id: 'vacation_pay_info',
      type: 'info',
      prompt:
        'VACATION / PTO PAY:\n- Texas does NOT require employers to provide vacation or PTO\n- BUT if the employer has a policy providing it, they must follow their own policy\n- Check the employee handbook: does it say unused PTO is paid out at termination?\n- If the policy says "use it or lose it" — that may be enforceable\n- If the policy promises payout — the employer must pay it as "wages" under the Payday Law\n- Key document: the written PTO/vacation policy in your handbook or offer letter',
      showIf: (answers) => answers.wage_type === 'vacation_pay',
    },
    {
      id: 'amount_owed',
      type: 'text',
      prompt: 'How much do you believe you are owed? (approximate dollar amount)',
      placeholder: 'e.g. $3,500',
    },
    {
      id: 'twc_filed',
      type: 'yes_no',
      prompt: 'Have you filed a wage claim with the Texas Workforce Commission (TWC)?',
    },
    {
      id: 'twc_how_to_file',
      type: 'info',
      prompt:
        'HOW TO FILE WITH TWC:\n1. Go to twc.texas.gov and click \'File a Wage Claim\'\n2. You have 180 days from the missed payment to file\n3. Include: employer name, dates worked, wages owed, pay dates missed\n4. TWC investigates and can order payment\n5. If TWC can\'t resolve: they issue a right to sue',
      showIf: (answers) => answers.twc_filed === 'no',
    },
    {
      id: 'twc_filed_info',
      type: 'info',
      prompt:
        'Good. TWC will investigate your claim. If the employer doesn\'t pay after a TWC order, you can enforce it in court. If TWC dismisses or can\'t resolve the claim, you still have the right to sue independently.',
      showIf: (answers) => answers.twc_filed === 'yes',
    },
    {
      id: 'flsa_info',
      type: 'info',
      prompt:
        'FEDERAL OPTION (FLSA):\nIf you worked overtime (40+ hours/week) and weren\'t paid time-and-a-half, you may have a claim under the federal Fair Labor Standards Act. FLSA allows:\n- 2 years of back pay (3 years if employer acted willfully)\n- Liquidated damages (double the back pay)\n- Attorney fees',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.wage_type) {
      const types: Record<string, string> = {
        regular_wages: 'Regular wages',
        overtime: 'Overtime pay',
        commission: 'Commission',
        bonus: 'Bonus',
        final_paycheck: 'Final paycheck',
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

    if (answers.twc_filed === 'yes') {
      items.push({
        status: 'done',
        text: 'TWC wage claim filed.',
      })
    } else if (answers.twc_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File a TWC wage claim at twc.texas.gov. Deadline: 180 days from the missed payment.',
      })
    }

    if (answers.wage_type === 'overtime') {
      items.push({
        status: 'info',
        text: 'Overtime claims may also be filed under federal FLSA for up to double back pay plus attorney fees.',
      })
    }

    items.push({
      status: 'info',
      text: 'Gather pay stubs, time records, employment agreements, and any communications about wages owed.',
    })

    return items
  },
}
