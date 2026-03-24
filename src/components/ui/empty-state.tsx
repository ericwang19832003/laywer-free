'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FileQuestion, Inbox, FolderOpen, Calendar, FileText, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  EmptyFolder,
  EmptyDocuments,
  Scales,
  FolderSearch,
  Calendar as CalendarIcon,
  Success,
} from './illustrations'

type IllustrationType =
  | 'folder'
  | 'documents'
  | 'scales'
  | 'search'
  | 'calendar'
  | 'success'
  | 'tasks'
  | 'evidence'
  | 'deadlines'
  | 'search-results'
  | 'default'

interface IllustrationProps {
  type: IllustrationType
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Illustration({ type, size = 'md', className }: IllustrationProps) {
  const props = { size, className }

  switch (type) {
    case 'folder':
      return <EmptyFolder {...props} />
    case 'documents':
      return <EmptyDocuments {...props} />
    case 'scales':
      return <Scales {...props} />
    case 'search':
    case 'search-results':
      return <FolderSearch {...props} />
    case 'calendar':
    case 'deadlines':
      return <CalendarIcon {...props} />
    case 'success':
      return <Success {...props} />
    case 'tasks':
      return <EmptyDocuments {...props} />
    case 'evidence':
      return <EmptyFolder {...props} />
    default:
      return <FolderOpen {...props} />
  }
}

interface EmptyStateProps {
  icon?: 'documents' | 'tasks' | 'evidence' | 'deadlines' | 'search' | 'default'
  illustration?: IllustrationType
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
}

const iconMap = {
  documents: FileText,
  tasks: FileQuestion,
  evidence: FolderOpen,
  deadlines: Calendar,
  search: Search,
  default: Inbox,
}

export function EmptyState({
  icon = 'default',
  illustration,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon]

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {illustration ? (
        <div className="mb-4">
          <Illustration type={illustration} size="lg" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-warm-bg flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-warm-muted" aria-hidden="true" />
        </div>
      )}

      <h3 className="text-base font-semibold text-warm-text mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-warm-muted max-w-sm mb-6">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            action.href ? (
              <a href={action.href} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-calm-indigo text-white text-sm font-medium hover:bg-calm-indigo/90 transition-colors">
                {action.label}
              </a>
            ) : (
              <Button onClick={action.onClick} className="gap-2">
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <a href={secondaryAction.href} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-warm-border bg-white text-sm font-medium text-warm-text hover:bg-warm-bg transition-colors">
                {secondaryAction.label}
              </a>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick} className="gap-2">
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  )
}

interface EmptyStateCardProps {
  icon?: 'documents' | 'tasks' | 'evidence' | 'deadlines' | 'search' | 'default'
  illustration?: IllustrationType
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyStateCard({
  icon = 'default',
  illustration,
  title,
  description,
  action,
  className,
}: EmptyStateCardProps) {
  const Icon = iconMap[icon]

  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-8 text-center',
        className
      )}
      role="status"
    >
      {illustration ? (
        <div className="mb-4 flex justify-center">
          <Illustration type={illustration} size="md" />
        </div>
      ) : (
        <div className="w-14 h-14 rounded-full bg-warm-bg mx-auto mb-4 flex items-center justify-center">
          <Icon className="w-7 h-7 text-warm-muted" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-warm-text mb-2">{title}</h3>
      {description && (
        <p className="text-xs text-warm-muted mb-4">{description}</p>
      )}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="gap-2">
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface QuickActionProps {
  label: string
  description: string
  icon: ReactNode
  onClick: () => void
}

export function QuickActionCard({ label, description, icon, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-warm-bg transition-colors text-left w-full group"
    >
      <div className="w-10 h-10 rounded-lg bg-calm-indigo/10 flex items-center justify-center shrink-0 group-hover:bg-calm-indigo/20 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-warm-text">{label}</p>
        <p className="text-xs text-warm-muted truncate">{description}</p>
      </div>
    </button>
  )
}

type HeroImageType =
  | 'cases'
  | 'evidence'
  | 'deadlines'
  | 'dashboard'
  | 'filing'
  | 'success'
  | 'welcome'

interface HeroEmptyStateProps {
  type: HeroImageType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    href: string
  }
  className?: string
}

const heroImageMap: Record<HeroImageType, string> = {
  cases: '/images/ai-generated/empty-cases.png',
  evidence: '/images/ai-generated/empty-evidence.png',
  deadlines: '/images/ai-generated/empty-deadlines.png',
  dashboard: '/images/ai-generated/hero-dashboard.png',
  filing: '/images/ai-generated/hero-filing.png',
  success: '/images/ai-generated/hero-success.png',
  welcome: '/images/ai-generated/hero-welcome.png',
}

export function HeroEmptyState({
  type,
  title,
  description,
  action,
  secondaryAction,
  className,
}: HeroEmptyStateProps) {
  return (
    <div className={cn('py-12 px-6', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-square max-w-sm mx-auto">
            <Image
              src={heroImageMap[type]}
              alt={title}
              fill
              className="object-contain rounded-2xl"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-warm-text mb-3">{title}</h3>
            <p className="text-warm-muted mb-6">{description}</p>
            {action && (
              <Button onClick={action.onClick} size="lg" className="gap-2">
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <p className="mt-4 text-sm text-warm-muted">
                or{' '}
                <a
                  href={secondaryAction.href}
                  className="text-calm-indigo hover:underline"
                >
                  {secondaryAction.label}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
