import type { CircumstanceFlags } from '@/lib/rules/court-recommendation'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const CIRCUMSTANCE_OPTIONS: { key: keyof CircumstanceFlags; label: string }[] = [
  { key: 'realProperty', label: 'The dispute involves ownership of real property (land/house)' },
  { key: 'outOfState', label: 'The opposing party is in a different state' },
  { key: 'governmentEntity', label: 'The opposing party is a government entity' },
  { key: 'federalLaw', label: 'This involves a federal law (civil rights, patent, bankruptcy)' },
]

interface CircumstancesStepProps {
  value: CircumstanceFlags
  onChange: (flags: CircumstanceFlags) => void
  onContinue: () => void
}

export function CircumstancesStep({ value, onChange, onContinue }: CircumstancesStepProps) {
  function handleToggle(key: keyof CircumstanceFlags) {
    onChange({ ...value, [key]: !value[key] })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-warm-text">Do any of these apply?</p>
      <div className="space-y-3">
        {CIRCUMSTANCE_OPTIONS.map((opt) => (
          <div key={opt.key} className="flex items-start gap-3">
            <Checkbox
              id={opt.key}
              checked={value[opt.key]}
              onCheckedChange={() => handleToggle(opt.key)}
            />
            <Label htmlFor={opt.key} className="text-sm text-warm-text leading-tight cursor-pointer">
              {opt.label}
            </Label>
          </div>
        ))}
      </div>
      <p className="text-xs text-warm-muted">
        If none apply, just continue.
      </p>
      <Button type="button" className="w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}
