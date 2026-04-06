import type { GuidedStepConfig } from '../types'

export const scJpCourtGuideConfig: GuidedStepConfig = {
  title: 'Texas JP Court — What You Need to Know',
  reassurance:
    "JP Court is designed for regular people. It's the most informal court in Texas — and that works in your favor.",

  questions: [
    {
      id: 'know_jp_basics',
      type: 'yes_no',
      prompt: 'Do you know what Justice of the Peace (JP) Court is?',
    },
    {
      id: 'jp_basics_info',
      type: 'info',
      prompt:
        'JP Court handles small claims up to $20,000. It\'s governed by TRCP Rules 500-507. It\'s the most informal court in Texas — no formal discovery is required, evidence rules are relaxed (TRCP 500.3), and hearings are typically 15-30 minutes long.',
      showIf: (answers) => answers.know_jp_basics === 'no',
    },
    {
      id: 'know_timeline',
      type: 'yes_no',
      prompt: 'Do you know how quickly your hearing will be scheduled?',
    },
    {
      id: 'timeline_info',
      type: 'info',
      prompt:
        'Once the defendant is served, your hearing is typically set 10-21 days later. JP Court moves fast compared to other courts.',
      showIf: (answers) => answers.know_timeline === 'no',
    },
    {
      id: 'know_judge_decides',
      type: 'yes_no',
      prompt: 'Do you know who decides your case — a judge or a jury?',
    },
    {
      id: 'judge_decides_info',
      type: 'info',
      prompt:
        'The judge decides your case unless someone requests a jury in writing. Most small claims cases are decided by the judge alone. JP judges are elected and often non-lawyers — they value clear facts and common sense over legal citations.',
      showIf: (answers) => answers.know_judge_decides === 'no',
    },
    {
      id: 'know_evidence_rules',
      type: 'yes_no',
      prompt: 'Do you know how evidence rules work in JP Court?',
    },
    {
      id: 'evidence_rules_info',
      type: 'info',
      prompt:
        'JP Court has relaxed evidence rules under TRCP 500.3. You don\'t need to follow the formal Texas Rules of Evidence. You can present documents, photos, and tell your story in plain language. The judge has wide discretion to consider what\'s relevant.',
      showIf: (answers) => answers.know_evidence_rules === 'no',
    },
    {
      id: 'know_service',
      type: 'yes_no',
      prompt: 'Do you know how the defendant gets notified about your case?',
    },
    {
      id: 'service_info',
      type: 'info',
      prompt:
        'In most counties, a constable serves the defendant with your lawsuit papers. The court typically arranges this for you when you file — you just need to provide the defendant\'s address and pay the service fee.',
      showIf: (answers) => answers.know_service === 'no',
    },
    {
      id: 'claim_under_limit',
      type: 'yes_no',
      prompt: 'Is the amount you\'re claiming $20,000 or less?',
    },
    {
      id: 'over_limit_info',
      type: 'info',
      prompt:
        'JP Court can only handle claims up to $20,000. If your claim exceeds this amount, you\'ll need to file in County Court. You can choose to reduce your claim to $20,000 to stay in JP Court, but you\'ll give up the excess.',
      showIf: (answers) => answers.claim_under_limit === 'no',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.know_jp_basics === 'yes') {
      items.push({ status: 'done', text: 'Understands JP Court basics (TRCP 500-507, $20K limit, relaxed rules).' })
    } else {
      items.push({
        status: 'info',
        text: 'JP Court handles claims up to $20,000 with relaxed evidence rules (TRCP 500.3) and no formal discovery.',
      })
    }

    if (answers.know_timeline === 'yes') {
      items.push({ status: 'done', text: 'Aware of hearing timeline (10-21 days after service).' })
    } else {
      items.push({
        status: 'info',
        text: 'Hearing is typically set 10-21 days after the defendant is served. Hearings last 15-30 minutes.',
      })
    }

    if (answers.know_judge_decides === 'yes') {
      items.push({ status: 'done', text: 'Understands judge-decided format.' })
    } else {
      items.push({
        status: 'info',
        text: 'The judge decides unless a jury is requested in writing. JP judges value clear facts over legal jargon.',
      })
    }

    if (answers.know_evidence_rules === 'yes') {
      items.push({ status: 'done', text: 'Familiar with relaxed JP evidence rules.' })
    } else {
      items.push({
        status: 'info',
        text: 'Evidence rules are relaxed — present documents and tell your story in plain language.',
      })
    }

    if (answers.know_service === 'yes') {
      items.push({ status: 'done', text: 'Understands constable service process.' })
    } else {
      items.push({
        status: 'info',
        text: 'Constable service is required in many counties. The court arranges it — you provide the defendant\'s address.',
      })
    }

    if (answers.claim_under_limit === 'yes') {
      items.push({ status: 'done', text: 'Claim is within the $20,000 JP Court limit.' })
    } else if (answers.claim_under_limit === 'no') {
      items.push({
        status: 'needed',
        text: 'Claim exceeds $20,000. Decide whether to reduce the claim or file in County Court.',
      })
    }

    return items
  },
}
