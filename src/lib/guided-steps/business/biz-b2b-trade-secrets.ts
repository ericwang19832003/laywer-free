import type { GuidedStepConfig } from '../types'

export const bizB2bTradeSecretsConfig: GuidedStepConfig = {
  title: 'Protecting Your Trade Secrets',
  reassurance:
    'Texas law provides strong protections for trade secrets. If someone stole yours, you can recover damages AND get a court order to stop them.',

  questions: [
    {
      id: 'trade_secret_type',
      type: 'single_choice',
      prompt: 'What type of trade secret was misappropriated?',
      helpText:
        'Under the Texas Uniform Trade Secrets Act (TUTSA — Tex. Civ. Prac. & Rem. Code Ch. 134A), a trade secret includes formulas, patterns, compilations, programs, devices, methods, techniques, or processes.',
      options: [
        { value: 'customer_list', label: 'Customer lists or contact information' },
        { value: 'formula', label: 'Formulas, recipes, or chemical compositions' },
        { value: 'process', label: 'Manufacturing or business processes' },
        { value: 'pricing', label: 'Pricing strategies or cost data' },
        { value: 'software', label: 'Source code or algorithms' },
        { value: 'other', label: 'Other confidential business information' },
      ],
    },
    {
      id: 'reasonable_measures',
      type: 'yes_no',
      prompt: 'Did you take reasonable measures to keep this information secret?',
      helpText:
        'TUTSA requires the owner to have taken "reasonable measures" to keep the information secret. Examples: NDAs, password protection, "Confidential" markings, restricted access, employee training.',
    },
    {
      id: 'measures_detail',
      type: 'single_choice',
      prompt: 'Which protective measures did you use? (Select the best match)',
      showIf: (answers) => answers.reasonable_measures === 'yes',
      options: [
        { value: 'nda_only', label: 'Non-disclosure agreements (NDAs)' },
        { value: 'access_controls', label: 'Access controls (passwords, restricted files)' },
        { value: 'multiple', label: 'Multiple measures (NDAs + access controls + markings)' },
        { value: 'comprehensive', label: 'Comprehensive program (all above + employee training)' },
      ],
    },
    {
      id: 'no_measures_warning',
      type: 'info',
      prompt:
        'This is a serious problem. Under TUTSA, you must prove you took "reasonable measures" to keep the information secret. Without protective measures, a court may find the information does not qualify as a trade secret. Start implementing protections immediately and document what measures existed before the misappropriation.',
      showIf: (answers) => answers.reasonable_measures === 'no',
    },
    {
      id: 'misappropriation_method',
      type: 'single_choice',
      prompt: 'How was the trade secret misappropriated?',
      options: [
        { value: 'former_employee', label: 'Former employee took it to a competitor' },
        { value: 'breach_nda', label: 'Someone breached an NDA or confidentiality agreement' },
        { value: 'hacking', label: 'Unauthorized access (hacking, stolen credentials)' },
        { value: 'business_partner', label: 'Business partner or vendor disclosed it' },
        { value: 'reverse_engineer', label: 'Reverse engineering (may be lawful)' },
        { value: 'other', label: 'Other improper means' },
      ],
    },
    {
      id: 'reverse_engineering_note',
      type: 'info',
      prompt:
        'Important: Under TUTSA, reverse engineering of a lawfully acquired product is generally NOT misappropriation. If the information was obtained through reverse engineering of a publicly available product, your claim may be weak. However, if the person had a contractual obligation not to reverse engineer (e.g., in a license agreement), that changes the analysis.',
      showIf: (answers) => answers.misappropriation_method === 'reverse_engineer',
    },
    {
      id: 'ongoing_harm',
      type: 'yes_no',
      prompt: 'Is the misappropriator actively using or disclosing the trade secret right now?',
    },
    {
      id: 'tro_note',
      type: 'info',
      prompt:
        'You should seek a Temporary Restraining Order (TRO) immediately. Texas courts can issue a TRO within 24 hours to stop ongoing use or disclosure. You will need to show: (1) a trade secret exists, (2) it was misappropriated, (3) you are suffering irreparable harm, and (4) no adequate remedy at law. File in district court with a verified petition and supporting affidavits.',
      showIf: (answers) => answers.ongoing_harm === 'yes',
    },
    {
      id: 'economic_value',
      type: 'yes_no',
      prompt:
        'Does the trade secret derive independent economic value from not being generally known?',
      helpText:
        'Under TUTSA §134A.002, a trade secret must derive "independent economic value, actual or potential, from not being generally known." This means the secrecy itself provides a competitive advantage.',
    },
    {
      id: 'known_damages',
      type: 'single_choice',
      prompt: 'What damages have you suffered so far?',
      options: [
        { value: 'lost_customers', label: 'Lost customers or contracts' },
        { value: 'lost_advantage', label: 'Lost competitive advantage' },
        { value: 'development_costs', label: 'Wasted R&D or development costs' },
        { value: 'all_above', label: 'Multiple types of damages' },
        { value: 'unknown', label: 'Not yet quantified' },
      ],
    },
    {
      id: 'remedies_info',
      type: 'info',
      prompt:
        'Under TUTSA, you can recover:\n\n• Injunction — court order to stop use/disclosure\n• Actual damages — your provable losses from the misappropriation\n• Unjust enrichment — profits the misappropriator gained (if not duplicating actual damages)\n• Reasonable royalty — if actual damages and unjust enrichment are not provable\n• Exemplary damages — up to 2x actual damages if misappropriation was willful and malicious\n• Attorney fees — if the claim or defense was made in bad faith, or misappropriation was willful and malicious',
    },
    {
      id: 'statute_of_limitations',
      type: 'info',
      prompt:
        'The statute of limitations under TUTSA is 3 years from the date the misappropriation is discovered or should have been discovered. Continuing misappropriation is treated as a single claim — the clock starts when you knew or should have known. Do not delay filing.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.trade_secret_type) {
      const labels: Record<string, string> = {
        customer_list: 'Customer lists or contact information',
        formula: 'Formulas, recipes, or compositions',
        process: 'Manufacturing or business processes',
        pricing: 'Pricing strategies or cost data',
        software: 'Source code or algorithms',
        other: 'Other confidential business information',
      }
      items.push({
        status: 'info',
        text: `Trade secret type: ${labels[answers.trade_secret_type] ?? answers.trade_secret_type}.`,
      })
    }

    if (answers.reasonable_measures === 'yes') {
      items.push({
        status: 'done',
        text: 'Reasonable protective measures were in place.',
      })
    } else if (answers.reasonable_measures === 'no') {
      items.push({
        status: 'needed',
        text: 'Implement protective measures immediately and document prior efforts to maintain secrecy.',
      })
    }

    if (answers.misappropriation_method) {
      const labels: Record<string, string> = {
        former_employee: 'Former employee took secrets to competitor',
        breach_nda: 'Breach of NDA or confidentiality agreement',
        hacking: 'Unauthorized electronic access',
        business_partner: 'Business partner or vendor disclosure',
        reverse_engineer: 'Reverse engineering (may be lawful defense)',
        other: 'Other improper means',
      }
      items.push({
        status: 'info',
        text: `Misappropriation method: ${labels[answers.misappropriation_method] ?? answers.misappropriation_method}.`,
      })
    }

    if (answers.ongoing_harm === 'yes') {
      items.push({
        status: 'needed',
        text: 'Seek a Temporary Restraining Order (TRO) immediately to stop ongoing harm.',
      })
    }

    if (answers.economic_value === 'yes') {
      items.push({
        status: 'done',
        text: 'Trade secret has independent economic value from its secrecy.',
      })
    } else if (answers.economic_value === 'no') {
      items.push({
        status: 'needed',
        text: 'Establish that the information derives economic value from its secrecy — required under TUTSA.',
      })
    }

    if (answers.known_damages) {
      const labels: Record<string, string> = {
        lost_customers: 'Lost customers or contracts',
        lost_advantage: 'Lost competitive advantage',
        development_costs: 'Wasted R&D or development costs',
        all_above: 'Multiple damage types',
        unknown: 'Damages not yet quantified',
      }
      items.push({
        status: answers.known_damages === 'unknown' ? 'needed' : 'info',
        text: `Damages: ${labels[answers.known_damages] ?? answers.known_damages}.`,
      })
    }

    items.push({
      status: 'info',
      text: 'Statute of limitations: 3 years from discovery under TUTSA (Tex. Civ. Prac. & Rem. Code Ch. 134A).',
    })

    return items
  },
}
