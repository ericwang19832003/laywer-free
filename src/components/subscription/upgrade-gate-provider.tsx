'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useUpgradeGate } from '@/hooks/use-upgrade-gate'
import { createContext, useContext } from 'react'
import Link from 'next/link'

// --- Upgrade Modal (co-located to avoid an extra file) ---

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  feature: string
  currentTier: string
  message: string
}

function UpgradeModal({ open, onClose, feature, currentTier, message }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="mx-auto mb-2">
            <Sparkles className="h-8 w-8 text-calm-indigo" />
          </div>
          <DialogTitle className="text-center">Upgrade to Unlock</DialogTitle>
          <DialogDescription className="text-center">
            {message || `The "${feature}" feature is not available on the ${currentTier} plan.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button asChild className="bg-calm-indigo hover:bg-calm-indigo/90">
            <Link href="/settings#billing">Upgrade to Pro</Link>
          </Button>
          <Button variant="outline" onClick={onClose}>
            Maybe Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Context & Provider ---

const UpgradeGateContext = createContext<ReturnType<typeof useUpgradeGate> | null>(null)

export function useUpgradeGateContext() {
  const ctx = useContext(UpgradeGateContext)
  if (!ctx) throw new Error('useUpgradeGateContext must be used within UpgradeGateProvider')
  return ctx
}

export function UpgradeGateProvider({ children }: { children: React.ReactNode }) {
  const gate = useUpgradeGate()

  return (
    <UpgradeGateContext.Provider value={gate}>
      {children}
      <UpgradeModal
        open={!!gate.gateInfo}
        onClose={gate.closeGate}
        feature={gate.gateInfo?.feature ?? ''}
        currentTier={gate.gateInfo?.currentTier ?? 'free'}
        message={gate.gateInfo?.message ?? ''}
      />
    </UpgradeGateContext.Provider>
  )
}
