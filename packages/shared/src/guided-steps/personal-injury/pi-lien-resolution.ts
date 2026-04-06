import type { GuidedStepConfig } from '../types'

export const piLienResolutionConfig: GuidedStepConfig = {
  title: 'Resolving Medical Liens Before You Get Paid',
  reassurance:
    'Liens can feel overwhelming, but they are a normal part of PI cases. Resolving them properly ensures you keep as much of your settlement as possible.',

  questions: [
    {
      id: 'what_are_liens',
      type: 'info',
      prompt:
        "WHAT ARE MEDICAL LIENS?\nWhen you receive medical treatment after an injury, your medical providers, health insurer, or government programs may place a \"lien\" on your settlement or judgment. This means they have a legal right to be repaid from your recovery BEFORE you receive your share.\n\nCommon lien holders:\n\u2022 Hospitals and doctors who treated you\n\u2022 Health insurance companies (they paid your bills and want reimbursement)\n\u2022 Medicare or Medicaid (federal law requires repayment)\n\u2022 Workers' compensation carriers\n\u2022 ERISA health plans (employer-sponsored insurance)",
    },
    {
      id: 'has_liens',
      type: 'single_choice',
      prompt: 'Do you know if any liens have been placed on your potential recovery?',
      options: [
        { value: 'yes', label: 'Yes, I know about existing liens' },
        { value: 'not_sure', label: "I'm not sure" },
        { value: 'no', label: 'No liens that I know of' },
      ],
    },
    {
      id: 'identify_liens_info',
      type: 'info',
      prompt:
        "HOW TO IDENTIFY ALL LIENS:\n1. Request lien letters from every medical provider who treated you \u2014 ask their billing department if they have filed or intend to file a lien\n2. Contact your health insurance company \u2014 ask if they have a subrogation or reimbursement claim\n3. If you have Medicare: call the Medicare Benefits Coordination & Recovery Center (BCRC) at 1-855-798-2627 to get a conditional payment letter\n4. If you have Medicaid: contact your state Medicaid office for their lien amount\n5. Check court records \u2014 some providers file liens with the county clerk\n6. Review your medical bills file \u2014 any provider who treated you on a \"letter of protection\" will expect payment from your settlement\n\nDo this BEFORE settling your case. You need to know the total lien amount to calculate your actual net recovery.",
      showIf: (answers) => answers.has_liens !== 'no',
    },
    {
      id: 'lien_negotiation',
      type: 'info',
      prompt:
        "NEGOTIATING LIEN REDUCTIONS:\nLien holders will often accept less than the full amount. Here is how:\n\n\u2022 Medical providers typically reduce liens by 30\u201350% \u2014 they would rather get something quickly than pursue collection\n\u2022 Start by sending a letter explaining: the total settlement, attorney fees and costs deducted, other lien amounts, and what remains for you\n\u2022 Argue the \"common fund\" doctrine \u2014 the lien holder benefited from your effort to recover, so they should share the cost\n\u2022 Private health insurers: check your policy language. Texas law may limit their recovery to the \"made whole\" doctrine (they cannot take from you until you are fully compensated)\n\u2022 ERISA plans: more difficult to negotiate \u2014 federal law often preempts state protections. Review the plan language carefully.\n\nAlways get lien reductions IN WRITING before disbursing settlement funds.",
    },
    {
      id: 'has_medicare_medicaid',
      type: 'yes_no',
      prompt: 'Did Medicare or Medicaid pay for any of your accident-related medical treatment?',
    },
    {
      id: 'medicare_medicaid_info',
      type: 'info',
      prompt:
        "MEDICARE/MEDICAID LIENS \u2014 CRITICAL:\n\u2022 Federal law REQUIRES you to repay Medicare and Medicaid from your settlement. This is not optional.\n\u2022 Medicare: Contact the BCRC (1-855-798-2627) to get a conditional payment letter BEFORE settling. You must notify Medicare of any settlement within 60 days.\n\u2022 Medicaid: Contact the Texas Health and Human Services Commission for your Medicaid lien amount.\n\u2022 Failing to resolve government liens can result in penalties, loss of benefits, or personal liability.\n\u2022 Medicare liens CAN be negotiated \u2014 they will often reduce the amount to account for attorney fees and costs (typically a proportional reduction).\n\u2022 You CANNOT distribute settlement funds until government liens are resolved or a plan is in place.\n\nThis is the one area where mistakes can have serious legal consequences. Take it seriously.",
      showIf: (answers) => answers.has_medicare_medicaid === 'yes',
    },
    {
      id: 'net_recovery_calculation',
      type: 'info',
      prompt:
        "CALCULATING YOUR NET RECOVERY:\nHere is how to figure out what you actually take home:\n\nSettlement Amount:           $__________\nMinus Attorney Fees (33%):   - $__________\nMinus Case Costs:            - $__________\nMinus Medical Liens:         - $__________\nMinus Health Insurance Lien: - $__________\nMinus Medicare/Medicaid Lien:- $__________\n= YOUR NET RECOVERY:         $__________\n\nExample: $100,000 settlement\n- Attorney fees (33%): -$33,000\n- Case costs: -$2,000\n- Medical liens (negotiated): -$15,000\n- Health insurance subrogation: -$8,000\n= Net recovery: $42,000\n\nIf you are representing yourself (no attorney fees), your net will be higher, but you still must resolve all liens.",
    },
    {
      id: 'lien_resolution_letter',
      type: 'info',
      prompt:
        "LIEN RESOLUTION LETTER TEMPLATE:\n\n[Your Name]\n[Your Address]\n[Date]\n\n[Lien Holder Name]\n[Lien Holder Address]\n\nRe: Lien Resolution \u2014 [Your Name], Date of Injury: [Date]\n\nDear [Lien Holder]:\n\nI am writing to negotiate a resolution of your lien in the above-referenced matter.\n\nTotal settlement amount: $[amount]\nTotal medical expenses incurred: $[amount]\nYour lien amount: $[amount]\n\nAfter deducting litigation costs and other liens, the net recovery available is $[amount]. I respectfully request that you reduce your lien to $[proposed reduced amount], which represents [X]% of the original lien.\n\nThis reduction is justified because:\n1. The settlement does not fully compensate me for my injuries and damages\n2. You have benefited from the common fund created by this litigation\n3. [Additional reasons specific to your situation]\n\nPlease confirm your acceptance of this reduced amount in writing. I will hold settlement funds pending resolution of all liens.\n\nSincerely,\n[Your Name]",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Medical liens must be resolved before you receive your share of any settlement or judgment.',
    })

    if (answers.has_liens === 'yes' || answers.has_liens === 'not_sure') {
      items.push({
        status: 'needed',
        text: 'Identify all liens: contact every medical provider, your health insurer, and Medicare/Medicaid if applicable.',
      })
    } else {
      items.push({
        status: 'info',
        text: 'Even if no liens are known, verify with all providers and insurers before distributing settlement funds.',
      })
    }

    items.push({
      status: 'info',
      text: 'Medical providers typically reduce liens by 30\u201350%. Always negotiate and get reductions in writing.',
    })

    if (answers.has_medicare_medicaid === 'yes') {
      items.push({
        status: 'needed',
        text: 'CRITICAL: Contact Medicare BCRC (1-855-798-2627) and/or Texas HHS for Medicaid lien amounts. Federal law requires repayment.',
      })
    }

    items.push({
      status: 'info',
      text: 'Net recovery = settlement minus attorney fees, costs, and all liens. Calculate this before accepting any offer.',
    })

    items.push({
      status: 'info',
      text: 'Use the lien resolution letter template to negotiate reductions with each lien holder.',
    })

    return items
  },
}
