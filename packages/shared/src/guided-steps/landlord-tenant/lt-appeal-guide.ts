import type { GuidedStepConfig } from '../types'

export const ltAppealGuideConfig: GuidedStepConfig = {
  title: 'Appealing an Eviction Judgment',
  reassurance:
    'Losing in JP Court is NOT the end. An appeal gives you a completely new trial in County Court.',

  questions: [
    {
      id: 'appeal_timeline_info',
      type: 'info',
      prompt:
        'EVICTION APPEAL TIMELINE:\n- You have ONLY 5 DAYS to file your appeal (not 30 like civil cases)\n- The 5 days start from the day the judgment is SIGNED\n- File at the JP Court clerk\'s office\n- Cost: Filing fee + appeal bond (usually one month\'s rent)\n- If you can\'t afford the bond: file an Affidavit of Inability to Pay',
    },
    {
      id: 'can_afford_bond',
      type: 'yes_no',
      prompt: 'Can you afford the appeal bond (usually one month\'s rent)?',
      helpText:
        'The appeal bond is required to proceed with the appeal, but there are alternatives if you cannot afford it.',
    },
    {
      id: 'inability_to_pay_info',
      type: 'info',
      prompt:
        'If you cannot afford the appeal bond, file an "Affidavit of Inability to Pay" (also called a pauper\'s affidavit). This sworn statement tells the court you cannot afford the costs. The court must hold a hearing within 5 days. If granted, you can appeal without paying the bond. You can get the form from the JP Court clerk or texaslawhelp.org.',
      helpText:
        'Be honest on the affidavit — list your income, expenses, and assets. The court will evaluate whether you genuinely cannot afford the bond.',
      showIf: (answers) => answers.can_afford_bond === 'no',
    },
    {
      id: 'trial_de_novo_info',
      type: 'info',
      prompt:
        'WHAT HAPPENS ON APPEAL:\n- Your case goes to County Court at Law\n- You get a COMPLETELY NEW TRIAL (called \'trial de novo\')\n- Everything starts fresh — new evidence, new testimony\n- The JP Court judgment is erased\n- This is your second chance to present your case\n- You can request a jury trial in County Court',
    },
    {
      id: 'during_appeal_info',
      type: 'info',
      prompt:
        'DURING THE APPEAL:\n- The eviction is STAYED (paused) while the appeal is pending\n- You cannot be physically removed during the appeal period\n- BUT: You may be required to pay rent into the court registry\n- If you don\'t pay rent into the registry, you can lose the appeal',
    },
    {
      id: 'how_to_file_info',
      type: 'info',
      prompt:
        'HOW TO FILE:\n1. Go to the JP Court clerk within 5 days of judgment\n2. File a \'Notice of Appeal\'\n3. Pay the filing fee or file inability-to-pay\n4. Post the appeal bond (one month\'s rent) or file inability-to-pay\n5. The clerk transfers your case to County Court\n6. You\'ll receive a new hearing date (usually 2-4 weeks)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    items.push({
      status: 'needed',
      text: 'File your Notice of Appeal at the JP Court clerk within 5 DAYS of the judgment.',
    })

    if (answers.can_afford_bond === 'yes') {
      items.push({
        status: 'needed',
        text: 'Post the appeal bond (one month\'s rent) when you file.',
      })
    } else if (answers.can_afford_bond === 'no') {
      items.push({
        status: 'needed',
        text: 'File an Affidavit of Inability to Pay instead of the appeal bond.',
      })
    }

    items.push({
      status: 'info',
      text: 'The eviction is paused while the appeal is pending, but you may need to pay rent into the court registry.',
    })
    items.push({
      status: 'info',
      text: 'You will get a completely new trial (trial de novo) in County Court — prepare new evidence and testimony.',
    })

    return items
  },
}
