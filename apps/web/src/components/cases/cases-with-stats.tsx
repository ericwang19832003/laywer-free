'use client'

import { useState, useCallback } from 'react'
import { StatsCards } from '@/components/cases/stats-cards'
import { PaginatedCaseList } from '@/components/cases/paginated-case-list'
import type { CaseCardData } from '@/components/cases/case-cards'

interface CasesWithStatsProps {
  activeCases: number
  tasksCompleted: number
  tasksTotal: number
  upcomingDeadlines: number
  averageHealth: number | null
  initialCases: CaseCardData[]
  initialNextCursor: string | null
  initialHasMore: boolean
  totalCount: number
}

export function CasesWithStats({
  activeCases: initialActiveCases,
  tasksCompleted,
  tasksTotal,
  upcomingDeadlines,
  averageHealth,
  initialCases,
  initialNextCursor,
  initialHasMore,
  totalCount: initialTotalCount,
}: CasesWithStatsProps) {
  const [activeCases, setActiveCases] = useState(initialActiveCases)
  const [totalCount, setTotalCount] = useState(initialTotalCount)

  const handleCasesDeleted = useCallback((count: number) => {
    setActiveCases(prev => Math.max(0, prev - count))
    setTotalCount(prev => Math.max(0, prev - count))
  }, [])

  return (
    <>
      <StatsCards
        activeCases={activeCases}
        tasksCompleted={tasksCompleted}
        tasksTotal={tasksTotal}
        upcomingDeadlines={upcomingDeadlines}
        averageHealth={averageHealth}
      />
      <PaginatedCaseList
        initialCases={initialCases}
        initialNextCursor={initialNextCursor}
        initialHasMore={initialHasMore}
        totalCount={totalCount}
        onCasesDeleted={handleCasesDeleted}
      />
    </>
  )
}
