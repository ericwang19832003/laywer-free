'use client'

import { useState, useCallback } from 'react'

interface GateInfo {
  feature: string
  currentTier: string
  message: string
}

export function useUpgradeGate() {
  const [gateInfo, setGateInfo] = useState<GateInfo | null>(null)

  // Wrap a fetch call — if it returns 403 with upgrade_required, capture the gate info
  const gatedFetch = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options)

    if (res.status === 403) {
      const body = await res.json()
      if (body.error === 'upgrade_required') {
        setGateInfo({
          feature: body.feature,
          currentTier: body.currentTier,
          message: body.message,
        })
        return null // signal that the gate was hit
      }
    }

    return res
  }, [])

  const closeGate = useCallback(() => setGateInfo(null), [])

  return { gateInfo, gatedFetch, closeGate }
}
