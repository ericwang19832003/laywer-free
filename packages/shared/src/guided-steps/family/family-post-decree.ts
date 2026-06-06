import type { GuidedStepConfig, QuestionDef, SummaryItem } from '../types'

type PostDecreeSubType =
  | 'divorce'
  | 'custody'
  | 'child_support'
  | 'visitation'
  | 'spousal_support'
  | 'modification'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const isSupportRelated = (sub: PostDecreeSubType) =>
  ['child_support', 'spousal_support', 'custody', 'modification'].includes(sub)

const isChildRelated = (sub: PostDecreeSubType) =>
  ['custody', 'visitation', 'modification'].includes(sub)

/* ------------------------------------------------------------------ */
/*  Base questions (all sub-types)                                    */
/* ------------------------------------------------------------------ */

function baseQuestions(): QuestionDef[] {
  return [
    {
      id: 'order_filed',
      type: 'yes_no',
      prompt: 'Have you filed the signed order with the district clerk?',
      helpText:
        'Your case is not final until the signed order is filed with the district clerk. ' +
        'The judge signing the order is only the first step — the clerk must receive and file-stamp it for it to take legal effect.',
    },
    {
      id: 'order_filed_warning',
      type: 'info',
      prompt:
        'IMPORTANT: File the signed order with the district clerk as soon as possible. ' +
        'Until it is filed, the order is not legally effective and cannot be enforced. ' +
        'Take the original signed order to the clerk’s office (or e-file if your county allows it) right away.',
      acknowledgeLabel: 'Understood — I\'ll file it now →',
      showIf: (a) => a.order_filed === 'no',
    },
    {
      id: 'certified_copies',
      type: 'yes_no',
      prompt: 'Have you obtained certified copies of the final order?',
      helpText:
        'You will need certified copies for banks, employers, schools, government agencies, and your own records. ' +
        'Request 3–5 certified copies from the district clerk. The cost is typically $2–$5 per page.',
    },
    {
      id: 'vs165_filed',
      type: 'yes_no',
      prompt: 'Have you filed the VS-165 form (Vital Statistics reporting form)?',
      helpText:
        'Texas law requires a VS-165 form to be filed with the Bureau of Vital Statistics whenever a divorce or custody order is entered. ' +
        'Your attorney (or you, if pro se) is responsible for filing this form. Ask the clerk if you need a blank copy.',
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Divorce-only questions                                            */
/* ------------------------------------------------------------------ */

function divorceQuestions(): QuestionDef[] {
  return [
    {
      id: 'remarriage_restriction_info',
      type: 'info',
      prompt:
        'REMARRIAGE RESTRICTION: Texas law imposes a 30-day waiting period before either party can remarry after a divorce is final. ' +
        'This period begins on the date the decree is signed (not when it is filed). ' +
        'If you remarry before the 30 days have passed, the marriage may be voidable.',
      acknowledgeLabel: 'Noted the 30-day restriction →',
    },
    {
      id: 'name_change',
      type: 'yes_no',
      prompt: 'Did your divorce decree include a name change?',
    },
    {
      id: 'name_change_info',
      type: 'info',
      prompt:
        'NAME CHANGE — UPDATE YOUR RECORDS IN THIS ORDER:\n' +
        '1. Social Security card — visit your local SSA office with your certified decree\n' +
        '2. Texas DPS / driver’s license — bring the new SS card and certified decree\n' +
        '3. Voter registration — update online or at the county elections office\n' +
        '4. U.S. Passport — submit Form DS-5504 with certified decree (or DS-11 if expired)\n' +
        '5. Banks and financial institutions — bring certified decree to each institution\n\n' +
        'Tip: Start with Social Security — most other agencies require the updated SS card as proof.',
      acknowledgeLabel: 'Got it — I\'ll start with Social Security →',
      showIf: (a) => a.name_change === 'yes',
    },
    {
      id: 'property_transfers',
      type: 'yes_no',
      prompt: 'Does your decree require property transfers (real estate, vehicles, retirement accounts)?',
    },
    {
      id: 'property_transfer_types',
      type: 'multi_select',
      prompt: 'Which types of property need to be transferred?',
      options: [
        { value: 'real_estate', label: 'Real estate / home' },
        { value: 'vehicles', label: 'Vehicles' },
        { value: 'retirement', label: 'Retirement accounts (401k, pension, IRA)' },
        { value: 'bank_accounts', label: 'Bank or financial accounts' },
      ],
      noneLabel: 'None of the above',
      showIf: (a) => a.property_transfers === 'yes',
    },
    {
      id: 'property_transfer_real_estate',
      type: 'info',
      prompt:
        'REAL ESTATE TRANSFER:\n' +
        'Execute a Special Warranty Deed to transfer title to the property.\n\n' +
        '• Have the deed drafted (an attorney or title company can help)\n' +
        '• Both parties sign before a notary\n' +
        '• File the signed deed with the county clerk’s office where the property is located\n\n' +
        'Until the deed is filed, title has not legally transferred — even if the decree orders it.',
      acknowledgeLabel: 'Got it — I\'ll execute and file the deed →',
      showIf: (a) => a.property_transfers === 'yes' && (a.property_transfer_types ?? '').includes('real_estate'),
    },
    {
      id: 'property_transfer_vehicles',
      type: 'info',
      prompt:
        'VEHICLE TRANSFER:\n' +
        'Go to the county tax assessor-collector’s office to transfer the title.\n\n' +
        '• Bring the certified decree and the current vehicle title\n' +
        '• The other party must sign the title over to you (or vice versa)\n' +
        '• Pay the title transfer fee\n\n' +
        'Until the title is transferred, the vehicle is still legally in the other person’s name.',
      acknowledgeLabel: 'Got it — I\'ll go to the tax office →',
      showIf: (a) => a.property_transfers === 'yes' && (a.property_transfer_types ?? '').includes('vehicles'),
    },
    {
      id: 'property_transfer_retirement',
      type: 'info',
      prompt:
        'RETIREMENT ACCOUNT TRANSFER (QDRO):\n' +
        'A Qualified Domestic Relations Order (QDRO) is required to divide 401k, pension, or similar retirement accounts.\n\n' +
        '• The QDRO must be prepared separately from the divorce decree\n' +
        '• Send the signed QDRO to the plan administrator via certified mail\n' +
        '• The plan must review and approve the QDRO before any funds can be divided\n' +
        '• Do not delay — some plans have time limits and plan rules change\n\n' +
        'Note: IRAs do not require a QDRO — a direct transfer under the decree is sufficient, but still requires a written instruction to the custodian.',
      acknowledgeLabel: 'Got it — I\'ll get the QDRO prepared →',
      showIf: (a) => a.property_transfers === 'yes' && (a.property_transfer_types ?? '').includes('retirement'),
    },
    {
      id: 'property_transfer_bank',
      type: 'info',
      prompt:
        'BANK AND FINANCIAL ACCOUNT TRANSFERS:\n' +
        'Bring your certified decree to each bank or financial institution.\n\n' +
        '• To close a joint account: both parties typically must agree, or you may need a court order\n' +
        '• To remove a party: bring the decree and ask to update the account ownership\n' +
        '• Open new individual accounts before closing joint ones to avoid gaps in access to funds\n\n' +
        'Do this promptly — joint accounts remain accessible to both parties until officially changed.',
      acknowledgeLabel: 'Got it — I\'ll contact each institution →',
      showIf: (a) => a.property_transfers === 'yes' && (a.property_transfer_types ?? '').includes('bank_accounts'),
    },
    {
      id: 'update_legal_docs_checklist',
      type: 'multi_select',
      prompt: 'Which of these legal documents have you updated since the decree?',
      options: [
        { value: 'will', label: 'Will / Last Will and Testament' },
        { value: 'beneficiaries', label: 'Beneficiary designations (life insurance, retirement accounts, bank accounts)' },
        { value: 'poa', label: 'Power of Attorney — revoked or replaced' },
        { value: 'healthcare_directive', label: 'Healthcare directive / Medical Power of Attorney' },
      ],
      noneLabel: 'None yet — I still need to do these',
      helpText:
        'Texas automatically revokes will provisions favoring an ex-spouse, but beneficiary designations do NOT change automatically. ' +
        'Your ex-spouse could still receive life insurance or retirement benefits if you don’t update them.',
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Support-related questions                                         */
/* ------------------------------------------------------------------ */

function supportQuestions(): QuestionDef[] {
  return [
    {
      id: 'support_ordered',
      type: 'yes_no',
      prompt: 'Was child support or spousal support ordered in your case?',
    },
    {
      id: 'support_setup_info',
      type: 'info',
      prompt:
        'SETTING UP SUPPORT PAYMENTS:\n\n' +
        '1. Set up a child support account with the Texas State Disbursement Unit (SDU) if one was not created automatically.\n\n' +
        '2. Income Withholding Order (IWO): The court should have signed an IWO directing the paying party’s employer to withhold support from their paycheck. If you have the IWO, send it to the employer.\n\n' +
        '3. All payments should go through the SDU — NOT directly between the parties. Direct payments are difficult to prove and may not count as credit if there is a dispute later.\n\n' +
        '4. Texas Attorney General’s Child Support Division can help with enforcement, locate a parent, or set up payments: 1-800-252-8014\n\n' +
        'Keep records of every payment sent or received. The SDU maintains official records, but having your own is wise.',
      acknowledgeLabel: 'Got it — I\'ll set up the SDU payments →',
      showIf: (a) => a.support_ordered === 'yes',
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Child-related questions                                           */
/* ------------------------------------------------------------------ */

function childRelatedQuestions(): QuestionDef[] {
  return [
    {
      id: 'institutions_notified',
      type: 'yes_no',
      prompt:
        'Have you notified schools, doctors, and daycare providers about the new custody order?',
    },
    {
      id: 'institutions_notified_info',
      type: 'info',
      prompt:
        'NOTIFY THESE INSTITUTIONS WITH A CERTIFIED COPY OF THE ORDER:\n\n' +
        '• Schools — provide the order to the front office and counselor so they know who can pick up your child and who receives report cards\n' +
        '• Pediatrician / doctors — update authorized contacts and insurance information\n' +
        '• Daycare / after-school programs — update the authorized pickup list\n' +
        '• Extracurricular activities — coaches and program directors should know the custody schedule\n\n' +
        'Bring a certified copy of the order to each institution. This protects your child and ensures the order is followed.',
      acknowledgeLabel: 'Got it — I\'ll notify all institutions →',
      showIf: (a) => a.institutions_notified === 'no',
    },
  ]
}

/* ------------------------------------------------------------------ */
/*  Summary generator                                                 */
/* ------------------------------------------------------------------ */

function buildSummary(subType: PostDecreeSubType, answers: Record<string, string>): SummaryItem[] {
  const items: SummaryItem[] = []

  // Filing status
  if (answers.order_filed === 'yes') {
    items.push({ status: 'done', text: 'Signed order filed with the district clerk.' })
  } else {
    items.push({ status: 'needed', text: 'File the signed order with the district clerk immediately.' })
  }

  // Certified copies
  if (answers.certified_copies === 'yes') {
    items.push({ status: 'done', text: 'Certified copies obtained.' })
  } else {
    items.push({ status: 'needed', text: 'Obtain 3–5 certified copies from the district clerk ($2–$5/page).' })
  }

  // VS-165
  if (answers.vs165_filed === 'yes') {
    items.push({ status: 'done', text: 'VS-165 form filed with Vital Statistics.' })
  } else {
    items.push({ status: 'needed', text: 'File VS-165 form with the Bureau of Vital Statistics.' })
  }

  // Divorce-specific
  if (subType === 'divorce') {
    items.push({ status: 'info', text: '30-day remarriage restriction applies from the date the decree was signed.' })

    if (answers.name_change === 'yes') {
      items.push({
        status: 'needed',
        text: 'Update your name: SS card → DPS → voter registration → passport → banks.',
      })
    }

    if (answers.property_transfers === 'yes') {
      const types = answers.property_transfer_types ?? ''
      if (types.includes('real_estate')) {
        items.push({ status: 'needed', text: 'Execute and file a Special Warranty Deed to transfer real estate title.' })
      }
      if (types.includes('vehicles')) {
        items.push({ status: 'needed', text: 'Transfer vehicle titles at the county tax assessor-collector’s office.' })
      }
      if (types.includes('retirement')) {
        items.push({ status: 'needed', text: 'Prepare and submit a QDRO to divide retirement accounts.' })
      }
      if (types.includes('bank_accounts')) {
        items.push({ status: 'needed', text: 'Close or retitle joint bank and financial accounts.' })
      }
    }

    // Legal docs checklist
    const updatedDocs = answers.update_legal_docs_checklist ?? ''
    const missingDocs: string[] = []
    if (!updatedDocs.includes('will')) missingDocs.push('will')
    if (!updatedDocs.includes('beneficiaries')) missingDocs.push('beneficiary designations')
    if (!updatedDocs.includes('poa')) missingDocs.push('Power of Attorney')
    if (!updatedDocs.includes('healthcare_directive')) missingDocs.push('healthcare directive')
    if (missingDocs.length > 0) {
      items.push({
        status: 'needed',
        text: `Update these legal documents: ${missingDocs.join(', ')}.`,
      })
    } else {
      items.push({ status: 'done', text: 'Legal documents (will, beneficiaries, POA, healthcare directive) updated.' })
    }
  }

  // Support-related
  if (isSupportRelated(subType) && answers.support_ordered === 'yes') {
    items.push({
      status: 'needed',
      text: 'Set up support through the State Disbursement Unit. Send Income Withholding Order to employer. AG helpline: 1-800-252-8014.',
    })
  }

  // Child-related
  if (isChildRelated(subType)) {
    if (answers.institutions_notified === 'yes') {
      items.push({ status: 'done', text: 'Schools, doctors, and daycare notified of new order.' })
    } else if (answers.institutions_notified === 'no') {
      items.push({
        status: 'needed',
        text: 'Notify schools, doctors, and daycare with a certified copy of the order.',
      })
    }
  }

  return items
}

/* ------------------------------------------------------------------ */
/*  Factory                                                           */
/* ------------------------------------------------------------------ */

export function createPostDecreeConfig(subType: PostDecreeSubType): GuidedStepConfig {
  const questions: QuestionDef[] = [...baseQuestions()]

  if (subType === 'divorce') {
    questions.push(...divorceQuestions())
  }

  if (isSupportRelated(subType)) {
    questions.push(...supportQuestions())
  }

  if (isChildRelated(subType)) {
    questions.push(...childRelatedQuestions())
  }

  return {
    title: 'After the Final Order',
    reassurance:
      'The judge has signed your order — that is a huge milestone. ' +
      'There are a few important steps left to make sure everything is properly recorded and enforced. ' +
      'Take them one at a time. You are almost at the finish line.',
    questions,
    generateSummary: (answers) => buildSummary(subType, answers),
  }
}
