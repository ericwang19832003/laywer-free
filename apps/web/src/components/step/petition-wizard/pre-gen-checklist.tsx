import type { PreGenerationGap } from '@lawyer-free/shared/validators'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PreGenChecklistProps {
  gaps: PreGenerationGap[]
  onGenerate: () => void
  onGoToStep: (wizardStep: string) => void
}

export function PreGenChecklist({
  gaps,
  onGenerate,
  onGoToStep,
}: PreGenChecklistProps) {
  if (gaps.length === 0) {
    return (
      <Card className="border-green-300 bg-green-50">
        <CardContent className="p-6 text-center">
          <p className="text-sm font-medium text-green-800 mb-4">
            Ready to generate — all sections are complete.
          </p>
          <Button onClick={onGenerate}>Generate Petition</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-warm-text">
        A few sections could use more detail:
      </p>

      <div className="space-y-3">
        {gaps.map((gap) => (
          <Card
            key={gap.sectionId}
            className="border-amber-300 bg-amber-50"
          >
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-amber-900">
                  {gap.sectionLabel}
                </p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {gap.message}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => onGoToStep(gap.wizardStep)}
              >
                Go back
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-2">
        <Button variant="outline" onClick={onGenerate}>
          Generate anyway with placeholders
        </Button>
      </div>
    </div>
  )
}
