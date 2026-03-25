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
  disputeType:
    | 'small_claims'
    | 'debt_collection_defense'
    | 'debt_collection'
    | 'landlord_tenant'
    | 'personal_injury'
    | 'contract'
    | 'property'
    | 'real_estate'
    | 'business'
    | 'family'
    | 'other'
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
// Personal Injury (1 scenario)
// ---------------------------------------------------------------------------

const personalInjury: EvalScenario[] = [
  {
    id: 'pi-slip-fall',
    name: 'Slip and fall at grocery store',
    disputeType: 'personal_injury',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Alvarez v. FreshMart Groceries Inc.',
      court: 'Miami-Dade County Circuit Court',
      yourName: 'Elena Alvarez',
      opposingParty: 'FreshMart Groceries Inc.',
      disputeType: 'Personal Injury — Slip and Fall',
      state: 'Florida',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'FreshMart Groceries Inc.',
      recipientTitle: 'Risk Management Department',
      subject: 'Demand for Compensation — Slip and Fall Injury on March 2, 2026',
      facts: 'On March 2, 2026, at approximately 2:30 PM, I slipped and fell on a wet floor in aisle 7 of the FreshMart store located at 4500 Biscayne Blvd, Miami, FL 33137. There were no wet floor signs or warning cones present. A store employee had mopped the aisle approximately 10 minutes prior without placing any warnings. I fell on my right side, striking my hip and right wrist on the tile floor. Paramedics were called and I was transported to Jackson Memorial Hospital. X-rays confirmed a fractured right wrist (distal radius fracture) and a severe hip contusion. I was placed in a cast for 6 weeks and required 8 sessions of physical therapy. Two other customers witnessed the fall and provided statements to the store manager.',
      claims: 'Negligence. FreshMart failed to maintain safe premises by not placing wet floor signs after mopping. Florida premises liability under Fla. Stat. § 768.0755.',
      damages: '$4,200 in medical bills (ER visit, X-rays, orthopedic follow-ups, physical therapy), $3,600 in lost wages (missed 3 weeks of work as a dental hygienist earning $1,200/week), and $2,000 for pain and suffering. Total demand: $9,800.',
      timeline: 'March 2, 2026: Incident. March 2-3: ER and initial treatment. March 10: Orthopedic follow-up, cast applied. March 10 - April 20: Out of work. April 21 - June 1: Physical therapy (8 sessions). June 15: Discharged from care.',
    },
  },
]

// ---------------------------------------------------------------------------
// Contract Disputes (1 scenario)
// ---------------------------------------------------------------------------

const contractDisputes: EvalScenario[] = [
  {
    id: 'ct-freelance',
    name: 'Client refused to pay freelance invoice',
    disputeType: 'contract',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Okafor v. BrightPath Marketing LLC',
      court: 'Travis County District Court',
      yourName: 'Chinelo Okafor',
      opposingParty: 'BrightPath Marketing LLC',
      disputeType: 'Breach of Contract — Non-Payment',
      state: 'Texas',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'BrightPath Marketing LLC',
      recipientTitle: 'CEO',
      subject: 'Demand for Payment — Web Development Services',
      facts: 'On October 1, 2025, I entered into a written contract with BrightPath Marketing LLC to redesign and develop their company website for a total fee of $15,000, payable in three milestones: $5,000 upon signing, $5,000 upon design approval, and $5,000 upon project completion. BrightPath paid the first $5,000 on October 1 and the second $5,000 on November 15 after approving the design mockups. I completed the website and delivered all files and access credentials on January 10, 2026. BrightPath\'s CEO, Mark Sullivan, confirmed receipt by email on January 12 and stated the site "looks great." The final $5,000 invoice was sent on January 15, 2026 with net-30 terms. Despite multiple follow-ups on February 20, March 1, and March 10, the invoice remains unpaid. BrightPath has been using the completed website since January 20, 2026.',
      claims: 'Breach of written contract. BrightPath accepted and is using the completed work product but has refused to pay the final milestone payment.',
      damages: '$5,000 unpaid invoice, plus 18% annual interest as specified in the contract ($150 accrued to date), plus reasonable attorney\'s fees as provided by the contract\'s fee-shifting clause.',
    },
  },
]

// ---------------------------------------------------------------------------
// Property Disputes (1 scenario)
// ---------------------------------------------------------------------------

