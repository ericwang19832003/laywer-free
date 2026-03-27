'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import { AuthorityList } from '@/components/research/authority-list'
import { addAuthorityTag, removeAuthorityTag, splitPinnedAuthorities } from '@/components/research/authority-utils'

interface AuthorityFolder {
  id: string
  name: string
}

interface Authority {
  id: string
  cluster_id: number
  status: string
  pinned: boolean
  folder_id: string | null
  tags: string[] | null
  added_at: string
  cl_case_clusters: {
    case_name: string
    court_name: string | null
    date_filed: string | null
    citations: unknown
    snippet: string | null
  } | null
  authority_folders: AuthorityFolder | null
}

interface AuthorityWorkspaceProps {
  caseId: string
  initialAuthorities: Authority[]
  initialFolders: AuthorityFolder[]
}

export function AuthorityWorkspace({ caseId, initialAuthorities, initialFolders }: AuthorityWorkspaceProps) {
  const [authorities, setAuthorities] = useState(initialAuthorities)
  const [folders, setFolders] = useState(initialFolders)
  const [newFolderName, setNewFolderName] = useState('')
  const [filterFolderId, setFilterFolderId] = useState<string>('all')

  const { pinned, regular } = useMemo(
    () => splitPinnedAuthorities(authorities),
    [authorities]
  )

  const filteredRegular = useMemo(() => {
    if (filterFolderId === 'all') return regular
    if (filterFolderId === 'unassigned') return regular.filter((a) => !a.folder_id)
    return regular.filter((a) => a.folder_id === filterFolderId)
  }, [regular, filterFolderId])

  async function refreshAuthorities() {
    const res = await fetch(`/api/cases/${caseId}/research/authority`)
    if (!res.ok) return
    const data = await res.json()
    setAuthorities(data.authorities ?? [])
  }

  async function handleRemove(clusterId: number) {
    await fetch(`/api/cases/${caseId}/research/authority`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cluster_id: clusterId }),
    })
    setAuthorities((prev) => prev.filter((a) => a.cluster_id !== clusterId))
  }

  async function handleRetry(clusterId: number) {
    await fetch(`/api/cases/${caseId}/research/authority`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cluster_id: clusterId }),
    })
    await refreshAuthorities()
  }

  async function handleTogglePinned(authority: Authority) {
    const res = await fetch(`/api/cases/${caseId}/research/authority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cluster_id: authority.cluster_id, pinned: !authority.pinned }),
    })
    if (res.ok) {
      const data = await res.json()
      const updated = normalizeAuthority(data.authority)
      setAuthorities((prev) => prev.map((a) => a.cluster_id === authority.cluster_id ? updated : a))
    }
  }

  async function handleFolderChange(authority: Authority, folderId: string | null) {
    const res = await fetch(`/api/cases/${caseId}/research/authority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cluster_id: authority.cluster_id, folder_id: folderId }),
    })
    if (res.ok) {
      const data = await res.json()
      const updated = normalizeAuthority(data.authority)
      setAuthorities((prev) => prev.map((a) => a.cluster_id === authority.cluster_id ? updated : a))
    }
  }

  async function handleAddTag(authority: Authority, tag: string) {
    const nextTags = addAuthorityTag(authority.tags ?? [], tag)
    const res = await fetch(`/api/cases/${caseId}/research/authority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cluster_id: authority.cluster_id, tags: nextTags }),
    })
    if (res.ok) {
      const data = await res.json()
      const updated = normalizeAuthority(data.authority)
      setAuthorities((prev) => prev.map((a) => a.cluster_id === authority.cluster_id ? updated : a))
    }
  }

  async function handleRemoveTag(authority: Authority, tag: string) {
    const nextTags = removeAuthorityTag(authority.tags ?? [], tag)
    const res = await fetch(`/api/cases/${caseId}/research/authority`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cluster_id: authority.cluster_id, tags: nextTags }),
    })
    if (res.ok) {
      const data = await res.json()
      const updated = normalizeAuthority(data.authority)
      setAuthorities((prev) => prev.map((a) => a.cluster_id === authority.cluster_id ? updated : a))
    }
  }

  async function handleCreateFolder() {
    if (newFolderName.trim().length < 2) return
    const res = await fetch(`/api/cases/${caseId}/research/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setFolders((prev) => [...prev, data.folder])
      setNewFolderName('')
    }
  }

  if (authorities.length === 0) {
    return (
      <div className="rounded-xl border border-warm-border bg-warm-bg/60 p-5">
        <EmptyState
          illustration="search"
          title="No authorities saved yet"
          description="Use Search to add your first cases and build your legal research library."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-warm-border bg-warm-bg/60 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-warm-muted">
            <span>Filter</span>
            <select
              className="rounded-md border border-warm-border bg-white px-2 py-1 text-xs text-warm-text"
              value={filterFolderId}
              onChange={(event) => setFilterFolderId(event.target.value)}
            >
              <option value="all">All folders</option>
              <option value="unassigned">Unassigned</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="New folder name"
              className="h-8 text-xs"
            />
            <Button size="sm" onClick={handleCreateFolder}>Create folder</Button>
          </div>
        </div>
      </div>

      {pinned.length > 0 && (
        <AuthorityList
          authorities={pinned}
          folders={folders}
          onRemove={handleRemove}
          onRetry={handleRetry}
          onTogglePinned={handleTogglePinned}
          onFolderChange={handleFolderChange}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          title="Pinned Authorities"
        />
      )}

      <AuthorityList
        authorities={filteredRegular}
        folders={folders}
        onRemove={handleRemove}
        onRetry={handleRetry}
        onTogglePinned={handleTogglePinned}
        onFolderChange={handleFolderChange}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        title="All Authorities"
      />
    </div>
  )
}

type AuthorityInput = Authority & { authority_folders: AuthorityFolder | AuthorityFolder[] | null }

function normalizeAuthority(raw: AuthorityInput | null): Authority {
  if (!raw) throw new Error('Authority missing')

  const folder = Array.isArray(raw.authority_folders)
    ? raw.authority_folders[0] ?? null
    : raw.authority_folders

  return {
    ...raw,
    authority_folders: folder,
    tags: raw.tags ?? [],
  }
}
