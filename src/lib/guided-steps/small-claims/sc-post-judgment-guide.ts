import type { GuidedStepConfig } from '../types'

export const scPostJudgmentGuideConfig: GuidedStepConfig = {
  title: "After the Judge's Decision",
  reassurance:
    'Whether you won or lost, knowing your next steps protects your rights and your money.',

  questions: [
    // Outcome
    {
      id: 'outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'won', label: 'I won (judgment in my favor)' },
        { value: 'lost', label: 'I lost (judgment against me)' },
        { value: 'settled', label: 'We settled' },
      ],
    },

    // === WON PATH ===
    {
      id: 'won_demand_payment',
      type: 'info',
      prompt:
        'STEP 1 — DEMAND PAYMENT:\nSend a written demand to the losing party. Include:\n- The judgment amount\n- A 10-day deadline to pay\n- A statement that you will pursue collection if they do not pay\n\nSend it by certified mail so you have proof.',
      showIf: (answers) => answers.outcome === 'won',
    },

    {
      id: 'sent_demand',
      type: 'yes_no',
      prompt: 'Have you sent a written demand for payment?',
      showIf: (answers) => answers.outcome === 'won',
    },

    {
      id: 'received_payment',
      type: 'yes_no',
      prompt: 'Has the other side paid the judgment?',
      showIf: (answers) => answers.outcome === 'won',
    },

    {
      id: 'collection_tools',
      type: 'info',
      prompt:
        "IF THEY DON'T PAY — YOUR COLLECTION TOOLS:\n\n1. Abstract of Judgment — File with the county clerk to create a lien on their property. They can't sell or refinance without paying you first.\n\n2. Writ of Execution — Ask the court to issue a writ. A constable can seize the debtor's non-exempt assets (bank accounts, vehicles, etc.).\n\n3. Bank Account Garnishment — If you know their bank, you can garnish funds directly from their account.\n\n4. Wage Garnishment — Garnish up to 25% of their disposable earnings (with some exceptions).\n\n5. Post-Judgment Interest — Your judgment accrues interest at 5% per year until paid.\n\n6. Judgment Debtor Examination — Force them to appear in court and disclose their assets, income, and bank accounts under oath.",
      showIf: (answers) =>
        answers.outcome === 'won' && answers.received_payment === 'no',
    },

    {
      id: 'collection_method',
      type: 'single_choice',
      prompt: 'Which collection method do you want to pursue first?',
      options: [
        { value: 'abstract', label: 'Abstract of Judgment (property lien)' },
        { value: 'writ', label: 'Writ of Execution (asset seizure)' },
        { value: 'bank', label: 'Bank account garnishment' },
        { value: 'wage', label: 'Wage garnishment' },
        { value: 'exam', label: 'Judgment debtor examination (discover assets)' },
        { value: 'not_sure', label: 'Not sure yet' },
      ],
      showIf: (answers) =>
        answers.outcome === 'won' && answers.received_payment === 'no',
    },

    {
      id: 'debtor_exam_info',
      type: 'info',
      prompt:
        "TIP: If you don't know what assets they have, start with a Judgment Debtor Examination. The court orders them to appear and disclose everything — bank accounts, employer, property, vehicles. Then you'll know exactly what to garnish or levy.",
      showIf: (answers) =>
        answers.outcome === 'won' &&
        (answers.collection_method === 'not_sure' ||
          answers.collection_method === 'exam'),
    },

    // === LOST PATH ===
    {
      id: 'lost_appeal_info',
      type: 'info',
      prompt:
        'YOU CAN APPEAL.\n\nTimelines:\n- Eviction cases: 5 days from judgment\n- All other JP cases: 21 days from judgment\n\nFile your Notice of Appeal at the JP Court clerk. The appeal goes to County Court for a "trial de novo" — a completely new trial where the JP Court decision is erased.',
      showIf: (answers) => answers.outcome === 'lost',
    },

    {
      id: 'case_type_for_appeal',
      type: 'single_choice',
      prompt: 'What type of case is this?',
      options: [
        { value: 'eviction', label: 'Eviction case' },
        { value: 'other', label: 'Any other case (money dispute, etc.)' },
      ],
      showIf: (answers) => answers.outcome === 'lost',
    },

    {
      id: 'eviction_urgency',
      type: 'info',
      prompt:
        'URGENT: You only have 5 DAYS to file your appeal in an eviction case. Go to the JP Court clerk immediately.',
      showIf: (answers) =>
        answers.outcome === 'lost' &&
        answers.case_type_for_appeal === 'eviction',
    },

    {
      id: 'appeal_bond_info',
      type: 'info',
      prompt:
        "APPEAL BOND:\nYou may need to post an appeal bond (a deposit to guarantee the judgment amount). If you can't afford it, you can file an Inability-to-Pay Affidavit (Statement of Inability to Afford Payment of Court Costs) to request a waiver.",
      showIf: (answers) => answers.outcome === 'lost',
    },

    {
      id: 'can_afford_bond',
      type: 'yes_no',
      prompt: 'Can you afford the appeal bond?',
      showIf: (answers) => answers.outcome === 'lost',
    },

    {
      id: 'inability_to_pay_info',
      type: 'info',
      prompt:
        'File a Statement of Inability to Afford Payment of Court Costs with the JP court clerk. The court will review your financial situation. If approved, you can appeal without posting a bond.',
      showIf: (answers) =>
        answers.outcome === 'lost' && answers.can_afford_bond === 'no',
    },

    // === SETTLED PATH ===
    {
      id: 'settled_steps',
      type: 'info',
      prompt:
        'AFTER SETTLING:\n1. Get the settlement agreement in writing, signed by both parties\n2. File an Agreed Judgment or Dismissal with the court\n3. Track payment compliance — do NOT dismiss until you receive full payment\n4. If they miss a payment, you can enforce the agreement as a judgment',
      showIf: (answers) => answers.outcome === 'settled',
    },

    {
      id: 'have_written_settlement',
      type: 'yes_no',
      prompt: 'Do you have a signed, written settlement agreement?',
      showIf: (answers) => answers.outcome === 'settled',
    },

    {
      id: 'settlement_filed',
      type: 'yes_no',
      prompt: 'Have you filed the agreed judgment or dismissal with the court?',
      showIf: (answers) =>
        answers.outcome === 'settled' &&
        answers.have_written_settlement === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.outcome === 'won') {
      if (answers.sent_demand === 'yes') {
        items.push({ status: 'done', text: 'Written demand for payment sent.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Send a written demand for payment with a 10-day deadline via certified mail.',
        })
      }

      if (answers.received_payment === 'yes') {
        items.push({ status: 'done', text: 'Judgment has been paid.' })
      } else if (answers.received_payment === 'no') {
        items.push({
          status: 'needed',
          text: 'Payment not received. Consider collection tools: Abstract of Judgment, Writ of Execution, garnishment, or debtor examination.',
        })
        items.push({
          status: 'info',
          text: 'Your judgment accrues 5% annual interest until paid.',
        })
      }
    }

    if (answers.outcome === 'lost') {
      const deadline =
        answers.case_type_for_appeal === 'eviction'
          ? '5 days'
          : '21 days'
      items.push({
        status: 'needed',
        text: `File Notice of Appeal at the JP Court clerk within ${deadline} of the judgment.`,
      })

      if (answers.can_afford_bond === 'no') {
        items.push({
          status: 'needed',
          text: 'File a Statement of Inability to Afford Payment of Court Costs to waive the appeal bond.',
        })
      } else if (answers.can_afford_bond === 'yes') {
        items.push({
          status: 'needed',
          text: 'Post the appeal bond with your Notice of Appeal.',
        })
      }

      items.push({
        status: 'info',
        text: 'Your appeal goes to County Court for a trial de novo — a completely new trial.',
      })
    }

    if (answers.outcome === 'settled') {
      if (answers.have_written_settlement === 'yes') {
        items.push({
          status: 'done',
          text: 'Written settlement agreement obtained.',
        })
      } else {
        items.push({
          status: 'needed',
          text: 'Get the settlement agreement in writing and signed by both parties.',
        })
      }

      if (answers.settlement_filed === 'yes') {
        items.push({
          status: 'done',
          text: 'Agreed judgment or dismissal filed with the court.',
        })
      } else if (answers.have_written_settlement === 'yes') {
        items.push({
          status: 'needed',
          text: 'File an agreed judgment or dismissal with the court.',
        })
      }

      items.push({
        status: 'info',
        text: 'Track payment compliance. Do NOT dismiss until you receive full payment.',
      })
    }

    return items
  },
}
