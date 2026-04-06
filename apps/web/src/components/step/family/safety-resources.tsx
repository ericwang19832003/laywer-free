'use client'

interface SafetyResourcesProps {
  compact?: boolean
}

export function SafetyResources({ compact }: SafetyResourcesProps) {
  if (compact) {
    return (
      <div className="rounded-md bg-calm-amber/5 px-4 py-2 text-sm text-warm-text">
        If you are in danger, call{' '}
        <a href="tel:911" className="font-semibold underline">
          911
        </a>{' '}
        | DV Hotline:{' '}
        <a href="tel:18007997233" className="font-semibold underline">
          1-800-799-7233
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-calm-amber/30 bg-calm-amber/5 p-4">
      <h3 className="text-sm font-semibold text-calm-amber mb-3">
        Emergency Resources
      </h3>
      <ul className="space-y-2 text-sm text-warm-text">
        <li>
          <strong>Emergency:</strong>{' '}
          <a href="tel:911" className="underline">
            Call 911
          </a>
        </li>
        <li>
          <strong>National DV Hotline:</strong>{' '}
          <a href="tel:18007997233" className="underline">
            1-800-799-7233
          </a>{' '}
          <span className="text-calm-amber">(24/7, free, confidential)</span>
        </li>
        <li>
          <strong>Texas Council on Family Violence:</strong>{' '}
          <a href="tel:18005251978" className="underline">
            1-800-525-1978
          </a>
        </li>
        <li>
          <strong>Text support:</strong> Text &quot;START&quot; to{' '}
          <span className="font-medium">88788</span>
        </li>
      </ul>
    </div>
  )
}
