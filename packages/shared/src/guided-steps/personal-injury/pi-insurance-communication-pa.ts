import type { GuidedStepConfig } from '../types'

/** Helper: answers indicate UM/UIM coverage may be needed */
function needsUmUim(answers: Record<string, string>): boolean {
  return (
    answers.at_fault_has_insurance === 'no' ||
    answers.at_fault_has_insurance === 'unknown' ||
    answers.coverage_sufficient === 'no' ||
    answers.coverage_sufficient === 'unknown'
  )
}

/** Helper: UM/UIM needed AND not rejected in writing */
function uimApplies(answers: Record<string, string>): boolean {
  return needsUmUim(answers) && answers.uim_rejected !== 'yes'
}

export const piInsuranceCommunicationPaConfig: GuidedStepConfig = {
  title: 'Communicate With Insurance',
  reassurance:
    "Knowing how to handle insurance communications protects your rights and your claim's value.",

  questions: [
    // ── Section 1: Playbook (identical to TX/CA) ─────────────────────
    {
      id: 'playbook_header',
      type: 'info',
      prompt:
        '🛡️ Know Before You Talk — Insurance Playbook\n\nBefore communicating with any insurance company, read these critical rules. Insurance companies are not on your side — they are businesses trying to minimize what they pay.',
    },
    {
      id: 'playbook_recorded_statements',
      type: 'info',
      prompt:
        "🎙️ Recorded Statements\n\n❌ DON'T agree to a recorded statement from the other driver's insurance company. You are NOT legally required to give one. Anything you say can and will be used to reduce your claim.\n\n✅ DO keep written notes of every conversation — date, time, who you spoke with, and what was discussed.",
    },
    {
      id: 'playbook_early_offers',
      type: 'info',
      prompt:
        "💰 Early Settlement Offers\n\n❌ DON'T accept the first offer. It is almost always far below the fair value of your claim.\n\n✅ DO wait until you have reached Maximum Medical Improvement (MMI) — the point where your doctor says your condition will not improve further. Settling before MMI means you cannot account for future treatment costs.",
    },
    {
      id: 'playbook_authorizations',
      type: 'info',
      prompt:
        "📋 Blanket Authorizations\n\n❌ DON'T sign blanket medical or employment record authorizations. The insurer wants access to your entire history to find pre-existing conditions.\n\n✅ DO only provide records directly related to this incident.",
    },
    {
      id: 'playbook_surveillance',
      type: 'info',
      prompt:
        "📷 Surveillance\n\n✅ DO be aware that insurance companies may hire investigators to photograph or video you if your claim is significant. Anything inconsistent with your claimed injuries can be used against you.\n\n✅ DO be honest about your limitations — don't exaggerate, but don't push through pain for appearances.",
    },
    {
      id: 'playbook_social_media',
      type: 'info',
      prompt:
        "📱 Social Media\n\n❌ DON'T post about your case, your injuries, or your activities on social media. Insurance companies routinely monitor plaintiff social media.\n\n✅ DO set all profiles to private and avoid posting until your case is resolved.",
    },
    {
      id: 'playbook_acknowledged',
      type: 'yes_no',
      prompt: 'I have read and understand the insurance playbook above.',
    },

    // ── Section 2: Insurance claim tracking (same as TX/CA) ──────────
    {
      id: 'claim_filed',
      type: 'yes_no',
      prompt:
        'Have you filed an insurance claim (with your own or the at-fault party\'s insurance)?',
      helpText:
        'Most policies require timely notice. Get a claim number and keep it handy.',
    },
    {
      id: 'adjuster_contacted_you',
      type: 'yes_no',
      prompt: 'Has an insurance adjuster contacted you?',
      helpText:
        'Adjusters may call, email, or send letters. Keep a record of all contact.',
    },
    {
      id: 'recorded_statement_requested',
      type: 'yes_no',
      prompt: 'Has the adjuster asked you for a recorded statement?',
      helpText:
        'This is a common request, especially from the other party\'s insurance.',
      showIf: (answers) => answers.adjuster_contacted_you === 'yes',
    },
    {
      id: 'recorded_statement_warning',
      type: 'info',
      prompt:
        'You are NOT required to give a recorded statement to the other party\'s insurance company. You can decline and say "I prefer to communicate in writing." If you do give a statement, prepare your answers in advance and stick to basic facts.',
      helpText:
        'Your own insurance policy may require cooperation, but be cautious about what you say.',
      showIf: (answers) => answers.recorded_statement_requested === 'yes',
    },
    {
      id: 'offered_quick_settlement',
      type: 'yes_no',
      prompt: 'Has the insurance company offered you a quick settlement?',
      helpText:
        'Insurance companies sometimes offer early settlements before you know the full extent of your injuries.',
    },
    {
      id: 'quick_settlement_warning',
      type: 'info',
      prompt:
        'Early settlement offers are almost always too low. Do not accept any settlement before completing medical treatment. Once you accept, you cannot go back and ask for more, even if your injuries turn out to be worse than expected.',
      helpText:
        'Wait until you reach Maximum Medical Improvement (MMI) to know the true value of your claim.',
      showIf: (answers) => answers.offered_quick_settlement === 'yes',
    },
    {
      id: 'documenting_communications',
      type: 'yes_no',
      prompt:
        'Are you documenting all communications with insurance companies (dates, names, what was discussed)?',
      helpText:
        'A written log protects you if there is a dispute about what was said.',
    },
    {
      id: 'know_policy_limits',
      type: 'single_choice',
      prompt:
        "Do you know the at-fault party's insurance policy limits?",
      helpText:
        'Policy limits determine the maximum the insurance will pay. This affects your strategy.',
      options: [
        { value: 'yes', label: 'Yes, I know the limits' },
        { value: 'no', label: "No, I don't know them" },
        { value: 'unsure', label: "I'm not sure what policy limits are" },
      ],
    },
    {
      id: 'adjuster_tactics_info',
      type: 'info',
      prompt:
        'Watch out for common adjuster tactics: offering a lowball settlement before you know your full injuries, calling frequently to pressure you, requesting unnecessary medical authorizations to access your full history, and delaying responses to run out the statute of limitations. Stick to basic facts, say "I\'m still treating" if asked about injuries, and never speculate about fault.',
      helpText:
        'You can always say "I need time to think about it" before agreeing to anything.',
    },

    // ── Section 3: PA UM/UIM (stacking) ──────────────────────────────
    {
      id: 'uim_header',
      type: 'info',
      prompt:
        '🚗 You May Have More Coverage Than You Think — Pennsylvania UM/UIM\n\nPA UM is mandatory. UIM must be offered but can be rejected in writing. PA allows stacking — your effective coverage may be higher than you think.',
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
      id: 'uim_rejected',
      type: 'yes_no',
      prompt: 'Did you reject UIM coverage in writing?',
      helpText:
        'Pennsylvania requires UIM to be offered, but you may have signed a written rejection when you purchased your policy.',
      showIf: needsUmUim,
    },
    {
      id: 'stacking_waived',
      type: 'single_choice',
      prompt: 'Did you waive UM/UIM stacking?',
      helpText:
        'Stacking allows you to multiply your UM/UIM limits by the number of vehicles on your policy. Your insurer may have asked you to waive this.',
      options: [
        { value: 'yes', label: 'Yes — I waived stacking' },
        { value: 'no', label: 'No — I did not waive stacking' },
        { value: 'unknown', label: "I'm not sure" },
      ],
      showIf: uimApplies,
    },
    {
      id: 'num_vehicles',
      type: 'text',
      prompt: 'How many vehicles are on your policy?',
      placeholder: 'e.g., 2',
      showIf: (answers) =>
        uimApplies(answers) && answers.stacking_waived !== 'yes',
    },
    {
      id: 'stacking_explanation',
      type: 'info',
      prompt:
        '📊 UM/UIM Stacking Explained\n\nWith stacking, your effective UM/UIM limit = per-vehicle limit × number of vehicles. Example: $100K limit × 3 vehicles = $300K available.',
      showIf: (answers) =>
        uimApplies(answers) && answers.stacking_waived !== 'yes',
    },
    {
      id: 'uim_insurer_name',
      type: 'text',
      prompt: 'What is your auto insurance company name?',
      placeholder: 'e.g., State Farm, GEICO, Progressive',
      showIf: uimApplies,
    },
    {
      id: 'uim_policy_number',
      type: 'text',
      prompt: 'What is your policy number?',
      placeholder: 'Policy number from declarations page',
      showIf: uimApplies,
    },
    {
      id: 'uim_limits',
      type: 'text',
      prompt: 'What are your UM/UIM coverage limits (if you can find them)?',
      placeholder: 'e.g., $30,000/$60,000',
      showIf: uimApplies,
    },

    // ── Section 4: PA Bad Faith (42 Pa.C.S. §8371) ──────────────────
    {
      id: 'bad_faith_header',
      type: 'info',
      prompt:
        '⚖️ Pennsylvania Insurance Bad Faith (42 Pa.C.S. §8371)\n\nPA provides a statutory bad faith cause of action against insurers. If your insurer unreasonably denies or delays your claim, you may recover interest at prime + 3%, punitive damages, costs, and attorney fees.',
    },
    {
      id: 'bad_faith_suspected',
      type: 'yes_no',
      prompt: 'Is your insurer unreasonably denying or delaying your claim?',
      helpText:
        'Examples include ignoring your calls, refusing to explain a denial, or taking months to process a straightforward claim.',
    },
    {
      id: 'bad_faith_guidance',
      type: 'info',
      prompt:
        '📋 Bad Faith — What to Do\n\nDocument everything — every denial, delay, and communication. You will need clear and convincing evidence that the insurer had no reasonable basis for denying benefits.\n\nKeep copies of all letters, emails, and notes from phone calls. This evidence is critical if you pursue a bad faith claim under 42 Pa.C.S. §8371.',
      showIf: (answers) => answers.bad_faith_suspected === 'yes',
    },

    // ── Section 5: Limited Tort Reminder ─────────────────────────────
    {
      id: 'limited_tort_uninsured_check',
      type: 'yes_no',
      prompt:
        'Were you driving without valid insurance at the time of the accident?',
      helpText:
        'This affects what types of damages you can recover under Pennsylvania law.',
    },
    {
      id: 'limited_tort_reminder',
      type: 'info',
      prompt:
        '⚠️ Limited Tort Reminder\n\nIf you were uninsured at the time of the accident, Pennsylvania law (75 Pa.C.S. §1714) treats you as having chosen limited tort — meaning you can only recover for economic damages (medical bills, lost wages) unless your injuries meet the "serious injury" threshold.\n\nMake sure all your economic damages are thoroughly documented.',
      showIf: (answers) => answers.limited_tort_uninsured_check === 'yes',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Playbook
    items.push({
      status: answers.playbook_acknowledged === 'yes' ? 'done' : 'needed',
      text: 'Insurance playbook reviewed',
    })

    if (answers.claim_filed === 'yes') {
      items.push({ status: 'done', text: 'Insurance claim filed.' })
    } else {
      items.push({
        status: 'needed',
        text: 'File an insurance claim promptly. Most policies require timely notice.',
      })
    }

    if (answers.adjuster_contacted_you === 'yes') {
      if (answers.recorded_statement_requested === 'yes') {
        items.push({
          status: 'info',
          text: 'You are NOT required to give a recorded statement to the other party\'s insurer. Consider declining or communicating in writing.',
        })
      }
    }

    if (answers.offered_quick_settlement === 'yes') {
      items.push({
        status: 'needed',
        text: 'Do NOT accept the early settlement offer. Wait until you complete treatment to know the true value of your claim.',
      })
    }

    if (answers.documenting_communications === 'yes') {
      items.push({
        status: 'done',
        text: 'Keeping a log of all insurance communications.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Start documenting all insurance communications: dates, names, and what was discussed.',
      })
    }

    if (answers.know_policy_limits === 'yes') {
      items.push({ status: 'done', text: 'Policy limits are known.' })
    } else if (answers.know_policy_limits === 'unsure') {
      items.push({
        status: 'info',
        text: "Policy limits are the maximum an insurer will pay. Ask the adjuster or check the at-fault party's declarations page.",
      })
    } else {
      items.push({
        status: 'needed',
        text: "Find out the at-fault party's policy limits. This affects your settlement strategy.",
      })
    }

    items.push({
      status: 'info',
      text: 'Watch for adjuster tactics: lowball offers, pressure calls, unnecessary medical authorizations, and delays.',
    })

    // UM/UIM with stacking
    if (needsUmUim(answers)) {
      if (answers.uim_rejected === 'yes') {
        items.push({
          status: 'info',
          text: 'You indicated you rejected UIM coverage in writing. Verify this with your insurer — PA UM coverage is mandatory and cannot be rejected.',
        })
      } else {
        items.push({
          status: answers.uim_insurer_name ? 'done' : 'needed',
          text: `UM/UIM insurer: ${answers.uim_insurer_name || 'Not yet provided'}`,
        })
        if (answers.stacking_waived !== 'yes') {
          const numVehicles = answers.num_vehicles
          if (numVehicles && answers.uim_limits) {
            items.push({
              status: 'info',
              text: `Stacking may apply: ${numVehicles} vehicle(s) × ${answers.uim_limits} per-vehicle limit. Check your declarations page for the effective stacked limit.`,
            })
          } else {
            items.push({
              status: 'info',
              text: 'PA allows UM/UIM stacking — your effective coverage may be multiplied by the number of vehicles on your policy.',
            })
          }
        }
      }
    }

    // Bad faith
    if (answers.bad_faith_suspected === 'yes') {
      items.push({
        status: 'info',
        text: '⚠️ Bad faith suspected: Document every denial, delay, and communication. 42 Pa.C.S. §8371 allows recovery of interest (prime + 3%), punitive damages, costs, and attorney fees.',
      })
    }

    // Limited tort
    if (answers.limited_tort_uninsured_check === 'yes') {
      items.push({
        status: 'info',
        text: '⚠️ Limited tort applies: Uninsured drivers are treated as limited tort — only economic damages unless injuries meet the "serious injury" threshold. Document all economic damages thoroughly.',
      })
    }

    return items
  },
}
