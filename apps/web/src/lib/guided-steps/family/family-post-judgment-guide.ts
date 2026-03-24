import type { GuidedStepConfig } from '../types'

export const familyPostJudgmentGuideConfig: GuidedStepConfig = {
  title: "After the Court's Decision",
  reassurance:
    'The order is not always the end. Understanding your options helps you protect yourself and your children going forward.',

  questions: [
    {
      id: 'case_outcome',
      type: 'single_choice',
      prompt: 'What was the outcome of your case?',
      options: [
        { value: 'favorable', label: 'Favorable \u2014 I got what I asked for' },
        { value: 'unfavorable', label: 'Unfavorable \u2014 the decision went against me' },
        { value: 'partial', label: 'Partial \u2014 I got some of what I wanted' },
        { value: 'agreed', label: 'Agreed \u2014 we reached a settlement' },
      ],
    },
    {
      id: 'favorable_info',
      type: 'info',
      prompt:
        'FAVORABLE OUTCOME:\n\u2022 Get a certified copy of the final order from the court clerk\n\u2022 Review it carefully to make sure it matches what the judge said in court\n\u2022 If anything is incorrect, file a Motion to Correct Clerical Error promptly\n\u2022 Begin following the order immediately \u2014 custody exchanges, support payments, property transfers\n\u2022 Keep a record of your compliance in case the other party later claims you didn\u2019t follow the order',
      showIf: (answers) => answers.case_outcome === 'favorable',
    },
    {
      id: 'unfavorable_info',
      type: 'info',
      prompt:
        'UNFAVORABLE OUTCOME:\n\u2022 You MUST comply with the court order even if you disagree \u2014 violating it can result in contempt\n\u2022 You have the right to appeal (see below)\n\u2022 You may also be able to file for modification if circumstances change\n\u2022 Consult with an attorney about your options \u2014 many offer free consultations for family law\n\u2022 Do NOT withhold the children or stop paying support as a protest \u2014 this will hurt your position',
      showIf: (answers) => answers.case_outcome === 'unfavorable',
    },
    {
      id: 'partial_info',
      type: 'info',
      prompt:
        'PARTIAL OUTCOME:\n\u2022 Review the order carefully \u2014 understand exactly what was granted and what was denied\n\u2022 Comply fully with all parts of the order\n\u2022 For the parts that went against you, consider whether to appeal or wait and file a modification later\n\u2022 Sometimes a partial result is the best foundation for a future modification once you can show changed circumstances',
      showIf: (answers) => answers.case_outcome === 'partial',
    },
    {
      id: 'agreed_info',
      type: 'info',
      prompt:
        'AGREED/SETTLEMENT OUTCOME:\n\u2022 Your Mediated Settlement Agreement (MSA) or agreed order will be incorporated into the final decree\n\u2022 It is now a court order and is enforceable just like a judge\u2019s ruling\n\u2022 Agreed orders are very difficult to modify or appeal \u2014 courts favor finality of settlements\n\u2022 Keep a copy in a safe place and follow it precisely\n\u2022 If the other party stops following the agreement, you can enforce it through the court',
      showIf: (answers) => answers.case_outcome === 'agreed',
    },
    {
      id: 'enforcement_info',
      type: 'info',
      prompt:
        'ENFORCEMENT: If the other party doesn\u2019t comply with the court order:\n1. File a "Motion for Enforcement" or "Motion for Contempt"\n2. The court can hold them in contempt (jail up to 6 months for willful violations)\n3. For unpaid child support: file an income withholding order with their employer\n4. Texas Attorney General\u2019s office helps enforce support: 1-800-252-8014\n5. For custody violations: document every instance with dates, times, and any witnesses\n6. Keep all communication (texts, emails) as evidence',
    },
    {
      id: 'considering_appeal',
      type: 'yes_no',
      prompt: 'Are you considering an appeal?',
      showIf: (answers) =>
        answers.case_outcome === 'unfavorable' || answers.case_outcome === 'partial',
    },
    {
      id: 'appeal_info',
      type: 'info',
      prompt:
        'APPEAL INFORMATION:\n\u2022 You have 30 days to file a Notice of Appeal from the date the final order is signed\n\u2022 Appeals in family cases are reviewed for "abuse of discretion" \u2014 meaning the trial judge made a clearly wrong decision\n\u2022 This is a high bar: the appeals court gives significant deference to the trial judge, especially on credibility calls\n\u2022 You must comply with the trial court\u2019s order during the appeal unless you get a stay\n\u2022 Appeals are expensive and slow (6\u201318 months) \u2014 consider whether modification might be a better path\n\u2022 You will likely need an attorney for an appeal',
      showIf: (answers) =>
        answers.considering_appeal === 'yes' &&
        (answers.case_outcome === 'unfavorable' || answers.case_outcome === 'partial'),
    },
    {
      id: 'modification_info',
      type: 'info',
      prompt:
        'MODIFICATION:\nLife changes. If circumstances change materially (new job, relocation, child\u2019s needs), you can file to modify custody, support, or visitation.\n\n\u2022 Wait at least 1 year unless the child\u2019s safety is at risk\n\u2022 You must prove a "material and substantial change in circumstances"\n\u2022 Examples: significant income change, relocation, remarriage, child\u2019s changing needs, substance abuse issues\n\u2022 File in the court that issued the original order\n\u2022 The standard is always: best interest of the child',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.case_outcome) {
      const outcomeLabels: Record<string, string> = {
        favorable: 'Favorable outcome',
        unfavorable: 'Unfavorable outcome',
        partial: 'Partial outcome',
        agreed: 'Agreed/settlement outcome',
      }
      items.push({
        status: answers.case_outcome === 'favorable' || answers.case_outcome === 'agreed' ? 'done' : 'info',
        text: `Outcome: ${outcomeLabels[answers.case_outcome] ?? answers.case_outcome}`,
      })
    } else {
      items.push({ status: 'needed', text: 'Record the outcome of your case.' })
    }

    if (answers.case_outcome === 'favorable') {
      items.push({
        status: 'needed',
        text: 'Get a certified copy of the final order and review it for accuracy.',
      })
    }

    if (answers.case_outcome === 'unfavorable') {
      items.push({
        status: 'info',
        text: 'You must comply with the order even while considering appeal or modification.',
      })
    }

    items.push({
      status: 'info',
      text: 'If the other party violates the order: file a Motion for Enforcement or Motion for Contempt. For child support, call the TX AG at 1-800-252-8014.',
    })

    if (answers.considering_appeal === 'yes') {
      items.push({
        status: 'needed',
        text: 'File a Notice of Appeal within 30 days of the final order. Appeals are reviewed for "abuse of discretion."',
      })
    }

    items.push({
      status: 'info',
      text: 'Modification is available if circumstances change materially. Wait at least 1 year unless the child\u2019s safety is at risk.',
    })

    return items
  },
}
