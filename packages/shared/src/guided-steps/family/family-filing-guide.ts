import type { GuidedStepConfig } from '../types'

type FamilyFilingSubType =
  | 'divorce'
  | 'custody'
  | 'child_support'
  | 'visitation'
  | 'spousal_support'
  | 'protective_order'
  | 'modification'

type FamilyFilingCopy = {
  title: string
  caseLabel: string
  jurisdiction: string
  feeInfo: string
  documents: string
  summaryJurisdiction: string
  summaryDocuments: string
  noFee?: boolean
}

function normalizeFamilySubType(
  familySubType?: string | null
): FamilyFilingSubType {
  if (
    familySubType === 'custody' ||
    familySubType === 'child_support' ||
    familySubType === 'visitation' ||
    familySubType === 'spousal_support' ||
    familySubType === 'protective_order' ||
    familySubType === 'modification'
  ) {
    return familySubType
  }

  return 'divorce'
}

function getCopy(subType: FamilyFilingSubType): FamilyFilingCopy {
  switch (subType) {
    case 'custody':
      return {
        title: 'How to File Your Custody Case',
        caseLabel: 'custody or SAPCR',
        jurisdiction:
          "Custody or SAPCR cases are usually filed in the child's home county. If there is already a Texas custody order, file in the court with continuing jurisdiction unless a transfer is required.",
        feeInfo:
          "Custody or SAPCR filing fees vary by county and case type. Call the District Clerk before filing and ask whether a children's-court or family-court local form is required.",
        documents:
          "You will need:\n- Petition in Suit Affecting the Parent-Child Relationship (SAPCR)\n- Civil case cover sheet\n- Child's birth certificate or parentage documents if available\n- UCCJEA affidavit if required by your county\n- Proposed temporary orders if requesting immediate custody, visitation, or support orders\n- Filing fee or fee waiver application",
        summaryJurisdiction:
          "File the custody or SAPCR case in the child's home county or the court with continuing jurisdiction if an order already exists.",
        summaryDocuments:
          'Prepare the SAPCR petition, cover sheet, child/parentage records, any UCCJEA affidavit, proposed temporary orders, and filing fee or waiver.',
      }
    case 'child_support':
      return {
        title: 'How to File Your Child Support Case',
        caseLabel: 'child support',
        jurisdiction:
          "Child support cases are usually filed as a SAPCR in the child's home county. If an existing order already controls support, file in the court with continuing jurisdiction unless a transfer is required.",
        feeInfo:
          "Child support filing fees vary. You may also be able to work with the Texas Attorney General's Child Support Division instead of opening a private case.",
        documents:
          "You will need:\n- Petition requesting child support or modification\n- Civil case cover sheet\n- Existing order, if any\n- Pay stubs, tax returns, insurance cost information, and childcare cost proof\n- Proposed temporary orders if needed\n- Filing fee or fee waiver application",
        summaryJurisdiction:
          "File the child support case in the child's home county or the court with continuing jurisdiction if an order already exists.",
        summaryDocuments:
          'Prepare the support petition, cover sheet, existing order if any, income/insurance/childcare records, proposed orders, and filing fee or waiver.',
      }
    case 'visitation':
      return {
        title: 'How to File Your Visitation Case',
        caseLabel: 'visitation',
        jurisdiction:
          "Visitation cases are usually filed as a SAPCR in the child's home county. If a custody order already exists, file in the court with continuing jurisdiction unless transfer rules apply.",
        feeInfo:
          'Visitation filing fees vary by county. Ask the District Clerk for the exact fee and local standing-order requirements.',
        documents:
          "You will need:\n- Petition requesting possession and access/visitation\n- Civil case cover sheet\n- Existing custody or visitation order, if any\n- Proposed possession schedule\n- Evidence showing why the requested schedule supports the child's best interest\n- Filing fee or fee waiver application",
        summaryJurisdiction:
          "File the visitation case in the child's home county or the court with continuing jurisdiction if an order already exists.",
        summaryDocuments:
          'Prepare the visitation petition, cover sheet, existing order if any, proposed schedule, best-interest evidence, and filing fee or waiver.',
      }
    case 'spousal_support':
      return {
        title: 'How to File Your Spousal Support Papers',
        caseLabel: 'spousal support',
        jurisdiction:
          'Spousal support is usually requested in a divorce, enforcement, or modification case. File in the family court handling the divorce or the court with continuing jurisdiction over the order.',
        feeInfo:
          'Spousal support filing fees depend on whether you are filing a new divorce, enforcement, or modification. Call the District Clerk to confirm the correct fee.',
        documents:
          'You will need:\n- Petition or motion requesting spousal support/maintenance\n- Civil case cover sheet\n- Existing divorce decree or order, if any\n- Income, disability, expense, and employment records\n- Proposed temporary orders if seeking immediate support\n- Filing fee or fee waiver application',
        summaryJurisdiction:
          'File in the family court handling the divorce or the court with continuing jurisdiction over the existing order.',
        summaryDocuments:
          'Prepare the support petition/motion, cover sheet, existing order if any, income and expense records, proposed orders, and filing fee or waiver.',
      }
    case 'protective_order':
      return {
        title: 'How to File Your Protective Order Application',
        caseLabel: 'protective order',
        jurisdiction:
          'A protective order application can usually be filed in the county where you live, where the respondent lives, or where the family violence occurred. If safety is urgent, contact the courthouse, prosecutor, or family-violence resource center right away.',
        feeInfo:
          'There is no filing fee for a family-violence protective order application. The court should not charge you to file or serve the respondent.',
        documents:
          'You will need:\n- Application for Protective Order\n- Any incident dates, police reports, photos, medical records, messages, or witness information\n- Addresses or identifying information for the respondent, if safe to provide\n- Any temporary ex parte order request if immediate protection is needed',
        summaryJurisdiction:
          'File the protective order application in a county connected to you, the respondent, or the family-violence incident.',
        summaryDocuments:
          'Prepare the protective order application, incident evidence, respondent identifying information if safe, and any temporary ex parte order request.',
        noFee: true,
      }
    case 'modification':
      return {
        title: 'How to File Your Modification Case',
        caseLabel: 'modification',
        jurisdiction:
          'Modification cases are usually filed in the court with continuing jurisdiction over the existing order. If the child or parties moved, ask the clerk whether a transfer is needed.',
        feeInfo:
          'Modification filing fees vary by county. Ask the District Clerk for the exact filing fee and whether local forms are required.',
        documents:
          'You will need:\n- Petition to Modify the Parent-Child Relationship or other modification petition\n- Civil case cover sheet\n- Current court order\n- Evidence of changed circumstances\n- Proposed modified order\n- Filing fee or fee waiver application',
        summaryJurisdiction:
          'File in the court with continuing jurisdiction over the existing order unless a transfer is required.',
        summaryDocuments:
          'Prepare the modification petition, cover sheet, current order, changed-circumstances evidence, proposed order, and filing fee or waiver.',
      }
    case 'divorce':
    default:
      return {
        title: 'How to File Your Divorce Papers',
        caseLabel: 'divorce',
        jurisdiction:
          'In Texas, divorce cases are usually filed in the District Court of a county where you or your spouse has lived for at least 90 days, after one spouse has lived in Texas for at least 6 months.',
        feeInfo:
          'Divorce filing fees often range from $300-$350, but vary by county. Call the District Clerk to confirm the exact amount and any local forms.',
        documents:
          'You will need:\n- Original Petition for Divorce\n- Civil case cover sheet\n- Proposed temporary orders if requesting immediate relief for children, support, or property\n- Standing-order acknowledgement if your county requires it\n- Filing fee or fee waiver application',
        summaryJurisdiction:
          'File the divorce in a county where you or your spouse has lived for at least 90 days, after Texas residency is met.',
        summaryDocuments:
          'Prepare the divorce petition, cover sheet, proposed temporary orders if needed, local standing-order forms, and filing fee or waiver.',
      }
  }
}

