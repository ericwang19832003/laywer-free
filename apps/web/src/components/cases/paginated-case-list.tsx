'use client'

import { useState, useCallback } from 'react'
import { CaseCards } from '@/components/cases/case-cards'
import { CasePagination } from '@/components/cases/case-pagination'
import type { CaseCardData } from '@/components/cases/case-cards'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface PaginatedCaseListProps {
  initialCases: CaseCardData[]
  initialNextCursor: string | null
  initialHasMore: boolean
  totalCount: number
}

export function PaginatedCaseList({
  initialCases,
  initialNextCursor,
  initialHasMore,
  totalCount,
}: PaginatedCaseListProps) {
  const [cases, setCases] = useState<CaseCardData[]>(initialCases)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleCaseAction = useCallback(async (caseId: string, action: 'view' | 'delete' | 'archive') => {
    if (action === 'delete') {
      setPendingDeleteId(caseId)
    } else if (action === 'archive') {
      const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE' })
      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== caseId))
      }
    }
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!pendingDeleteId) return
    setDeleting(true)
    const res = await fetch(`/api/cases/${pendingDeleteId}`, { method: 'DELETE' })
    if (res.ok) {
      setCases(prev => prev.filter(c => c.id !== pendingDeleteId))
    }
    setDeleting(false)
    setPendingDeleteId(null)
  }, [pendingDeleteId])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cases?limit=12&cursor=${nextCursor}`)
      if (!res.ok) return
      const data = await res.json()
      const newCases: CaseCardData[] = (data.cases ?? []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        description: (c.description as string) || '',
        county: (c.county as string) || '',
        role: c.role as string,
        court_type: (c.court_type as string) || '',
        dispute_type: (c.dispute_type as string) || '',
        created_at: c.created_at as string,
        status: 'active' as const,
      }))
      setCases(prev => [...prev, ...newCases])
      setNextCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } finally {
      setLoading(false)
    }
  }, [nextCursor, loading])

  return (
    <>
      <div className="mt-6">
        <CaseCards cases={cases} onCaseAction={handleCaseAction} />
        <CasePagination
          showing={cases.length}
          total={totalCount}
          hasMore={hasMore}
          loading={loading}
          onLoadMore={loadMore}
        />
      </div>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => { if (!open) setPendingDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this case?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the case and remove it from your dashboard. Your data will be preserved but the case will no longer appear in your active cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete case'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
