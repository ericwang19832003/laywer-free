interface SupportiveHeaderProps {
  title: string
  subtitle: string
}

export function SupportiveHeader({ title, subtitle }: SupportiveHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-semibold text-warm-text">{title}</h1>
      <p className="mt-1 text-warm-muted">{subtitle}</p>
    </div>
  )
}
