/**
 * Test scenarios for document quality evaluation.
 *
 * Each scenario defines a dispute type, document type, and all the inputs
 * needed to call the document generation system.
 */

import type { DocumentType } from '@/lib/ai/document-generation'

export interface EvalScenario {
  id: string
  name: string
  disputeType: 'small_claims' | 'debt_collection_defense' | 'landlord_tenant'
  documentType: DocumentType
  caseDetails: {
    caseName: string
    caseNumber?: string
    court?: string
    yourName: string
    opposingParty?: string
    disputeType?: string
    state?: string
    role?: 'plaintiff' | 'defendant'
  }
  documentDetails: {
    recipientName?: string
    recipientTitle?: string
    subject?: string
    facts?: string
    claims?: string
    damages?: string
    settlementAmount?: string
    timeline?: string
    additionalInfo?: string
  }
}

// ---------------------------------------------------------------------------
// Small Claims (4 scenarios)
// ---------------------------------------------------------------------------

const smallClaims: EvalScenario[] = [
  {
    id: 'sc-contractor',
    name: 'Contractor didn\'t finish job — $5K',
    disputeType: 'small_claims',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Martinez v. AllPro Renovations LLC',
      court: 'Los Angeles County Small Claims Court',
      yourName: 'Sofia Martinez',
      opposingParty: 'AllPro Renovations LLC',
      disputeType: 'Breach of Contract',
      state: 'California',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'AllPro Renovations LLC',
      subject: 'Demand for Refund — Incomplete Kitchen Renovation',
      facts: 'On January 15, 2026, I entered into a written contract with AllPro Renovations LLC for a complete kitchen renovation at my home at 456 Oak Street, Los Angeles, CA 90012. The contract price was $12,000, of which I paid $5,000 upfront. Work began on February 1, 2026 and was to be completed by March 1, 2026. As of today, the contractor has demolished the old kitchen but has not installed new cabinets, countertops, or appliances. They stopped showing up on February 15 and have not responded to my calls or emails since February 20.',
      claims: 'Breach of written contract. Contractor accepted payment but failed to perform agreed-upon work within the specified timeline.',
      damages: '$5,000 — return of deposit paid for work not performed. Additionally seeking $500 for costs of eating out for 6 weeks due to having no functional kitchen.',
    },
  },
  {
    id: 'sc-deposit',
    name: 'Landlord kept security deposit — $2K',
    disputeType: 'small_claims',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Chen v. Greenfield Property Management',
      court: 'San Francisco County Small Claims Court',
      yourName: 'David Chen',
      opposingParty: 'Greenfield Property Management',
      disputeType: 'Security Deposit Return',
      state: 'California',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Greenfield Property Management',
      recipientTitle: 'Property Manager',
      subject: 'Demand for Return of Security Deposit',
      facts: 'I rented apartment 4B at 123 Market Street, San Francisco, CA 94105 from January 2024 to January 2026. My security deposit was $2,000. I gave proper 30-day notice and vacated on January 31, 2026, leaving the apartment in clean condition. I took photos and video at move-out. Over 21 days have passed (the California statutory deadline) and I have not received my deposit or an itemized statement of deductions.',
      claims: 'Violation of California Civil Code Section 1950.5. Landlord failed to return security deposit or provide itemized statement within 21 days of move-out.',
      damages: '$2,000 security deposit plus up to $2,000 in statutory penalties for bad faith retention under Cal. Civ. Code 1950.5(l).',
    },
  },
  {
    id: 'sc-product',
    name: 'Business didn\'t deliver product — $3K',
    disputeType: 'small_claims',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Patel v. CustomFurniture.com',
      court: 'Cook County Small Claims Court',
      yourName: 'Anika Patel',
      opposingParty: 'CustomFurniture.com Inc.',
      disputeType: 'Non-delivery of Goods',
      state: 'Illinois',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'CustomFurniture.com Inc.',
      subject: 'Demand for Refund — Order #CF-98234 Never Delivered',
      facts: 'On November 10, 2025, I placed an order (#CF-98234) on CustomFurniture.com for a custom dining table and 6 chairs for $3,000. The website promised delivery within 8-10 weeks. I paid in full by credit card. The estimated delivery date of January 19, 2026 passed with no delivery and no communication. I have emailed customer support 5 times and called 3 times. I received one email on February 5, 2026 saying the order was "in production" but no updated delivery date. It has now been over 19 weeks since my order.',
      claims: 'Breach of contract and violation of Illinois Consumer Fraud and Deceptive Business Practices Act (815 ILCS 505).',
      damages: '$3,000 — full refund of purchase price.',
    },
  },
  {
    id: 'sc-car-repair',
    name: 'Car repair gone wrong — $1.5K',
    disputeType: 'small_claims',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Thompson v. Quick Fix Auto Shop',
      court: 'Harris County Justice of the Peace Court',
      yourName: 'James Thompson',
      opposingParty: 'Quick Fix Auto Shop',
      disputeType: 'Faulty Auto Repair',
      state: 'Texas',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Quick Fix Auto Shop',
      subject: 'Demand for Refund — Botched Transmission Repair',
      facts: 'On February 1, 2026, I brought my 2019 Honda Civic to Quick Fix Auto Shop for a transmission fluid change. I was charged $1,500 for what they described as a "full transmission service." Within 2 days of picking up the car, the transmission began slipping and making grinding noises. I took the car to Honda dealership, which found that Quick Fix had used the wrong transmission fluid type and had not properly sealed the transmission pan, causing a slow leak. The dealership quoted $800 to fix the damage caused by Quick Fix. I returned to Quick Fix on February 10 and the owner refused to take responsibility.',
      claims: 'Negligent auto repair. Violation of Texas Deceptive Trade Practices Act (DTPA). The repair was performed in a substandard manner causing additional damage to my vehicle.',
      damages: '$1,500 for the original botched repair plus $800 for corrective repair at the dealership, totaling $2,300. Limiting claim to $1,500 for small claims jurisdiction.',
    },
  },
]

