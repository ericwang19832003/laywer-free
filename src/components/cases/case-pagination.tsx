'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface CasePaginationProps {
  showing: number
  total: number
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
}

export function CasePagination({
  showing,
  total,
  hasMore,
  loading,
  onLoadMore,
}: CasePaginationProps) {
  if (showing === 0) return null

  return (
    <div className="flex flex-col items-center gap-3 pt-6 pb-2">
      <p className="text-sm text-warm-muted">
        Showing {showing} of {total} case{total !== 1 ? 's' : ''}
      </p>
      {hasMore && (
        <Button
          variant="outline"
          onClick={onLoadMore}
          disabled={loading}
          className="min-w-[180px]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Show more cases'
          )}
        </Button>
      )}
    </div>
  )
}
