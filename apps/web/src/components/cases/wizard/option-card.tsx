interface OptionCardProps {
  label: string
  description?: string
  selected: boolean
  onClick: () => void
  disabled?: boolean
}

export function OptionCard({ label, description, selected, onClick, disabled }: OptionCardProps) {
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
      <span className="text-sm font-medium">{label}</span>
      {description && (
        <span className="block text-xs mt-0.5 opacity-75">{description}</span>
      )}
    </button>
  )
}
