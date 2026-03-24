'use client'

interface AnswerTypeStepProps {
  answerType: 'general_denial' | 'specific_answer' | ''
  onSelect: (type: 'general_denial' | 'specific_answer') => void
  hasCounterclaim: boolean
}

export function AnswerTypeStep({
  answerType,
  onSelect,
  hasCounterclaim,
}: AnswerTypeStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-warm-text">Choose Your Answer Type</h2>
        <p className="text-sm text-warm-muted mt-1">
          Select the type of answer you want to file with the court.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* General Denial card */}
        <button
          type="button"
          onClick={() => onSelect('general_denial')}
          className={`flex flex-col items-start rounded-lg border p-4 text-left transition-colors ${
            answerType === 'general_denial'
              ? 'border-primary bg-primary/5'
              : 'border-warm-border hover:bg-warm-bg/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-semibold text-warm-text">
              General Denial with Affirmative Defenses
            </p>
          </div>
          <span className="inline-block rounded-full bg-calm-indigo/10 px-2 py-0.5 text-xs text-calm-indigo mb-2">
            Recommended for most cases
          </span>
          <p className="text-sm text-warm-muted">
            Denies all of the plaintiff&apos;s allegations in one statement. Your selected
            defenses are listed separately as affirmative defenses. This is the simplest
            approach and works well in most debt cases.
          </p>
        </button>

        {/* Specific Answer card */}
        <button
          type="button"
          onClick={() => onSelect('specific_answer')}
          className={`flex flex-col items-start rounded-lg border p-4 text-left transition-colors ${
            answerType === 'specific_answer'
              ? 'border-primary bg-primary/5'
              : 'border-warm-border hover:bg-warm-bg/50'
          }`}
        >
          <p className="text-sm font-semibold text-warm-text mb-2">Specific Answer</p>
          <p className="text-sm text-warm-muted">
            Responds to each allegation in the plaintiff&apos;s petition individually
            (admit, deny, or lack knowledge). More detailed and time-consuming. Can include
            counterclaims.
          </p>
          {hasCounterclaim && (
            <div className="mt-3 rounded-lg border border-calm-indigo/20 bg-calm-indigo/5 p-3 text-xs text-warm-text">
              Because you selected FDCPA violations, a counterclaim for statutory damages
              will be included.
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