const propertyDisputes: EvalScenario[] = [
  {
    id: 'pr-fence-line',
    name: 'Neighbor built fence on my property',
    disputeType: 'property',
    documentType: 'letter',
    caseDetails: {
      caseName: 'Henderson v. Kowalski',
      court: 'Douglas County District Court',
      yourName: 'Patricia Henderson',
      opposingParty: 'Michael Kowalski',
      disputeType: 'Property Line Encroachment',
      state: 'Colorado',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Michael Kowalski',
      subject: 'Notice Regarding Fence Encroachment on 1842 Elm Drive',
      facts: 'I own the property at 1842 Elm Drive, Castle Rock, CO 80104. In February 2026, my neighbor Michael Kowalski, who owns the adjacent property at 1844 Elm Drive, erected a 6-foot wooden privacy fence that encroaches approximately 3 feet onto my property along the entire 120-foot length of our shared boundary. I hired a licensed surveyor (Summit Land Surveying, Report #SLS-2026-0087, dated March 5, 2026) who confirmed the fence is built entirely on my side of the property line. I approached Mr. Kowalski on March 8 to discuss the survey results, and he refused to acknowledge the encroachment or discuss moving the fence.',
      claims: 'Trespass and encroachment. The fence is built on my property without my permission, depriving me of use of approximately 360 square feet of my land.',
      damages: 'Requesting removal of the fence and restoration of the property to its prior condition. If not removed within 30 days, I will seek a court order for removal plus damages for loss of use.',
      additionalInfo: 'Licensed survey report and photographs of the fence and property markers are available as supporting documentation.',
    },
  },
]

// ---------------------------------------------------------------------------
// Real Estate (1 scenario)
// ---------------------------------------------------------------------------

const realEstate: EvalScenario[] = [
  {
    id: 're-disclosure',
    name: 'Seller failed to disclose foundation issues',
    disputeType: 'real_estate',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Washington v. Delgado',
      court: 'Bexar County District Court',
      yourName: 'Marcus Washington',
      opposingParty: 'Linda Delgado',
      disputeType: 'Failure to Disclose Material Defects',
      state: 'Texas',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Linda Delgado',
      subject: 'Demand for Compensation — Undisclosed Foundation Defects at 310 Magnolia Ave',
      facts: 'On December 1, 2025, I purchased the residential property at 310 Magnolia Ave, San Antonio, TX 78204 from Linda Delgado for $285,000. The seller\'s disclosure statement, signed October 15, 2025, indicated no known foundation problems. In February 2026, I noticed cracks appearing in the interior walls and doors that would not close properly. I hired a licensed structural engineer (Alamo Structural Engineering, Report #ASE-2026-142, dated February 28, 2026) who found significant foundation settlement requiring pier installation. The engineer estimated repair costs at $22,000. During the inspection, the engineer noted evidence of prior cosmetic patching of wall cracks consistent with an attempt to conceal existing foundation problems. A neighbor at 312 Magnolia Ave provided a written statement that Ms. Delgado had discussed foundation problems with them in 2024 and had obtained a repair estimate but chose not to proceed with repairs.',
      claims: 'Fraudulent non-disclosure of known material defects in violation of Texas Property Code § 5.008. Seller had actual knowledge of the foundation issues and affirmatively concealed them.',
      damages: '$22,000 for foundation repair, $1,200 for structural engineering inspection, and $800 for cosmetic repairs to interior walls. Total: $24,000.',
    },
  },
]

// ---------------------------------------------------------------------------
// Business Disputes (1 scenario)
// ---------------------------------------------------------------------------

const businessDisputes: EvalScenario[] = [
  {
    id: 'bz-partnership',
    name: 'Partner misappropriated business funds',
    disputeType: 'business',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Reeves v. Chang',
      caseNumber: '2026-CV-03891',
      court: 'King County Superior Court',
      yourName: 'Daniel Reeves',
      opposingParty: 'Kevin Chang',
      disputeType: 'Partnership Dispute — Misappropriation of Funds',
      state: 'Washington',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Kevin Chang',
      subject: 'Demand for Accounting and Return of Partnership Funds',
      facts: 'Daniel Reeves and Kevin Chang formed an equal 50/50 general partnership, "R&C Digital Solutions," in January 2024 to provide web development services. Both partners contributed $10,000 in initial capital. The partnership agreement requires both partners to approve any expenditure over $1,000. In reviewing the partnership bank statements for January-February 2026, I discovered that Kevin Chang made $18,500 in unauthorized withdrawals: $8,000 transferred to a personal account on January 15, $6,500 in cash withdrawals between January 20 and February 10, and $4,000 charged to a personal credit card for non-business expenses on February 5. When confronted on March 1, 2026, Mr. Chang acknowledged the withdrawals but claimed they were "advances on future profits." The partnership has not yet distributed any profits for 2026 and no profit distribution was authorized.',
      claims: 'Breach of fiduciary duty. Breach of partnership agreement. Conversion of partnership funds for personal use in violation of Washington Revised Uniform Partnership Act (RCW 25.05).',
      damages: '$18,500 in misappropriated funds, plus a full accounting of all partnership finances, plus dissolution of the partnership if funds are not returned within 30 days.',
    },
  },
]

