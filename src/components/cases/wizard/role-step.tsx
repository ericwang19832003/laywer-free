import { OptionCard } from './option-card'

interface RoleStepProps {
  value: 'plaintiff' | 'defendant' | ''
  onSelect: (role: 'plaintiff' | 'defendant') => void
}

export function RoleStep({ value, onSelect }: RoleStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">I am the...</p>
      <div className="flex gap-3">
        <div className="flex-1">
          <OptionCard
            label="Plaintiff"
            description="I'm bringing the case"
            selected={value === 'plaintiff'}
            onClick={() => onSelect('plaintiff')}
          />
        </div>
        <div className="flex-1">
          <OptionCard
            label="Defendant"
            description="I was served or sued"
            selected={value === 'defendant'}
            onClick={() => onSelect('defendant')}
          />
        </div>
      </div>
    </div>
  )
}
