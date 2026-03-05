export interface AuthoritySummary {
  id: string
  pinned: boolean
  added_at: string
}

export function addAuthorityTag(tags: string[], nextTag: string): string[] {
  const normalized = nextTag.trim().toLowerCase()
  if (!normalized) return tags

  const set = new Set(tags.map((tag) => tag.trim().toLowerCase()))
  set.add(normalized)

  return Array.from(set)
}

export function removeAuthorityTag(tags: string[], tagToRemove: string): string[] {
  const normalized = tagToRemove.trim().toLowerCase()
  return tags.filter((tag) => tag.trim().toLowerCase() !== normalized)
}

export function splitPinnedAuthorities<T extends AuthoritySummary>(authorities: T[]) {
  const pinned = authorities.filter((a) => a.pinned)
  const regular = authorities.filter((a) => !a.pinned)

  return { pinned, regular }
}
