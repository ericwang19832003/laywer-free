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
      showIf: (answers) => answers.fault_percentage_concern === 'not_at_fault',
    },
    {
      id: 'minor_fault_info',
      type: 'info',
      prompt:
        "IF YOU WERE SLIGHTLY AT FAULT:\nThis does NOT destroy your case. For example, if you were 20% at fault and your damages are $100,000, you still recover $80,000.\n\nStrategy:\n\u2022 Be honest about your role \u2014 jurors respect honesty and punish dishonesty\n\u2022 Emphasize the defendant's greater fault\n\u2022 Focus on evidence that shows the defendant's actions were the PRIMARY cause\n\u2022 Do not volunteer fault, but do not deny what the evidence clearly shows\n\nA small admission of fault can actually increase your credibility with the jury.",
      showIf: (answers) => answers.fault_percentage_concern === 'minor_fault',
    },
    {
      id: 'significant_fault_info',
      type: 'info',
      prompt:
        "IF YOU MAY HAVE BEEN SIGNIFICANTLY AT FAULT:\nThis is where your case strategy becomes critical. Remember the 51% bar \u2014 if the jury finds you 51%+ at fault, you get nothing.\n\nStrategy:\n\u2022 Gather every piece of evidence that supports the defendant's fault\n\u2022 Focus on what the DEFENDANT did wrong, not on defending your own actions\n\u2022 Consider settlement \u2014 a guaranteed partial recovery may be better than the risk of a 51% finding\n\u2022 Highlight any aggravating factors on the defendant's side: speeding, intoxication, texting, running a signal\n\u2022 Consult with an attorney if possible \u2014 cases with significant shared fault require careful strategy",
      showIf: (answers) => answers.fault_percentage_concern === 'significant_fault',
    },
    {
      id: 'evidence_for_fault',
      type: 'info',
      prompt:
        "EVIDENCE TO ESTABLISH THE DEFENDANT'S FAULT:\n\u2022 Police accident report \u2014 the officer's determination of who was at fault is persuasive (though not binding)\n\u2022 Photos and video \u2014 dashcam, traffic cameras, security cameras, cell phone photos from the scene\n\u2022 Witness statements \u2014 passengers, bystanders, other drivers who saw the accident\n\u2022 Phone records \u2014 showing the defendant was texting or on a call at the time of impact\n\u2022 Vehicle damage patterns \u2014 where the damage is on each vehicle tells a story about how the accident happened\n\u2022 Accident reconstruction expert \u2014 can analyze skid marks, damage, and physics to determine fault\n\u2022 Toxicology or BAC results \u2014 if the defendant was intoxicated",
    },
    {
      id: 'common_defense_arguments',
      type: 'info',
      prompt:
        "COMMON DEFENSE ARGUMENTS TO PREPARE FOR:\n\u2022 \"The plaintiff failed to keep a proper lookout\" \u2014 Counter: describe exactly what you were doing and where you were looking\n\u2022 \"The plaintiff was speeding\" \u2014 Counter: provide speed data, witness testimony, or GPS records\n\u2022 \"The plaintiff could have avoided the accident\" \u2014 Counter: explain the split-second nature of the situation\n\u2022 \"The plaintiff's injuries were pre-existing\" \u2014 Counter: medical records showing your condition before vs. after the accident\n\u2022 \"The plaintiff failed to mitigate damages\" \u2014 Counter: show you followed all medical advice and treatment plans\n\u2022 \"There were multiple causes\" \u2014 Counter: even with multiple causes, if the defendant was primarily at fault, you recover",
    },
    {
      id: 'case_strategy_impact',
      type: 'info',
      prompt:
        "HOW COMPARATIVE FAULT AFFECTS YOUR STRATEGY:\n\u2022 In settlement negotiations: the defense will argue your fault percentage to reduce the offer. Know your realistic fault exposure.\n\u2022 In mediation: the mediator will discuss fault allocation openly. Be prepared with your best arguments.\n\u2022 At trial: the jury assigns specific percentages to each party on the verdict form. Your closing argument should suggest a specific percentage split (e.g., \"the evidence shows the defendant was 100% at fault\" or \"even under the most generous reading for the defense, my client was no more than 10% at fault\").\n\u2022 Multiple defendants: if there are multiple defendants, fault is allocated among ALL parties, which can reduce your percentage.",
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

    items.push({
      status: 'info',
      text: 'Key evidence: police report, photos/video, witness statements, phone records, vehicle damage patterns.',
    })

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
}
