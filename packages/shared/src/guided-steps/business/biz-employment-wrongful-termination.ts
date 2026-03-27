import type { GuidedStepConfig } from '../types'

export const bizEmploymentWrongfulTerminationConfig: GuidedStepConfig = {
  title: 'Was Your Termination Illegal?',
  reassurance:
    "Texas is an at-will state — but that doesn't mean employers can fire you for ANY reason. Important exceptions protect you.",

  questions: [
    {
      id: 'at_will_info',
      type: 'info',
      prompt:
        'AT-WILL EMPLOYMENT IN TEXAS: Your employer can fire you for any reason, or no reason — UNLESS the reason is illegal. These exceptions matter:\n\n1. DISCRIMINATION: Can\'t fire based on race, sex, age (40+), disability, religion, national origin, pregnancy (Title VII, ADA, ADEA, Texas Labor Code Ch. 21)\n2. RETALIATION: Can\'t fire for filing a workers\' comp claim, reporting safety violations (whistleblower), or opposing illegal practices\n3. CONTRACT: If you have a written employment contract with termination protections\n4. PUBLIC POLICY: Very limited in Texas — firing for refusing to commit a crime',
    },
    {
      id: 'termination_reason',
      type: 'single_choice',
      prompt: 'Why were you terminated?',
      options: [
        { value: 'discrimination', label: 'Discrimination (race, sex, age, disability, religion, pregnancy)' },
        { value: 'retaliation', label: 'Retaliation (filed complaint, reported violations)' },
        { value: 'contract_violation', label: 'Employer violated my employment contract' },
        { value: 'whistleblower', label: 'Whistleblower retaliation (reported illegal activity)' },
        { value: 'no_reason_given', label: 'No reason was given' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'discrimination_info',
      type: 'info',
      prompt:
        'DISCRIMINATION CLAIM:\n\nLegal framework: Title VII (federal, 15+ employees), Texas Labor Code Ch. 21 (state, 15+ employees), ADA (disability), ADEA (age 40+), Pregnancy Discrimination Act\n\nTo win, you generally need to show:\n1. You are in a protected class\n2. You were qualified for your position\n3. You suffered an adverse action (termination)\n4. Similarly situated employees outside your protected class were treated differently\n\nEvidence to build:\n- Comparators: coworkers in similar roles who weren\'t fired\n- Discriminatory comments or emails from supervisors\n- Timing: were you fired shortly after disclosing a protected characteristic?\n- Pattern: has the employer fired other employees in the same protected class?',
      showIf: (answers) => answers.termination_reason === 'discrimination',
    },
    {
      id: 'retaliation_info',
      type: 'info',
      prompt:
        'RETALIATION CLAIM:\n\nLegal framework: Texas Labor Code \u00a7451.001 (workers\' comp retaliation), Title VII \u00a7704 (opposing discrimination), Sabine Pilot doctrine (refusing to commit a crime)\n\nTo win, you generally need to show:\n1. You engaged in a protected activity (filed a claim, reported a violation, opposed illegal conduct)\n2. Your employer knew about the protected activity\n3. You suffered an adverse action (termination)\n4. There is a causal connection (timing, comments, pattern)\n\nKey evidence:\n- Documentation of when you made your complaint/report\n- Proof employer was aware of your protected activity\n- Timeline showing proximity between complaint and termination\n- Evidence of pretext (employer\'s stated reason doesn\'t hold up)',
      showIf: (answers) => answers.termination_reason === 'retaliation',
    },
    {
      id: 'contract_info',
      type: 'info',
      prompt:
        'CONTRACT VIOLATION CLAIM:\n\nLegal framework: Texas common law breach of contract\n\nEmployment contracts can override at-will status if they:\n- Specify a term of employment (e.g., 2-year contract)\n- List specific reasons for termination ("for cause" provisions)\n- Require progressive discipline before termination\n\nTo win, you need to show:\n1. A valid, enforceable employment contract exists\n2. The contract limits the employer\'s right to terminate\n3. The employer terminated you in violation of those limits\n4. You suffered damages (lost wages, benefits)\n\nNote: Employee handbooks generally do NOT create a contract in Texas unless they contain a specific, express agreement.',
      showIf: (answers) => answers.termination_reason === 'contract_violation',
    },
    {
      id: 'whistleblower_info',
      type: 'info',
      prompt:
        'WHISTLEBLOWER CLAIM:\n\nLegal framework:\n- Texas Whistleblower Act (\u00a7554.002) — protects PUBLIC employees who report violations of law in good faith\n- Sabine Pilot v. Hauck — protects PRIVATE employees fired solely for refusing to commit a criminal act\n- Sarbanes-Oxley — protects employees of publicly traded companies who report securities fraud\n\nFor public employees:\n- Must have reported to an appropriate law enforcement authority\n- Must have acted in good faith\n- Can recover: lost wages, reinstatement, compensatory damages, attorney fees\n\nFor private employees:\n- Protection is narrow: only covers refusal to commit a criminal act\n- You bear the burden of proving the sole reason for termination was your refusal',
      showIf: (answers) => answers.termination_reason === 'whistleblower',
    },
    {
      id: 'no_reason_info',
      type: 'info',
      prompt:
        'NO REASON GIVEN:\n\nWhile Texas employers don\'t have to give a reason, a lack of explanation can actually help your case if:\n- The timing is suspicious (fired right after a complaint or protected activity)\n- You have a strong performance record (suggesting the real reason was illegal)\n- Similarly situated coworkers were treated differently\n\nNext steps:\n1. Request your personnel file — Texas employers aren\'t required to provide it, but many will\n2. Document everything you remember about the termination\n3. Identify potential witnesses\n4. Consider whether any of the protected categories (discrimination, retaliation, contract) apply',
      showIf: (answers) => answers.termination_reason === 'no_reason_given',
    },
    {
      id: 'other_reason_info',
      type: 'info',
      prompt:
        'OTHER TERMINATION REASONS:\n\nSome other potentially illegal terminations include:\n- Fired for taking FMLA leave (if employer has 50+ employees)\n- Fired for military service (USERRA)\n- Fired for jury duty (Texas Labor Code \u00a7122.001)\n- Fired for voting or running for office\n\nIf your situation doesn\'t fit these categories, Texas at-will employment may apply, and the termination may be legal even if unfair. Consider consulting an employment attorney for a case-specific analysis.',
      showIf: (answers) => answers.termination_reason === 'other',
    },
    {
      id: 'eeoc_filed',
      type: 'yes_no',
      prompt: 'Have you filed an EEOC or Texas Workforce Commission (TWC) complaint?',
      showIf: (answers) =>
        answers.termination_reason === 'discrimination' || answers.termination_reason === 'retaliation',
    },
    {
      id: 'eeoc_required_info',
      type: 'info',
      prompt:
        'IMPORTANT — FILE BEFORE SUING:\n\nFor discrimination and most retaliation claims, you MUST file a complaint with the EEOC or TWC BEFORE you can file a lawsuit.\n\n- TWC deadline: 180 days from the discriminatory act\n- EEOC deadline: 300 days from the discriminatory act (if TWC also has jurisdiction)\n- After filing, you must wait for a "right-to-sue" letter (you can request one after 180 days)\n- Once you receive the right-to-sue letter, you have 90 days to file your lawsuit\n\nFile online: publicportal.eeoc.gov\nTWC: twc.texas.gov',
      showIf: (answers) =>
        answers.eeoc_filed === 'no' &&
        (answers.termination_reason === 'discrimination' || answers.termination_reason === 'retaliation'),
    },
    {
      id: 'eeoc_filed_info',
      type: 'info',
      prompt:
        'Good. If you have your right-to-sue letter, you have 90 days to file your lawsuit. If you don\'t have it yet, you can request one after 180 days from filing.',
      showIf: (answers) =>
        answers.eeoc_filed === 'yes' &&
        (answers.termination_reason === 'discrimination' || answers.termination_reason === 'retaliation'),
    },
    {
      id: 'evidence_checklist',
      type: 'info',
      prompt:
        'EVIDENCE TO GATHER:\n- Termination letter or notice\n- Performance reviews (especially recent positive ones)\n- Emails/texts related to termination\n- Witness names (coworkers who saw discrimination)\n- Company handbook/policies\n- Pay stubs and benefits records',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.termination_reason) {
      const reasons: Record<string, string> = {
        discrimination: 'Discrimination',
        retaliation: 'Retaliation',
        contract_violation: 'Contract violation',
        whistleblower: 'Whistleblower retaliation',
        no_reason_given: 'No reason given',
        other: 'Other',
      }
      items.push({
        status: 'done',
        text: `Termination reason: ${reasons[answers.termination_reason]}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Identify the reason for your termination.',
      })
    }

    if (
      answers.termination_reason === 'discrimination' ||
      answers.termination_reason === 'retaliation'
    ) {
      if (answers.eeoc_filed === 'yes') {
        items.push({
          status: 'done',
          text: 'EEOC/TWC complaint filed.',
        })
        items.push({
          status: 'info',
          text: 'You need a right-to-sue letter before filing your lawsuit. You have 90 days after receiving it.',
        })
      } else if (answers.eeoc_filed === 'no') {
        items.push({
          status: 'needed',
          text: 'File an EEOC or TWC complaint before suing. Deadline: 180 days (TWC) or 300 days (EEOC).',
        })
      }
    }

    if (answers.termination_reason === 'contract_violation') {
      items.push({
        status: 'info',
        text: 'Breach of contract claims do not require EEOC filing. You can sue directly.',
      })
    }

    if (answers.termination_reason === 'whistleblower') {
      items.push({
        status: 'info',
        text: 'Public employee whistleblower claims have a 90-day deadline to file suit.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Gather evidence: termination letter, performance reviews, emails, witness names, handbook, pay stubs.',
    })

    return items
  },
}
