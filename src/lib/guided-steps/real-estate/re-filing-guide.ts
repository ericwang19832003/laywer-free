import type { GuidedStepConfig } from '../types'

export const reFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Real Estate Lawsuit',
  reassurance:
    "Real estate lawsuits have specific venue and identification rules, but they're straightforward once you know the requirements. We'll walk you through each one.",

  questions: [
    // Venue
    {
      id: 'property_county',
      type: 'text',
      prompt: 'What county is the property located in?',
      helpText:
        'Under Texas Civil Practice & Remedies Code Section 15.011, lawsuits involving real property MUST be filed in the county where the property is located. This is mandatory venue — no exceptions.',
      placeholder: 'e.g. Travis County',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'MANDATORY VENUE (Section 15.011): Your real estate lawsuit must be filed in the county where the property is located. Unlike other lawsuits, you cannot file where the defendant lives or where the contract was signed. The court will dismiss or transfer your case if you file in the wrong county.',
    },

    // Property identification
    {
      id: 'has_legal_description',
      type: 'yes_no',
      prompt: 'Do you have the full legal description of the property?',
      helpText:
        'The legal description is NOT the street address. It is the metes and bounds description or lot/block/subdivision reference found on the deed or title commitment.',
    },
    {
      id: 'legal_description_needed',
      type: 'info',
      prompt:
        'Your petition MUST identify the property by its full legal description — a street address alone is not sufficient. You can find the legal description on:\n\n1. Your deed (recorded at the county clerk\'s office)\n2. Your title commitment or title policy\n3. The county appraisal district website (search by address)\n4. A survey of the property\n\nThe description will be either:\n- Metes and bounds (bearings and distances describing the boundary)\n- Lot/block/subdivision (e.g., "Lot 5, Block 3, Oak Hills Subdivision")',
      showIf: (answers) => answers.has_legal_description === 'no',
    },

    // Damages and court routing
    {
      id: 'total_damages',
      type: 'single_choice',
      prompt: 'How much are your damages?',
      helpText:
        'Include the full amount: repair costs, diminished property value, lost earnest money, out-of-pocket expenses, and any consequential damages.',
      options: [
        { value: 'under_20k', label: 'Under $20,000' },
        { value: '20k_to_100k', label: '$20,000 to $100,000' },
        { value: '100k_to_200k', label: '$100,000 to $200,000' },
        { value: 'over_200k', label: 'Over $200,000' },
      ],
    },
    {
      id: 'court_jp',
      type: 'info',
      prompt:
        'File in Justice of the Peace (JP) Court. Filing fee: $35-75. Simpler process with relaxed evidence rules. Faster resolution, but limited to monetary damages under $20,000.',
      showIf: (answers) => answers.total_damages === 'under_20k',
    },
    {
      id: 'court_county',
      type: 'info',
      prompt:
        'File in County Court at Law. Filing fee: $250-350. More formal than JP Court. Can handle declaratory judgments and injunctive relief related to the property.',
      showIf: (answers) => answers.total_damages === '20k_to_100k',
    },
    {
      id: 'court_district',
      type: 'info',
      prompt:
        'File in District Court. Filing fee: $300-400. Most formal. Required for claims over $200,000 and cases seeking specific performance (forcing a sale or transfer). District Court has full equitable powers.',
      showIf: (answers) =>
        answers.total_damages === '100k_to_200k' || answers.total_damages === 'over_200k',
    },

    // Filing method
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file?',
      helpText:
        'Texas requires e-filing in most courts. In-person filing may still be available in some JP courts.',
      options: [
        { value: 'efile', label: 'Online (eFileTexas.gov) — recommended' },
        { value: 'in_person', label: 'In person at the courthouse' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'To file online:\n1. Go to eFileTexas.gov and create a free account\n2. Select your court and case type (real property dispute)\n3. Upload your Petition as a PDF — make sure it includes the full legal description of the property\n4. Pay the filing fee online (or submit fee waiver)\n5. You will receive a confirmation email when accepted\n\nTip: Most courts accept e-filed documents within 24 hours.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "To file in person:\n1. Print 3 copies of your Petition (one for the court, one for you, one to serve)\n2. Go to the court clerk's office during business hours (usually 8am-5pm)\n3. Tell the clerk: \"I need to file a real estate lawsuit\"\n4. Pay the filing fee (or bring a completed fee waiver form)\n5. The clerk will stamp all copies — keep your stamped copy as proof\n6. Ask the clerk about service options for the defendant",
      showIf: (answers) => answers.filing_method === 'in_person',
    },

    // Fee affordability
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'You can file a "Statement of Inability to Afford Payment of Court Costs." This is an official Texas form.\n\n1. Download the form from texaslawhelp.org or ask the court clerk\n2. Fill it out honestly — include your income, expenses, and why you cannot pay\n3. File it WITH your Petition (same time)\n4. The court will review it — most are approved within a few days\n5. If approved, you pay $0. If denied, you can appeal the denial.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },

    // Lis pendens
    {
      id: 'want_lis_pendens',
      type: 'yes_no',
      prompt: 'Do you want to file a lis pendens to cloud the title during litigation?',
      helpText:
        'A lis pendens (notice of pending litigation) is recorded in the county property records and warns anyone searching the title that a lawsuit is pending. This prevents the other party from selling or refinancing without the buyer knowing about your claim.',
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'LIS PENDENS (Texas Property Code Section 12.007):\n\nA lis pendens puts the world on notice that the property is subject to a pending lawsuit. To file one:\n\n1. Prepare a notice that identifies the property (full legal description), the court, the case number, and the parties\n2. File the notice with the County Clerk where the property is located (recording fee: $16-26)\n3. File it AFTER your lawsuit is filed — you need a cause number\n\nEffect: Any buyer or lender takes the property subject to the outcome of your lawsuit. This is powerful leverage to force settlement.\n\nWarning: Filing a frivolous lis pendens can result in sanctions and damages. Only file if your claim genuinely involves title or an interest in the property.',
      showIf: (answers) => answers.want_lis_pendens === 'yes',
    },

    // Checklist
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'CHECKLIST — what you need to file:\n\n- Your Petition (3 copies, signed) with the full legal description of the property\n- A copy of the purchase agreement or deed\n- Filing fee payment or fee waiver form\n- Government-issued ID\n- If filing lis pendens: a separate notice document with the cause number',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Venue
    if (answers.property_county) {
      items.push({
        status: 'done',
        text: `Venue: ${answers.property_county} (county where property is located, per Section 15.011).`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the county where the property is located — this determines mandatory venue.',
      })
    }

    // Legal description
    if (answers.has_legal_description === 'yes') {
      items.push({
        status: 'done',
        text: 'Full legal description of the property obtained.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Obtain the full legal description (metes & bounds or lot/block/subdivision) from your deed, title policy, or county appraisal district.',
      })
    }

    // Court type
    if (answers.total_damages) {
      const courtLabels: Record<string, string> = {
        under_20k: 'Justice of the Peace (JP) Court (under $20K)',
        '20k_to_100k': 'County Court at Law ($20K-$100K)',
        '100k_to_200k': 'District Court ($100K-$200K)',
        over_200k: 'District Court (over $200K)',
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
      }
      items.push({
        status: 'done',
        text: `Filing method: ${methodLabels[answers.filing_method]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Choose a filing method (online or in person).',
      })
    }

    // Fee
    if (answers.can_afford_fee === 'yes') {
      items.push({
        status: 'done',
        text: 'Filing fee: prepared to pay ($300-400 for District Court, $250-350 for County Court, $35-75 for JP Court).',
      })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'Download and complete the Statement of Inability to Afford Payment of Court Costs. File it with your Petition.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine if you can afford the filing fee. Fee waivers are available if you qualify.',
      })
    }

    // Lis pendens
    if (answers.want_lis_pendens === 'yes') {
      items.push({
        status: 'needed',
        text: 'Prepare lis pendens notice with legal description and cause number. File with the County Clerk after your lawsuit is filed (Section 12.007).',
      })
    }

    items.push({
      status: 'info',
      text: 'Remember: real estate venue is mandatory — file in the county where the property is located (Section 15.011).',
    })

    return items
  },
}
