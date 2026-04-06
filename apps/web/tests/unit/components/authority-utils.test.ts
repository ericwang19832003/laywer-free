import { describe, it, expect } from 'vitest'
import { addAuthorityTag, removeAuthorityTag, splitPinnedAuthorities } from '@/components/research/authority-utils'

describe('addAuthorityTag', () => {
  it('adds a new tag, trimmed and deduped', () => {
    const tags = addAuthorityTag(['service'], '  Service  ')
    expect(tags).toEqual(['service'])
  })

  it('adds new distinct tags', () => {
    const tags = addAuthorityTag(['service'], 'deadline')
    expect(tags).toEqual(['service', 'deadline'])
  })
})

describe('removeAuthorityTag', () => {
  it('removes the specified tag', () => {
    const tags = removeAuthorityTag(['service', 'deadline'], 'deadline')
    expect(tags).toEqual(['service'])
  })
})

describe('splitPinnedAuthorities', () => {
  it('separates pinned authorities', () => {
    const authorities = [
      { id: '1', pinned: true, added_at: '2026-03-01T00:00:00Z' },
      { id: '2', pinned: false, added_at: '2026-03-02T00:00:00Z' },
    ]

    const { pinned, regular } = splitPinnedAuthorities(authorities)

    expect(pinned.map((a) => a.id)).toEqual(['1'])
    expect(regular.map((a) => a.id)).toEqual(['2'])
  })
})
