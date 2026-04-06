import type { GuidedStepConfig } from '../types'

export const piDisclosuresGuideConfig: GuidedStepConfig = {
  title: 'Understanding Disclosure Obligations',
  reassurance:
    'Disclosures are required information exchanges that happen before discovery. Getting this right prevents sanctions and surprises.',

  questions: [
    {
      id: 'disclosures_overview',
      type: 'info',
      prompt:
        'Disclosures are mandatory information exchanges between parties. The rules differ significantly between Texas state courts and federal courts. Let\'s identify which framework applies to your case.',
    },
    {
      id: 'state_or_federal',
      type: 'single_choice',
      prompt: 'Is your case in state court or federal court?',
      options: [
        { value: 'state', label: 'Texas State Court (Justice, County, or District)' },
        { value: 'federal', label: 'Federal Court (U.S. District Court)' },
      ],
    },
    {
      id: 'federal_disclosures_header',
      type: 'info',
      prompt:
        'Federal Initial Disclosures (FRCP 26(a)(1))\n\nFederal courts require mandatory initial disclosures within 14 days of the Rule 26(f) conference. You must provide:\n\n1. Names and contact info of people with discoverable information you may use\n2. Copies or descriptions of documents and ESI you may use\n3. A computation of each category of damages\n4. Insurance agreements that may cover the judgment',
      showIf: (answers) => answers.state_or_federal === 'federal',
    },
    {
      id: 'federal_disclosure_served',
      type: 'yes_no',
      prompt: 'Have you served your initial disclosures?',
      showIf: (answers) => answers.state_or_federal === 'federal',
    },
    {
      id: 'federal_expert_disclosure',
      type: 'info',
      prompt:
        'Expert Witness Disclosures\n\nYou must disclose expert witnesses at least 90 days before trial (FRCP 26(a)(2)). For rebuttal experts, the deadline is 30 days after the other side\'s expert disclosure.\n\nEach expert must provide a written report including: opinions, basis for opinions, data considered, qualifications, compensation, and prior testimony.',
      showIf: (answers) => answers.state_or_federal === 'federal',
    },
    {
      id: 'federal_supplementation',
      type: 'info',
      prompt:
        'Supplementation Duty\n\nYou have an ongoing duty to supplement your disclosures if you learn new information (FRCP 26(e)). This includes updating witness lists, document lists, and expert reports. Failure to supplement can result in exclusion of evidence at trial.',
      showIf: (answers) => answers.state_or_federal === 'federal',
    },
    {
      id: 'state_disclosures_header',
      type: 'info',
      prompt:
        'Texas State Court \u2014 No Automatic Initial Disclosures\n\nUnlike federal courts, Texas state courts do NOT require automatic initial disclosures. There is no Texas equivalent of FRCP 26(a)(1).\n\nInstead, discovery in Texas state courts begins with:\n- Requests for Disclosure (TRCP 194) \u2014 the opposing party must provide specific information upon request\n- Interrogatories, Requests for Production, etc.\n\nDo NOT confuse federal disclosure requirements with Texas state practice. They are fundamentally different systems.',
      showIf: (answers) => answers.state_or_federal === 'state',
    },
    {
      id: 'state_trcp194',
      type: 'info',
      prompt:
        'Requests for Disclosure (TRCP 194)\n\nIn Texas state court, you can request the following from the opposing party:\n\n- Legal names and addresses of parties\n- Names and contact info of people with knowledge of relevant facts\n- Legal theories and factual bases of claims/defenses\n- Amount and method of calculating damages\n- Insurance agreements\n- Witness statements\n- Medical records and bills (in PI cases)\n- Settlement agreements\n- Expert witness information\n\nThese are requested through discovery, not automatically exchanged.',
      showIf: (answers) => answers.state_or_federal === 'state',
    },
    {
      id: 'disclosure_acknowledged',
      type: 'yes_no',
      prompt: 'I understand which disclosure framework applies to my case.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.state_or_federal === 'federal') {
      items.push({ status: 'info', text: 'Federal disclosure framework applies (FRCP 26(a)).' })

      if (answers.federal_disclosure_served === 'yes') {
        items.push({ status: 'done', text: 'Initial disclosures have been served.' })
      } else if (answers.federal_disclosure_served === 'no') {
        items.push({
          status: 'needed',
          text: 'Serve initial disclosures within 14 days of Rule 26(f) conference.',
        })
      }

      items.push({
        status: 'needed',
        text: 'Track expert disclosure deadline (90 days before trial).',
      })
      items.push({
        status: 'info',
        text: 'Remember ongoing duty to supplement disclosures under FRCP 26(e).',
      })
    } else if (answers.state_or_federal === 'state') {
      items.push({
        status: 'info',
        text: 'Texas state court \u2014 no automatic initial disclosures required.',
      })
      items.push({
        status: 'needed',
        text: 'Send Requests for Disclosure (TRCP 194) to the opposing party.',
      })
      items.push({
        status: 'info',
        text: 'Use interrogatories, requests for production, and other discovery tools as needed.',
      })
    }

    if (answers.disclosure_acknowledged === 'yes') {
      items.push({ status: 'done', text: 'Disclosure framework acknowledged.' })
    }

    return items
  },
}
