'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Send, 
  Clock, 
  Search, 
  Gavel, 
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react'

export interface FilingTimelineEvent {
  phase: 'filing' | 'service' | 'answer' | 'discovery' | 'trial' | 'resolution'
  title: string
  description: string
  deadlineDays?: number
  deadlineDate?: string
  status: 'completed' | 'current' | 'upcoming' | 'future'
  resources?: Array<{ label: string; url?: string }>
  tip?: string
}

export interface FilingTimelineProps {
  events: FilingTimelineEvent[]
  filingDate?: string
  className?: string
}

const PHASE_ICONS: Record<string, React.ElementType> = {
  filing: FileText,
  service: Send,
  answer: Clock,
  discovery: Search,
  trial: Gavel,
  resolution: CheckCircle2,
}

const PHASE_LABELS: Record<string, string> = {
  filing: 'File Petition',
  service: 'Serve Defendant',
  answer: 'Await Answer',
  discovery: 'Discovery',
  trial: 'Trial',
  resolution: 'Resolution',
}

export function FilingTimeline({ events, filingDate, className }: FilingTimelineProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold text-warm-text">
        After You File
      </h3>
      <p className="text-sm text-warm-muted">
        Here&apos;s what to expect and when. We&apos;ll send reminders before each deadline.
      </p>

      <div className="relative space-y-0">
        {/* Timeline line */}
        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-warm-border" />

        {events.map((event, index) => {
          const Icon = PHASE_ICONS[event.phase] || FileText
          const isLast = index === events.length - 1

          return (
            <div key={event.phase} className="relative flex gap-4">
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                  event.status === 'completed'
                    ? 'bg-calm-green/10 text-calm-green'
                    : event.status === 'current'
                    ? 'bg-calm-indigo/10 text-calm-indigo ring-4 ring-calm-indigo/10'
                    : 'bg-warm-bg text-warm-muted'
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Content */}
              <div className={cn(
                'flex-1 pb-8',
                isLast && 'pb-0'
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={cn(
                      'font-semibold',
                      event.status === 'future' ? 'text-warm-muted' : 'text-warm-text'
                    )}>
                      {event.title}
                    </h4>
                    <p className="text-sm text-warm-muted mt-0.5">
                      {event.description}
                    </p>
                  </div>
                  {event.status === 'current' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-calm-indigo bg-calm-indigo/10 px-2 py-1 rounded-full">
                      You&apos;re here
                    </span>
                  )}
                </div>

                {/* Deadline */}
                {event.deadlineDays && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-warm-muted" />
                    <span className="text-warm-muted">
                      {event.deadlineDays > 0
                        ? `${event.deadlineDays} days to complete`
                        : 'Deadline approaching'}
                    </span>
                    {event.deadlineDate && (
                      <span className="text-warm-text">
                        (by {event.deadlineDate})
                      </span>
                    )}
                  </div>
                )}

                {/* Tip */}
                {event.tip && (
                  <div className="mt-2 bg-warm-bg rounded-lg p-2">
                    <p className="text-xs text-warm-muted">
                      {event.tip}
                    </p>
                  </div>
                )}

                {/* Resources */}
                {event.resources && event.resources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.resources.map((resource) => (
                      <a
                        key={resource.label}
                        href={resource.url || '#'}
                        className="text-xs text-calm-indigo hover:underline"
                      >
                        {resource.label} →
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function getDefaultFilingTimeline(filingDate: string): FilingTimelineEvent[] {
  const filing = new Date(filingDate)
  const serviceDeadline = new Date(filing)
  serviceDeadline.setDate(serviceDeadline.getDate() + 30)
  const proofDeadline = new Date(serviceDeadline)
  proofDeadline.setDate(proofDeadline.getDate() + 7)
  const answerDeadline = new Date(serviceDeadline)
  answerDeadline.setDate(answerDeadline.getDate() + 20)

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return [
    {
      phase: 'filing',
      title: 'File Your Petition',
      description: 'Submit your petition to the court either online or in person.',
      status: 'completed',
      tip: 'Save your confirmation number!',
    },
    {
      phase: 'service',
      title: 'Serve the Defendant',
      description: 'Formally deliver the petition and citation to the defendant.',
      deadlineDays: 30,
      deadlineDate: formatDate(serviceDeadline),
      status: 'current',
      tip: 'Options include sheriff, constable, or certified mail (depending on your court).',
    },
    {
      phase: 'answer',
      title: 'File Proof of Service',
      description: 'Submit proof that the defendant was served.',
      deadlineDays: 7,
      deadlineDate: formatDate(proofDeadline),
      status: 'upcoming',
      tip: 'The person who served the documents must sign the proof.',
    },
    {
      phase: 'answer',
      title: 'Await Defendant\'s Answer',
      description: 'The defendant has until this date to respond to your petition.',
      deadlineDays: 20,
      deadlineDate: formatDate(answerDeadline),
      status: 'upcoming',
    },
    {
      phase: 'discovery',
      title: 'Discovery Period',
      description: 'Exchange information and evidence with the other party.',
      status: 'future',
    },
    {
      phase: 'trial',
      title: 'Trial or Settlement',
      description: 'Present your case to the judge or reach a settlement.',
      status: 'future',
    },
  ]
}
