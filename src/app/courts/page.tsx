import { Suspense } from 'react'
import { CourtBrowser } from '@/components/courts/court-browser'
import { CourtSkeleton } from '@/components/courts/court-skeleton'

export const metadata = {
  title: 'Court Directory | Lawyer Free',
  description: 'Browse and search courts by state, county, and type',
}

export default function CourtsPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-warm-text">Court Directory</h1>
        <p className="text-warm-muted mt-1">
          Find the right court for your case in Texas, California, New York, Florida, or Pennsylvania
        </p>
      </div>

      <Suspense fallback={<CourtSkeleton />}>
        <CourtBrowser />
      </Suspense>
    </div>
  )
}
