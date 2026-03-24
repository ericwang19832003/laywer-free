import type { GuidedStepConfig } from '../types'

export const propertyFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Property Damage Lawsuit',
  reassurance:
    "Filing is a straightforward process. We'll tell you exactly which court, what forms, and what to bring.",

  questions: [
    // Total damages
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your total damages?',
      helpText:
        'Include repair costs, lost use of property, diminished value, and any other losses. Use your highest contractor estimate.',
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
        'File in Justice of the Peace (JP) Court. Filing fee: $35\u201375. Simpler process, no jury unless requested. Faster resolution.',
      showIf: (answers) => answers.total_damages === 'under_20k',
    },
    {
      id: 'court_county',
      type: 'info',
      prompt:
        'File in County Court at Law. Filing fee: $250\u2013350. More formal, but still manageable for pro se.',
      showIf: (answers) => answers.total_damages === '20k_to_100k',
    },
    {
      id: 'court_district',
      type: 'info',
      prompt:
        'File in District Court. Filing fee: $300\u2013400. Most formal. Consider consulting an attorney for complex cases.',
      showIf: (answers) => answers.total_damages === 'over_100k',
    },

    // Filing method
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'E-filing is the fastest option and available 24/7. In-person filing lets you get instant confirmation. Mail is the slowest but works if you cannot get to the courthouse.',
      options: [
        { value: 'efile', label: 'Online (eFileTexas.gov) \u2014 recommended' },
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'mail', label: 'By mail' },
      ],
    },

    // eFile instructions
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        "To file online:\n1. Go to eFileTexas.gov and create a free account\n2. Select your court and case type (property damage)\n3. Upload your Petition as a PDF\n4. Pay the filing fee online (or submit fee waiver)\n5. You'll receive a confirmation email when accepted\n\nTip: Most courts accept e-filed documents within 24 hours.",
      showIf: (answers) => answers.filing_method === 'efile',
    },

    // In-person instructions
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "To file in person:\n1. Print 3 copies of your Petition (one for the court, one for you, one to serve)\n2. Go to the court clerk's office during business hours (usually 8am\u20135pm)\n3. Tell the clerk: \"I need to file a Petition for property damage\"\n4. Pay the filing fee (or bring a completed fee waiver form)\n5. The clerk will stamp all copies \u2014 keep your stamped copy as proof\n6. Ask the clerk about service options for the defendant",
      showIf: (answers) => answers.filing_method === 'in_person',
    },

    // Mail instructions
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        'To file by mail:\n1. Print 3 copies of your Petition\n2. Include a self-addressed stamped envelope for the clerk to return your stamped copy\n3. Mail to the court clerk\'s office via certified mail with return receipt\n4. Include a check or money order for the filing fee (or fee waiver form)\n\nWarning: Mail takes time. Allow at least 7\u201310 business days for processing.',
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
        'You can file a "Statement of Inability to Afford Payment of Court Costs" (sometimes called Affidavit of Indigency). This is an official Texas form.\n\n1. Download the form from texaslawhelp.org or ask the court clerk\n2. Fill it out honestly \u2014 include your income, expenses, and why you can\'t pay\n3. File it WITH your Petition (same time)\n4. The court will review it \u2014 most are approved within a few days\n5. If approved, you pay $0. If denied, you can appeal the denial.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // What to bring checklist
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'Checklist \u2014 what to bring when filing:\n\n\u2022 Your Petition (3 copies, signed)\n\u2022 Evidence: photos, repair estimates, timeline\n\u2022 Filing fee payment or fee waiver form\n\u2022 Government-issued ID\n\u2022 A pen (in case you need to sign anything)',
    },

    // Venue info
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE: File in the county where the property is located (Tex. Civ. Prac. & Rem. Code \u00a715.011 for real property) or where the defendant lives.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_20k: 'Justice of the Peace (JP) Court (under $20K)',
        '20k_to_100k': 'County Court at Law ($20K\u2013$100K)',
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
        text: 'Print 3 copies of your Petition and bring them to the court clerk during business hours (8am\u20135pm).',
      })
    } else if (answers.filing_method === 'mail') {
      items.push({
        status: 'needed',
        text: 'Mail 3 copies via certified mail with return receipt. Include a self-addressed stamped envelope. Allow 7\u201310 business days.',
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
      text: 'File in the county where the property is located or where the defendant lives (Tex. Civ. Prac. & Rem. Code \u00a715.011).',
    })

    return items
  },
}
