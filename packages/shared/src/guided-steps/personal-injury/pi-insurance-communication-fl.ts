import type { GuidedStepConfig } from '../types'

function needsUmUim(answers: Record<string, string>): boolean {
  return (
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown'
  )
}

export const piInsuranceCommunicationFlConfig: GuidedStepConfig = {
  title: 'Communicate With Insurance',
  reassurance:
    "Knowing how to handle insurance communications protects your rights and your claim's value.",

  questions: [
    // ── Section 1: Playbook ─────────────────────────────────────
    {
      id: 'playbook_header',
      type: 'info',
      prompt: 'Know Before You Talk — Insurance Playbook\n\nBefore communicating with any insurance company, read these critical rules.',
    },
    {
      id: 'playbook_recorded_statements',
      type: 'info',
      prompt:
        "Recorded Statements\n\nDON'T agree to a recorded statement from the other driver's insurance company. You are NOT legally required to give one.\n\nDO keep written notes of every conversation.",
    },
    {
      id: 'playbook_early_offers',
      type: 'info',
      prompt:
        "Early Settlement Offers\n\nDON'T accept the first offer. Wait until you reach Maximum Medical Improvement (MMI).",
    },
    {
      id: 'playbook_authorizations',
      type: 'info',
      prompt:
        "Blanket Authorizations\n\nDON'T sign blanket medical authorizations. Only provide records directly related to this incident.",
    },
    {
      id: 'playbook_social_media',
      type: 'info',
      prompt:
        "Social Media\n\nDON'T post about your case or activities. Set all profiles to private.",
    },
    {
      id: 'playbook_acknowledged',
      type: 'yes_no',
      prompt: 'I have read and understand the insurance playbook above.',
    },

    // ── Section 2: Insurance claim tracking ─────────────────────
    {
      id: 'claim_filed',
      type: 'yes_no',
      prompt: 'Have you filed an insurance claim?',
    },
    {
      id: 'adjuster_contacted_you',
      type: 'yes_no',
      prompt: 'Has an insurance adjuster contacted you?',
    },
    {
      id: 'recorded_statement_requested',
      type: 'yes_no',
      prompt: 'Has the adjuster asked you for a recorded statement?',
      showIf: (answers) => answers.adjuster_contacted_you === 'yes',
    },
    {
      id: 'recorded_statement_warning',
      type: 'info',
      prompt: 'You are NOT required to give a recorded statement to the other party\'s insurer.',
      showIf: (answers) => answers.recorded_statement_requested === 'yes',
    },
    {
      id: 'offered_quick_settlement',
      type: 'yes_no',
      prompt: 'Has the insurance company offered you a quick settlement?',
    },
    {
      id: 'quick_settlement_warning',
      type: 'info',
      prompt: 'Do not accept any settlement before completing medical treatment.',
      showIf: (answers) => answers.offered_quick_settlement === 'yes',
    },
    {
      id: 'documenting_communications',
      type: 'yes_no',
      prompt: 'Are you documenting all communications with insurance companies?',
    },
    {
      id: 'know_policy_limits',
      type: 'single_choice',
      prompt: "Do you know the at-fault party's insurance policy limits?",
      options: [
        { value: 'yes', label: 'Yes, I know the limits' },
        { value: 'no', label: "No, I don't know them" },
        { value: 'unsure', label: "I'm not sure what policy limits are" },
      ],
    },

    // ── Section 3: FL PIP Claim Status ──────────────────────────
    {
      id: 'pip_header',
      type: 'info',
      prompt:
        'Florida PIP Claim\n\nYour PIP insurer must pay or deny within 30 days of receiving proof of loss. If denied, you have 5 years from the date of the accident to sue your own insurer for PIP benefits.\n\nRemember: 14-day rule — you must have sought initial treatment within 14 days of the accident.',
    },
    {
      id: 'pip_claim_status',
      type: 'single_choice',
      prompt: 'What is the status of your PIP claim?',
      options: [
        { value: 'paying', label: 'PIP is paying my medical bills' },
        { value: 'denied', label: 'PIP claim was denied' },
        { value: 'partial', label: 'PIP is paying some bills but denying others' },
        { value: 'exhausted', label: 'PIP benefits are exhausted ($10K limit reached)' },
        { value: 'not_filed', label: 'I have not filed a PIP claim' },
        { value: 'not_applicable', label: 'This is not a motor vehicle case' },
      ],
    },
    {
      id: 'pip_denied_guidance',
      type: 'info',
      prompt:
        'PIP Denial — Your Rights\n\nIf your PIP insurer denies a claim:\n\n1. Request a written explanation of the denial\n2. You may file a demand letter under §627.736(10) before suing\n3. You have 5 years from the accident to sue for unpaid PIP benefits\n4. If the insurer acted unreasonably, you may recover attorney fees\n\nCommon denial reasons: missed 14-day deadline, treatment not medically necessary, IME (Independent Medical Examination) disputes.',
      showIf: (answers) =>
        answers.pip_claim_status === 'denied' ||
        answers.pip_claim_status === 'partial',
    },

    // ── Section 4: UM/UIM ───────────────────────────────────────
    {
      id: 'uim_header',
      type: 'info',
      prompt:
        'Florida UM/UIM Coverage\n\nFlorida does NOT require UM/UIM coverage — but your insurer must offer it. If you accepted UM/UIM, it kicks in when the at-fault driver has no insurance or insufficient coverage.\n\nCheck your declarations page to see if you have UM/UIM coverage.',
    },
    {
      id: 'at_fault_has_insurance',
      type: 'single_choice',
      prompt: 'Does the at-fault driver have insurance?',
      options: [
        { value: 'yes', label: 'Yes — they have insurance' },
        { value: 'no', label: 'No — they are uninsured' },
        { value: 'unknown', label: "I don't know yet" },
        { value: 'not_vehicle', label: 'This is not a motor vehicle case' },
      ],
    },
    {
      id: 'coverage_sufficient',
      type: 'single_choice',
      prompt: 'Is their coverage enough to cover your damages?',
      options: [
        { value: 'yes', label: 'Yes — coverage seems sufficient' },
        { value: 'no', label: 'No — their limits are too low' },
        { value: 'unknown', label: "I don't know their limits" },
      ],
      showIf: (answers) => answers.at_fault_has_insurance === 'yes',
    },
    {
      id: 'has_um_uim',
      type: 'single_choice',
      prompt: 'Do you have UM/UIM coverage on your own policy?',
      options: [
        { value: 'yes', label: 'Yes — I have UM/UIM coverage' },
        { value: 'no', label: 'No — I rejected UM/UIM coverage' },
        { value: 'unknown', label: "I'm not sure" },
      ],
      showIf: needsUmUim,
    },
    {
      id: 'um_uim_insurer_name',
      type: 'text',
      prompt: 'What is your auto insurance company name?',
      placeholder: 'e.g., State Farm, GEICO, Progressive',
      showIf: (answers) => needsUmUim(answers) && answers.has_um_uim === 'yes',
    },
    {
      id: 'um_uim_limits',
      type: 'text',
      prompt: 'What are your UM/UIM coverage limits?',
      placeholder: 'e.g., $100,000/$300,000',
      showIf: (answers) => needsUmUim(answers) && answers.has_um_uim === 'yes',
    },

    // ── Section 5: Bad Faith (§624.155) ─────────────────────────
    {
      id: 'bad_faith_header',
      type: 'info',
      prompt:
        'Florida Insurance Bad Faith — §624.155\n\nFlorida has a statutory bad faith cause of action. If your insurer unreasonably denies or delays your claim, you may sue for bad faith.\n\nHB 837 changes: An insurer that tenders policy limits or the claimed amount is generally shielded from bad faith liability. This makes the claims process more insurer-friendly.\n\nBefore suing for bad faith, you MUST file a Civil Remedy Notice (CRN) with the Department of Financial Services. The insurer then has 60 days to cure.',
    },
    {
      id: 'bad_faith_suspected',
      type: 'yes_no',
      prompt: 'Is your insurer unreasonably denying or delaying your claim?',
    },
    {
      id: 'bad_faith_guidance',
      type: 'info',
      prompt:
        'Bad Faith — Steps to Take\n\n1. Document every denial, delay, and communication\n2. File a Civil Remedy Notice (CRN) with the Department of Financial Services — required before suing (§624.155(3)(a))\n3. The insurer has 60 days to cure after the CRN\n4. If not cured, you may file a bad faith lawsuit\n\nHB 837 note: If the insurer has offered policy limits, bad faith claims become much harder. Keep records of all offers and counter-offers.',
      showIf: (answers) => answers.bad_faith_suspected === 'yes',
    },

    // ── Section 6: HB 837 Impact on Settlement ─────────────────
    {
      id: 'hb837_settlement_info',
      type: 'info',
      prompt:
        'HB 837 Impact on Your Settlement Value\n\nThree major HB 837 changes affect settlement negotiations:\n\n1. Collateral source (§768.76): Jury sees actual paid amounts, not billed amounts — lowers apparent medical damages\n2. 51% comparative fault bar (§768.81): If you\'re 51%+ at fault, no recovery — defense will push this\n3. Prejudgment interest (§768.0710): You get interest on past economic damages at prime rate from date of loss — settlement leverage\n\nConsider these when evaluating settlement offers.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: answers.playbook_acknowledged === 'yes' ? 'done' : 'needed',
      text: 'Insurance playbook reviewed',
    })

    if (answers.claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed.' })
    } else if (answers.claim_filed === 'no') {
      items.push({ status: 'needed', text: 'File an insurance claim promptly.' })
    }

    if (answers.recorded_statement_requested === 'yes') {
      items.push({ status: 'info', text: 'Recorded statement requested — you may decline.' })
    }

    if (answers.offered_quick_settlement === 'yes') {
      items.push({ status: 'needed', text: 'Do NOT accept the early settlement offer. Wait until MMI.' })
    }

    if (answers.documenting_communications === 'yes') {
      items.push({ status: 'done', text: 'Insurance communication log maintained.' })
    } else if (answers.documenting_communications === 'no') {
      items.push({ status: 'needed', text: 'Start documenting all insurance communications.' })
    }

    // PIP status
    const pipStatus = answers.pip_claim_status
    if (pipStatus === 'paying') {
      items.push({ status: 'done', text: 'PIP is paying medical bills.' })
    } else if (pipStatus === 'denied' || pipStatus === 'partial') {
      items.push({ status: 'info', text: 'PIP claim denied/partial — consider demand letter under §627.736(10). 5-year deadline.' })
    } else if (pipStatus === 'exhausted') {
      items.push({ status: 'done', text: 'PIP benefits exhausted ($10K limit).' })
    } else if (pipStatus === 'not_filed') {
      items.push({ status: 'needed', text: 'File PIP claim immediately. Remember 14-day treatment rule.' })
    }

    // UM/UIM
    if (needsUmUim(answers)) {
      if (answers.has_um_uim === 'yes') {
        items.push({
          status: answers.um_uim_insurer_name ? 'done' : 'needed',
          text: `UM/UIM insurer: ${answers.um_uim_insurer_name || 'Not yet provided'}`,
        })
      } else if (answers.has_um_uim === 'no') {
        items.push({
          status: 'info',
          text: 'No UM/UIM coverage — recovery limited to at-fault party\'s assets or coverage.',
        })
      }
    }

    // Bad faith
    if (answers.bad_faith_suspected === 'yes') {
      items.push({
        status: 'info',
        text: 'Bad faith suspected: File CRN with DFS before suing. 60-day cure period (§624.155).',
      })
    }

    items.push({
      status: 'info',
      text: 'HB 837: Collateral source (paid, not billed), 51% bar, and prejudgment interest at prime rate affect settlement value.',
    })

    return items
  },
}
