'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  Monitor,
  Upload,
  CreditCard,
  FileCheck,
  HelpCircle
} from 'lucide-react'
import { LegalTerm } from '@/components/ui/legal-term'

export interface FilingGuideStep {
  step: number
  title: string
  description: string
  checklist: string[]
  helpUrl?: string
  tip?: string
}

export const TX_EFILING_GUIDE: FilingGuideStep[] = [
  {
    step: 1,
    title: 'Create Your Account',
    description: 'Start by creating an account on eFileTexas.gov',
    checklist: [
      'Go to eFileTexas.gov',
      'Click "Create Account" button',
      'Select "Individual" as your account type',
      'Enter your email address',
      'Create a strong password',
      'Verify your email address',
    ],
    tip: 'Use an email you check regularly — the court may send updates there.',
  },
  {
    step: 2,
    title: 'Add Your Profile Information',
    description: 'Complete your e-filing profile',
    checklist: [
      'Log in to your new account',
      'Navigate to "My Profile"',
      'Enter your full legal name',
      'Add your mailing address',
      'Enter your phone number',
      'Save your profile',
    ],
    tip: 'Make sure your name matches exactly what\'s on your ID.',
  },
  {
    step: 3,
    title: 'Start a New Filing',
    description: 'Begin the filing process for your case',
    checklist: [
      'Click "File a New Case"',
      'Select "Individual" as filer type',
      'Choose your court\'s county from the dropdown',
      'Select your court type (Justice, County, or District)',
      'Click "Start Filing"',
    ],
    tip: 'Double-check the county and court type — this determines where your case will be heard.',
  },
  {
    step: 4,
    title: 'Upload Your Documents',
    description: 'Submit your petition and required forms',
    checklist: [
      'Upload your signed petition PDF',
      'Add any required civil case information sheet',
      'Include the citation request form (if required)',
      'Verify all documents are complete and signed',
      'Add a clear description for each document',
    ],
    tip: 'Make sure your petition is signed before uploading. Unsigned petitions may be rejected.',
  },
  {
    step: 5,
    title: 'Pay Filing Fees',
    description: 'Submit payment for filing fees',
    checklist: [
      'Review the fee breakdown',
      'Select your payment method (credit card or e-check)',
      'Enter payment information securely',
      'Confirm the total amount',
      'Submit payment',
    ],
    tip: 'If you can\'t afford fees, ask about a fee waiver before paying. You can\'t get a refund after payment.',
  },
  {
    step: 6,
    title: 'Confirm and Submit',
    description: 'Finalize your filing',
    checklist: [
      'Review your filing summary',
      'Confirm all documents are correct',
      'Verify the case information',
      'Check the filing fees',
      'Click "Submit Filing"',
      'Save your confirmation number',
    ],
    tip: 'Write down or print your confirmation number — you\'ll need it to check your filing status.',
  },
]

export const CA_EFILING_GUIDE: FilingGuideStep[] = [
  {
    step: 1,
    title: 'Create an Account',
    description: 'Set up your One Legal or SFSC portal account',
    checklist: [
      'Visit the California e-filing portal',
      'Create your account',
      'Verify your email',
    ],
  },
  {
    step: 2,
    title: 'Prepare Documents',
    description: 'Gather and prepare your court documents',
    checklist: [
      'Complete your civil cover sheet',
      'Prepare your petition',
      'Include any addenda',
    ],
  },
  {
    step: 3,
    title: 'Submit Filing',
    description: 'Upload and pay for your filing',
    checklist: [
      'Upload documents',
      'Pay filing fees',
      'Submit',
    ],
  },
]

interface EfilingGuideProps {
  state?: string
  courtType?: string
  county?: string
  onComplete?: () => void
  className?: string
}

export function EfilingGuide({
  state = 'TX',
  courtType,
  county,
  onComplete,
  className,
}: EfilingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const guide = state === 'CA' ? CA_EFILING_GUIDE : TX_EFILING_GUIDE
  const step = guide[currentStep]
  const isLastStep = currentStep === guide.length - 1
  const progress = ((currentStep + 1) / guide.length) * 100

  const markComplete = () => {
    if (!completedSteps.includes(step.step)) {
      setCompletedSteps([...completedSteps, step.step])
    }
  }

  const handleNext = () => {
    markComplete()
    if (isLastStep) {
      onComplete?.()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4 text-calm-indigo" />
            How to File Online
          </CardTitle>
          {state === 'TX' && (
            <a
              href="https://eFileTexas.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-calm-indigo hover:underline flex items-center gap-1"
            >
              eFileTexas.gov
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <p className="text-sm text-warm-muted">
          Step {currentStep + 1} of {guide.length}
        </p>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Content */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-warm-text mb-1">
              Step {step.step}: {step.title}
            </h3>
            <p className="text-sm text-warm-muted">{step.description}</p>
          </div>

          {/* Checklist */}
          <div className="bg-warm-bg rounded-lg p-4 space-y-2">
            {step.checklist.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-warm-border flex items-center justify-center shrink-0 mt-0.5">
                  {completedSteps.includes(step.step) && index < step.checklist.length - 1 ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-calm-green" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-warm-muted" />
                  )}
                </div>
                <span className="text-sm text-warm-text">{item}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          {step.tip && (
            <div className="bg-calm-indigo/5 rounded-lg p-3">
              <p className="text-sm text-warm-text">
                <span className="font-medium text-calm-indigo">Tip: </span>
                {step.tip}
              </p>
            </div>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-1">
          {guide.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                index === currentStep
                  ? 'bg-calm-indigo'
                  : completedSteps.includes(guide[index].step)
                  ? 'bg-calm-green'
                  : 'bg-warm-border'
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-sm"
          >
            ← Back
          </Button>
          <Button onClick={handleNext} className="gap-2">
            {isLastStep ? (
              <>
                I&apos;ve Completed This
                <CheckCircle2 className="h-4 w-4" />
              </>
            ) : (
              <>
                Next Step
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Help */}
        <div className="text-center pt-2">
          <button className="text-sm text-warm-muted hover:text-calm-indigo flex items-center gap-1 mx-auto">
            <HelpCircle className="h-3.5 w-3.5" />
            Need help with e-filing?
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

interface FilingChecklistProps {
  items: Array<{
    id: string
    label: string
    description?: string
    checked: boolean
    onChange: (checked: boolean) => void
  }>
  onAllComplete?: () => void
  className?: string
}

export function FilingChecklist({ items, onAllComplete, className }: FilingChecklistProps) {
  const completedCount = items.filter((item) => item.checked).length
  const allComplete = completedCount === items.length
  const progress = (completedCount / items.length) * 100

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-calm-indigo" />
          Filing Checklist
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span className="text-warm-muted">
            {completedCount} of {items.length} complete
          </span>
          {allComplete && (
            <span className="text-calm-green font-medium">
              Ready to file! ✓
            </span>
          )}
        </div>
        <Progress value={progress} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
              item.checked
                ? 'border-calm-green/30 bg-calm-green/5'
                : 'border-warm-border hover:border-calm-indigo/50'
            )}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => item.onChange(e.target.checked)}
              className="mt-1 rounded border-warm-border text-calm-indigo focus:ring-calm-indigo"
            />
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium',
                item.checked ? 'text-calm-green' : 'text-warm-text'
              )}>
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-warm-muted mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </label>
        ))}

        {allComplete && onAllComplete && (
          <Button onClick={onAllComplete} className="w-full mt-4">
            Start Filing Process →
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
