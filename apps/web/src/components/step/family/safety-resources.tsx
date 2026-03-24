'use client'

interface SafetyResourcesProps {
  compact?: boolean
}

export function SafetyResources({ compact }: SafetyResourcesProps) {
  if (compact) {
    return (
      <div className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-800">
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
    <div className="rounded-lg border border-red-400/30 bg-red-50 p-4">
      <h3 className="text-sm font-semibold text-red-900 mb-3">
        Emergency Resources
      </h3>
      <ul className="space-y-2 text-sm text-red-800">
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
          <span className="text-red-700">(24/7, free, confidential)</span>
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
