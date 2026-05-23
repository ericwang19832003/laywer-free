export interface StrengthQuestion {
  id: string
  question: string
  /** What to do if the user answers "Not yet" */
  actionIfNo: string
}

export interface StrengthProfile {
  label: string
  questions: StrengthQuestion[]
}

const PROFILES: Record<string, StrengthProfile> = {
  personal_injury: {
    label: 'Personal Injury',
    questions: [
      {
        id: 'incident_docs',
        question: 'Do you have documentation of the incident — photos, a police report, or an accident report?',
        actionIfNo: 'Gather any available photos, request the police or accident report from the responding agency.',
      },
      {
        id: 'medical_records',
        question: 'Do you have medical records showing your injuries and treatment?',
        actionIfNo: 'Request records from every provider who treated you. Keep all bills and receipts.',
      },
      {
        id: 'fault_evidence',
        question: "Can you show the other party was at fault — through witness statements, surveillance footage, or their own admission?",
        actionIfNo: 'Identify witnesses and ask for written statements. Check nearby businesses for security footage.',
      },
      {
        id: 'financial_losses',
        question: 'Do you have records of your financial losses — medical bills, lost wages, or repair costs?',
        actionIfNo: 'Collect all bills and receipts. Ask your employer for a letter documenting missed work.',
      },
      {
        id: 'sol',
        question: 'Did the incident happen within the last 2 years (the typical statute of limitations)?',
        actionIfNo: 'Check your state\'s specific deadline. Filing after the deadline bars your claim entirely.',
      },
    ],
  },

  landlord_tenant: {
    label: 'Landlord/Tenant',
    questions: [
      {
        id: 'lease',
        question: 'Do you have your lease agreement in writing?',
        actionIfNo: 'Request a copy from your landlord or property manager in writing.',
      },
      {
        id: 'written_notice',
        question: 'Do you have written documentation of the issue — repair requests, notices, or photos?',
        actionIfNo: 'Send a written repair request or notice today and keep a copy. Photograph all conditions.',
      },
      {
        id: 'rent_payments',
        question: 'Do you have proof you paid rent on time — bank statements, receipts, or money order stubs?',
        actionIfNo: 'Gather bank statements showing rent transactions. Request receipts for any cash payments.',
      },
      {
        id: 'landlord_notice',
        question: 'Did you give the landlord written notice of the problem and a reasonable time to fix it?',
        actionIfNo: 'Send a written notice by certified mail and keep the receipt.',
      },
      {
        id: 'damages',
        question: 'Do you have records of your damages — withheld deposit, rent overpayment, or costs you incurred?',
        actionIfNo: 'Calculate exact amounts and gather supporting receipts or bank records.',
      },
    ],
  },

  small_claims: {
    label: 'Small Claims',
    questions: [
      {
        id: 'agreement',
        question: 'Do you have a written contract, receipt, or agreement showing what was promised?',
        actionIfNo: 'Gather any written evidence: texts, emails, invoices, or receipts that show the agreement.',
      },
      {
        id: 'breach',
        question: 'Do you have proof the other party failed to deliver what was promised?',
        actionIfNo: 'Document how their performance fell short — photos, communications, or witness statements.',
      },
      {
        id: 'financial_loss',
        question: 'Do you have documentation of your exact financial loss — invoices, receipts, or repair estimates?',
        actionIfNo: 'Get written estimates or receipts to support the dollar amount you\'re claiming.',
      },
      {
        id: 'demand',
        question: 'Have you sent the other party a written demand for payment before filing?',
        actionIfNo: 'Send a demand letter by email or certified mail and keep a copy. Courts expect this first.',
      },
      {
        id: 'within_limit',
        question: 'Is your claim within the small claims dollar limit for your state?',
        actionIfNo: 'Check your state\'s limit (typically $5,000–$10,000). Claims above the limit require a different court.',
      },
    ],
  },

  family: {
    label: 'Family Law',
    questions: [
      {
        id: 'asset_records',
        question: 'Do you have records of marital assets — bank statements, property records, retirement accounts?',
        actionIfNo: 'Gather recent statements for all accounts and any property deeds or vehicle titles you share.',
      },
      {
        id: 'parenting_evidence',
        question: 'If children are involved, do you have documentation of your role in their daily care?',
        actionIfNo: 'Gather school records, medical records, photos, and messages showing your involvement.',
      },
      {
        id: 'support_records',
        question: 'Do you have records of any support already paid or received — bank transfers, receipts?',
        actionIfNo: 'Pull bank statements showing payment history for the last 2–3 years.',
      },
      {
        id: 'clear_goals',
        question: 'Have you clearly identified what you\'re seeking — specific custody schedule, support amounts, property split?',
        actionIfNo: 'Write down your specific requests before filing. Vague goals make it harder to negotiate and harder for the judge to rule.',
      },
      {
        id: 'living_arrangements',
        question: 'Do you have a stable living arrangement and the means to support yourself (and any children) post-separation?',
        actionIfNo: 'Courts consider stability heavily in custody decisions. Document your housing and income situation.',
      },
    ],
  },

  business: {
    label: 'Business Dispute',
    questions: [
      {
        id: 'written_agreement',
        question: 'Do you have a written contract or agreement showing the business relationship and obligations?',
        actionIfNo: 'Gather any signed agreements, SOWs, invoices, or email chains that establish the deal terms.',
      },
      {
        id: 'breach_evidence',
        question: "Do you have evidence the other party breached their obligations?",
        actionIfNo: 'Document specific ways they failed to perform — deliverables missed, deadlines ignored, payments not made.',
      },
      {
        id: 'financial_damages',
        question: 'Do you have records of your financial damages from the breach?',
        actionIfNo: 'Calculate lost revenue, extra costs incurred, and gather supporting invoices or financial records.',
      },
      {
        id: 'demand_sent',
        question: 'Have you sent a written demand letter to the other party before filing?',
        actionIfNo: 'Send a formal demand by certified mail. It\'s required in many jurisdictions and often resolves cases without filing.',
      },
      {
        id: 'communications',
        question: 'Do you have communications — emails, texts, contracts — that support your version of events?',
        actionIfNo: 'Export and preserve all relevant emails, messages, and documents before the other party deletes them.',
      },
    ],
  },

  debt_collection: {
    label: 'Debt Collection Defense',
    questions: [
      {
        id: 'debt_validation',
        question: 'Have you received (or requested) a written debt validation notice from the collector?',
        actionIfNo: 'Send a written debt validation request within 30 days of first contact. The collector must prove the debt is valid.',
      },
      {
        id: 'payment_records',
        question: 'Do you have records showing you paid this debt, it\'s not yours, or the amount is wrong?',
        actionIfNo: 'Pull bank statements and credit reports. Errors and identity theft are common in debt collection.',
      },
      {
        id: 'sol_check',
        question: 'Have you verified the debt is within your state\'s statute of limitations?',
        actionIfNo: 'Check your state\'s SOL for this type of debt. Many lawsuits are filed on debts past the legal deadline.',
      },
      {
        id: 'fdcpa_violations',
        question: 'Have you documented any FDCPA violations — harassment, false statements, or threats?',
        actionIfNo: 'Keep a log of every contact: date, time, what was said. FDCPA violations can be a counterclaim.',
      },
      {
        id: 'prior_disputes',
        question: 'Do you have copies of any disputes you\'ve already submitted to the collector or credit bureaus?',
        actionIfNo: 'Send disputes by certified mail and keep the receipts. Prior disputes are important evidence.',
      },
    ],
  },

  contract: {
    label: 'Contract Dispute',
    questions: [
      {
        id: 'contract_exists',
        question: 'Do you have the contract in writing, or strong evidence of an oral agreement — witnesses, texts, emails?',
        actionIfNo: 'Gather all written evidence of the agreement: emails, texts, invoices, or any signed documents.',
      },
      {
        id: 'non_performance',
        question: "Do you have proof the other party failed to perform their obligations?",
        actionIfNo: 'Document specific failures: what was promised, what was delivered, and the gap between them.',
      },
      {
        id: 'damages_calculated',
        question: 'Have you calculated your exact damages from the breach and gathered supporting records?',
        actionIfNo: 'Determine your actual financial loss and support it with invoices, receipts, or financial statements.',
      },
      {
        id: 'pre_suit_demand',
        question: 'Have you made a written demand for performance or payment before filing?',
        actionIfNo: 'Send a formal demand letter. It\'s expected before filing and often resolves the dispute.',
      },
      {
        id: 'performed_your_part',
        question: 'Can you show you fully performed your own obligations under the contract?',
        actionIfNo: 'Gather evidence you did your part: invoices sent, work completed, deliverables submitted.',
      },
    ],
  },

  property: {
    label: 'Property Damage',
    questions: [
      {
        id: 'damage_documentation',
        question: 'Do you have photos or video showing the damage clearly?',
        actionIfNo: 'Photograph or video the damage now from multiple angles before any repairs are made.',
      },
      {
        id: 'repair_costs',
        question: 'Do you have written repair estimates or receipts showing the actual cost?',
        actionIfNo: 'Get at least two written estimates from licensed contractors or professionals.',
      },
      {
        id: 'causation',
        question: 'Can you establish that the other party caused the damage — witnesses, evidence, or their admission?',
        actionIfNo: 'Identify witnesses and gather any communications where the other party acknowledged responsibility.',
      },
      {
        id: 'written_notice',
        question: 'Did you notify the responsible party in writing about the damage?',
        actionIfNo: 'Send a written notice by email or certified mail and keep a copy.',
      },
      {
        id: 'insurance',
        question: 'Have you documented any insurance claims or denials related to this damage?',
        actionIfNo: 'File an insurance claim if applicable. The denial or payout can be evidence in your case.',
      },
    ],
  },
}