// ---------------------------------------------------------------------------
// Debt Collection Defense (3 scenarios)
// ---------------------------------------------------------------------------

const debtDefense: EvalScenario[] = [
  {
    id: 'dc-statute',
    name: 'Statute of limitations expired',
    disputeType: 'debt_collection_defense',
    documentType: 'letter',
    caseDetails: {
      caseName: 'Apex Collections Inc. v. Williams',
      caseNumber: '2026-CV-04521',
      court: 'Hamilton County Municipal Court',
      yourName: 'Robert Williams',
      opposingParty: 'Apex Collections Inc.',
      disputeType: 'Debt Collection Defense',
      state: 'Ohio',
      role: 'defendant',
    },
    documentDetails: {
      recipientName: 'Apex Collections Inc.',
      recipientTitle: 'Legal Department',
      subject: 'Response to Collection Claim — Statute of Limitations Defense',
      facts: 'I received a summons and complaint dated March 1, 2026 regarding an alleged credit card debt of $4,200 originally owed to First National Bank. According to the complaint, the last payment on this account was made on December 15, 2019 — over 6 years ago. Ohio\'s statute of limitations for written contracts and credit card debt is 6 years under Ohio Rev. Code 2305.06. The statute of limitations expired on or about December 15, 2025, which is before this lawsuit was filed.',
      claims: 'Affirmative defense: statute of limitations has expired. The claim is time-barred under Ohio Rev. Code 2305.06.',
      additionalInfo: 'I am requesting this case be dismissed with prejudice as the claim was filed after the applicable statute of limitations expired.',
    },
  },
  {
    id: 'dc-wrong-amount',
    name: 'Wrong amount claimed by collector',
    disputeType: 'debt_collection_defense',
    documentType: 'letter',
    caseDetails: {
      caseName: 'Recovery Solutions LLC v. Garcia',
      caseNumber: '2026-SC-00892',
      court: 'Maricopa County Justice Court',
      yourName: 'Maria Garcia',
      opposingParty: 'Recovery Solutions LLC',
      disputeType: 'Debt Collection Defense',
      state: 'Arizona',
      role: 'defendant',
    },
    documentDetails: {
      recipientName: 'Recovery Solutions LLC',
      recipientTitle: 'Collections Manager',
      subject: 'Dispute of Claimed Amount — Account #RS-44781',
      facts: 'Recovery Solutions LLC is claiming I owe $8,750 on a medical debt from Desert Medical Center. My records show the original bill was $3,200. My insurance (Blue Cross) paid $1,800, leaving a balance of $1,400 which I have been making payments on. I have payment receipts showing $600 already paid, leaving a true balance of $800. The collector appears to have added unauthorized fees, interest, and possibly charges from a different account. I sent a written debt validation request on February 1, 2026 via certified mail. Over 30 days have passed and I have not received proper validation.',
      claims: 'Violation of Fair Debt Collection Practices Act (FDCPA) 15 USC 1692g — failure to validate debt. The amount claimed is grossly inflated beyond the actual balance owed.',
      damages: 'Requesting the court reduce the claimed amount to $800 (the actual balance owed) and award statutory damages under FDCPA for failure to validate.',
    },
  },
  {
    id: 'dc-identity-theft',
    name: 'Identity theft — not my debt',
    disputeType: 'debt_collection_defense',
    documentType: 'letter',
    caseDetails: {
      caseName: 'National Credit Bureau v. Johnson',
      caseNumber: '2026-CV-01234',
      court: 'Fulton County State Court',
      yourName: 'Terrence Johnson',
      opposingParty: 'National Credit Bureau LLC',
      disputeType: 'Debt Collection Defense — Identity Theft',
      state: 'Georgia',
      role: 'defendant',
    },
    documentDetails: {
      recipientName: 'National Credit Bureau LLC',
      recipientTitle: 'Legal Department',
      subject: 'Defense to Collection — Identity Theft Victim',
      facts: 'I am being sued for a $6,500 credit card debt allegedly opened in my name at Capital One Bank on June 1, 2024. I did not open this account. I discovered this account on my credit report in October 2025 and immediately: (1) filed an identity theft report with the FTC (Report #2025-FTC-987654), (2) filed a police report with Atlanta PD (Report #APD-2025-112233), (3) placed a fraud alert with all three credit bureaus, and (4) sent a written identity theft dispute to Capital One with supporting documentation.',
      claims: 'This debt was incurred through identity theft. I am not liable for debts fraudulently opened in my name. Fair Credit Reporting Act (FCRA) Section 605B and Georgia Identity Theft statute O.C.G.A. 16-9-121.',
      additionalInfo: 'I have FTC identity theft report, police report, and fraud dispute correspondence available as exhibits.',
    },
  },
]

