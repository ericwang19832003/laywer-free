import type { GuidedStepConfig } from '../types'

export const piComparativeFaultConfig: GuidedStepConfig = {
  title: 'Understanding Comparative Fault in Texas',
  reassurance:
    'Texas comparative fault rules are straightforward once you understand them. Knowing these rules helps you build a stronger case.',

  questions: [
    {
      id: 'comparative_fault_overview',
      type: 'info',
      prompt:
        "TEXAS MODIFIED COMPARATIVE FAULT (Tex. Civ. Prac. & Rem. Code \u00a733.001):\nTexas uses a \"modified comparative fault\" system with a 51% bar. This means:\n\u2022 If you are 50% or less at fault, you CAN recover damages \u2014 but your award is reduced by your percentage of fault\n\u2022 If you are 51% or more at fault, you recover NOTHING\n\nExample: Your damages are $100,000 and the jury finds you 30% at fault. You recover $70,000 ($100,000 minus 30%).\n\nExample: Your damages are $100,000 but the jury finds you 51% at fault. You recover $0.",
      acknowledgeLabel: "I understand the 51% bar \u2014 I'll build my case to keep fault below 51%",
    },
    {
      id: 'fault_percentage_concern',
      type: 'single_choice',
      prompt: 'How concerned are you about being found partially at fault?',
      options: [
        { value: 'not_at_fault', label: 'I was clearly not at fault' },
        { value: 'minor_fault', label: 'I may have been slightly at fault' },
        { value: 'significant_fault', label: 'I may have been significantly at fault' },
        { value: 'not_sure', label: "I'm not sure about fault allocation" },
      ],
    },
    {
      id: 'not_at_fault_info',
      type: 'info',
      prompt:
        "EVEN IF YOU WERE CLEARLY NOT AT FAULT:\nThe defense will almost always argue you share some blame. Common tactics:\n\u2022 \"You were driving too fast for conditions\"\n\u2022 \"You should have braked sooner\"\n\u2022 \"You were not wearing a seatbelt\" (note: seatbelt non-use is NOT admissible as comparative fault in Texas per \u00a733.001)\n\u2022 \"You were distracted by your phone\"\n\nPrepare to counter each argument with evidence: dashcam footage, witness statements, police report, phone records showing no activity at the time of the accident.",
      acknowledgeLabel: "I'm ready to counter these arguments",
      showIf: (answers) => answers.fault_percentage_concern === 'not_at_fault',
    },
    {
      id: 'minor_fault_info',
      type: 'info',
      prompt:
        "IF YOU WERE SLIGHTLY AT FAULT:\nThis does NOT destroy your case. For example, if you were 20% at fault and your damages are $100,000, you still recover $80,000.\n\nStrategy:\n\u2022 Be honest about your role \u2014 jurors respect honesty and punish dishonesty\n\u2022 Emphasize the defendant's greater fault\n\u2022 Focus on evidence that shows the defendant's actions were the PRIMARY cause\n\u2022 Do not volunteer fault, but do not deny what the evidence clearly shows\n\nA small admission of fault can actually increase your credibility with the jury.",
      acknowledgeLabel: "I'll be honest about my role and focus evidence on the defendant's primary fault",
      showIf: (answers) => answers.fault_percentage_concern === 'minor_fault',
    },
    {
      id: 'significant_fault_info',
      type: 'info',
      prompt:
        "IF YOU MAY HAVE BEEN SIGNIFICANTLY AT FAULT:\nThis is where your case strategy becomes critical. Remember the 51% bar \u2014 if the jury finds you 51%+ at fault, you get nothing.\n\nStrategy:\n\u2022 Gather every piece of evidence that supports the defendant's fault\n\u2022 Focus on what the DEFENDANT did wrong, not on defending your own actions\n\u2022 Consider settlement \u2014 a guaranteed partial recovery may be better than the risk of a 51% finding\n\u2022 Highlight any aggravating factors on the defendant's side: speeding, intoxication, texting, running a signal\n\u2022 Consult with an attorney if possible \u2014 cases with significant shared fault require careful strategy",
      acknowledgeLabel: "I'll gather evidence of the defendant's fault and seriously consider settlement",
      showIf: (answers) => answers.fault_percentage_concern === 'significant_fault',
    },
    {
      id: 'evidence_for_fault',
      type: 'multi_select',
      prompt: 'Which of these do you have access to right now?',
      helpText: 'Check everything you currently have or can get. This shapes the next steps in your case.',
      noneLabel: 'None of these yet \u2014 I need to gather evidence',
      options: [
        { value: 'police_report', label: 'Police accident report' },
        { value: 'photos_video', label: 'Photos or video from the scene (dashcam, phone, cameras)' },
        { value: 'witnesses', label: 'Witness names or contact info' },
        { value: 'phone_records', label: "Phone records (defendant's calls/texts at time of impact)" },
        { value: 'defendant_cited', label: 'Defendant was ticketed or cited' },
        { value: 'vehicle_damage_photos', label: 'Vehicle damage photos (both vehicles)' },
        { value: 'toxicology', label: 'Toxicology or BAC results (defendant was intoxicated)' },
      ],
    },
    {
      id: 'common_defense_arguments',
      type: 'info',
      prompt:
        "COMMON DEFENSE ARGUMENTS TO PREPARE FOR:\n\u2022 \"The plaintiff failed to keep a proper lookout\" \u2014 Counter: describe exactly what you were doing and where you were looking\n\u2022 \"The plaintiff was speeding\" \u2014 Counter: provide speed data, witness testimony, or GPS records\n\u2022 \"The plaintiff could have avoided the accident\" \u2014 Counter: explain the split-second nature of the situation\n\u2022 \"The plaintiff's injuries were pre-existing\" \u2014 Counter: medical records showing your condition before vs. after the accident\n\u2022 \"The plaintiff failed to mitigate damages\" \u2014 Counter: show you followed all medical advice and treatment plans\n\u2022 \"There were multiple causes\" \u2014 Counter: even with multiple causes, if the defendant was primarily at fault, you recover",
      acknowledgeLabel: "I'll prepare specific counter-evidence for each of these defense arguments",
    },
    {
      id: 'case_strategy_impact',
      type: 'info',
      prompt:
        "HOW COMPARATIVE FAULT AFFECTS YOUR STRATEGY:\n\u2022 In settlement negotiations: the defense will argue your fault percentage to reduce the offer. Know your realistic fault exposure.\n\u2022 In mediation: the mediator will discuss fault allocation openly. Be prepared with your best arguments.\n\u2022 At trial: the jury assigns specific percentages to each party on the verdict form. Your closing argument should suggest a specific percentage split (e.g., \"the evidence shows the defendant was 100% at fault\" or \"even under the most generous reading for the defense, my client was no more than 10% at fault\").\n\u2022 Multiple defendants: if there are multiple defendants, fault is allocated among ALL parties, which can reduce your percentage.",
      acknowledgeLabel: "I'll prepare my fault percentage argument for settlement, mediation, and trial",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'info',
      text: 'Texas 51% bar: if you are 51%+ at fault, you recover nothing. Under 51%, damages are reduced by your fault percentage.',
    })

    if (answers.fault_percentage_concern) {
      const labels: Record<string, string> = {
        not_at_fault: 'Clearly not at fault \u2014 but prepare for defense arguments that you share blame.',
        minor_fault: 'Minor fault \u2014 you can still recover. Honesty about small fault increases credibility.',
        significant_fault: 'Significant fault risk \u2014 focus on defendant\'s actions, consider settlement to avoid 51% bar.',
        not_sure: "Fault allocation uncertain \u2014 gather evidence to establish defendant's primary responsibility.",
      }
      items.push({
        status: answers.fault_percentage_concern === 'significant_fault' ? 'needed' : 'info',
        text: labels[answers.fault_percentage_concern] ?? '',
      })
    }

    if (answers.evidence_for_fault) {
      const have = new Set(answers.evidence_for_fault === 'none' ? [] : answers.evidence_for_fault.split(','))
      if (have.has('police_report')) {
        items.push({ status: 'done', text: 'Police report secured \u2014 the officer\'s at-fault determination is your strongest single piece of evidence.' })
      } else {
        items.push({ status: 'needed', text: 'No police report yet \u2014 request a copy from the responding agency. Without it, you\'ll rely more on photos and witness accounts.' })
      }
      if (have.has('witnesses')) {
        items.push({ status: 'done', text: 'Witnesses identified \u2014 collect written or recorded statements as soon as possible while memories are fresh.' })
      } else {
        items.push({ status: 'needed', text: 'No witnesses yet \u2014 check for nearby traffic or security cameras. Review the police report for any witnesses the officer noted.' })
      }
      if (have.has('defendant_cited')) {
        items.push({ status: 'done', text: 'Defendant was cited \u2014 a traffic citation strongly supports your fault argument, though it is not conclusive at trial.' })
      }
      if (have.has('photos_video')) {
        items.push({ status: 'done', text: 'Photos/video secured \u2014 visual evidence is persuasive. Preserve originals with metadata intact.' })
      } else {
        items.push({ status: 'needed', text: 'No photos/video yet \u2014 check for traffic cameras, security cameras, or dashcam footage near the scene.' })
      }
      if (answers.evidence_for_fault === 'none') {
        items.push({ status: 'needed', text: 'No evidence gathered yet \u2014 start with the police report and scene photos; these are easiest to obtain and most persuasive.' })
      }
    }

    items.push({
      status: 'info',
      text: 'Prepare for common defenses: "failed to keep lookout," "was speeding," "pre-existing injuries," "failed to mitigate."',
    })

    items.push({
      status: 'info',
      text: 'Seatbelt non-use is NOT admissible as comparative fault in Texas (\u00a733.001).',
    })

    return items
  },

  references: [
    {
      label: 'Tex. Civ. Prac. & Rem. Code Ch. 33 — Proportionate Responsibility',
      url: 'https://statutes.capitol.texas.gov/Docs/CP/htm/CP.33.htm',
    },
    {
      label: 'Texas Law Help — Comparative Fault in Texas',
      url: 'https://texaslawhelp.org/resource/proportionate-responsibility',
    },
  ],
}
