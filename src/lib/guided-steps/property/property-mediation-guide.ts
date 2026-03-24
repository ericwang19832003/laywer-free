import type { GuidedStepConfig } from '../types'

export const propertyMediationGuideConfig: GuidedStepConfig = {
  title: 'Preparing for Mediation',
  reassurance:
    'Most property disputes settle in mediation. Good preparation is your biggest advantage.',

  questions: [
    {
      id: 'ideal_outcome',
      type: 'single_choice',
      prompt: 'What is your ideal outcome from mediation?',
      options: [
        { value: 'full_repair_cost', label: 'Full repair/replacement cost' },
        { value: 'partial_payment', label: 'Partial payment or compromise' },
        { value: 'injunction_stop_behavior', label: 'Stop the damaging behavior' },
        { value: 'boundary_resolution', label: 'Resolve a boundary dispute' },
        { value: 'other', label: 'Other outcome' },
      ],
    },
    {
      id: 'full_repair_strategy',
      type: 'info',
      prompt:
        'STRATEGY FOR FULL REPAIR COST:\nBring multiple contractor estimates (3+) to justify the amount. Show the mediator that your number is based on real market rates, not emotion. Be prepared to negotiate on payment timing (lump sum vs. installments) but hold firm on the total amount.',
      showIf: (answers) => answers.ideal_outcome === 'full_repair_cost',
    },
    {
      id: 'partial_payment_strategy',
      type: 'info',
      prompt:
        'STRATEGY FOR PARTIAL PAYMENT:\nKnow exactly what percentage you are willing to accept and why. Frame your compromise as reasonable — e.g., "I\'m willing to split the fence cost 50/50 since it benefits both properties." Have your full damage number ready so the mediator sees you are already compromising.',
      showIf: (answers) => answers.ideal_outcome === 'partial_payment',
    },
    {
      id: 'injunction_strategy',
      type: 'info',
      prompt:
        'STRATEGY FOR STOPPING THE BEHAVIOR:\nFocus on specific, measurable terms — not "stop being a bad neighbor" but "remove the structure within 30 days" or "cease water diversion by [date]." Include consequences for violation in the written agreement. Consider requesting a monitoring mechanism.',
      showIf: (answers) => answers.ideal_outcome === 'injunction_stop_behavior',
    },
    {
      id: 'boundary_strategy',
      type: 'info',
      prompt:
        'STRATEGY FOR BOUNDARY RESOLUTION:\nBring your survey and deed. Propose a clear, permanent solution — a new survey both parties agree to, a boundary line agreement recorded with the county, or a negotiated easement. The goal is a recorded document that prevents future disputes.',
      showIf: (answers) => answers.ideal_outcome === 'boundary_resolution',
    },
    {
      id: 'other_strategy',
      type: 'info',
      prompt:
        'GENERAL MEDIATION STRATEGY:\nClearly define what you want before mediation starts. Write it down. Be specific about amounts, timelines, and actions. The mediator will ask "what would resolve this for you?" — have a clear answer ready.',
      showIf: (answers) => answers.ideal_outcome === 'other',
    },
    {
      id: 'mediation_checklist',
      type: 'info',
      prompt:
        'MEDIATION CHECKLIST:\n1. Know your total damages (repair + diminished value + loss of use)\n2. Know your walk-away point (minimum acceptable settlement)\n3. Bring ALL evidence (photos, estimates, timeline)\n4. Be prepared to compromise on timing (payment plan) but not on amount\n5. Demand written agreement before leaving mediation',
    },
    {
      id: 'red_flags',
      type: 'info',
      prompt:
        'RED FLAGS FOR BAD MEDIATION AGREEMENTS:\n• Vague language ("reasonable efforts" instead of specific deadlines)\n• No enforcement mechanism (what happens if they don\'t pay or comply?)\n• Verbal promises not included in the written agreement\n• Waiving your right to sue without getting everything you need\n• Payment plans with no collateral or penalty for default\n• Agreements that don\'t get recorded with the county (for property rights)',
    },
  ],

  generateSummary(answers) {
    const items: { status: 'done' | 'needed' | 'info'; text: string }[] = []

    if (answers.ideal_outcome) {
      const labels: Record<string, string> = {
        full_repair_cost: 'full repair/replacement cost',
        partial_payment: 'partial payment or compromise',
        injunction_stop_behavior: 'stopping the damaging behavior',
        boundary_resolution: 'boundary dispute resolution',
        other: 'other outcome',
      }
      items.push({
        status: 'done',
        text: `Ideal mediation outcome: ${labels[answers.ideal_outcome] || answers.ideal_outcome}.`,
      })
    } else {
      items.push({
        status: 'needed',
        text: 'Define your ideal mediation outcome before attending.',
      })
    }

    items.push({
      status: 'needed',
      text: 'Calculate your total damages (repair + diminished value + loss of use).',
    })

    items.push({
      status: 'needed',
      text: 'Determine your walk-away point — the minimum acceptable settlement.',
    })

    items.push({
      status: 'info',
      text: 'Bring all evidence to mediation: photos, estimates, timeline, and communications.',
    })

    items.push({
      status: 'info',
      text: 'Do not leave mediation without a signed, written agreement that includes specific deadlines and enforcement terms.',
    })

    return items
  },
}
