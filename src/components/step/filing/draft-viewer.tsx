import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface DraftViewerProps {
  draft: string
  onDraftChange: (v: string) => void
  onRegenerate: () => void
  regenerating: boolean
  acknowledged: boolean
  onAcknowledgeChange: (v: boolean) => void
}

export function DraftViewer({
  draft, onDraftChange, onRegenerate, regenerating, acknowledged, onAcknowledgeChange,
}: DraftViewerProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-calm-amber bg-calm-amber/5 p-3">
        <p className="text-sm font-medium text-warm-text">DRAFT — NOT LEGAL ADVICE</p>
        <p className="text-xs text-warm-muted mt-1">
          This is a computer-generated starting point. You are responsible for reviewing and editing this document before filing. This is not legal advice.
        </p>
      </div>

      <textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        className="w-full min-h-[400px] rounded-md border border-warm-border p-4 text-sm font-mono text-warm-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? 'Regenerating...' : 'Regenerate Draft'}
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-warm-border p-3">
        <Checkbox id="acknowledge" checked={acknowledged} onCheckedChange={(c) => onAcknowledgeChange(c === true)} />
        <Label htmlFor="acknowledge" className="text-sm text-warm-text leading-tight cursor-pointer">
          I understand this is a draft and not legal advice. I will review and edit this document before filing.
        </Label>
      </div>
    </div>
  )
}
