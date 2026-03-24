'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, FileQuestion, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ErrorRecoveryProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHome?: boolean
  className?: string
}

export function ErrorRecovery({
  title = 'Something went wrong',
  message = 'We encountered an error loading this content. Please try again.',
  onRetry,
  showHome = true,
  className,
}: ErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-amber-500" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-warm-text mb-2">{title}</h3>
      <p className="text-sm text-warm-muted max-w-sm mb-6">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button
            variant="outline"
            onClick={handleRetry}
            disabled={isRetrying}
            className="gap-2"
          >
            <RefreshCw
              className={cn('w-4 h-4', isRetrying && 'animate-spin')}
              aria-hidden="true"
            />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}

        {showHome && (
          <Button variant="ghost" asChild>
            <Link href="/cases" className="gap-2">
              <Home className="w-4 h-4" aria-hidden="true" />
              Go to Cases
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

interface FormErrorProps {
  error: string | null
  onDismiss?: () => void
}

export function FormError({ error, onDismiss }: FormErrorProps) {
  if (!error) return null

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200 mb-4"
      role="alert"
    >
      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1">
        <p className="text-sm text-red-700">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}

interface NetworkErrorProps {
  onRetry?: () => void
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <FileQuestion className="w-6 h-6 text-gray-400" aria-hidden="true" />
      </div>
      <h4 className="text-sm font-medium text-warm-text mb-1">Connection issue</h4>
      <p className="text-xs text-warm-muted mb-4">
        Check your internet connection and try again.
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Retry
        </Button>
      )}
    </div>
  )
}
