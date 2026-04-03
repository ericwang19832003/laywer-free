import type { GuidedStepConfig } from '../types'

export const debtAppealProcessConfig: GuidedStepConfig = {
  title: 'How to Appeal',
  reassurance:
    'Losing at trial is not the end. Texas law gives you the right to appeal, and many people successfully overturn or improve their outcome on appeal. Let\'s figure out your best path forward.',

  questions: [
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'Which court was your case in?',
      options: [
        { value: 'justice_court', label: 'JP Court' },
        { value: 'county_court', label: 'County Court at Law' },
        { value: 'district_court', label: 'District Court' },
      ],
    },
    {
      id: 'jp_appeal_info',
      type: 'info',
      prompt:
        'JP COURT APPEAL — DE NOVO TRIAL:\n\n• Deadline: 21 days from judgment to file appeal bond\n• Cost: Appeal bond typically equals judgment amount (or file Statement of Inability to Pay)\n• Effect: You get a COMPLETELY NEW TRIAL in County Court at Law — not a review, a fresh start\n• The county court hears everything again as if the JP trial never happened\n• You can present new evidence, new witnesses, new arguments\n• File at the JP court that issued the judgment\n\nThis is often worth pursuing — you get a second chance with a more formal process.',
      showIf: (answers) => answers.court_type === 'justice_court',
    },
    {
      id: 'appellate_review_info',
      type: 'info',
      prompt:
        'COUNTY/DISTRICT COURT APPEAL — APPELLATE REVIEW:\n\n• Deadline: 30 days from judgment to file Notice of Appeal\n• Cost: Filing fee + possible supersedeas bond to stay collection during appeal\n• Effect: Court of Appeals reviews the RECORD — no new evidence, no new witnesses\n• Standard: Was the trial court\'s decision legally wrong? (abuse of discretion / legal error)\n• This is a harder path — the appeals court defers to the trial judge on factual findings\n\nConsider carefully — appeals are expensive and slow (6–18 months).',
      showIf: (answers) =>
        answers.court_type === 'county_court' ||
        answers.court_type === 'district_court',
    },
    {
      id: 'missed_deadline',
      type: 'yes_no',
      prompt: 'Has the appeal deadline already passed?',
    },
    {
      id: 'missed_deadline_info',
      type: 'info',
      prompt:
        'If the appeal deadline has passed, you may still be able to file a Motion for New Trial (14 days in JP court, 30 days in county/district). Grounds include: new evidence discovered, fraud/misconduct by the other party, the judgment is clearly wrong. After that window closes, a Bill of Review is possible but very difficult (requires showing fraud, accident, or wrongful act).',
      showIf: (answers) => answers.missed_deadline === 'yes',
    },
    {
      id: 'can_afford_bond',
      type: 'yes_no',
      prompt: 'Can you afford the appeal bond?',
      showIf: (answers) => answers.court_type === 'justice_court',
    },
    {
      id: 'cant_afford_bond_info',
      type: 'info',
      prompt:
        'If you cannot afford the bond, file a "Statement of Inability to Afford Payment of Court Costs" (formerly affidavit of indigence). The court must allow your appeal without bond if you qualify. Keep in mind that during the appeal, the judgment may still be enforceable unless you obtain a stay.',
      showIf: (answers) =>
        answers.court_type === 'justice_court' &&
        answers.can_afford_bond === 'no',
    },
    {
      id: 'while_appealing_info',
      type: 'info',
      prompt:
        'WHILE APPEALING — The judgment remains enforceable unless you post a supersedeas bond or obtain a stay. Claim your property exemptions immediately if collection is attempted.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.court_type === 'justice_court') {
      items.push({
        status: 'info',
        text: 'Your JP court case qualifies for a de novo trial in County Court at Law — a completely fresh start.',
      })
    } else if (answers.court_type === 'county_court') {
      items.push({
        status: 'info',
        text: 'Your county court case would go to the Court of Appeals for an appellate review of the record.',
      })
    } else if (answers.court_type === 'district_court') {
      items.push({
        status: 'info',
        text: 'Your district court case would go to the Court of Appeals for an appellate review of the record.',
      })
    }

    if (answers.missed_deadline === 'yes') {
      items.push({
        status: 'needed',
        text: 'The appeal deadline has passed. Explore filing a Motion for New Trial or Bill of Review immediately.',
      })
    } else {
      items.push({
        status: 'needed',
        text:
          answers.court_type === 'justice_court'
            ? 'File your appeal bond (or Statement of Inability to Pay) within 21 days of the judgment.'
            : 'File your Notice of Appeal within 30 days of the judgment.',
      })
    }

    if (
      answers.court_type === 'justice_court' &&
      answers.can_afford_bond === 'no'
    ) {
      items.push({
        status: 'needed',
        text: 'File a Statement of Inability to Afford Payment of Court Costs to proceed without bond.',
      })
    } else if (
      answers.court_type === 'justice_court' &&
      answers.can_afford_bond === 'yes'
    ) {
      items.push({
        status: 'needed',
        text: 'Prepare the appeal bond (typically equals the judgment amount) and file it at the JP court.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Claim your property exemptions immediately to protect assets during the appeal process.',
    })

    return items
  },
}
