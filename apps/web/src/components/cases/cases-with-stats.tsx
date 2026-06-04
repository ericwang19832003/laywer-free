'use client'

import { useState, useCallback } from 'react'
import { StatsCards } from '@/components/cases/stats-cards'
import { PaginatedCaseList } from '@/components/cases/paginated-case-list'
import { TodaysActionCard } from '@/components/cases/todays-action-card'
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
  tasksCompleted: initialTasksCompleted,
  tasksTotal: initialTasksTotal,
  upcomingDeadlines,
  averageHealth,
  initialCases,
  initialNextCursor,
  initialHasMore,
  totalCount: initialTotalCount,
}: CasesWithStatsProps) {
  const [activeCases, setActiveCases] = useState(initialActiveCases)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [tasksCompleted, setTasksCompleted] = useState(initialTasksCompleted)
  const [tasksTotal, setTasksTotal] = useState(initialTasksTotal)
  const [actionRefreshKey, setActionRefreshKey] = useState(0)

  const handleCasesDeleted = useCallback((count: number) => {
    setActiveCases(prev => {
      const next = Math.max(0, prev - count)
      if (next === 0) {
        setTasksCompleted(0)
        setTasksTotal(0)
      }
      return next
    })
    setTotalCount(prev => Math.max(0, prev - count))
    setActionRefreshKey(k => k + 1)
  }, [])

  return (
    <>
      <TodaysActionCard refreshKey={actionRefreshKey} />
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
