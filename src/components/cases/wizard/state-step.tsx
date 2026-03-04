import { MapPin } from 'lucide-react'
import type { State } from '@/lib/schemas/case'

const STATE_OPTIONS: { value: State; label: string; description: string }[] = [
  { value: 'TX', label: 'Texas', description: 'JP, County, and District courts' },
  { value: 'CA', label: 'California', description: 'Small Claims, Limited Civil, and Unlimited Civil courts' },
  { value: 'NY', label: 'New York', description: 'Small Claims, Civil, and Supreme courts' },
]

interface StateStepProps {
  value: State | ''
  onSelect: (state: State) => void
}

export function StateStep({ value, onSelect }: StateStepProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-warm-text">Which state is this case in?</p>
      <div className="space-y-2">
        {STATE_OPTIONS.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={`w-full rounded-md border px-4 py-3 text-left transition-colors flex items-start gap-3 ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-warm-border hover:border-warm-text'
              }`}
            >
              <MapPin
                className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                  selected ? 'text-primary' : 'text-warm-muted'
                }`}
              />
              <div>
                <span className="font-medium text-warm-text text-sm">
                  {opt.label}
                </span>
                <span className="block text-xs mt-0.5 text-warm-muted">
                  {opt.description}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
