'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

export interface Crumb {
  label: string
  href: string | null
}

const SECTION_LABELS: Record<string, string> = {
  motions: 'Motions',
  evidence: 'Evidence',
  discovery: 'Discovery',
  deadlines: 'Deadlines',
  exhibits: 'Exhibits',
  binders: 'Binders',
  health: 'Health',
  step: 'Step',
  research: 'Research',
  'case-file': 'Case File',
  search: 'Search',
  authorities: 'Authorities',
  ask: 'Ask',
  history: 'History',
}

export function buildBreadcrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return []
  if (segments[0] === 'cases') return [{ label: 'Cases', href: null }]
  if (segments[0] === 'settings') return [{ label: 'Settings', href: null }]
  if (segments[0] === 'help') return [{ label: 'Help', href: null }]

  if (segments[0] === 'case' && segments.length >= 2) {
    const caseId = segments[1]
    const crumbs: Crumb[] = [
      { label: 'Cases', href: '/cases' },
    ]

    if (segments.length === 2) {
      crumbs.push({ label: 'Dashboard', href: null })
    } else {
      crumbs.push({ label: 'Dashboard', href: `/case/${caseId}` })

      const section = segments[2]
      const sectionLabel = SECTION_LABELS[section] || section.charAt(0).toUpperCase() + section.slice(1)

      if (segments.length === 3) {
        crumbs.push({ label: sectionLabel, href: null })
      } else if (section === 'step') {
        crumbs.push({ label: 'Step', href: null })
      } else if (section === 'research') {
        const subSection = segments[3]
        const subLabel = SECTION_LABELS[subSection] || subSection.charAt(0).toUpperCase() + subSection.slice(1)
        crumbs.push({ label: sectionLabel, href: `/case/${caseId}/${section}` })
        crumbs.push({ label: subLabel, href: null })
      } else if (section === 'case-file') {
        const subSection = segments[3]
        const subLabel = SECTION_LABELS[subSection] || subSection.charAt(0).toUpperCase() + subSection.slice(1)
        crumbs.push({ label: 'Case File', href: `/case/${caseId}/case-file` })
        crumbs.push({ label: subLabel, href: null })
      } else {
        crumbs.push({ label: sectionLabel, href: `/case/${caseId}/${section}` })
        crumbs.push({ label: 'Detail', href: null })
      }
    }

    return crumbs
  }

  return []
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const crumbs = buildBreadcrumbs(pathname)

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
      {crumbs.map((crumb, i) => (
        <Fragment key={i}>
          {i > 0 && <span className="text-warm-border flex-shrink-0 text-sm" aria-hidden="true">›</span>}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="text-warm-muted hover:text-warm-text transition-colors duration-150 whitespace-nowrap"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-warm-text font-medium whitespace-nowrap truncate">
              {crumb.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
