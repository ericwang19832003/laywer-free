'use client'

import { useState, useCallback } from 'react'
import { CaseCards } from '@/components/cases/case-cards'
import { CasePagination } from '@/components/cases/case-pagination'
import type { CaseCardData } from '@/components/cases/case-cards'

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
    <div className="mt-6">
      <CaseCards cases={cases} />
      <CasePagination
        showing={cases.length}
        total={totalCount}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={loadMore}
      />
    </div>
  )
}
