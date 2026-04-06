import { OptionCard } from './option-card'

interface RoleStepProps {
  value: 'plaintiff' | 'defendant' | ''
  disputeType?: string
  onSelect: (role: 'plaintiff' | 'defendant') => void
}

export function RoleStep({ value, disputeType, onSelect }: RoleStepProps) {
  const isFamily = disputeType === 'family'

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">I am the...</p>
      <div className="flex gap-3">
        <div className="flex-1">
          <OptionCard
            label={isFamily ? 'Petitioner' : 'Plaintiff'}
            description={isFamily ? "I'm filing the case" : "I'm bringing the case"}
            selected={value === 'plaintiff'}
            onClick={() => onSelect('plaintiff')}
          />
        </div>
        <div className="flex-1">
          <OptionCard
            label={isFamily ? 'Respondent' : 'Defendant'}
            description={isFamily ? 'I was served with papers' : 'I was served or sued'}
            selected={value === 'defendant'}
            onClick={() => onSelect('defendant')}
          />
        </div>
      </div>
    </div>
  )
}
