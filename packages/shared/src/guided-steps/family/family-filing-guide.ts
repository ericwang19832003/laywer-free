import type { GuidedStepConfig } from '../types'

export const familyFilingGuideConfig: GuidedStepConfig = {
  title: 'How to File Your Family Court Papers',
  reassurance:
    'Filing is the first official step. This guide walks you through every detail so nothing is missed.',

  questions: [
    {
      id: 'jurisdiction_info',
      type: 'info',
      prompt:
        'In Texas, family cases are filed in the District Court of the county where you or your spouse have lived for at least 90 days.',
    },
    {
      id: 'filing_method',
      type: 'single_choice',
      prompt: 'How do you plan to file your papers?',
      options: [
        { value: 'efile', label: 'E-file through eFileTexas.gov' },
        { value: 'in_person', label: 'In person at the courthouse' },
        { value: 'mail', label: 'By mail' },
      ],
    },
    {
      id: 'efile_instructions',
      type: 'info',
      prompt:
        'E-FILING INSTRUCTIONS:\n1. Go to eFileTexas.gov and create an account\n2. Select your county and court type (District Court \u2014 Family)\n3. Upload your Original Petition, cover sheet, and any proposed orders as PDF files\n4. Pay the filing fee online by credit/debit card\n5. You\u2019ll receive a confirmation email with your cause number once the clerk accepts the filing\n\nTip: Most Texas counties now REQUIRE e-filing. Check with your county clerk if you\u2019re unsure.',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'in_person_instructions',
      type: 'info',
      prompt:
        'IN-PERSON FILING:\n1. Go to the District Clerk\u2019s office in your county courthouse\n2. Bring your Original Petition, filing fee (cash, check, or money order \u2014 many clerks don\u2019t accept cards), and cover sheet\n3. The clerk will stamp your documents, assign a cause number, and return copies to you\n4. Arrive early \u2014 clerk\u2019s offices often close by 4:30 PM\n5. Ask the clerk about local rules or required forms specific to your county',
      showIf: (answers) => answers.filing_method === 'in_person',
    },
    {
      id: 'mail_instructions',
      type: 'info',
      prompt:
        'FILING BY MAIL:\n1. Mail the Original Petition, cover sheet, filing fee (check or money order payable to the District Clerk), and a self-addressed stamped envelope\n2. Send via certified mail so you have proof of delivery\n3. The clerk will file-stamp your documents and return copies in your SASE\n4. This method is slower \u2014 allow 1-2 weeks for processing\n\nNote: Some counties may not accept mail filings. Call the clerk\u2019s office first to confirm.',
      showIf: (answers) => answers.filing_method === 'mail',
    },
    {
      id: 'filing_fee_info',
      type: 'info',
      prompt:
        'FILING FEES: In Texas, divorce filing fees typically range from $300\u2013$350, but vary by county. Other family cases (custody, support modifications) may have different fees. Call your county\u2019s District Clerk to confirm the exact amount.',
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
        'FEE WAIVER: File a "Statement of Inability to Afford Payment of Court Costs" (the same form used in civil cases). You qualify if you:\n\u2022 Receive government assistance (SNAP, Medicaid, TANF, SSI)\n\u2022 Have income at or below 125% of the federal poverty line\n\u2022 Cannot pay costs without depriving yourself or dependents of basic necessities\n\nFile this form WITH your Original Petition. The court cannot reject your case for non-payment while the waiver is pending.',
      showIf: (answers) => answers.can_afford_fee === 'no',
    },
    {
      id: 'documents_ready',
      type: 'yes_no',
      prompt: 'Do you have all the required documents ready to file?',
      helpText:
        'You will need:\n\u2022 Original Petition (for divorce, custody, support, etc.)\n\u2022 Filing fee or fee waiver application\n\u2022 Civil case cover sheet\n\u2022 Proposed temporary orders (if requesting immediate relief for custody, support, or property)\n\u2022 Any local forms required by your county',
    },
    {
      id: 'efile_account',
      type: 'yes_no',
      prompt: 'Have you set up your eFileTexas.gov account?',
      showIf: (answers) => answers.filing_method === 'efile',
    },
    {
      id: 'efile_account_setup',
      type: 'info',
      prompt:
        'eFILETEXAS ACCOUNT SETUP:\n1. Go to eFileTexas.gov and click "Register"\n2. Choose a Service Provider (e.g., eFileTexas, File & ServeXpress)\n3. Create your account with name, email, and password\n4. Add a payment method (credit/debit card)\n5. Once registered, you can file in any Texas court that accepts e-filing\n\nThe system walks you through selecting the court, case type, and uploading documents.',
      showIf: (answers) =>
        answers.filing_method === 'efile' && answers.efile_account === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Family cases are filed in the District Court of the county where you or your spouse have lived for at least 90 days.',
    })

    if (answers.filing_method) {
      const methodLabels: Record<string, string> = {
        efile: 'E-file through eFileTexas.gov',
        in_person: 'In person at the courthouse',
        mail: 'By mail',
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
        text: 'Filing fee ready ($300\u2013$350 for divorce; varies by county and case type).',
      })
    } else if (answers.can_afford_fee === 'no') {
      items.push({
        status: 'needed',
        text: 'File a "Statement of Inability to Afford Payment of Court Costs" with your petition.',
      })
    }

    if (answers.documents_ready === 'yes') {
      items.push({ status: 'done', text: 'All filing documents are prepared.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Prepare: Original Petition, filing fee or waiver, cover sheet, and proposed temporary orders (if applicable).',
      })
    }

    if (answers.filing_method === 'efile') {
      if (answers.efile_account === 'yes') {
        items.push({ status: 'done', text: 'eFileTexas.gov account is set up.' })
      } else {
        items.push({
          status: 'needed',
          text: 'Set up your eFileTexas.gov account before filing.',
        })
      }
    }

    return items
  },
}
