import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CelebrationMessage {
  title: string
  description: string
  details?: string[]
}

export const SECTION_CELEBRATIONS: Record<string, CelebrationMessage> = {
  parties: {
    title: 'Parties section complete!',
    description: 'You\'ve identified everyone involved in your case.',
    details: [
      'The plaintiff (you) is clearly identified',
      'The defendant(s) are listed with contact information',
      'The court will know who is involved in this case',
    ],
  },
  venue: {
    title: 'Venue section complete!',
    description: 'You\'ve picked the right court for your case.',
    details: [
      'The correct court type has been selected',
      'The proper county has been identified',
      'Your case will be filed in the right location',
    ],
  },
  facts: {
    title: 'Facts section complete!',
    description: 'You\'ve told your story. The court will understand what happened.',
    details: [
      'The incident has been described',
      'Important dates have been noted',
      'The location of the incident is documented',
    ],
  },
  claims: {
    title: 'Claims section complete!',
    description: 'You\'ve identified why the defendant is responsible.',
    details: [
      'The legal basis for your case has been established',
      'Supporting details have been included',
      'The court will understand your legal arguments',
    ],
  },
  relief: {
    title: 'Relief section complete!',
    description: 'You\'ve told the court what you\'re asking for.',
    details: [
      'The requested damages amount has been specified',
      'Additional relief requests have been noted',
      'Court costs have been addressed',
    ],
  },
  review: {
    title: 'Review complete!',
    description: 'Everything looks good. You\'re ready to file!',
    details: [
      'All information has been verified',
      'The petition is complete and accurate',
      'You\'re prepared to submit your filing',
    ],
  },
  preflight: {
    title: 'Ready to begin!',
    description: 'You\'ve confirmed you have what you need.',
    details: [
      'You understand the process ahead',
      'You have access to relevant documents',
      'You\'re prepared to provide accurate information',
    ],
  },
  how_to_file: {
    title: 'Filing method selected!',
    description: 'You\'ve chosen how to submit your petition.',
    details: [
      'The filing method has been determined',
      'You know the next steps for submission',
      'Court fees have been reviewed',
    ],
  },
}

export const WIZARD_COMPLETION_MESSAGES = {
  start: {
    title: 'Let\'s get started!',
    description: 'We\'ll guide you through each step of preparing your petition.',
  },
  mid_progress: (completed: number, total: number) => ({
    title: 'You\'re making great progress!',
    description: `You've completed ${completed} of ${total} sections. Keep going!`,
  }),
  almost_done: {
    title: 'Almost there!',
    description: 'Just one more section to go. You\'re doing great!',
  },
  complete: {
    title: 'Petition complete!',
    description: 'You\'ve finished all sections. Review and submit when ready.',
  },
}

export interface CelebrationBannerProps {
  sectionId: string
  onDismiss?: () => void
  className?: string
}

export function CelebrationBanner({ sectionId, onDismiss, className }: CelebrationBannerProps) {
  const celebration = SECTION_CELEBRATIONS[sectionId]
  if (!celebration) return null

  return (
    <div
      className={cn(
        'rounded-lg border border-calm-green/30 bg-calm-green/5 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-calm-green shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-calm-green">{celebration.title}</h3>
          <p className="text-sm text-warm-muted">{celebration.description}</p>
          {celebration.details && celebration.details.length > 0 && (
            <ul className="space-y-1 mt-3">
              {celebration.details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-calm-green mt-0.5">✓</span>
                  <span className="text-warm-muted">{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export interface ProgressStatsProps {
  sectionsCompleted: number
  totalSections: number
  questionsAnswered: number
  totalQuestions: number
  estimatedMinutes: number
  className?: string
}

export function ProgressStats({
  sectionsCompleted,
  totalSections,
  questionsAnswered,
  totalQuestions,
  estimatedMinutes,
  className,
}: ProgressStatsProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-warm-muted">Sections</span>
        <span className="font-medium text-warm-text">
          {sectionsCompleted} of {totalSections} complete
        </span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-warm-muted">Questions</span>
        <span className="font-medium text-warm-text">
          {questionsAnswered} of {totalQuestions} answered
        </span>
      </div>
      {estimatedMinutes > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-warm-muted">Time spent</span>
          <span className="font-medium text-warm-text">
            ~{estimatedMinutes} minutes
          </span>
        </div>
      )}
      {sectionsCompleted >= 2 && sectionsCompleted < totalSections && (
        <div className="pt-2 border-t border-warm-border">
          <p className="text-xs text-warm-muted italic">
            On average, filing a petition takes 45-60 minutes. You&apos;re doing great!
          </p>
        </div>
      )}
    </div>
  )
}
