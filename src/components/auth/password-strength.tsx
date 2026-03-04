'use client'

import { getPasswordStrength, type StrengthLevel } from '@/lib/auth/password-strength'

const COLORS: Record<StrengthLevel, string> = {
  weak: 'bg-red-400',
  fair: 'bg-amber-400',
  good: 'bg-green-400',
  strong: 'bg-green-500',
}

const SEGMENT_COUNT = 4
const SEGMENTS_FILLED: Record<StrengthLevel, number> = {
  weak: 1,
  fair: 2,
  good: 3,
  strong: 4,
}

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  if (!password) return null

  const strength = getPasswordStrength(password)
  const filled = SEGMENTS_FILLED[strength.level]
  const color = COLORS[strength.level]

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < filled ? color : 'bg-warm-border'
            }`}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: '#78716C' }}>{strength.label}</p>
    </div>
  )
}
