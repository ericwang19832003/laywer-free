import type { GuidedStepConfig } from '../types'

export const debtExemptionClaimConfig: GuidedStepConfig = {
  title: 'Claiming Your Protected Property',
  reassurance:
    'Even after a judgment, Texas protects most of your property. You have strong rights \u2014 let\u2019s make sure you use them.',

  questions: [
    {
      id: 'protections_intro',
      type: 'info',
      prompt:
        'Texas has some of the STRONGEST debtor protections in the country. Even if you lost your case, most of your property is protected by law. You must act within 14 days of receiving notice of collection.',
    },
    {
      id: 'collection_attempted',
      type: 'yes_no',
      prompt: 'Has the creditor attempted to collect on the judgment?',
    },
    {
      id: 'collection_type',
      type: 'single_choice',
      prompt: 'What type of collection has been attempted?',
      showIf: (answers) => answers.collection_attempted === 'yes',
      options: [
        { value: 'bank_levy', label: 'Froze my bank account' },
        { value: 'property_lien', label: 'Filed a lien on my property' },
        { value: 'turnover_order', label: 'Court ordered turnover of assets' },
        { value: 'wage_garnishment', label: 'Tried to garnish my wages' },
        { value: 'not_sure', label: "I'm not sure" },
      ],
    },
    {
      id: 'wage_garnishment_info',
      type: 'info',
      prompt:
        'GOOD NEWS \u2014 Texas PROHIBITS wage garnishment for consumer debt. Your employer cannot legally garnish your wages for this type of debt. If they try, this is illegal and you should inform the court immediately.',
      showIf: (answers) => answers.collection_type === 'wage_garnishment',
    },
    {
      id: 'exemptions_overview',
      type: 'info',
      prompt:
        'TEXAS PROPERTY EXEMPTIONS:\n\n\u2022 Homestead: Unlimited value (urban up to 10 acres, rural up to 200 acres). Cannot be forced to sell your home.\n\n\u2022 Personal property: $50,000 individual / $100,000 family \u2014 includes clothing, furniture, food, tools of trade, vehicles, animals, athletic equipment, and more under \u00a7 42.001\u201342.002.\n\n\u2022 Wages: Current wages are 100% exempt. Once deposited in your bank account, they remain protected for 2 months.\n\n\u2022 Retirement: All qualified retirement accounts are fully exempt (IRA, 401k, pension, etc.).\n\n\u2022 Government benefits: Social Security, VA benefits, and disability payments are fully exempt and protected for 2 months in your bank account.\n\n\u2022 Life insurance and annuities are also exempt.',
    },
    {
      id: 'exemption_form_filed',
      type: 'yes_no',
      prompt: 'Have you filed a Protected Property Claim Form with the court?',
    },
    {
      id: 'file_within_14_days',
      type: 'info',
      prompt:
        'FILE WITHIN 14 DAYS \u2014 After receiving notice that your property will be seized, you must file a claim of exemption with the court within 14 days. The court will schedule a hearing where you can prove your property is exempt. Bring documentation: pay stubs for wages, bank statements showing the source of deposits, and retirement account statements.',
      showIf: (answers) => answers.exemption_form_filed === 'no',
    },
    {
      id: 'how_to_file',
      type: 'info',
      prompt:
        'HOW TO FILE \u2014 Get the Protected Property Claim Form from the court clerk or TexasLawHelp.org. List each item of property you claim is exempt and the legal basis for the exemption. File the completed form with the court and serve a copy on the creditor\u2019s attorney.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Collection status
    if (answers.collection_attempted === 'yes') {
      const collectionLabels: Record<string, string> = {
        bank_levy: 'bank account freeze',
        property_lien: 'property lien',
        turnover_order: 'turnover order',
        wage_garnishment: 'wage garnishment attempt',
        not_sure: 'unknown collection method',
      }
      const method = collectionLabels[answers.collection_type] ?? 'collection attempt'
      items.push({
        status: 'info',
        text: `Creditor has attempted collection via ${method}.`,
      })

      if (answers.collection_type === 'wage_garnishment') {
        items.push({
          status: 'info',
          text: 'Texas prohibits wage garnishment for consumer debt. This attempt is illegal \u2014 notify the court.',
        })
      }
    } else if (answers.collection_attempted === 'no') {
      items.push({
        status: 'info',
        text: 'No collection attempted yet. Be prepared \u2014 know your exemptions before they act.',
      })
    }

    // Exemption form status
    if (answers.exemption_form_filed === 'yes') {
      items.push({
        status: 'done',
        text: 'Protected Property Claim Form has been filed.',
      })
    } else if (answers.exemption_form_filed === 'no') {
      items.push({
        status: 'needed',
        text: 'File a Protected Property Claim Form within 14 days of receiving notice of collection. Get the form from the court clerk or TexasLawHelp.org.',
      })
    }

    // Urgency note when collection is active but form not filed
    if (
      answers.collection_attempted === 'yes' &&
      answers.exemption_form_filed === 'no'
    ) {
      items.push({
        status: 'needed',
        text: 'URGENT: Collection is active and you have not yet filed your exemption claim. Act immediately \u2014 the 14-day deadline is critical.',
      })
    }

    items.push({
      status: 'info',
      text: 'Texas protects your homestead, personal property (up to $50K/$100K), wages, retirement accounts, and government benefits from most creditor collection.',
    })

    return items
  },
}
