import type { GuidedStepConfig } from '../types'

export const rePostJudgmentGuideConfig: GuidedStepConfig = {
  title: "After the Court's Decision",
  reassurance:
    'In real estate cases, the judgment is not always the end — recording, clearing title, and enforcing the decision are critical next steps. We will walk you through each one.',

  questions: [
    {
      id: 'outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'won_full', label: 'Won — got what I asked for' },
        { value: 'won_partial', label: 'Won — got some of what I asked for' },
        { value: 'lost', label: 'Lost the case' },
        { value: 'settled', label: 'Settled / agreed to a resolution' },
      ],
    },

    // Won — recording and title
    {
      id: 'won_info',
      type: 'info',
      prompt:
        'FIRST STEP — RECORD THE JUDGMENT:\nIn real estate cases, recording is essential.\n\n1. Get a certified copy of the judgment from the court clerk.\n2. Record the judgment with the county clerk in the county where the property is located.\n3. This creates a public record that puts the world on notice of the court\'s decision.\n4. If the judgment transfers title or establishes a boundary, the recorded judgment is how title companies and future buyers will know about it.\n5. File in EVERY county where affected property is located.',
      showIf: (answers) => answers.outcome === 'won_full' || answers.outcome === 'won_partial',
    },

    {
      id: 'judgment_type',
      type: 'single_choice',
      prompt: 'What did the court order?',
      showIf: (answers) => answers.outcome === 'won_full' || answers.outcome === 'won_partial',
      options: [
        { value: 'money_damages', label: 'Money damages' },
        { value: 'specific_performance', label: 'Specific performance (court-ordered closing)' },
        { value: 'quiet_title', label: 'Quiet title / ownership established' },
        { value: 'boundary_established', label: 'Boundary line established' },
        { value: 'multiple_remedies', label: 'Multiple remedies' },
      ],
    },

    // Money damages collection
    {
      id: 'money_damages_info',
      type: 'info',
      prompt:
        'COLLECTING A MONEY JUDGMENT IN REAL ESTATE CASES:\n\n1. ABSTRACT OF JUDGMENT: File with the county clerk to create an automatic lien on ALL real property the defendant owns in that county. File in every county where they own property.\n2. EXECUTION: Request a Writ of Execution from the court — the constable can seize and sell the defendant\'s non-exempt property to satisfy the judgment.\n3. BANK GARNISHMENT: File a Writ of Garnishment to seize funds from the defendant\'s bank accounts.\n4. POST-JUDGMENT INTEREST: 5% per year (Tex. Fin. Code §304.003) from the date of judgment.\n5. POST-JUDGMENT DISCOVERY: If the defendant hides assets, file interrogatories demanding they disclose all bank accounts, property, and income.',
      showIf: (answers) => answers.judgment_type === 'money_damages' || answers.judgment_type === 'multiple_remedies',
    },

    // Specific performance
    {
      id: 'specific_performance_info',
      type: 'info',
      prompt:
        'ENFORCING SPECIFIC PERFORMANCE (COURT-ORDERED CLOSING):\n\n1. The court\'s judgment orders the other party to complete the sale. If they refuse, the court can hold them in contempt.\n2. In many cases, the judge will sign a deed on behalf of the non-complying party (Tex. Prop. Code §5.081 allows court-ordered conveyance).\n3. Coordinate with the title company to schedule the closing based on the court order.\n4. Record the judgment and the deed with the county clerk.\n5. If there is a lis pendens on the property, it will be resolved by the judgment — but file a release of lis pendens after closing for a clean record.\n6. The title company may require a title insurance endorsement or new policy reflecting the court-ordered transfer.',
      showIf: (answers) => answers.judgment_type === 'specific_performance' || answers.judgment_type === 'multiple_remedies',
    },

    // Quiet title / clearing title
    {
      id: 'quiet_title_info',
      type: 'info',
      prompt:
        'CLEARING TITLE AFTER JUDGMENT:\n\n1. Record the quiet title judgment with the county clerk. This establishes your ownership in the public record.\n2. Provide the recorded judgment to your title insurance company — they will update the title commitment.\n3. If there were adverse claims, liens, or encumbrances that the judgment resolved, make sure the judgment specifically addresses each one.\n4. Order a new title search to confirm the title is clean after recording.\n5. If you plan to sell or refinance, the title company will want to see the recorded judgment as part of the chain of title.',
      showIf: (answers) => answers.judgment_type === 'quiet_title' || answers.judgment_type === 'boundary_established' || answers.judgment_type === 'multiple_remedies',
    },

    // Lis pendens removal
    {
      id: 'had_lis_pendens',
      type: 'yes_no',
      prompt: 'Was a lis pendens filed on the property during the lawsuit?',
      showIf: (answers) => answers.outcome === 'won_full' || answers.outcome === 'won_partial' || answers.outcome === 'settled',
    },
    {
      id: 'lis_pendens_info',
      type: 'info',
      prompt:
        'REMOVING THE LIS PENDENS:\n• After the case is resolved, the lis pendens should be released to clear the title.\n• File a "Release of Lis Pendens" or "Notice of Withdrawal of Lis Pendens" with the county clerk where the lis pendens was recorded.\n• If the other party filed the lis pendens and won\'t release it, you can file a motion with the court to expunge it.\n• An unreleased lis pendens will cloud the title and make it difficult to sell or refinance the property.\n• Do this promptly — title companies will not insure over an active lis pendens.',
      showIf: (answers) => answers.had_lis_pendens === 'yes',
    },

    // Title insurance claim
    {
      id: 'title_insurance',
      type: 'yes_no',
      prompt: 'Do you have title insurance on the property?',
      showIf: (answers) => answers.outcome === 'won_full' || answers.outcome === 'won_partial',
    },
    {
      id: 'title_insurance_info',
      type: 'info',
      prompt:
        'TITLE INSURANCE CLAIM AFTER JUDGMENT:\n• If you had title insurance and the dispute involved a covered title defect, your title insurance company may owe you for losses or legal fees.\n• Submit a claim with the recorded judgment, the title policy, and documentation of your losses.\n• Title insurance covers defects that existed BEFORE the policy was issued (not new issues).\n• Common covered claims: undisclosed liens, forged deeds, missing heirs, recording errors, boundary encroachments.\n• The title company may subrogate — pursue recovery from the party that caused the defect.',
      showIf: (answers) => answers.title_insurance === 'yes',
    },

    // Lost — appeal options
    {
      id: 'lost_info',
      type: 'info',
      prompt:
        'YOUR OPTIONS AFTER LOSING:\n\n1. APPEAL: You have 30 days from the date the judgment is signed to file a Notice of Appeal.\n2. MOTION FOR NEW TRIAL: File within 30 days if there is newly discovered evidence or procedural errors. The court must rule within 75 days or it is overruled by operation of law.\n3. The appellate court reviews legal errors — it is not a new trial. You must show the trial court made a legal mistake.\n4. You MUST comply with the judgment during the appeal unless you obtain a supersedeas bond (security posted with the court to stay enforcement).\n5. In real estate cases, appealing is especially important if title or possession is at stake — the consequences of losing are often irreversible.',
      showIf: (answers) => answers.outcome === 'lost',
    },
    {
      id: 'considering_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) => answers.outcome === 'lost' || answers.outcome === 'won_partial',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'APPEAL TIMELINE AND PROCESS:\n• Notice of Appeal: File within 30 days of the judgment being signed.\n• Supersedeas Bond: If you want to stop enforcement during appeal, post a bond with the court (typically 100-150% of the judgment amount for money judgments).\n• Appellate Brief: You will need to file a brief explaining the legal errors.\n• Timeline: Appeals typically take 6-18 months.\n• Standard of Review: The appellate court gives deference to the trial court on factual findings but reviews legal questions independently.\n• Consider consulting an appellate attorney — appellate practice is specialized.',
      showIf: (answers) => answers.considering_appeal === 'yes',
    },

    // Settled
    {
      id: 'settled_info',
      type: 'info',
      prompt:
        'AFTER SETTLEMENT IN A REAL ESTATE CASE:\n\n1. Get the settlement agreement in writing and signed by all parties.\n2. If the settlement involves a property transfer, execute and record the deed with the county clerk.\n3. If the settlement resolves a title dispute, record a memorandum of settlement or agreed judgment.\n4. Release any lis pendens that were filed during the lawsuit.\n5. If earnest money was in escrow, ensure it is distributed per the agreement.\n6. File an agreed dismissal with the court to formally end the case.\n7. Update your title insurance company about the resolution.',
      showIf: (answers) => answers.outcome === 'settled',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.outcome) {
      const outcomeLabels: Record<string, string> = {
        won_full: 'Favorable outcome',
        won_partial: 'Partial outcome',
        lost: 'Unfavorable outcome',
        settled: 'Settled by agreement',
      }
      items.push({
        status: answers.outcome === 'won_full' || answers.outcome === 'settled' ? 'done' : 'info',
        text: `Outcome: ${outcomeLabels[answers.outcome]}.`,
      })
    } else {
      items.push({ status: 'needed', text: 'Record the outcome of your case.' })
    }

    if (answers.outcome === 'won_full' || answers.outcome === 'won_partial') {
      items.push({
        status: 'needed',
        text: 'Get a certified copy of the judgment and record it with the county clerk where the property is located.',
      })

      if (answers.judgment_type === 'money_damages' || answers.judgment_type === 'multiple_remedies') {
        items.push({
          status: 'needed',
          text: "File an Abstract of Judgment to create a lien on the defendant's other properties. Pursue garnishment if they don't pay voluntarily.",
        })
        items.push({
          status: 'info',
          text: 'The judgment accrues interest at 5% per year (Tex. Fin. Code §304.003) until paid.',
        })
      }

      if (answers.judgment_type === 'specific_performance' || answers.judgment_type === 'multiple_remedies') {
        items.push({
          status: 'needed',
          text: 'Coordinate the court-ordered closing with the title company. Record the deed with the county clerk.',
        })
      }

      if (answers.judgment_type === 'quiet_title' || answers.judgment_type === 'boundary_established' || answers.judgment_type === 'multiple_remedies') {
        items.push({
          status: 'needed',
          text: 'Record the quiet title judgment and order a new title search to confirm the title is clean.',
        })
      }
    }

    if (answers.had_lis_pendens === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a Release of Lis Pendens with the county clerk to clear the title.',
      })
    }

    if (answers.title_insurance === 'yes') {
      items.push({
        status: 'info',
        text: 'Submit a claim to your title insurance company with the recorded judgment and documentation of losses.',
      })
    }

    if (answers.outcome === 'lost') {
      items.push({
        status: 'info',
        text: 'You must comply with the judgment during any appeal. File a Notice of Appeal within 30 days.',
      })
    }

    if (answers.considering_appeal === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a Notice of Appeal within 30 days. Consider posting a supersedeas bond to stay enforcement.',
      })
    }

    if (answers.outcome === 'settled') {
      items.push({
        status: 'needed',
        text: 'Execute and record any deeds, release lis pendens, distribute escrow funds, and file an agreed dismissal with the court.',
      })
    }

    return items
  },
}
