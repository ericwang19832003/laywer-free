import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FactsSectionProps {
  description: string
  incidentDate: string
  incidentLocation: string
  onDescriptionChange: (v: string) => void
  onIncidentDateChange: (v: string) => void
  onIncidentLocationChange: (v: string) => void
}

export function FactsSection({
  description, incidentDate, incidentLocation,
  onDescriptionChange, onIncidentDateChange, onIncidentLocationChange,
}: FactsSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="description">In plain language, describe what happened *</Label>
        <Textarea id="description" value={description} onChange={(e) => onDescriptionChange(e.target.value)} rows={5} placeholder="Describe the facts of your dispute..." />
        <p className="text-xs text-warm-muted mt-1">Stick to facts — what happened, when, and who was involved.</p>
      </div>
      <div>
        <Label htmlFor="incident-date">When did this happen?</Label>
        <Input id="incident-date" type="date" value={incidentDate} onChange={(e) => onIncidentDateChange(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="incident-location">Where did this happen?</Label>
        <Input id="incident-location" value={incidentLocation} onChange={(e) => onIncidentLocationChange(e.target.value)} placeholder="e.g. Austin, Texas" />
      </div>
    </div>
  )
}
