'use client'

import { useRouter } from 'next/navigation'
import { Settings, HelpCircle, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRef, useState, useEffect } from 'react'

function getInitials(identifier: string): string {
  const email = identifier.trim()
  if (email.includes('@')) {
    const local = email.split('@')[0]
    const parts = local.split(/[._-]/).filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return local.slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export function UserMenu() {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null)

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient()
    }
    return supabaseRef.current
  }

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      setUserIdentifier(data.user?.email ?? data.user?.phone ?? null)
    })
  }, [])

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center justify-center size-9 rounded-lg text-warm-muted hover:text-warm-text hover:bg-warm-border/40 transition-colors duration-150"
          aria-label="User menu"
        >
          {userIdentifier ? (
            <span className="flex items-center justify-center size-7 rounded-full bg-calm-indigo/10 text-calm-indigo text-xs font-semibold">
              {getInitials(userIdentifier)}
            </span>
          ) : (
            <span className="flex items-center justify-center size-7 rounded-full bg-warm-border/50 text-warm-muted text-xs font-semibold">
              ··
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userIdentifier && (
          <>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-warm-text truncate">{userIdentifier}</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Help &amp; FAQ
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
