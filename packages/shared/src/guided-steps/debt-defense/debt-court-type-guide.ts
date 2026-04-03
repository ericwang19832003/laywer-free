import type { GuidedStepConfig } from '../types'

export const debtCourtTypeGuideConfig: GuidedStepConfig = {
  title: 'Understanding Your Court',
  reassurance:
    'Different courts have different rules, deadlines, and procedures. Knowing which court your case is in helps you prepare the right way — so nothing catches you off guard.',

  questions: [
    {
      id: 'court_type',
      type: 'single_choice',
      prompt: 'Which court is your case in?',
      helpText:
        'Check the top of the petition or citation you received — the court name and number will be listed there.',
      options: [
        {
          value: 'justice_court',
          label: 'Justice of the Peace (JP) Court — claims up to $20,000',
        },
        {
          value: 'county_court',
          label: 'County Court at Law — $200.01 to $250,000',
        },
        {
          value: 'district_court',
          label: 'District Court — over $250,000',
        },
        { value: 'not_sure', label: "I'm not sure" },
      ],
    },
    {
      id: 'not_sure_info',
      type: 'info',
      prompt:
        'Check the petition or citation you received — the court name and case number are printed at the top of the first page. Justice of the Peace (JP) courts handle most consumer debt cases. Look for "Justice Court," "JP Court," "County Court at Law," or "District Court" in the header.',
      showIf: (answers) => answers.court_type === 'not_sure',
    },
    {
      id: 'justice_court_info',
      type: 'info',
      prompt:
        'JP COURT RULES:\n\n• Answer deadline: 14 days from service (NOT the 20-days-plus-first-Monday rule used by other courts)\n• Rules: Texas Rules of Civil Procedure Part V (Rules 500–510) — simpler than higher courts\n• Discovery: Limited — each side gets 15 written discovery requests total (Rule 500.9)\n• No jury by default (you must request one and pay the jury fee)\n• Hearings are informal — judges often allow narrative testimony\n• Appeal: 21 days to file an appeal bond for a de novo trial in county court (a whole new trial)\n• Filing fee for answer: typically $0–$50',
      showIf: (answers) => answers.court_type === 'justice_court',
    },
    {
      id: 'county_court_info',
      type: 'info',
      prompt:
        'COUNTY COURT RULES:\n\n• Answer deadline: 10:00 AM on the first Monday after 20 days from service\n• Full Texas Rules of Civil Procedure apply\n• Full discovery available (interrogatories, requests for production, requests for admissions, depositions)\n• Jury trial available (must request in writing and pay the jury fee)\n• Appeal: 30 days to file notice of appeal (appellate review of the record, not a new trial)\n• More formal procedures than JP court',
      showIf: (answers) => answers.court_type === 'county_court',
    },
    {
      id: 'district_court_info',
      type: 'info',
      prompt:
        'DISTRICT COURT RULES:\n\n• Same procedural rules as county court, but handles the largest cases\n• Answer deadline: 10:00 AM on the first Monday after 20 days from service\n• Full Texas Rules of Civil Procedure apply\n• Full discovery available (interrogatories, requests for production, requests for admissions, depositions)\n• Jury trial available (must request in writing and pay the jury fee)\n• Appeal: 30 days to file notice of appeal to the court of appeals\n• Consumer debt cases in district court are unusual — if your debt is under $250,000, check whether venue is correct (it may be grounds for a transfer)',
      showIf: (answers) => answers.court_type === 'district_court',
    },
    {
      id: 'deadline_warning',
      type: 'info',
      prompt:
        'IMPORTANT DEADLINES: Regardless of which court your case is in, if you miss the answer deadline, the plaintiff can request a DEFAULT JUDGMENT against you. A default judgment means you lose automatically without being heard. If you have already missed your deadline, go to your "Set Aside Default Judgment" task immediately.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    const courtLabels: Record<string, string> = {
      justice_court: 'Justice of the Peace (JP) Court',
      county_court: 'County Court at Law',
      district_court: 'District Court',
      not_sure: 'Unknown (needs identification)',
    }

    const courtLabel = courtLabels[answers.court_type] || 'Unknown'
    items.push({ status: 'done', text: `Court type: ${courtLabel}.` })

    if (answers.court_type === 'not_sure') {
      items.push({
        status: 'needed',
        text: 'Review the petition or citation you received to identify your court. The court name and number are at the top of the first page.',
      })
    }

    if (answers.court_type === 'justice_court') {
      items.push({
        status: 'info',
        text: 'Your answer deadline is 14 days from service. JP court uses simplified rules (TRCP 500–510) with limited discovery (15 requests per side).',
      })
    }

    if (answers.court_type === 'county_court') {
      items.push({
        status: 'info',
        text: 'Your answer deadline is 10:00 AM on the first Monday after 20 days from service. Full Texas Rules of Civil Procedure apply with full discovery rights.',
      })
    }

    if (answers.court_type === 'district_court') {
      items.push({
        status: 'info',
        text: 'Your answer deadline is 10:00 AM on the first Monday after 20 days from service. Full TRCP applies. Consumer debt in district court is uncommon — verify venue is correct.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Mark your answer deadline on a calendar. Missing it allows the plaintiff to take a default judgment against you.',
    })

    return items
  },
}
