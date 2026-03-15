'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Scale, Clock, CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface AttorneyReview {
  id: string
  status: string
  document_type: string
  review_comments: string | null
  created_at: string
}

interface AttorneyReviewCardProps {
  caseId: string
  documentType: string
  existingReviews?: AttorneyReview[]
}

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  pending: { label: 'Payment Pending', color: 'bg-warm-muted/10 text-warm-muted' },
  in_review: { label: 'Under Review', color: 'bg-calm-amber/10 text-calm-amber' },
  completed: { label: 'Review Complete', color: 'bg-calm-green/10 text-calm-green' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
}

export function AttorneyReviewCard({ caseId, documentType, existingReviews = [] }: AttorneyReviewCardProps) {
  const [requesting, setRequesting] = useState(false)

  const activeReview = existingReviews.find(r => r.status !== 'cancelled')

  async function handleRequest() {
    setRequesting(true)
    try {
      const res = await fetch(`/api/cases/${caseId}/attorney-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType }),
      })
      const data = await res.json()
      if (data.clientSecret) {
        // In a full implementation, this would open Stripe Elements
        // For MVP, redirect to a payment confirmation page
        alert('Attorney review requested! Payment processing will be integrated with Stripe Elements.')
      }
    } finally {
      setRequesting(false)
    }
  }

  if (activeReview) {
    const badge = STATUS_BADGES[activeReview.status] ?? STATUS_BADGES.pending
    return (
      <Card className="border-calm-indigo/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-warm-text flex items-center gap-2">
              <Scale className="h-4 w-4 text-calm-indigo" />
              Attorney Review
            </CardTitle>
            <Badge className={badge.color}>{badge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {activeReview.status === 'in_review' && (
            <div className="flex items-center gap-2 text-sm text-warm-muted">
              <Clock className="h-4 w-4" />
              <span>An attorney is reviewing your documents. You&apos;ll be notified when complete.</span>
            </div>
          )}
          {activeReview.status === 'completed' && activeReview.review_comments && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-calm-green">
                <CheckCircle className="h-4 w-4" />
                <span>Review complete</span>
              </div>
              <p className="text-sm text-warm-text bg-warm-bg p-3 rounded-lg">
                {activeReview.review_comments}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dashed border-calm-indigo/30">
      <CardContent className="pt-5 text-center space-y-3">
        <Scale className="h-8 w-8 text-calm-indigo mx-auto" />
        <div>
          <h3 className="font-semibold text-warm-text">Get Attorney Review</h3>
          <p className="text-sm text-warm-muted mt-1">
            Have a licensed attorney review your documents for accuracy and completeness.
          </p>
        </div>
        <div className="text-lg font-semibold text-calm-indigo">$49</div>
        <Button
          onClick={handleRequest}
          disabled={requesting}
          className="bg-calm-indigo hover:bg-calm-indigo/90"
        >
          {requesting ? 'Requesting...' : 'Request Review'}
        </Button>
        <p className="text-xs text-warm-muted">
          Typically completed within 2-3 business days
        </p>
      </CardContent>
    </Card>
  )
}
