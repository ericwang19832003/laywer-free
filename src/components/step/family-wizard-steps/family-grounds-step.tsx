'use client'

import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'

interface FamilyGroundsStepProps {
  familySubType: string
  grounds: string
  additionalFacts: string
  divorceGroundsType: string
  onGroundsChange: (v: string) => void
  onAdditionalFactsChange: (v: string) => void
  onDivorceGroundsTypeChange: (v: string) => void
}

const INSUPPORTABILITY_TEXT =
  'The marriage has become insupportable due to discord or conflict of personalities that destroys the legitimate ends of the marital relationship and prevents any reasonable expectation of reconciliation.'

const divorceGroundsOptions = [
  {
    value: 'insupportability',
    label: 'Insupportability (no-fault)',
    description: 'The most common ground. No need to prove the other spouse did anything wrong.',
    recommended: true,
  },
  {
    value: 'cruelty',
    label: 'Cruelty',
    description: 'The other spouse treated you in a way that makes living together insupportable.',
    recommended: false,
  },
  {
    value: 'adultery',
    label: 'Adultery',
    description: 'The other spouse committed adultery during the marriage.',
    recommended: false,
  },
  {
    value: 'felony_conviction',
    label: 'Conviction of felony',
    description: 'The other spouse was convicted of a felony and imprisoned for at least one year.',
    recommended: false,
  },
  {
    value: 'abandonment',
    label: 'Abandonment (1+ year)',
    description: 'The other spouse left with the intention of abandonment and has been gone for at least one year.',
    recommended: false,
  },
  {
    value: 'living_apart',
    label: 'Living apart (3+ years)',
    description: 'You and your spouse have lived apart without cohabitation for at least three years.',
    recommended: false,
  },
  {
    value: 'mental_hospital',
    label: 'Confinement in mental hospital',
    description: 'The other spouse has been confined in a mental hospital for at least three years with little prospect of recovery.',
    recommended: false,
  },
]

function getSubTypePrompt(familySubType: string): { label: string; placeholder: string; helpText: string } {
  switch (familySubType) {
    case 'custody':
      return {
        label: 'Why are you seeking this custody arrangement?',
        placeholder: 'Describe why this custody arrangement is in the best interest of the children...',
        helpText: 'Focus on the children\'s needs, your involvement in their daily lives, and any concerns about the other parent\'s ability to care for them.',
      }
    case 'child_support':
      return {
        label: 'Why is support needed?',
        placeholder: 'Describe the children\'s needs and the financial situation...',
        helpText: 'Include information about the children\'s expenses, your financial situation, and the other parent\'s ability to contribute.',
      }
    case 'visitation':
      return {
        label: 'Why do you need a visitation schedule?',
        placeholder: 'Describe the current situation and what schedule would be best for the children...',
        helpText: 'Explain why a formal visitation schedule is needed and what arrangement would serve the children\'s best interests.',
      }
    case 'protective_order':
      return {
        label: 'Describe the violence or threats you\'ve experienced.',
        placeholder: 'Take your time. Include dates, descriptions, and any witnesses if possible...',
        helpText: 'Include specific incidents with dates, what happened, any injuries, threats made, and the names of any witnesses. Police reports and medical records can be referenced here.',
      }
    case 'modification':
      return {
        label: 'What has changed since the last order?',
        placeholder: 'Describe the material and substantial change in circumstances...',
        helpText: 'Explain what has changed since the original order was entered. Include specific facts like changes in income, living situations, the children\'s needs, or safety concerns.',
      }
    case 'spousal_support':
      return {
        label: 'Why do you need spousal maintenance?',
        placeholder: 'Describe your financial situation and why maintenance is necessary...',
        helpText: 'Include information about the length of your marriage, your ability to earn income, any disabilities, and your minimum reasonable needs.',
      }
    default:
      return {
        label: 'Tell us about your situation',
        placeholder: 'Describe the facts of your case...',
        helpText: 'Provide as much relevant detail as possible about your situation.',
      }
  }
}

function getExampleText(familySubType: string): string | null {
  switch (familySubType) {
    case 'custody':
      return 'Example: The children live with me most school nights. I am asking for a schedule that keeps their school routine stable and allows the other parent regular weekends.'
    case 'child_support':
      return 'Example: I pay for most daily expenses and need support to cover school, medical, and childcare costs.'
    case 'visitation':
      return 'Example: We do not have a consistent schedule. A standard weekend and holiday plan would help the children.'
    case 'protective_order':
      return 'Example: On January 10, 2026, the respondent threatened me at work. A police report was filed. I am asking for no contact and to stay away from my home.'
    case 'modification':
      return 'Example: Since the last order, my work schedule changed and the children now live primarily with me during the week.'
    case 'spousal_support':
      return 'Example: I have been out of the workforce for years and need temporary support while I find stable employment.'
    case 'divorce':
      return 'Example: We separated in June 2024 and have been living apart. We are seeking a no-fault divorce.'
    default:
      return null
  }
}

