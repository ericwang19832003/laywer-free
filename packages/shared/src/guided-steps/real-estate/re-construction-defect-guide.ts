import type { GuidedStepConfig } from '../types'

export const reConstructionDefectGuideConfig: GuidedStepConfig = {
  title: 'Construction Defect Claims (RCLA)',
  reassurance:
    'Texas has a specific law — the Residential Construction Liability Act — that governs how homeowners pursue claims against builders. Following the required steps protects your right to recover.',

  questions: [
    {
      id: 'rcla_overview',
      type: 'info',
      prompt:
        'THE RCLA (Tex. Property Code Ch. 27):\nThe Texas Residential Construction Liability Act applies to virtually all claims against residential builders and contractors for construction defects. Before you can file a lawsuit, you MUST follow a pre-suit notice process. Skipping this step can result in your case being dismissed or your damages being reduced.',
    },
    {
      id: 'defect_type',
      type: 'single_choice',
      prompt: 'What type of defect are you dealing with?',
      options: [
        { value: 'structural', label: 'Structural — foundation, framing, load-bearing walls, roof structure' },
        { value: 'cosmetic', label: 'Cosmetic — paint, trim, finishes, minor cracks' },
        { value: 'mechanical', label: 'Mechanical — plumbing, electrical, HVAC systems' },
        { value: 'water_intrusion', label: 'Water intrusion — leaks, moisture damage, mold' },
        { value: 'multiple', label: 'Multiple defects' },
      ],
    },
    {
      id: 'structural_info',
      type: 'info',
      prompt:
        'STRUCTURAL DEFECTS:\n• Statute of limitations: 10 years from substantial completion of the original construction\n• These are the most serious claims — foundation cracks, framing failures, roof structural issues\n• An expert structural engineer report is typically required to prove the defect and causation\n• Damages can include cost to repair, diminished property value, and relocation costs during repair',
      showIf: (answers) => answers.defect_type === 'structural' || answers.defect_type === 'multiple',
    },
    {
      id: 'cosmetic_info',
      type: 'info',
      prompt:
        'NON-STRUCTURAL / COSMETIC DEFECTS:\n• Statute of limitations: 2 years from the date you discovered (or should have discovered) the defect\n• These claims have a shorter window — act quickly\n• Document everything with photographs and written descriptions\n• Get at least one independent repair estimate',
      showIf: (answers) => answers.defect_type === 'cosmetic' || answers.defect_type === 'multiple',
    },
    {
      id: 'mechanical_info',
      type: 'info',
      prompt:
        'MECHANICAL / SYSTEMS DEFECTS:\n• Plumbing, electrical, and HVAC defects may be structural or non-structural depending on severity\n• Check your builder warranty — many systems have specific warranty periods\n• Document failures with dates, repair invoices, and photographs\n• A licensed inspector or engineer can classify the defect for statute of limitations purposes',
      showIf: (answers) => answers.defect_type === 'mechanical' || answers.defect_type === 'multiple',
    },
    {
      id: 'water_info',
      type: 'info',
      prompt:
        'WATER INTRUSION DEFECTS:\n• Water intrusion can cause both structural and cosmetic damage — document both\n• Mold remediation costs can be substantial and are recoverable\n• Get a moisture survey from a qualified inspector\n• Photograph the water damage progression over time if possible',
      showIf: (answers) => answers.defect_type === 'water_intrusion' || answers.defect_type === 'multiple',
    },
    {
      id: 'sent_notice',
      type: 'yes_no',
      prompt: 'Have you sent the required RCLA pre-suit notice to the builder?',
      helpText:
        'The RCLA requires you to send written notice to the builder by certified mail at least 60 days before filing suit. The notice must describe the defects in reasonable detail.',
    },
    {
      id: 'notice_not_sent_info',
      type: 'info',
      prompt:
        'REQUIRED: RCLA PRE-SUIT NOTICE (60 days before filing):\n1. Draft a written notice describing each defect in reasonable detail\n2. Send it to the builder by certified mail, return receipt requested\n3. The builder then has 35 days to request an inspection of the property\n4. After inspection, the builder has 45 days from receiving the notice to make a written offer to repair, settle, or reject the claim\n5. You may not file suit until the 60-day period expires\n6. KEEP YOUR CERTIFIED MAIL RECEIPT — you will need to prove you sent the notice',
      showIf: (answers) => answers.sent_notice === 'no',
    },
    {
      id: 'builder_response',
      type: 'single_choice',
      prompt: 'How did the builder respond to your notice?',
      showIf: (answers) => answers.sent_notice === 'yes',
      options: [
        { value: 'offered_repair', label: 'Offered to repair the defects' },
        { value: 'offered_settlement', label: 'Offered a monetary settlement' },
        { value: 'rejected', label: 'Rejected my claim' },
        { value: 'no_response', label: 'No response within 60 days' },
        { value: 'waiting', label: 'Still within the 60-day window' },
      ],
    },
    {
      id: 'offered_repair_info',
      type: 'info',
      prompt:
        "BUILDER OFFERED TO REPAIR:\n• You may accept or reject the offer. If you reject a reasonable offer, a court may limit your damages.\n• If you accept, the builder must complete repairs within a reasonable time (the offer should specify a timeline).\n• Document the repair work — photograph before, during, and after.\n• If the repairs are inadequate, you can then file suit for the remaining defects.\n• Get an independent inspection after the builder's repairs are complete.",
      showIf: (answers) => answers.builder_response === 'offered_repair',
    },
    {
      id: 'rejected_or_no_response_info',
      type: 'info',
      prompt:
        'BUILDER REJECTED OR DID NOT RESPOND:\n• You may now file suit once the 60-day period has expired.\n• You will need an expert affidavit — Texas courts generally require an affidavit from a qualified expert (engineer, architect, or inspector) describing the defect, its cause, and the cost to repair.\n• Gather your evidence: inspection reports, repair estimates, photographs, the RCLA notice and certified mail receipt, and any communications with the builder.',
      showIf: (answers) =>
        answers.builder_response === 'rejected' || answers.builder_response === 'no_response',
    },
    {
      id: 'has_expert',
      type: 'yes_no',
      prompt: 'Do you have an expert report or inspection documenting the defects?',
    },
    {
      id: 'expert_needed_info',
      type: 'info',
      prompt:
        'EXPERT AFFIDAVIT REQUIREMENT:\n• Most construction defect cases require an expert affidavit identifying the defect, explaining why it constitutes a construction defect, and estimating the cost to repair.\n• Qualified experts include: licensed professional engineers, registered architects, licensed home inspectors.\n• Get multiple repair estimates to support your damages claim.\n• The expert may need to physically inspect the property — coordinate access.',
      showIf: (answers) => answers.has_expert === 'no',
    },
    {
      id: 'damages_type',
      type: 'single_choice',
      prompt: 'What damages are you seeking?',
      options: [
        { value: 'repair_cost', label: 'Cost to repair the defects' },
        { value: 'diminished_value', label: 'Diminished property value' },
        { value: 'relocation', label: 'Relocation costs during repair' },
        { value: 'multiple_damages', label: 'Multiple types of damages' },
      ],
    },
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'RECOVERABLE DAMAGES UNDER THE RCLA:\n• Cost to repair: The primary measure of damages — what it costs to fix the defect properly.\n• Diminished value: If the property is worth less even after repair, you can recover the difference.\n• Relocation costs: If you must move out during repairs, temporary housing and moving expenses are recoverable.\n• Engineering/inspection fees: Costs of expert inspections and reports.\n• Note: The RCLA limits certain damages — you generally cannot recover mental anguish or punitive damages under the RCLA alone (but you may have other claims, such as DTPA violations, that allow additional damages).',
      showIf: (answers) => answers.damages_type === 'multiple_damages',
    },
    {
      id: 'repose_info',
      type: 'info',
      prompt:
        'STATUTE OF REPOSE:\nTexas has a 10-year statute of repose for construction defect claims (Tex. Civ. Prac. & Rem. Code §16.009). After 10 years from substantial completion of the improvement, you generally cannot bring a claim regardless of when the defect was discovered. This is an absolute outer limit — do not confuse it with the statute of limitations.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.defect_type) {
      const labels: Record<string, string> = {
        structural: 'Structural defect (10-year statute of limitations)',
        cosmetic: 'Cosmetic/non-structural defect (2-year statute of limitations)',
        mechanical: 'Mechanical/systems defect',
        water_intrusion: 'Water intrusion defect',
        multiple: 'Multiple defect types',
      }
      items.push({ status: 'done', text: `Defect type: ${labels[answers.defect_type]}.` })
    } else {
      items.push({ status: 'needed', text: 'Identify the type of construction defect.' })
    }

    if (answers.sent_notice === 'yes') {
      items.push({ status: 'done', text: 'RCLA pre-suit notice sent to builder.' })
    } else if (answers.sent_notice === 'no') {
      items.push({
        status: 'needed',
        text: 'Send the required RCLA pre-suit notice to the builder by certified mail. You must wait 60 days before filing suit.',
      })
    }

    if (answers.builder_response === 'offered_repair') {
      items.push({
        status: 'info',
        text: 'Builder offered to repair. Consider the offer carefully — rejecting a reasonable offer may limit your damages in court.',
      })
    } else if (answers.builder_response === 'offered_settlement') {
      items.push({
        status: 'info',
        text: 'Builder offered a monetary settlement. Compare it against your expert repair estimates before deciding.',
      })
    } else if (answers.builder_response === 'rejected' || answers.builder_response === 'no_response') {
      items.push({
        status: 'done',
        text: 'Builder rejected or did not respond. You may proceed to file suit after the 60-day window.',
      })
    } else if (answers.builder_response === 'waiting') {
      items.push({
        status: 'needed',
        text: 'Wait for the 60-day RCLA notice period to expire before filing suit.',
      })
    }

    if (answers.has_expert === 'yes') {
      items.push({ status: 'done', text: 'Expert report or inspection obtained.' })
    } else if (answers.has_expert === 'no') {
      items.push({
        status: 'needed',
        text: 'Obtain an expert report from a licensed engineer, architect, or inspector documenting the defects and repair cost.',
      })
    }

    if (answers.damages_type) {
      const labels: Record<string, string> = {
        repair_cost: 'Cost to repair',
        diminished_value: 'Diminished property value',
        relocation: 'Relocation costs during repair',
        multiple_damages: 'Multiple damages (repair, diminished value, relocation)',
      }
      items.push({ status: 'done', text: `Damages sought: ${labels[answers.damages_type]}.` })
    }

    items.push({
      status: 'info',
      text: 'Texas has a 10-year statute of repose from substantial completion. After that, claims are barred regardless of when the defect was discovered.',
    })

    return items
  },
}
