import type { GuidedStepConfig } from '../types'

export const bizPartnershipAccountingConfig: GuidedStepConfig = {
  title: 'Partnership Accounting & Profit Disputes',
  reassurance:
    'Every partner has the right to a full accounting. If money is missing or profits aren\u2019t being shared fairly, you have legal options.',

  questions: [
    {
      id: 'has_written_agreement',
      type: 'yes_no',
      prompt: 'Is there a written partnership or operating agreement?',
      helpText:
        'The agreement controls profit/loss allocation. Without one, Texas defaults to equal shares regardless of capital contribution.',
    },
    {
      id: 'profit_allocation',
      type: 'single_choice',
      prompt: 'How are profits supposed to be split?',
      options: [
        { value: 'equal', label: 'Equal shares (50/50 or equal among partners)' },
        { value: 'percentage', label: 'Fixed percentages per agreement' },
        { value: 'capital', label: 'Based on capital contributions' },
        { value: 'custom', label: 'Custom formula in the agreement' },
        { value: 'no_agreement', label: 'No agreement — using Texas default (equal shares)' },
      ],
    },
    {
      id: 'default_rule_note',
      type: 'info',
      prompt:
        'Under TBOC §152.202, if there is no partnership agreement or the agreement is silent on profit sharing, profits and losses are shared equally among all partners — regardless of how much each partner invested. This is the Texas default rule.',
      showIf: (answers) => answers.profit_allocation === 'no_agreement',
    },
    {
      id: 'accounting_issue',
      type: 'single_choice',
      prompt: 'What is the primary accounting dispute?',
      options: [
        { value: 'unreported_income', label: 'Unreported or hidden income' },
        { value: 'personal_expenses', label: 'Personal expenses charged to the business' },
        { value: 'undisclosed_accounts', label: 'Undisclosed bank accounts or assets' },
        { value: 'unequal_distributions', label: 'Unequal or unauthorized distributions' },
        { value: 'missing_records', label: 'Missing or destroyed financial records' },
        { value: 'multiple', label: 'Multiple issues' },
      ],
    },
    {
      id: 'demanded_accounting',
      type: 'yes_no',
      prompt: 'Have you formally demanded an accounting from your partner?',
      helpText:
        'Under TBOC §152.211, each partner has the right to demand a formal accounting of partnership affairs. Send this demand in writing.',
    },
    {
      id: 'demand_refused',
      type: 'yes_no',
      prompt: 'Did the partner refuse or ignore your demand for an accounting?',
      showIf: (answers) => answers.demanded_accounting === 'yes',
    },
    {
      id: 'court_accounting_note',
      type: 'info',
      prompt:
        'Since the demand was refused, you can petition the court for a court-ordered accounting under TBOC §152.211. The court will appoint a master or require the partner to produce all financial records. Refusal to comply can result in contempt sanctions.',
      showIf: (answers) => answers.demand_refused === 'yes',
    },
    {
      id: 'demand_needed_note',
      type: 'info',
      prompt:
        'Send a formal written demand for an accounting via certified mail. Cite TBOC §152.211 and specify the time period and records you need. Give 30 days to respond. If refused, you can petition the court.',
      showIf: (answers) => answers.demanded_accounting === 'no',
    },
    {
      id: 'valuation_needed',
      type: 'yes_no',
      prompt: 'Do you need to determine the value of the business or a partner\u2019s interest?',
    },
    {
      id: 'valuation_method',
      type: 'single_choice',
      prompt: 'Which valuation approach makes sense for your business?',
      helpText:
        'Courts may use any reasonable method. The partnership agreement may specify a method.',
      showIf: (answers) => answers.valuation_needed === 'yes',
      options: [
        { value: 'book', label: 'Book value (assets minus liabilities on the books)' },
        { value: 'fmv', label: 'Fair market value (what a willing buyer would pay)' },
        { value: 'income', label: 'Income approach (capitalized earnings or discounted cash flow)' },
        { value: 'not_sure', label: 'Not sure — need expert guidance' },
      ],
    },
    {
      id: 'forensic_accounting',
      type: 'yes_no',
      prompt: 'Do you suspect financial records have been manipulated or hidden?',
      helpText:
        'If you suspect fraud or manipulation, a forensic accountant can trace funds, identify hidden assets, and reconstruct records from bank statements and tax filings.',
    },
    {
      id: 'forensic_note',
      type: 'info',
      prompt:
        'A forensic accountant is strongly recommended. They can:\n\n• Trace funds through multiple accounts\n• Identify unreported income using bank deposit analysis\n• Detect personal expenses disguised as business expenses\n• Locate undisclosed accounts through subpoenaed bank records\n• Reconstruct destroyed or missing records\n• Serve as an expert witness at trial\n\nCost typically ranges from $5,000–$25,000+ depending on complexity.',
      showIf: (answers) => answers.forensic_accounting === 'yes',
    },
    {
      id: 'tax_returns_access',
      type: 'yes_no',
      prompt: 'Do you have access to the partnership\u2019s tax returns (Form 1065 and K-1s)?',
    },
    {
      id: 'tax_tip',
      type: 'info',
      prompt:
        'If you cannot obtain tax returns from your partner, you can request copies from the IRS using Form 4506-T. As a partner, you are entitled to the partnership\u2019s Form 1065 and your own Schedule K-1. These documents are critical for verifying reported income and distributions.',
      showIf: (answers) => answers.tax_returns_access === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.has_written_agreement === 'yes') {
      items.push({ status: 'done', text: 'Written partnership or operating agreement exists.' })
    } else {
      items.push({
        status: 'info',
        text: 'No written agreement — Texas default rules apply (equal profit sharing under TBOC §152.202).',
      })
    }

    if (answers.profit_allocation) {
      const labels: Record<string, string> = {
        equal: 'Equal shares',
        percentage: 'Fixed percentages per agreement',
        capital: 'Based on capital contributions',
        custom: 'Custom formula per agreement',
        no_agreement: 'Equal shares (Texas default)',
      }
      items.push({
        status: 'info',
        text: `Profit allocation: ${labels[answers.profit_allocation] ?? answers.profit_allocation}.`,
      })
    }

    if (answers.accounting_issue) {
      const labels: Record<string, string> = {
        unreported_income: 'Unreported or hidden income',
        personal_expenses: 'Personal expenses charged to business',
        undisclosed_accounts: 'Undisclosed bank accounts or assets',
        unequal_distributions: 'Unequal or unauthorized distributions',
        missing_records: 'Missing or destroyed financial records',
        multiple: 'Multiple accounting issues',
      }
      items.push({
        status: 'info',
        text: `Issue: ${labels[answers.accounting_issue] ?? answers.accounting_issue}.`,
      })
    }

    if (answers.demanded_accounting === 'yes' && answers.demand_refused === 'yes') {
      items.push({
        status: 'needed',
        text: 'Petition the court for a court-ordered accounting under TBOC §152.211.',
      })
    } else if (answers.demanded_accounting === 'yes' && answers.demand_refused === 'no') {
      items.push({ status: 'done', text: 'Formal accounting demand sent and not refused.' })
    } else if (answers.demanded_accounting === 'no') {
      items.push({
        status: 'needed',
        text: 'Send a formal written demand for an accounting citing TBOC §152.211.',
      })
    }

    if (answers.valuation_needed === 'yes') {
      if (answers.valuation_method && answers.valuation_method !== 'not_sure') {
        const labels: Record<string, string> = {
          book: 'Book value',
          fmv: 'Fair market value',
          income: 'Income approach (DCF/capitalized earnings)',
        }
        items.push({
          status: 'info',
          text: `Valuation method: ${labels[answers.valuation_method] ?? answers.valuation_method}.`,
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Determine appropriate business valuation method — consider hiring a business appraiser.',
        })
      }
    }

    if (answers.forensic_accounting === 'yes') {
      items.push({
        status: 'needed',
        text: 'Hire a forensic accountant to trace funds and identify hidden assets.',
      })
    }

    if (answers.tax_returns_access === 'yes') {
      items.push({ status: 'done', text: 'Partnership tax returns (Form 1065/K-1) accessible.' })
    } else if (answers.tax_returns_access === 'no') {
      items.push({
        status: 'needed',
        text: 'Obtain partnership tax returns — request from partner or IRS using Form 4506-T.',
      })
    }

    return items
  },
}
