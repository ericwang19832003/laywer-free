import type { GuidedStepConfig } from '../types'

export const scCourtroomGuideConfig: GuidedStepConfig = {
  title: 'What to Expect at Your Small Claims Hearing',
  reassurance:
    "JP Court hearings are short, informal, and designed for people without lawyers. You'll do better than you think.",

  questions: [
    {
      id: 'know_arrival',
      type: 'yes_no',
      prompt: 'Do you know when to arrive and what to do at the courthouse?',
    },
    {
      id: 'arrival_info',
      type: 'info',
      prompt:
        'Arrive 15-30 minutes early. Check in with the clerk when you arrive — they\'ll tell you where to sit and when your case will be called. Bring all your evidence and any witnesses.',
      showIf: (answers) => answers.know_arrival === 'no',
    },
    {
      id: 'know_hearing_flow',
      type: 'yes_no',
      prompt: 'Do you know how the hearing will proceed?',
    },
    {
      id: 'hearing_flow_info',
      type: 'info',
      prompt:
        'When your case is called, the plaintiff presents first. Tell your story simply and clearly — explain what happened, what you\'re owed, and show your evidence. Then the defendant responds. The judge may ask questions to both sides. The judge usually decides right there — the whole hearing takes 15-30 minutes.',
      showIf: (answers) => answers.know_hearing_flow === 'no',
    },
    {
      id: 'claim_type',
      type: 'single_choice',
      prompt: 'What type of claim are you bringing?',
      options: [
        { value: 'security_deposit', label: 'Security deposit' },
        { value: 'breach_of_contract', label: 'Breach of contract' },
        { value: 'car_accident', label: 'Car accident / property damage' },
        { value: 'unpaid_debt', label: 'Unpaid loan or debt' },
        { value: 'consumer', label: 'Consumer dispute / refund' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'security_deposit_script',
      type: 'info',
      prompt:
        'Sample testimony: "Your Honor, I rented from the defendant at [address]. I moved out on [date] and provided my forwarding address in writing. My deposit was $[amount]. It has been over 30 days and I have not received my deposit or an itemized list of deductions. Here is my lease, move-out photos, and the forwarding address letter."',
      showIf: (answers) => answers.claim_type === 'security_deposit',
    },
    {
      id: 'breach_of_contract_script',
      type: 'info',
      prompt:
        'Sample testimony: "Your Honor, I paid $[amount] to the defendant for [service/goods]. The defendant didn\'t deliver what was promised. Here is the contract showing what was agreed, my proof of payment, and communications showing I tried to resolve this."',
      showIf: (answers) => answers.claim_type === 'breach_of_contract',
    },
    {
      id: 'car_accident_script',
      type: 'info',
      prompt:
        'Sample testimony: "Your Honor, on [date], the defendant hit my car at [location]. Here is the police report showing the defendant was at fault, photos of the damage, and my repair estimate for $[amount]."',
      showIf: (answers) => answers.claim_type === 'car_accident',
    },
    {
      id: 'unpaid_debt_script',
      type: 'info',
      prompt:
        'Sample testimony: "Your Honor, I loaned $[amount] to the defendant on [date]. Here is the promissory note [or text messages/emails] showing the agreement to repay. The defendant has not repaid despite my requests. Here are my records showing the outstanding balance."',
      showIf: (answers) => answers.claim_type === 'unpaid_debt',
    },
    {
      id: 'consumer_script',
      type: 'info',
      prompt:
        'Sample testimony: "Your Honor, I purchased [product/service] from the defendant for $[amount] on [date]. The product was defective [or the service was not provided as described]. I requested a refund and was refused. Here is my receipt, the product listing, and our communications."',
      showIf: (answers) => answers.claim_type === 'consumer',
    },
    {
      id: 'know_what_not_to_say',
      type: 'yes_no',
      prompt: 'Do you know what to avoid saying in court?',
    },
    {
      id: 'what_not_to_say_info',
      type: 'info',
      prompt:
        'What NOT to say: Don\'t argue with the judge or the other side. Don\'t interrupt — wait your turn. Don\'t exaggerate your damages. Don\'t bring up irrelevant personal grievances. Don\'t say "I feel like" — state facts. Don\'t reference legal cases or statutes unless you truly understand them. Stick to: what happened, what you\'re owed, and your evidence.',
      showIf: (answers) => answers.know_what_not_to_say === 'no',
    },
    {
      id: 'know_dress_code',
      type: 'yes_no',
      prompt: 'Do you know how to dress for court?',
    },
    {
      id: 'dress_code_info',
      type: 'info',
      prompt:
        'Dress respectfully — business casual is fine. No suit required, but avoid shorts, flip-flops, or clothing with offensive language. Address the judge as "Judge [Last Name]" or "Your Honor."',
      showIf: (answers) => answers.know_dress_code === 'no',
    },
    {
      id: 'evidence_ready',
      type: 'yes_no',
      prompt: 'Do you have your evidence organized and ready to present?',
    },
    {
      id: 'evidence_ready_info',
      type: 'info',
      prompt:
        'Organize your evidence in the order you\'ll present it. Have 3 copies of everything: one for you, one for the judge, and one for the other side. When it\'s your turn, hand the judge the document and explain what it shows.',
      showIf: (answers) => answers.evidence_ready === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_arrival === 'yes') {
      items.push({ status: 'done', text: 'Knows to arrive 15-30 min early and check in with clerk.' })
    } else {
      items.push({
        status: 'info',
        text: 'Arrive 15-30 minutes early. Check in with the clerk. Bring all evidence and witnesses.',
      })
    }

    if (answers.know_hearing_flow === 'yes') {
      items.push({ status: 'done', text: 'Understands hearing flow: plaintiff first, then defendant, judge decides.' })
    } else {
      items.push({
        status: 'info',
        text: 'Plaintiff presents first, defendant responds, judge may ask questions, then decides (usually immediately).',
      })
    }

    if (answers.claim_type) {
      const labels: Record<string, string> = {
        security_deposit: 'security deposit',
        breach_of_contract: 'breach of contract',
        car_accident: 'car accident / property damage',
        unpaid_debt: 'unpaid loan or debt',
        consumer: 'consumer dispute / refund',
        other: 'other',
      }
      items.push({
        status: 'info',
        text: `Claim type: ${labels[answers.claim_type]}. Practice your testimony aloud before the hearing.`,
      })
    }

    if (answers.know_what_not_to_say === 'yes') {
      items.push({ status: 'done', text: 'Aware of courtroom dos and don\'ts.' })
    } else {
      items.push({
        status: 'info',
        text: 'Don\'t argue, interrupt, or exaggerate. State facts. Let your evidence speak.',
      })
    }

    if (answers.know_dress_code === 'yes') {
      items.push({ status: 'done', text: 'Knows courtroom dress expectations.' })
    } else {
      items.push({
        status: 'info',
        text: 'Dress business casual. Address judge as "Judge [Name]" or "Your Honor."',
      })
    }

    if (answers.evidence_ready === 'yes') {
      items.push({ status: 'done', text: 'Evidence organized and ready to present.' })
    } else {
      items.push({
        status: 'needed',
        text: 'Organize evidence in presentation order. Prepare 3 copies of everything.',
      })
    }

    return items
  },
}
