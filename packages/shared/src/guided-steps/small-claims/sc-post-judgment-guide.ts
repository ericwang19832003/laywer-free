import type { GuidedStepConfig } from '../types'
import { getSmallClaimsInfo } from '../state-litigation-info'

export function createScPostJudgmentGuideConfig(state?: string): GuidedStepConfig {
  const sc = getSmallClaimsInfo(state)

  return {
    title: "After the Judge's Decision",
    reassurance: 'Whether you won or lost, knowing your next steps protects your rights and your money.',

    questions: [
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

      {
        id: 'won_demand_payment',
        type: 'info',
        prompt: "STEP 1 — DEMAND PAYMENT:\nSend a written demand to the losing party. Include:\n- The judgment amount\n- A 10-day deadline to pay\n- A statement that you will pursue collection if they do not pay\n\nSend it by certified mail so you have proof.",
        acknowledgeLabel: 'I will send a demand for payment →',
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
        acknowledgeLabel: 'Show me my options →',
        prompt: `IF THEY DON'T PAY — YOU HAVE SEVERAL TOOLS AVAILABLE.\n\nYour judgment also accrues interest at ${sc.judgmentInterestRate} (${sc.judgmentInterestCitation}) until paid. Let's focus on the collection method that fits your situation best.`,
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
          ...(sc.wageGarnishmentAllowed ? [{ value: 'wage', label: 'Wage garnishment' }] : []),
          { value: 'exam', label: 'Judgment debtor examination (discover assets)' },
          { value: 'not_sure', label: 'Not sure yet' },
        ],
        showIf: (answers) =>
          answers.outcome === 'won' && answers.received_payment === 'no',
      },

      {
        id: 'collection_abstract_info',
        type: 'info',
        prompt: `ABSTRACT OF JUDGMENT\n\nFiling an Abstract of Judgment with the county clerk creates a lien on any real property the debtor owns in that county. They cannot sell or refinance without paying you first.\n\nSteps:\n1. Get a certified copy of the judgment from the court clerk.\n2. Complete the Abstract of Judgment form (available at the county clerk).\n3. File it in every county where the debtor may own property.\n4. Pay the filing fee (usually $25–$50).\n\nThe lien is valid for 10 years and can be renewed. This is the most passive collection tool — you file once and wait.`,
        acknowledgeLabel: 'I will file the Abstract of Judgment →',
        showIf: (answers) =>
          answers.outcome === 'won' &&
          answers.received_payment === 'no' &&
          answers.collection_method === 'abstract',
      },

      {
        id: 'collection_writ_info',
        type: 'info',
        prompt: `WRIT OF EXECUTION\n\nA Writ of Execution directs a constable to locate and seize the debtor's non-exempt assets — vehicles, business equipment, bank accounts — and sell them to satisfy your judgment.\n\nSteps:\n1. File an Application for Writ of Execution with the court clerk.\n2. Identify where the debtor's assets are located (address for vehicles, business name, etc.).\n3. The constable will levy the assets and arrange a sale.\n\nExempt assets (homestead, certain personal property up to $100,000 for a family) cannot be seized. If you are unsure what the debtor owns, consider a debtor examination first.`,
        acknowledgeLabel: 'I will apply for a Writ of Execution →',
        showIf: (answers) =>
          answers.outcome === 'won' &&
          answers.received_payment === 'no' &&
          answers.collection_method === 'writ',
      },

      {
        id: 'collection_bank_info',
        type: 'info',
        prompt: `BANK ACCOUNT GARNISHMENT\n\nIf you know which bank the debtor uses, you can garnish funds directly from their account.\n\nSteps:\n1. File a Writ of Garnishment application with the court, naming the bank as the garnishee.\n2. The bank freezes the debtor's funds up to the judgment amount.\n3. The court issues an order directing the bank to pay you.\n\nYou need to know the debtor's bank name and branch. If you don't know their bank, a debtor examination can compel them to disclose it under oath.`,
        acknowledgeLabel: 'I will pursue bank garnishment →',
        showIf: (answers) =>
          answers.outcome === 'won' &&
          answers.received_payment === 'no' &&
          answers.collection_method === 'bank',
      },

      ...(sc.wageGarnishmentAllowed
        ? [
            {
              id: 'collection_wage_info',
              type: 'info' as const,
              prompt: `WAGE GARNISHMENT\n\nYou may garnish a portion of the debtor's wages directly from their employer.\n\nSteps:\n1. File a Writ of Garnishment application naming the debtor's employer as the garnishee.\n2. Federal law limits garnishment to 25% of disposable earnings (or the amount above 30× the federal minimum wage, whichever is less).\n3. The employer withholds and pays you directly until the judgment is satisfied.\n\nYou need to know the debtor's employer name and address. A debtor examination can compel this information.`,
              acknowledgeLabel: 'I will pursue wage garnishment →',
              showIf: (answers: Record<string, string>) =>
                answers.outcome === 'won' &&
                answers.received_payment === 'no' &&
                answers.collection_method === 'wage',
            },
          ]
        : []),

      {
        id: 'debtor_exam_info',
        type: 'info',
        prompt: "JUDGMENT DEBTOR EXAMINATION\n\nIf you don't know what assets the debtor has, start here. The court orders them to appear and answer questions under oath about their finances.\n\nWhat you can ask about:\n- Bank accounts (name, account numbers, balances)\n- Employer and income\n- Real property and vehicles\n- Other assets and investments\n\nHow to request it:\n1. File a motion or application for a debtor examination with the court clerk.\n2. The court issues an order requiring the debtor to appear.\n3. You (or the judge) ask questions in court.\n\nOnce you know what they have, you can target the right collection method.",
        acknowledgeLabel: 'I will request a debtor examination →',
        showIf: (answers) =>
          answers.outcome === 'won' &&
          answers.received_payment === 'no' &&
          (answers.collection_method === 'not_sure' ||
            answers.collection_method === 'exam'),
      },

      {
        id: 'lost_appeal_info',
        type: 'info',
        acknowledgeLabel: 'I understand my appeal options →',
        prompt: `YOU CAN APPEAL.\n\nTimeline:\n- Eviction cases: ${sc.appealDeadlineEviction} from judgment\n- All other cases: ${sc.appealDeadlineOther} from judgment\n\nFile your Notice of Appeal at the ${sc.courtAbbrev} clerk. The appeal goes to ${sc.upperCourtName} for a "trial de novo" — a completely new trial where the ${sc.courtAbbrev} decision is erased.`,
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
        prompt: `URGENT: You only have ${sc.appealDeadlineEviction.toUpperCase()} to file your appeal in an eviction case. Go to the ${sc.courtAbbrev} clerk immediately.`,
        acknowledgeLabel: 'I am going to the clerk now →',
        showIf: (answers) =>
          answers.outcome === 'lost' &&
          answers.case_type_for_appeal === 'eviction',
      },

      {
        id: 'appeal_bond_info',
        type: 'info',
        prompt: `APPEAL BOND:\nYou may need to post an appeal bond (a deposit to guarantee the judgment amount). If you can't afford it, you can file a "${sc.feeWaiverForm}" to request a waiver.`,
        acknowledgeLabel: 'I understand the appeal bond requirement →',
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
        prompt: `File a "${sc.feeWaiverForm}" with the court clerk. The court will review your financial situation. If approved, you can appeal without posting a bond.`,
        acknowledgeLabel: 'I will file for a fee waiver →',
        showIf: (answers) =>
          answers.outcome === 'lost' && answers.can_afford_bond === 'no',
      },

      {
        id: 'settled_steps',
        type: 'info',
        prompt: "AFTER SETTLING:\n1. Get the settlement agreement in writing, signed by both parties\n2. File an Agreed Judgment or Dismissal with the court\n3. Track payment compliance — do NOT dismiss until you receive full payment\n4. If they miss a payment, you can enforce the agreement as a judgment",
        acknowledgeLabel: 'I understand the post-settlement steps →',
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
            text: `Payment not received. Consider collection tools: Abstract of Judgment, Writ of Execution, bank garnishment${sc.wageGarnishmentAllowed ? ', wage garnishment' : ''}, or debtor examination.`,
          })
          items.push({
            status: 'info',
            text: `Your judgment accrues interest at ${sc.judgmentInterestRate} (${sc.judgmentInterestCitation}) until paid.`,
          })
        }
      }

      if (answers.outcome === 'lost') {
        const deadline =
          answers.case_type_for_appeal === 'eviction'
            ? sc.appealDeadlineEviction
            : sc.appealDeadlineOther
        items.push({
          status: 'needed',
          text: `File Notice of Appeal at the ${sc.courtAbbrev} clerk within ${deadline} of the judgment.`,
        })

        if (answers.can_afford_bond === 'no') {
          items.push({
            status: 'needed',
            text: `File a "${sc.feeWaiverForm}" to waive the appeal bond.`,
          })
        } else if (answers.can_afford_bond === 'yes') {
          items.push({
            status: 'needed',
            text: 'Post the appeal bond with your Notice of Appeal.',
          })
        }

        items.push({
          status: 'info',
          text: `Your appeal goes to ${sc.upperCourtName} for a trial de novo — a completely new trial.`,
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
}

export const scPostJudgmentGuideConfig = createScPostJudgmentGuideConfig()