export function createFamilyFilingGuideConfig(
  familySubType?: string | null
): GuidedStepConfig {
  const subType = normalizeFamilySubType(familySubType)
  const copy = getCopy(subType)

  return {
    title: copy.title,
    reassurance:
      'Filing is the first official step. This guide walks you through the court, documents, fees, and confirmation details so nothing is missed.',

    questions: [
      {
        id: 'jurisdiction_info',
        type: 'info',
        prompt: copy.jurisdiction,
      },
      {
        id: 'filing_method',
        type: 'single_choice',
        prompt: `How do you plan to file your ${copy.caseLabel} papers?`,
        options: [
          { value: 'efile', label: 'E-file through eFileTexas.gov' },
          { value: 'in_person', label: 'In person at the courthouse' },
          { value: 'mail', label: 'By mail' },
        ],
      },
      {
        id: 'efile_instructions',
        type: 'info',
        prompt: `E-FILING INSTRUCTIONS:\n1. Go to eFileTexas.gov and choose a service provider\n2. Create or sign in to your account\n3. Select your county and the family court or district clerk\n4. Upload your ${copy.caseLabel} filing documents as PDFs\n5. Submit payment or a fee waiver if a fee applies\n6. Save the envelope number, acceptance email, and cause number once assigned\n\nTip: Many Texas counties require e-filing. If you are unsure, call the clerk before filing.`,
        showIf: (answers) => answers.filing_method === 'efile',
      },
      {
        id: 'in_person_instructions',
        type: 'info',
        prompt: `IN-PERSON FILING:\n1. Go to the District Clerk's office or the clerk named by your county for family cases\n2. Bring the signed filing documents, copies, and any required local forms\n3. Bring the filing fee or fee waiver unless this is a no-fee filing\n4. Ask the clerk to file-stamp your copy and assign or confirm the cause number\n5. Ask about local rules, standing orders, and service options`,
        showIf: (answers) => answers.filing_method === 'in_person',
      },
      {
        id: 'mail_instructions',
        type: 'info',
        prompt: `FILING BY MAIL:\n1. Mail the signed filing documents, cover sheet, any filing fee or fee waiver, and a self-addressed stamped envelope\n2. Send by certified mail so you have proof of delivery\n3. The clerk should return file-stamped copies in your envelope\n4. This method is slower. Allow 1-2 weeks for processing and call the clerk to confirm acceptance.\n\nNote: Some counties may not accept mail filings. Call first to confirm.`,
        showIf: (answers) => answers.filing_method === 'mail',
      },
      {
        id: 'filing_fee_info',
        type: 'info',
        prompt: `FILING FEES: ${copy.feeInfo}`,
      },
      ...(copy.noFee
        ? []
        : [
            {
              id: 'can_afford_fee',
              type: 'yes_no' as const,
              prompt: 'Can you afford the filing fee?',
              helpText:
                'If not, you may qualify for a fee waiver. Texas law allows people who cannot afford court costs to file without paying up front.',
            },
            {
              id: 'fee_waiver_info',
              type: 'info' as const,
              prompt:
                'FEE WAIVER: File a "Statement of Inability to Afford Payment of Court Costs" with your filing. The form asks for income, benefits, expenses, and dependents. File it at the same time as your petition or motion.',
              showIf: (answers: Record<string, string>) =>
                answers.can_afford_fee === 'no',
            },
          ]),
      {
        id: 'documents_ready',
        type: 'yes_no',
        prompt: 'Do you have all the required documents ready to file?',
        helpText: copy.documents,
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
          'eFILETEXAS ACCOUNT SETUP:\n1. Go to eFileTexas.gov and choose a service provider\n2. Register with your name, email, and password\n3. Add a payment method if a fee applies\n4. Start a new envelope, select the court, upload PDFs, and submit\n5. Save the envelope number and acceptance confirmation',
        showIf: (answers) =>
          answers.filing_method === 'efile' && answers.efile_account === 'no',
      },
    ],

    generateSummary(answers) {
      const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

      items.push({
        status: 'info',
        text: copy.summaryJurisdiction,
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

      if (copy.noFee) {
        items.push({
          status: 'info',
          text: 'No filing fee should be charged for this protective order application.',
        })
      } else if (answers.can_afford_fee === 'yes') {
        items.push({
          status: 'done',
          text: 'Filing fee is ready.',
        })
      } else if (answers.can_afford_fee === 'no') {
        items.push({
          status: 'needed',
          text: 'File a "Statement of Inability to Afford Payment of Court Costs" with your petition or motion.',
        })
      }

      if (answers.documents_ready === 'yes') {
        items.push({ status: 'done', text: 'All filing documents are prepared.' })
      } else {
        items.push({
          status: 'needed',
          text: copy.summaryDocuments,
        })
      }

      if (answers.filing_method === 'efile') {
        if (answers.efile_account === 'yes') {
          items.push({ status: 'done', text: 'eFileTexas.gov account is set up.' })
        } else {
          items.push({
            status: 'needed',
            text: 'Choose a service provider and set up your eFileTexas.gov account before filing.',
          })
        }
      }

      return items
    },
  }
}

export const familyFilingGuideConfig: GuidedStepConfig =
  createFamilyFilingGuideConfig('divorce')
