import type { GuidedStepConfig } from '../types'

export const contractCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your Contract Trial',
  reassurance:
    'Contract cases are won with documents and clear storytelling. If you have the contract and proof of breach, you have a strong case.',

  questions: [
    {
      id: 'which_court',
      type: 'single_choice',
      prompt: 'Which court is your case in?',
      options: [
        { value: 'jp', label: 'Justice of the Peace (JP) Court' },
        { value: 'county', label: 'County Court' },
        { value: 'district', label: 'District Court' },
        { value: 'unsure', label: "I'm not sure" },
      ],
    },
    {
      id: 'jp_info',
      type: 'info',
      prompt:
        'JP Court is informal. No jury unless requested. The judge may ask questions directly. You can present evidence without formal rules. Keep it simple and organized — judges appreciate brevity.',
      showIf: (answers) => answers.which_court === 'jp',
    },
    {
      id: 'county_info',
      type: 'info',
      prompt:
        'County Court is more formal than JP Court. Rules of evidence apply. You may have a jury. Dress professionally, address the judge as "Your Honor," and be prepared to formally introduce each piece of evidence.',
      showIf: (answers) => answers.which_court === 'county',
    },
    {
      id: 'district_info',
      type: 'info',
      prompt:
        'District Court is the most formal. Strict rules of evidence and procedure apply. Jury trials are common. You will need to formally offer each exhibit, lay foundation for evidence, and follow courtroom protocol precisely.',
      showIf: (answers) => answers.which_court === 'district',
    },
    {
      id: 'unsure_info',
      type: 'info',
      prompt:
        'Check your court paperwork — the court name is on your citation or petition. JP Courts handle claims up to $20,000. County Courts handle claims up to $200,000. District Courts handle claims over $200,000.',
      showIf: (answers) => answers.which_court === 'unsure',
    },
    {
      id: 'trial_structure',
      type: 'info',
      prompt:
        'TRIAL STRUCTURE:\n1. Opening statements\n2. YOUR case (you\'re the plaintiff):\n   - Present the contract (Exhibit A)\n   - Testify about what was promised\n   - Show proof of breach (emails, photos, invoices)\n   - Present your damages calculation\n3. Defendant\'s case\n4. Closing arguments\n5. Judge/jury decides',
    },
    {
      id: 'sample_testimony',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY:\n"Your Honor, on [date], I entered into a [written/oral] contract with the defendant for [describe]. The contract required [them to do X]. I performed my obligations by [paying/delivering/etc.]. The defendant breached by [describe breach]. As a result, I suffered damages of $[amount], consisting of [itemize]."',
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        "WHAT NOT TO SAY:\nDon't say \"they lied to me\" unless you're also claiming fraud. Don't discuss the fairness of the contract — courts enforce contracts as written, even if they seem unfair. Don't exaggerate damages — present documented amounts only.",
    },
    {
      id: 'what_to_bring',
      type: 'info',
      prompt:
        'WHAT TO BRING TO COURT:\n• 3 copies of everything (you, judge, defendant)\n• The original contract (or best copy available)\n• All communications (emails, texts, letters)\n• Proof of your performance (receipts, photos, delivery confirmations)\n• Proof of breach (missed deadlines, defective work, non-payment)\n• Damages calculation with supporting documents (invoices, estimates, bank statements)\n• Timeline of events (written out)\n• Witness list (if any)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.which_court && answers.which_court !== 'unsure') {
      const courtLabels: Record<string, string> = {
        jp: 'Justice of the Peace (JP) Court',
        county: 'County Court',
        district: 'District Court',
      }
      items.push({
        status: 'done',
        text: `Court identified: ${courtLabels[answers.which_court]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine which court your case is in — check your citation or petition.',
      })
    }

    items.push({
      status: 'info',
      text: 'Prepare 3 copies of all evidence (you, judge, defendant).',
    })

    items.push({
      status: 'needed',
      text: 'Organize the contract, all communications, and proof of breach chronologically.',
    })

    items.push({
      status: 'needed',
      text: 'Prepare a clear damages calculation with supporting documents.',
    })

    items.push({
      status: 'info',
      text: 'Practice your testimony — keep it factual, focus on the contract terms, breach, and documented damages.',
    })

    return items
  },
}
