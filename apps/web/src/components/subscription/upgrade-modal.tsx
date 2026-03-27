'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Lock, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { TIER_PRICING } from '@lawyer-free/shared/subscription/limits'

const FEATURE_TO_TIER: Record<string, 'essentials' | 'pro'> = {
  maxCases: 'essentials',
  aiGenerationsPerMonth: 'essentials',
  caseSharing: 'essentials',
  discovery: 'pro',
  trialBinders: 'pro',
  emailIntegration: 'pro',
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  maxCases: 'Unlimited cases',
  aiGenerationsPerMonth: 'Unlimited AI document generation',
  discovery: 'Discovery tools, interrogatories, document requests',
  caseSharing: 'Share your case with advisors or attorneys',
  emailIntegration: 'Gmail integration for case-related emails',
  trialBinders: 'Organized trial binders for court preparation',
}

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  feature: string
  currentTier: string
  message: string
}

export function UpgradeModal({ open, onClose, feature, currentTier, message }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const requiredTier = FEATURE_TO_TIER[feature] ?? 'essentials'
  const tierInfo = TIER_PRICING[requiredTier]
  const featureDescription = FEATURE_DESCRIPTIONS[feature]

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleEscape)
    closeButtonRef.current?.focus()
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, handleEscape])

  // Focus trap
  useEffect(() => {
    if (!open || !modalRef.current) return
    const modal = modalRef.current
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    function handleTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    return () => modal.removeEventListener('keydown', handleTab)
  }, [open])

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: requiredTier }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-md mx-4 rounded-xl border border-warm-border bg-warm-bg p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 text-warm-muted hover:text-warm-text transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-4">
          {/* Icon */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-calm-indigo/10">
            <Lock className="h-6 w-6 text-calm-indigo" />
          </div>

          {/* Title */}
          <h2 id="upgrade-modal-title" className="text-lg font-semibold text-warm-text">
            Upgrade to continue
          </h2>

          {/* Message */}
          <p className="text-sm text-warm-muted">{message}</p>

          {/* Feature highlight */}
          {featureDescription && (
            <div className="rounded-lg border border-calm-green/30 bg-calm-green/5 px-4 py-3">
              <p className="text-sm font-medium text-warm-text">
                With {tierInfo.label} you get:
              </p>
              <p className="text-sm text-warm-muted mt-1">{featureDescription}</p>
            </div>
          )}

          {/* CTAs */}
          <div className="space-y-2 pt-2">
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-calm-indigo hover:bg-calm-indigo/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating checkout...
                </>
              ) : (
                `Upgrade to ${tierInfo.label} ($${tierInfo.monthly}/mo)`
              )}
            </Button>
            <Button variant="ghost" asChild className="w-full text-warm-muted">
              <Link href="/pricing">View all plans</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
