'use client'

import Link from 'next/link'
import { Search, Scale, BookOpen } from 'lucide-react'
import { Breadcrumbs } from './breadcrumbs'
import { NotificationCenter } from './notification-center'
import { UserMenu } from './user-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useState, useEffect } from 'react'
import { CommandPalette } from '@/components/search/command-palette'

export function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`sticky top-0 z-40 w-full border-b border-warm-border bg-warm-bg/95 backdrop-blur supports-[backdrop-filter]:bg-warm-bg/80 transition-shadow duration-200 ${scrolled ? 'scroll-shadow' : ''}`}>
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link
            href="/cases"
            className="mr-4 flex items-center gap-2 text-sm font-semibold text-warm-text whitespace-nowrap"
          >
            <div className="w-7 h-7 rounded-lg bg-calm-indigo flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:inline">Lawyer Free</span>
          </Link>

          <Link
            href="/learn"
            className="mr-4 flex items-center gap-1.5 text-sm text-warm-muted hover:text-warm-text whitespace-nowrap transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Learn</span>
          </Link>

          <div className="flex-1 min-w-0">
            <Breadcrumbs />
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center justify-center size-9 rounded-lg text-warm-muted hover:text-warm-text hover:bg-warm-border/40 transition-colors duration-150"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <ThemeToggle />
            <NotificationCenter />
            <UserMenu />
          </div>
        </div>
      </nav>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
