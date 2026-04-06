'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Types ───────────────────────────────────

type BadgeVariant = 'exhibit' | 'discovery' | 'binder' | 'evidence'

export interface Badge {
  label: string
  href: string
  variant: BadgeVariant
}

interface CrossRefBadgesProps {
  badges: Badge[]
  className?: string
}

// ── Variant styles ──────────────────────────

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  exhibit: 'bg-calm-indigo/10 text-calm-indigo border-calm-indigo/20',
  discovery: 'bg-calm-amber/10 text-amber-700 border-calm-amber/20',
  binder: 'bg-calm-green/10 text-green-700 border-calm-green/20',
  evidence: 'bg-warm-bg text-warm-muted border-warm-border',
}

// ── Component ───────────────────────────────

export function CrossRefBadges({ badges, className }: CrossRefBadgesProps) {
  if (!badges || badges.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {badges.map((badge) => (
        <Link
          key={`${badge.variant}-${badge.href}`}
          href={badge.href}
          className={cn(
            'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none transition-opacity hover:opacity-80',
            VARIANT_STYLES[badge.variant]
          )}
        >
          {badge.label}
        </Link>
      ))}
    </div>
  )
}
