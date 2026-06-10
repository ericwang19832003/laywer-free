import { MapPin } from 'lucide-react'
import type { State } from '@lawyer-free/shared/schemas/case'

const STATE_OPTIONS: { value: State; label: string; description: string }[] = [
  { value: 'TX', label: 'Texas', description: 'JP, County, and District courts' },
  { value: 'CA', label: 'California', description: 'Small Claims, Limited Civil, and Unlimited Civil courts' },
  { value: 'NY', label: 'New York', description: 'Small Claims, Civil, and Supreme courts' },
  { value: 'FL', label: 'Florida', description: 'Small Claims, County, and Circuit courts' },
  { value: 'PA', label: 'Pennsylvania', description: 'Magisterial District and Common Pleas courts' },
  { value: 'IL', label: 'Illinois', description: 'Circuit Court — Small Claims and general civil' },
  { value: 'OH', label: 'Ohio', description: 'Small Claims, Municipal, and Common Pleas courts' },
  { value: 'GA', label: 'Georgia', description: 'Magistrate, State, and Superior courts' },
  { value: 'NC', label: 'North Carolina', description: 'Small Claims, District, and Superior courts' },
  { value: 'MI', label: 'Michigan', description: 'Small Claims, District, and Circuit courts' },
  { value: 'NJ', label: 'New Jersey', description: 'Small Claims, Special Civil, and Civil courts' },
  { value: 'VA', label: 'Virginia', description: 'Small Claims, General District, and Circuit courts' },
  { value: 'WA', label: 'Washington', description: 'Small Claims, District, and Superior courts' },
  { value: 'AZ', label: 'Arizona', description: 'Small Claims, Justice, and Superior courts' },
  { value: 'CO', label: 'Colorado', description: 'Small Claims, County, and District courts' },
  { value: 'TN', label: 'Tennessee', description: 'General Sessions and Circuit courts' },
  { value: 'IN', label: 'Indiana', description: 'Small Claims and Circuit/Superior courts' },
  { value: 'MO', label: 'Missouri', description: 'Small Claims, Associate Circuit, and Circuit courts' },
  { value: 'MD', label: 'Maryland', description: 'District Court (Small Claims) and Circuit courts' },
  { value: 'WI', label: 'Wisconsin', description: 'Circuit Court — Small Claims and general civil' },
  { value: 'MN', label: 'Minnesota', description: 'Conciliation Court (Small Claims) and District courts' },
  { value: 'SC', label: 'South Carolina', description: 'Magistrate and Circuit courts' },
  { value: 'AL', label: 'Alabama', description: 'Small Claims, District, and Circuit courts' },
  { value: 'LA', label: 'Louisiana', description: 'City Court — Small Claims and District courts' },
  { value: 'KY', label: 'Kentucky', description: 'Small Claims, District, and Circuit courts' },
  { value: 'OR', label: 'Oregon', description: 'Small Claims Dept and Circuit courts' },
  { value: 'NV', label: 'Nevada', description: 'Small Claims Court (Justice Court) and District courts' },
  { value: 'CT', label: 'Connecticut', description: 'Superior Court — Small Claims and general civil' },
  { value: 'MA', label: 'Massachusetts', description: 'Small Claims Session and District courts' },
  { value: 'OK', label: 'Oklahoma', description: 'Small Claims Docket and District courts' },
  { value: 'AR', label: 'Arkansas', description: 'Small Claims and Circuit courts' },
  { value: 'MS', label: 'Mississippi', description: 'Justice Court, County Court, and Circuit courts' },
  { value: 'UT', label: 'Utah', description: 'Justice Court — Small Claims and District courts' },
  { value: 'NM', label: 'New Mexico', description: 'Magistrate Court (or Metro Court) and District courts' },
  { value: 'WV', label: 'West Virginia', description: 'Magistrate Court and Circuit courts' },
  { value: 'DE', label: 'Delaware', description: 'Justice of the Peace Court, Court of Common Pleas, and Superior courts' },
  { value: 'RI', label: 'Rhode Island', description: 'District Court Small Claims, District Court, and Superior courts' },
  { value: 'NH', label: 'New Hampshire', description: 'Circuit Court Small Claims and Superior courts' },
  { value: 'VT', label: 'Vermont', description: 'Small Claims Court and Superior courts' },
  { value: 'ME', label: 'Maine', description: 'District Court Small Claims and Superior courts' },
  { value: 'IA', label: 'Iowa', description: 'Small Claims Court and District courts' },
  { value: 'KS', label: 'Kansas', description: 'Small Claims Court and District courts' },
  { value: 'NE', label: 'Nebraska', description: 'County Court Small Claims, County Court, and District courts' },
  { value: 'SD', label: 'South Dakota', description: 'Small Claims Court and Circuit courts' },
  { value: 'ND', label: 'North Dakota', description: 'Small Claims Court and District courts' },
  { value: 'MT', label: 'Montana', description: 'Justice Court Small Claims and District courts' },
  { value: 'WY', label: 'Wyoming', description: 'Circuit Court Small Claims and District courts' },
  { value: 'ID', label: 'Idaho', description: 'Small Claims Court, Magistrate Division, and District courts' },
  { value: 'HI', label: 'Hawaii', description: 'Small Claims Court, District Court, and Circuit courts' },
  { value: 'AK', label: 'Alaska', description: 'District Court Small Claims and District courts' },
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
