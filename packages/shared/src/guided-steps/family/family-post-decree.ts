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
        'The judge signing the order is only the first step \u2014 the clerk must receive and file-stamp it for it to take legal effect.',
    },
    {
      id: 'order_filed_warning',
      type: 'info',
      prompt:
        'IMPORTANT: File the signed order with the district clerk as soon as possible. ' +
        'Until it is filed, the order is not legally effective and cannot be enforced. ' +
        'Take the original signed order to the clerk\u2019s office (or e-file if your county allows it) right away.',
      showIf: (a) => a.order_filed === 'no',
    },
    {
      id: 'certified_copies',
      type: 'yes_no',
      prompt: 'Have you obtained certified copies of the final order?',
      helpText:
        'You will need certified copies for banks, employers, schools, government agencies, and your own records. ' +
        'Request 3\u20135 certified copies from the district clerk. The cost is typically $2\u2013$5 per page.',
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
        'NAME CHANGE \u2014 UPDATE YOUR RECORDS IN THIS ORDER:\n' +
        '1. Social Security card \u2014 visit your local SSA office with your certified decree\n' +
        '2. Texas DPS / driver\u2019s license \u2014 bring the new SS card and certified decree\n' +
        '3. Voter registration \u2014 update online or at the county elections office\n' +
        '4. U.S. Passport \u2014 submit Form DS-5504 with certified decree (or DS-11 if expired)\n' +
        '5. Banks and financial institutions \u2014 bring certified decree to each institution\n\n' +
        'Tip: Start with Social Security \u2014 most other agencies require the updated SS card as proof.',
      showIf: (a) => a.name_change === 'yes',
    },
    {
      id: 'property_transfers',
      type: 'yes_no',
      prompt: 'Does your decree require property transfers (real estate, vehicles, retirement accounts)?',
    },
    {
      id: 'property_transfers_info',
      type: 'info',
      prompt:
        'PROPERTY TRANSFERS \u2014 FOLLOW-UP STEPS:\n\n' +
        '\u2022 Real estate: Execute a Special Warranty Deed to transfer title. File the deed with the county clerk\u2019s office where the property is located.\n\n' +
        '\u2022 Vehicles: Go to the county tax assessor-collector\u2019s office to transfer title. Bring the certified decree and current title.\n\n' +
        '\u2022 Retirement accounts (401k, pension, IRA): A Qualified Domestic Relations Order (QDRO) must be prepared and sent to the plan administrator via certified mail. The plan must approve the QDRO before funds can be divided. Do not delay \u2014 some plans have time limits.\n\n' +
        '\u2022 Bank accounts: Bring your certified decree to each bank to close joint accounts or remove a party.\n\n' +
        'Complete these transfers promptly. Delays can create legal complications and financial risk.',
      showIf: (a) => a.property_transfers === 'yes',
    },
    {
      id: 'update_legal_docs_info',
      type: 'info',
      prompt:
        'UPDATE YOUR LEGAL DOCUMENTS: After a divorce, review and update these documents as soon as possible:\n\n' +
        '\u2022 Will / Last Will and Testament \u2014 Texas automatically revokes provisions favoring an ex-spouse, but it\u2019s best to create an updated will\n' +
        '\u2022 Beneficiary designations \u2014 life insurance, retirement accounts, bank accounts (these do NOT automatically change)\n' +
        '\u2022 Power of Attorney \u2014 revoke any POA naming your ex-spouse\n' +
        '\u2022 Healthcare directives / Medical Power of Attorney \u2014 update to name a new agent\n\n' +
        'Failing to update beneficiary designations is one of the most common post-divorce mistakes. ' +
        'Your ex-spouse could still receive your retirement or life insurance benefits if you don\u2019t update them.',
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
        '2. Income Withholding Order (IWO): The court should have signed an IWO directing the paying party\u2019s employer to withhold support from their paycheck. If you have the IWO, send it to the employer.\n\n' +
        '3. All payments should go through the SDU \u2014 NOT directly between the parties. Direct payments are difficult to prove and may not count as credit if there is a dispute later.\n\n' +
        '4. Texas Attorney General\u2019s Child Support Division can help with enforcement, locate a parent, or set up payments: 1-800-252-8014\n\n' +
        'Keep records of every payment sent or received. The SDU maintains official records, but having your own is wise.',
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
        '\u2022 Schools \u2014 provide the order to the front office and counselor so they know who can pick up your child and who receives report cards\n' +
        '\u2022 Pediatrician / doctors \u2014 update authorized contacts and insurance information\n' +
        '\u2022 Daycare / after-school programs \u2014 update the authorized pickup list\n' +
        '\u2022 Extracurricular activities \u2014 coaches and program directors should know the custody schedule\n\n' +
        'Bring a certified copy of the order to each institution. This protects your child and ensures the order is followed.',
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
    items.push({ status: 'needed', text: 'Obtain 3\u20135 certified copies from the district clerk ($2\u2013$5/page).' })
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
        text: 'Update your name: SS card \u2192 DPS \u2192 voter registration \u2192 passport \u2192 banks.',
      })
    }

    if (answers.property_transfers === 'yes') {
      items.push({
        status: 'needed',
        text: 'Complete property transfers: deeds, vehicle titles, QDRO for retirement, bank accounts.',
      })
    }

    items.push({
      status: 'info',
      text: 'Update your will, beneficiary designations, POA, and healthcare directives.',
    })
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
      'The judge has signed your order \u2014 that is a huge milestone. ' +
      'There are a few important steps left to make sure everything is properly recorded and enforced. ' +
      'Take them one at a time. You are almost at the finish line.',
    questions,
    generateSummary: (answers) => buildSummary(subType, answers),
  }
}
