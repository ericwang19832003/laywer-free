import type { GuidedStepConfig } from '../types'

export const debtStandingChallengeConfig: GuidedStepConfig = {
  title: 'Challenge the Plaintiff\'s Right to Sue',
  reassurance:
    'Many debt buyers cannot prove they actually own your debt. This is one of the strongest defenses available — an unbroken chain of ownership is required, and gaps are surprisingly common.',

  questions: [
    {
      id: 'plaintiff_type',
      type: 'single_choice',
      prompt: 'Who is suing you?',
      helpText:
        'The type of plaintiff determines how strong a standing challenge can be.',
      options: [
        { value: 'original_creditor', label: 'The bank or company you originally borrowed from' },
        { value: 'debt_buyer', label: 'A company that bought the debt' },
        { value: 'collection_agency', label: 'A collection agency collecting on behalf of the original creditor' },
        { value: 'not_sure', label: 'Not sure' },
      ],
    },
    {
      id: 'original_creditor_info',
      type: 'info',
      prompt:
        'Original creditors generally have standing to sue because they are the party you originally contracted with. Focus your defense on other issues such as the statute of limitations, the amount owed, or FDCPA violations.',
      acknowledgeLabel: 'Got it, continue →',
      showIf: (answers) => answers.plaintiff_type === 'original_creditor',
    },
    {
      id: 'debt_buyer_standing_info',
      type: 'info',
      prompt:
        'DEBT BUYER STANDING — This is often the WEAKEST point in their case. To sue you, a debt buyer must prove an unbroken chain of ownership from the original creditor to them. Many cannot do this.\n\nKey things they must prove:\n• They actually purchased YOUR specific account (not just a portfolio)\n• A complete chain of assignment from the original creditor through every intermediate buyer\n• The original agreement between you and the creditor\n• Accurate accounting of what you owe',
      acknowledgeLabel: 'Got it, continue →',
      showIf: (answers) =>
        answers.plaintiff_type === 'debt_buyer' || answers.plaintiff_type === 'not_sure',
    },
    {
      id: 'has_original_agreement',
      type: 'yes_no',
      prompt: 'Has the plaintiff produced the original signed credit agreement?',
      helpText:
        'This is the contract you signed when you opened the account. Debt buyers often do not have this document.',
      showIf: (answers) => answers.plaintiff_type === 'debt_buyer',
    },
    {
      id: 'no_agreement_info',
      type: 'info',
      prompt:
        'WITHOUT THE ORIGINAL AGREEMENT, the debt buyer\'s case is weak. In your discovery requests, demand:\n\n1. The original signed application or agreement\n2. Every assignment agreement in the chain of ownership\n3. The bill of sale showing your specific account was included\n4. Account-level transaction history from origination to charge-off\n\nMany debt buyers purchased accounts in bulk and have none of these documents.',
      acknowledgeLabel: "I'll demand these documents in discovery →",
      showIf: (answers) =>
        answers.plaintiff_type === 'debt_buyer' && answers.has_original_agreement === 'no',
    },
    {
      id: 'chain_of_assignment',
      type: 'yes_no',
      prompt: 'Has the plaintiff provided documentation showing how they acquired this debt?',
      helpText:
        'This means assignment agreements, bills of sale, or affidavits showing how the debt passed from the original creditor to the current plaintiff.',
      showIf: (answers) =>
        answers.plaintiff_type === 'debt_buyer' ||
        answers.plaintiff_type === 'not_sure' ||
        answers.plaintiff_type === 'collection_agency',
    },
    {
      id: 'no_chain_info',
      type: 'info',
      prompt:
        'REQUEST THE CHAIN — Send a Request for Production of Documents demanding every document showing the transfer of ownership of this account. A gap in the chain of assignment means the plaintiff has no standing to sue, and the case should be dismissed.',
      acknowledgeLabel: "I'll request all assignment documents →",
      showIf: (answers) => answers.chain_of_assignment === 'no',
    },
    {
      id: 'collection_agency_info',
      type: 'info',
      prompt:
        'COLLECTION AGENCY — A collection agency suing on behalf of a creditor must prove they are authorized to file suit. Request the authorization agreement between the collection agency and the original creditor in discovery. Without proof of authorization, they lack standing.',
      acknowledgeLabel: "I'll request the authorization agreement →",
      showIf: (answers) => answers.plaintiff_type === 'collection_agency',
    },
    {
      id: 'how_to_raise_defense',
      type: 'info',
      prompt:
        'HOW TO RAISE THIS DEFENSE — Include in your Answer: "Plaintiff lacks standing to bring this action. Plaintiff has failed to establish an unbroken chain of assignment from the original creditor to itself." Then use discovery to force them to prove it. If they cannot produce the documentation, file a Motion for Summary Judgment on standing grounds.',
      acknowledgeLabel: "I'll add this language to my Answer →",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const plaintiffLabels: Record<string, string> = {
      original_creditor: 'Original creditor',
      debt_buyer: 'Debt buyer',
      collection_agency: 'Collection agency',
      not_sure: 'Unknown (possibly debt buyer)',
    }

    const plaintiffLabel = plaintiffLabels[answers.plaintiff_type] || 'Unknown'

    items.push({
      status: 'done',
      text: `Plaintiff type: ${plaintiffLabel}.`,
    })

    if (answers.plaintiff_type === 'original_creditor') {
      items.push({
        status: 'info',
        text: 'Original creditors generally have standing. Focus on other defenses such as statute of limitations, amount disputes, or FDCPA violations.',
      })
    }

    if (answers.plaintiff_type === 'debt_buyer' || answers.plaintiff_type === 'not_sure') {
      items.push({
        status: 'info',
        text: 'Standing is a strong challenge against debt buyers. They must prove an unbroken chain of ownership from the original creditor.',
      })

      if (answers.has_original_agreement === 'no') {
        items.push({
          status: 'needed',
          text: 'Plaintiff has NOT produced the original signed agreement. Demand it in discovery — this weakens their case significantly.',
        })
      } else if (answers.has_original_agreement === 'yes') {
        items.push({
          status: 'done',
          text: 'Plaintiff has the original agreement. Focus your standing challenge on the chain of assignment instead.',
        })
      }

      if (answers.chain_of_assignment === 'no') {
        items.push({
          status: 'needed',
          text: 'No chain of assignment documentation provided. Send a Request for Production demanding all assignment and sale documents. A gap in the chain = no standing.',
        })
      } else if (answers.chain_of_assignment === 'yes') {
        items.push({
          status: 'info',
          text: 'Plaintiff claims to have chain of assignment documentation. Review it carefully for gaps — each transfer must be documented and must specifically reference your account.',
        })
      }
    }

    if (answers.plaintiff_type === 'collection_agency') {
      items.push({
        status: 'needed',
        text: 'Request the authorization agreement between the collection agency and the original creditor. Without proof of authority to sue, they lack standing.',
      })

      if (answers.chain_of_assignment === 'no') {
        items.push({
          status: 'needed',
          text: 'No documentation of authority or assignment provided. Demand proof in discovery.',
        })
      }
    }

    items.push({
      status: 'needed',
      text: 'Include in your Answer: "Plaintiff lacks standing to bring this action." Use discovery to force them to prove the chain of ownership.',
    })

    return items
  },
}
