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
      acknowledgeLabel: "I understand JP Court is informal — I'll keep it simple",
      showIf: (answers) => answers.which_court === 'jp',
    },
    {
      id: 'county_info',
      type: 'info',
      prompt:
        'County Court is more formal than JP Court. Rules of evidence apply. You may have a jury. Dress professionally, address the judge as "Your Honor," and be prepared to formally introduce each piece of evidence.',
      acknowledgeLabel: "I understand County Court uses formal rules of evidence",
      showIf: (answers) => answers.which_court === 'county',
    },
    {
      id: 'district_info',
      type: 'info',
      prompt:
        'District Court is the most formal. Strict rules of evidence and procedure apply. Jury trials are common. You will need to formally offer each exhibit, lay foundation for evidence, and follow courtroom protocol precisely.',
      acknowledgeLabel: "I understand District Court has strict procedures",
      showIf: (answers) => answers.which_court === 'district',
    },
    {
      id: 'unsure_info',
      type: 'info',
      prompt:
        'Check your court paperwork — the court name is on your citation or petition. JP Courts handle claims up to $20,000. County Courts handle claims up to $250,000. District Courts handle claims over $250,000.',
      acknowledgeLabel: "I'll check my court paperwork for the court name",
      showIf: (answers) => answers.which_court === 'unsure',
    },
    {
      id: 'trial_structure',
      type: 'info',
      prompt:
        'TRIAL STRUCTURE:\n1. Opening statements\n2. YOUR case (you\'re the plaintiff):\n   - Present the contract (Exhibit A)\n   - Testify about what was promised\n   - Show proof of breach (emails, photos, invoices)\n   - Present your damages calculation\n3. Defendant\'s case\n4. Closing arguments\n5. Judge/jury decides',
      acknowledgeLabel: "I understand the trial flow",
    },
    {
      id: 'sample_testimony',
      type: 'info',
      prompt:
        'SAMPLE TESTIMONY:\n"Your Honor, on [date], I entered into a [written/oral] contract with the defendant for [describe]. The contract required [them to do X]. I performed my obligations by [paying/delivering/etc.]. The defendant breached by [describe breach]. As a result, I suffered damages of $[amount], consisting of [itemize]."',
      acknowledgeLabel: "I'll use this structure for my testimony",
    },
    {
      id: 'what_not_to_say',
      type: 'info',
      prompt:
        "WHAT NOT TO SAY:\nDon't say \"they lied to me\" unless you're also claiming fraud. Don't discuss the fairness of the contract — courts enforce contracts as written, even if they seem unfair. Don't exaggerate damages — present documented amounts only.",
      acknowledgeLabel: "I'll avoid these mistakes at trial",
    },
    {
      id: 'what_to_bring',
      type: 'multi_select',
      prompt: 'Which of these have you prepared for court?',
      options: [
        { value: 'contract_copies', label: '3 copies of the original contract (you, judge, defendant)' },
        { value: 'communications', label: 'All communications (emails, texts, letters)' },
        { value: 'performance_proof', label: 'Proof of your performance (receipts, photos, confirmations)' },
        { value: 'breach_proof', label: 'Proof of breach (missed deadlines, defective work, non-payment)' },
        { value: 'damages_docs', label: 'Damages calculation with supporting documents' },
        { value: 'timeline', label: 'Written timeline of events' },
        { value: 'witness_list', label: 'Witness list (if applicable)' },
      ],
      noneLabel: "Haven't gathered these yet",
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

    const bringAnswer = answers.what_to_bring
    if (bringAnswer && bringAnswer !== 'none') {
      const brought = new Set(bringAnswer.split(','))
      if (brought.size >= 6) {
        items.push({ status: 'done', text: 'Court materials fully prepared.' })
      } else {
        items.push({ status: 'needed', text: `Gather remaining court materials — ${7 - brought.size} item${7 - brought.size > 1 ? 's' : ''} not yet checked off.` })
      }
    } else {
      items.push({ status: 'needed', text: 'Prepare court materials: 3 copies of contract, communications, proof of performance and breach, damages documents, and timeline.' })
    }

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