// ---------------------------------------------------------------------------
// Family (1 scenario)
// ---------------------------------------------------------------------------

const familyDisputes: EvalScenario[] = [
  {
    id: 'fm-custody-modification',
    name: 'Request to modify custody arrangement',
    disputeType: 'family',
    documentType: 'letter',
    caseDetails: {
      caseName: 'Brooks v. Brooks',
      caseNumber: '2024-DR-07722',
      court: 'Hennepin County Family Court',
      yourName: 'Jessica Brooks',
      opposingParty: 'Ryan Brooks',
      disputeType: 'Custody Modification',
      state: 'Minnesota',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Ryan Brooks',
      subject: 'Request to Modify Parenting Time Schedule',
      facts: 'Jessica and Ryan Brooks were divorced on June 15, 2024, with a parenting plan granting Ryan parenting time every other weekend (Friday 6 PM to Sunday 6 PM) and Wednesday evenings (5 PM to 8 PM). Since September 2025, Ryan has failed to exercise his parenting time on 8 of 12 scheduled weekends and has missed 10 Wednesday visits without advance notice. On multiple occasions, our 7-year-old daughter Emma was waiting at the door with her bag packed when Ryan did not arrive and did not call. This pattern has caused Emma emotional distress; her school counselor has noted increased anxiety and behavioral changes (report dated February 2026). I am requesting a modification to the parenting plan that reflects Ryan\'s actual availability and provides more stability for Emma.',
      claims: 'Substantial change in circumstances warranting custody modification under Minn. Stat. § 518.18. The current parenting plan is not being followed, causing instability for the child.',
      additionalInfo: 'School counselor report, text message records showing last-minute cancellations, and a log of missed visits are available as supporting documentation.',
    },
  },
]

// ---------------------------------------------------------------------------
// Debt Collection (1 scenario — plaintiff/creditor side, vs. debt_collection_defense)
// ---------------------------------------------------------------------------

const debtCollection: EvalScenario[] = [
  {
    id: 'dcc-unpaid-invoice',
    name: 'Collecting on unpaid B2B invoice',
    disputeType: 'debt_collection',
    documentType: 'demand_letter',
    caseDetails: {
      caseName: 'Lakewood Catering LLC v. Summit Events Corp',
      court: 'Cuyahoga County Court of Common Pleas',
      yourName: 'Lakewood Catering LLC',
      opposingParty: 'Summit Events Corp',
      disputeType: 'Debt Collection — Unpaid Invoice',
      state: 'Ohio',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Summit Events Corp',
      recipientTitle: 'Accounts Payable',
      subject: 'Final Demand for Payment — Invoice #LC-2025-0892',
      facts: 'Lakewood Catering LLC provided catering services for three corporate events hosted by Summit Events Corp on October 12, November 8, and December 5, 2025, pursuant to a Master Services Agreement dated September 1, 2025. Invoice #LC-2025-0892, dated December 15, 2025, totaling $11,400, was issued with net-30 payment terms. The invoice has not been paid despite being past due for over 90 days. Written reminders were sent on January 20, February 15, and March 5, 2026. Summit Events Corp acknowledged the debt in an email dated February 3, 2026, stating they were "experiencing cash flow issues" but would pay "soon." No payment has been received.',
      claims: 'Breach of contract. The services were delivered and accepted, and payment is contractually due under the Master Services Agreement.',
      damages: '$11,400 principal, plus 1.5% monthly late fee as specified in the MSA ($513 accrued), plus reasonable collection costs.',
    },
  },
]

// ---------------------------------------------------------------------------
// Other / Miscellaneous (1 scenario)
// ---------------------------------------------------------------------------

