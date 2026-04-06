import type { GuidedStepConfig } from '../types'

export const piExpertWitnessGuideConfig: GuidedStepConfig = {
  title: 'Do You Need Expert Witnesses?',
  reassurance:
    'Expert witnesses can strengthen your case significantly. This guide helps you determine if you need one and how to find affordable options.',

  questions: [
    {
      id: 'when_experts_needed',
      type: 'info',
      prompt:
        "WHEN ARE EXPERT WITNESSES NEEDED?\nExperts are not required in every PI case, but they can be critical when:\n\u2022 Liability is disputed \u2014 an accident reconstruction expert can prove who was at fault\n\u2022 Causation is disputed \u2014 a medical expert can testify your injuries were caused by the accident (not pre-existing)\n\u2022 Future damages are claimed \u2014 a life care planner or vocational expert can project future medical costs or lost earning capacity\n\u2022 The injuries are complex \u2014 a medical specialist can explain your condition to the jury in understandable terms\n\nWithout expert testimony on causation, the defense may file a motion for summary judgment arguing there is no competent evidence linking the accident to your injuries.",
    },
    {
      id: 'liability_disputed',
      type: 'yes_no',
      prompt: 'Is there a dispute about who caused the accident?',
      helpText:
        'If the other driver admits fault or the police report is clear, you may not need a liability expert. But if fault is contested, an accident reconstruction expert can be very persuasive.',
    },
    {
      id: 'accident_reconstruction_info',
      type: 'info',
      prompt:
        "ACCIDENT RECONSTRUCTION EXPERT:\n\u2022 What they do: Analyze physical evidence (skid marks, vehicle damage, road conditions, sight lines) and physics to determine how the accident occurred and who was at fault\n\u2022 When needed: Disputed liability, multi-vehicle accidents, hit-and-runs with physical evidence, accidents with no witnesses\n\u2022 Typical cost: $2,000\u2013$5,000 for a report; $3,000\u2013$5,000+ for trial testimony\n\u2022 Where to find: University engineering departments, retired law enforcement accident investigators, professional engineering firms\n\u2022 Budget option: Some retired highway patrol officers do accident reconstruction at lower rates ($1,500\u2013$2,500)",
      showIf: (answers) => answers.liability_disputed === 'yes',
    },
    {
      id: 'causation_concern',
      type: 'yes_no',
      prompt: 'Might the defense argue your injuries were pre-existing or not caused by this accident?',
      helpText:
        'This is common when you had prior injuries to the same body part, there was a gap in treatment, or the accident seemed minor relative to your claimed injuries.',
    },
    {
      id: 'medical_expert_info',
      type: 'info',
      prompt:
        "MEDICAL EXPERT (CAUSATION):\n\u2022 What they do: Review your medical records and testify that your injuries were caused (or worsened) by the accident, not a pre-existing condition\n\u2022 When needed: Prior injuries to the same area, \"low impact\" accidents with significant injuries, complex injuries, defense medical exam (DME) disputes\n\u2022 Typical cost: $1,500\u2013$3,000 for a records review and written report; $2,500\u2013$5,000 for deposition or trial testimony\n\u2022 Where to find: Your treating physician may serve as your expert (often cheaper). Otherwise, look for board-certified specialists in the relevant field.\n\u2022 Budget option: Your treating doctor is the cheapest expert \u2014 they already know your case. Ask if they will write a causation letter or testify.",
      showIf: (answers) => answers.causation_concern === 'yes',
    },
    {
      id: 'lost_earning_capacity',
      type: 'yes_no',
      prompt: 'Are you claiming long-term or permanent lost earning capacity?',
      helpText:
        'If your injuries prevent you from returning to your previous job or reduce your future earning ability, a vocational expert can quantify that loss.',
    },
    {
      id: 'vocational_expert_info',
      type: 'info',
      prompt:
        "VOCATIONAL EXPERT (LOST EARNING CAPACITY):\n\u2022 What they do: Evaluate your education, work history, skills, and physical limitations to determine how the injury affects your future earning ability\n\u2022 When needed: Permanent disability, career change required due to injury, significant gap in work history due to recovery\n\u2022 Typical cost: $2,000\u2013$4,000 for evaluation and report\n\u2022 Where to find: Vocational rehabilitation counselors, university professors in rehabilitation or economics departments\n\u2022 They calculate: pre-injury earning capacity vs. post-injury earning capacity, multiplied by your remaining work-life expectancy\n\nNote: Without a vocational expert, the jury must guess at future lost earnings \u2014 and they often underestimate.",
      showIf: (answers) => answers.lost_earning_capacity === 'yes',
    },
    {
      id: 'finding_affordable_experts',
      type: 'info',
      prompt:
        "FINDING AFFORDABLE EXPERTS:\n\u2022 University professors \u2014 often willing to serve as experts at lower rates ($1,500\u2013$3,000) than private consultants\n\u2022 Retired professionals \u2014 retired doctors, engineers, or law enforcement can provide expert testimony at reduced rates\n\u2022 Your treating physician \u2014 already familiar with your case, so less time reviewing records = lower cost\n\u2022 Expert witness directories \u2014 the Texas Bar Association, SEAK, and ExpertPages.com list experts by specialty and location\n\u2022 Payment timing \u2014 many experts will defer payment until your case settles (especially in PI cases). Ask about contingency or deferred fee arrangements.\n\nTypical total expert costs: $1,500\u2013$5,000 per expert for reports. Trial testimony adds $2,000\u2013$5,000 per day.",
    },
    {
      id: 'without_experts_risk',
      type: 'info',
      prompt:
        "WHAT HAPPENS WITHOUT EXPERT WITNESSES?\n\u2022 Causation: If the defense argues your injuries are pre-existing and you have no medical expert to say otherwise, the court may grant summary judgment and dismiss your case. In Texas, lay testimony alone is often insufficient to establish medical causation.\n\u2022 Liability: Without an accident reconstruction expert in a disputed-fault case, it becomes your word against theirs.\n\u2022 Damages: Without a vocational expert, the jury has no framework for calculating future lost earnings and may award far less than you deserve.\n\nBottom line: In straightforward cases (clear liability, well-documented injuries), you may not need experts. In contested cases, the cost of an expert is almost always worth it compared to the risk of losing.",
    },
    {
      id: 'expert_reports_at_trial',
      type: 'info',
      prompt:
        "HOW EXPERT REPORTS ARE USED AT TRIAL:\n\u2022 Expert reports must be disclosed to the opposing party during discovery (usually 30 days before trial per local rules)\n\u2022 The expert may testify live at trial, by deposition video, or their written report may be admitted as evidence\n\u2022 The defense can cross-examine your expert and hire their own expert to contradict the findings\n\u2022 Judges may hold a \"Daubert\" or \"Robinson\" hearing (in Texas, Robinson v. Allied Chem. Corp.) to determine if your expert's methodology is reliable before allowing testimony\n\u2022 Prepare your expert by reviewing likely cross-examination questions\n\u2022 The expert should be able to explain their opinions in plain language the jury can understand",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.liability_disputed === 'yes') {
      items.push({
        status: 'needed',
        text: 'Liability is disputed \u2014 consider an accident reconstruction expert ($2,000\u2013$5,000 for report).',
      })
    } else if (answers.liability_disputed === 'no') {
      items.push({
        status: 'done',
        text: 'Liability is clear \u2014 accident reconstruction expert likely not needed.',
      })
    }

    if (answers.causation_concern === 'yes') {
      items.push({
        status: 'needed',
        text: 'Causation may be challenged \u2014 get a medical expert opinion. Your treating doctor is the most affordable option.',
      })
    } else if (answers.causation_concern === 'no') {
      items.push({
        status: 'done',
        text: 'Causation not disputed \u2014 medical expert may not be necessary.',
      })
    }

    if (answers.lost_earning_capacity === 'yes') {
      items.push({
        status: 'needed',
        text: 'Claiming lost earning capacity \u2014 a vocational expert ($2,000\u2013$4,000) can quantify future losses.',
      })
    } else if (answers.lost_earning_capacity === 'no') {
      items.push({
        status: 'done',
        text: 'Not claiming long-term lost earning capacity \u2014 vocational expert not needed.',
      })
    }

    items.push({
      status: 'info',
      text: 'Budget options: university professors, retired professionals, and your treating physician. Many experts defer payment until settlement.',
    })

    items.push({
      status: 'info',
      text: 'Without a causation expert, the defense may seek summary judgment. Weigh the cost of an expert against the risk of losing.',
    })

    items.push({
      status: 'info',
      text: "Expert reports must be disclosed during discovery. Experts may face cross-examination and a Robinson reliability hearing.",
    })

    return items
  },
}
