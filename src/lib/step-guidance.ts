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

  // --- Real Estate ---
  re_intake: {
    why: 'Property details, transaction timeline, and the nature of the dispute form the foundation of your real estate claim.',
    checklist: [
      'Purchase agreement or contract',
      'Property address and description',
      'Other party\'s name and role (buyer, seller, agent, etc.)',
      'Timeline of key events',
      'Amount of damages you\'re claiming',
    ],
    tip: 'Gather your closing documents and any correspondence with agents or title companies.',
  },
  re_evidence_vault: {
    why: 'Real estate disputes are document-heavy — organized evidence strengthens your position significantly.',
    checklist: [
      'Purchase agreement or contract',
      'Title report or title insurance policy',
      'Inspection report',
      'Closing documents (HUD-1 or settlement statement)',
      'Communications with other party or agents',
    ],
  },
  re_demand_letter: {
    why: 'A formal demand letter puts the other party on notice and often resolves real estate disputes without court.',
    checklist: [
      'Clear description of the breach or issue',
      'Specific dollar amount of damages',
      'Deadline to respond (typically 30 days)',
      'Copies of key supporting documents',
    ],
  },
  re_negotiation: {
    why: 'Many real estate disputes settle through negotiation, saving time and court costs.',
    checklist: [
      'Your minimum acceptable outcome',
      'Key evidence to reference',
      'Written record of all offers',
      'Timeline for resolution',
    ],
  },
  re_prepare_filing: {
    why: 'Filing requires specific forms and accurate information about the property and dispute.',
    checklist: [
      'Completed petition with property details',
      'Filing fee or fee waiver application',
      'Legal description of the property',
      'Correct court jurisdiction',
    ],
  },
  re_file_with_court: {
    why: 'Filing officially starts your lawsuit and establishes your claim timeline.',
    checklist: [
      'Completed petition and copies',
      'Filing fee payment',
      'Government-issued ID',
    ],
  },
  re_serve_defendant: {
    why: 'The defendant must be properly served for the court to have jurisdiction.',
    checklist: [
      'Certified copy of the petition',
      'Process server or constable contact',
      'Defendant\'s address for service',
    ],
  },
  re_wait_for_answer: {
    why: 'After service, the defendant typically has 20 days (Texas) to file an answer.',
    checklist: [
      'Service date and deadline calculation',
      'Monitor the court docket for filings',
      'Watch for mail from the court',
    ],
  },
  re_review_answer: {
    why: 'Understanding the defendant\'s response helps you prepare your strategy.',
    checklist: [
      'Read all claims and defenses',
      'Identify disputed vs. admitted facts',
      'Note any counterclaims against you',
    ],
  },
  re_discovery: {
    why: 'Discovery lets you request documents and information from the other party.',
    checklist: [
      'Written interrogatories (questions)',
      'Requests for production of documents',
      'Requests for admissions',
      'Responses to their discovery requests',
    ],
  },
  re_post_resolution: {
    why: 'After resolution, there may be steps to enforce a judgment or complete a transaction.',
    checklist: [
      'Record any judgment with the county',
      'Follow up on payment deadlines',
      'Update title records if needed',
      'Keep copies of all final documents',
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
  sc_demand_letter: {
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
  sc_evidence_vault: {
    why: 'Organized evidence is the foundation of a strong small claims case. Judges appreciate clear, well-organized documentation.',
    checklist: [
      'Receipts or invoices showing the amount owed',
      'Written contracts or agreements',
      'Photos or videos of damage',
      'Text messages, emails, or letters with the other party',
      'Witness contact information',
    ],
    tip: 'Upload what you have now. You can always add more later.',
  },
  sc_serve_defendant: {
    why: 'The defendant must receive formal notice of your claim. The court requires proof this was done correctly.',
    checklist: [
      'Defendant\'s address for service',
      'Budget for certified mail or process server',
    ],
  },
  sc_file_with_court: {
    why: 'Small claims court has simplified filing, but filing in the right court with the correct forms is essential for your case to proceed.',
    checklist: [
      'Completed small claims petition',
      'Filing fee ready (typically $35-$100)',
      'Defendant\'s full name and address',
    ],
    tip: 'File in the Justice of the Peace court where the defendant lives or where the issue occurred. Claims up to $20,000.',
  },
  sc_prepare_for_hearing: {
    why: 'Small claims hearings are brief — usually 15-30 minutes. Being prepared and organized makes a strong impression on the judge.',
    checklist: [
      'All evidence organized in order',
      'Brief timeline of events written out',
      'Copies of everything for the judge and defendant',
    ],
    tip: 'Practice explaining your case in under 5 minutes.',
  },
  sc_hearing_day: {
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

  // --- Family: Divorce ---
  divorce_intake: {
    why: 'Divorce details — marriage dates, children, property — shape every document and deadline in your case.',
    checklist: [
      'Marriage date and separation date',
      'Whether you have children together',
      'General overview of community property and debts',
      'County where you or your spouse has lived for at least 90 days',
    ],
    tip: 'Texas requires 6 months of state residency and 90 days of county residency before filing.',
  },
  divorce_safety_screening: {
    why: 'Your safety comes first. This screening helps identify if protective measures are needed.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  divorce_evidence_vault: {
    why: 'Organized evidence strengthens your case at every stage — from temporary orders to final decree.',
    checklist: [
      'Financial documents (tax returns, bank statements, pay stubs)',
      'Property records (deeds, titles, appraisals)',
      'Photos and communications relevant to the case',
    ],
    tip: 'Upload what you have now. You can always add more later.',
  },
  divorce_prepare_filing: {
    why: 'Your divorce petition establishes your claims. Getting the paperwork right avoids delays.',
    checklist: [
      'Financial information (income, debts, assets)',
      'Children\'s information (if applicable)',
      'Filing fee or fee waiver application',
    ],
  },
  divorce_file_with_court: {
    why: 'Filing officially starts your divorce case and sets legal deadlines in motion.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  divorce_serve_respondent: {
    why: 'Your spouse must be formally notified of the divorce filing before the case can proceed.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or constable',
    ],
    tip: 'If your spouse will sign a waiver of service, that can save time and money.',
  },
  divorce_waiting_period: {
    why: 'Texas requires a 60-day waiting period from filing before the court can finalize a divorce.',
    checklist: [
      'Mark the 60-day end date on your calendar',
      'Use this time to gather financial documents and prepare',
    ],
  },
  divorce_temporary_orders: {
    why: 'Temporary orders set the rules while your divorce is pending — custody, support, property use.',
    checklist: [
      'Current living and custody arrangements',
      'Monthly income and expenses',
      'Immediate concerns that need court attention',
    ],
  },
  divorce_mediation: {
    why: 'Mediation helps both sides reach agreement with a neutral third party. Courts often require it.',
    checklist: [
      'Your ideal outcome for each issue',
      'Your minimum acceptable terms',
      'All relevant financial documents',
    ],
  },
  divorce_property_division: {
    why: 'Texas is a community property state. This step helps you inventory and value marital assets and debts.',
    checklist: [
      'List of all community property (real estate, vehicles, accounts)',
      'List of separate property with proof of separate character',
      'Debt inventory with account balances',
      'Appraisals or valuations of major assets',
    ],
    tip: 'Property acquired during marriage is presumed community property. You must prove separate property with clear and convincing evidence.',
  },
  divorce_final_orders: {
    why: 'The final decree is the court\'s binding decision on property, custody, and support.',
    checklist: [
      'Proposed final decree prepared',
      'All financial documents gathered',
      'Hearing date scheduled (if needed)',
    ],
  },

  // --- Family: Custody ---
  custody_intake: {
    why: 'Custody details — children\'s ages, current arrangements, existing orders — shape your legal strategy.',
    checklist: [
      'Number and ages of children',
      'Current living arrangement',
      'Whether existing court orders affect custody',
      'County where the children have lived for at least 6 months',
    ],
    tip: 'Texas uses "best interest of the child" as the primary standard for custody decisions.',
  },
  custody_safety_screening: {
    why: 'Your safety and your children\'s safety come first. This screening helps identify protective measures.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  custody_evidence_vault: {
    why: 'Custody cases rely heavily on evidence of parenting involvement, stability, and the children\'s needs.',
    checklist: [
      'School records and report cards',
      'Medical records for children',
      'Photos showing your involvement in the children\'s lives',
      'Communications about custody arrangements',
    ],
  },
  custody_prepare_filing: {
    why: 'Your custody petition (SAPCR) establishes your requests for conservatorship and possession.',
    checklist: [
      'Children\'s information (names, DOB, current arrangements)',
      'Proposed custody schedule',
      'Filing fee or fee waiver application',
    ],
  },
  custody_file_with_court: {
    why: 'Filing officially starts your custody case. Family courts handle SAPCR filings.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  custody_serve_respondent: {
    why: 'The other parent must be formally notified of the custody filing before the case can proceed.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or constable',
    ],
  },
  custody_temporary_orders: {
    why: 'Temporary custody orders protect the children while the case is pending.',
    checklist: [
      'Current custody and visitation arrangements',
      'Children\'s school and activity schedules',
      'Any immediate safety concerns',
    ],
  },
  custody_mediation: {
    why: 'Texas Family Code §153.0071 requires mediation in custody cases before trial. This is mandatory.',
    checklist: [
      'Your proposed custody schedule',
      'Children\'s needs and best interests',
      'Your minimum acceptable terms',
    ],
    tip: 'Mediation is required by Texas law in custody cases. Come prepared with a detailed proposed schedule.',
  },
  custody_final_orders: {
    why: 'The final custody order establishes conservatorship, possession schedule, and child support.',
    checklist: [
      'Proposed parenting plan / possession schedule',
      'Child support calculations',
      'Hearing date scheduled',
    ],
  },

  // --- Family: Child Support ---
  child_support_intake: {
    why: 'Child support is calculated based on income, number of children, and special needs.',
    checklist: [
      'Number of children requiring support',
      'Both parents\' employment status and income',
      'Whether an existing support order is in place',
      'Children\'s special needs (medical, educational)',
    ],
  },
  child_support_evidence_vault: {
    why: 'Income documentation is critical for child support calculations.',
    checklist: [
      'Recent pay stubs (both parents if available)',
      'Tax returns (last 2 years)',
      'Documentation of other income sources',
      'Children\'s expense records (medical, childcare, activities)',
    ],
  },
  child_support_prepare_filing: {
    why: 'Your child support petition must include income information and the proposed support amount.',
    checklist: [
      'Income documentation gathered',
      'Child support calculation worksheet',
      'Filing fee or fee waiver application',
    ],
  },
  child_support_file_with_court: {
    why: 'Filing officially starts your child support case.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  child_support_serve_respondent: {
    why: 'The other parent must be formally notified of the child support filing.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  child_support_temporary_orders: {
    why: 'Temporary child support orders ensure the children are financially supported while the case is pending.',
    checklist: [
      'Both parents\' current income documentation',
      'Children\'s monthly expenses',
      'Childcare and medical insurance costs',
    ],
  },
  child_support_final_orders: {
    why: 'The final child support order sets the ongoing support amount and wage withholding.',
    checklist: [
      'Updated income documentation',
      'Child support calculation worksheet',
      'Proposed wage withholding order',
    ],
    tip: 'Texas child support is typically 20% of net resources for one child, 25% for two, up to 40% for five or more.',
  },

  // --- Family: Visitation ---
  visitation_intake: {
    why: 'Visitation details help us craft a schedule that serves the children\'s best interests.',
    checklist: [
      'Number and ages of children',
      'Current custody arrangement',
      'Your relationship to the children (parent, grandparent, etc.)',
      'Any existing court orders',
    ],
  },
  visitation_safety_screening: {
    why: 'Your safety and your children\'s safety come first.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'Your answers are confidential and help us provide appropriate resources.',
  },
  visitation_evidence_vault: {
    why: 'Evidence of your relationship with the children and involvement in their lives strengthens your case.',
    checklist: [
      'Photos showing your relationship with the children',
      'Communications about visitation arrangements',
      'Records of your involvement (school events, activities)',
    ],
  },
  visitation_prepare_filing: {
    why: 'Your visitation petition requests a specific possession schedule.',
    checklist: [
      'Proposed visitation schedule',
      'Children\'s school and activity schedules',
      'Filing fee or fee waiver application',
    ],
  },
  visitation_file_with_court: {
    why: 'Filing officially starts your visitation case.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  visitation_serve_respondent: {
    why: 'The other party must be formally notified of the visitation filing.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  visitation_mediation: {
    why: 'Texas Family Code §153.0071 requires mediation in visitation cases before trial. This is mandatory.',
    checklist: [
      'Your proposed visitation schedule',
      'Children\'s needs and best interests',
      'Your minimum acceptable terms',
    ],
    tip: 'Mediation is required by Texas law. Come prepared with a detailed proposed schedule.',
  },
  visitation_final_orders: {
    why: 'The final visitation order establishes the possession and access schedule.',
    checklist: [
      'Proposed possession schedule',
      'Holiday and summer schedule',
      'Hearing date scheduled',
    ],
  },

  // --- Family: Spousal Support ---
  spousal_support_intake: {
    why: 'Spousal support eligibility depends on marriage duration, income disparity, and other factors.',
    checklist: [
      'Marriage date and anticipated end date',
      'Marriage duration',
      'Both spouses\' employment status and income',
      'Any disability or health concerns',
    ],
    tip: 'Texas spousal maintenance is typically limited to marriages of 10+ years, unless there are special circumstances.',
  },
  spousal_support_evidence_vault: {
    why: 'Financial documentation proves the need for (or ability to pay) spousal support.',
    checklist: [
      'Income documentation for both spouses',
      'Monthly living expenses',
      'Education and employment history',
      'Medical records (if disability is a factor)',
    ],
  },
  spousal_support_prepare_filing: {
    why: 'Your spousal support petition must demonstrate eligibility and the requested amount.',
    checklist: [
      'Income and expense documentation',
      'Marriage duration documentation',
      'Filing fee or fee waiver application',
    ],
  },
  spousal_support_file_with_court: {
    why: 'Filing officially starts your spousal support case.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
  },
  spousal_support_serve_respondent: {
    why: 'Your spouse must be formally notified of the support filing.',
    checklist: [
      'Respondent\'s address for service',
      'Budget for process server or certified mail',
    ],
  },
  spousal_support_temporary_orders: {
    why: 'Temporary spousal support ensures financial stability while the case is pending.',
    checklist: [
      'Both spouses\' current income',
      'Monthly expenses and financial needs',
      'Existing financial obligations',
    ],
  },
  spousal_support_final_orders: {
    why: 'The final support order sets the amount, duration, and terms of spousal maintenance.',
    checklist: [
      'Updated income documentation',
      'Proposed support amount and duration',
      'Hearing date scheduled',
    ],
    tip: 'Texas caps spousal maintenance at $5,000/month or 20% of the obligor\'s average monthly gross income, whichever is less.',
  },

  // --- Family: Protective Order ---
  po_intake: {
    why: 'Protective order details help us prepare your application and assess urgency.',
    checklist: [
      'Your relationship to the respondent',
      'Type of abuse or violence experienced',
      'Whether you are in immediate danger',
      'Any prior incidents or existing orders',
    ],
    tip: 'If you are in immediate danger, call 911. The National DV Hotline is 1-800-799-7233.',
  },
  po_safety_screening: {
    why: 'This screening helps assess the level of danger and determine if an emergency protective order is needed.',
    checklist: ['A private, safe space to answer honestly'],
    tip: 'If you need immediate protection, you can request an emergency ex parte order.',
  },
  po_prepare_filing: {
    why: 'Your protective order application must detail the abuse and the protections you need.',
    checklist: [
      'Specific dates and descriptions of abuse incidents',
      'Names of witnesses',
      'Photos or documentation of injuries',
      'Filing fee waiver application (PO filings are free in Texas)',
    ],
  },
  po_file_with_court: {
    why: 'Filing your protective order application starts the court process. The court may grant a temporary ex parte order the same day.',
    checklist: [
      'Your prepared application',
      'Government-issued ID',
      'Safety plan in place',
    ],
    tip: 'There is no filing fee for protective orders in Texas. The court handles service to the respondent.',
  },
  po_hearing: {
    why: 'The full protective order hearing occurs within 14 days of filing. The court decides whether to grant a 2-year order.',
    checklist: [
      'All evidence of abuse (photos, messages, medical records)',
      'Witness availability',
      'Government-issued ID',
      'Arrive early and check in with the court coordinator',
    ],
    tip: 'The respondent has a right to be present and contest the order. Focus on specific incidents and evidence.',
  },

  // --- Family: Modification ---
  mod_intake: {
    why: 'Modification requires showing a material and substantial change in circumstances since the last order.',
    checklist: [
      'Existing order court and cause number',
      'What you want to modify (custody, support, visitation)',
      'Description of the change in circumstances',
    ],
    tip: 'Texas law requires a "material and substantial change" or that the order was entered more than 3 years ago (for support).',
  },
  mod_evidence_vault: {
    why: 'Evidence of changed circumstances is the foundation of your modification case.',
    checklist: [
      'Copy of the existing court order',
      'Documentation of changed circumstances',
      'Updated financial information (if modifying support)',
    ],
  },
  mod_existing_order_review: {
    why: 'Understanding your existing order helps identify exactly what to modify and what legal standard applies.',
    checklist: [
      'Upload or review your existing court order',
      'List the specific provisions you want to change',
      'Document the change in circumstances for each provision',
    ],
  },
  mod_prepare_filing: {
    why: 'Your modification petition must specify what changed and what new terms you\'re requesting.',
    checklist: [
      'Existing order details (court, cause number)',
      'Proposed changes and supporting evidence',
      'Filing fee or fee waiver application',
    ],
  },
  mod_file_with_court: {
    why: 'Filing officially starts your modification case. It should be filed in the court that issued the original order.',
    checklist: [
      'Your prepared petition document',
      'Filing fee payment method',
      'Government-issued ID',
    ],
    tip: 'Modifications are usually filed in the same court that issued the original order.',
  },
  mod_serve_respondent: {
    why: 'The other party must be formally notified of the modification filing.',
    checklist: [
      'Respondent\'s current address for service',
      'Budget for process server or certified mail',
    ],
  },
  mod_mediation: {
    why: 'Mediation can resolve modification disputes without the cost and uncertainty of a hearing.',
    checklist: [
      'Your proposed modified terms',
      'Evidence of changed circumstances',
      'Your minimum acceptable terms',
    ],
  },
  mod_final_orders: {
    why: 'The modified order replaces the relevant provisions of the original order.',
    checklist: [
      'Proposed modified order prepared',
      'All evidence of changed circumstances',
      'Hearing date scheduled',
    ],
  },

  // ── BUSINESS: PARTNERSHIP ────────────────────────────────
  biz_partnership_intake: {
    why: 'Understanding the business structure, partners involved, and the nature of the dispute helps us determine the best legal strategy for your partnership or LLC case.',
    checklist: [
      'Partnership or operating agreement',
      'Names and roles of all partners/members',
      'Ownership percentages',
      'Financial records showing the dispute',
      'Timeline of key events',
    ],
    tip: 'If you have an operating or partnership agreement, it may contain dispute resolution clauses that affect your options.',
  },
  biz_partnership_evidence: {
    why: 'Strong evidence is critical in partnership disputes, where the facts often involve complex financial arrangements and verbal agreements.',
    checklist: [
      'Partnership/operating agreement and amendments',
      'Financial statements and tax returns',
      'Bank statements and transaction records',
      'Emails, texts, and letters between partners',
      'Meeting minutes or written decisions',
    ],
    tip: 'Forensic accounting may be needed if you suspect financial misconduct — start gathering bank and financial records early.',
  },
  biz_partnership_demand_letter: {
    why: 'A formal demand letter notifies your partner of the dispute and your intent to seek resolution, creating a record that you attempted to resolve the matter before filing suit.',
    checklist: [
      'Specific breaches or actions you are alleging',
      'Dollar amount of damages or relief requested',
      'Deadline for response (typically 30 days)',
      'Reference to any agreement provisions violated',
    ],
    tip: 'Reference specific sections of your partnership or operating agreement to strengthen your demand.',
  },
  biz_partnership_adr: {
    why: 'Many partnership and LLC agreements require mediation or arbitration before filing a lawsuit. Skipping mandatory ADR could get your case dismissed.',
    checklist: [
      'Review operating/partnership agreement for ADR clauses',
      'Identify whether mediation or arbitration is required',
      'Research qualified business mediators in your area',
      'Prepare a summary of the dispute for the mediator',
    ],
    tip: 'Even if ADR is not mandatory, mediation is often faster and cheaper than litigation for partnership disputes.',
  },
  biz_partnership_prepare_filing: {
    why: 'Preparing your court filing correctly ensures your case proceeds without delays or dismissals due to procedural errors.',
    checklist: [
      'Completed petition or complaint',
      'Filing fee payment ready',
      'Correct court identified (county where business operates)',
      'All defendants properly named',
    ],
  },
  biz_partnership_file_with_court: {
    why: 'Filing your lawsuit with the court officially starts the legal process and establishes your case timeline.',
    checklist: [
      'File petition with the district clerk',
      'Pay filing fee',
      'Get file-stamped copies for your records',
      'Note your cause number',
    ],
    tip: 'Many Texas counties support e-filing at efiletexas.gov — check if yours does.',
  },
  biz_partnership_serve_defendant: {
    why: 'Proper service notifies the other party of the lawsuit. Improper service can delay or invalidate your case.',
    checklist: [
      'Serve each defendant individually',
      'Use a licensed process server or constable',
      'Serve at the registered agent address for LLCs/corporations',
      'File proof of service (return of citation) with the court',
    ],
    tip: 'For business entities, serve the registered agent listed with the Texas Secretary of State.',
  },
  biz_partnership_wait_for_answer: {
    why: 'After service, the defendant has a deadline to respond. Understanding this timeline helps you prepare for what comes next.',
    checklist: [
      'Monitor the court docket for the defendant\'s answer',
      'Note the answer deadline (typically 20 days after service in Texas)',
      'Watch for counterclaims or cross-claims',
      'Consult an attorney if the response is complex',
    ],
  },
  biz_partnership_discovery: {
    why: 'Discovery lets both sides gather evidence. In partnership disputes, this often involves financial records, communications, and depositions.',
    checklist: [
      'Prepare interrogatories (written questions)',
      'Draft requests for production of documents',
      'Plan depositions of key witnesses',
      'Review discovery responses from the other side',
    ],
    tip: 'Request complete financial records, including bank statements, QuickBooks exports, and tax returns for the partnership.',
  },
  biz_partnership_post_resolution: {
    why: 'After your case resolves, there are important steps to protect the outcome — whether you won, settled, or need to dissolve the business.',
    checklist: [
      'Enforce the judgment or settlement terms',
      'File any required dissolution paperwork with the state',
      'Update business registrations if ownership changed',
      'Close shared business accounts if applicable',
    ],
  },

  // ── BUSINESS: EMPLOYMENT ─────────────────────────────────
  biz_employment_intake: {
    why: 'Employment disputes have strict deadlines and specific legal requirements. Understanding your situation early helps us guide you to the right process.',
    checklist: [
      'Employer name and size',
      'Your position and employment dates',
      'Description of what happened',
      'Any HR complaints you\'ve filed',
      'Employment contract or handbook (if available)',
    ],
    tip: 'Discrimination and harassment claims have strict filing deadlines — usually 180-300 days from the incident.',
  },
  biz_employment_evidence: {
    why: 'Employment cases depend heavily on documentation. The more records you have, the stronger your case.',
    checklist: [
      'Pay stubs and W-2s showing compensation',
      'Employment contract, offer letter, or handbook',
      'Performance reviews and evaluations',
      'Emails, texts, and written communications',
      'Witness names and contact information',
    ],
    tip: 'Save copies of all work-related communications before you lose access to company systems.',
  },
  biz_employment_demand_letter: {
    why: 'A demand letter formally notifies your employer of the dispute and gives them a chance to resolve it before litigation.',
    checklist: [
      'Specific violations or wrongful actions alleged',
      'Dollar amount of damages (lost wages, benefits, etc.)',
      'Deadline for response',
      'Reference to applicable employment laws',
    ],
    tip: 'For wage claims, reference the Texas Payday Law or FLSA provisions that apply to your situation.',
  },
  biz_employment_eeoc: {
    why: 'For discrimination or harassment claims, you must file a charge with the EEOC or Texas Workforce Commission (TWC) before you can sue in court. This is a legal prerequisite.',
    checklist: [
      'Determine if your claim requires EEOC/TWC filing',
      'File charge within 180 days (TWC) or 300 days (EEOC) of the incident',
      'Provide a clear description of the discriminatory actions',
      'Wait for right-to-sue letter (or request one after 180 days)',
    ],
    tip: 'You can file with the EEOC online at publicportal.eeoc.gov. Filing with one agency automatically cross-files with the other.',
  },
  biz_employment_prepare_filing: {
    why: 'Employment lawsuits require careful preparation to ensure all claims are properly stated and the right court is selected.',
    checklist: [
      'Completed petition with all causes of action',
      'Filing fee payment ready',
      'Right-to-sue letter (if discrimination claim)',
      'Correct court identified',
    ],
  },
  biz_employment_file_with_court: {
    why: 'Filing your employment lawsuit officially begins the legal process and preserves your right to recovery.',
    checklist: [
      'File petition with the district clerk',
      'Pay filing fee',
      'Get file-stamped copies',
      'Note your cause number',
    ],
    tip: 'Some employment claims can be filed in federal court. Consider whether state or federal court is more favorable.',
  },
  biz_employment_serve_defendant: {
    why: 'Your employer must be properly served to respond to the lawsuit. Service on a business has specific requirements.',
    checklist: [
      'Serve the employer\'s registered agent',
      'Use a licensed process server or constable',
      'For federal claims, follow federal service rules',
      'File proof of service with the court',
    ],
    tip: 'Look up the employer\'s registered agent on the Texas Secretary of State website.',
  },
  biz_employment_wait_for_answer: {
    why: 'After service, your employer has a deadline to respond. Their answer may include counterclaims or affirmative defenses.',
    checklist: [
      'Monitor the court docket for the answer',
      'Note the answer deadline (20 days in Texas state court)',
      'Watch for motions to dismiss',
      'Review any counterclaims carefully',
    ],
  },
  biz_employment_discovery: {
    why: 'Discovery in employment cases focuses on company records, policies, and communications that support your claim.',
    checklist: [
      'Request your complete personnel file',
      'Request company policies and handbooks',
      'Request communications about your termination/discipline',
      'Depose key decision-makers (supervisor, HR)',
    ],
    tip: 'Request comparator evidence — how were similarly situated employees treated?',
  },
  biz_employment_post_resolution: {
    why: 'After resolution, there are practical steps to take regardless of the outcome — from enforcing a judgment to managing your career transition.',
    checklist: [
      'Enforce judgment or settlement terms',
      'Negotiate reference letter terms if applicable',
      'File for unemployment benefits if not already done',
      'Update professional references and resume',
    ],
  },

  // ── BUSINESS: B2B COMMERCIAL ─────────────────────────────
  biz_b2b_intake: {
    why: 'Understanding the business relationship, contract terms, and nature of the commercial dispute helps us build the strongest case strategy.',
    checklist: [
      'Other business name and contact information',
      'Contract or agreement (if written)',
      'Description of goods or services involved',
      'Amount in dispute',
      'Timeline of key events',
    ],
    tip: 'Check your contract for a forum selection clause — it may specify where disputes must be filed.',
  },
  biz_b2b_evidence: {
    why: 'Commercial disputes are won with documentation. Contracts, invoices, communications, and deliverables tell the story of what was agreed and what went wrong.',
    checklist: [
      'Signed contracts and amendments',
      'Invoices, purchase orders, and payment records',
      'Emails and written communications',
      'Deliverables, reports, or work product',
      'Witness statements from employees involved',
    ],
    tip: 'Organize evidence chronologically — courts want to see the timeline of events.',
  },
  biz_b2b_demand_letter: {
    why: 'A formal demand letter puts the other business on notice and creates a record of your good-faith attempt to resolve the dispute before litigation.',
    checklist: [
      'Specific contract provisions breached',
      'Dollar amount of damages claimed',
      'Deadline for response (typically 30 days)',
      'Reference to applicable contract terms',
    ],
    tip: 'Send the demand via certified mail with return receipt for proof of delivery.',
  },
  biz_b2b_negotiation: {
    why: 'Business-to-business disputes often resolve through negotiation, saving both sides the cost and disruption of litigation.',
    checklist: [
      'Determine your minimum acceptable settlement',
      'Prepare a settlement proposal with supporting evidence',
      'Consider the ongoing business relationship',
      'Document all negotiation communications in writing',
    ],
    tip: 'Consider whether preserving the business relationship matters — this may influence your negotiation strategy.',
  },
  biz_b2b_prepare_filing: {
    why: 'Commercial litigation requires careful pleading to capture all causes of action and potential damages.',
    checklist: [
      'Completed petition with all causes of action',
      'Filing fee payment ready',
      'Correct court identified (check contract for forum clause)',
      'All business entity defendants properly named',
    ],
  },
  biz_b2b_file_with_court: {
    why: 'Filing your commercial lawsuit starts the litigation clock and preserves your right to recover damages.',
    checklist: [
      'File petition with the district clerk',
      'Pay filing fee',
      'Get file-stamped copies',
      'Note your cause number',
    ],
    tip: 'For disputes over $75,000 between businesses in different states, consider federal diversity jurisdiction.',
  },
  biz_b2b_serve_defendant: {
    why: 'Proper service on a business entity requires serving the registered agent, not just any employee.',
    checklist: [
      'Identify the registered agent for each business defendant',
      'Use a licensed process server or constable',
      'For out-of-state businesses, follow long-arm statute requirements',
      'File proof of service with the court',
    ],
    tip: 'Look up registered agents on the Secretary of State website for the state where the business is incorporated.',
  },
  biz_b2b_wait_for_answer: {
    why: 'After service, the defendant business has a deadline to respond. Their answer may include counterclaims for amounts they claim you owe.',
    checklist: [
      'Monitor the court docket for the answer',
      'Note the answer deadline',
      'Watch for counterclaims and affirmative defenses',
      'Prepare responses to any counterclaims',
    ],
  },
  biz_b2b_discovery: {
    why: 'Commercial discovery focuses on contracts, financial records, and communications that prove the breach and damages.',
    checklist: [
      'Request all contracts and amendments',
      'Request financial records showing damages',
      'Request internal communications about the dispute',
      'Depose key personnel who managed the relationship',
    ],
    tip: 'In IP/trade secret cases, request forensic imaging of relevant computers and storage devices early.',
  },
  biz_b2b_post_resolution: {
    why: 'After resolution, enforce the outcome and make business decisions about the ongoing relationship.',
    checklist: [
      'Enforce judgment or settlement terms',
      'Collect on the judgment if the other side doesn\'t pay voluntarily',
      'Decide whether to continue the business relationship',
      'Update internal contracts and processes to prevent future disputes',
    ],
  },

  // --- Post-Filing Lifecycle ---
  record_outcome: {
    why: 'Recording your outcome helps us provide the right next steps and improves guidance for future users.',
    checklist: [
      'Know the result of your hearing or resolution',
      'Any written judgment or order from the court',
    ],
  },
  post_judgment: {
    why: 'After a judgment, there are important deadlines and actions that can affect whether you actually get what you were awarded.',
    checklist: [
      'A copy of the court judgment or order',
      'Notes on any payment terms discussed',
    ],
    tip: 'The judgment is not the end — enforcement may require additional steps.',
  },
  case_closure: {
    why: 'Properly closing your case ensures all documents are saved and any remaining actions are tracked.',
    checklist: [
      'All court documents saved',
      'Any payment received or made',
    ],
  },
  courtroom_prep: {
    why: 'Good preparation is the single biggest factor in how pro se litigants perform in court.',
    checklist: [
      'Know your courthouse location and courtroom number',
      'Three copies of all documents',
      'Practice your key points out loud',
      'Professional attire ready',
    ],
    tip: 'Arrive 30 minutes early. Address the judge as "Your Honor."',
  },
}
