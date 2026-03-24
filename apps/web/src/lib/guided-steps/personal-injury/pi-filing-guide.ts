import type { GuidedStepConfig } from '../types'

export const piFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Personal Injury Lawsuit',
  reassurance:
    'Filing your lawsuit is a straightforward process once you know the steps. This guide covers everything you need.',

  questions: [
    {
      id: 'sol_reminder',
      type: 'info',
      prompt:
        "STATUTE OF LIMITATIONS REMINDER: In Texas, you have 2 years from the date of injury to file a personal injury lawsuit (Tex. Civ. Prac. & Rem. Code \u00a716.003). If you miss this deadline, the court will almost certainly dismiss your case. File as soon as possible to preserve your rights.",
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file your lawsuit?',
      options: [
        { value: 'efile', label: 'E-file through eFileTexas.gov' },
        { value: 'in_person', label: 'In person at the courthouse' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        "E-FILING INSTRUCTIONS:\n1. Go to eFileTexas.gov and create an account (or log in)\n2. Select your county and court type (District Court \u2014 Civil)\n3. Upload your Original Petition, civil case cover sheet, and any attachments as PDFs\n4. Pay the filing fee online by credit/debit card\n5. You'll receive a confirmation email with your cause number once the clerk accepts the filing\n\nNote: Most Texas counties now REQUIRE e-filing. Check with your county clerk if unsure.",
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "IN-PERSON FILING:\n1. Go to the District Clerk's office in the county courthouse\n2. Bring your Original Petition, filing fee (cash, check, or money order \u2014 many clerks don't accept cards), and civil case cover sheet\n3. The clerk will stamp your documents, assign a cause number, and return copies to you\n4. Arrive early \u2014 clerk's offices often close by 4:30 PM\n5. Ask about any local rules or required forms specific to your county",
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        "FILING FEES: Personal injury cases are filed in District Court. Filing fees typically range from $300\u2013$400 depending on the county. Call your county's District Clerk to confirm the exact amount before filing.",
    },
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
      helpText:
        'If not, you may qualify for a fee waiver. Texas law allows people who cannot afford court costs to file for free.',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        "FEE WAIVER: File a \"Statement of Inability to Afford Payment of Court Costs\" with your Original Petition. You qualify if you:\n\u2022 Receive government assistance (SNAP, Medicaid, TANF, SSI)\n\u2022 Have income at or below 125% of the federal poverty line\n\u2022 Cannot pay costs without depriving yourself or dependents of basic necessities\n\nThe court cannot reject your case for non-payment while the waiver is pending.",
      showIf: (answers) => answers.can_afford_fee === 'no',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        "VENUE SELECTION: Under Tex. Civ. Prac. & Rem. Code \u00a715.002, you can file your PI lawsuit in:\n\u2022 The county where the accident occurred, OR\n\u2022 The county where the defendant resides\n\nIf the accident happened in one county and the defendant lives in another, you get to choose. Consider factors like courthouse convenience, jury demographics, and local court schedules when deciding.",
    },
    {
      id: 'documents_ready',
      type: 'yes_no',
      prompt: 'Do you have all the required documents ready to file?',
      helpText:
        "You will need:\n\u2022 Original Petition (your formal complaint describing the accident, injuries, and damages)\n\u2022 Filing fee or fee waiver application\n\u2022 Civil case cover sheet\n\u2022 Any exhibits referenced in your petition (medical records, accident report)",
    },
    {
      id: 'documents_checklist',
      type: 'info',
      prompt:
        "WHAT TO BRING / UPLOAD:\n\u2022 Original Petition \u2014 your formal complaint naming the defendant(s), describing the accident, your injuries, and the damages you seek\n\u2022 Filing fee \u2014 $300\u2013$400 (or fee waiver application)\n\u2022 Civil case cover sheet \u2014 required by most Texas courts\n\u2022 Photo ID (for in-person filing)\n\nTip: Make at least 3 copies of everything \u2014 one for the court, one for service on the defendant, and one for your records.",
      showIf: (answers) => answers.documents_ready === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Texas has a 2-year statute of limitations for personal injury claims (Tex. Civ. Prac. & Rem. Code \u00a716.003). File as soon as possible.',
    })

    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'E-file through eFileTexas.gov',
        in_person: 'In person at the courthouse',
      }
      items.push({
        status: 'done',
        text: `Filing method: ${methodLabels[answers.filing_method] ?? answers.filing_method}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Choose a filing method.' })
    }

    if (answers.can_afford_fee === 'yes') {
      items.push({
        status: 'done',
        text: 'Filing fee ready ($300\u2013$400 in district court; varies by county).',
      })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File a "Statement of Inability to Afford Payment of Court Costs" with your petition.',
      })
    }

    items.push({
      status: 'info',
      text: 'Venue: file in the county where the accident occurred or where the defendant resides (Tex. Civ. Prac. & Rem. Code \u00a715.002).',
    })

    if (answers.documents_ready === 'yes') {
      items.push({ status: 'done', text: 'All filing documents are prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare: Original Petition, filing fee or waiver, civil case cover sheet.',
      })
    }

    return items
  },
}
