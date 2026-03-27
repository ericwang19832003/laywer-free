export interface AssessmentQuestion {
  id: string
  prompt: string
  type: 'single_choice' | 'text' | 'date'
  options?: { value: string; label: string }[]
}

export const ASSESSMENT_QUESTIONS: Record<string, AssessmentQuestion[]> = {
  small_claims: [
    { id: 'what_happened', prompt: 'What is your claim about?', type: 'single_choice', options: [
      { value: 'unpaid_debt', label: 'Someone owes me money' },
      { value: 'property_damage', label: 'Property was damaged' },
      { value: 'bad_service', label: 'Paid for service not delivered' },
      { value: 'security_deposit', label: 'Landlord won\'t return deposit' },
      { value: 'other', label: 'Something else' },
    ]},
    { id: 'amount', prompt: 'How much money is involved?', type: 'single_choice', options: [
      { value: 'under_1000', label: 'Under $1,000' },
      { value: '1000_5000', label: '$1,000 - $5,000' },
      { value: '5000_10000', label: '$5,000 - $10,000' },
      { value: '10000_20000', label: '$10,000 - $20,000' },
      { value: 'over_20000', label: 'Over $20,000' },
    ]},
    { id: 'when', prompt: 'When did this happen?', type: 'single_choice', options: [
      { value: 'last_month', label: 'Within the last month' },
      { value: 'last_6months', label: '1-6 months ago' },
      { value: 'last_year', label: '6-12 months ago' },
      { value: '1_2_years', label: '1-2 years ago' },
      { value: 'over_2_years', label: 'Over 2 years ago' },
    ]},
    { id: 'evidence', prompt: 'What evidence do you have?', type: 'single_choice', options: [
      { value: 'strong', label: 'Written contract, receipts, or photos' },
      { value: 'some', label: 'Text messages or emails' },
      { value: 'witnesses', label: 'Witnesses only' },
      { value: 'none', label: 'No documentation' },
    ]},
    { id: 'state', prompt: 'What state are you in?', type: 'single_choice', options: [
      { value: 'TX', label: 'Texas' },
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      { value: 'FL', label: 'Florida' },
      { value: 'other', label: 'Other state' },
    ]},
  ],
  personal_injury: [
    { id: 'injury_type', prompt: 'What type of injury?', type: 'single_choice', options: [
      { value: 'car_accident', label: 'Car accident' },
      { value: 'slip_fall', label: 'Slip and fall' },
      { value: 'medical', label: 'Medical malpractice' },
      { value: 'work', label: 'Workplace injury' },
      { value: 'other', label: 'Other' },
    ]},
    { id: 'when', prompt: 'When did the injury occur?', type: 'single_choice', options: [
      { value: 'last_month', label: 'Within the last month' },
      { value: 'last_6months', label: '1-6 months ago' },
      { value: 'last_year', label: '6-12 months ago' },
      { value: '1_2_years', label: '1-2 years ago' },
      { value: 'over_2_years', label: 'Over 2 years ago' },
    ]},
    { id: 'treatment', prompt: 'Have you received medical treatment?', type: 'single_choice', options: [
      { value: 'yes_ongoing', label: 'Yes, treatment is ongoing' },
      { value: 'yes_completed', label: 'Yes, treatment is complete' },
      { value: 'no', label: 'No treatment yet' },
    ]},
    { id: 'fault', prompt: 'Who was at fault?', type: 'single_choice', options: [
      { value: 'other_party', label: 'The other party' },
      { value: 'shared', label: 'Shared fault' },
      { value: 'unsure', label: 'Not sure' },
    ]},
    { id: 'state', prompt: 'What state are you in?', type: 'single_choice', options: [
      { value: 'TX', label: 'Texas' },
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      { value: 'FL', label: 'Florida' },
      { value: 'other', label: 'Other state' },
    ]},
  ],
  landlord_tenant: [
    { id: 'issue', prompt: 'What is your situation?', type: 'single_choice', options: [
      { value: 'eviction', label: 'Facing eviction' },
      { value: 'repairs', label: 'Landlord won\'t make repairs' },
      { value: 'deposit', label: 'Security deposit dispute' },
      { value: 'lease', label: 'Lease violation dispute' },
      { value: 'other', label: 'Other' },
    ]},
    { id: 'when', prompt: 'When did this issue start?', type: 'single_choice', options: [
      { value: 'this_week', label: 'This week' },
      { value: 'this_month', label: 'This month' },
      { value: 'last_few_months', label: 'Last few months' },
      { value: 'over_6_months', label: 'Over 6 months ago' },
    ]},
    { id: 'lease', prompt: 'Do you have a written lease?', type: 'single_choice', options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No, month-to-month' },
      { value: 'expired', label: 'Lease has expired' },
    ]},
    { id: 'communication', prompt: 'Have you communicated with your landlord about this?', type: 'single_choice', options: [
      { value: 'written', label: 'Yes, in writing' },
      { value: 'verbal', label: 'Yes, verbally only' },
      { value: 'no', label: 'No' },
    ]},
    { id: 'state', prompt: 'What state are you in?', type: 'single_choice', options: [
      { value: 'TX', label: 'Texas' },
      { value: 'CA', label: 'California' },
      { value: 'NY', label: 'New York' },
      { value: 'FL', label: 'Florida' },
      { value: 'other', label: 'Other state' },
    ]},
  ],
}

// Fallback for dispute types without specific questions
export const DEFAULT_QUESTIONS: AssessmentQuestion[] = [
  { id: 'what_happened', prompt: 'Briefly, what is your legal issue about?', type: 'single_choice', options: [
    { value: 'money', label: 'Money owed or financial dispute' },
    { value: 'property', label: 'Property or housing issue' },
    { value: 'contract', label: 'Contract or agreement dispute' },
    { value: 'injury', label: 'Personal injury' },
    { value: 'family', label: 'Family law matter' },
    { value: 'other', label: 'Other' },
  ]},
  { id: 'when', prompt: 'When did this happen?', type: 'single_choice', options: [
    { value: 'recent', label: 'Within the last 6 months' },
    { value: '6_12', label: '6-12 months ago' },
    { value: '1_2_years', label: '1-2 years ago' },
    { value: 'over_2_years', label: 'Over 2 years ago' },
  ]},
  { id: 'evidence', prompt: 'What evidence do you have?', type: 'single_choice', options: [
    { value: 'strong', label: 'Documents, contracts, or photos' },
    { value: 'some', label: 'Messages or emails' },
    { value: 'little', label: 'Witnesses or verbal agreements' },
    { value: 'none', label: 'No evidence yet' },
  ]},
  { id: 'tried_resolve', prompt: 'Have you tried to resolve this directly?', type: 'single_choice', options: [
    { value: 'yes', label: 'Yes, but it didn\'t work' },
    { value: 'no', label: 'No, not yet' },
  ]},
  { id: 'state', prompt: 'What state are you in?', type: 'single_choice', options: [
    { value: 'TX', label: 'Texas' },
    { value: 'CA', label: 'California' },
    { value: 'NY', label: 'New York' },
    { value: 'FL', label: 'Florida' },
    { value: 'other', label: 'Other state' },
  ]},
]
