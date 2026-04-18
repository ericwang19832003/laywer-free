import type { GuidedStepConfig } from '../types'

function needsUmUim(answers: Record<string, string>): boolean {
  return (
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown'
  )
}

export const piInsuranceCommunicationNyConfig: GuidedStepConfig = {
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
        "Recorded Statements\n\nDON'T agree to a recorded statement from the other driver's insurance company. You are NOT legally required to give one.\n\nDO keep written notes of every conversation — date, time, who you spoke with, and what was discussed.",
    },
    {
      id: 'playbook_early_offers',
      type: 'info',
      prompt:
        "Early Settlement Offers\n\nDON'T accept the first offer. It is almost always far below the fair value of your claim.\n\nDO wait until you have reached Maximum Medical Improvement (MMI).",
    },
    {
      id: 'playbook_authorizations',
      type: 'info',
      prompt:
        "Blanket Authorizations\n\nDON'T sign blanket medical or employment record authorizations. Only provide records directly related to this incident.",
    },
    {
      id: 'playbook_social_media',
      type: 'info',
      prompt:
        "Social Media\n\nDON'T post about your case or activities on social media. Insurance companies routinely monitor plaintiff social media. Set all profiles to private.",
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
      prompt: 'Have you filed an insurance claim (with your own or the at-fault party\'s insurance)?',
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
      prompt:
        'You are NOT required to give a recorded statement to the other party\'s insurance company. You can decline and say "I prefer to communicate in writing."',
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
      prompt: 'Do not accept any settlement before completing medical treatment. Once you accept, you cannot go back.',
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

    // ── Section 3: NY No-Fault Benefits ─────────────────────────
    {
      id: 'no_fault_header',
      type: 'info',
      prompt:
        'NY No-Fault Benefits (Insurance Law Article 51)\n\nYour OWN auto insurer pays up to $50,000 in basic economic loss regardless of fault. This is separate from any claim against the at-fault driver.\n\nNo-fault covers:\n• Reasonable medical expenses (no deductible)\n• 80% of lost earnings (up to $2,000/month for 3 years)\n• Up to $25/day for other necessary expenses\n\nBenefits must be paid or denied within 30 days of proof of claim. You must file within 30 days of the accident.',
    },
    {
      id: 'no_fault_denial',
      type: 'yes_no',
      prompt: 'Has your no-fault insurer denied any of your claims?',
      helpText: 'No-fault denials are common. You have the right to arbitration.',
    },
    {
      id: 'no_fault_denial_guidance',
      type: 'info',
      prompt:
        'No-Fault Denial — Your Options\n\nIf your no-fault insurer denies a claim:\n\n1. Request a written explanation of the denial\n2. You can request mandatory arbitration through the American Arbitration Association (AAA)\n3. Filing deadline: You must commence arbitration or lawsuit within 2 years of the denial\n4. The insurer bears the burden of proving the denial was proper\n\nCommon denial reasons: treatment not medically necessary, provider not authorized, peer review disagreement.',
      showIf: (answers) => answers.no_fault_denial === 'yes',
    },

    // ── Section 4: UM/UIM ───────────────────────────────────────
    {
      id: 'uim_header',
      type: 'info',
      prompt:
        'Supplementary Uninsured/Underinsured Motorist (SUM) Coverage\n\nNew York requires SUM coverage (11 NYCRR §60-2). If the at-fault driver has no insurance or insufficient coverage, your SUM coverage kicks in. Minimum SUM limits match your liability limits.',
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
      prompt: 'Is their insurance coverage enough to cover your damages?',
      options: [
        { value: 'yes', label: 'Yes — their coverage seems sufficient' },
        { value: 'no', label: 'No — their limits are too low' },
        { value: 'unknown', label: "I don't know their coverage limits" },
      ],
      showIf: (answers) => answers.at_fault_has_insurance === 'yes',
    },
    {
      id: 'sum_insurer_name',
      type: 'text',
      prompt: 'What is your auto insurance company name?',
      placeholder: 'e.g., State Farm, GEICO, Progressive',
      showIf: needsUmUim,
    },
    {
      id: 'sum_limits',
      type: 'text',
      prompt: 'What are your SUM/UM/UIM coverage limits?',
      placeholder: 'e.g., $25,000/$50,000',
      showIf: needsUmUim,
    },
    {
      id: 'sum_arbitration_info',
      type: 'info',
      prompt:
        'SUM Claims — Mandatory Arbitration\n\nUnlike many states, NY SUM claims are resolved through mandatory arbitration (not litigation). The arbitration is binding unless the amount exceeds $5,000, in which case either party can demand a trial de novo.\n\nYou have 2 years to initiate arbitration from the date you knew or should have known the at-fault driver was uninsured/underinsured. Notify your insurer immediately.',
      showIf: needsUmUim,
    },

    // ── Section 5: Pre-Judgment Interest ────────────────────────
    {
      id: 'prejudgment_interest_header',
      type: 'info',
      prompt:
        'Pre-Judgment Interest — 9% Per Annum\n\nNew York awards pre-judgment interest at 9% per annum (CPLR §5004) — one of the highest statutory rates in the country. This is mandatory, not discretionary.\n\nInterest runs from the date of injury through the verdict. On a $500,000 case pending 3 years, that adds $135,000.\n\nThis is a powerful settlement tool. Make sure the defendant\'s insurer understands the interest exposure.',
    },

    // ── Section 6: Bad Faith (Limited in NY) ────────────────────
    {
      id: 'bad_faith_info',
      type: 'info',
      prompt:
        'Insurance Bad Faith in New York\n\nUnlike PA and FL, New York does NOT have a statutory bad faith cause of action against insurers. However, common law bad faith claims exist:\n\n• First-party bad faith: Your own insurer unreasonably refuses to pay\n• Third-party bad faith: The at-fault driver\'s insurer unreasonably refuses to settle within policy limits, exposing their insured to excess judgment\n\nBad faith claims are harder to prove in NY than in states with statutory remedies. Document all denials and delays.',
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
        'Document Everything\n\nKeep copies of all letters, emails, and notes from phone calls. While NY lacks a statutory bad faith remedy, common law bad faith requires showing the insurer had no reasonable basis for denial. Your documentation is critical evidence.',
      showIf: (answers) => answers.bad_faith_suspected === 'yes',
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
      items.push({
        status: 'info',
        text: 'Recorded statement requested — you are NOT required to give one to the other party\'s insurer.',
      })
    }

    if (answers.offered_quick_settlement === 'yes') {
      items.push({ status: 'needed', text: 'Do NOT accept the early settlement offer. Wait until MMI.' })
    }

    if (answers.documenting_communications === 'yes') {
      items.push({ status: 'done', text: 'Keeping a log of all insurance communications.' })
    } else if (answers.documenting_communications === 'no') {
      items.push({ status: 'needed', text: 'Start documenting all insurance communications.' })
    }

    // No-fault denial
    if (answers.no_fault_denial === 'yes') {
      items.push({
        status: 'info',
        text: 'No-fault claim denied — request written explanation and consider AAA arbitration. 2-year deadline.',
      })
    }

    // SUM/UM/UIM
    if (needsUmUim(answers)) {
      items.push({
        status: answers.sum_insurer_name ? 'done' : 'needed',
        text: `SUM insurer: ${answers.sum_insurer_name || 'Not yet provided'}`,
      })
      items.push({
        status: 'info',
        text: 'NY SUM claims use mandatory arbitration. Notify your insurer immediately.',
      })
    }

    // Bad faith
    if (answers.bad_faith_suspected === 'yes') {
      items.push({
        status: 'info',
        text: 'Bad faith suspected: Document everything. NY has common law (not statutory) bad faith remedies.',
      })
    }

    // Pre-judgment interest
    items.push({
      status: 'info',
      text: 'Pre-judgment interest: 9% per annum (CPLR §5004) — mandatory. Powerful settlement leverage.',
    })

    return items
  },
}