const otherDisputes: EvalScenario[] = [
  {
    id: 'ot-hoa-dispute',
    name: 'HOA fining for permitted structure',
    disputeType: 'other',
    documentType: 'letter',
    caseDetails: {
      caseName: 'Fernandez v. Willow Creek HOA',
      court: 'Collin County Justice Court',
      yourName: 'Roberto Fernandez',
      opposingParty: 'Willow Creek Homeowners Association',
      disputeType: 'HOA Dispute — Improper Fines',
      state: 'Texas',
      role: 'defendant',
    },
    documentDetails: {
      recipientName: 'Willow Creek HOA Board of Directors',
      subject: 'Appeal of Fine — Properly Permitted Patio Cover at 2205 Willow Creek Dr',
      facts: 'On February 10, 2026, I received a violation notice and $500 fine from Willow Creek HOA alleging that my backyard patio cover violates CC&R Section 4.7 (Exterior Modifications). Before construction, I submitted an Architectural Review Request on September 15, 2025, which was approved by the Architectural Review Committee (ARC) on October 1, 2025 (Approval Letter #ARC-2025-043). I also obtained a building permit from Collin County (Permit #BLD-2025-8821). The patio cover was built in accordance with both the ARC-approved plans and the county permit. The fine appears to have been issued by a new board member who was unaware of the prior approval.',
      claims: 'The fine was improperly assessed. The structure was approved by the HOA\'s own Architectural Review Committee and built in compliance with the approved plans and applicable building codes.',
      additionalInfo: 'ARC approval letter, county building permit, and photographs showing compliance with approved plans are available.',
    },
  },
]

// ---------------------------------------------------------------------------
// Cross-type document scenarios (varied document types)
// ---------------------------------------------------------------------------

