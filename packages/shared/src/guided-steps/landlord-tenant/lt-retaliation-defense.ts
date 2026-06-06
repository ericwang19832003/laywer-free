import type { GuidedStepConfig } from '../types'

export const ltRetaliationDefenseConfig: GuidedStepConfig = {
  title: 'Building Your Retaliation Defense',
  reassurance:
    'Texas law protects tenants who exercise their rights, and retaliation is a serious violation. You have powerful legal tools on your side.',

  questions: [
    {
      id: 'retaliation_intro',
      type: 'info',
      prompt:
        'Under Texas Property Code \u00A7 92.331, a landlord CANNOT retaliate against you for exercising your legal rights. If they take adverse action within 6 months of your protected activity, the law PRESUMES it\u2019s retaliation \u2014 the burden shifts to the landlord to prove otherwise.',
      acknowledgeLabel: 'I understand the 6-month retaliation presumption under \u00A7 92.331',
    },
    {
      id: 'protected_activity',
      type: 'single_choice',
      prompt: 'What did you do before the landlord took action?',
      options: [
        { value: 'requested_repairs', label: 'Requested repairs in good faith' },
        { value: 'filed_complaint', label: 'Complained to a government agency about code violations' },
        { value: 'exercised_right', label: 'Exercised a right under the lease or law' },
        { value: 'joined_organization', label: 'Participated in a tenant organization' },
        { value: 'multiple', label: 'Multiple activities' },
        { value: 'none', label: 'None of these' },
      ],
    },
    {
      id: 'no_protected_activity_info',
      type: 'info',
      prompt:
        'The retaliation defense requires a "protected activity" that triggered the landlord\u2019s action. If none of these apply, consider other defenses instead.',
      acknowledgeLabel: "I understand retaliation defense doesn't apply \u2014 I'll explore other defenses",
      showIf: (answers) => answers.protected_activity === 'none',
    },
    {
      id: 'activity_date',
      type: 'text',
      prompt: 'When did you do this? (Date of your protected activity)',
      placeholder: 'MM/DD/YYYY',
      showIf: (answers) =>
        !!answers.protected_activity && answers.protected_activity !== 'none',
    },
    {
      id: 'landlord_action',
      type: 'single_choice',
      prompt: 'What did the landlord do in response?',
      options: [
        { value: 'eviction', label: 'Filed for eviction' },
        { value: 'rent_increase', label: 'Increased rent' },
        { value: 'service_decrease', label: 'Decreased services or failed to repair' },
        { value: 'lease_termination', label: 'Refused to renew or terminated lease' },
        { value: 'other_interference', label: 'Other interference with your rights' },
      ],
      showIf: (answers) =>
        !!answers.protected_activity && answers.protected_activity !== 'none',
    },
    {
      id: 'action_date',
      type: 'text',
      prompt: 'When did the landlord take this action?',
      placeholder: 'MM/DD/YYYY',
      showIf: (answers) =>
        !!answers.protected_activity && answers.protected_activity !== 'none',
    },
    {
      id: 'six_month_rule_info',
      type: 'info',
      prompt:
        'THE 6-MONTH RULE \u2014 If the landlord\u2019s action occurred within 6 months of your protected activity, Texas law PRESUMES retaliation (\u00A7 92.331(b)). The landlord must prove a legitimate, non-retaliatory reason.',
      acknowledgeLabel: "I understand the 6-month presumption window \u2014 I'll record exact dates to establish the timeline",
      showIf: (answers) =>
        !!answers.protected_activity && answers.protected_activity !== 'none',
    },
    {
      id: 'have_documentation',
      type: 'yes_no',
      prompt:
        'Do you have documentation of your protected activity? (repair requests, complaint records, letters)',
      showIf: (answers) =>
        !!answers.protected_activity && answers.protected_activity !== 'none',
    },
    {
      id: 'documentation_guidance_info',
      type: 'info',
      prompt:
        'DOCUMENTATION IS CRITICAL. Gather: dated copies of repair requests (texts, emails, letters), government complaint filing receipts, photos/videos of conditions, landlord\u2019s responses (or lack thereof), timeline showing the sequence of events. The stronger your paper trail, the stronger your defense.',
      acknowledgeLabel: "I understand \u2014 I'll gather dated records, receipts, photos, and a written timeline",
      showIf: (answers) => answers.have_documentation === 'no',
    },
    {
      id: 'damages_info',
      type: 'info',
      prompt:
        'DAMAGES FOR RETALIATION (\u00A7 92.333): If you prove retaliation, you can recover: one month\u2019s rent + $500, actual damages, court costs, and reasonable attorney fees. This can be raised as a SEPARATE lawsuit (under SB 38, counterclaims are no longer allowed in eviction suits).',
      acknowledgeLabel: "I understand I can file a separate retaliation lawsuit to recover damages under \u00A7 92.333",
      showIf: (answers) =>
        !!answers.protected_activity && answers.protected_activity !== 'none',
    },
    {
      id: 'important_exception',
      type: 'info',
      prompt:
        'EXCEPTION: Retaliation is NOT a defense if the eviction is for genuine nonpayment of rent AND the tenant is actually behind on rent (\u00A7 92.332(b)). However, if the "nonpayment" is pretextual (landlord manufactured a reason after you complained), document that.',
      acknowledgeLabel: "I understand this exception \u2014 I'll document if nonpayment is being used as a pretext",
      showIf: (answers) =>
        !!answers.protected_activity && answers.protected_activity !== 'none',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.protected_activity === 'none') {
      items.push({
        status: 'info',
        text: 'No protected activity identified. The retaliation defense may not apply \u2014 consider other defenses.',
      })
      return items
    }

    // Timeline analysis
    if (answers.activity_date && answers.action_date) {
      const activityDate = new Date(answers.activity_date)
      const actionDate = new Date(answers.action_date)
      const diffMs = actionDate.getTime() - activityDate.getTime()
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays >= 0 && diffDays <= 180) {
        items.push({
          status: 'done',
          text: `Landlord acted ${diffDays} days after your protected activity \u2014 within the 6-month presumption window. The law presumes retaliation.`,
        })
      } else if (diffDays > 180) {
        items.push({
          status: 'info',
          text: `Landlord acted ${diffDays} days after your protected activity \u2014 outside the 6-month presumption window. You can still argue retaliation, but you bear the burden of proof.`,
        })
      } else {
        items.push({
          status: 'info',
          text: 'Timeline could not be determined. Verify your dates to assess the 6-month presumption.',
        })
      }
    } else {
      items.push({
        status: 'needed',
        text: 'Record exact dates for both your protected activity and the landlord\u2019s action to establish the timeline.',
      })
    }

    // Documentation status
    if (answers.have_documentation === 'yes') {
      items.push({
        status: 'done',
        text: 'You have documentation of your protected activity. Organize it chronologically for court.',
      })
    } else if (answers.have_documentation === 'no') {
      items.push({
        status: 'needed',
        text: 'Gather documentation: repair requests, complaint receipts, photos, communications, and a written timeline of events.',
      })
    }

    // Damages potential
    items.push({
      status: 'info',
      text: 'If retaliation is proven, you may recover one month\u2019s rent + $500, actual damages, court costs, and attorney fees (\u00A7 92.333). This can be filed as a separate lawsuit.',
    })

    return items
  },
}
