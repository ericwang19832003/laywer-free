'use client'

import { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function PanicButton() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const privacyMode = localStorage.getItem('privacy_mode')
    setEnabled(privacyMode === 'true')
  }, [])

  if (!enabled) return null

  function handlePanic() {
    // Sign out Supabase session
    const supabase = createClient()
    supabase.auth.signOut().catch(() => {})

    // Clear all local storage
    localStorage.clear()
    sessionStorage.clear()

    // Replace current history entry so back button doesn't return
    window.location.replace('https://www.google.com')
  }

  return (
    <button
      onClick={handlePanic}
      className="fixed top-3 right-3 z-[100] p-2 rounded-full bg-warm-bg/80 backdrop-blur border border-warm-border hover:bg-warm-bg transition-colors md:top-4 md:right-4"
      title="Quick exit"
      aria-label="Quick exit - leave this site immediately"
    >
      <Shield className="h-4 w-4 text-warm-muted" />
    </button>
  )
}
