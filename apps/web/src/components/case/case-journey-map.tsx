'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FileText, 
  Send, 
  MessageSquare, 
  Search, 
  Scale,
  CheckCircle2,
  AlertCircle,
  Calendar
} from 'lucide-react'

export interface JourneyPhase {
  id: string
  label: string
  status: 'completed' | 'current' | 'upcoming' | 'skipped'
  description?: string
  deadlineDays?: number
  deadlineDate?: string
}

export interface CaseJourneyMapProps {
  phases: JourneyPhase[]
  currentDate?: string
  className?: string
}

const PHASE_ICONS: Record<string, React.ElementType> = {
  file: FileText,
  serve: Send,
  answer: MessageSquare,
  discovery: Search,
  trial: Scale,
  resolve: CheckCircle2,
}

export function CaseJourneyMap({ phases, currentDate, className }: CaseJourneyMapProps) {
  const currentPhase = phases.find((p) => p.status === 'current')
  const completedCount = phases.filter((p) => p.status === 'completed').length

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="h-4 w-4 text-calm-indigo" />
          Your Case Journey
        </CardTitle>
        {currentPhase && (
          <p className="text-sm text-warm-muted">
            Currently: {currentPhase.label}
            {currentPhase.deadlineDays !== undefined && (
              <span className="ml-2 text-calm-amber">
                • {currentPhase.deadlineDays > 0 
                  ? `${currentPhase.deadlineDays} days remaining`
                  : 'Deadline passed'}
              </span>
            )}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {/* Progress line */}
        <div className="relative">
          {/* Background line */}
          <div className="absolute top-6 left-6 right-6 h-1 bg-warm-border rounded-full" />
          
          {/* Progress fill */}
          <div 
            className="absolute top-6 left-6 h-1 bg-calm-indigo rounded-full transition-all"
            style={{ 
              width: `calc(${(completedCount / (phases.length - 1)) * 100}% - 2rem)` 
            }}
          />

          {/* Phase markers */}
          <div className="relative flex justify-between">
            {phases.map((phase, index) => {
              const Icon = PHASE_ICONS[phase.id] || FileText
              const isLast = index === phases.length - 1

              return (
                <div key={phase.id} className="flex flex-col items-center">
                  {/* Icon circle */}
                  <div
                    className={cn(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all',
                      phase.status === 'completed'
                        ? 'bg-calm-green text-white'
                        : phase.status === 'current'
                        ? 'bg-calm-indigo text-white ring-4 ring-calm-indigo/20'
                        : phase.status === 'skipped'
                        ? 'bg-warm-muted/20 text-warm-muted'
                        : 'bg-warm-bg text-warm-muted'
                    )}
                  >
                    {phase.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : phase.status === 'current' ? (
                      <Icon className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5 opacity-50" />
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className={cn(
                      'mt-2 text-xs font-medium text-center max-w-[4rem]',
                      phase.status === 'current'
                        ? 'text-calm-indigo'
                        : phase.status === 'completed'
                        ? 'text-calm-green'
                        : 'text-warm-muted'
                    )}
                  >
                    {phase.label}
                  </p>

                  {/* Deadline (only for current phase) */}
                  {phase.status === 'current' && phase.deadlineDate && (
                    <p className="mt-1 text-xs text-calm-amber">
                      Due {phase.deadlineDate}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Phase descriptions */}
        {currentPhase && currentPhase.description && (
          <div className="mt-6 bg-calm-indigo/5 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-calm-indigo shrink-0 mt-0.5" />
              <p className="text-sm text-warm-text">{currentPhase.description}</p>
            </div>
          </div>
        )}

        {/* Progress summary */}
        <div className="mt-4 pt-4 border-t border-warm-border flex items-center justify-between">
          <span className="text-sm text-warm-muted">
            {completedCount} of {phases.length} steps complete
          </span>
          <div className="flex items-center gap-1">
            <div
              className="h-2 rounded-full bg-calm-indigo transition-all"
              style={{ width: `${(completedCount / phases.length) * 100}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function getDefaultJourneyPhases(caseStage: string): JourneyPhase[] {
  switch (caseStage) {
    case 'pre_filing':
      return [
        { id: 'file', label: 'File', status: 'upcoming', description: 'Prepare and submit your petition to the court.' },
        { id: 'serve', label: 'Serve', status: 'upcoming' },
        { id: 'answer', label: 'Answer', status: 'upcoming' },
        { id: 'discovery', label: 'Discovery', status: 'upcoming' },
        { id: 'trial', label: 'Trial', status: 'upcoming' },
        { id: 'resolve', label: 'Done', status: 'upcoming' },
      ]
    case 'post_filing':
      return [
        { id: 'file', label: 'File', status: 'completed' },
        { id: 'serve', label: 'Serve', status: 'current', description: 'You must serve the defendant within 30 days of filing.' },
        { id: 'answer', label: 'Answer', status: 'upcoming' },
        { id: 'discovery', label: 'Discovery', status: 'upcoming' },
        { id: 'trial', label: 'Trial', status: 'upcoming' },
        { id: 'resolve', label: 'Done', status: 'upcoming' },
      ]
    case 'served':
      return [
        { id: 'file', label: 'File', status: 'completed' },
        { id: 'serve', label: 'Serve', status: 'completed' },
        { id: 'answer', label: 'Answer', status: 'current', description: 'Waiting for the defendant to file their answer.' },
        { id: 'discovery', label: 'Discovery', status: 'upcoming' },
        { id: 'trial', label: 'Trial', status: 'upcoming' },
        { id: 'resolve', label: 'Done', status: 'upcoming' },
      ]
    case 'discovery':
      return [
        { id: 'file', label: 'File', status: 'completed' },
        { id: 'serve', label: 'Serve', status: 'completed' },
        { id: 'answer', label: 'Answer', status: 'completed' },
        { id: 'discovery', label: 'Discovery', status: 'current', description: 'Exchange evidence and information with the other party.' },
        { id: 'trial', label: 'Trial', status: 'upcoming' },
        { id: 'resolve', label: 'Done', status: 'upcoming' },
      ]
    case 'trial':
      return [
        { id: 'file', label: 'File', status: 'completed' },
        { id: 'serve', label: 'Serve', status: 'completed' },
        { id: 'answer', label: 'Answer', status: 'completed' },
        { id: 'discovery', label: 'Discovery', status: 'completed' },
        { id: 'trial', label: 'Trial', status: 'current', description: 'Present your case to the judge.' },
        { id: 'resolve', label: 'Done', status: 'upcoming' },
      ]
    default:
      return [
        { id: 'file', label: 'File', status: 'completed' },
        { id: 'serve', label: 'Serve', status: 'completed' },
        { id: 'answer', label: 'Answer', status: 'completed' },
        { id: 'discovery', label: 'Discovery', status: 'completed' },
        { id: 'trial', label: 'Trial', status: 'completed' },
        { id: 'resolve', label: 'Done', status: 'current', description: 'Your case has been resolved.' },
      ]
  }
}
