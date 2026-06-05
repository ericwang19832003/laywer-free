import type { GuidedStepConfig } from '../types'
import { isPiPropertyDamageSubtype } from './pi-litigation-file'

const personalInjuryFilingGuideConfig: GuidedStepConfig = {
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
      id: 'trcp_47c_reminder',
      type: 'info',
      prompt:
        'REQUIRED IN EVERY TEXAS PETITION — TRCP 47(c) DAMAGES TIER:\n\nYour Original Petition MUST include exactly one of these four statements. Without it, your filing is defective and a default judgment may be capped.\n\n1. "Only nonmonetary relief is sought."\n2. "Monetary relief of $250,000 or less."\n3. "Monetary relief over $250,000 but not more than $1,000,000."\n4. "Monetary relief over $1,000,000."\n\nThis statement also determines which court has jurisdiction. For most personal injury cases, choose option 3 or 4. Add it to your petition under a paragraph titled "Discovery Control Plan and Damages" or similar.',
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

const propertyDamageFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Property Damage Lawsuit',
  reassurance:
    'Filing a property damage lawsuit works best when your petition, repair evidence, service copies, and filing method are ready before you submit anything to the clerk.',

  questions: [
    {
      id: 'sol_reminder',
      type: 'info',
      prompt:
        'STATUTE OF LIMITATIONS REMINDER: In Texas, many property damage claims must be filed within 2 years from the date your property was damaged (Tex. Civ. Prac. & Rem. Code §16.003). File as soon as possible to preserve your rights.',
    },
    {
      id: 'trcp_47c_reminder',
      type: 'info',
      prompt:
        'REQUIRED IN EVERY TEXAS PETITION — TRCP 47(c) DAMAGES TIER:\n\nYour Original Petition must include exactly one damages-tier statement. For a property damage case, choose the tier that matches your total claimed damages, such as repair or replacement cost, loss of use, towing, storage, rental, diminished value, and other out-of-pocket losses.\n\n1. "Only nonmonetary relief is sought."\n2. "Monetary relief of $250,000 or less."\n3. "Monetary relief over $250,000 but not more than $1,000,000."\n4. "Monetary relief over $1,000,000."\n\nMost property damage cases use option 2 unless the documented damages exceed $250,000. Add the statement under a paragraph titled "Discovery Control Plan and Damages" or similar.',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file your property damage petition?',
      options: [
        { value: 'efile', label: 'E-file through eFileTexas.gov' },
        { value: 'in_person', label: 'In person at the courthouse' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        "E-FILING INSTRUCTIONS:\n1. Go to eFileTexas.gov and choose a service provider\n2. Create an account or log in\n3. Select the correct county, court, and civil case category\n4. Upload your Original Petition, civil case cover sheet, and property damage exhibits as PDFs\n5. Pay the filing fee or upload your fee waiver\n6. Save the clerk's confirmation, file-stamped petition, and case number",
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        "IN-PERSON FILING:\n1. Go to the clerk's office for the court you selected\n2. Bring your Original Petition, civil case cover sheet, filing fee or fee waiver, and exhibit copies\n3. Ask the clerk to file-stamp your copies and assign the case number\n4. Keep one filed copy for your records and one copy for service on each defendant\n5. Ask the clerk about local service forms or citation requests",
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        'FILING FEES: Property damage filing fees vary by court and county. The amount may differ depending on whether you file in justice court, county court, or district court. Confirm the fee with the clerk before filing.',
    },
    {
      id: 'can_afford_fee',
      type: 'yes_no',
      prompt: 'Can you afford the filing fee?',
      helpText:
        'If not, you may qualify for a fee waiver. Texas law allows people who cannot afford court costs to file a Statement of Inability to Afford Payment of Court Costs.',
    },
    {
      id: 'fee_waiver_info',
      type: 'info',
      prompt:
        'FEE WAIVER: File a "Statement of Inability to Afford Payment of Court Costs" with your Original Petition if you cannot afford the fee. The court should not reject your case for non-payment while the waiver is pending.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },
    {
      id: 'venue_info',
      type: 'info',
      prompt:
        'VENUE SELECTION: For many Texas civil property damage claims, venue is commonly based on where the damage occurred or where the defendant resides. Confirm the court and county before filing, especially if the damage happened in a different county from where the defendant lives.',
    },
    {
      id: 'documents_ready',
      type: 'yes_no',
      prompt: 'Do you have all property damage filing documents ready?',
      helpText:
        'You will need: Original Petition, civil case cover sheet, filing fee or fee waiver, repair estimate, photos, invoices or receipts, proof of ownership or responsibility, and copies for service.',
    },
    {
      id: 'documents_checklist',
      type: 'info',
      prompt:
        'WHAT TO BRING / UPLOAD:\n• Original Petition naming the defendant and explaining how your property was damaged\n• Civil case cover sheet\n• Filing fee or fee waiver\n• Repair estimate, repair invoice, photos, receipts, towing/storage/rental records, and any appraisal\n• A copy for the court, one for each defendant, and one for your records',
      showIf: (answers) => answers.documents_ready === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Texas commonly uses a 2-year limitations period for property damage claims. File as soon as possible.',
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
      items.push({ status: 'done', text: 'Filing fee ready.' })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File a Statement of Inability to Afford Payment of Court Costs with your petition.',
      })
    }

    items.push({
      status: 'info',
      text: 'Venue: confirm the correct court and county before filing; property damage cases often depend on where the damage happened or where the defendant resides.',
    })

    if (answers.documents_ready === 'yes') {
      items.push({ status: 'done', text: 'Property damage filing documents are prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare: Original Petition, civil case cover sheet, fee or waiver, repair estimate, photos, receipts, and copies for service.',
      })
    }

    return items
  },
}

export function createPiFilingGuideConfig(piSubType?: string | null): GuidedStepConfig {
  return isPiPropertyDamageSubtype(piSubType)
    ? propertyDamageFilingGuideConfig
    : personalInjuryFilingGuideConfig
}

export const piFilingGuideConfig: GuidedStepConfig = personalInjuryFilingGuideConfig