const variedDocumentTypes: EvalScenario[] = [
  {
    id: 'dt-settlement-proposal',
    name: 'Settlement proposal for auto accident',
    disputeType: 'personal_injury',
    documentType: 'settlement_proposal',
    caseDetails: {
      caseName: 'Park v. Morrison',
      caseNumber: '2026-CV-01567',
      court: 'Multnomah County Circuit Court',
      yourName: 'Grace Park',
      opposingParty: 'Thomas Morrison',
      disputeType: 'Personal Injury — Auto Accident',
      state: 'Oregon',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Thomas Morrison',
      recipientTitle: 'c/o State Farm Insurance, Claims Dept.',
      subject: 'Settlement Proposal — Auto Accident of January 5, 2026',
      facts: 'On January 5, 2026, Thomas Morrison rear-ended my vehicle at the intersection of SE Hawthorne Blvd and 39th Ave, Portland, OR. The police report (PPD #2026-00234) confirms Mr. Morrison was at fault. I sustained whiplash and a herniated disc at C5-C6, requiring 12 weeks of chiropractic treatment and physical therapy. My vehicle sustained $4,800 in damage (repaired at Certified Collision, Invoice #CC-2026-312).',
      claims: 'Negligence. Mr. Morrison failed to maintain a safe following distance and struck my vehicle from behind while I was stopped at a red light.',
      damages: '$4,800 vehicle repair, $6,200 medical treatment (chiropractic and PT), $2,400 lost wages (2 weeks missed work), $3,000 pain and suffering. Total: $16,400.',
      settlementAmount: '$14,000 — a 15% discount from the full demand to avoid the time and expense of trial.',
      timeline: 'Jan 5: Accident. Jan 6: ER visit. Jan 10 - Apr 5: Chiropractic and PT (24 sessions). Apr 10: Maximum medical improvement. Apr 20: This proposal.',
    },
  },
  {
    id: 'dt-mediation-statement',
    name: 'Mediation statement for contract dispute',
    disputeType: 'contract',
    documentType: 'mediation_statement',
    caseDetails: {
      caseName: 'Nguyen Construction v. Apex Development Group',
      caseNumber: '2025-CV-09102',
      court: 'Clark County District Court',
      yourName: 'Nguyen Construction LLC',
      opposingParty: 'Apex Development Group',
      disputeType: 'Construction Contract Dispute',
      state: 'Nevada',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Mediator Hon. Sandra Collins (Ret.)',
      subject: 'Mediation Statement — Nguyen Construction v. Apex Development Group',
      facts: 'Nguyen Construction LLC entered into a $280,000 contract with Apex Development Group on March 1, 2025 to build a commercial retail space at 1500 Las Vegas Blvd S. We completed approximately 85% of the work ($238,000 value) by November 2025, when Apex terminated the contract without cause. Apex has paid only $180,000 of the $238,000 earned, leaving $58,000 unpaid. Additionally, Apex hired a different contractor to complete the remaining 15% of work using our plans and specifications without authorization.',
      claims: 'Breach of contract, wrongful termination, unjust enrichment, and unauthorized use of proprietary construction plans.',
      damages: '$58,000 unpaid work completed, $14,000 in lost profit on the remaining 15% of the contract, $5,000 for unauthorized use of construction plans. Total: $77,000.',
      settlementAmount: '$65,000 — Nguyen Construction is willing to accept this amount to resolve all claims and avoid further litigation costs.',
      additionalInfo: 'We are open to a structured payment plan if Apex cannot pay the full amount immediately. We believe mediation can resolve this efficiently as the core facts are not in dispute.',
    },
  },
  {
    id: 'dt-discovery-letter',
    name: 'Discovery letter in business dispute',
    disputeType: 'business',
    documentType: 'discovery_letter',
    caseDetails: {
      caseName: 'TechForward Inc. v. DataSync Solutions',
      caseNumber: '2025-CV-12445',
      court: 'Santa Clara County Superior Court',
      yourName: 'TechForward Inc.',
      opposingParty: 'DataSync Solutions',
      disputeType: 'Trade Secret Misappropriation',
      state: 'California',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'DataSync Solutions',
      recipientTitle: 'Legal Department',
      subject: 'First Set of Discovery Requests — TechForward Inc. v. DataSync Solutions',
      facts: 'TechForward Inc. alleges that DataSync Solutions hired three former TechForward engineers (James Liu, Sarah Miller, and Raj Patel) between June and August 2025, and that these individuals brought proprietary source code, customer lists, and product roadmap documents to DataSync. DataSync launched a competing product, "SyncPro," in November 2025 that bears substantial similarity to TechForward\'s "FlowSync" platform. We need to examine communications, employment records, and technical documents to establish the scope of misappropriation.',
      claims: 'Violation of California Uniform Trade Secrets Act (Cal. Civ. Code § 3426). Breach of employee non-disclosure agreements.',
      additionalInfo: 'We are requesting document production within 30 days pursuant to California Code of Civil Procedure § 2031.030. This is our first set of requests. We anticipate follow-up interrogatories based on the documents produced.',
      timeline: 'June-Aug 2025: Three engineers departed TechForward and joined DataSync. Nov 2025: DataSync launched SyncPro. Dec 2025: TechForward filed suit. Feb 2026: Case at issue. March 2026: Discovery commences.',
    },
  },
  {
    id: 'dt-case-narrative',
    name: 'Case narrative for landlord tenant dispute',
    disputeType: 'landlord_tenant',
    documentType: 'case_narrative',
    caseDetails: {
      caseName: 'Taylor v. Metro Living Apartments',
      caseNumber: '2026-LT-00445',
      court: 'Philadelphia Municipal Court',
      yourName: 'Andre Taylor',
      opposingParty: 'Metro Living Apartments LLC',
      disputeType: 'Illegal Lockout and Constructive Eviction',
      state: 'Pennsylvania',
      role: 'plaintiff',
    },
    documentDetails: {
      recipientName: 'Judge Patricia Morgan',
      recipientTitle: 'Philadelphia Municipal Court',
      subject: 'Case Narrative — Taylor v. Metro Living Apartments',
      facts: 'I have been a tenant at 450 South Street, Unit 8D, Philadelphia, PA 19147 since April 2024, paying $1,400/month rent. On February 1, 2026, I withheld rent after the landlord failed to repair a broken front door lock (reported November 2025), a non-functioning bathroom exhaust fan causing mold (reported December 2025), and intermittent loss of hot water throughout January 2026. On February 15, 2026, I returned home from work to find my locks changed. My personal belongings, including furniture, clothing, and electronics, were placed in the building\'s basement. The landlord\'s maintenance staff told me the property manager ordered the lockout. I called the police, who documented the situation (Incident Report #PPD-2026-11234) but said it was a civil matter. I stayed with a friend for 3 nights before obtaining an emergency court order restoring my access on February 18, 2026.',
      claims: 'Illegal lockout in violation of Pennsylvania Landlord and Tenant Act 68 P.S. § 250.505a. Constructive eviction. Breach of implied warranty of habitability.',
      damages: '$200 hotel/temporary housing costs, $350 in damaged personal property found in the basement, $1,400 rent abatement for February (unit was uninhabitable), $2,000 statutory damages for illegal lockout. Total: $3,950.',
      timeline: 'Nov 2025: Reported broken door lock. Dec 2025: Reported mold/exhaust issue. Jan 2026: Hot water failures. Feb 1: Withheld rent. Feb 15: Locks changed, belongings moved. Feb 15: Police report filed. Feb 18: Emergency court order, access restored. March 2026: Filed this action.',
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
  ...personalInjury,
  ...contractDisputes,
  ...propertyDisputes,
  ...realEstate,
  ...businessDisputes,
  ...familyDisputes,
  ...debtCollection,
  ...otherDisputes,
  ...variedDocumentTypes,
]
