import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PreservationLetterReminderProps {
  caseId: string
  taskId: string
}

export function PreservationLetterReminder({ caseId, taskId }: PreservationLetterReminderProps) {
  return (
    <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-calm-amber mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-warm-text">
            Send a Preservation of Evidence Letter
          </p>
          <p className="text-xs text-warm-muted mt-1">
            No preservation letter has been sent yet. Evidence can be lost or destroyed — sending
            one now puts the other party on legal notice to preserve it.
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/case/${caseId}/step/${taskId}`}>Prepare Draft</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
