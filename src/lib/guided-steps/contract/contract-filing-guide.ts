import type { GuidedStepConfig } from '../types'

export const contractFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Contract Lawsuit',
  reassurance:
    "Filing is straightforward once you know which court. We'll walk you through every detail.",

  questions: [
    // Total damages
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your damages?',
      helpText:
        'Include the full amount owed under the contract, consequential damages, and any out-of-pocket costs caused by the breach.',
      options: [
        { value: 'under_20k', label: 'Under $20,000' },
        { value: '20k_to_100k', label: '$20,000 to $100,000' },
        { value: 'over_100k', label: 'Over $100,000' },
      ],
    },

    // Court routing
    {
      id: 'court_jp',
      type: 'info',
      prompt:
        'File in Justice of the Peace (JP) Court. Filing fee: $35–75. Simpler process, no jury unless requested. Faster resolution.',
      showIf: (answers) => answers.total_damages === 'under_20k',
    },
    {
      id: 'court_county',
      type: 'info',
      prompt:
        'File in County Court at Law. Filing fee: $250–350. More formal, but still manageable for pro se.',
      showIf: (answers) => answers.total_damages === '20k_to_100k',
    },
    {
      id: 'court_district',
      type: 'info',
      prompt:
        'File in District Court. Filing fee: $300–400. Most formal. Consider consulting an attorney for complex cases.',
      showIf: (answers) => answers.total_damages === 'over_100k',
    },

    // Forum selection clause
    {
      id: 'forum_selection',
      type: 'yes_no',
      prompt: 'Does your contract specify where to file (a "forum selection" clause)?',
      helpText:
        'Look for language like "any disputes shall be resolved in [county/state]" or "exclusive jurisdiction in [court]." This is usually near the end of the contract.',
    },
    {
      id: 'forum_selection_yes_info',
      type: 'info',
      prompt:
        'Your contract\'s forum selection clause usually controls where you must file. File in the court and location specified in the contract. If the clause names a different state, you may need to file there instead. Consult an attorney if the clause seems unfair or was buried in fine print.',
      showIf: (answers) => answers.forum_selection === 'yes',
    },

    // Filing method
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'E-filing is the fastest option and available 24/7. In-person filing lets you get instant confirmation. Mail is the slowest but works if you cannot get to the courthouse.',
      options: [
        { value: 'efile', label: 'Online (eFileTexas.gov) — recommended' },
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'mail', label: 'By mail' },
      ],
    },

    // eFile instructions
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        "To file online:\n1. Go to eFileTexas.gov and create a free account\n2. Select your court and case type (breach of contract)\n3. Upload your Petition as a PDF\n4. Pay the filing fee online (or submit fee waiver)\n5. You'll receive a confirmation email when accepted\n\nTip: Most courts accept e-filed documents within 24 hours.",
      showIf: (answers) => answers.filing_method === 'efile',
    },

    // In-person instructions
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "To file in person:\n1. Print 3 copies of your Petition (one for the court, one for you, one to serve)\n2. Go to the court clerk's office during business hours (usually 8am–5pm)\n3. Tell the clerk: \"I need to file a Petition for breach of contract\"\n4. Pay the filing fee (or bring a completed fee waiver form)\n5. The clerk will stamp all copies — keep your stamped copy as proof\n6. Ask the clerk about service options for the defendant",
      showIf: (answers) => answers.filing_method === 'in_person',
    },

    // Mail instructions
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        'To file by mail:\n1. Print 3 copies of your Petition\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the court clerk\'s office via certified mail with return receipt\n4. Include a check or money order for the filing fee (or fee waiver form)\n\nWarning: Mail takes time. Allow at least 7–10 business days for processing.',
      showIf: (answers) => answers.filing_method === 'mail',
    },

    // Fee affordability
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },

    // Fee waiver info
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'You can file a "Statement of Inability to Afford Payment of Court Costs" (sometimes called Affidavit of Indigency). This is an official Texas form.\n\n1. Download the form from texaslawhelp.org or ask the court clerk\n2. Fill it out honestly — include your income, expenses, and why you can\'t pay\n3. File it WITH your Petition (same time)\n4. The court will review it — most are approved within a few days\n5. If approved, you pay $0. If denied, you can appeal the denial.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // Venue info
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE: File in the county where: (a) the contract was performed, (b) the contract was made, or (c) the defendant lives. If your contract specifies a venue, that usually controls.',
    },

    // What to bring checklist
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'Checklist — what to bring when filing:\n\n• Your Petition (3 copies, signed)\n• A copy of the contract (or written summary if oral contract)\n• Filing fee payment or fee waiver form\n• Government-issued ID',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_20k: 'Justice of the Peace (JP) Court (under $20K)',
        '20k_to_100k': 'County Court at Law ($20K–$100K)',
        over_100k: 'District Court (over $100K)',
      }
      items.push({
        status: 'done',
        text: `Court: ${courtLabels[answers.total_damages]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine your total damages to identify the correct court.',
      })
    }

    // Forum selection clause
    if (answers.forum_selection === 'yes') {
      items.push({
        status: 'info',
        text: 'Your contract specifies where to file — follow the forum selection clause.',
      })
    }

    // Filing method
    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'Online via eFileTexas.gov',
        in_person: 'In person at the courthouse',
        mail: 'By certified mail',
      }
      items.push({
        status: 'done',
        text: `Filing method: ${methodLabels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method (online, in person, or by mail).',
      })
    }

    // Method-specific reminders
    if (answers.filing_method === 'efile') {
      items.push({
        status: 'needed',
        text: 'Create an account at eFileTexas.gov and upload your Petition as a PDF.',
      })
    } else if (answers.filing_method === 'in_person') {
      items.push({
        status: 'needed',
        text: 'Print 3 copies of your Petition and bring them to the court clerk during business hours (8am–5pm).',
      })
    } else if (answers.filing_method === 'mail') {
      items.push({
        status: 'needed',
        text: 'Mail 3 copies via certified mail with return receipt. Include a self-addressed stamped envelope. Allow 7–10 business days.',
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({
        status: 'done',
        text: 'Filing fee: prepared to pay.',
      })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Download and complete the Statement of Inability to Afford Payment of Court Costs from texaslawhelp.org. File it with your Petition.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine if you can afford the filing fee. Fee waivers are available if you qualify.',
      })
    }

    // Venue reminder
    items.push({
      status: 'info',
      text: 'File in the county where the contract was performed, was made, or where the defendant lives. If your contract specifies a venue, that usually controls.',
    })

    return items
  },
}
