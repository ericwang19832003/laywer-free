export interface StepGuidance {
  why: string
  checklist: string[]
  tip?: string
}

export const STEP_GUIDANCE: Record<string, StepGuidance> = {
  // --- Shared / Civil ---
  welcome: {
    why: 'This introduction helps you understand how the process works and what to expect at each stage.',
    checklist: [
      'A few minutes of uninterrupted time',
      'Basic details about your situation',
    ],
  },
  intake: {
    why: 'The details you provide here shape every document and deadline in your case. Accuracy matters.',
    checklist: [
      'County where the case will be filed',
      'Names of the parties involved',
      'Brief description of what happened',
    ],
    tip: 'You can update these details later if something changes.',
  },
  evidence_vault: {
    why: 'Well-organized evidence strengthens your case at every stage — from demand letters to trial.',
    checklist: [
      'Photos, screenshots, or documents related to your case',
      'Receipts or invoices showing damages',
      'Any written communication with the other party',
    ],
    tip: 'Upload what you have now. You can always add more later.',
  },
  preservation_letter: {
    why: 'This letter puts the other side on notice to keep relevant evidence. Sending it early protects your ability to obtain proof later.',
    checklist: [
      'Name and address of the opposing party',
      'Description of the evidence you want preserved',
    ],
    tip: 'Even if you\'re not sure you\'ll go to court, sending this letter is a smart precaution.',
  },
  prepare_filing: {
    why: 'Your initial court filing establishes your legal claims. Getting the format right is essential for the court to accept it.',
    checklist: [
      'Completed intake information',
      'Evidence organized in the vault',
      'Filing fee amount for your county',
    ],
  },
  file_with_court: {
    why: 'Submitting your filing officially starts your case. This step tracks what you need at the courthouse or online.',
    checklist: [
      'Your prepared petition or filing document',
      'Payment method for filing fees',
      'Government-issued ID',
    ],
  },
  upload_return_of_service: {
    why: 'Proof of service shows the court that the other party was properly notified. Without it, your case cannot move forward.',
    checklist: [
      'The signed return of service document',
      'Date the other party was served',
    ],
  },
  confirm_service_facts: {
    why: 'Confirming service details lets us calculate your critical deadlines accurately.',
    checklist: [
      'Exact date of service',
      'Method used (personal, substituted, etc.)',
    ],
  },
  wait_for_answer: {
    why: 'After service, the other side has a set number of days to respond. This step tracks that window.',
    checklist: [
      'Monitor your court\'s online docket if available',
      'Check your mailbox for any court notices',
    ],
  },
  check_docket_for_answer: {
    why: 'Whether the other side responded determines your next path — default judgment or discovery.',
    checklist: [
      'Access to the court\'s online docket system',
      'Your case number',
    ],
  },
  default_packet_prep: {
    why: 'If the other side didn\'t respond in time, you may be able to win by default. This packet asks the court to enter judgment.',
    checklist: [
      'Proof of service document',
      'Your original filed petition',
      'Evidence of damages',
    ],
  },
  upload_answer: {
    why: 'Uploading the answer lets us analyze their defenses so you can plan your response strategy.',
    checklist: [
      'The defendant\'s filed answer document (PDF)',
    ],
  },
  discovery_starter_pack: {
    why: 'Discovery is how you legally request information from the other side. This gives you standard requests for your case type.',
    checklist: [
      'Review your evidence vault for gaps',
      'List of questions you want answered',
    ],
  },
  rule_26f_prep: {
    why: 'Rule 26(f) requires both sides to meet and plan for discovery before the court conference. Being prepared shows the judge you are organized.',
    checklist: [
      'List of proposed discovery topics',
      'Your calendar for scheduling deadlines',
      'Any preservation concerns to raise',
    ],
  },
  mandatory_disclosures: {
    why: 'Federal rules require you to disclose key witnesses and documents early, even without being asked. Missing this deadline can limit your evidence at trial.',
    checklist: [
      'Names and contact info of witnesses',
      'Documents supporting your claims or defenses',
      'Computation of damages with supporting materials',
    ],
  },

  // --- Personal Injury ---
  pi_intake: {
    why: 'Injury case details shape your entire strategy — from medical documentation to calculating damages.',
    checklist: [
      'Date and location of the incident',
      'Other party\'s name and insurance info',
      'Your insurance policy number',
      'Police report number (if applicable)',
    ],
    tip: 'Don\'t worry if you don\'t have everything yet — you can update details later.',
  },
  pi_medical_records: {
    why: 'Medical records are the foundation of your injury claim. They document what happened and connect your injuries to the incident.',
    checklist: [
      'Names and addresses of treating doctors',
      'Hospital or ER visit records',
      'Medical bills and receipts',
      'Prescription records',
    ],
  },
  pi_insurance_communication: {
    why: 'How you communicate with insurance companies can significantly impact your claim. Being prepared helps protect your interests.',
    checklist: [
      'Your claim number (if you have one)',
      'Insurance adjuster\'s name and contact info',
      'Notes from any prior conversations',
    ],
    tip: 'Keep a record of every interaction with the insurance company.',
  },
  prepare_pi_demand_letter: {
    why: 'A demand letter formally requests compensation and often leads to settlement without going to court.',
    checklist: [
      'Complete medical records and bills',
      'Documentation of lost wages',
      'Evidence of property damage',
      'Photos of injuries',
    ],
  },
  pi_settlement_negotiation: {
    why: 'Most personal injury cases settle before trial. Knowing your case value and negotiation range gives you leverage.',
    checklist: [
      'Total medical expenses to date',
      'Lost wages documentation',
      'Your minimum acceptable settlement amount',
    ],
  },
  prepare_pi_petition: {
    why: 'If settlement talks fail, filing a lawsuit preserves your right to recover damages through the court.',
    checklist: [
      'All evidence from your vault',
      'Completed demand letter (if sent)',
      'Filing fee for your county',
    ],
  },
  pi_file_with_court: {
    why: 'Filing officially starts your lawsuit and sets legal deadlines in motion.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  pi_serve_defendant: {
    why: 'The defendant must be formally notified of the lawsuit. Proper service is required before the case can proceed.',
    checklist: [
      'Defendant\'s address for service',
      'Budget for process server or constable',
    ],
  },
  pi_wait_for_answer: {
    why: 'The defendant has a limited time to respond after being served. This waiting period is normal.',
    checklist: [
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  pi_review_answer: {
    why: 'Understanding the defendant\'s response helps you identify their strategy and prepare your counterarguments.',
    checklist: [
      'The defendant\'s filed answer',
      'Note any counterclaims or defenses raised',
    ],
  },
  pi_discovery_prep: {
    why: 'Discovery lets you formally request evidence from the other side. Well-crafted requests strengthen your position.',
    checklist: [
      'List of facts you need to prove',
      'Documents you want from the defendant',
      'Questions about the incident',
    ],
  },
  pi_discovery_responses: {
    why: 'You must respond to the defendant\'s discovery requests within the deadline. Timely, complete responses prevent court sanctions.',
    checklist: [
      'The discovery requests you received',
      'Documents requested by the other side',
    ],
  },
  pi_scheduling_conference: {
    why: 'The scheduling conference sets the timeline for your entire case — discovery cutoffs, motion deadlines, and trial date.',
    checklist: [
      'Your calendar for the next 6-12 months',
      'Any scheduling conflicts',
    ],
  },
  pi_pretrial_motions: {
    why: 'Pre-trial motions can narrow the issues, exclude evidence, or even resolve parts of the case before trial.',
    checklist: [
      'Review all discovery responses received',
      'Identify weak points in the opposing case',
    ],
  },
  pi_mediation: {
    why: 'Mediation is a chance to resolve the case with a neutral third party. Many cases settle at this stage.',
    checklist: [
      'Your settlement range (minimum to ideal)',
      'Summary of your strongest evidence',
      'All medical documentation and bills',
    ],
  },
  pi_trial_prep: {
    why: 'Thorough trial preparation is critical. Organized exhibits, clear witness testimony, and a strong narrative win cases.',
    checklist: [
      'Exhibit list organized and labeled',
      'Witness list with contact information',
      'Opening statement outline',
    ],
  },
  pi_post_resolution: {
    why: 'After your case resolves, there are important follow-up steps to ensure you receive and manage your recovery.',
    checklist: [
      'Settlement agreement or court order',
      'List of medical liens to satisfy',
    ],
  },

  // --- Personal Injury: Property Damage Variants ---
  pi_intake_property: {
    why: 'Property damage details shape your entire strategy — from documenting the damage to calculating your claim value.',
    checklist: [
      'Date and location of the incident',
      'Other party\'s name and insurance info',
      'Your insurance policy number',
      'Police report number (if applicable)',
    ],
    tip: 'Don\'t worry if you don\'t have everything yet — you can update details later.',
  },
  pi_medical_records_property: {
    why: 'Thorough damage documentation is the foundation of your property damage claim. Photos, estimates, and receipts prove your losses.',
    checklist: [
      'Photos of the damage from multiple angles',
      'Professional repair estimates',
      'Receipts for any repairs already made',
      'Pre-damage condition records or photos',
    ],
  },
  pi_insurance_communication_property: {
    why: 'How you communicate with insurance companies can significantly impact your claim. Being prepared helps protect your interests.',
    checklist: [
      'Your claim number (if you have one)',
      'Insurance adjuster\'s name and contact info',
      'Notes from any prior conversations',
    ],
    tip: 'Never agree to a settlement before you have complete repair estimates.',
  },
  prepare_pi_demand_letter_property: {
    why: 'A demand letter formally requests compensation and often leads to settlement without going to court.',
    checklist: [
      'Complete damage documentation and photos',
      'Professional repair or replacement estimates',
      'Evidence of loss of use costs',
      'Receipts for all related expenses',
    ],
  },
  pi_settlement_negotiation_property: {
    why: 'Most property damage cases settle before trial. Knowing your property\'s value and repair costs gives you leverage.',
    checklist: [
      'Total repair or replacement costs',
      'Loss of use documentation',
      'Your minimum acceptable settlement amount',
    ],
  },
  prepare_pi_petition_property: {
    why: 'If settlement talks fail, filing a lawsuit preserves your right to recover damages through the court.',
    checklist: [
      'All evidence from your vault',
      'Completed demand letter (if sent)',
      'Filing fee for your county',
    ],
  },
  pi_post_resolution_property: {
    why: 'After your case resolves, there are important follow-up steps to ensure you receive your compensation and complete any remaining repairs.',
    checklist: [
      'Settlement agreement or court order',
      'Outstanding repair or replacement invoices',
    ],
  },

  // --- Contract ---
  contract_intake: {
    why: 'Contract details — the parties, terms, and breach — form the foundation of your legal claim.',
    checklist: [
      'A copy of the contract (written or summary of oral terms)',
      'Names of all parties involved',
      'Description of what the other party failed to do',
      'Amount of damages you\'re claiming',
    ],
    tip: 'Even if you don\'t have a written contract, oral agreements can be enforceable.',
  },
  contract_demand_letter: {
    why: 'A demand letter formally notifies the other party and often resolves disputes without court involvement.',
    checklist: [
      'Other party\'s name and mailing address',
      'Specific contract terms that were breached',
      'Amount you\'re demanding',
      'Deadline for response (typically 30 days)',
    ],
  },
  contract_negotiation: {
    why: 'Many contract disputes settle through negotiation. Understanding your leverage helps you reach a fair resolution.',
    checklist: [
      'Your minimum acceptable settlement amount',
      'Evidence of the breach and your damages',
      'Any prior communications about the dispute',
    ],
  },
  contract_prepare_filing: {
    why: 'Your petition establishes your legal claims in court. Getting the format and content right is essential.',
    checklist: [
      'Completed demand letter (if sent)',
      'All evidence from your vault',
      'Filing fee for your county',
    ],
  },
  contract_file_with_court: {
    why: 'Filing officially starts your lawsuit. This step guides you through the filing process.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  contract_serve_defendant: {
    why: 'The defendant must be formally notified of the lawsuit before the case can proceed.',
    checklist: [
      'Defendant\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  contract_wait_for_answer: {
    why: 'After service, the defendant has a set number of days to respond. This waiting period is normal.',
    checklist: [
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  contract_review_answer: {
    why: 'Understanding the defendant\'s response helps you identify their defenses and plan your strategy.',
    checklist: [
      'The defendant\'s filed answer',
      'Note any counterclaims or affirmative defenses',
    ],
  },
  contract_discovery: {
    why: 'Discovery lets you formally request evidence from the other side to strengthen your position.',
    checklist: [
      'List of documents you want from the defendant',
      'Questions about the contract and breach',
      'Financial records related to damages',
    ],
  },
  contract_mediation: {
    why: 'Mediation with a neutral third party can resolve your dispute faster and cheaper than going to trial.',
    checklist: [
      'Your settlement range (minimum to ideal)',
      'Summary of your strongest evidence',
      'All financial documentation of damages',
    ],
  },
  contract_post_resolution: {
    why: 'After your case resolves, there are steps to collect payment or enforce the judgment.',
    checklist: [
      'Settlement agreement or court order',
      'Payment timeline and method',
    ],
  },

  // --- Property Dispute ---
  property_intake: {
    why: 'Property dispute details — location, parties, and the nature of the dispute — shape your legal strategy.',
    checklist: [
      'Property address',
      'Other party\'s name and relationship (neighbor, seller, HOA, etc.)',
      'Description of the dispute',
      'Any surveys, deeds, or title documents',
    ],
    tip: 'Photos and documentation of the property issue are especially valuable.',
  },
  property_demand_letter: {
    why: 'A demand letter formally notifies the other party and establishes a record of your attempt to resolve the issue.',
    checklist: [
      'Other party\'s name and address',
      'Specific property right being violated',
      'What you want them to do (stop, pay, fix)',
      'Deadline for response',
    ],
  },
  property_negotiation: {
    why: 'Property disputes often benefit from negotiation, especially between neighbors or in real estate transactions.',
    checklist: [
      'Your ideal resolution',
      'Evidence supporting your position (surveys, photos, deeds)',
      'Any prior communications about the issue',
    ],
  },
  property_prepare_filing: {
    why: 'Your court filing establishes your property rights claims. Getting the legal basis right is essential.',
    checklist: [
      'Property deed or title documents',
      'Survey (if applicable)',
      'Evidence from your vault',
      'Filing fee for your county',
    ],
  },
  property_file_with_court: {
    why: 'Filing officially starts your lawsuit to protect your property rights.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  property_serve_defendant: {
    why: 'The other party must be formally notified of the lawsuit before the case can proceed.',
    checklist: [
      'Other party\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  property_wait_for_answer: {
    why: 'After service, the other party has a set number of days to respond.',
    checklist: [
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  property_review_answer: {
    why: 'Understanding the other party\'s response reveals their legal position and any counterclaims.',
    checklist: [
      'The defendant\'s filed answer',
      'Note any counterclaims about property rights',
    ],
  },
  property_discovery: {
    why: 'Discovery in property cases often involves surveys, appraisals, and title searches.',
    checklist: [
      'Documents you want from the other party',
      'Whether you need a professional survey or appraisal',
      'Title search records',
    ],
  },
  property_post_resolution: {
    why: 'After resolution, you may need to record the judgment or take steps to enforce property rights.',
    checklist: [
      'Court order or settlement agreement',
      'Recording requirements at the county clerk',
    ],
  },

  // --- Other ---
  other_intake: {
    why: 'Understanding your situation helps us guide you through the right legal process.',
    checklist: [
      'Names of the parties involved',
      'Description of what happened',
      'What outcome you\'re seeking',
      'Any deadlines you\'re aware of',
    ],
    tip: 'Even if your situation feels unique, the legal process follows the same basic steps.',
  },
  other_demand_letter: {
    why: 'A demand letter formally requests resolution and creates a record of your attempt to settle before court.',
    checklist: [
      'Other party\'s name and address',
      'Clear description of your complaint',
      'What you want (compensation, action, or both)',
      'Deadline for response',
    ],
  },
  other_prepare_filing: {
    why: 'Your court filing establishes your legal claims. Getting the content right helps the court understand your case.',
    checklist: [
      'All evidence from your vault',
      'Demand letter (if sent)',
      'Filing fee for your county',
    ],
  },
  other_file_with_court: {
    why: 'Filing officially starts your case with the court.',
    checklist: [
      'Prepared petition document',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  other_serve_defendant: {
    why: 'The other party must receive formal notice of the lawsuit before the case can move forward.',
    checklist: [
      'Other party\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  other_wait_for_answer: {
    why: 'After service, the other party has a set number of days to respond.',
    checklist: [
      'Monitor the court docket',
      'Watch for court mail',
    ],
  },
  other_review_answer: {
    why: 'The other party\'s response reveals their defenses and any counterclaims.',
    checklist: [
      'The filed answer document',
      'Note any counterclaims or defenses',
    ],
  },
  other_discovery: {
    why: 'Discovery lets you formally obtain evidence and information from the other side.',
    checklist: [
      'List of documents you need',
      'Questions for the other party',
    ],
  },
  other_post_resolution: {
    why: 'After your case resolves, there may be steps to enforce the judgment or finalize the outcome.',
    checklist: [
      'Court order or settlement agreement',
      'Payment or compliance deadlines',
    ],
  },

  // --- Small Claims ---
  small_claims_intake: {
    why: 'These details determine your filing court, fees, and whether your claim fits within the small claims limit.',
    checklist: [
      'Amount you\'re claiming (must be within limit)',
      'Defendant\'s name and address',
      'Description of what happened',
    ],
  },
  prepare_demand_letter: {
    why: 'Many disputes resolve after a formal demand letter. It shows you\'re serious and gives the other side a chance to settle.',
    checklist: [
      'Amount you\'re demanding',
      'Evidence supporting your claim',
      'Defendant\'s mailing address',
    ],
  },
  prepare_small_claims_filing: {
    why: 'Small claims court has simplified forms, but filling them out correctly is still important for your case to be accepted.',
    checklist: [
      'Defendant\'s full legal name and address',
      'Exact amount of your claim',
      'Brief description of the dispute',
    ],
  },
  serve_defendant: {
    why: 'The defendant must receive formal notice of your claim. The court requires proof this was done correctly.',
    checklist: [
      'Defendant\'s address for service',
      'Budget for certified mail or process server',
    ],
  },
  prepare_for_hearing: {
    why: 'Small claims hearings are brief — usually 15-30 minutes. Being prepared and organized makes a strong impression on the judge.',
    checklist: [
      'All evidence organized in order',
      'Brief timeline of events written out',
      'Copies of everything for the judge and defendant',
    ],
    tip: 'Practice explaining your case in under 5 minutes.',
  },
  hearing_day: {
    why: 'This is your day in court. Arriving prepared, on time, and organized is the best thing you can do.',
    checklist: [
      'All exhibits and copies',
      'Government-issued ID',
      'Arrive 15-30 minutes early',
    ],
  },

  // --- Landlord-Tenant ---
  landlord_tenant_intake: {
    why: 'Landlord-tenant disputes have specific rules depending on your situation. These details help us guide you correctly.',
    checklist: [
      'Your lease or rental agreement',
      'Landlord or property manager\'s name and address',
      'Description of the issue',
    ],
    tip: 'Take photos and video of the property condition now — this evidence is time-sensitive.',
  },
  prepare_lt_demand_letter: {
    why: 'Many landlord-tenant issues require a written demand before you can take legal action. This letter starts that clock.',
    checklist: [
      'Specific amount owed or issue to be fixed',
      'Landlord\'s mailing address',
      'Copies of relevant lease provisions',
    ],
    tip: 'Send the letter by certified mail with return receipt — this creates proof of delivery.',
  },
  lt_negotiation: {
    why: 'Settling a landlord-tenant dispute without court saves time, money, and preserves the relationship if needed.',
    checklist: [
      'Copy of your demand letter and proof of delivery',
      'Documentation of damages or issues',
      'Your minimum acceptable settlement terms',
      'Any response from the other party',
    ],
  },
  prepare_landlord_tenant_filing: {
    why: 'Your court filing must include the right claims and follow local rules for landlord-tenant cases.',
    checklist: [
      'Completed demand letter (or proof it was sent)',
      'Lease agreement',
      'Evidence of the issue (photos, communications)',
    ],
    tip: 'JP courts handle claims up to $20,000. For larger amounts, file in county or district court.',
  },
  lt_file_with_court: {
    why: 'Filing officially starts your landlord-tenant case. JP and district courts have different procedures.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Copy of the lease agreement',
      'Proof that demand letter was sent',
    ],
  },
  serve_other_party: {
    why: 'The other party must be formally notified. Landlord-tenant cases often have specific service requirements.',
    checklist: [
      'Other party\'s address for service',
      'Correct service method for your court',
    ],
    tip: 'For contested cases, consider using a process server instead of certified mail for more reliable service.',
  },
  lt_wait_for_response: {
    why: 'After being served, the other party has a limited number of days to file a response. Tracking this deadline is critical.',
    checklist: [
      'Calendar the answer deadline based on the service date',
      'Check the court docket regularly for filings',
      'Watch your mailbox for court notices',
    ],
  },
  lt_review_response: {
    why: 'Understanding the other party\'s defenses and any counterclaims shapes your hearing strategy.',
    checklist: [
      'The other party\'s filed answer or response',
      'List of claims they admitted vs. denied',
      'Note any counterclaims or affirmative defenses',
    ],
  },
  lt_discovery: {
    why: 'District court landlord-tenant cases may involve formal discovery. This lets you request evidence from the other side.',
    checklist: [
      'List of documents you want from the other party',
      'Interrogatories (written questions) to send',
      'Whether depositions are needed',
    ],
  },
  lt_prepare_for_hearing: {
    why: 'Landlord-tenant hearings focus on lease terms, property condition, and compliance. Being organized wins cases.',
    checklist: [
      'Lease agreement with key terms highlighted',
      'Photos and videos of property condition',
      'Rent payment records and receipts',
      'Timeline of events written out',
      'Three copies of everything (you, judge, other party)',
    ],
  },
  lt_mediation: {
    why: 'Courts often prefer mediated settlements for landlord-tenant disputes. Mediation can resolve issues faster than a full hearing.',
    checklist: [
      'Your settlement authority (what you can agree to)',
      'Your bottom line and ideal outcome',
      'Key lease terms and evidence summary',
    ],
  },
  lt_hearing_day: {
    why: 'This is your day in court for your landlord-tenant case. Preparation and composure make the strongest impression.',
    checklist: [
      'All exhibits organized and labeled',
      'Government-issued ID',
      'Arrive 30 minutes early',
      'Copies for the judge and other party',
    ],
  },
  lt_post_judgment: {
    why: 'Landlord-tenant judgments have unique enforcement options including writs of possession and specific appeal timelines.',
    checklist: [
      'Copy of the court\'s judgment or order',
      'Compliance deadlines noted on your calendar',
      'Appeal deadline (5 days for evictions, 21 days for money judgments)',
    ],
  },

  // --- Debt Defense ---
  debt_defense_intake: {
    why: 'Understanding the debt claim against you is the first step to building your defense.',
    checklist: [
      'The lawsuit papers you received',
      'Any debt collection letters',
      'Original credit agreement (if you have it)',
    ],
    tip: 'Even if you owe the debt, there may be valid defenses available to you.',
  },
  prepare_debt_validation_letter: {
    why: 'Debt collectors must prove the debt is valid and that they have the right to collect. This letter forces them to show their proof.',
    checklist: [
      'Creditor\'s name and address',
      'Account number from the collection notice',
    ],
  },
  prepare_debt_defense_answer: {
    why: 'Filing an answer prevents a default judgment against you and preserves all your defenses.',
    checklist: [
      'The plaintiff\'s petition or complaint',
      'Any validation response you received',
      'Deadline for filing your answer',
    ],
  },
  debt_file_with_court: {
    why: 'Filing your answer on time is critical. Missing the deadline can result in an automatic judgment against you.',
    checklist: [
      'Your prepared answer document',
      'Filing fee (or fee waiver application)',
    ],
  },
  serve_plaintiff: {
    why: 'The plaintiff\'s attorney must receive a copy of your answer. This is required by court rules.',
    checklist: [
      'Plaintiff\'s attorney name and address',
      'Certificate of service form',
    ],
  },
  debt_hearing_prep: {
    why: 'Preparation is your biggest advantage. Knowing the plaintiff\'s weak points helps you challenge their case effectively.',
    checklist: [
      'All documents received from the plaintiff',
      'Your validation letter and any response',
      'Timeline of the debt',
    ],
  },
  debt_hearing_day: {
    why: 'This is your chance to present your defense. Being organized and calm makes a strong impression.',
    checklist: [
      'All exhibits and copies',
      'Government-issued ID',
      'Arrive 15-30 minutes early',
    ],
  },
  debt_post_judgment: {
    why: 'After the ruling, you may need to act quickly — whether it\'s appealing, negotiating payment, or enforcing a win.',
    checklist: [
      'Copy of the court\'s judgment',
      'Note the appeal deadline',
    ],
  },

  // --- Family ---
  family_intake: {
    why: 'Family law cases involve unique considerations. These details help us tailor the process to your specific situation.',
    checklist: [
      'Marriage date and separation date',
      'Names and ages of any children',
      'General overview of property and debts',
    ],
  },
  safety_screening: {
    why: 'Your safety comes first. This screening helps us identify if any protective measures are needed.',
    checklist: [
      'A private, safe space to answer honestly',
    ],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  prepare_family_filing: {
    why: 'Family court filings have specific requirements. Getting the paperwork right avoids delays and additional fees.',
    checklist: [
      'Financial information (income, debts, assets)',
      'Children\'s information (if applicable)',
      'Filing fee or fee waiver application',
    ],
  },
  waiting_period: {
    why: 'Many family law cases have a mandatory waiting period before the court can finalize orders.',
    checklist: [
      'Mark the waiting period end date on your calendar',
      'Use this time to gather any remaining documents',
    ],
  },
  temporary_orders: {
    why: 'Temporary orders set the rules while your case is pending — custody, support, property use.',
    checklist: [
      'Current living and custody arrangements',
      'Monthly income and expenses',
      'Immediate concerns that need court attention',
    ],
  },
  mediation: {
    why: 'Mediation helps both sides reach agreement with a neutral third party. Courts often require it before trial.',
    checklist: [
      'Your ideal outcome for each issue',
      'Your minimum acceptable terms',
      'All relevant financial documents',
    ],
  },
  final_orders: {
    why: 'Final orders are the court\'s binding decisions on all issues in your case.',
    checklist: [
      'Review all temporary orders',
      'List of unresolved issues',
      'Proposed final terms',
    ],
  },
}