// ---------------------------------------------------------------------------
// Landlord-Tenant (3 scenarios)
// ---------------------------------------------------------------------------

const landlordTenant: EvalScenario[] = [
  {
    id: 'lt-eviction',
    name: 'Wrongful eviction',
    disputeType: 'landlord_tenant',
    documentType: 'letter',
    caseDetails: {
      caseName: 'Rivera v. Sunrise Properties LLC',
      court: 'New York City Civil Court, Housing Part',
      yourName: 'Carmen Rivera',
      opposingParty: 'Sunrise Properties LLC',
      disputeType: 'Wrongful Eviction',
      state: 'New York',
      role: 'defendant',
    },
    documentDetails: {
      recipientName: 'Sunrise Properties LLC',
      recipientTitle: 'Property Management Office',
      subject: 'Response to Eviction Notice — Retaliatory Eviction Claim',
      facts: 'I have been a tenant at 789 Broadway, Apt 3A, New York, NY 10003 since March 2023. In January 2026, I filed a complaint with the NYC Department of Housing Preservation and Development (HPD) about lack of heat and hot water in my apartment (Complaint #HPD-2026-001234). On February 15, 2026 — three weeks after my complaint — my landlord served me with a notice to vacate alleging lease violations that never previously existed. My rent is current and has always been paid on time. I have never received any prior warnings or notices about lease violations.',
      claims: 'Retaliatory eviction in violation of New York Real Property Law Section 223-b. The eviction notice was served in direct response to my filing a legitimate housing complaint with HPD.',
      additionalInfo: 'I have copies of the HPD complaint, the eviction notice, and rent payment receipts showing I am current on all payments.',
    },
  },
  {
    id: 'lt-conditions',
    name: 'Uninhabitable conditions',
    disputeType: 'landlord_tenant',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Nguyen v. Pacific Coast Apartments',
      court: 'San Diego County Small Claims Court',
      yourName: 'Thanh Nguyen',
      opposingParty: 'Pacific Coast Apartments',
      disputeType: 'Uninhabitable Living Conditions',
      state: 'California',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Pacific Coast Apartments',
      recipientTitle: 'Property Manager',
      subject: 'Demand for Repairs and Rent Reduction — Unit 12B',
      facts: 'I have rented Unit 12B at Pacific Coast Apartments, 555 Coast Blvd, San Diego, CA 92109 since June 2024. Since November 2025, my apartment has had severe mold in the bathroom and bedroom, a broken heater (no heat since December 2025), and persistent cockroach infestation. I have submitted 7 written maintenance requests between November 2025 and March 2026. The management has acknowledged the issues but has not made any repairs. I have photographs, written maintenance requests, and a letter from my doctor stating the mold has aggravated my asthma.',
      claims: 'Breach of implied warranty of habitability under California Civil Code Section 1941. Landlord has failed to maintain the premises in a habitable condition despite repeated written notice.',
      damages: 'Requesting 30% rent reduction ($600/month x 5 months = $3,000) for diminished use and enjoyment, plus $500 for medical expenses related to mold exposure.',
    },
  },
  {
    id: 'lt-deposit-dispute',
    name: 'Security deposit dispute with deductions',
    disputeType: 'landlord_tenant',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Kim v. Heritage Manor Apartments',
      court: 'King County Small Claims Court',
      yourName: 'Sarah Kim',
      opposingParty: 'Heritage Manor Apartments',
      disputeType: 'Security Deposit Dispute',
      state: 'Washington',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Heritage Manor Apartments',
      recipientTitle: 'Property Manager',
      subject: 'Demand for Return of Wrongfully Withheld Security Deposit',
      facts: 'I rented Apartment 7C at Heritage Manor, 200 Pine Street, Seattle, WA 98101 from August 2023 to February 2026. My security deposit was $1,800. Upon move-out, I received a deduction statement claiming $1,500 in charges: $800 for "carpet replacement" (the carpet was 8 years old and already worn when I moved in), $400 for "painting" (normal wear and tear over 2.5 years), and $300 for "cleaning" (I hired a professional cleaning service before move-out and have the receipt). Under Washington law (RCW 59.18.280), landlords cannot charge for normal wear and tear.',
      claims: 'Violation of Washington Residential Landlord-Tenant Act RCW 59.18.280. Wrongful withholding of security deposit for normal wear and tear items.',
      damages: '$1,500 in wrongful deductions plus up to 2x deposit amount in penalties under RCW 59.18.280 for intentional wrongful withholding.',
    },
  },
]

// ---------------------------------------------------------------------------
// Export all scenarios
// ---------------------------------------------------------------------------

export const ALL_SCENARIOS: EvalScenario[] = [
  ...smallClaims,
  ...debtDefense,
  ...landlordTenant,
]
