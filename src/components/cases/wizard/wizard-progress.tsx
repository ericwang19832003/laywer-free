interface WizardProgressProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
}

export function WizardProgress({ currentStep, totalSteps, onBack }: WizardProgressProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-warm-muted hover:text-warm-text transition-colors"
          aria-label="Go back"
        >
          &larr; Back
        </button>
      )}
      <div className="flex-1" />
      <span className="text-xs text-warm-muted">
        Step {currentStep} of {totalSteps}
      </span>
    </div>
  )
}