export function FamilyGroundsStep({
  familySubType,
  grounds,
  additionalFacts,
  divorceGroundsType,
  onGroundsChange,
  onAdditionalFactsChange,
  onDivorceGroundsTypeChange,
}: FamilyGroundsStepProps) {
  const isDivorce = familySubType === 'divorce'

  function handleDivorceGroundsSelect(value: string) {
    onDivorceGroundsTypeChange(value)
    if (value === 'insupportability') {
      onGroundsChange(INSUPPORTABILITY_TEXT)
    } else {
      // Clear auto-filled text when switching to fault-based
      if (grounds === INSUPPORTABILITY_TEXT) {
        onGroundsChange('')
      }
    }
  }

  if (isDivorce) {
    return (
      <div className="space-y-6">
        {/* Divorce grounds selection */}
        <div>
          <Label className="text-sm font-medium text-warm-text">
            Why are you seeking a divorce?
          </Label>
          <HelpTooltip label="Which ground should I choose?">
            <p>
              Most Texas divorces are filed under &quot;insupportability&quot; (no-fault).
              This means you don&apos;t have to prove the other spouse did anything wrong.
              Fault-based grounds (like cruelty or adultery) can sometimes affect property
              division, but they require more evidence.
            </p>
          </HelpTooltip>

          <div className="space-y-3 mt-3">
            {divorceGroundsOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 cursor-pointer rounded-lg border p-4 transition-colors ${
                  divorceGroundsType === option.value
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:bg-warm-bg/50'
                }`}
              >
                <input
                  type="radio"
                  name="divorce-grounds"
                  value={option.value}
                  checked={divorceGroundsType === option.value}
                  onChange={(e) => handleDivorceGroundsSelect(e.target.value)}
                  className="mt-1 h-4 w-4 shrink-0 text-calm-indigo focus:ring-calm-indigo"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-warm-text">
                      {option.label}
                    </span>
                    {option.recommended && (
                      <span className="rounded-full bg-calm-indigo/10 px-2 py-0.5 text-xs font-medium text-calm-indigo">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-warm-muted mt-0.5">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Grounds text — auto-filled for insupportability, editable for fault-based */}
        {divorceGroundsType === 'insupportability' && (
          <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4">
            <p className="text-xs font-medium text-warm-muted mb-1">
              Standard insupportability language (auto-filled)
            </p>
            <p className="text-sm text-warm-text italic">{INSUPPORTABILITY_TEXT}</p>
          </div>
        )}

        {divorceGroundsType && divorceGroundsType !== 'insupportability' && (
          <div>
            <Label htmlFor="fault-grounds" className="text-sm font-medium text-warm-text">
              Describe the facts supporting your claim
            </Label>
            <HelpTooltip label="What should I include?">
              <p>
                Be specific about dates, incidents, and impact. For cruelty, describe the
                behavior and how it affects you. For adultery, include dates and circumstances
                you are aware of. The more detail you provide, the stronger your case.
              </p>
            </HelpTooltip>
            <textarea
              id="fault-grounds"
              value={grounds}
              onChange={(e) => onGroundsChange(e.target.value)}
              placeholder="Describe the specific facts that support this ground for divorce..."
              className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              style={{ minHeight: '120px' }}
              rows={5}
            />
          </div>
        )}

        {/* Additional facts */}
        <div>
          <Label htmlFor="additional-facts" className="text-sm font-medium text-warm-text">
            Any additional facts? (optional)
          </Label>
          <textarea
            id="additional-facts"
            value={additionalFacts}
            onChange={(e) => onAdditionalFactsChange(e.target.value)}
            placeholder="Any other relevant information the court should know..."
            className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ minHeight: '80px' }}
            rows={3}
          />
        </div>
      </div>
    )
  }

  // Non-divorce sub-types
  const prompt = getSubTypePrompt(familySubType)
  const exampleText = getExampleText(familySubType)
  const isProtectiveOrder = familySubType === 'protective_order'

  return (
    <div className="space-y-6">
      {/* Safety-aware prompt for protective orders */}
      {isProtectiveOrder && (
        <div className="rounded-lg border border-calm-amber/30 bg-calm-amber/5 p-4">
          <p className="text-sm text-warm-text">
            <strong>Take your time.</strong> Include dates, descriptions, and any witnesses
            if possible. Your safety is the priority. If you need to stop and come back later,
            your progress will be saved.
          </p>
        </div>
      )}

      {/* Main grounds / situation */}
      <div>
        <Label htmlFor="grounds" className="text-sm font-medium text-warm-text">
          {prompt.label}
        </Label>
        <HelpTooltip label="What should I include?">
          <p>{prompt.helpText}</p>
        </HelpTooltip>
        <textarea
          id="grounds"
          value={grounds}
          onChange={(e) => onGroundsChange(e.target.value)}
          placeholder={prompt.placeholder}
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: '150px' }}
          rows={6}
        />
      </div>

      {exampleText && (
        <div className="rounded-lg border border-warm-border bg-warm-bg/50 p-3 text-xs text-warm-muted">
          <span className="font-semibold text-warm-text">Example:</span> {exampleText}
        </div>
      )}

      {/* Additional facts */}
      <div>
        <Label htmlFor="additional-facts-other" className="text-sm font-medium text-warm-text">
          Any additional facts? (optional)
        </Label>
        <textarea
          id="additional-facts-other"
          value={additionalFacts}
          onChange={(e) => onAdditionalFactsChange(e.target.value)}
          placeholder="Any other relevant information the court should know..."
          className="mt-2 w-full rounded-md border border-warm-border bg-white px-3 py-2 text-sm text-warm-text placeholder:text-warm-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ minHeight: '80px' }}
          rows={3}
        />
      </div>
    </div>
  )
}
