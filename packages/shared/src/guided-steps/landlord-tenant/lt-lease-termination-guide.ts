import type { GuidedStepConfig } from '../types'

export const ltLeaseTerminationGuideConfig: GuidedStepConfig = {
  title: 'Ending Your Lease Early',
  reassurance:
    'Texas law provides specific protections for tenants who need to leave a lease early — especially military members and domestic violence survivors.',

  questions: [
    {
      id: 'termination_reason',
      type: 'single_choice',
      prompt: 'Why do you need to terminate your lease early?',
      helpText:
        'Your reason affects which legal protections apply and what steps you need to take.',
      options: [
        { value: 'military_deployment', label: 'Military deployment or orders' },
        { value: 'domestic_violence', label: 'Domestic violence' },
        { value: 'uninhabitable', label: 'Property is uninhabitable' },
        { value: 'landlord_breach', label: 'Landlord breached the lease' },
        { value: 'relocating', label: 'Relocating for work or personal reasons' },
        { value: 'other', label: 'Other reason' },
      ],
    },
    {
      id: 'military_info',
      type: 'info',
      prompt:
        'MILITARY PROTECTION:\nThe Servicemembers Civil Relief Act (SCRA) and Tex. Property Code §92.017 protect you. You can terminate your lease with 30 days\' written notice plus a copy of your deployment or PCS orders. The lease terminates 30 days after the NEXT rent payment is due. The landlord cannot charge an early termination fee. This applies to active duty, reserves called to active duty, and National Guard members.',
      showIf: (answers) => answers.termination_reason === 'military_deployment',
    },
    {
      id: 'dv_info',
      type: 'info',
      prompt:
        'DOMESTIC VIOLENCE PROTECTION:\nUnder Tex. Property Code §92.016, you can terminate your lease if you are a victim of domestic violence, sexual assault, or stalking. You need: (1) a protective order, (2) a police report, or (3) documentation from a licensed health care provider or advocate. Provide written notice to the landlord with a copy of the documentation. The landlord cannot charge an early termination penalty. Your security deposit rights still apply.',
      showIf: (answers) => answers.termination_reason === 'domestic_violence',
    },
    {
      id: 'uninhabitable_info',
      type: 'info',
      prompt:
        'CONSTRUCTIVE EVICTION:\nIf the landlord won\'t fix serious conditions that affect your health or safety (no heat, sewage backup, mold, structural damage), you may have grounds for "constructive eviction." Steps: (1) Give WRITTEN notice of the problem, (2) Allow reasonable time for repair, (3) If landlord fails to act, send a second written notice stating you will vacate if not repaired within a reasonable time, (4) Vacate the property. Document everything with photos, dates, and written correspondence.',
      showIf: (answers) => answers.termination_reason === 'uninhabitable',
    },
    {
      id: 'landlord_breach_info',
      type: 'info',
      prompt:
        'LANDLORD BREACH OF LEASE:\nIf the landlord has materially breached the lease, you may be able to terminate. Common breaches include: entering your unit without proper notice, failing to maintain common areas, shutting off utilities, changing locks without authorization, or harassment. Document the breach in writing, give the landlord notice and a reasonable opportunity to cure, and if they don\'t, you may have grounds to terminate without penalty.',
      showIf: (answers) => answers.termination_reason === 'landlord_breach',
    },
    {
      id: 'relocating_info',
      type: 'info',
      prompt:
        'RELOCATING WITHOUT LEGAL PROTECTION:\nIf you don\'t qualify for a statutory exception, your options include:\n- Check your lease for an early termination clause (many leases allow termination with 1-2 months\' rent as a fee)\n- Negotiate with your landlord — many prefer a cooperative move-out over chasing rent\n- Subletting or assigning the lease (if allowed by your lease)\n- Finding a replacement tenant to take over the lease\n- The landlord has a duty to mitigate damages — they must make reasonable efforts to re-rent the unit',
      showIf: (answers) =>
        answers.termination_reason === 'relocating' ||
        answers.termination_reason === 'other',
    },
    {
      id: 'written_notice_info',
      type: 'info',
      prompt:
        'ALWAYS GIVE WRITTEN NOTICE:\nRegardless of reason, notify your landlord IN WRITING. Send via certified mail. State: your name, the property address, your reason for terminating, the date you\'ll vacate, and your forwarding address for the security deposit.',
      helpText:
        'Certified mail creates proof that the landlord received your notice. Keep the receipt and a copy of the letter.',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.termination_reason === 'military_deployment') {
      items.push({
        status: 'info',
        text: 'You are protected under SCRA and Tex. Property Code §92.017.',
      })
      items.push({
        status: 'needed',
        text: 'Send 30 days\' written notice with a copy of your deployment or PCS orders.',
      })
    } else if (answers.termination_reason === 'domestic_violence') {
      items.push({
        status: 'info',
        text: 'You are protected under Tex. Property Code §92.016.',
      })
      items.push({
        status: 'needed',
        text: 'Provide written notice with a protective order, police report, or provider documentation.',
      })
    } else if (answers.termination_reason === 'uninhabitable') {
      items.push({
        status: 'needed',
        text: 'Send written notice of the habitability issue and allow reasonable time for repair.',
      })
      items.push({
        status: 'needed',
        text: 'Document conditions with photos, dates, and all written correspondence.',
      })
    } else if (answers.termination_reason === 'landlord_breach') {
      items.push({
        status: 'needed',
        text: 'Document the breach in writing and give the landlord notice and opportunity to cure.',
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Check your lease for an early termination clause or negotiate with your landlord.',
      })
      items.push({
        status: 'info',
        text: 'The landlord has a legal duty to mitigate damages by making reasonable efforts to re-rent.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Send written termination notice via certified mail with your name, address, reason, vacate date, and forwarding address.',
    })

    return items
  },
}
