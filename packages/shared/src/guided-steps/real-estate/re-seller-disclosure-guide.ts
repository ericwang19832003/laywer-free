import type { GuidedStepConfig } from '../types'

export const reSellerDisclosureGuideConfig: GuidedStepConfig = {
  title: 'Seller Disclosure Violations',
  reassurance:
    'Texas law requires sellers to disclose known defects. If they hid problems from you, you have strong legal options — including potential treble damages under the DTPA.',

  questions: [
    // Did seller provide disclosure
    {
      id: 'received_disclosure',
      type: 'single_choice',
      prompt: 'Did the seller provide a Seller\'s Disclosure Notice?',
      helpText:
        'Under Texas Property Code Section 5.008, sellers of residential property must provide a written disclosure of known material defects.',
      options: [
        { value: 'yes_complete', label: 'Yes, I received a disclosure form' },
        { value: 'no_disclosure', label: 'No, the seller never provided one' },
        { value: 'partial', label: 'Partial or incomplete disclosure' },
      ],
    },
    {
      id: 'no_disclosure_info',
      type: 'info',
      prompt:
        'FAILURE TO PROVIDE DISCLOSURE (Section 5.008):\nTexas law requires sellers to deliver a written disclosure notice to the buyer BEFORE an executed contract becomes binding. If the seller never provided one:\n\n- You may have grounds to rescind (cancel) the sale\n- The seller is liable for any defects they knew about\n- This strengthens a DTPA claim because the seller actively concealed information\n\nExceptions: The disclosure requirement does NOT apply to foreclosure sales, court-ordered sales, sales by fiduciaries (executors, trustees), or new construction from a builder.',
      showIf: (answers) => answers.received_disclosure === 'no_disclosure',
    },

    // What was undisclosed
    {
      id: 'undisclosed_issue',
      type: 'single_choice',
      prompt: 'What type of defect was not disclosed?',
      options: [
        { value: 'structural', label: 'Structural issues (foundation, framing, roof)' },
        { value: 'flooding', label: 'Flooding history or water damage' },
        { value: 'plumbing_electrical', label: 'Plumbing or electrical problems' },
        { value: 'environmental', label: 'Environmental hazards (mold, asbestos, lead paint)' },
        { value: 'pest', label: 'Pest infestation (termites, rodents)' },
        { value: 'hvac', label: 'HVAC or mechanical systems' },
        { value: 'other', label: 'Other defect' },
      ],
    },

    // What sellers must disclose
    {
      id: 'disclosure_requirements_info',
      type: 'info',
      prompt:
        'WHAT SELLERS MUST DISCLOSE (Section 5.008):\n\nThe Texas Seller\'s Disclosure Notice covers:\n- Known defects in walls, foundation, roof, fences, driveways\n- Flooding, drainage, or water penetration problems\n- Previous structural repairs or modifications\n- Conditions in the plumbing, electrical, and HVAC systems\n- Termite damage or treatment history\n- Environmental hazards (asbestos, lead paint, underground storage tanks)\n- Whether the property is in a flood zone or has flooded before\n- HOA membership and fees\n- Lawsuits or code violations affecting the property\n\nKey: The seller must disclose what they KNOW. They are not required to inspect or discover unknown defects. But if evidence shows they knew and lied, that is fraud.',
    },

    // Evidence of seller knowledge
    {
      id: 'seller_knew',
      type: 'yes_no',
      prompt: 'Do you have evidence that the seller knew about the defect before selling?',
      helpText:
        'Evidence of knowledge includes: prior repair invoices, insurance claims, neighbor testimony, prior inspection reports, building permits for repairs, or the seller\'s own admissions.',
    },
    {
      id: 'seller_knew_yes_info',
      type: 'info',
      prompt:
        'EVIDENCE OF SELLER KNOWLEDGE IS CRITICAL:\nThis is the strongest element of your case. Gather:\n- Prior repair invoices or estimates the seller obtained\n- Insurance claims the seller filed for the same issue\n- Building permits for repairs (check with the city)\n- Testimony from neighbors, contractors, or prior inspectors\n- The seller\'s own statements in emails, texts, or conversations\n- Prior listing photos that show the defect was concealed (fresh paint over water stains, etc.)\n- MLS listing history showing the property was previously listed with different disclosures',
      showIf: (answers) => answers.seller_knew === 'yes',
    },

    // Inspection window
    {
      id: 'had_inspection',
      type: 'yes_no',
      prompt: 'Did you have a professional inspection done before closing?',
      helpText:
        'The standard Texas contract gives the buyer a 7-day option period to conduct inspections. If you had an inspection, the report may help — or it may complicate your claim.',
    },
    {
      id: 'inspection_yes_info',
      type: 'info',
      prompt:
        'YOUR INSPECTION REPORT:\n- If the inspector found the defect: The seller may argue you knew about it and accepted the risk. However, if the seller actively concealed the defect (e.g., covered it up before inspection), this argument fails.\n- If the inspector missed it: This does not excuse the seller from disclosing what they knew. You may also have a negligence claim against the inspector.\n\nThe 7-day option period is your right to inspect — it does NOT eliminate the seller\'s duty to disclose. A seller cannot hide behind "you should have caught it."',
      showIf: (answers) => answers.had_inspection === 'yes',
    },
    {
      id: 'inspection_no_info',
      type: 'info',
      prompt:
        'NOT HAVING AN INSPECTION:\nThe seller may argue you failed to inspect. However:\n- Texas law places the disclosure obligation on the SELLER, not the buyer\n- A buyer\'s failure to inspect does not excuse the seller\'s duty to disclose known defects\n- If the defect was hidden or not discoverable by a reasonable inspection, the seller is still liable\n\nFor your current case, focus on proving what the seller knew and failed to disclose.',
      showIf: (answers) => answers.had_inspection === 'no',
    },

    // Damages
    {
      id: 'damages_type',
      type: 'single_choice',
      prompt: 'What type of damages are you seeking?',
      helpText:
        'Non-disclosure damages typically include the cost to cure the defect plus any diminished property value.',
      options: [
        { value: 'cost_to_cure', label: 'Cost to repair the defect' },
        { value: 'diminished_value', label: 'Diminished property value' },
        { value: 'both', label: 'Both repair cost and diminished value' },
        { value: 'rescission', label: 'Cancel the sale entirely (rescission)' },
      ],
    },
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'CALCULATING NON-DISCLOSURE DAMAGES:\n\n1. Cost to cure: Get 2-3 repair estimates from licensed contractors. This is the most straightforward measure.\n2. Diminished value: The difference between what you paid and what the property is actually worth with the defect. You may need an appraisal.\n3. Both: In some cases, even after repair, the property value is still reduced (e.g., foundation repair history reduces resale value).\n4. Rescission: Canceling the sale entirely — the seller takes back the property and refunds your purchase price. Courts rarely grant this unless the defect is severe and repair is impractical.',
    },

    // DTPA claim
    {
      id: 'dtpa_claim',
      type: 'info',
      prompt:
        'DTPA CLAIM FOR TREBLE DAMAGES (Section 17.50):\n\nIf the seller\'s non-disclosure was knowing or intentional, you may have a claim under the Texas Deceptive Trade Practices Act (DTPA). The DTPA allows:\n\n- Actual damages (cost to cure + diminished value)\n- Up to THREE TIMES actual damages if the seller acted knowingly\n- Attorney\'s fees\n\nTo qualify for treble damages, you must prove:\n1. The seller made a false representation or failed to disclose a known defect\n2. The seller acted "knowingly" — meaning they were aware the information was false or misleading\n3. You relied on the false representation or non-disclosure\n4. You suffered damages as a result\n\nIMPORTANT: You must send a DTPA demand letter at least 60 days before filing suit (Section 17.505). The letter must describe your complaint and the amount of damages.',
    },

    // Evidence checklist
    {
      id: 'evidence_checklist',
      type: 'info',
      prompt:
        'EVIDENCE YOU NEED:\n\n- The Seller\'s Disclosure Notice (or proof it was never provided)\n- Your inspection report (if you had one)\n- Repair estimates from 2-3 licensed contractors\n- Photos and videos of the defect\n- Evidence the seller knew (prior repair invoices, insurance claims, permits, neighbor statements)\n- Your purchase agreement showing the price you paid\n- An appraisal showing current value with the defect (if claiming diminished value)\n- Communications with the seller about the property condition\n- The listing description and photos (if they misrepresented the condition)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    // Disclosure status
    if (answers.received_disclosure === 'yes_complete') {
      items.push({
        status: 'done',
        text: 'Seller\'s Disclosure Notice received — compare it to the actual property condition.',
      })
    } else if (answers.received_disclosure === 'no_disclosure') {
      items.push({
        status: 'info',
        text: 'No disclosure provided — this is itself a violation of Section 5.008 and strengthens your case.',
      })
    } else if (answers.received_disclosure === 'partial') {
      items.push({
        status: 'info',
        text: 'Partial disclosure received — identify which items were omitted or misrepresented.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine whether you received a Seller\'s Disclosure Notice.',
      })
    }

    // Undisclosed issue
    if (answers.undisclosed_issue) {
      const labels: Record<string, string> = {
        structural: 'Structural issues (foundation, framing, roof)',
        flooding: 'Flooding history or water damage',
        plumbing_electrical: 'Plumbing or electrical problems',
        environmental: 'Environmental hazards (mold, asbestos, lead paint)',
        pest: 'Pest infestation',
        hvac: 'HVAC or mechanical systems',
        other: 'Other defect',
      }
      items.push({
        status: 'done',
        text: `Undisclosed defect: ${labels[answers.undisclosed_issue]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the specific defect that was not disclosed.',
      })
    }

    // Seller knowledge
    if (answers.seller_knew === 'yes') {
      items.push({
        status: 'done',
        text: 'Evidence of seller knowledge identified — this supports both a non-disclosure claim and potential DTPA treble damages.',
      })
    } else if (answers.seller_knew === 'no') {
      items.push({
        status: 'needed',
        text: 'Investigate whether the seller knew about the defect: check for prior repairs, insurance claims, permits, and ask neighbors.',
      })
    }

    // Inspection
    if (answers.had_inspection === 'yes') {
      items.push({
        status: 'done',
        text: 'Pre-closing inspection completed. Review the report to see if the inspector caught or missed the defect.',
      })
    } else if (answers.had_inspection === 'no') {
      items.push({
        status: 'info',
        text: 'No pre-closing inspection. The seller\'s disclosure duty still applies — failure to inspect does not excuse the seller.',
      })
    }

    // Damages
    if (answers.damages_type) {
      const labels: Record<string, string> = {
        cost_to_cure: 'Cost to repair the defect',
        diminished_value: 'Diminished property value',
        both: 'Repair cost plus diminished value',
        rescission: 'Rescission (cancel the sale)',
      }
      items.push({
        status: 'done',
        text: `Damages sought: ${labels[answers.damages_type]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Determine the type of damages you are seeking.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Get 2-3 repair estimates from licensed contractors to document your damages.',
    })

    items.push({
      status: 'info',
      text: 'If the seller acted knowingly, you may recover treble damages under the DTPA (Section 17.50). You must send a DTPA demand letter at least 60 days before filing suit.',
    })

    return items
  },
}
