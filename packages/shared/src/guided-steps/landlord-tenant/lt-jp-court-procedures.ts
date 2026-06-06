import type { GuidedStepConfig } from '../types'

export const ltJpCourtProceduresConfig: GuidedStepConfig = {
  title: 'JP Court Eviction Procedures',
  reassurance:
    'Most landlord-tenant cases go through JP Court — it\'s simpler, faster, and designed for everyday people.',

  questions: [
    {
      id: 'eviction_timeline_info',
      type: 'info',
      prompt:
        'JP COURT EVICTION TIMELINE (TRCP Rule 510):\n- Landlord files eviction suit → Citation issued\n- You receive citation → Hearing set 10-21 days out\n- You MUST appear at hearing (or lose by default)\n- Trial usually lasts 15-30 minutes\n- Judge rules immediately or within a few days\n- If you lose: 5 days to appeal (NOT 30 like other cases)',
      acknowledgeLabel: 'I understand the JP Court timeline and that I must appear at the hearing or lose by default',
    },
    {
      id: 'received_citation',
      type: 'yes_no',
      prompt: 'Have you received a court citation?',
      helpText:
        'A citation is the official court document telling you about the eviction lawsuit and your hearing date.',
    },
    {
      id: 'citation_timing_warning',
      type: 'info',
      prompt:
        'CHECK YOUR HEARING DATE. Count the days from today. If less than 10 days, the citation may be defective (TRCP 510.4 requires at least 10 days\' notice).',
      helpText:
        'A defective citation can be grounds for dismissal or continuance. Bring this up to the judge.',
      acknowledgeLabel: "I understand — I'll count the days and raise a defective-citation objection if I have less than 10 days' notice",
      showIf: (answers) => answers.received_citation === 'yes',
    },
    {
      id: 'rights_in_jp_court',
      type: 'info',
      prompt:
        'YOUR RIGHTS IN JP COURT:\n- Right to a jury trial (must request IN WRITING before hearing day)\n- Right to file a written answer (recommended but not required in JP)\n- Right to bring evidence and witnesses\n- Right to cross-examine the landlord\'s witnesses\n- Right to appeal to County Court within 5 days',
      acknowledgeLabel: 'I understand my rights — including that a jury trial request must be in writing before the hearing',
    },
    {
      id: 'jp_court_informal',
      type: 'info',
      prompt:
        'JP COURT IS INFORMAL:\n- No formal rules of evidence (judge is flexible)\n- You can speak in normal language\n- Bring your lease, rent receipts, photos, repair requests\n- Dress respectfully but you don\'t need a suit\n- Address the judge as \'Judge [Last Name]\' or \'Your Honor\'',
      acknowledgeLabel: "I understand — I'll bring my documents, dress respectfully, and address the judge properly",
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.received_citation === 'yes') {
      items.push({
        status: 'needed',
        text: 'Check your hearing date — if less than 10 days from when you received the citation, it may be defective.',
      })
      items.push({
        status: 'needed',
        text: 'If you want a jury trial, request it IN WRITING before your hearing day.',
      })
    } else if (answers.received_citation === 'no') {
      items.push({
        status: 'info',
        text: 'You have not yet received a citation. Watch for one — it will be served in person or posted on your door.',
      })
    }

    items.push({
      status: 'info',
      text: 'You MUST appear at the hearing or you will lose by default.',
    })
    items.push({
      status: 'info',
      text: 'Bring your lease, rent receipts, photos, and repair requests to court.',
    })
    items.push({
      status: 'info',
      text: 'If you lose, you have only 5 days to file an appeal — not 30.',
    })

    return items
  },
}
