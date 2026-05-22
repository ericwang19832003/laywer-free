export interface EvalCase {
  id: string
  category: 'deadline_urgency' | 'evidence_strength' | 'legal_research' | 'document_drafting'
  question: string
  rubric: string
  passMark: number // minimum score out of 2 to pass
}

export const EVAL_DATASET: EvalCase[] = [
  // --- DEADLINE URGENCY (5 cases) ---
  {
    id: 'du-01',
    category: 'deadline_urgency',
    question: 'Am I behind on anything?',
    rubric: 'Score 2 if response identifies overdue items specifically. Score 1 if it mentions deadlines exist but is vague. Score 0 if it does not address timing at all.',
    passMark: 1,
  },
  {
    id: 'du-02',
    category: 'deadline_urgency',
    question: 'What should I do today to stay on track with my case?',
    rubric: 'Score 2 if response gives specific, prioritized actions tied to deadlines. Score 1 if it gives generic advice. Score 0 if it gives no actionable guidance.',
    passMark: 1,
  },
  {
    id: 'du-03',
    category: 'deadline_urgency',
    question: 'How many days do I have left to serve the defendant?',
    rubric: 'Score 2 if response checks deadlines and gives a specific answer about the serve deadline. Score 1 if it analyzes deadlines but is unclear. Score 0 if it does not use the analyze_deadlines tool.',
    passMark: 1,
  },
  {
    id: 'du-04',
    category: 'deadline_urgency',
    question: 'Are any of my deadlines coming up soon?',
    rubric: 'Score 2 if response identifies urgent deadlines (within 7 days) by name. Score 1 if it mentions urgency without specifics. Score 0 if it ignores deadlines.',
    passMark: 1,
  },
  {
    id: 'du-05',
    category: 'deadline_urgency',
    question: 'What happens if I miss a filing deadline?',
    rubric: 'Score 2 if response explains consequences AND checks current deadline status. Score 1 if it explains consequences but ignores current case state. Score 0 if completely off-topic.',
    passMark: 1,
  },

  // --- EVIDENCE STRENGTH (5 cases) ---
  {
    id: 'es-01',
    category: 'evidence_strength',
    question: 'Do I have enough evidence to win my case?',
    rubric: 'Score 2 if response gives a strength assessment (thin/moderate/strong) AND identifies specific gaps. Score 1 if it gives generic evidence advice without assessing the actual count. Score 0 if it does not use the review_evidence tool.',
    passMark: 1,
  },
  {
    id: 'es-02',
    category: 'evidence_strength',
    question: 'What documents should I gather for my landlord-tenant case?',
    rubric: 'Score 2 if response lists dispute-specific documents (lease, photos, receipts, etc.). Score 1 if it gives generic document advice. Score 0 if it gives no specific guidance.',
    passMark: 1,
  },
  {
    id: 'es-03',
    category: 'evidence_strength',
    question: 'How strong is my case right now?',
    rubric: 'Score 2 if response uses the evidence tool and gives a clear strength label with reasoning. Score 1 if it gives a vague answer. Score 0 if it makes up an answer without checking evidence.',
    passMark: 1,
  },
  {
    id: 'es-04',
    category: 'evidence_strength',
    question: 'What evidence am I missing?',
    rubric: 'Score 2 if response identifies specific missing evidence types for landlord-tenant cases. Score 1 if it gives general advice. Score 0 if it does not engage with the evidence question.',
    passMark: 1,
  },
  {
    id: 'es-05',
    category: 'evidence_strength',
    question: 'Should I take more photos before my hearing?',
    rubric: 'Score 2 if it reviews evidence, assesses current state, and gives specific photo advice. Score 1 if it gives generic photo advice. Score 0 if it ignores the evidence context.',
    passMark: 1,
  },

  // --- LEGAL RESEARCH (5 cases) ---
  {
    id: 'lr-01',
    category: 'legal_research',
    question: 'What does Texas law say about security deposit returns?',
    rubric: 'Score 2 if response includes a specific citation AND explains the rule (30-day return window, etc.). Score 1 if it explains the rule without a citation. Score 0 if it gives no legal information.',
    passMark: 1,
  },
  {
    id: 'lr-02',
    category: 'legal_research',
    question: 'What is the notice to vacate requirement in Texas?',
    rubric: 'Score 2 if response cites Texas Property Code or case law AND explains the notice requirement. Score 1 if it explains the rule without citation. Score 0 if it does not answer.',
    passMark: 1,
  },
  {
    id: 'lr-03',
    category: 'legal_research',
    question: 'Can my landlord keep my deposit for normal wear and tear?',
    rubric: 'Score 2 if response cites Texas law and clearly explains normal wear and tear standard. Score 1 if it explains the concept without legal grounding. Score 0 if incorrect or no answer.',
    passMark: 1,
  },
  {
    id: 'lr-04',
    category: 'legal_research',
    question: 'What are my rights if my landlord has not made repairs?',
    rubric: 'Score 2 if response cites Texas habitability law and explains repair-and-deduct or rent withholding rights. Score 1 if general advice only. Score 0 if no relevant legal information.',
    passMark: 1,
  },
  {
    id: 'lr-05',
    category: 'legal_research',
    question: 'Is there a case where a tenant won against a landlord for keeping the deposit?',
    rubric: 'Score 2 if response uses search_case_law and returns a relevant case with citation. Score 1 if it describes cases generally without citation. Score 0 if it makes up a citation.',
    passMark: 1,
  },

  // --- DOCUMENT DRAFTING (5 cases) ---
  {
    id: 'dd-01',
    category: 'document_drafting',
    question: 'Draft a demand letter asking my landlord to return my $800 security deposit.',
    rubric: 'Score 2 if the draft has a proper heading, states the legal basis, demands a specific amount, and has a signature line. Score 1 if it is a recognizable letter but missing key elements. Score 0 if not a letter.',
    passMark: 1,
  },
  {
    id: 'dd-02',
    category: 'document_drafting',
    question: 'Write a notice to my landlord about a leaking roof that has not been repaired.',
    rubric: 'Score 2 if it is a formal notice with date, specific repair description, deadline for repair, and legal reference. Score 1 if it is an informal request. Score 0 if it is not a written notice.',
    passMark: 1,
  },
  {
    id: 'dd-03',
    category: 'document_drafting',
    question: 'Help me draft a motion to compel my landlord to respond to discovery.',
    rubric: 'Score 2 if the draft has proper motion format (caption, introduction, legal standard, argument, relief requested). Score 1 if it is partially formatted. Score 0 if it is not a motion.',
    passMark: 1,
  },
  {
    id: 'dd-04',
    category: 'document_drafting',
    question: 'Can you write interrogatories for my landlord about the deposit deductions?',
    rubric: 'Score 2 if the draft contains numbered interrogatory questions specifically about deposit deductions. Score 1 if it provides generic interrogatory examples. Score 0 if no questions are provided.',
    passMark: 1,
  },
  {
    id: 'dd-05',
    category: 'document_drafting',
    question: "Draft a response to the landlord's answer claiming I damaged the apartment.",
    rubric: 'Score 2 if the response is formatted as a legal document addressing specific claims with denials/admissions. Score 1 if it is a general rebuttal. Score 0 if not a legal document format.',
    passMark: 1,
  },
]
