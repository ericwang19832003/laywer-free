import { describe, it, expect } from 'vitest'
import { buildBreadcrumbs } from '@/components/layout/breadcrumbs'

describe('buildBreadcrumbs', () => {
  it('returns empty for root', () => {
    expect(buildBreadcrumbs('/')).toEqual([])
  })

  it('returns Cases for /cases', () => {
    const crumbs = buildBreadcrumbs('/cases')
    expect(crumbs).toEqual([{ label: 'Cases', href: null }])
  })

  it('returns Settings for /settings', () => {
    const crumbs = buildBreadcrumbs('/settings')
    expect(crumbs).toEqual([{ label: 'Settings', href: null }])
  })

  it('returns Help for /help', () => {
    const crumbs = buildBreadcrumbs('/help')
    expect(crumbs).toEqual([{ label: 'Help', href: null }])
  })

  it('returns Cases > Dashboard for /case/abc', () => {
    const crumbs = buildBreadcrumbs('/case/abc')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: null },
    ])
  })

  it('returns Cases > Dashboard > Motions for /case/abc/motions', () => {
    const crumbs = buildBreadcrumbs('/case/abc/motions')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Motions', href: null },
    ])
  })

  it('returns Cases > Dashboard > Evidence for /case/abc/evidence', () => {
    const crumbs = buildBreadcrumbs('/case/abc/evidence')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Evidence', href: null },
    ])
  })

  it('returns Cases > Dashboard > Step for /case/abc/step/xyz', () => {
    const crumbs = buildBreadcrumbs('/case/abc/step/xyz')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Step', href: null },
    ])
  })

  it('returns Cases > Dashboard > Motions > Detail for /case/abc/motions/motion_to_compel', () => {
    const crumbs = buildBreadcrumbs('/case/abc/motions/motion_to_compel')
    expect(crumbs).toEqual([
      { label: 'Cases', href: '/cases' },
      { label: 'Dashboard', href: '/case/abc' },
      { label: 'Motions', href: '/case/abc/motions' },
      { label: 'Detail', href: null },
    ])
  })
})