const DEFAULT_PROFILE: StrengthProfile = {
  label: 'Civil Case',
  questions: [
    {
      id: 'legal_harm',
      question: 'Can you clearly state what legal harm was done to you and who is responsible?',
      actionIfNo: 'Write a one-paragraph summary: what happened, who did it, and why it was wrong. This is the core of your claim.',
    },
    {
      id: 'documentary_evidence',
      question: 'Do you have documentary evidence — documents, photos, records — that supports your claim?',
      actionIfNo: 'Gather every relevant document: contracts, photos, communications, and financial records.',
    },
    {
      id: 'damages_calculated',
      question: 'Have you calculated your exact financial losses or damages?',
      actionIfNo: 'List every loss with a dollar amount and supporting record. Courts require specific numbers.',
    },
    {
      id: 'demand_sent',
      question: 'Have you sent a written demand to the other party before filing?',
      actionIfNo: 'Send a demand letter by certified mail. Courts expect this first step in most civil cases.',
    },
    {
      id: 'sol',
      question: 'Is your claim within the statute of limitations (typically 2–4 years for civil claims)?',
      actionIfNo: 'Check your state\'s specific deadline for your type of claim. A late filing will be dismissed.',
    },
  ],
}

export function getStrengthProfile(disputeType: string): StrengthProfile {
  return PROFILES[disputeType] ?? DEFAULT_PROFILE
}

export type StrengthVerdict = 'strong' | 'gaps' | 'needs_work'

export function getVerdict(score: number, total: number): StrengthVerdict {
  const pct = score / total
  if (pct >= 0.8) return 'strong'
  if (pct >= 0.5) return 'gaps'
  return 'needs_work'
}
