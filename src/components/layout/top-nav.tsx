'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { Breadcrumbs } from './breadcrumbs'
import { UserMenu } from './user-menu'
import { useState } from 'react'
import { CommandPalette } from '@/components/search/command-palette'

export function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-warm-border bg-warm-bg/95 backdrop-blur supports-[backdrop-filter]:bg-warm-bg/80">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/cases"
            className="mr-4 text-sm font-semibold text-warm-text whitespace-nowrap"
          >
            Lawyer Free
          </Link>

          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-warm-muted hover:text-warm-text hover:bg-warm-border/50 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <UserMenu />
          </div>
        </div>
      </nav>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
