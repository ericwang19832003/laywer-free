import type { GuidedStepConfig } from '../types'

export const reDiscoveryGuideConfig: GuidedStepConfig = {
  title: 'Discovery in Real Estate Cases',
  reassurance:
    'Discovery is your right to compel the other party to produce documents and answer questions under oath. In real estate cases, the right documents can make or break your case.',

  questions: [
    {
      id: 'discovery_overview',
      type: 'info',
      prompt:
        'DISCOVERY TOOLS AVAILABLE TO YOU:\n1. Requests for Production — demand specific documents\n2. Interrogatories — written questions answered under oath (limit: 25 in Texas)\n3. Requests for Admissions — force the other party to admit or deny facts\n4. Depositions — live, recorded questioning of witnesses\n5. Subpoenas — compel third parties (title companies, lenders, agents) to produce records',
      acknowledgeLabel: 'I understand my discovery tools →',
    },
    {
      id: 'case_subtype',
      type: 'single_choice',
      prompt: 'What type of real estate dispute is this?',
      options: [
        { value: 'title_defect', label: 'Title defect' },
        { value: 'disclosure_violation', label: 'Seller disclosure violation' },
        { value: 'construction_defect', label: 'Construction defect' },
        { value: 'failed_closing', label: 'Failed closing' },
        { value: 'boundary_dispute', label: 'Boundary / adverse possession' },
        { value: 'fraud', label: 'Fraud or misrepresentation' },
        { value: 'other_re', label: 'Other' },
      ],
    },
    {
      id: 'title_defect_docs',
      type: 'multi_select',
      prompt: 'Which of these documents have you requested or received so far?',
      options: [
        { value: 'title_commitment', label: 'Title commitment and title policy' },
        { value: 'title_search', label: 'Title search reports and abstracts' },
        { value: 'deed_records', label: 'Deed records (warranty, special warranty, quitclaim)' },
        { value: 'survey', label: 'Survey and plat maps' },
        { value: 'liens', label: 'Liens, judgments, or encumbrances on the property' },
        { value: 'title_company_file', label: 'Title company internal file and work papers' },
        { value: 'title_communications', label: 'Communications between title company and all parties' },
        { value: 'prior_claims', label: 'Prior title insurance claims on the property' },
        { value: 'hoa_docs', label: 'HOA or deed restriction documents' },
      ],
      noneLabel: "Haven't requested any yet",
      showIf: (answers) => answers.case_subtype === 'title_defect',
    },
    {
      id: 'disclosure_docs',
      type: 'multi_select',
      prompt: 'Which of these documents have you requested or received so far?',
      options: [
        { value: 'disclosure_notice', label: "Seller's Disclosure Notice (TREC form)" },
        { value: 'inspection_reports', label: 'All property inspection reports' },
        { value: 'repair_records', label: 'Repair records and invoices for the property' },
        { value: 'insurance_claims', label: 'Insurance claims filed on the property' },
        { value: 'hoa_violations', label: 'HOA violation notices or complaints' },
        { value: 'permit_records', label: 'Permit records for any work done on the property' },
        { value: 'seller_agent_comms', label: "Communications between seller and seller's agent about condition" },
        { value: 'prior_listing', label: 'Prior listing information (MLS data)' },
        { value: 'listing_photos', label: 'Photographs from prior listings' },
      ],
      noneLabel: "Haven't requested any yet",
      showIf: (answers) => answers.case_subtype === 'disclosure_violation',
    },
    {
      id: 'construction_docs',
      type: 'multi_select',
      prompt: 'Which of these documents have you requested or received so far?',
      options: [
        { value: 'plans', label: 'Construction plans, specifications, and blueprints' },
        { value: 'permits', label: 'Building permits and inspection records' },
        { value: 'change_orders', label: 'Change orders and contract amendments' },
        { value: 'warranty', label: 'Builder warranty documents' },
        { value: 'subcontractor', label: 'Subcontractor contracts and invoices' },
        { value: 'rcla_notice', label: 'RCLA pre-suit notice and builder response' },
        { value: 'expert_reports', label: 'Expert inspection reports' },
        { value: 'construction_photos', label: 'Photographs taken during construction' },
        { value: 'builder_comms', label: 'Communications between builder, subcontractors, and owner' },
        { value: 'builder_insurance', label: 'Builder insurance policies (CGL)' },
      ],
      noneLabel: "Haven't requested any yet",
      showIf: (answers) => answers.case_subtype === 'construction_defect',
    },
    {
      id: 'failed_closing_docs',
      type: 'multi_select',
      prompt: 'Which of these documents have you requested or received so far?',
      options: [
        { value: 'purchase_contract', label: 'Purchase contract (TREC form) and all amendments' },
        { value: 'earnest_money_records', label: 'Earnest money receipt and escrow records' },
        { value: 'financing_docs', label: 'Financing addendum and loan application documents' },
        { value: 'lender_denial', label: 'Lender denial letter or conditions not met' },
        { value: 'appraisal', label: 'Appraisal report' },
        { value: 'inspection_reports', label: 'Inspection reports (home, pest, survey)' },
        { value: 'title_commitment', label: 'Title commitment and title objection correspondence' },
        { value: 'all_communications', label: 'Communications between all parties' },
        { value: 'closing_disclosure', label: 'Closing disclosure (HUD-1 or CD) if one was prepared' },
        { value: 'rate_lock', label: 'Rate lock agreement and evidence of fees paid' },
      ],
      noneLabel: "Haven't requested any yet",
      showIf: (answers) => answers.case_subtype === 'failed_closing',
    },
    {
      id: 'interrogatory_templates',
      type: 'info',
      prompt:
        'SAMPLE INTERROGATORIES FOR REAL ESTATE CASES:\n1. "Identify all persons with knowledge of facts relevant to this dispute."\n2. "State the dates and substance of all communications regarding the property between [date] and [date]."\n3. "Describe in detail the condition of the property as of [relevant date]."\n4. "Identify all repairs, maintenance, or improvements made to the property in the last 5 years."\n5. "State all facts supporting your contention that [specific claim or defense]."\n6. "Identify all documents you intend to offer as evidence at trial."\n7. "State whether you have ever filed an insurance claim related to the property, and if so, provide dates, amounts, and outcomes."',
      acknowledgeLabel: 'I have my interrogatory questions →',
    },
    {
      id: 'deposition_targets',
      type: 'single_choice',
      prompt: 'Who do you need to depose?',
      options: [
        { value: 'real_estate_agent', label: 'Real estate agent or broker' },
        { value: 'title_officer', label: 'Title officer or closer' },
        { value: 'inspector', label: 'Home inspector' },
        { value: 'appraiser', label: 'Appraiser' },
        { value: 'builder', label: 'Builder or contractor' },
        { value: 'multiple_deponents', label: 'Multiple witnesses' },
        { value: 'none_yet', label: 'Not sure yet' },
      ],
    },
    {
      id: 'agent_depo_info',
      type: 'info',
      prompt:
        'DEPOSING A REAL ESTATE AGENT:\nKey areas to explore:\n• What did they know about the property condition and when?\n• What did they disclose vs. what they knew?\n• What representations did they make to you?\n• Did they comply with their fiduciary duties?\n• What communications did they have with the other party\'s agent?\n• Ask for their complete file on the transaction.',
      acknowledgeLabel: 'Ready to depose the agent →',
      showIf: (answers) => answers.deposition_targets === 'real_estate_agent' || answers.deposition_targets === 'multiple_deponents',
    },
    {
      id: 'title_depo_info',
      type: 'info',
      prompt:
        'DEPOSING A TITLE OFFICER:\nKey areas to explore:\n• What title search was performed and what did it reveal?\n• Were there any exceptions or objections noted?\n• What was communicated to the parties about title issues?\n• Were any title defects missed or not reported?\n• What is the title company\'s standard procedure for title searches?\n• Subpoena the complete title company file before the deposition.',
      acknowledgeLabel: 'Ready to depose the title officer →',
      showIf: (answers) => answers.deposition_targets === 'title_officer' || answers.deposition_targets === 'multiple_deponents',
    },
    {
      id: 'inspector_depo_info',
      type: 'info',
      prompt:
        'DEPOSING A HOME INSPECTOR:\nKey areas to explore:\n• What was their inspection methodology?\n• What areas did they inspect and what areas were inaccessible?\n• Were any defects noted or missed?\n• What is their licensing and experience level?\n• Did they follow TREC Standards of Practice?\n• Were there any limitations or disclaimers in their report?',
      acknowledgeLabel: 'Ready to depose the inspector →',
      showIf: (answers) => answers.deposition_targets === 'inspector' || answers.deposition_targets === 'multiple_deponents',
    },
    {
      id: 'builder_depo_info',
      type: 'info',
      prompt:
        'DEPOSING A BUILDER OR CONTRACTOR:\nKey areas to explore:\n• What plans and specifications were followed?\n• Were there any deviations from the plans?\n• What subcontractors were used and for what work?\n• What inspections were performed during construction?\n• Were any defects reported during construction?\n• What warranty was provided and what claims have been made?\n• What was their response to the RCLA notice?',
      acknowledgeLabel: 'Ready to depose the builder →',
      showIf: (answers) => answers.deposition_targets === 'builder' || answers.deposition_targets === 'multiple_deponents',
    },
    {
      id: 'expert_reports',
      type: 'info',
      prompt:
        'EXPERT REPORTS:\n• In real estate cases, expert testimony is often critical — appraisers for property value, engineers for construction defects, surveyors for boundary disputes.\n• Texas Rule of Civil Procedure 195 governs expert discovery — you can request the opposing expert\'s report, qualifications, opinions, and the basis for those opinions.\n• Designate your own experts early to meet court deadlines.\n• Common experts: licensed appraiser, structural engineer, real estate broker (for market value), surveyor, mold/environmental specialist.',
      acknowledgeLabel: 'I understand the expert report rules →',
    },
    {
      id: 'third_party_subpoenas',
      type: 'info',
      prompt:
        'THIRD-PARTY SUBPOENAS:\nYou can subpoena records from non-parties. Common targets:\n• Title company — complete transaction file, title search, communications\n• Lender — loan application, appraisal, underwriting file, denial letter\n• County clerk — recorded documents, permits, liens\n• HOA — violation notices, meeting minutes, financial records\n• City/county building department — permits, inspections, certificates of occupancy\n• Insurance company — claims history (CLUE report), policy documents\n• MLS — listing history and property descriptions\n\nUse a Subpoena Duces Tecum (Tex. R. Civ. P. 176) to compel production.',
      acknowledgeLabel: 'I know how to subpoena third parties →',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.case_subtype) {
      const labels: Record<string, string> = {
        title_defect: 'Title defect',
        disclosure_violation: 'Seller disclosure violation',
        construction_defect: 'Construction defect',
        failed_closing: 'Failed closing',
        boundary_dispute: 'Boundary / adverse possession',
        fraud: 'Fraud or misrepresentation',
        other_re: 'Other real estate dispute',
      }
      items.push({ status: 'done', text: `Case type: ${labels[answers.case_subtype]}.` })

      const docTargets: Record<string, string> = {
        title_defect: 'title commitment, title policy, deed records, survey, and title company file',
        disclosure_violation: "Seller's Disclosure Notice, inspection reports, repair records, insurance claims, and prior listing data",
        construction_defect: 'plans/specs, permits, builder warranty, subcontractor records, and RCLA notice/response',
        failed_closing: 'purchase contract, earnest money records, loan documents, appraisal, and closing correspondence',
        boundary_dispute: 'surveys, deed records, plat maps, tax records, and photographs of use over time',
        fraud: 'all transaction documents, communications, representations made, and financial records',
      }
      const docKey = answers.case_subtype === 'title_defect' ? 'title_defect_docs'
        : answers.case_subtype === 'disclosure_violation' ? 'disclosure_docs'
        : answers.case_subtype === 'construction_defect' ? 'construction_docs'
        : answers.case_subtype === 'failed_closing' ? 'failed_closing_docs'
        : null
      const requestedDocs = docKey && answers[docKey]
        ? answers[docKey].split(',').filter((v: string) => v && v !== 'none')
        : []
      if (requestedDocs.length > 0) {
        items.push({ status: 'done', text: `${requestedDocs.length} document(s) requested or received.` })
      } else if (docTargets[answers.case_subtype]) {
        items.push({
          status: 'needed',
          text: `Request these key documents: ${docTargets[answers.case_subtype]}.`,
        })
      }
    } else {
      items.push({ status: 'needed', text: 'Identify the type of real estate dispute to determine which documents to request.' })
    }

    if (answers.deposition_targets && answers.deposition_targets !== 'none_yet') {
      const labels: Record<string, string> = {
        real_estate_agent: 'real estate agent/broker',
        title_officer: 'title officer/closer',
        inspector: 'home inspector',
        appraiser: 'appraiser',
        builder: 'builder/contractor',
        multiple_deponents: 'multiple witnesses',
      }
      items.push({
        status: 'needed',
        text: `Schedule deposition of: ${labels[answers.deposition_targets]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify deposition targets based on case type.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Prepare and send Interrogatories (limit 25) and Requests for Production early in the case.',
    })

    items.push({
      status: 'info',
      text: 'Use third-party subpoenas (Tex. R. Civ. P. 176) to obtain records from title companies, lenders, and government agencies.',
    })

    items.push({
      status: 'info',
      text: 'Designate experts early (appraiser, engineer, surveyor) and request the opposing party\'s expert reports under Rule 195.',
    })

    return items
  },
}
