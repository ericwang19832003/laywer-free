'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import {
  User,
  Building2,
  Landmark,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'

interface ServiceGuideProps {
  courtType: string // 'jp', 'county', 'district', 'federal'
  county: string | null
  onComplete?: () => void
}

type DefendantType = 'individual' | 'business' | 'government' | null

const TOTAL_STEPS = 4

export function ServiceGuide({ courtType, county, onComplete }: ServiceGuideProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [defendantType, setDefendantType] = useState<DefendantType>(null)
  const [checklist, setChecklist] = useState({
    knowWho: false,
    knowHow: false,
    understandProof: false,
  })

  const allChecked = checklist.knowWho && checklist.knowHow && checklist.understandProof
  const countyDisplay = county || 'your'

  function canGoNext(): boolean {
    if (currentStep === 1) return defendantType !== null
    return true
  }

  function handleNext() {
    if (currentStep < TOTAL_STEPS && canGoNext()) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // ------------------------------------------------------------------
  // Step 1: Who are you serving?
  // ------------------------------------------------------------------
  function renderStep1() {
    const options: { type: DefendantType; label: string; description: string; icon: React.ReactNode }[] = [
      {
        type: 'individual',
        label: 'Individual',
        description: 'A person',
        icon: <User className="h-5 w-5" />,
      },
      {
        type: 'business',
        label: 'Business',
        description: 'A company or organization',
        icon: <Building2 className="h-5 w-5" />,
      },
      {
        type: 'government',
        label: 'Government',
        description: 'A government agency',
        icon: <Landmark className="h-5 w-5" />,
      },
    ]

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-warm-text">Who are you serving?</h3>
          <p className="text-sm text-warm-muted mt-1">
            Select the type of party you need to deliver court papers to.
          </p>
        </div>

        <div className="space-y-3">
          {options.map((option) => {
            const isSelected = defendantType === option.type
            return (
              <Card
                key={option.type}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-calm-indigo bg-calm-indigo/5'
                    : 'border-warm-border hover:border-warm-border/80'
                }`}
                onClick={() => setDefendantType(option.type)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      isSelected
                        ? 'bg-calm-indigo/10 text-calm-indigo'
                        : 'bg-warm-bg text-warm-muted'
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warm-text">{option.label}</p>
                    <p className="text-xs text-warm-muted">{option.description}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-calm-indigo" />
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Step 2: How to serve them
  // ------------------------------------------------------------------
  function renderStep2() {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-warm-text">How to serve them</h3>
          <p className="text-sm text-warm-muted mt-1">
            Choose the method that works best for your situation.
          </p>
        </div>

        {defendantType === 'business' && renderBusinessInfo()}
        {defendantType === 'government' && renderGovernmentWarning()}

        {defendantType !== 'government' && renderServiceMethods()}
      </div>
    )
  }

  function renderBusinessInfo() {
    return (
      <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-4 space-y-2">
        <div className="flex items-start gap-2">
          <Building2 className="h-4 w-4 text-calm-indigo mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-warm-text">
              Businesses must be served through their &ldquo;registered agent&rdquo;
            </p>
            <p className="text-sm text-warm-muted mt-1">
              A registered agent is a person designated to receive legal documents on behalf of a
              business.
            </p>
            <HelpTooltip label="How do I find their registered agent?">
              <p>
                Visit the Texas Secretary of State website (
                <a
                  href="https://www.sos.state.tx.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-calm-indigo underline inline-flex items-center gap-0.5"
                >
                  sos.state.tx.us
                  <ExternalLink className="h-3 w-3" />
                </a>
                ) and search for the business name. The registered agent&apos;s name and address will
                be listed in the filing details.
              </p>
            </HelpTooltip>
          </div>
        </div>
      </div>
    )
  }

  function renderGovernmentWarning() {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-calm-amber/20 bg-calm-amber/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-calm-amber mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-warm-text">
              Special rules apply when suing a government entity.
            </p>
          </div>

          <ul className="space-y-2 ml-6">
            <li className="text-sm text-warm-muted">
              You may need to send a formal written notice of your claim{' '}
              <span className="font-medium text-warm-text">BEFORE</span> filing your lawsuit.
            </li>
            <li className="text-sm text-warm-muted">
              Government entities often have shorter deadlines &mdash; sometimes just{' '}
              <span className="font-medium text-warm-text">6 months</span> from the incident.
            </li>
            <li className="text-sm text-warm-muted">
              Service may need to go through the{' '}
              <span className="font-medium text-warm-text">Texas Attorney General&apos;s office</span>{' '}
              or a specific department.
            </li>
          </ul>

          <HelpTooltip label="What is the Texas Tort Claims Act?">
            <div className="space-y-2">
              <p>
                The Texas Tort Claims Act (TTCA) is the law that determines when you can sue a
                government entity in Texas. Normally, the government has &ldquo;sovereign
                immunity&rdquo; &mdash; meaning it can&apos;t be sued. The TTCA creates limited
                exceptions.
              </p>
              <p>
                <strong>Notice requirement:</strong> You must send written notice to the government
                entity within 6 months of the incident. The notice must describe the damage or
                injury, the time and place, and the incident itself.
              </p>
              <p>
                If you miss this notice deadline, your case may be dismissed regardless of its
                merits. Consider consulting a lawyer if you&apos;re suing a government entity.
              </p>
            </div>
          </HelpTooltip>
        </div>
      </div>
    )
  }

  function renderServiceMethods() {
    return (
      <div className="space-y-3">
        {/* Process Server — Recommended */}
        <Card className="border-warm-border">
          <CardContent className="py-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-warm-text">Hire a process server</p>
              <span className="shrink-0 rounded-full bg-calm-indigo/10 px-2.5 py-0.5 text-xs font-medium text-calm-indigo">
                Recommended
              </span>
            </div>
            <p className="text-sm text-warm-muted">
              A process server delivers court papers for you. They&apos;re usually $50&ndash;$150
              and it&apos;s the most reliable method.
            </p>
            <HelpTooltip label="Where do I find one?">
              <p>
                Search online for &ldquo;process server in {countyDisplay} County, Texas&rdquo; or
                check with the court clerk for a list.
              </p>
            </HelpTooltip>
          </CardContent>
        </Card>

        {/* Sheriff / Constable */}
        <Card className="border-warm-border">
          <CardContent className="py-4 space-y-2">
            <p className="text-sm font-medium text-warm-text">County sheriff / constable</p>
            <p className="text-sm text-warm-muted">
              The sheriff can deliver papers officially. May take longer but is very formal.
            </p>
            <p className="text-xs text-warm-muted">Typical cost: $75&ndash;$100</p>
          </CardContent>
        </Card>

        {/* Certified Mail — JP only */}
        {courtType === 'jp' && (
          <Card className="border-warm-border">
            <CardContent className="py-4 space-y-2">
              <p className="text-sm font-medium text-warm-text">Certified mail</p>
              <p className="text-sm text-warm-muted">
                For small claims, send papers by certified mail with return receipt.
              </p>
              <p className="text-xs text-warm-muted">Typical cost: $10&ndash;$15</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Step 3: What happens after service?
  // ------------------------------------------------------------------
  function renderStep3() {
    const personalDays = courtType === 'jp' ? '14' : '14–20'

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-warm-text">What happens after service?</h3>
          <p className="text-sm text-warm-muted mt-1">
            Here&apos;s what to expect once papers have been delivered.
          </p>
        </div>

        <Card className="border-warm-border">
          <CardContent className="py-4 space-y-4">
            {/* Response deadline */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-warm-text">
                After the papers are delivered, the other party has a deadline to respond:
              </p>
              <ul className="space-y-1.5 ml-4">
                <li className="text-sm text-warm-muted flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-calm-indigo shrink-0" />
                  <span>
                    <span className="font-medium text-warm-text">
                      Personal service (hand-delivered):
                    </span>{' '}
                    {personalDays} days
                  </span>
                </li>
                <li className="text-sm text-warm-muted flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-calm-indigo shrink-0" />
                  <span>
                    <span className="font-medium text-warm-text">Service by mail:</span> 26 days
                    (20 days + 6 extra for mail)
                  </span>
                </li>
              </ul>
            </div>

            {/* Return of Service */}
            <div className="border-t border-warm-border pt-4 space-y-2">
              <p className="text-sm font-medium text-warm-text">Return of Service</p>
              <p className="text-sm text-warm-muted">
                Your process server or the sheriff will give you a document called a{' '}
                <span className="font-medium text-warm-text">&ldquo;Return of Service.&rdquo;</span>{' '}
                This is your <span className="font-medium text-warm-text">PROOF</span> that papers
                were delivered.
              </p>
              <div className="rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-calm-indigo mt-0.5 shrink-0" />
                <p className="text-sm text-warm-text">
                  Upload the Return of Service in your next step &mdash; it&apos;s required to move
                  forward.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Step 4: Checklist
  // ------------------------------------------------------------------
  function renderStep4() {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-warm-text">Quick review</h3>
          <p className="text-sm text-warm-muted mt-1">
            Confirm you understand the service process before continuing.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-warm-border p-3">
            <Checkbox
              id="knowWho"
              checked={checklist.knowWho}
              onCheckedChange={(c) =>
                setChecklist((prev) => ({ ...prev, knowWho: c === true }))
              }
            />
            <Label htmlFor="knowWho" className="text-sm text-warm-text cursor-pointer">
              I know who I need to serve
            </Label>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-warm-border p-3">
            <Checkbox
              id="knowHow"
              checked={checklist.knowHow}
              onCheckedChange={(c) =>
                setChecklist((prev) => ({ ...prev, knowHow: c === true }))
              }
            />
            <Label htmlFor="knowHow" className="text-sm text-warm-text cursor-pointer">
              I know how I&apos;ll serve them
            </Label>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-warm-border p-3">
            <Checkbox
              id="understandProof"
              checked={checklist.understandProof}
              onCheckedChange={(c) =>
                setChecklist((prev) => ({ ...prev, understandProof: c === true }))
              }
            />
            <Label htmlFor="understandProof" className="text-sm text-warm-text cursor-pointer">
              I understand I need proof of service (Return of Service)
            </Label>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!allChecked}
          onClick={() => onComplete?.()}
        >
          <CheckCircle2 className="h-4 w-4" />
          I Understand the Service Process
        </Button>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const stepRenderers: Record<number, () => React.ReactNode> = {
    1: renderStep1,
    2: renderStep2,
    3: renderStep3,
    4: renderStep4,
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-warm-muted">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i + 1 <= currentStep ? 'bg-calm-indigo' : 'bg-warm-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      {stepRenderers[currentStep]?.()}

      {/* Navigation */}
      {currentStep < TOTAL_STEPS && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Back button on step 4 (Next is replaced by the completion button) */}
      {currentStep === TOTAL_STEPS && (
        <div className="flex items-center pt-2">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      )}
    </div>
  )
}
