import { Check } from 'lucide-react'

interface OptionCardProps {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
  variant?: 'radio' | 'checkbox'
  isPrimary?: boolean
}

export function OptionCard({ label, description, selected, onClick, disabled, variant = 'radio', isPrimary }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
        disabled
          ? 'border-warm-border text-warm-muted/50 cursor-not-allowed'
          : selected
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-warm-border text-warm-muted hover:border-warm-text hover:text-warm-text'
      }`}
    >
      <div className="flex items-start gap-3">
        {variant === 'checkbox' && (
          <span
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
              disabled
                ? 'border-warm-border/50'
                : selected
                  ? 'border-primary bg-primary'
                  : 'border-warm-border'
            }`}
          >
            {selected && <Check className="h-3 w-3 text-white" />}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{label}</span>
            {isPrimary && (
              <span className="shrink-0 text-[11px] font-medium text-calm-indigo bg-calm-indigo/10 px-2 py-0.5 rounded-full">
                Primary
              </span>
            )}
          </div>
          {description && (
            <span className="block text-xs mt-0.5 opacity-75">{description}</span>
          )}
        </div>
      </div>
    </button>
  )
}
